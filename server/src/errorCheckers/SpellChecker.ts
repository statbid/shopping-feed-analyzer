import { FeedItem, ErrorResult } from '../types';
import nspell from 'nspell';
import { readFileSync } from 'fs';
import path from 'path';

// Singleton class for spell checker management
class SpellChecker {
  private static instance: SpellChecker;
  private spell: ReturnType<typeof nspell>;
  private correctionCache: Map<string, string[]>;
  private validationCache: Map<string, boolean>;
  private ready: boolean;

  private constructor() {
    this.correctionCache = new Map();
    this.validationCache = new Map();
    this.ready = false;
    this.spell = this.initializeSpellChecker();
  }

  private initializeSpellChecker(): ReturnType<typeof nspell> {
    console.log('Initializing spell checker...');
    const startTime = Date.now();

    try {
      const aff = readFileSync(path.resolve(__dirname, '../dictionaries/en_US.aff'));
      const dic = readFileSync(path.resolve(__dirname, '../dictionaries/en_US.dic'));
      const spell = nspell(aff, dic);

      // Pre-cache common words
      this.preloadCommonWords(spell);

      const endTime = Date.now();
      console.log(`Spell checker initialized in ${endTime - startTime}ms`);
      this.ready = true;
      return spell;
    } catch (error) {
      console.error('Failed to initialize spell checker:', error);
      throw error;
    }
  }

  private preloadCommonWords(spell: ReturnType<typeof nspell>): void {
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
    return isValid;
  }

  public suggest(word: string): string[] {
    if (this.correctionCache.has(word)) {
      return this.correctionCache.get(word)!;
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
  'qty', 'ref', 'upc', 'sku', 'isbn', 'eol', 'msrp',
  'usb', 'hdmi', 'lcd', 'led', 'ac', 'dc', '3d', '4k',
  'uk', 'us', 'eu', 'ce', 'ul', 'iso', 'din', 'en'
]);

// Regex patterns compiled once
const numberPattern = /^(\d+\.?\d*|\d{4}|\d+["']?[DWHLdwhl]?)(%)?$/;
const properNounPattern = /^[A-Z][a-z]+$/;
const specialCharPattern = /[''\-™®©]/;

// Optimized helper functions
const isNumber = (word: string): boolean => 
  numberPattern.test(word.replace(/[,]/g, '').replace(/[%$]/g, ''));

const isLikelyProperNoun = (word: string): boolean => 
  properNounPattern.test(word);

const isSpecialCase = (word: string): boolean => 
  specialCharPattern.test(word) || word.startsWith("'") || word.endsWith("'");

const isBrandWord = (word: string, brand: string): boolean => {
  if (!brand) return false;
  const wordLower = word.toLowerCase();
  const brandLower = brand.toLowerCase();
  if (brandLower.includes(wordLower)) return true;
  return brand.toLowerCase().split(/\s+/).includes(wordLower);
};

// Word processing cache
const processedWords = new Map<string, boolean>();

export function checkSpelling(item: FeedItem): ErrorResult[] {
  if (!spellChecker.isReady()) {
    console.warn('Spell checker not ready');
    return [];
  }

  const errors: ErrorResult[] = [];
  const seenWords = new Set<string>();

  function processWord(word: string, fieldName: string): void {
    // Skip if word already processed in this item
    if (seenWords.has(word)) return;
    seenWords.add(word);

    // Save original word for error reporting
    const originalWord = word;

    // Normalize the word by removing leading and trailing punctuation
    word = word.replace(/^[^\w]+|[^\w]+$/g, '');

    if (word.length === 0) return; // skip empty words

    // Check process cache
    const cacheKey = `${word}:${item.brand || ''}`;
    if (processedWords.has(cacheKey)) {
      const shouldSkip = processedWords.get(cacheKey);
      if (shouldSkip) return;
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
          details: `Misspelled word found: "${originalWord}"`,
          affectedField: fieldName,
          value: `${originalWord} (Suggestion: ${suggestions.join(', ')})`
        });
      }
    }

    processedWords.set(cacheKey, false);
  }

  function checkField(fieldName: 'title' | 'description'): void {
    const content = item[fieldName];
    if (typeof content === 'string') {
      content.split(/\s+/).forEach(word => processWord(word, fieldName));
    }
  }

  checkField('title');
  checkField('description');

  return errors;
}

export const spellChecks = [checkSpelling];
