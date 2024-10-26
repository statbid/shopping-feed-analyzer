"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.wordSplitter = void 0;
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const SpellChecker_1 = require("./SpellChecker");
class WordSplitter {
    constructor() {
        this.maxCacheSize = 10 * 1024 * 1024; // 10MB
        this.cleanupThreshold = 0.8;
        this.commonParts = new Set([
            'able', 'less', 'ness', 'ment', 'ing', 'ed', 'ly', 'er', 'or',
            'anti', 'auto', 'de', 'dis', 'en', 'em', 'fore', 'in', 'im',
            'inter', 'mid', 'mis', 'non', 'over', 'pre', 'pro', 're', 'semi',
            'sub', 'super', 'trans', 'un', 'under'
        ]);
        this.splitCache = new Map();
        // Use the same cache directory as SpellChecker
        this.cacheDir = path_1.default.resolve(__dirname, '../.cache');
        this.cachePath = path_1.default.resolve(this.cacheDir, 'word-splitter-cache.json');
        console.log('Loading word splitter cache from:', this.cachePath);
        this.loadCache();
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
                    this.splitCache = new Map(Object.entries(cacheData.splitCache));
                    console.log(`Loaded ${this.splitCache.size} cached word splits`);
                    if (stats.size > this.maxCacheSize * this.cleanupThreshold) {
                        this.performCleanup();
                    }
                    return;
                }
            }
        }
        catch (error) {
            console.warn('Failed to load word splitter cache, will rebuild:', error);
        }
        this.splitCache.clear();
    }
    saveCache() {
        try {
            const cacheData = {
                splitCache: Object.fromEntries(this.splitCache),
                metadata: {
                    size: this.getCurrentCacheSize(),
                    wordCount: this.splitCache.size,
                    lastCleanup: Date.now()
                }
            };
            (0, fs_1.writeFileSync)(this.cachePath, JSON.stringify(cacheData), 'utf8');
            console.log(`Saved ${this.splitCache.size} word splits to cache`);
        }
        catch (error) {
            console.error('Failed to save word splitter cache:', error);
        }
    }
    getCurrentCacheSize() {
        const cacheData = {
            splitCache: Object.fromEntries(this.splitCache)
        };
        return Buffer.byteLength(JSON.stringify(cacheData));
    }
    performCleanup() {
        const entries = [...this.splitCache.entries()];
        const keepCount = Math.floor(entries.length * 0.7);
        const entriesToKeep = entries.slice(-keepCount);
        this.splitCache.clear();
        entriesToKeep.forEach(([word, split]) => {
            this.splitCache.set(word, split);
        });
        this.saveCache();
    }
    isValidWord(word) {
        if (word.length <= 2 || /[^a-zA-Z]/.test(word)) {
            return true;
        }
        return SpellChecker_1.spellChecker.correct(word.toLowerCase());
    }
    findSplit(word) {
        // Check cache first
        if (this.splitCache.has(word)) {
            return this.splitCache.get(word);
        }
        // Don't split if the whole word is valid
        if (this.isValidWord(word)) {
            this.splitCache.set(word, null);
            return null;
        }
        // Skip obvious cases
        if (word.length <= 5 || /[.,!?;:]/.test(word)) {
            this.splitCache.set(word, null);
            return null;
        }
        // Try all possible splits
        for (let i = 3; i < word.length - 2; i++) {
            const first = word.slice(0, i);
            const second = word.slice(i);
            // Skip if either part is in commonParts
            if (this.commonParts.has(first.toLowerCase()) || this.commonParts.has(second.toLowerCase())) {
                continue;
            }
            if (this.isValidWord(first) && this.isValidWord(second)) {
                const result = `${first} ${second}`;
                this.splitCache.set(word, result);
                // Save cache when it grows significantly
                if (this.splitCache.size % 500 === 0) {
                    this.saveCache();
                }
                return result;
            }
        }
        this.splitCache.set(word, null);
        return null;
    }
    static getInstance() {
        if (!WordSplitter.instance) {
            WordSplitter.instance = new WordSplitter();
        }
        return WordSplitter.instance;
    }
}
exports.wordSplitter = WordSplitter.getInstance();
