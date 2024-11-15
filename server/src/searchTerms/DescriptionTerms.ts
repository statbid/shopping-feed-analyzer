import nlp from 'compromise';
import { WordNet } from 'natural';
import { FeedItem, SearchTerm, Product } from '../types';

const STOPWORDS = new Set([
  "i", "me", "my", "myself", "we", "our", "ours", "ourselves", "you", "your", "yours", 
  "yourself", "yourselves", "he", "him", "his", "himself", "she", "her", "hers", 
  "herself", "it", "its", "itself", "they", "them", "their", "theirs", "themselves", 
  "what", "which", "who", "whom", "this", "that", "these", "those", "am", "is", "are", 
  "was", "were", "be", "been", "being", "have", "has", "had", "having", "do", "does", 
  "did", "doing", "a", "an", "the", "and", "but", "if", "or", "because", "as", "until", 
  "while", "of", "at", "by", "for", "with", "about", "against", "between", "into", 
  "through", "during", "before", "after", "above", "below", "to", "from", "up", "down", 
  "in", "out", "on", "off", "over", "under", "again", "further", "then", "once", "here", 
  "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", 
  "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", 
  "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now"
]);

const MAX_WORDS_IN_PHRASE = 4;

export class DescriptionExtractor {
  private MIN_PRODUCTS = 5;
  private BATCH_SIZE = 500;
  private wordnet: WordNet;
  private phraseCache: Map<string, Set<string>>;
  private progressCallback?: (status: string, count: number) => void;

  constructor(progressCallback?: (status: string, count: number) => void) {
    this.wordnet = new WordNet();
    this.phraseCache = new Map();
    this.progressCallback = progressCallback;
  }

  private cleanText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private getProductIdentifier(item: FeedItem): string {
    // Try product type first (last segment)
    if (item.product_type) {
      const segments = item.product_type.split('>');
      const lastSegment = segments[segments.length - 1].trim().toLowerCase();
      if (lastSegment) return lastSegment;
    }

    // Try Google category if product type not available
    if (item.google_product_category) {
      const segments = item.google_product_category.split('>');
      const lastSegment = segments[segments.length - 1].trim().toLowerCase();
      if (lastSegment) return lastSegment;
    }

    // Use brand as last resort
    return item.brand?.toLowerCase() || '';
  }

  private isValidPhrase(phrase: string): boolean {
    const words = phrase.split(' ');
    
    // Check phrase length
    if (words.length < 2 || words.length > MAX_WORDS_IN_PHRASE) return false;
    
    // Check if it's all stopwords
    if (words.every(word => STOPWORDS.has(word))) return false;

    return true;
  }

  private enrichPhrase(phrase: string, productIdentifier: string): string {
    // If the phrase already contains the product identifier, return as is
    if (productIdentifier && 
        (phrase.includes(productIdentifier) || 
         productIdentifier.includes(phrase))) {
      return phrase;
    }

    // Add product identifier if we have one
    if (productIdentifier) {
      return `${phrase} ${productIdentifier}`;
    }

    return phrase;
  }


  private cleanPhrase(phrase: string): string {
    return phrase
      .toLowerCase()
      .split(' ')
      .filter(word => !STOPWORDS.has(word)) // Filter out stopwords
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async findRelevantPhrases(text: string, item: FeedItem): Promise<Set<string>> {
    const doc = nlp(text);
    const phrases = new Set<string>();
    const productIdentifier = this.getProductIdentifier(item);

    // Extract noun phrases and adjective + noun combinations
    const patterns = [
      '#Adjective+ #Noun+',
      '#Noun+ #Noun+',
      '(#Adjective|#Noun) (#Preposition|#Determiner)? (#Adjective|#Noun)+'
    ];

    patterns.forEach(pattern => {
      doc.match(pattern).forEach(match => {
        const phrase = this.cleanPhrase(match.text().toLowerCase());
        if (this.isValidPhrase(phrase)) {
          phrases.add(this.enrichPhrase(phrase, productIdentifier));
        }
      });
    });

    return phrases;
  }




  
  private async processBatch(items: FeedItem[]): Promise<Map<string, Set<string>>> {
    const termToProducts = new Map<string, Set<string>>();

    await Promise.all(items.map(async item => {
      if (!item.description) return;

      const text = this.cleanText(item.description);
      const phrases = await this.findRelevantPhrases(text, item);

      phrases.forEach(phrase => {
        if (!termToProducts.has(phrase)) {
          termToProducts.set(phrase, new Set());
        }
        termToProducts.get(phrase)!.add(item.id);
      });
    }));

    return termToProducts;
  }












  public async extractSearchTerms(items: FeedItem[]): Promise<SearchTerm[]> {
    const allTerms = new Map<string, Set<string>>();
    const totalItems = items.length;
    let processedCount = 0;

    // Process in batches
    for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
      const batch = items.slice(i, i + this.BATCH_SIZE);
      const batchTerms = await this.processBatch(batch);

      // Merge batch results
      batchTerms.forEach((productIds, term) => {
        if (!allTerms.has(term)) {
          allTerms.set(term, new Set());
        }
        productIds.forEach(id => allTerms.get(term)!.add(id));
      });

      processedCount += batch.length;
      this.progressCallback?.('Processing descriptions', processedCount);
    }

    // Convert to search terms
    const searchTerms: SearchTerm[] = [];
    for (const [term, productIds] of allTerms) {
      if (productIds.size >= this.MIN_PRODUCTS) {
        const matchingProducts = items
          .filter(item => productIds.has(item.id))
          .map(item => ({
            id: item.id,
            productName: item.title || ''
          }));

        searchTerms.push({
          id: matchingProducts[0].id,
          productName: matchingProducts[0].productName,
          searchTerm: term,
          pattern: `Description-based: ${matchingProducts.length} products`,
          estimatedVolume: 1,
          matchingProducts
        });
      }
    }

    return searchTerms;
  }
}