import { parse } from 'csv-parse';
import { Transform } from 'stream';

// Types
export interface FeedItem {
  id: string;
  title?: string;
  description?: string;
  size?: string;
  color?: string;
  [key: string]: string | undefined;
}

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


 
/********************************************* */

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




  titleDuplicateWords: (item: FeedItem): ErrorResult[] => {
    const errors: ErrorResult[] = [];
    if (item.title) {
      const words = item.title.toLowerCase().split(/\s+/).filter(word => /^[a-zA-Z]+$/.test(word));
      const duplicates = words.filter((word, index) => words.indexOf(word) !== index);
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


  




  titleColorCheck: (item: FeedItem): ErrorResult[] => {
    const errors: ErrorResult[] = [];
    if (item.color && item.title) {
      if (!item.title.toLowerCase().includes(item.color.toLowerCase())) {
        errors.push({
          id: item.id || 'UNKNOWN',
          errorType: 'Color Mismatch',
          details: 'Title does not contain color when color is set',
          affectedField: 'title',
          value: item.title
        });
      }
    }
    return errors;
  }
};

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