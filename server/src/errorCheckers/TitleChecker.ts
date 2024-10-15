import { FeedItem, ErrorResult } from '../types';
import { sizeWords, ignoreWords, specialCharsRegex,
     badAbbreviationsRegex, repeatedWhitespaceRegex, repeatedDashRegex, 
     repeatedCommaRegex, punctuationStartEndRegex, htmlTagRegex, 
     htmlEntityRegex, 
     promotionalWords, 
     missingSpaceRegex, 
     nonBreakingSpaceRegex,
     sizeSynonyms,
     escapeRegExp, trailingPeriodRegex, sizeTokenSplitRegex,
     numberOnlyRegex, unitMatchRegex, tokenBoundaryRegex,
     sizeWordBoundaryRegex, 
     inchMatch
 } from '../utils/constants';



 export function checkTitleSize(item: FeedItem): ErrorResult | null {
  // Early return if size or title is not set
  if (!item.size || !item.title) {
    return null;
  }

  // Convert the title to lowercase for case-insensitive comparison
  const titleLower = item.title.toLowerCase();

  // Normalize the size string by removing any trailing period
  const normalizedSize = item.size.toLowerCase().replace(trailingPeriodRegex, '');

  // Split the normalized size into tokens for individual checking
  const sizeTokens = normalizedSize.split(sizeTokenSplitRegex);

  // Flag to determine if the size is found in the title
  const sizeInTitle = sizeTokens.some(token => {
    // Escape special characters in the token for regex patterns
    const escapedToken = escapeRegExp(token);

    // Check for exact match of the token in the title with word boundaries
    const tokenRegex = tokenBoundaryRegex(escapedToken);
    if (tokenRegex.test(titleLower)) {
      return true;
    }

    // Match tokens that include units (e.g., 'in', 'oz', 'cm') and handle variations
    const unitMatch = token.match(unitMatchRegex);
    if (unitMatch) {
      const numberPart = unitMatch[1]; // Numeric part of the token
      let unitPart = unitMatch[4];     // Unit part of the token

      // Remove any trailing period from the unit part
      unitPart = unitPart.replace(trailingPeriodRegex, '');

      // Create variations of the unit (with and without trailing period)
      const unitVariations = [unitPart, `${unitPart}.`];

      // Construct possible token variations
      const tokenVariations = unitVariations.map(unit => `${numberPart}${unit}`);

      // Escape each variation for regex and compile into a single regex pattern
      const escapedVariations = tokenVariations.map(escapeRegExp).join('|');
      const unitRegex = new RegExp(`(^|\\s)(${escapedVariations})(\\s|$)`, 'i');

      // Check if any of the variations exist in the title
      if (unitRegex.test(titleLower)) {
        return true;
      }
    }

    // Check if the token is a number only and present in the title
    if (numberOnlyRegex.test(token)) {
      const numberRegex = tokenBoundaryRegex(escapedToken);
      if (numberRegex.test(titleLower)) {
        return true;
      }
    }

    // Check for single-letter sizes and size words (e.g., 'S', 'M', 'L', 'small', 'medium', 'large')
    if (sizeWords.has(token)) {
      const sizeWordRegex = sizeWordBoundaryRegex(escapedToken);
      if (sizeWordRegex.test(titleLower)) {
        return true;
      }
    }

    // Check for size synonyms (e.g., 'XL' and 'extra large')
    if (sizeSynonyms[token]) {
      return sizeSynonyms[token].some(synonym => {
        const synonymRegex = sizeWordBoundaryRegex(escapeRegExp(synonym));
        return synonymRegex.test(titleLower);
      });
    }

    // If none of the checks pass, the size token is not found in the title
    return false;
  });

  // If size is not found in the title, return an error result
  if (!sizeInTitle) {
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Size Mismatch',
      details: `Title does not contain size (${item.size}) when size is set`,
      affectedField: 'title',
      value: item.title,
    };
  }

  // All checks passed, return null indicating no error
  return null;
}


/**********************Title doesn't contain color when color is set************************** */


export function checkTitleColor(item: FeedItem): ErrorResult | null {
  const titleLower = item.title?.toLowerCase() || '';
  
  if (item.color) {
    const colorLower = item.color.toLowerCase();
    const colorComponents = colorLower.split(/[\s\/]+/);

    // Check if all color components are present in the title
    const allColorsInTitle = colorComponents.every(colorComponent => 
      titleLower.includes(colorComponent)
    );

    if (!allColorsInTitle) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Color Mismatch',
        details: `Title does not contain color "${item.color}" when color is set`,
        affectedField: 'title',
        value: item.title || ''
      };
    }
  }
  
  return null;
}



/**********Title contains duplicate words like Nike Air Jordan Jordan Shoes************************** */

export function checkTitleDuplicateWords(item: FeedItem): ErrorResult | null {
  const titleLower = item.title?.toLowerCase() || '';
  const titleWords = titleLower.split(/\s+/);
  
  const filteredWords = titleWords.filter(word => 
    !ignoreWords.has(word) && 
    !/^\d+('|ft|in|cm|m|mm)?$/.test(word) &&
    word.length > 2
  );
  const duplicates = filteredWords.filter((word, index) => filteredWords.indexOf(word) !== index);
  
  if (duplicates.length > 0) {
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Duplicate Words in Title',
      details: `Title contains duplicate words: ${[...new Set(duplicates)].join(', ')}`,
      affectedField: 'title',
      value: item.title || ''
    };
  }
  return null;
}





export function checkTitleSpecialCharacters(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const specialCharsMatches = item.title.match(specialCharsRegex);
    if (specialCharsMatches) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Special Characters in Title',
        details: `Found special character(s): ${specialCharsMatches.join(', ')}`,
        affectedField: 'title',
        value: item.title
      };
    }
  }
  return null;
}

export function checkTitleBadAbbreviations(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const badAbbreviationsMatches = item.title.match(badAbbreviationsRegex);
    if (badAbbreviationsMatches) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Bad Abbreviations in Title',
        details: `Found bad abbreviation(s): ${[...new Set(badAbbreviationsMatches.map(m => m.toLowerCase()))].join(', ')}`,
        affectedField: 'title',
        value: item.title
      };
    }
  }
  return null;
}

export function checkTitleBrand(item: FeedItem): ErrorResult | null {
  const titleLower = item.title?.toLowerCase() || '';
  
  if (item.brand && !titleLower.includes(item.brand.toLowerCase())) {
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Missing Brand in Title',
      details: `Missing brand: ${item.brand}`,
      affectedField: 'title',
      value: item.title || ''
    };
  }
  return null;
}




export function checkTitleMaterial(item: FeedItem): ErrorResult | null {
    const titleLower = item.title?.toLowerCase() || '';
    
    if (item.material && !titleLower.includes(item.material.toLowerCase())) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Missing Material in Title',
        details: `Missing material: ${item.material}`,
        affectedField: 'title',
        value: item.title || ''
      };
    }
    return null;
  }
  
  export function checkTitleWhitespace(item: FeedItem): ErrorResult | null {
    if (item.title && (item.title.startsWith(' ') || item.title.endsWith(' '))) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Whitespace at Title Start/End',
        details: 'Title contains whitespace at start or end',
        affectedField: 'title',
        value: item.title
      };
    }
    return null;
  }
  
  export function checkTitleRepeatedWhitespace(item: FeedItem): ErrorResult | null {
    if (item.title && repeatedWhitespaceRegex.test(item.title)) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Repeated Whitespace in Title',
        details: 'Title contains repeated whitespace',
        affectedField: 'title',
        value: item.title
      };
    }
    return null;
  }
  
  export function checkTitleRepeatedDashes(item: FeedItem): ErrorResult | null {
    if (item.title && repeatedDashRegex.test(item.title)) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Repeated Dashes in Title',
        details: 'Title contains repeated dashes',
        affectedField: 'title',
        value: item.title
      };
    }
    return null;
  }
  
  export function checkTitleRepeatedCommas(item: FeedItem): ErrorResult | null {
    if (item.title && repeatedCommaRegex.test(item.title)) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Repeated Commas in Title',
        details: 'Title contains repeated commas',
        affectedField: 'title',
        value: item.title
      };
    }
    return null;
  }
  
  export function checkTitlePunctuation(item: FeedItem): ErrorResult | null {
    if (item.title && punctuationStartEndRegex.test(item.title)) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Punctuation at Title Start/End',
        details: 'Title contains punctuation at start or end',
        affectedField: 'title',
        value: item.title
      };
    }
    return null;
  }

  
export function checkTitleHtml(item: FeedItem): ErrorResult | null {
    if (item.title && htmlTagRegex.test(item.title)) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'HTML in Title',
        details: 'Title contains HTML tags',
        affectedField: 'title',
        value: item.title
      };
    }
    return null;
  }
  
  export function checkTitleHtmlEntities(item: FeedItem): ErrorResult | null {
    if (item.title && htmlEntityRegex.test(item.title)) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'HTML Entities in Title',
        details: 'Title contains HTML entities',
        affectedField: 'title',
        value: item.title
      };
    }
    return null;
  }
  
  export function checkTitlePromotionalWords(item: FeedItem): ErrorResult | null {
    if (item.title) {
      const foundWords = promotionalWords.filter(word => {
     
        const regex = new RegExp(`\\b${word}\\b`, 'i');
        return regex.test(item.title!);
      });
  
      if (foundWords.length > 0) {
        const examples = foundWords.slice(0, 3).map(word => {
          const regex = new RegExp(`\\b${word}\\b`, 'gi');
          const match = regex.exec(item.title!);
          if (match) {
            const startIndex = Math.max(0, match.index - 20);
            const endIndex = Math.min(item.title!.length, match.index + match[0].length + 20);
            const context = item.title!.slice(startIndex, endIndex);
            return `"${context}" (found: "${match[0]}")`;
          }
          return '';
        }).filter(Boolean);
  
        return {
          id: item.id || 'UNKNOWN',
          errorType: 'Promotional Words in Title',
          details: `Found ${foundWords.length} promotional word(s): ${foundWords.join(', ')}`,
          affectedField: 'title',
          value: examples[0] || item.title
        };
      }
    }
    return null;
  }
  
  /***************TODO*************** */
  export function checkTitleMissingSpaces(item: FeedItem): ErrorResult | null {
    if (item.title && missingSpaceRegex.test(item.title)) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Missing Spaces in Title',
        details: 'Title contains words without spaces after commas',
        affectedField: 'title',
        value: item.title
      };
    }
    return null;
  }
  
  export function checkTitleNonBreakingSpaces(item: FeedItem): ErrorResult | null {
    if (item.title && nonBreakingSpaceRegex.test(item.title)) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Non-Breaking Spaces in Title',
        details: 'Title contains non-breaking spaces',
        affectedField: 'title',
        value: item.title
      };
    }
    return null;
  }


  export const TitleChecker = [
    checkTitleSize,
    checkTitleColor,
    checkTitleDuplicateWords,
    checkTitleSpecialCharacters,
    checkTitleBadAbbreviations,
    checkTitleBrand,
    checkTitleMaterial,
    checkTitleWhitespace,
    checkTitleRepeatedWhitespace,
    checkTitleRepeatedDashes,
    checkTitleRepeatedCommas,
    checkTitlePunctuation,
    checkTitleHtml,
    checkTitleHtmlEntities,
    checkTitlePromotionalWords,
    checkTitleMissingSpaces,
    checkTitleNonBreakingSpaces
  ];
  