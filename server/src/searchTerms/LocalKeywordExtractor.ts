import { FeedItem, SearchTerm, KeywordScore } from '../types';
import { WordTokenizer, TfIdf } from 'natural';
import * as stopword from 'stopword';

export class LocalKeywordExtractor {
  private readonly tokenizer: WordTokenizer;
  private readonly tfidf: TfIdf;
  private productMap: Map<string, FeedItem[]>;
  private customStopwords: Set<string>;
  
  constructor() {
    this.tokenizer = new WordTokenizer();
    this.tfidf = new TfIdf();
    this.productMap = new Map();
    this.customStopwords = new Set(stopword.eng);

    // Initialize custom stopwords specific to product feeds
    this.addCustomStopwords([
      'product', 'item', 'feature', 'features', 'include', 'includes',
      'including', 'new', 'quality', 'set', 'use', 'using', 'used',
      'made', 'design', 'designed', 'perfect', 'great', 'best',
      'available', 'shipping', 'warranty'
    ]);
  }

  private addCustomStopwords(words: string[]): void {
    words.forEach(word => this.customStopwords.add(word.toLowerCase()));
  }

  private preprocessText(text: string): string[] {
    const cleaned = text.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const tokens = this.tokenizer.tokenize(cleaned) || [];
    
    return tokens
      .filter(token => token.length > 2)
      .filter(token => !this.customStopwords.has(token));
  }

  private calculateNGrams(tokens: string[], n: number): string[] {
    const ngrams: string[] = [];
    for (let i = 0; i <= tokens.length - n; i++) {
      ngrams.push(tokens.slice(i, i + n).join(' '));
    }
    return ngrams;
  }

  private async extractKeywords(items: FeedItem[]): Promise<Map<string, FeedItem[]>> {
    // Clear previous data
    while (this.tfidf.documents.length > 0) {
      this.tfidf.documents.pop();
    }
    this.productMap.clear();

    // First pass: Add all descriptions to TF-IDF
    items.forEach(item => {
      if (!item.description) return;
      
      const tokens = this.preprocessText(item.description);
      const terms = [
        ...tokens,
        ...this.calculateNGrams(tokens, 2)
      ];
      
      this.tfidf.addDocument(terms);
    });

    // Second pass: Extract significant terms
    items.forEach((item, index) => {
      if (!item.description) return;

      const tokens = this.preprocessText(item.description);
      const terms = [
        ...tokens,
        ...this.calculateNGrams(tokens, 2)
      ];

      const termScores: KeywordScore[] = terms.map(term => ({
        term,
        score: this.tfidf.tfidf(term, index)
      }));

      const significantTerms = termScores
        .filter(({ score }) => score > 0.5)
        .sort((a, b) => b.score - a.score)
        .map(({ term }) => term);

      significantTerms.forEach(term => {
        if (!this.productMap.has(term)) {
          this.productMap.set(term, []);
        }
        this.productMap.get(term)!.push(item);
      });
    });

    return new Map(
      Array.from(this.productMap.entries())
        .filter(([_, items]) => items.length >= 5)
    );
  }

  public async extractSearchTerms(
    items: FeedItem[],
    existingTerms: Set<string>
  ): Promise<SearchTerm[]> {
    const keywordMatches = await this.extractKeywords(items);
    const results: SearchTerm[] = [];

    keywordMatches.forEach((matchedItems, keyword) => {
      if (existingTerms.has(keyword)) return;

      const sampleItem = matchedItems[0];
      results.push({
        id: sampleItem.id,
        productName: sampleItem.title || '',
        searchTerm: keyword,
        pattern: `Description-based (${matchedItems.length} products)`,
        estimatedVolume: this.calculateEstimatedVolume(matchedItems.length)
      });
    });

    return results;
  }

  private calculateEstimatedVolume(matchCount: number): number {
    const baseVolume = matchCount * 8;
    const multiplier = Math.log10(matchCount + 1);
    return Math.round(baseVolume * multiplier);
  }
}