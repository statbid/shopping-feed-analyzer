import { FeedItem, ErrorResult } from '../types';
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

// Helper function to get context
function getContext(text: string, index: number, length: number): string {
  const words = text.split(/\s+/);
  const wordIndex = words.findIndex((word, i) => {
    const startIndex = words.slice(0, i).join(' ').length;
    return startIndex <= index && index < startIndex + word.length;
  });
  const start = Math.max(0, wordIndex - 3);
  const end = Math.min(words.length, wordIndex + 4);
  return words.slice(start, end).join(' ');
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

export function checkDescriptionMissingSpaces(item: FeedItem): ErrorResult | null {
  if (item.description) {
    const matches = getMatches(missingSpaceRegex, item.description);
    if (matches.length > 0) {
      const examples = matches.slice(0, 3).map(match => {
        const context = getContext(item.description!, match.index!, match[0].length);
        return `"${context}" (found: "${match[0]}")`;
      });
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Missing Spaces After Commas',
        details: `Found ${matches.length} instance(s): ${examples.join('; ')}`,
        affectedField: 'description',
        value: examples[0]
      };
    }
  }
  return null;
}

export function checkDescriptionRepeatedDashes(item: FeedItem): ErrorResult | null {
  if (item.description) {
    const matches = getMatches(repeatedDashesRegex, item.description);
    if (matches.length > 0) {
      const examples = matches.slice(0, 3).map(match => {
        const context = getContext(item.description!, match.index!, match[0].length);
        return `"${context}" (found: "${match[0]}")`;
      });
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Repeated Dashes in Description',
        details: `Found ${matches.length} instance(s): ${examples.join('; ')}`,
        affectedField: 'description',
        value: examples[0]
      };
    }
  }
  return null;
}

export function checkDescriptionWhitespace(item: FeedItem): ErrorResult | null {
  if (item.description && leadingTrailingWhitespaceRegex.test(item.description)) {
    const trimmed = item.description.trim();
    const leadingSpace = item.description.length - item.description.trimStart().length;
    const trailingSpace = item.description.length - item.description.trimEnd().length;
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Whitespace at Edges in Description',
      details: `Description has ${leadingSpace} leading and ${trailingSpace} trailing whitespace characters`,
      affectedField: 'description',
      value: `"${item.description.slice(0, 10)}...${item.description.slice(-10)}"`
    };
  }
  return null;
}

export function checkDescriptionRepeatedWhitespace(item: FeedItem): ErrorResult | null {
  if (item.description) {
    const matches = getMatches(repeatedWhitespaceRegex, item.description);
    if (matches.length > 0) {
      const examples = matches.slice(0, 3).map(match => {
        const context = getContext(item.description!, match.index!, match[0].length);
        return `"${context}" (found: "${match[0].replace(/\s/g, '␣')}")`;
      });
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Repeated Whitespace in Description',
        details: `Found ${matches.length} instance(s): ${examples.join('; ')}`,
        affectedField: 'description',
        value: examples[0]
      };
    }
  }
  return null;
}

export function checkDescriptionRepeatedCommas(item: FeedItem): ErrorResult | null {
  if (item.description) {
    const matches = getMatches(repeatedCommaRegex, item.description);
    if (matches.length > 0) {
      const examples = matches.slice(0, 3).map(match => {
        const context = getContext(item.description!, match.index!, match[0].length);
        return `"${context}" (found: "${match[0]}")`;
      });
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Repeated Commas in Description',
        details: `Found ${matches.length} instance(s): ${examples.join('; ')}`,
        affectedField: 'description',
        value: examples[0]
      };
    }
  }
  return null;
}

export function checkDescriptionHtml(item: FeedItem): ErrorResult | null {
  if (item.description) {
    const matches = getMatches(htmlTagRegex, item.description);
    if (matches.length > 0) {
      const examples = matches.slice(0, 3).map(match => {
        const context = getContext(item.description!, match.index!, match[0].length);
        return `"${context}" (found: "${match[0]}")`;
      });
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'HTML in Description',
        details: `Found ${matches.length} HTML tag(s): ${examples.join('; ')}`,
        affectedField: 'description',
        value: examples[0]
      };
    }
  }
  return null;
}

export function checkDescriptionHtmlEntities(item: FeedItem): ErrorResult | null {
  if (item.description) {
    const matches = getMatches(htmlEntityRegex, item.description);
    if (matches.length > 0) {
      const examples = matches.slice(0, 3).map(match => {
        const context = getContext(item.description!, match.index!, match[0].length);
        return `"${context}" (found: "${match[0]}")`;
      });
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'HTML Entities in Description',
        details: `Found ${matches.length} HTML entitie(s): ${examples.join('; ')}`,
        affectedField: 'description',
        value: examples[0]
      };
    }
  }
  return null;
}

export function checkDescriptionLength(item: FeedItem): ErrorResult | null {
  if (item.description && item.description.length > MAX_DESCRIPTION_LENGTH) {
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Description Too Long',
      details: `Description exceeds ${MAX_DESCRIPTION_LENGTH} characters (current length: ${item.description.length})`,
      affectedField: 'description',
      value: `${item.description.substring(0, 50)}...${item.description.substring(item.description.length - 50)}`
    };
  }
  return null;
}

export function checkDescriptionNonBreakingSpaces(item: FeedItem): ErrorResult | null {
  if (item.description) {
    const matches = getMatches(nonBreakingSpaceRegex, item.description);
    if (matches.length > 0) {
      const examples = matches.slice(0, 3).map(match => {
        const context = getContext(item.description!, match.index!, match[0].length);
        return `"${context}" (found: "␠")`;
      });
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Non-Breaking Spaces in Description',
        details: `Found ${matches.length} non-breaking space(s): ${examples.join('; ')}`,
        affectedField: 'description',
        value: examples[0]
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
      const examples = foundWords.slice(0, 3).map(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        const match = regex.exec(item.description!);
        if (match) {
          const context = getContext(item.description!, match.index, match[0].length);
          return `"${context}" (found: "${match[0]}")`;
        }
        return '';
      }).filter(Boolean);
      
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Promotional Words in Description',
        details: `Found ${foundWords.length} promotional word(s): ${foundWords.join(', ')}`,
        affectedField: 'description',
        value: examples[0] || ''
      };
    }
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