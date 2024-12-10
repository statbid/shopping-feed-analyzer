/**
 * Spelling Checker
 *
 * This file implements spelling validation for product data fields like `title` and `description`.
 * It uses the `nspell` library for spell-checking, provides caching for optimization, and includes
 * utility functions to filter and process words for spell-checking.
 *
 * Classes:
 * - `SpellChecker`: Singleton class for managing spell-check operations, caching results, and
 *   optimizing performance.
 *
 * Functions:
 * - `checkSpelling`: Main function to validate spelling in fields like `title` and `description`.
 * - `checkTitleSpelling`: Validates spelling in the `title` field.
 * - `checkDescriptionSpelling`: Validates spelling in the `description` field.
 * - `shouldCheckWord`: Determines whether a word should be spell-checked.
 * - `getContext`: Retrieves contextual text around a word match.
 * - `truncateContext`: Shortens the context for reporting.
 * - `isLikelyProperNoun`: Identifies proper nouns to avoid unnecessary checks.
 *
 * Constants:
 * - `spellingChecks`: Array of field-specific spell-check functions.
 * - `spellChecks`: Array of general spell-check functions.
 * - `spellChecker`: Instance of the `SpellChecker` singleton.
 *
 * Features:
 * - Spell-checks words in the `title` and `description` fields, filtering out proper nouns,
 *   special characters, and other exceptions.
 * - Provides suggestions for misspelled words.
 * - Includes contextual information about spelling errors in error reports.
 * - Caches results for improved performance and supports preloading common words.
 * - Cleans up cache when it exceeds a defined size threshold.
 */


import { FeedItem, ErrorResult } from '@shopping-feed/types';
import nspell from 'nspell';
import { readFileSync, writeFileSync, existsSync, mkdirSync, statSync } from 'fs';
import environment from '../config/environment';
import { shouldSpellCheck } from '../utils/constants';

import path from 'path';


export interface ISpellChecker {
  isReady(): boolean;
  correct(word: string): boolean;
  suggest(word: string): string[];
  saveCache(): void;
}

interface CacheData {
  validationCache: { [key: string]: boolean };
  correctionCache: { [key: string]: string[] };
}

// Singleton class for spell checker management
class SpellChecker implements ISpellChecker {
  private static instance: SpellChecker;
  private spell: ReturnType<typeof nspell>;
  private correctionCache: Map<string, string[]>;
  private validationCache: Map<string, boolean>;
  private ready: boolean;
  private cacheDir: string;
  private cachePath: string;
  private maxCacheSize: number = 20 * 1024 * 1024; // 20MB in bytes
  private cleanupThreshold: number = 0.8; // Cleanup at 80% capacity
  private hasChanges: boolean = false; // Added hasChanges property

  private constructor() {
    this.correctionCache = new Map();
    this.validationCache = new Map();
    this.ready = false;
    this.cacheDir = environment.storage.cacheDir;
    this.cachePath = path.resolve(this.cacheDir, 'spell-checker-cache.json');
    this.spell = this.initializeSpellChecker();
  }

  private initializeSpellChecker(): ReturnType<typeof nspell> {
   
    const startTime = Date.now();

    try {
      this.loadCache();
      const aff = readFileSync(path.resolve(environment.storage.dictionariesDir, 'en_US.aff'));
      const dic = readFileSync(path.resolve(environment.storage.dictionariesDir, 'en_US.dic'));
      const spell = nspell(aff, dic);

      if (this.correctionCache.size === 0) {
        this.preloadCommonWords(spell);
        this.saveCache();
      }

      const endTime = Date.now();
      
      this.ready = true;
      return spell;
    } catch (error) {
      console.error('Failed to initialize spell checker:', error);
      throw error;
    }
  }

  private loadCache(): void {
    try {
      if (!existsSync(this.cacheDir)) {
        mkdirSync(this.cacheDir, { recursive: true });
      }

      if (existsSync(this.cachePath)) {
        const stats = statSync(this.cachePath);
        if (stats.size <= this.maxCacheSize) {
          const cacheData: CacheData = JSON.parse(readFileSync(this.cachePath, 'utf8'));
          this.validationCache = new Map(Object.entries(cacheData.validationCache));
          this.correctionCache = new Map(Object.entries(cacheData.correctionCache));
          
          if (stats.size > this.maxCacheSize * this.cleanupThreshold) {
            this.performCleanup();
          }
          return;
        }
      }
    } catch (error) {
      console.warn('Failed to load cache, will rebuild:', error);
    }

    this.validationCache.clear();
    this.correctionCache.clear();
  }

  public saveCache(): void {
    if (!this.hasChanges) {
      
      return;
    }

    
    try {
      const cacheData: CacheData = {
        validationCache: Object.fromEntries(this.validationCache),
        correctionCache: Object.fromEntries(this.correctionCache),
   
      };

      if (!existsSync(this.cacheDir)) {
        mkdirSync(this.cacheDir, { recursive: true });
      }

      writeFileSync(this.cachePath, JSON.stringify(cacheData), 'utf8');
     
      
      this.hasChanges = false;
    } catch (error) {
      console.error('Failed to save spell checker cache:', error);
    }
  }



  private getCurrentCacheSize(): number {
    const cacheData = {
      validationCache: Object.fromEntries(this.validationCache),
      correctionCache: Object.fromEntries(this.correctionCache)
    };
    return Buffer.byteLength(JSON.stringify(cacheData));
  }

  private performCleanup(): void {
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

  private preloadCommonWords(spell: ReturnType<typeof nspell>): void {
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

  public static getInstance(): SpellChecker {
    if (!SpellChecker.instance) {
      SpellChecker.instance = new SpellChecker();
    }
    return SpellChecker.instance;
  }

  public isReady(): boolean {
    return this.ready;
  }

  public correct(word: string): boolean {
   

  if (this.validationCache.has(word)) {
     
      return this.validationCache.get(word)!;
    }

  
    const isValid = this.spell.correct(word);
    this.validationCache.set(word, isValid);
    this.hasChanges = true;
  
    
    if (this.getCurrentCacheSize() > this.maxCacheSize * this.cleanupThreshold) {
      this.performCleanup();
    }
    
    return isValid;
  }

  

  public suggest(word: string): string[] {
    if (this.correctionCache.has(word)) {
      return this.correctionCache.get(word)!;
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

// Utility functions
const ignoreWords = new Set([
  'no', 'no.', 'vs', 'vs.', 'etc', 'etc.',
  'qty', 'ref', 'upc', 'sku', 'isbn', 'eol', 'msrp',
  'usb', 'hdmi', 'lcd', 'led', 'ac', 'dc', '3d', '4k',
  'uk', 'us', 'eu', 'ce', 'ul', 'iso', 'din', 'en',
  'PC'  
]);

const numberPattern = /^(\d+\.?\d*|\d{4}|\d+["']?[DWHLdwhl]?)(%)?$/;
const properNounPattern = /^[A-Z][a-z]+$/;
const specialCharPattern = /[''\-™®©]/;
const fractionPattern = /^\d+\/\d+$/;
const measurementPattern = /^\d+([\/\-]?\d*)?(cm|mm|m|in|ft|oz|lb|kg|g|ml|l)$/i;



function isLikelyProperNoun(word: string): boolean {
  return properNounPattern.test(word) || word.split(/[\s-]/).every(part => 
    properNounPattern.test(part) || part.toUpperCase() === part
  );
}


function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function truncateContext(context: string, match: string): string {
  const maxLength = 40;
  const matchIndex = context.indexOf(match);
  const start = Math.max(0, matchIndex - Math.floor((maxLength - match.length) / 2));
  const end = Math.min(context.length, matchIndex + match.length + Math.floor((maxLength - match.length) / 2));
  let truncatedContext = context.substring(start, end).trim();
  if (start > 0) truncatedContext = '.' + truncatedContext;
  if (end < context.length) truncatedContext += '.';
  return truncatedContext;
}

function getContext(text: string, matchIndex: number, matchLength: number): string {
  const contextRadius = 15;
  const start = Math.max(0, matchIndex - contextRadius);
  const end = Math.min(text.length, matchIndex + matchLength + contextRadius);
  return text.substring(start, end);
}

function isBrandWord(word: string, brand: string): boolean {
  if (!brand) return false;
  const wordLower = word.toLowerCase();
  const brandLower = brand.toLowerCase();
  return brandLower.includes(wordLower) || brandLower.split(/\s+/).includes(wordLower);
}

interface FieldData {
  field: string;
  words: Set<string>;
  contexts: Array<{
    word: string;
    context: string;
    suggestions: string[];
    position: number;
  }>;
}


function shouldCheckWord(word: string, brand?: string): boolean {
  const cleanWord = word.trim();
  
  // Skip empty words and short words
  if (!cleanWord || cleanWord.length <= 2) return false;
  
  // Skip ignored words
  if (ignoreWords.has(cleanWord) || ignoreWords.has(cleanWord.toLowerCase())) return false;
  
  // Skip fractions (e.g., "3/4")
  if (fractionPattern.test(cleanWord)) return false;
  
  // Skip measurements with units
  if (measurementPattern.test(cleanWord)) return false;
  
  // Skip numbers and percentages
  if (numberPattern.test(cleanWord)) return false;
  
  // Skip brand words
  if (brand && isBrandWord(cleanWord, brand)) return false;
  
  // Skip special characters
  if (specialCharPattern.test(cleanWord)) return false;

  return true;
}


export function checkSpelling(item: FeedItem): ErrorResult[] {
  if (!spellChecker.isReady()) {
    console.warn('Spell checker not ready');
    return [];
  }

  const errors: ErrorResult[] = [];
  const processedWords = new Map<string, FieldData>();

  function processField(fieldName: 'title' | 'description'): void {
    const content = item[fieldName];
    if (typeof content !== 'string') return;

    if (!processedWords.has(fieldName)) {
      processedWords.set(fieldName, {
        field: fieldName,
        words: new Set(),
        contexts: []
      });
    }

    const fieldData = processedWords.get(fieldName)!;

    let position = 0;
    const words = content.split(/\s+/);
    
    for (const word of words) {
      const cleanWord = word.replace(/^[^\w]+|[^\w]+$/g, '');
      
      if (!shouldCheckWord(cleanWord, item.brand)) {
        position = content.indexOf(word, position) + word.length;
        continue;
      }

      // Special case for PC uppercase
      if (cleanWord === 'PC') {
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

    fieldData.contexts.sort((a, b) => a.position - b.position);
  }

  processField('title');
  processField('description');

  for (const [fieldName, data] of processedWords) {
    const { contexts } = data;
    if (contexts.length === 0) continue;

    const formattedContexts = contexts.map((ctx, index) => {
      const truncatedContext = truncateContext(ctx.context, ctx.word);
      const highlightedContext = truncatedContext.replace(
        new RegExp(`\\b${escapeRegExp(ctx.word)}\\b`),
        `{${ctx.word}}`
      );
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





export function checkTitleSpelling(item: FeedItem): ErrorResult[] {
  if (!item.title) return [];
  return checkSpelling(item).filter(error => 
    error.errorType === 'Spelling Mistake in Title'
  );
}

export function checkDescriptionSpelling(item: FeedItem): ErrorResult[] {
  if (!item.description) return [];
  return checkSpelling(item).filter(error => 
    error.errorType === 'Spelling Mistake in Description'
  );
}

// Export these along with the original spellChecks
export const spellingChecks = [
  checkTitleSpelling,
  checkDescriptionSpelling
];

export const spellChecks = [checkSpelling];
export { spellChecker };