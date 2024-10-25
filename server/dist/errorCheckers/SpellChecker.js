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
// Singleton class for spell checker management
class SpellChecker {
    constructor() {
        this.maxCacheSize = 20 * 1024 * 1024; // 20MB in bytes
        this.cleanupThreshold = 0.8; // Cleanup at 80% capacity
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
            // Load or initialize cache
            this.loadCache();
            // Initialize spell checker
            const aff = (0, fs_1.readFileSync)(path_1.default.resolve(__dirname, '../dictionaries/en_US.aff'));
            const dic = (0, fs_1.readFileSync)(path_1.default.resolve(__dirname, '../dictionaries/en_US.dic'));
            const spell = (0, nspell_1.default)(aff, dic);
            // If cache is empty, preload common words
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
                    console.log(`Loaded ${this.validationCache.size} cached validations and ${this.correctionCache.size} cached corrections`);
                    // Check if cleanup is needed
                    if (stats.size > this.maxCacheSize * this.cleanupThreshold) {
                        this.performCleanup();
                    }
                    return;
                }
                console.log('Cache exceeds size limit, rebuilding...');
            }
        }
        catch (error) {
            console.warn('Failed to load cache, will rebuild:', error);
        }
        // Reset caches if loading failed or cache is too large
        this.validationCache.clear();
        this.correctionCache.clear();
    }
    saveCache() {
        try {
            const cacheData = {
                validationCache: Object.fromEntries(this.validationCache),
                correctionCache: Object.fromEntries(this.correctionCache),
                metadata: {
                    size: this.getCurrentCacheSize(),
                    wordCount: this.validationCache.size,
                    lastCleanup: Date.now()
                }
            };
            if (!(0, fs_1.existsSync)(this.cacheDir)) {
                (0, fs_1.mkdirSync)(this.cacheDir, { recursive: true });
            }
            (0, fs_1.writeFileSync)(this.cachePath, JSON.stringify(cacheData), 'utf8');
            console.log(`Saved ${this.validationCache.size} validations and ${this.correctionCache.size} corrections to cache`);
        }
        catch (error) {
            console.error('Failed to save cache:', error);
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
        console.log('Starting cache cleanup...');
        // Keep the most recent 70% of entries
        const entries = [...this.validationCache.entries()];
        const keepCount = Math.floor(entries.length * 0.7);
        const entriesToKeep = entries.slice(-keepCount);
        this.validationCache.clear();
        entriesToKeep.forEach(([word, isValid]) => {
            this.validationCache.set(word, isValid);
        });
        // Also cleanup correction cache
        const correctionEntries = [...this.correctionCache.entries()];
        const keepCorrections = correctionEntries.slice(-keepCount);
        this.correctionCache.clear();
        keepCorrections.forEach(([word, suggestions]) => {
            this.correctionCache.set(word, suggestions);
        });
        this.saveCache();
        console.log(`Cleanup complete. Kept ${keepCount} entries`);
    }
    preloadCommonWords(spell) {
        const commonWords = [
            'product', 'quality', 'premium', 'warranty', 'shipping',
            'available', 'includes', 'features', 'material', 'color',
            'size', 'weight', 'height', 'width', 'length',
            'package', 'content', 'delivery', 'brand', 'model',
            'series', 'version', 'type', 'style', 'design'
        ];
        console.log('Preloading common words...');
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
        // Check size and cleanup if needed
        if (this.getCurrentCacheSize() > this.maxCacheSize * this.cleanupThreshold) {
            this.performCleanup();
        }
        // Save cache periodically
        if (this.validationCache.size % 1000 === 0) {
            this.saveCache();
        }
        return isValid;
    }
    suggest(word) {
        if (this.correctionCache.has(word)) {
            return this.correctionCache.get(word);
        }
        const suggestions = this.spell.suggest(word);
        this.correctionCache.set(word, suggestions);
        // Check size and cleanup if needed
        if (this.getCurrentCacheSize() > this.maxCacheSize * this.cleanupThreshold) {
            this.performCleanup();
        }
        // Save cache periodically
        if (this.correctionCache.size % 1000 === 0) {
            this.saveCache();
        }
        return suggestions;
    }
    saveCurrentCache() {
        this.saveCache();
    }
    getCacheStats() {
        return {
            size: this.getCurrentCacheSize(),
            maxSize: this.maxCacheSize,
            utilizationPercentage: (this.getCurrentCacheSize() / this.maxCacheSize) * 100,
            validationEntries: this.validationCache.size,
            correctionEntries: this.correctionCache.size
        };
    }
}
// Initialize the singleton instance
const spellChecker = SpellChecker.getInstance();
// Word processing utilities
const ignoreWords = new Set([
    'no', 'no.', 'vs', 'vs.', 'etc', 'etc.',
    'qty', 'ref', 'upc', 'sku', 'isbn', 'eol', 'msrp',
    'usb', 'hdmi', 'lcd', 'led', 'ac', 'dc', '3d', '4k',
    'uk', 'us', 'eu', 'ce', 'ul', 'iso', 'din', 'en'
]);
const numberPattern = /^(\d+\.?\d*|\d{4}|\d+["']?[DWHLdwhl]?)(%)?$/;
const properNounPattern = /^[A-Z][a-z]+$/;
const specialCharPattern = /[''\-™®©]/;
const isNumber = (word) => numberPattern.test(word.replace(/[,]/g, '').replace(/[%$]/g, ''));
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
function checkSpelling(item) {
    if (!spellChecker.isReady()) {
        console.warn('Spell checker not ready');
        return [];
    }
    const errors = [];
    const seenWords = new Set();
    function processWord(word, fieldName) {
        if (seenWords.has(word))
            return;
        seenWords.add(word);
        const originalWord = word;
        word = word.replace(/^[^\w]+|[^\w]+$/g, '');
        if (word.length === 0)
            return;
        // Quick filters
        if (word.length <= 2 ||
            ignoreWords.has(word.toLowerCase()) ||
            isNumber(word) ||
            isSpecialCase(word) ||
            isBrandWord(word, item.brand || '')) {
            return;
        }
        // Spell check
        if (!spellChecker.correct(word) && !isLikelyProperNoun(word)) {
            const suggestions = spellChecker.suggest(word).slice(0, 3);
            if (suggestions.length > 0 && suggestions[0].toLowerCase() !== word.toLowerCase()) {
                errors.push({
                    id: item.id || 'UNKNOWN',
                    errorType: `Spelling Error in ${fieldName}`,
                    details: `Misspelled word found: "${originalWord}"`,
                    affectedField: fieldName,
                    value: `${originalWord} (Suggestion: ${suggestions.join(', ')})`
                });
            }
        }
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
