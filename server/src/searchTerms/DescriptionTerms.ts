import nlp from 'compromise';
import { WordNet } from 'natural';
import { FeedItem, SearchTerm, DescriptionProgressCallback } from '../types';


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
  private BATCH_SIZE = 1000;
  private wordnet: WordNet;
  private phraseCache: Map<string, Set<string>>;
  private progressCallback?: DescriptionProgressCallback;

  constructor(progressCallback?: DescriptionProgressCallback) {
    this.progressCallback = progressCallback;
    this.wordnet = new WordNet();
    this.phraseCache = new Map();
    
  }

  private cleanText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private getProductIdentifier(item: FeedItem): string {
    if (item['product type']) {
      const segments = item['product type'].split('>');
      const lastSegment = segments[segments.length - 1].trim().toLowerCase();
      if (lastSegment) return lastSegment;
    }

    if (item['google product category']) {
      const segments = item['google product category'].split('>');
      const lastSegment = segments[segments.length - 1].trim().toLowerCase();
      if (lastSegment) return lastSegment;
    }

    return '';
  }

  private isValidPhrase(phrase: string): boolean {
    const words = phrase.split(' ');

    if (words.length < 2 || words.length > MAX_WORDS_IN_PHRASE) return false;

    if (words.every(word => STOPWORDS.has(word))) return false;

    const hasSubstantialWord = words.some(word => 
      word.length > 3 && !STOPWORDS.has(word)
    );

    return hasSubstantialWord;
  }

  private cleanPhrase(phrase: string): string {
    return phrase
      .toLowerCase()
      .split(' ')
      .filter(word => !STOPWORDS.has(word))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private async findRelevantPhrases(text: string, item: FeedItem): Promise<Set<string>> {
    const doc = nlp(text);
    const phrases = new Set<string>();
    const productIdentifier = this.getProductIdentifier(item);

    const patterns = [
      '#Adjective+ #Noun+',
      '#Noun+ #Noun+',
      '(#Adjective|#Noun) (#Preposition|#Determiner)? (#Adjective|#Noun)+',
      '#Noun+ #Preposition #Noun+',
      '#Adjective+ (#Preposition|#Determiner)? #Noun+',
      '#Noun+ #Adjective+ #Noun+',
      '(#Adjective|#Noun)+ #Preposition (#Adjective|#Noun)+',
      '#Noun+ (#Conjunction|#Preposition) #Noun+',
      '#Adjective+ #Conjunction #Adjective+ #Noun+'
    ];

    patterns.forEach(pattern => {
      doc.match(pattern).forEach(match => {
        const phrase = this.cleanPhrase(match.text().toLowerCase());
        if (this.isValidPhrase(phrase)) {
          if (productIdentifier && phrase.includes(productIdentifier)) {
            phrases.add(phrase);
          } else {
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
    const phraseWords = phrase.split(' ');
    const lastWord = phraseWords[phraseWords.length - 1];

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
    const allTerms = new Map<string, Set<string>>();
    const totalItems = items.length;
    let processedCount = 0;
    const totalBatches = Math.ceil(items.length / this.BATCH_SIZE);

    for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
      const batch = items.slice(i, i + this.BATCH_SIZE);
      const currentBatch = Math.floor(i / this.BATCH_SIZE) + 1;

      console.log(`Processing batch ${currentBatch} / ${totalBatches}`);

      const batchTerms = await this.processBatch(batch);

      batchTerms.forEach((productIds, term) => {
        if (!allTerms.has(term)) {
          allTerms.set(term, new Set());
        }
        productIds.forEach(id => allTerms.get(term)!.add(id));
      });

      processedCount += batch.length;
      
      // Calculate progress percentage based on current batch
      const progress = (currentBatch / totalBatches) * 100;
      
      console.log(`Processed ${processedCount} / ${totalItems} items (${progress.toFixed(1)}%)`);
      this.progressCallback?.('description', currentBatch, totalBatches);
    }

    const searchTerms: SearchTerm[] = [];









    for (const [term, productIds] of allTerms) {
      if (productIds.size >= this.MIN_PRODUCTS) {
        const matchingProducts = items
          .filter(item => productIds.has(item.id))
          .map(item => ({
            id: item.id,
            productName: item.title || ''
          }));

        const firstProduct = items.find(item => item.id === matchingProducts[0].id);
        const brand = firstProduct?.brand?.toLowerCase().trim();
        const productType = this.getProductIdentifier(firstProduct!);

        searchTerms.push({
          id: matchingProducts[0].id,
          productName: matchingProducts[0].productName,
          searchTerm: term,
          pattern: `Description-based: ${matchingProducts.length} products`,
          estimatedVolume: 0,
          matchingProducts
        });

        if (brand && !term.includes(brand) && 
            !brand.split(' ').some(word => STOPWORDS.has(word))) {
          searchTerms.push({
            id: matchingProducts[0].id,
            productName: matchingProducts[0].productName,
            searchTerm: `${brand} ${term}`,
            pattern: `Description-based with brand: ${matchingProducts.length} products`,
            estimatedVolume: 0,
            matchingProducts
          });
        }

        if (productType && !term.includes(productType) && 
            productType !== brand &&
            !productType.split(' ').some(word => STOPWORDS.has(word))) {
          searchTerms.push({
            id: matchingProducts[0].id,
            productName: matchingProducts[0].productName,
            searchTerm: `${term} ${productType}`,
            pattern: `Description-based with product type: ${matchingProducts.length} products`,
            estimatedVolume: 0,
            matchingProducts
          });
        }
      }
    }

  console.log(`Extracted ${searchTerms.length} description-based search terms (including identifier variations)`);
    return searchTerms;
  }
}
