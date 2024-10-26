import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'fs';
import path from 'path';
import { spellChecker } from './SpellChecker';

interface SplitCacheData {
  splitCache: { [key: string]: string | null };
  metadata: {
    size: number;
    wordCount: number;
    lastCleanup: number;
  };
}

class WordSplitter {
  private static instance: WordSplitter;
  private splitCache: Map<string, string | null>;
  private cacheDir: string;
  private cachePath: string;
  private maxCacheSize: number = 10 * 1024 * 1024; // 10MB
  private cleanupThreshold: number = 0.8;
  private hasChanges: boolean = false;

  private commonParts = new Set([
    'able', 'less', 'ness', 'ment', 'ing', 'ed', 'ly', 'er', 'or',
    'anti', 'auto', 'de', 'dis', 'en', 'em', 'fore', 'in', 'im',
    'inter', 'mid', 'mis', 'non', 'over', 'pre', 'pro', 're', 'semi',
    'sub', 'super', 'trans', 'un', 'under'
  ]);

  private constructor() {
    this.splitCache = new Map();
    this.cacheDir = path.resolve(__dirname, '../.cache');
    this.cachePath = path.resolve(this.cacheDir, 'word-splitter-cache.json');
    
    console.log('Word splitter cache directory:', this.cacheDir);
    console.log('Word splitter cache file:', this.cachePath);
    
    this.loadCache();
  }

  private loadCache(): void {
    try {
      if (!existsSync(this.cacheDir)) {
        console.log('Creating cache directory:', this.cacheDir);
        mkdirSync(this.cacheDir, { recursive: true });
      }

      if (existsSync(this.cachePath)) {
        console.log('Found existing cache file');
        const stats = statSync(this.cachePath);
        if (stats.size <= this.maxCacheSize) {
          const cacheData: SplitCacheData = JSON.parse(readFileSync(this.cachePath, 'utf8'));
          this.splitCache = new Map(Object.entries(cacheData.splitCache));
          console.log(`Loaded ${this.splitCache.size} cached word splits`);
          
          if (stats.size > this.maxCacheSize * this.cleanupThreshold) {
            this.performCleanup();
          }
          return;
        }
      } else {
        console.log('No cache file found, will create new one');
      }
    } catch (error) {
      console.warn('Failed to load word splitter cache:', error);
    }

    this.splitCache.clear();
  }

  private saveCache(): void {
    try {
      console.log('Saving word splitter cache...');
      const cacheData: SplitCacheData = {
        splitCache: Object.fromEntries(this.splitCache),
        metadata: {
          size: this.getCurrentCacheSize(),
          wordCount: this.splitCache.size,
          lastCleanup: Date.now()
        }
      };

      if (!existsSync(this.cacheDir)) {
        mkdirSync(this.cacheDir, { recursive: true });
      }

      writeFileSync(this.cachePath, JSON.stringify(cacheData, null, 2));
      console.log(`Saved ${this.splitCache.size} word splits to cache`);
      this.hasChanges = false;
    } catch (error) {
      console.error('Failed to save word splitter cache:', error);
    }
  }

  private getCurrentCacheSize(): number {
    const cacheData = {
      splitCache: Object.fromEntries(this.splitCache)
    };
    return Buffer.byteLength(JSON.stringify(cacheData));
  }

  private performCleanup(): void {
    console.log('Performing cache cleanup...');
    const entries = [...this.splitCache.entries()];
    const keepCount = Math.floor(entries.length * 0.7);
    const entriesToKeep = entries.slice(-keepCount);

    this.splitCache.clear();
    entriesToKeep.forEach(([word, split]) => {
      this.splitCache.set(word, split);
    });

    this.hasChanges = true;
    this.saveCache();
  }

  private isValidWord(word: string): boolean {
    if (word.length <= 2 || /[^a-zA-Z]/.test(word)) {
      return true;
    }
    return spellChecker.correct(word.toLowerCase());
  }

  public findSplit(word: string): string | null {
    // Check cache first
    if (this.splitCache.has(word)) {
      return this.splitCache.get(word)!;
    }

    // Don't split if the whole word is valid
    if (this.isValidWord(word)) {
      this.splitCache.set(word, null);
      this.hasChanges = true;
      return null;
    }

    // Skip obvious cases
    if (word.length <= 5 || /[.,!?;:]/.test(word)) {
      this.splitCache.set(word, null);
      this.hasChanges = true;
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
        this.hasChanges = true;
        
        // Force save after finding first split
        if (this.splitCache.size === 1) {
          console.log('Found first split, creating initial cache file');
          this.saveCache();
        }
        // Regular periodic saves
        else if (this.splitCache.size % 100 === 0) {
          this.saveCache();
        }

        return result;
      }
    }

    this.splitCache.set(word, null);
    this.hasChanges = true;
    return null;
  }

  public static getInstance(): WordSplitter {
    if (!WordSplitter.instance) {
      WordSplitter.instance = new WordSplitter();
    }
    return WordSplitter.instance;
  }

  // Force save any pending changes when the analysis is complete
  public saveChanges(): void {
    if (this.hasChanges) {
      console.log('Saving pending changes to cache');
      this.saveCache();
    }
  }
}

export const wordSplitter = WordSplitter.getInstance();

// Make sure to save any pending changes when the process exits
process.on('beforeExit', () => {
  wordSplitter.saveChanges();
});