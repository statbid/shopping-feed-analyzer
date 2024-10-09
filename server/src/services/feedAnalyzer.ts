import { parse } from 'csv-parse';
import { Transform } from 'stream';

const SpellChecker = require('spellchecker') as any;

// Types
export interface FeedItem {
  id: string;
  title?: string;
  brand?: string;
  description?: string;
  size?: string;
  color?: string;
  google_product_category?: string;
  product_type?: string;
  gender?: string;
  age_group?: string;
  [key: string]: string | undefined;
}

type MisspelledWord = {
  word: string;
  corrections: string[];
};

export interface ErrorResult {
  id: string;
  errorType: string;
  details: string;
  affectedField: string;
  value: string;
}

export interface AnalysisResult {
  totalProducts: number;
  errorCounts: { [key: string]: number };
  errors: ErrorResult[];
}



// Error checking functions

/******************************** */

const errorCheckers = {


/*****************Missing Size in Title************ */


  titleSizeCheck: (item: FeedItem): ErrorResult[] => {
    const errors: ErrorResult[] = [];
    const sizeWords = ['xs', 's', 'm', 'l', 'xl', 'small', 'medium', 'large'];
    if (item.size && item.title) {
      const titleWords = item.title.toLowerCase().split(/\s+/);
      const itemSizeLower = item.size.toLowerCase();
      
      // Check if the exact size or any size word is in the title as a whole word
      const hasSizeWord = titleWords.includes(itemSizeLower) || 
                          sizeWords.some(size => titleWords.includes(size));
      
      console.log(`Checking title: "${item.title}" for size: "${item.size}"`);
      console.log(`Title words: ${titleWords.join(', ')}`);
      console.log(`Item size (lowercase): ${itemSizeLower}`);
      console.log(`Title contains size word: ${hasSizeWord}`);

      if (!hasSizeWord) {
        errors.push({
          id: item.id || 'UNKNOWN',
          errorType: 'Size Mismatch',
          details: `Title does not contain size (${item.size}) when size is set`,
          affectedField: 'title',
          value: item.title
        });
      }
    }
    return errors;
  },


 
/********************Missing Spaces after commas************************* */

  descriptionMissingSpaces: (item: FeedItem): ErrorResult[] => {
    const errors: ErrorResult[] = [];
    if (item.description) {
      // Updated regex to match commas without space after, but not in numbers
      const missingSpaceRegex = /\b\w+,(?=[a-zA-Z])/g;
      const matches = [...item.description.matchAll(missingSpaceRegex)];
      if (matches.length > 0) {
        const contextExtract = (index: number) => {
          const words = item.description!.split(/\s+/);
          const wordIndex = item.description!.slice(0, index).split(/\s+/).length - 1;
          const start = Math.max(0, wordIndex - 2);
          const end = Math.min(words.length, wordIndex + 5);
          return words.slice(start, end).join(' ').replace(/\.$/, ''); // Remove trailing period
        };

        const cases = matches.map((match, index) => 
          matches.length > 1 ? `Case ${index + 1}: "${contextExtract(match.index!)}"` : `"${contextExtract(match.index!)}"`
        );

        errors.push({
          id: item.id || 'UNKNOWN',
          errorType: 'Missing Spaces After Commas',
          details: `Found ${matches.length} comma(s) followed by non-space characters`,
          affectedField: 'description',
          value: cases.join(' ') // Join with space for analysis results
        });
      }
    }
    return errors;
  },



  

/**********Color check************ */

titleColorCheck: (item: FeedItem): ErrorResult[] => {
  const errors: ErrorResult[] = [];
  if (item.color && item.title) {
    if (!item.title.toLowerCase().includes(item.color.toLowerCase())) {
      errors.push({
        id: item.id || 'UNKNOWN',
        errorType: 'Color Mismatch',
        details: `Title does not contain color "${item.color}" when color is set`,
        affectedField: 'title',
        value: item.title
      });
    }
  }
  return errors;
},



/*************Duplicate Words*************** */


titleDuplicateWords: (item: FeedItem): ErrorResult[] => {
  const errors: ErrorResult[] = [];
  if (item.title) {
    // Split the title into words, converting to lowercase
    const words = item.title.toLowerCase().split(/\s+/);
    
    // Create a set of words to ignore (numbers and common measurement units)
    const ignoreWords = new Set(['x', 'by', 'in', 'inch', 'inches', 'ft', 'feet', 'cm', 'm', 'mm']);
    
    // Filter out numbers, common measurement units, and words shorter than 3 characters
    const filteredWords = words.filter(word => 
      !ignoreWords.has(word) && 
      !/^\d+('|ft|in|cm|m|mm)?$/.test(word) &&
      word.length > 2
    );

    // Find duplicates
    const duplicates = filteredWords.filter((word, index) => filteredWords.indexOf(word) !== index);
    
    if (duplicates.length > 0) {
      errors.push({
        id: item.id || 'UNKNOWN',
        errorType: 'Duplicate Words in Title',
        details: `Title contains duplicate words: ${[...new Set(duplicates)].join(', ')}`,
        affectedField: 'title',
        value: item.title
      });
    }
  }
  return errors;
},



googleProductCategorySpecificity: (item: FeedItem): ErrorResult[] => {
  const errors: ErrorResult[] = [];
  if (item.google_product_category) {
    const categoryLevels = item.google_product_category.split('>').filter(Boolean).length;
    if (categoryLevels < 3) {
      errors.push({
        id: item.id || 'UNKNOWN',
        errorType: 'Unspecific Google Product Category',
        details: `Google Product Category isn't specific enough (less than 3 levels)`,
        affectedField: 'google_product_category',
        value: item.google_product_category
      });
    }
  }
  return errors;
},

productTypeCheck: (item: FeedItem): ErrorResult[] => {
  const errors: ErrorResult[] = [];
  if (!item.product_type || item.product_type.trim() === '') {
    errors.push({
      id: item.id || 'UNKNOWN',
      errorType: 'Missing Product Type',
      details: 'Product Type is not set',
      affectedField: 'product_type',
      value: item.product_type || ''
    });
  }
  return errors;
},

googleProductCategoryCheck: (item: FeedItem): ErrorResult[] => {
  const errors: ErrorResult[] = [];
  if (!item.google_product_category || item.google_product_category.trim() === '') {
    errors.push({
      id: item.id || 'UNKNOWN',
      errorType: 'Missing Google Product Category',
      details: 'Google Product Category is not set',
      affectedField: 'google_product_category',
      value: item.google_product_category || ''
    });
  }
  return errors;
},

apparelAttributesCheck: (item: FeedItem): ErrorResult[] => {
  const errors: ErrorResult[] = [];
  if (item.google_product_category && item.google_product_category.toLowerCase().includes('apparel')) {
    const missingAttributes = [];
    if (!item.color) missingAttributes.push('color');
    if (!item.size) missingAttributes.push('size');
    if (!item.gender) missingAttributes.push('gender');
    if (!item.age_group) missingAttributes.push('age_group');

    if (missingAttributes.length > 0) {
      errors.push({
        id: item.id || 'UNKNOWN',
        errorType: 'Missing Apparel Attributes',
        details: `Apparel item is missing: ${missingAttributes.join(', ')}`,
        affectedField: 'google_product_category',
        value: item.google_product_category
      });
    }
  }
  return errors;
},

 /*******Repeated Dashes in Description*********/
 repeatedDashesCheck: (item: FeedItem): ErrorResult[] => {
  const errors: ErrorResult[] = [];
  if (item.description) {
    const repeatedDashesRegex = /--|- -/g;
    const matches = [...item.description.matchAll(repeatedDashesRegex)];
    if (matches.length > 0) {
      const contextExtract = (index: number) => {
        const words = item.description!.split(/\s+/);
        const wordIndex = item.description!.slice(0, index).split(/\s+/).length - 1;
        const start = Math.max(0, wordIndex - 3);
        const end = Math.min(words.length, wordIndex + 4);
        return words.slice(start, end).join(' ').replace(/\.$/, '');
      };

      const cases = matches.map((match, index) => 
        matches.length > 1 ? `Case ${index + 1}: "${contextExtract(match.index!)}"` : `"${contextExtract(match.index!)}"`
      );

      errors.push({
        id: item.id || 'UNKNOWN',
        errorType: 'Repeated Dashes in Description',
        details: `Found ${matches.length} instance(s) of repeated dashes`,
        affectedField: 'description',
        value: cases.join(' ')
      });
    }
  }
  return errors;
},



 /*******Product Title Spell Check*********/
 titleSpellCheck: (item: FeedItem): ErrorResult[] => {
  const errors: ErrorResult[] = [];
  if (item.title && item.brand) {
    const words = item.title.split(/\s+/);
    const brandWords = item.brand.split(/\s+/);
    const misspelledWordsWithCorrections = words
      .map(word => {
        if (SpellChecker.isMisspelled(word) && !brandWords.includes(word)) {
          const corrections = SpellChecker.getCorrectionsForMisspelling(word);
          if (corrections.length > 0) {
            return { word, corrections: corrections.slice(0, 3) }; // Limit to top 3 suggestions
          }
        }
        return null;
      })
      .filter((entry): entry is MisspelledWord => entry !== null);
    
    if (misspelledWordsWithCorrections.length > 0) {
      const details = misspelledWordsWithCorrections
        .map(({ word, corrections }) => `"${word}" (suggestions: ${corrections.join(', ')})`)
        .join('; ');

      errors.push({
        id: item.id || 'UNKNOWN',
        errorType: 'Spelling Mistakes in Title',
        details: `Found misspelled word(s) with suggestions: ${details}. Note: Words matching the brand "${item.brand}" are not considered misspelled.`,
        affectedField: 'title',
        value: item.title
      });
    }
  }
  return errors;
},





/*******Product Title Abbreviations*********/
  titleAbbreviationsCheck: (item: FeedItem): ErrorResult[] => {
    const errors: ErrorResult[] = [];
    if (item.title) {
      const badAbbreviations = [
        'pck', 'pkg', 'qty', 'qt', 'pc', 'pcs', 'ea', 
        '(?<=\\s|^)in\\.(?=\\s|$)', // Updated regex for "in."
        'ft'
      ];
      const regex = new RegExp(`\\b(${badAbbreviations.join('|')})\\b`, 'gi');
      const matches = item.title.match(regex);
      
      if (matches) {
        const uniqueMatches = [...new Set(matches.map(m => m.toLowerCase()))];
        errors.push({
          id: item.id || 'UNKNOWN',
          errorType: 'Bad Abbreviations in Title',
          details: `Found bad abbreviation(s): ${uniqueMatches.join(', ')}`,
          affectedField: 'title',
          value: item.title
        });
      }
    }
    return errors;
  },




 /*******Product Title Special Characters*********/
 titleSpecialCharactersCheck: (item: FeedItem): ErrorResult[] => {
  const errors: ErrorResult[] = [];
  if (item.title) {
    const specialChars = /[^a-zA-Z0-9\s.,;:()\-]/g;
    const matches = item.title.match(specialChars);
    if (matches) {
      errors.push({
        id: item.id || 'UNKNOWN',
        errorType: 'Special Characters in Title',
        details: `Found special character(s): ${matches.join(', ')}`,
        affectedField: 'title',
        value: item.title
      });
    }
  }
  return errors;
},



  /*******Product Title Brand Check*********/
  titleBrandCheck: (item: FeedItem): ErrorResult[] => {
    const errors: ErrorResult[] = [];
    if (item.title && item.brand) {
      if (!item.title.toLowerCase().includes(item.brand.toLowerCase())) {
        errors.push({
          id: item.id || 'UNKNOWN',
          errorType: 'Missing Brand in Title',
          details: `Missing brand: ${item.brand}`,
          affectedField: 'title',
          value: item.title
        });
      }
    }
    return errors;
  },



};







/************************************************** */
// Analyzer class
export class FeedAnalyzer {
  private result: AnalysisResult = {
    totalProducts: 0,
    errorCounts: {},
    errors: []
  };

   // Expose errorCheckers as a static property
   static errorCheckers = errorCheckers;

   analyzeStream(fileStream: NodeJS.ReadableStream): Promise<AnalysisResult> {
     return new Promise((resolve, reject) => {
       const parser = parse({
         columns: true,
         skip_empty_lines: true,
         delimiter: '\t',
         relax_column_count: true,
         trim: true,
       });
 
       const transformer = new Transform({
         objectMode: true,
         transform: (item: FeedItem, _, callback) => {
           this.result.totalProducts++;
           
           // Run all error checkers
           Object.values(errorCheckers).forEach(checker => {
             const errors = checker(item);
             this.result.errors.push(...errors);
             
             errors.forEach(error => {
               this.result.errorCounts[error.errorType] =
                 (this.result.errorCounts[error.errorType] || 0) + 1;
             });
           });
           
           callback();
         }
       });
 
       fileStream
         .pipe(parser)
         .pipe(transformer)
         .on('finish', () => resolve(this.result))
         .on('error', (err) => {
           console.error('Error parsing file:', err);
           reject(new Error('Error parsing file. Please ensure it is a valid TSV file.'));
         });
     });
   }
 }