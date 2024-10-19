"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spellChecks = void 0;
exports.checkSpelling = checkSpelling;
const nspell_1 = __importDefault(require("nspell"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
// Load the dictionaries
const aff = (0, fs_1.readFileSync)(path_1.default.resolve(__dirname, '../dictionaries/en_US.aff'));
const dic = (0, fs_1.readFileSync)(path_1.default.resolve(__dirname, '../dictionaries/en_US.dic'));
const spell = (0, nspell_1.default)(aff, dic);
// Cache for word corrections
const correctionCache = new Map();
// Additional words to ignore
const ignoreWords = new Set(['no', 'no.', 'vs', 'vs.', 'etc', 'etc.']);
function getValidCorrections(word) {
    if (correctionCache.has(word)) {
        return correctionCache.get(word);
    }
    const suggestions = spell.suggest(word);
    correctionCache.set(word, suggestions);
    return suggestions;
}
function normalizeWord(word) {
    return word.toLowerCase().replace(/[.,/#!$%^&*;:{}=\-_`~()™®©]/g, '');
}
function isLikelyProperNoun(word) {
    return /^[A-Z][a-z]+$/.test(word);
}
function isNumber(word) {
    // This regex matches numbers (including decimals), years, and dimensions
    return /^(\d+\.?\d*|\d{4}|\d+["']?[DWHLdwhl]?)$/.test(word.replace(/[,]/g, ''));
}
function isSpecialCase(word) {
    // Check for words with apostrophes, hyphens, or trademark symbols
    return /[''\-™®©]/.test(word) || word.startsWith("'") || word.endsWith("'");
}
function isBrandWord(word, brand) {
    const brandWords = brand.toLowerCase().split(/\s+/);
    return brandWords.includes(word.toLowerCase());
}
function checkSpelling(item) {
    const errors = [];
    const startTime = Date.now();
    let wordCount = 0;
    let misspelledCount = 0;
    function checkField(fieldName) {
        const content = item[fieldName];
        if (typeof content === 'string') {
            const words = content.split(/\s+/);
            wordCount += words.length;
            for (const word of words) {
                const normalizedWord = normalizeWord(word);
                if (normalizedWord.length > 2 &&
                    !ignoreWords.has(normalizedWord) &&
                    !isNumber(word) &&
                    !isSpecialCase(word) &&
                    !isBrandWord(word, item.brand || '') &&
                    !spell.correct(normalizedWord)) {
                    misspelledCount++;
                    const corrections = getValidCorrections(normalizedWord);
                    if (corrections.length > 0 &&
                        corrections[0].toLowerCase() !== normalizedWord &&
                        !isLikelyProperNoun(word)) {
                        errors.push({
                            id: item.id,
                            errorType: `Spelling Error in ${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`,
                            details: `Misspelled word found: "${word}"`,
                            affectedField: fieldName,
                            value: `${word} (Suggestion: ${corrections[0]})`
                        });
                    }
                }
            }
        }
    }
    checkField('title');
    checkField('description');
    /*
      const endTime = Date.now();
      console.log(`Spelling check for item ${item.id}:`);
      console.log(`  Time taken: ${endTime - startTime}ms`);
      console.log(`  Words checked: ${wordCount}`);
      console.log(`  Misspelled words: ${misspelledCount}`);
      console.log(`  Errors found: ${errors.length}`);*/
    return errors;
}
exports.spellChecks = [checkSpelling];
