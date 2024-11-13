import { FeedItem, SearchTerm, SearchTermMatch } from '../types';
import { WordTokenizer, TfIdf } from 'natural';
import * as stopword from 'stopword';

interface KeywordScore {
  term: string;
  score: number;
}

export class SearchTermsAnalyzer {
  private readonly tokenizer: WordTokenizer;
  private readonly tfidf: TfIdf;
  private customStopwords: Set<string>;
  
  constructor() {
    this.tokenizer = new WordTokenizer();
    this.tfidf = new TfIdf();
    this.customStopwords = new Set(stopword.eng);
    
    this.addCustomStopwords([
      'product', 'item', 'feature', 'features', 'include', 'includes',
      'including', 'new', 'quality', 'set', 'use', 'using', 'used',
      'made', 'design', 'designed', 'perfect', 'great', 'best',
      'available', 'shipping', 'warranty', 'the', 'and', 'or', 'with',
      'without', 'this', 'that', 'these', 'those', 'our', 'your'
    ]);
  }

  private addCustomStopwords(words: string[]): void {
    words.forEach(word => this.customStopwords.add(word.toLowerCase()));
  }

  private cleanValue(value: string | undefined): string | undefined {
    if (!value) return undefined;
    return value
      .toLowerCase()
      .replace(/[\/\\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isQualitySearchPhrase(phrase: string): boolean {
    const stopWords = new Set([
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to',
      'for', 'of', 'with', 'by', 'from', 'this', 'that', 'these', 'those'
    ]);

    const words = phrase.split(' ');
    if (stopWords.has(words[0]) || stopWords.has(words[words.length - 1])) {
      return false;
    }

    const genericPhrases = new Set([
      'high quality', 'best quality', 'great quality',
      'free shipping', 'fast shipping', 'available in',
      'made with', 'made from', 'designed for',
      'perfect for', 'ideal for', 'great for',
      'easy to', 'ready to'
    ]);

    if (genericPhrases.has(phrase)) {
      return false;
    }

    const descriptiveWords = new Set([
      'premium', 'luxury', 'professional', 'adjustable', 'wireless',
      'waterproof', 'durable', 'portable', 'lightweight', 'ergonomic',
      'innovative', 'advanced', 'modern', 'classic', 'authentic',
      'genuine', 'custom', 'exclusive', 'elite', 'compact',
      'digital', 'automatic', 'manual', 'electric', 'smart',
      'traditional', 'contemporary', 'efficient', 'versatile'
    ]);

    const hasDescriptiveWord = words.some(word => descriptiveWords.has(word));
    const categoryWords = new Set([
      'shoes', 'clothing', 'apparel', 'accessories', 'equipment',
      'gear', 'tools', 'devices', 'furniture', 'electronics',
      'supplies', 'parts', 'components', 'system', 'kit'
    ]);

    const hasCategoryWord = words.some(word => categoryWords.has(word));
    const containsNumber = /\d+/.test(phrase);
    const containsSize = /\b(small|medium|large|xl|xxl)\b/i.test(phrase);
    const containsMeasurement = /\b(inch|cm|mm|ft|meter)\b/i.test(phrase);

    return (hasDescriptiveWord || hasCategoryWord || containsNumber || 
            containsSize || containsMeasurement) && words.length >= 2;
  }

  private preprocessText(text: string): string[] {
    if (!text) return [];

    const cleaned = text.toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();

    const segments = cleaned.split(/[.!?;,]/)
      .map(s => s.trim())
      .filter(s => s.length > 5);

    const phrases = new Set<string>();
    
    segments.forEach(segment => {
      const words = segment.split(/\s+/)
        .filter(w => w.length > 2)
        .filter(w => !this.customStopwords.has(w));

      for (let len = 2; len <= 4; len++) {
        for (let i = 0; i <= words.length - len; i++) {
          const phrase = words.slice(i, i + len).join(' ');
          if (phrase && !this.customStopwords.has(phrase)) {
            phrases.add(phrase);
          }
        }
      }
    });

    return Array.from(phrases);
  }

  private clearTfIdf(): void {
    while (this.tfidf.documents.length > 0) {
      this.tfidf.documents.pop();
    }
  }

  private async extractDescriptionKeywords(items: FeedItem[]): Promise<Map<string, FeedItem[]>> {
    this.clearTfIdf();
    const keywordMap = new Map<string, FeedItem[]>();
    console.log('Processing descriptions for keyword extraction...');

    let validDocuments = 0;
    items.forEach(item => {
      if (!item.description) return;
      
      const cleanText = item.description
        .toLowerCase()
        .replace(/[^\w\s-]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      if (cleanText) {
        this.tfidf.addDocument(cleanText);
        validDocuments++;
      }
    });

    console.log(`Processing ${validDocuments} valid documents for phrase extraction...`);

    const phraseProducts = new Map<string, Set<FeedItem>>();

    items.forEach((item, docIndex) => {
      if (!item.description) return;

      const description = item.description.toLowerCase();
      const segments = description
        .split(/[.!?;,]/)
        .map(s => s.trim())
        .filter(s => s.length > 5);

      segments.forEach(segment => {
        const words = segment
          .split(/\s+/)
          .filter(w => w.length > 2)
          .filter(w => !/^\d+$/.test(w));

        for (let len = 2; len <= 4; len++) {
          for (let i = 0; i <= words.length - len; i++) {
            const phrase = words.slice(i, i + len).join(' ');
            if (phrase.length < 5) continue;

            const score = this.tfidf.tfidf(phrase, docIndex);
            
            if (score > 0.3) {
              if (!phraseProducts.has(phrase)) {
                phraseProducts.set(phrase, new Set());
              }
              phraseProducts.get(phrase)!.add(item);
            }
          }
        }
      });
    });

    phraseProducts.forEach((products, phrase) => {
      if (products.size >= 5 && this.isQualitySearchPhrase(phrase)) {
        keywordMap.set(phrase, Array.from(products));
      }
    });

    console.log(`Found ${keywordMap.size} potential description-based keywords`);
    return keywordMap;
  }

  private getAttributeCombinations(items: FeedItem[]): Map<string, SearchTermMatch> {
    const combinations = new Map<string, SearchTermMatch>();
    console.log(`Processing ${items.length} items for attribute combinations...`);

    items.forEach(item => {
      const attributes = [
        { value: this.cleanValue(item.brand), type: 'Brand' },
        { value: this.cleanValue(item.color), type: 'Color' },
        { value: this.cleanValue(item.gender), type: 'Gender' },
        { value: this.cleanValue(item.age_group), type: 'Age Group' },
        { value: this.cleanValue(item.size), type: 'Size' },
        { value: this.cleanValue(item.material), type: 'Material' },
        { value: this.cleanValue(item.pattern), type: 'Pattern' },
        { value: this.cleanValue(item.product_type?.split('>').pop()), type: 'Product Type' },
        { value: this.cleanValue(item.google_product_category?.split('>').pop()), type: 'Category' }
      ].filter((attr): attr is { value: string; type: string } => attr.value !== undefined);

      this.generateCombinations(attributes).forEach(combination => {
        const searchTerm = this.createSearchTerm(combination);
        const pattern = combination.map(c => c.type).join(' + ');

        if (!combinations.has(searchTerm)) {
          combinations.set(searchTerm, { items: [], pattern });
        }
        combinations.get(searchTerm)!.items.push(item);
      });
    });

    const filteredCombinations = new Map(
      Array.from(combinations.entries())
        .filter(([_, data]) => data.items.length >= 5)
    );

    console.log(`Generated ${filteredCombinations.size} valid attribute combinations`);
    return filteredCombinations;
  }

  private createSearchTerm(combination: Array<{ value: string; type: string }>): string {
    const order = ['Brand', 'Color', 'Material', 'Pattern', 'Size', 'Gender', 'Age Group', 'Product Type', 'Category'];
    const sorted = [...combination].sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));
    return sorted.map(attr => attr.value).join(' ');
  }

  private generateCombinations(attributes: Array<{ value: string; type: string }>): Array<Array<{ value: string; type: string }>> {
    const combinations: Array<Array<{ value: string; type: string }>> = [];
    const makesCombination = (attrs: Array<{ value: string; type: string }>) => {
      return attrs.some(attr => ['Brand', 'Product Type', 'Category'].includes(attr.type));
    };

    for (let i = 0; i < attributes.length; i++) {
      for (let j = i + 1; j < attributes.length; j++) {
        const combo = [attributes[i], attributes[j]];
        if (makesCombination(combo)) combinations.push(combo);
      }
    }

    for (let i = 0; i < attributes.length; i++) {
      for (let j = i + 1; j < attributes.length; j++) {
        for (let k = j + 1; k < attributes.length; k++) {
          const combo = [attributes[i], attributes[j], attributes[k]];
          if (makesCombination(combo)) combinations.push(combo);
        }
      }
    }
    return combinations;
  }

  private calculateEstimatedVolume(matchCount: number, isDescriptionBased: boolean = false): number {
    const baseVolume = isDescriptionBased ? matchCount * 8 : matchCount * 10;
    const multiplier = Math.log10(matchCount + 1);
    return Math.round(baseVolume * multiplier);
  }

  public async analyzeSearchTerms(items: FeedItem[]): Promise<SearchTerm[]> {
    console.log(`Starting search term analysis for ${items.length} items...`);
    
    const searchTerms: SearchTerm[] = [];
    const existingTerms = new Set<string>();

    const attributeCombinations = this.getAttributeCombinations(items);
    attributeCombinations.forEach((data, combination) => {
      const sampleItem = data.items[0];
      const term: SearchTerm = {
        id: sampleItem.id,
        productName: sampleItem.title || '',
        searchTerm: combination,
        pattern: `Attribute-based: ${data.pattern}`,
        estimatedVolume: this.calculateEstimatedVolume(data.items.length)
      };
      searchTerms.push(term);
      existingTerms.add(combination.toLowerCase());
    });

    console.log(`Generated ${searchTerms.length} attribute-based search terms`);

    const descriptionKeywords = await this.extractDescriptionKeywords(items);
    descriptionKeywords.forEach((matchedItems, keyword) => {
      if (!existingTerms.has(keyword.toLowerCase())) {
        const sampleItem = matchedItems[0];
        searchTerms.push({
          id: sampleItem.id,
          productName: sampleItem.title || '',
          searchTerm: keyword,
          pattern: `Description-based (${matchedItems.length} products)`,
          estimatedVolume: this.calculateEstimatedVolume(matchedItems.length, true)
        });
      }
    });

    console.log(`Total search terms generated: ${searchTerms.length}`);
    
    return searchTerms.sort((a, b) => b.estimatedVolume - a.estimatedVolume);
  }
}
