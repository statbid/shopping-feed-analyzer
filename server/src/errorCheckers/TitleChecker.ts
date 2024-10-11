import { FeedItem, ErrorResult } from '../types';
import { sizeWords, ignoreWords, specialCharsRegex,
     badAbbreviationsRegex, repeatedWhitespaceRegex, repeatedDashRegex, 
     repeatedCommaRegex, punctuationStartEndRegex, htmlTagRegex, 
     htmlEntityRegex, 
     promotionalWords, 
     missingSpaceRegex, 
     nonBreakingSpaceRegex 
 } from '../utils/constants';

 

export function checkTitleSize(item: FeedItem): ErrorResult | null {
  const titleLower = item.title?.toLowerCase() || '';
  const titleWords = titleLower.split(/\s+/);
  
  if (item.size && !sizeWords.has(item.size.toLowerCase()) && !titleWords.includes(item.size.toLowerCase())) {
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Size Mismatch',
      details: `Title does not contain size (${item.size}) when size is set`,
      affectedField: 'title',
      value: item.title || ''
    };
  }
  return null;
}

export function checkTitleColor(item: FeedItem): ErrorResult | null {
  const titleLower = item.title?.toLowerCase() || '';
  
  if (item.color && !titleLower.includes(item.color.toLowerCase())) {
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Color Mismatch',
      details: `Title does not contain color "${item.color}" when color is set`,
      affectedField: 'title',
      value: item.title || ''
    };
  }
  return null;
}

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
      const lowercaseTitle = item.title.toLowerCase();
      const foundWords = promotionalWords.filter(word => lowercaseTitle.includes(word));
      if (foundWords.length > 0) {
        return {
          id: item.id || 'UNKNOWN',
          errorType: 'Promotional Words in Title',
          details: `Title contains promotional words: ${foundWords.join(', ')}`,
          affectedField: 'title',
          value: item.title
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
  