/**
 * Title Validation Checkers
 *
 * This file defines various validation functions for checking specific issues
 * in product titles based on a given `FeedItem` object. Each function performs
 * a single validation and returns an `ErrorResult` if the validation fails.
 *
 * Exported Constants:
 * - `TitleChecker`: Array of all title validation functions.
 *
 * Functions:
 * - Validation Functions: `checkTitleSize`, `checkTitleColor`, etc.
 * - Utilities: `getMatches`, `escapeRegExp`, etc.
 *
 * Dependencies:
 * - Constants: Regex patterns and predefined data for validation.
 * - External Checkers: `SpellChecker`, `MissingSpaceChecker`.
 *
 */


import { FeedItem, ErrorResult } from '@shopping-feed/types';
import {
  sizeWords, ignoreWords, specialCharsRegex, badAbbreviationsRegex, repeatedWhitespaceRegex,
  repeatedDashRegex, repeatedCommaRegex, punctuationStartEndRegex, htmlTagRegex, htmlEntityRegex,
  promotionalWords, nonBreakingSpaceRegex, sizeSynonyms, escapeRegExp, trailingPeriodRegex,
  sizeTokenSplitRegex, numberOnlyRegex, unitMatchRegex, tokenBoundaryRegex, sizeWordBoundaryRegex,
  missingSpaceRegex
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
  if (!item.size || !item.title) return null;

  const titleLower = item.title.toLowerCase();
  const normalizedSize = item.size.toLowerCase().replace(trailingPeriodRegex, '');
  const sizeTokens = normalizedSize.split(sizeTokenSplitRegex);

  const sizeInTitle = sizeTokens.some(token => {
    const escapedToken = escapeRegExp(token);
    const tokenRegex = tokenBoundaryRegex(escapedToken);
    if (tokenRegex.test(titleLower)) return true;

    const unitMatch = token.match(unitMatchRegex);
    if (unitMatch) {
      const numberPart = unitMatch[1];
      let unitPart = unitMatch[4].replace(trailingPeriodRegex, '');
      const unitVariations = [unitPart, `${unitPart}.`];
      const tokenVariations = unitVariations.map(unit => `${numberPart}${unit}`);
      const escapedVariations = tokenVariations.map(escapeRegExp).join('|');
      const unitRegex = new RegExp(`(^|\\s)(${escapedVariations})(\\s|$)`, 'i');
      if (unitRegex.test(titleLower)) return true;
    }

    if (numberOnlyRegex.test(token)) {
      const numberRegex = tokenBoundaryRegex(escapedToken);
      if (numberRegex.test(titleLower)) return true;
    }

    if (sizeWords.has(token)) {
      const sizeWordRegex = sizeWordBoundaryRegex(escapedToken);
      if (sizeWordRegex.test(titleLower)) return true;
    }

    if (sizeSynonyms[token]) {
      return sizeSynonyms[token].some(synonym => {
        const synonymRegex = sizeWordBoundaryRegex(escapeRegExp(synonym));
        return synonymRegex.test(titleLower);
      });
    }

    return false;
  });

  if (!sizeInTitle) {
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Title Doesn\'t Contain Size When Size is Set',
      details: `Title does not contain size (${item.size}) when size is set`,
      affectedField: 'title',
      value: item.title
    };
  }

  return null;
}

export function checkTitleColor(item: FeedItem): ErrorResult | null {
  const titleLower = item.title?.toLowerCase() || '';
  if (item.color) {
    const colorComponents = item.color.toLowerCase().split(/[\s\/]+/);
    const allColorsInTitle = colorComponents.every(colorComponent => titleLower.includes(colorComponent));
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

export function checkTitleDuplicateWords(item: FeedItem): ErrorResult | null {
  const titleLower = item.title?.toLowerCase() || '';
  const titleWords = titleLower.split(/\s+/);
  const filteredWords = titleWords.filter(word =>
    !ignoreWords.has(word) && !/^\d+('|ft|in|cm|m|mm)?$/.test(word) && word.length > 2
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

export function checkTitleSpecialCharacters(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const matches = getMatches(new RegExp(specialCharsRegex.source, 'g'), item.title);
    if (matches.length > 0) {
      const foundChars = [...new Set(matches.map(m => m[0]))];
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains Special Characters',
        details: `Found ${matches.length} instance(s) of special characters: ${foundChars.join(', ')}`,
        affectedField: 'title',
        value: item.title
      };
    }
  }
  return null;
}

export function checkTitleBadAbbreviations(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const matches = getMatches(/\b(pck|pkg|qty|qt|pc|pcs|ea|(?<=\s|^)in\.(?=\s|$)|ft)\b/gi, item.title);
    if (matches.length > 0) {
      const foundAbbreviations = [...new Set(matches.map(m => m[0].toLowerCase()))];
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains Bad Abbreviations',
        details: `Found ${matches.length} instance(s) of bad abbreviations: ${foundAbbreviations.join(', ')}`,
        affectedField: 'title',
        value: item.title
      };
    }
  }
  return null;
}

export function checkTitleBrand(item: FeedItem): ErrorResult | null {
  const titleLower = item.title?.toLowerCase() || '';
  const brandLower = item.brand?.toLowerCase() || '';
  if (item.brand) {
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

export function checkTitleWhitespace(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const hasLeadingSpace = /^\s+/.test(item.title);
    const hasTrailingSpace = /\s+$/.test(item.title);
    if (hasLeadingSpace || hasTrailingSpace) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains Whitespace At Start Or End',
        details: `Found whitespace at ${hasLeadingSpace ? 'the beginning' : ''}${hasTrailingSpace ? ' the end' : ''}`,
        affectedField: 'title',
        value: item.title
      };
    }
  }
  return null;
}

export function checkTitleRepeatedWhitespace(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const matches = getMatches(repeatedWhitespaceRegex, item.title);
    if (matches.length > 0) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains Repeated Whitespace',
        details: `Found ${matches.length} instance(s) of repeated whitespace in title`,
        affectedField: 'title',
        value: item.title
      };
    }
  }
  return null;
}

export function checkTitleRepeatedDashes(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const matches = getMatches(repeatedDashRegex, item.title);
    if (matches.length > 0) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains Repeated Dashes',
        details: `Found ${matches.length} instance(s) of repeated dashes in title`,
        affectedField: 'title',
        value: item.title
      };
    }
  }
  return null;
}

export function checkTitleRepeatedCommas(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const matches = getMatches(repeatedCommaRegex, item.title);
    if (matches.length > 0) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains Repeated Commas',
        details: `Found ${matches.length} instance(s) of repeated commas in title`,
        affectedField: 'title',
        value: item.title
      };
    }
  }
  return null;
}

export function checkTitlePunctuation(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const punctuationRegex = /^[.,!?;:"'`]+|[.,!?;:"'`]+$/u;
    const startMatch = punctuationRegex.exec(item.title);
    const endMatch = /[.,!?;:"'`]+$/u.exec(item.title);

    if (startMatch || endMatch) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains Punctuation At Start Or End',
        details: `Found punctuation at ${startMatch ? 'the beginning' : ''}${endMatch ? ' the end' : ''}`,
        affectedField: 'title',
        value: item.title
      };
    }
  }
  return null;
}

export function checkTitleHtml(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const matches = getMatches(htmlTagRegex, item.title);
    if (matches.length > 0) {
      const foundTags = [...new Set(matches.map(m => m[0]))];
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains HTML Tags',
        details: `Found ${matches.length} HTML tag(s): ${foundTags.join(', ')}`,
        affectedField: 'title',
        value: item.title
      };
    }
  }
  return null;
}

export function checkTitleHtmlEntities(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const matches = getMatches(htmlEntityRegex, item.title);
    if (matches.length > 0) {
      const foundEntities = [...new Set(matches.map(m => m[0]))];
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains HTML Entities',
        details: `Found ${matches.length} HTML entity(ies): ${foundEntities.join(', ')}`,
        affectedField: 'title',
        value: item.title
      };
    }
  }
  return null;
}

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
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains Promotional Words',
        details: `Found ${matches.length} promotional word(s): ${foundWords.join(', ')}`,
        affectedField: 'title',
        value: item.title
      };
    }
  }
  return null;
}

export function checkTitleNonBreakingSpaces(item: FeedItem): ErrorResult | null {
 /* if (item.title) {
    const matches = getMatches(nonBreakingSpaceRegex, item.title);
    if (matches.length > 0) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Title Contains Non-Breaking Spaces',
        details: `Found ${matches.length} instance(s) of non-breaking spaces in title`,
        affectedField: 'title',
        value: item.title
      };
    }
  }*/
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
  checkTitleNonBreakingSpaces
];
