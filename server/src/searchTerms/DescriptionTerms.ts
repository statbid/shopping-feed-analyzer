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
    if (item['product type']) {
      const segments = item['product type'].split('>');
      const lastSegment = segments[segments.length - 1].trim().toLowerCase();
      if (lastSegment) return lastSegment;
    }

    // Try Google category if product type not available
    if (item['google product category']) {
      const segments = item['google product category'].split('>');
      const lastSegment = segments[segments.length - 1].trim().toLowerCase();
      if (lastSegment) return lastSegment;
    }

    return '';
  }

  private isValidPhrase(phrase: string): boolean {
    const words = phrase.split(' ');
    
    // Check phrase length
    if (words.length < 2 || words.length > MAX_WORDS_IN_PHRASE) return false;
    
    // Check if it's all stopwords
    if (words.every(word => STOPWORDS.has(word))) return false;

    // At least one word should be a substantial word (not just a preposition or article)
    const hasSubstantialWord = words.some(word => 
      word.length > 3 && !STOPWORDS.has(word)
    );

    return hasSubstantialWord;
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

    // Comprehensive patterns for natural language analysis
    const patterns = [
      // Basic patterns
      '#Adjective+ #Noun+',                                    // "soft cotton shirt"
      '#Noun+ #Noun+',                                        // "tennis shoes"
      
      // Complex patterns
      '(#Adjective|#Noun) (#Preposition|#Determiner)? (#Adjective|#Noun)+', // "shoes for running"
      '#Noun+ #Preposition #Noun+',                           // "shoes with laces"
      '#Adjective+ (#Preposition|#Determiner)? #Noun+',       // "comfortable with cushions"
      '#Noun+ #Adjective+ #Noun+',                           // "cotton blend shirt"

      // Additional patterns for better coverage
      '(#Adjective|#Noun)+ #Preposition (#Adjective|#Noun)+', // "perfect for running"
      '#Noun+ (#Conjunction|#Preposition) #Noun+',            // "cotton and polyester"
      '#Adjective+ #Conjunction #Adjective+ #Noun+'          // "soft and comfortable shoes"
    ];

    patterns.forEach(pattern => {
      doc.match(pattern).forEach(match => {
        const phrase = this.cleanPhrase(match.text().toLowerCase());
        if (this.isValidPhrase(phrase)) {
          // If the phrase contains the product identifier, add it as is
          if (productIdentifier && phrase.includes(productIdentifier)) {
            phrases.add(phrase);
          } else {
            // Add both with and without product identifier if relevant
            phrases.add(phrase);
            if (productIdentifier && this.isRelevantCombination(phrase, productIdentifier)) {
              phrases.add(`${phrase} ${productIdentifier}`);
            }
          }
        }
      });
    });

    return phrases;
  }

  private isRelevantCombination(phrase: string, identifier: string): boolean {
    // Check if combining the phrase with the identifier would make semantic sense
    const phraseWords = phrase.split(' ');
    const lastWord = phraseWords[phraseWords.length - 1];
    
    // Avoid redundant combinations or nonsensical ones
    return !identifier.includes(lastWord) && 
           !lastWord.includes(identifier) &&
           phraseWords.length + identifier.split(' ').length <= MAX_WORDS_IN_PHRASE;
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
    console.log('Starting description-based search term extraction...');
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
      console.log(`Processed ${processedCount}/${totalItems} items`);
    }

    // Convert to search terms with filtering and add identifier versions
    const searchTerms: SearchTerm[] = [];
    
    for (const [term, productIds] of allTerms) {
      if (productIds.size >= this.MIN_PRODUCTS) {
        const matchingProducts = items
          .filter(item => productIds.has(item.id))
          .map(item => ({
            id: item.id,
            productName: item.title || ''
          }));

        // Add original term
        searchTerms.push({
          id: matchingProducts[0].id,
          productName: matchingProducts[0].productName,
          searchTerm: term,
          pattern: `Description-based: ${matchingProducts.length} products`,
          estimatedVolume: 1,
          matchingProducts
        });

        // Get identifiers from the first matching product
        const firstProduct = items.find(item => item.id === matchingProducts[0].id);
        if (firstProduct) {
          const brand = firstProduct.brand?.toLowerCase().trim();
          const productType = this.getProductIdentifier(firstProduct);

          // Add version with brand if it doesn't already contain it
          if (brand && !term.includes(brand) && 
              brand.length > 1 && // Avoid single-letter brands
              !brand.split(' ').some(word => STOPWORDS.has(word))) {
            searchTerms.push({
              id: matchingProducts[0].id,
              productName: matchingProducts[0].productName,
              searchTerm: `${brand} ${term}`,
              pattern: `Description-based with brand: ${matchingProducts.length} products`,
              estimatedVolume: 1,
              matchingProducts
            });
          }

          // Add version with product type if it doesn't already contain it
          if (productType && !term.includes(productType) && 
              productType !== brand && // Avoid duplication if brand and product type are same
              productType.length > 1 && // Avoid single-letter product types
              !productType.split(' ').some(word => STOPWORDS.has(word))) {
            searchTerms.push({
              id: matchingProducts[0].id,
              productName: matchingProducts[0].productName,
              searchTerm: `${term} ${productType}`,
              pattern: `Description-based with product type: ${matchingProducts.length} products`,
              estimatedVolume: 1,
              matchingProducts
            });
          }
        }
      }
    }

    console.log(`Extracted ${searchTerms.length} description-based search terms (including identifier variations)`);
    return searchTerms;
  }
}