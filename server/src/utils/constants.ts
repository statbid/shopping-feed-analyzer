
/**
 * Constants and Utilities for Product Feed Analysis
 *
 * This module defines a collection of constants, regex patterns, and utility functions 
 * for handling and validating product feed data. These are primarily used for text cleaning, 
 * size normalization, and spell-checking in the context of product feed analysis.
 *
 * **Constants:**
 * - **Size Words**:
 *   - `sizeWords`: Set of standard size tokens (e.g., `xs`, `small`).
 *   - `sizeSynonyms`: Mapping of size tokens to their synonyms for normalization.
 *
 * - **Regex Patterns**:
 *   - `inchMatch`: Matches size formats involving inches (e.g., `5"`, `5 in`).
 *   - `repeatedDashRegex`: Matches multiple consecutive dashes.
 *   - `punctuationStartEndRegex`: Matches punctuation at the start or end of a string.
 *   - `missingSpaceRegex`: Matches words missing spaces after commas.
 *   - `htmlTagRegex`: Matches HTML tags (e.g., `<div>`).
 *   - `htmlEntityRegex`: Matches HTML entities (e.g., `&nbsp;`).
 *   - `specialCharsRegex`: Matches non-alphanumeric characters (excluding hyphens).
 *   - `validFractionRegex`: Matches numeric fractions (e.g., `1/2`).
 *   - `trailingPeriodRegex`: Matches trailing periods at the end of a string.
 *
 * - **Promotional Words**:
 *   - List of promotional keywords to filter out from descriptions (e.g., `save`, `free shipping`).
 *
 * - **Limits**:
 *   - `MAX_DESCRIPTION_LENGTH`: Maximum allowed length for product descriptions.
 *   - `MAX_ID_LENGTH`: Maximum allowed length for product IDs.
 *
 * - **Utility Functions**:
 *   - `escapeRegExp`: Escapes special characters in a string for use in regex patterns.
 *   - `shouldSpellCheck`: Determines if a word should be subject to spell checking based on 
 *     specific criteria (e.g., numbers, fractions, valid units).
 *   - `tokenBoundaryRegex`: Creates a regex to match a token within boundaries.
 *   - `sizeWordBoundaryRegex`: Matches size-related tokens with word boundaries.
 *
 * **Purpose:**
 * - Ensure product feed data is clean, consistent, and free from common formatting errors.
 * - Support efficient and accurate size normalization, text validation, and spell-checking.
 */


export const sizeWords = new Set(['xs', 's', 'm', 'l', 'xl', 'small', 'medium', 'large']);
export const sizeSynonyms: { [key: string]: string[] } = {
  'xs': ['xs', 'extra small'],
  's': ['s', 'small'],
  'm': ['m', 'medium'],
  'l': ['l', 'large'],
  'xl': ['xl', 'extra large'],
};




export const inchMatch =(/^(\d+(\.\d+)?)(["']|in\.?|inch)$/);
export const ignoreWords = new Set(['x', 'by', 'in', 'inch', 'inches', 'ft', 'feet', 'cm', 'm', 'mm']);
export const repeatedDashRegex = /-{2,}/g;
export const punctuationStartEndRegex = /^[\p{P}]|[\p{P}]$/u;
export const promotionalWords = [

  'save', 'free shipping', 'best seller', '% off', 'buy', 'open box', 'clearance'
];
export const MAX_DESCRIPTION_LENGTH = 5000;
export const MAX_ID_LENGTH = 50;
export const missingSpaceRegex = /\b\w+,(?=[a-zA-Z])/g;
export const repeatedDashesRegex = /--|- -/g;
export const leadingTrailingWhitespaceRegex = /^\s|\s$/g;
export const repeatedWhitespaceRegex = /\s{2,}/g;
export const repeatedCommaRegex = /,{2,}/g;
export const htmlTagRegex = /<[^>]*>/g;
export const htmlEntityRegex = /&[a-z]+;/gi;

export const nonBreakingSpaceRegex = /\xA0/g; 



// Helper function to escape special characters in regex patterns
export function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export const trailingPeriodRegex = /\.$/;
export const sizeTokenSplitRegex = /[\s()]+/;
export const numberOnlyRegex = /^\d+(\.\d+)?$/;
export const unitMatchRegex = /^([\d\.]+(\+\d+(\.\d+)?)?)([a-z"'.\/]+)$/i;

export const tokenBoundaryRegex = (token: string): RegExp =>
  new RegExp(`(^|\\s)${token}(\\s|$)`, 'i');


  export const sizeWordBoundaryRegex = (token: string): RegExp =>
  new RegExp(`\\b${token}\\b(?!-)`, 'i');




  // Modified special characters regex to exclude hyphen
export const specialCharsRegex = /[^a-zA-Z0-9\s.,;:()\-]/g;

// Modified bad abbreviations regex to only match lowercase 'pc' and not 'PC'
export const badAbbreviationsRegex = /\b(pck|pkg|qty|qt|(?<!P)pc|pcs|ea|(?<=\s|^)in\.(?=\s|$)|ft)\b/gi;

// Regex to identify valid numeric fractions
export const validFractionRegex = /^\d+\/\d+$/;

// Helper function to validate if a word should be spell checked
export function shouldSpellCheck(word: string): boolean {
  // Ignore numbers and fractions (e.g., "3/4")
  if (validFractionRegex.test(word)) return false;
  
  // Ignore if it contains numbers and valid measurement units
  if (/^\d+([\/\-]?\d*)?(cm|mm|m|in|ft|oz|lb|kg|g|ml|l)$/i.test(word)) return false;
  
  // Ignore PC in uppercase
  if (word === 'PC') return false;
  
  // Proceed with spell check for other words
  return true;
}