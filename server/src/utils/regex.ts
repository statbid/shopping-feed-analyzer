/**
 * Regex Utilities
 *
 * This file defines reusable regular expressions for detecting and handling various formatting and 
 * validation issues in text data. These utilities are particularly useful in data preprocessing 
 * and validation tasks, ensuring text consistency and compliance with formatting rules.
 *
 * **Key Features:**
 * - **Missing Space Detection**:
 *   - `missingSpaceRegex`: Identifies words followed immediately by a comma without a space (e.g., "word,word").
 * - **Repeated Dashes Handling**:
 *   - `repeatedDashesRegex`: Detects instances of repeated dashes (e.g., "--" or "- -").
 * - **Special Character Filtering**:
 *   - `specialCharsRegex`: Matches characters that are not alphanumeric or standard punctuation 
 *     (excluding hyphens and parentheses).
 * - **Abbreviation Cleanup**:
 *   - `badAbbreviationsRegex`: Matches problematic abbreviations (e.g., "pck", "pkg", "qty") and 
 *     invalid use of "in." for inches.
 *
 */

export const missingSpaceRegex = /\b\w+,(?=[a-zA-Z])/g;
export const repeatedDashesRegex = /--|- -/g;
export const specialCharsRegex = /[^a-zA-Z0-9\s.,;:()\-]/g;
export const badAbbreviationsRegex = /\b(pck|pkg|qty|qt|pc|pcs|ea|(?<=\s|^)in\.(?=\s|$)|ft)\b/gi;

