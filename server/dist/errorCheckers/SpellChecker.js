"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.spellChecker = exports.spellChecks = exports.spellingChecks = void 0;
exports.checkSpelling = checkSpelling;
exports.checkTitleSpelling = checkTitleSpelling;
exports.checkDescriptionSpelling = checkDescriptionSpelling;
const nspell_1 = __importDefault(require("nspell"));
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
// Singleton class for spell checker management
class SpellChecker {
    constructor() {
        this.maxCacheSize = 20 * 1024 * 1024; // 20MB in bytes
        this.cleanupThreshold = 0.8; // Cleanup at 80% capacity
        this.hasChanges = false; // Added hasChanges property
        this.correctionCache = new Map();
        this.validationCache = new Map();
        this.ready = false;
        this.cacheDir = path_1.default.resolve(__dirname, '../.cache');
        this.cachePath = path_1.default.resolve(this.cacheDir, 'spell-checker-cache.json');
        this.spell = this.initializeSpellChecker();
    }
    initializeSpellChecker() {
        console.log('Initializing spell checker...');
        const startTime = Date.now();
        try {
            this.loadCache();
            const aff = (0, fs_1.readFileSync)(path_1.default.resolve(__dirname, '../dictionaries/en_US.aff'));
            const dic = (0, fs_1.readFileSync)(path_1.default.resolve(__dirname, '../dictionaries/en_US.dic'));
            const spell = (0, nspell_1.default)(aff, dic);
            if (this.correctionCache.size === 0) {
                this.preloadCommonWords(spell);
                this.saveCache();
            }
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
    loadCache() {
        try {
            if (!(0, fs_1.existsSync)(this.cacheDir)) {
                (0, fs_1.mkdirSync)(this.cacheDir, { recursive: true });
            }
            if ((0, fs_1.existsSync)(this.cachePath)) {
                const stats = (0, fs_1.statSync)(this.cachePath);
                if (stats.size <= this.maxCacheSize) {
                    const cacheData = JSON.parse((0, fs_1.readFileSync)(this.cachePath, 'utf8'));
                    this.validationCache = new Map(Object.entries(cacheData.validationCache));
                    this.correctionCache = new Map(Object.entries(cacheData.correctionCache));
                    if (stats.size > this.maxCacheSize * this.cleanupThreshold) {
                        this.performCleanup();
                    }
                    return;
                }
            }
        }
        catch (error) {
            console.warn('Failed to load cache, will rebuild:', error);
        }
        this.validationCache.clear();
        this.correctionCache.clear();
    }
    saveCache() {
        if (!this.hasChanges) {
            return;
        }
        try {
            const cacheData = {
                validationCache: Object.fromEntries(this.validationCache),
                correctionCache: Object.fromEntries(this.correctionCache),
            };
            if (!(0, fs_1.existsSync)(this.cacheDir)) {
                (0, fs_1.mkdirSync)(this.cacheDir, { recursive: true });
            }
            (0, fs_1.writeFileSync)(this.cachePath, JSON.stringify(cacheData), 'utf8');
            this.hasChanges = false;
        }
        catch (error) {
            console.error('Failed to save spell checker cache:', error);
        }
    }
    getCurrentCacheSize() {
        const cacheData = {
            validationCache: Object.fromEntries(this.validationCache),
            correctionCache: Object.fromEntries(this.correctionCache)
        };
        return Buffer.byteLength(JSON.stringify(cacheData));
    }
    performCleanup() {
        const entries = [...this.validationCache.entries()];
        const keepCount = Math.floor(entries.length * 0.7);
        const entriesToKeep = entries.slice(-keepCount);
        this.validationCache.clear();
        entriesToKeep.forEach(([word, isValid]) => {
            this.validationCache.set(word, isValid);
        });
        const correctionEntries = [...this.correctionCache.entries()];
        const keepCorrections = correctionEntries.slice(-keepCount);
        this.correctionCache.clear();
        keepCorrections.forEach(([word, suggestions]) => {
            this.correctionCache.set(word, suggestions);
        });
        this.saveCache();
    }
    preloadCommonWords(spell) {
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
        this.hasChanges = true;
        if (this.getCurrentCacheSize() > this.maxCacheSize * this.cleanupThreshold) {
            this.performCleanup();
        }
        return isValid;
    }
    suggest(word) {
        if (this.correctionCache.has(word)) {
            return this.correctionCache.get(word);
        }
        const suggestions = this.spell.suggest(word);
        this.correctionCache.set(word, suggestions);
        this.hasChanges = true;
        if (this.getCurrentCacheSize() > this.maxCacheSize * this.cleanupThreshold) {
            this.performCleanup();
        }
        return suggestions;
    }
}
const spellChecker = SpellChecker.getInstance();
exports.spellChecker = spellChecker;
// Utility functions
const ignoreWords = new Set([
    'no', 'no.', 'vs', 'vs.', 'etc', 'etc.',
    'qty', 'ref', 'upc', 'sku', 'isbn', 'eol', 'msrp',
    'usb', 'hdmi', 'lcd', 'led', 'ac', 'dc', '3d', '4k',
    'uk', 'us', 'eu', 'ce', 'ul', 'iso', 'din', 'en'
]);
const numberPattern = /^(\d+\.?\d*|\d{4}|\d+["']?[DWHLdwhl]?)(%)?$/;
const properNounPattern = /^[A-Z][a-z]+$/;
const specialCharPattern = /[''\-™®©]/;
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function truncateContext(context, match) {
    const maxLength = 40;
    const matchIndex = context.indexOf(match);
    const start = Math.max(0, matchIndex - Math.floor((maxLength - match.length) / 2));
    const end = Math.min(context.length, matchIndex + match.length + Math.floor((maxLength - match.length) / 2));
    let truncatedContext = context.substring(start, end).trim();
    if (start > 0)
        truncatedContext = '.' + truncatedContext;
    if (end < context.length)
        truncatedContext += '.';
    return truncatedContext;
}
function getContext(text, matchIndex, matchLength) {
    const contextRadius = 15;
    const start = Math.max(0, matchIndex - contextRadius);
    const end = Math.min(text.length, matchIndex + matchLength + contextRadius);
    return text.substring(start, end);
}
function isBrandWord(word, brand) {
    if (!brand)
        return false;
    const wordLower = word.toLowerCase();
    const brandLower = brand.toLowerCase();
    return brandLower.includes(wordLower) || brandLower.split(/\s+/).includes(wordLower);
}
function checkSpelling(item) {
    if (!spellChecker.isReady()) {
        console.warn('Spell checker not ready');
        return [];
    }
    const isLikelyProperNoun = (word) => properNounPattern.test(word);
    const errors = [];
    const processedWords = new Map();
    function processField(fieldName) {
        const content = item[fieldName];
        if (typeof content !== 'string')
            return;
        if (!processedWords.has(fieldName)) {
            processedWords.set(fieldName, {
                field: fieldName,
                words: new Set(),
                contexts: []
            });
        }
        const fieldData = processedWords.get(fieldName);
        // Find all word positions
        let position = 0;
        const words = content.split(/\s+/);
        for (const word of words) {
            const cleanWord = word.replace(/^[^\w]+|[^\w]+$/g, '');
            if (!cleanWord ||
                cleanWord.length <= 2 ||
                ignoreWords.has(cleanWord.toLowerCase()) ||
                numberPattern.test(cleanWord) ||
                specialCharPattern.test(cleanWord) ||
                isBrandWord(cleanWord, item.brand || '')) {
                position = content.indexOf(word, position) + word.length;
                continue;
            }
            if (!spellChecker.correct(cleanWord) && !isLikelyProperNoun(cleanWord)) {
                const suggestions = spellChecker.suggest(cleanWord).slice(0, 3);
                if (suggestions.length > 0 && suggestions[0].toLowerCase() !== cleanWord.toLowerCase()) {
                    const wordIndex = content.indexOf(word, position);
                    fieldData.words.add(cleanWord);
                    fieldData.contexts.push({
                        word: cleanWord,
                        context: getContext(content, wordIndex, word.length),
                        suggestions,
                        position: wordIndex
                    });
                }
            }
            position = content.indexOf(word, position) + word.length;
        }
        // Sort contexts by position
        fieldData.contexts.sort((a, b) => a.position - b.position);
    }
    processField('title');
    processField('description');
    for (const [fieldName, data] of processedWords) {
        const { contexts } = data;
        if (contexts.length === 0)
            continue;
        const formattedContexts = contexts.map((ctx, index) => {
            const truncatedContext = truncateContext(ctx.context, ctx.word);
            // Only underline the current word
            const highlightedContext = truncatedContext.replace(new RegExp(`\\b${escapeRegExp(ctx.word)}\\b`), `{${ctx.word}}`);
            return contexts.length > 1
                ? `(case ${index + 1}) "${highlightedContext}" (Suggestions: ${ctx.suggestions.join(', ')})`
                : `"${highlightedContext}" (Suggestions: ${ctx.suggestions.join(', ')})`;
        });
        const misspelledWordsInOrder = contexts.map(ctx => ctx.word);
        errors.push({
            id: item.id || 'UNKNOWN',
            errorType: `Spelling Mistake in ${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)}`,
            details: `Found ${contexts.length} instance(s) of misspelled words in ${fieldName} (${misspelledWordsInOrder.join(', ')})`,
            affectedField: fieldName,
            value: formattedContexts.join('; ')
        });
    }
    return errors;
}
function checkTitleSpelling(item) {
    if (!item.title)
        return [];
    return checkSpelling(item).filter(error => error.errorType === 'Spelling Mistake in Title');
}
function checkDescriptionSpelling(item) {
    if (!item.description)
        return [];
    return checkSpelling(item).filter(error => error.errorType === 'Spelling Mistake in Description');
}
// Export these along with the original spellChecks
exports.spellingChecks = [
    checkTitleSpelling,
    checkDescriptionSpelling
];
exports.spellChecks = [checkSpelling];
