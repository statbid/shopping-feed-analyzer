import { FeedItem, ErrorResult } from '../types';
import { sizeWords, ignoreWords, specialCharsRegex,
     badAbbreviationsRegex, repeatedWhitespaceRegex, repeatedDashRegex, 
     repeatedCommaRegex, punctuationStartEndRegex, htmlTagRegex, 
     htmlEntityRegex, 
     promotionalWords, 
   
     nonBreakingSpaceRegex,
     sizeSynonyms,
     escapeRegExp, trailingPeriodRegex, sizeTokenSplitRegex,
     numberOnlyRegex, unitMatchRegex, tokenBoundaryRegex,
     sizeWordBoundaryRegex,missingSpaceRegex , 
     inchMatch
 } from '../utils/constants';

 import { spellChecker } from './SpellChecker'; 
 import { wordSplitter } from './MissingSpaceChecker';


 const abbreviationMappings: { [key: string]: string } = {
  'pck': 'pack',
  'pkg': 'package',
  'qty': 'quantity',
  'qt': 'quart',
  'pc': 'piece',
  'pcs': 'pieces',
  'ea': 'each',
  'in.': 'inch',
  'ft': 'feet'
};
 
function truncateContext(context: string, match: string): string {
  const maxLength = 40; 
  const matchIndex = context.indexOf(match);

  const start = Math.max(0, matchIndex - Math.floor((maxLength - match.length) / 2));
  const end = Math.min(context.length, matchIndex + match.length + Math.floor((maxLength - match.length) / 2));

  let truncatedContext = context.substring(start, end).trim();

  if (start > 0) {
    truncatedContext = '.' + truncatedContext;
  }
  if (end < context.length) {
    truncatedContext += '.';
  }

  return truncatedContext;
}


function getContext(description: string, matchIndex: number, matchLength: number): string {
  const contextRadius = 15; // Number of characters to show around the match
  const start = Math.max(0, matchIndex - contextRadius);
  const end = Math.min(description.length, matchIndex + matchLength + contextRadius);
  return description.substring(start, end);
}

// Helper function to safely get matches
function getMatches(regex: RegExp, text: string): RegExpExecArray[] {
  const matches: RegExpExecArray[] = [];
  let match;
  while ((match = regex.exec(text)) !== null) {
    matches.push(match);
  }
  return matches;
}


 export function checkTitleSize(item: FeedItem): ErrorResult | null {
  
  if (!item.size || !item.title) {
    return null;
  }
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
      errorType: 'Title Doesn\'t Contain Size When Size is Set ',
      details: `Title does not contain size (${item.size}) when size is set`,
      affectedField: 'title',
      value: item.title,
    };
  }

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
        errorType: 'Title Doesn\'t Contain Color When Color Is Set',
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
      errorType: 'Title Contains Duplicate Words',
      details: `Title contains duplicate words: ${[...new Set(duplicates)].join(', ')}`,
      affectedField: 'title',
      value: item.title || ''
    };
  }
  return null;
}



/**********Product Title contains bad characters like: ^, $, @, !, "", ''************ */

export function checkTitleSpecialCharacters(item: FeedItem): ErrorResult | null {
  if (item.title) {
    // Make regex global to find all instances
    const globalSpecialCharsRegex = new RegExp(specialCharsRegex.source, 'g');
    const matches = getMatches(globalSpecialCharsRegex, item.title);

    if (matches.length > 0) {
      const foundChars = [...new Set(matches.map(m => m[0]))];
      
      const examples = matches.map((match, index) => {
        const context = getContext(item.title!, match.index!, match[0].length);
        const truncatedContext = truncateContext(context, match[0]);

        return matches.length > 1 
          ? `(case ${index + 1}) "${truncatedContext}"` 
          : `"${truncatedContext}"`;
      });

      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains Special Characters',
        details: `Found ${matches.length} instance(s) of special characters: ${foundChars.join(', ')}`,
        affectedField: 'title',
        value: examples.join('; ')
      };
    }
  }
  return null;
}


/*************Product Title contains abbreviations like pck instead of pack***************************** */
export function checkTitleBadAbbreviations(item: FeedItem): ErrorResult | null {
  if (item.title) {
    // Using lookbehind and lookahead to ensure we match whole words
    const badAbbreviationsRegex = /\b(pck|pkg|qty|qt|pc|pcs|ea|(?<=\s|^)in\.(?=\s|$)|ft)\b/gi;
    const matches = getMatches(badAbbreviationsRegex, item.title);

    if (matches.length > 0) {
      const foundAbbreviations = [...new Set(matches.map(m => m[0].toLowerCase()))];
      
      const examples = matches.map((match, index) => {
        const abbr = match[0].toLowerCase();
        const fullForm = abbreviationMappings[abbr];
        const context = getContext(item.title!, match.index!, match[0].length);
        const truncatedContext = truncateContext(context, match[0]);

        return matches.length > 1 
          ? `(case ${index + 1}) "...${truncatedContext}..." (suggested: "${abbr}" → "${fullForm}")` 
          : `"${truncatedContext}" (suggested: "${abbr}" → "${fullForm}")`;
      });

      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains Bad Abbreviations',
        details: `Found ${matches.length} instance(s) of bad abbreviations: ${foundAbbreviations.join(', ')}`,
        affectedField: 'title',
        value: examples.join('; ')
      };
    }
  }
  return null;
}

/***********Product Title doesn't contain brand************** */

export function checkTitleBrand(item: FeedItem): ErrorResult | null {
  const titleLower = item.title?.toLowerCase() || '';
  const brandLower = item.brand?.toLowerCase() || '';

  if (item.brand) {
    // Tokenize the brand by splitting on spaces and hyphens, allowing partial brand matches
    const brandTokens = brandLower.split(/[\s\-]+/);
    
    const isBrandInTitle = brandTokens.some(token => titleLower.includes(token));

    if (!isBrandInTitle) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Doesn\'t Contain Brand',
        details: `Missing brand: ${item.brand}`,
        affectedField: 'title',
        value: item.title || ''
      };
    }
  }

  return null;
}



/************Product Title doesn't contain material when material is set***************** */

export function checkTitleMaterial(item: FeedItem): ErrorResult | null {
    const titleLower = item.title?.toLowerCase() || '';
    
    if (item.material && !titleLower.includes(item.material.toLowerCase())) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Doesn\'t Contain Material',
        details: `Missing material: ${item.material}`,
        affectedField: 'title',
        value: item.title || ''
      };
    }
    return null;
  }
  


/*********Product Title contains whitespace at start or end**************** */


export function checkTitleWhitespace(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const hasLeadingSpace = /^\s+/.test(item.title);
    const hasTrailingSpace = /\s+$/.test(item.title);

    if (hasLeadingSpace || hasTrailingSpace) {
      const leadingSpaces = (item.title.match(/^\s+/) || [''])[0];
      const trailingSpaces = (item.title.match(/\s+$/) || [''])[0];

      let locationDetails = [];
      if (hasLeadingSpace) locationDetails.push('at the beginning');
      if (hasTrailingSpace) locationDetails.push('at the end');

      const examples = [];
      if (hasLeadingSpace) {
        const context = getContext(item.title, 0, leadingSpaces.length);
        const truncatedContext = truncateContext(context, leadingSpaces);
        examples.push(`(case 1) "${'␣'.repeat(leadingSpaces.length)}${truncatedContext.trim()}"`);
      }
      if (hasTrailingSpace) {
        const startIndex = item.title.length - trailingSpaces.length;
        const context = getContext(item.title, startIndex, trailingSpaces.length);
        const truncatedContext = truncateContext(context, trailingSpaces);
        examples.push(`(case ${examples.length + 1}) "${truncatedContext.trim()}${'␣'.repeat(trailingSpaces.length)}"`);
      }

      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains Whitespace At Start Or End',
        details: `Found whitespace ${locationDetails.join(' and ')} of title`,
        affectedField: 'title',
        value: examples.join('; ')
      };
    }
  }
  return null;
}
/***************Product Title contains repeated whitespace**************************** */
export function checkTitleRepeatedWhitespace(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const matches = getMatches(repeatedWhitespaceRegex, item.title);
    if (matches.length > 0) {
      const examples = matches.map((match, index) => {
        const context = getContext(item.title!, match.index!, match[0].length);
        const truncatedContext = truncateContext(context, match[0]);
        const markedContext = truncatedContext.replace(match[0], '␣'.repeat(match[0].length));

        return matches.length > 1 
          ? `(case ${index + 1}) "...${markedContext}..."` 
          : `"...${markedContext}..."`;
      });

      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains Repeated Whitespace',
        details: `Found ${matches.length} instance(s) of repeated whitespace in title`,
        affectedField: 'title',
        value: examples.join('; ')
      };
    }
  }
  return null;
}

/*************Product Title contains repeated dashes*********************** */
export function checkTitleRepeatedDashes(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const matches = getMatches(repeatedDashRegex, item.title);
    if (matches.length > 0) {
      const examples = matches.map((match, index) => {
        const context = getContext(item.title!, match.index!, match[0].length);
        const truncatedContext = truncateContext(context, match[0]);

        return matches.length > 1 
          ? `(case ${index + 1}) "...${truncatedContext}..."` 
          : `"...${truncatedContext}..."`;
      });

      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains Repeated Dashes',
        details: `Found ${matches.length} instance(s) of repeated dashes in title`,
        affectedField: 'title',
        value: examples.join('; ')
      };
    }
  }
  return null;
}

/***********Product Title contains repeated commas************* */
export function checkTitleRepeatedCommas(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const matches = getMatches(repeatedCommaRegex, item.title);
    if (matches.length > 0) {
      const examples = matches.map((match, index) => {
        const context = getContext(item.title!, match.index!, match[0].length);
        const truncatedContext = truncateContext(context, match[0]);

        return matches.length > 1 
          ? `(case ${index + 1}) "...${truncatedContext}..."` 
          : `"...${truncatedContext}..."`;
      });

      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains Repeated Commas',
        details: `Found ${matches.length} instance(s) of repeated commas in title`,
        affectedField: 'title',
        value: examples.join('; ')
      };
    }
  }
  return null;
}

/************Product Title contains punctuation at start or end************************* */
export function checkTitlePunctuation(item: FeedItem): ErrorResult | null {
  if (item.title) {
    // Using a regex that matches punctuation but excludes parentheses
    const punctuationRegex = /^[.,!?;:"'`]+|[.,!?;:"'`]+$/u;
    const startMatch = punctuationRegex.exec(item.title);
    const endMatch = /[.,!?;:"'`]+$/u.exec(item.title);
    
    const matches = [];
    if (startMatch) matches.push({ match: startMatch, position: 'at the beginning' });
    if (endMatch) matches.push({ match: endMatch, position: 'at the end' });

    if (matches.length > 0) {
      const positions = matches.map(m => m.position);
      const examples = matches.map((m, index) => {
        const context = getContext(item.title!, m.match.index!, m.match[0].length);
        const truncatedContext = truncateContext(context, m.match[0]);

        return matches.length > 1 
          ? `(case ${index + 1}) "...${truncatedContext}..."` 
          : `"...${truncatedContext}..."`;
      });

      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains Punctuation At Start Or End',
        details: `Found punctuation ${positions.join(' and ')} of title`,
        affectedField: 'title',
        value: examples.join('; ')
      };
    }
  }
  return null;
}


/*****************Product Title contains HTML********************* */
export function checkTitleHtml(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const matches = getMatches(htmlTagRegex, item.title);
    if (matches.length > 0) {
      const foundTags = [...new Set(matches.map(m => m[0]))];
      
      const examples = matches.map((match, index) => {
        const context = getContext(item.title!, match.index!, match[0].length);
        const truncatedContext = truncateContext(context, match[0]);

        return matches.length > 1 
          ? `(case ${index + 1}) "...${truncatedContext}..."` 
          : `"...${truncatedContext}..."`;
      });

      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains HTML Tags',
        details: `Found ${matches.length} HTML tag(s): ${foundTags.join(', ')}`,
        affectedField: 'title',
        value: examples.join('; ')
      };
    }
  }
  return null;
}

/********Product Title contains HTML entities (&reg, &copy, &trade)******************** */
export function checkTitleHtmlEntities(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const matches = getMatches(htmlEntityRegex, item.title);
    if (matches.length > 0) {
      const foundEntities = [...new Set(matches.map(m => m[0]))];
      
      const examples = matches.map((match, index) => {
        const context = getContext(item.title!, match.index!, match[0].length);
        const truncatedContext = truncateContext(context, match[0]);

        return matches.length > 1 
          ? `(case ${index + 1}) "...${truncatedContext}..."` 
          : `"...${truncatedContext}..."`;
      });

      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains HTML Entities',
        details: `Found ${matches.length} HTML entitie(s): ${foundEntities.join(', ')}`,
        affectedField: 'title',
        value: examples.join('; ')
      };
    }
  }
  return null;
}
/***********Product Title contains promotional words
 *       (save, off, free shipping, best seller, 30% off, buy one get one, open box)********************************* */
export function checkTitlePromotionalWords(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const matches = [];
    for (const word of promotionalWords) {
      const regex = new RegExp(`\\b${word}\\b`, 'gi');
      let match;
      while ((match = regex.exec(item.title)) !== null) {
        matches.push({ word, match });
      }
    }

    if (matches.length > 0) {
      const foundWords = [...new Set(matches.map(m => m.word))];
      
      const examples = matches.map((m, index) => {
        const context = getContext(item.title!, m.match.index, m.match[0].length);
        const truncatedContext = truncateContext(context, m.match[0]);

        return matches.length > 1 
          ? `(case ${index + 1}) "...${truncatedContext}..."` 
          : `"...${truncatedContext}..."`;
      });

      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains Promotional Words',
        details: `Found ${matches.length} promotional word(s): ${foundWords.join(', ')}`,
        affectedField: 'title',
        value: examples.join('; ')
      };
    }
  }
  return null;
}


/********************************************************** */
/*

export function checkMissingSpaces(item: FeedItem): ErrorResult | null {
  if (!item.title) return null;
  
  const words = item.title.split(/[\s-]+/);
  const errors: Array<{original: string, suggested: string}> = [];
  
  for (const word of words) {
    const split = wordSplitter.findSplit(word);
    if (split) {
      errors.push({
        original: word,
        suggested: split
      });
    }
  }

  if (errors.length > 0) {
    const examples = errors.map((error, index) => 
      `(case ${index + 1}) "${error.original}" should be "${error.suggested}"`
    );

    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Missing Spaces in Title',
      details: `Found ${errors.length} instance(s) of missing spaces between words`,
      affectedField: 'title',
      value: examples.join('; ')
    };
  }

  return null;
}

// Function to check for missing spaces after commas
function checkTitleMissingSpacesAfterCommas(item: FeedItem): ErrorResult | null {
  if (!item.title) return null;
  
  const matches = getMatches(missingSpaceRegex, item.title);
  if (matches.length === 0) return null;

  const examples = matches.map((match, index) => {
    const context = getContext(item.title!, match.index!, match[0].length);
    return matches.length > 1 
      ? `(case ${index + 1}) "...${context}..."` 
      : `"...${context}..."`;
  });

  return {
    id: item.id || 'UNKNOWN',
    errorType: 'Missing Spaces After Commas',
    details: `Found ${matches.length} instance(s) of missing spaces after commas`,
    affectedField: 'title',
    value: examples.join('; ')
  };
}

export function checkTitleSpacing(item: FeedItem): ErrorResult | null {
  const missingSpacesError = checkMissingSpaces(item);
  const missingSpacesAfterCommasError = checkTitleMissingSpacesAfterCommas(item);
  
  if (missingSpacesError && missingSpacesAfterCommasError) {
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Title Spacing Issues',
      details: `${missingSpacesError.details}; ${missingSpacesAfterCommasError.details}`,
      affectedField: 'title',
      value: `${missingSpacesError.value}; ${missingSpacesAfterCommasError.value}`
    };
  }
  
  return missingSpacesError || missingSpacesAfterCommasError;
}

*/
/***********Product Title contains non breaking spaces******************** */
export function checkTitleNonBreakingSpaces(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const matches = getMatches(nonBreakingSpaceRegex, item.title);
    if (matches.length > 0) {
      const examples = matches.map((match, index) => {
        const context = getContext(item.title!, match.index!, match[0].length);
        const truncatedContext = truncateContext(context, match[0]);
        const markedContext = truncatedContext.replace(match[0], '␣');

        return matches.length > 1 
          ? `(case ${index + 1}) "...${markedContext}..."` 
          : `"...${markedContext}..."`;
      });

      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains Non-Breaking Spaces',
        details: `Found ${matches.length} instance(s) of non-breaking spaces in title`,
        affectedField: 'title',
        value: examples.join('; ')
      };
    }
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
   // checkTitleSpacing, 
    checkTitleNonBreakingSpaces
  ];
  