/**
 * Description Validation Checkers
 *
 * This file defines various validation functions for checking specific issues
 * in product descriptions based on a given `FeedItem` object. Each function 
 * performs a single validation and returns an `ErrorResult` if the validation fails.
 *
 * Exported Constants:
 * - `DescriptionChecker`: Array of all description validation functions.
 *
 * Functions:
 * - Validation Functions: `checkDescriptionMissingSpaces`, `checkDescriptionRepeatedDashes`, etc.
 * - Utilities: `getMatches`, `getContext`, `truncateContext`.
 *
 * Dependencies:
 * - Constants: Regex patterns and predefined data for validation.
 * - Utilities: Helper functions for text matching and context extraction.
 *
 * The checks include:
 * - Missing spaces after commas.
 * - Repeated dashes or whitespace.
 * - Leading and trailing whitespace.
 * - Presence of HTML tags or entities.
 * - Overly long descriptions.
 * - Non-breaking spaces.
 * - Use of promotional words.
 *
 */




import { FeedItem, ErrorResult } from '@shopping-feed/types';
import {
  missingSpaceRegex,
  repeatedDashesRegex,
  leadingTrailingWhitespaceRegex,
  repeatedWhitespaceRegex,
  repeatedCommaRegex,
  htmlTagRegex,
  htmlEntityRegex,
  MAX_DESCRIPTION_LENGTH,
  nonBreakingSpaceRegex,
  promotionalWords
} from '../utils/constants';

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



/*************************Description contains missing spaces like word,word******************************************** */

export function checkDescriptionMissingSpaces(item: FeedItem): ErrorResult | null {
  if (item.description) {
    const matches = getMatches(missingSpaceRegex, item.description);
    if (matches.length > 0) {
      // Generate context for each match, without limiting to 3 instances
      const examples = matches.map((match, index) => {
        const context = getContext(item.description!, match.index!, match[0].length);
        const truncatedContext = truncateContext(context, match[0]);
           return matches.length > 1 ? `(case ${index + 1}) ".${truncatedContext}."` : `".${truncatedContext}."`;
      });

      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Description Contains Missing Spaces After Commas',
        details: `Found ${matches.length} instance(s) of Missing Spaces After Commas`,
        affectedField: 'description',
        // Join all the cases with semicolons
        value: examples.join('; ')
      };
    }
  }
  return null;
}



/************Description contains repeated dashes************************** */
export function checkDescriptionRepeatedDashes(item: FeedItem): ErrorResult | null {
  if (item.description) {
    const matches = getMatches(repeatedDashesRegex, item.description);

    if (matches.length > 0) {
      
      const examples = matches.map((match, index) => {
        const context = getContext(item.description!, match.index!, match[0].length);
        const truncatedContext = truncateContext(context, match[0]);

        return matches.length > 1 
          ? `(case ${index + 1}) "...${truncatedContext}..."` 
          : `"...${truncatedContext}..."`;
      });

      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Description Contains Repeated Dashes',
        details: `Found ${matches.length} instance(s) of repeated dashes`,
        affectedField: 'description',
        value: examples.join('; ')  
      };
    }
  }
  return null;
}



/************Whitespace at Edges in Description************************** */
export function checkDescriptionWhitespace(item: FeedItem): ErrorResult | null {
  if (item.description && leadingTrailingWhitespaceRegex.test(item.description)) {
    const leadingSpace = item.description.length - item.description.trimStart().length;
    const trailingSpace = item.description.length - item.description.trimEnd().length;

    let value = '';
    if (leadingSpace > 0) {
      const firstWord = item.description.trimStart().split(' ')[0];
      value = `"  ${firstWord}..."`;
    }
    if (trailingSpace > 0) {
      const lastWord = item.description.trimEnd().split(' ').pop();
      value = `"...${lastWord}  "`;
    }

    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Description Contains Whitespace at Start or End',
      details: `Description has ${leadingSpace} whitespaces at the begining and ${trailingSpace}  whitespaces at the end`,
      affectedField: 'description',
      value: value
    };
  }
  return null;
}


/************Repeated Whitespace in Description************************** */
export function checkDescriptionRepeatedWhitespace(item: FeedItem): ErrorResult | null {
  if (item.description) {
    const matches = getMatches(repeatedWhitespaceRegex, item.description);
    if (matches.length > 0) {
      const examples = matches.map((match, index) => {
        const context = getContext(item.description!, match.index!, match[0].length);
        const markedContext = context.replace(match[0], match[0].replace(/\s/g, '__'));
        return `"...${markedContext}..."`;
      });

      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Description Contains Repeated Whitespace',
        details: `Found ${matches.length} instance(s) of repeated whitespaces in description`,
        affectedField: 'description',
        value: examples.join('; ')  
      };
    }
  }
  return null;
}

export function checkDescriptionRepeatedCommas(item: FeedItem): ErrorResult | null {
  if (item.description) {
    const matches = getMatches(repeatedCommaRegex, item.description);
    if (matches.length > 0) {
      const examples = matches.map((match, index) => {
        const context = getContext(item.description!, match.index!, match[0].length);
        const truncatedContext = truncateContext(context, match[0]);
        return matches.length > 1 
          ? `(case ${index + 1}) "${truncatedContext}"` 
          : `"${truncatedContext}"`;
      });

      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Description Contains Repeated Commas',
        details: `Found ${matches.length} instance(s) of repeated commas`,
        affectedField: 'description',
        value: examples.join('; ')
      };
    }
  }
  return null;
}




/************HTML in Description************************** */
export function checkDescriptionHtml(item: FeedItem): ErrorResult | null {
  if (item.description) {
    const matches = getMatches(htmlTagRegex, item.description);
    if (matches.length > 0) {
      const examples = matches.map((match, index) => {
        const context = getContext(item.description!, match.index!, match[0].length);
        const truncatedContext = truncateContext(context, match[0]);
        return matches.length > 1 
          ? `(case ${index + 1}) "${truncatedContext}"` 
          : `"${truncatedContext}"`;
      });

      const foundTags = matches.map(match => match[0]).join(', ');
      
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Description Contains HTML',
        details: `Found ${matches.length} HTML tag(s): ${foundTags}`,
        affectedField: 'description',
        value: examples.join('; ')
      };
    }
  }
  return null;
}

export function checkDescriptionHtmlEntities(item: FeedItem): ErrorResult | null {
  if (item.description) {
    const matches = getMatches(htmlEntityRegex, item.description);
    if (matches.length > 0) {
      const examples = matches.map((match, index) => {
        const context = getContext(item.description!, match.index!, match[0].length);
        const truncatedContext = truncateContext(context, match[0]);
        return matches.length > 1 
          ? `(case ${index + 1}) "${truncatedContext}"` 
          : `"${truncatedContext}"`;
      });

      const foundEntities = matches.map(match => match[0]).join(', ');

      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Description Contains HTML Entities',
        details: `Found ${matches.length} HTML entities: ${foundEntities}`,
        affectedField: 'description',
        value: examples.join('; ')
      };
    }
  }
  return null;
}

export function checkDescriptionPromotionalWords(item: FeedItem): ErrorResult | null {
  if (item.description) {
    const foundWords = promotionalWords.filter(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'i');
      return regex.test(item.description!);
    });
    
    if (foundWords.length > 0) {
      const examples = foundWords.map((word, index) => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const match = regex.exec(item.description!);
        if (match) {
          const context = getContext(item.description!, match.index, match[0].length);
          const truncatedContext = truncateContext(context, match[0]);
          return foundWords.length > 1 
            ? `(case ${index + 1}) "${truncatedContext}"` 
            : `"${truncatedContext}"`;
        }
        return '';
      }).filter(Boolean);
      
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Description contains Promotional Words',
        details: `Found ${foundWords.length} promotional word(s): ${foundWords.join(', ')}`,
        affectedField: 'description',
        value: examples.join('; ')
      };
    }
  }
  return null;
}

export function checkDescriptionNonBreakingSpaces(item: FeedItem): ErrorResult | null {
  if (item.description && nonBreakingSpaceRegex.test(item.description)) {
    const matches = getMatches(nonBreakingSpaceRegex, item.description);
    const examples = matches.map((match, index) => {
      const context = getContext(item.description!, match.index!, match[0].length);
      const truncatedContext = truncateContext(context, match[0]);
      return matches.length > 1 
        ? `(case ${index + 1}) "${truncatedContext}"` 
        : `"${truncatedContext}"`;
    });

    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Description Contains Nonbreaking Spaces',
      details: `Found ${matches.length} instance(s) of non-breaking spaces`,
      affectedField: 'description',
      value: examples.join('; ')
    };
  }
  return null;
}

/**********Product Description too long************ */

export function checkDescriptionLength(item: FeedItem): ErrorResult | null {
  if (item.description && item.description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Description Too Long',
      details: `Description exceeds ${MAX_DESCRIPTION_LENGTH} characters (current length: ${item.description.length})`,
      affectedField: 'description',
      value: 'Description Too Long'
    };
  }
  return null;
}



export const DescriptionChecker = [
  checkDescriptionMissingSpaces,
  checkDescriptionRepeatedDashes,
  checkDescriptionWhitespace,
  checkDescriptionRepeatedWhitespace,
  checkDescriptionRepeatedCommas,
  checkDescriptionHtml,
  checkDescriptionHtmlEntities,
  checkDescriptionLength,
  checkDescriptionNonBreakingSpaces,
  checkDescriptionPromotionalWords
];