"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spellChecks = void 0;
exports.checkSpelling = checkSpelling;
//import type * as NspellType from 'nspell';
const nspell_1 = __importDefault(require("nspell"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
// Singleton class for spell checker management
class SpellChecker {
    constructor() {
        this.correctionCache = new Map();
        this.validationCache = new Map();
        this.ready = false;
        this.spell = this.initializeSpellChecker();
    }
    initializeSpellChecker() {
        console.log('Initializing spell checker...');
        const startTime = Date.now();
        try {
            const aff = (0, fs_1.readFileSync)(path_1.default.resolve(__dirname, '../dictionaries/en_US.aff'));
            const dic = (0, fs_1.readFileSync)(path_1.default.resolve(__dirname, '../dictionaries/en_US.dic'));
            const spell = (0, nspell_1.default)(aff, dic);
            // Pre-cache common words
            this.preloadCommonWords(spell);
            const endTime = Date.now();
            console.log(`Spell checker initialized in ${endTime - startTime}ms`);
            this.ready = true;
            return spell;
        }
        catch (error) {
            console.error('Failed to initialize spell checker:', error);
            throw error;
        }
    }
    preloadCommonWords(spell) {
        // Common product-related words to pre-validate
        const commonWords = [
            'product', 'quality', 'premium', 'warranty', 'shipping',
            'available', 'includes', 'features', 'material', 'color',
            'size', 'weight', 'height', 'width', 'length',
            'package', 'content', 'delivery', 'brand', 'model',
            'series', 'version', 'type', 'style', 'design'
        ];
        commonWords.forEach(word => {
            const isValid = spell.correct(word);
            this.validationCache.set(word, isValid);
            if (!isValid) {
                this.correctionCache.set(word, spell.suggest(word));
            }
        });
    }
    static getInstance() {
        if (!SpellChecker.instance) {
            SpellChecker.instance = new SpellChecker();
        }
        return SpellChecker.instance;
    }
    isReady() {
        return this.ready;
    }
    correct(word) {
        if (this.validationCache.has(word)) {
            return this.validationCache.get(word);
        }
        const isValid = this.spell.correct(word);
        this.validationCache.set(word, isValid);
        return isValid;
    }
    suggest(word) {
        if (this.correctionCache.has(word)) {
            return this.correctionCache.get(word);
        }
        const suggestions = this.spell.suggest(word);
        this.correctionCache.set(word, suggestions);
        return suggestions;
    }
}
// Initialize spell checker singleton
const spellChecker = SpellChecker.getInstance();
// Efficient word filtering with Set
const ignoreWords = new Set([
    'no', 'no.', 'vs', 'vs.', 'etc', 'etc.',
    // Add more common product-related terms
    'qty', 'ref', 'upc', 'sku', 'isbn', 'eol', 'msrp',
    'usb', 'hdmi', 'lcd', 'led', 'ac', 'dc', '3d', '4k',
    'uk', 'us', 'eu', 'ce', 'ul', 'iso', 'din', 'en'
]);
// Regex patterns compiled once
const numberPattern = /^(\d+\.?\d*|\d{4}|\d+["']?[DWHLdwhl]?)$/;
const properNounPattern = /^[A-Z][a-z]+$/;
const specialCharPattern = /[''\-™®©]/;
// Optimized helper functions
const isNumber = (word) => numberPattern.test(word.replace(/[,]/g, ''));
const isLikelyProperNoun = (word) => properNounPattern.test(word);
const isSpecialCase = (word) => specialCharPattern.test(word) || word.startsWith("'") || word.endsWith("'");
const isBrandWord = (word, brand) => {
    if (!brand)
        return false;
    const wordLower = word.toLowerCase();
    const brandLower = brand.toLowerCase();
    if (brandLower.includes(wordLower))
        return true;
    return brand.toLowerCase().split(/\s+/).includes(wordLower);
};
// Word processing cache
const processedWords = new Map();
function checkSpelling(item) {
    if (!spellChecker.isReady()) {
        console.warn('Spell checker not ready');
        return [];
    }
    const errors = [];
    const seenWords = new Set();
    function processWord(word, fieldName) {
        // Skip if word already processed in this item
        if (seenWords.has(word))
            return;
        seenWords.add(word);
        // Check process cache
        const cacheKey = `${word}:${item.brand || ''}`;
        if (processedWords.has(cacheKey)) {
            const shouldSkip = processedWords.get(cacheKey);
            if (shouldSkip)
                return;
        }
        // Quick filters
        if (word.length <= 2 ||
            ignoreWords.has(word.toLowerCase()) ||
            isNumber(word) ||
            isSpecialCase(word) ||
            isBrandWord(word, item.brand || '')) {
            processedWords.set(cacheKey, true);
            return;
        }
        // Spell check
        if (!spellChecker.correct(word) && !isLikelyProperNoun(word)) {
            const suggestions = spellChecker.suggest(word).slice(0, 3);
            if (suggestions.length > 0 && suggestions[0].toLowerCase() !== word.toLowerCase()) {
                errors.push({
                    id: item.id || 'UNKNOWN',
                    errorType: `Spelling Error in ${fieldName}`,
                    details: `Misspelled word found: "${word}"`,
                    affectedField: fieldName,
                    value: `${word} (Suggestion: ${suggestions.join(', ')})`
                });
            }
        }
        processedWords.set(cacheKey, false);
    }
    function checkField(fieldName) {
        const content = item[fieldName];
        if (typeof content === 'string') {
            content.split(/\s+/).forEach(word => processWord(word, fieldName));
        }
    }
    checkField('title');
    checkField('description');
    return errors;
}
exports.spellChecks = [checkSpelling];
