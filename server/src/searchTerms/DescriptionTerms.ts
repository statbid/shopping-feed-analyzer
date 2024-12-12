import nlp from 'compromise';
import { WordNet } from 'natural';
import { FeedItem, SearchTerm, DescriptionProgressCallback } from '@shopping-feed/types';

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


  private synonymCache = new Map<string, string[]>();

  private async getSynonyms(word: string): Promise<string[]> {
    // Check cache first
    if (this.synonymCache.has(word)) {
      return this.synonymCache.get(word)!;
    }

    return new Promise((resolve) => {
      this.wordnet.lookup(word, (results: any[]) => {
        if (results.length > 0) {
          const synonyms = results.flatMap((result) => result.synonyms || [])
            .filter(synonym => synonym.split(' ').length === 1);
          const uniqueSynonyms = Array.from(new Set(synonyms));
          this.synonymCache.set(word, uniqueSynonyms); // Cache the result
          resolve(uniqueSynonyms);
        } else {
          this.synonymCache.set(word, []); // Cache empty result
          resolve([]);
        }
      });
    });
  }
  



  private async addBrandAndSynonymsToTerms(terms: SearchTerm[], items: FeedItem[]): Promise<SearchTerm[]> {
    const enhancedTerms = new Map<string, SearchTerm>();
    
    // Add original terms first
    terms.forEach(term => {
      enhancedTerms.set(term.searchTerm, term);
    });

    // Process brand variants
    for (const term of terms) {
      const matchingItem = items.find(item => item.id === term.id);
      const brand = matchingItem?.brand?.toLowerCase().trim();

      if (brand && !term.searchTerm.includes(brand)) {
        const brandPrepended = `${brand} ${term.searchTerm}`;
        const brandAppended = `${term.searchTerm} ${brand}`;

        if (!enhancedTerms.has(brandPrepended)) {
          enhancedTerms.set(brandPrepended, {
            ...term,
            searchTerm: brandPrepended
          });
        }

        if (!enhancedTerms.has(brandAppended)) {
          enhancedTerms.set(brandAppended, {
            ...term,
            searchTerm: brandAppended
          });
        }
      }
    }

    // Process synonyms in parallel batches
    const SYNONYM_BATCH_SIZE = 50;
    const uniqueWords = new Set<string>();

    // Collect unique meaningful words
    terms.forEach(term => {
      term.searchTerm.split(' ').forEach(word => {
        if (!STOPWORDS.has(word) && word.length > 3) {
          uniqueWords.add(word);
        }
      });
    });

    const uniqueWordsArray = Array.from(uniqueWords);
    const synonymBatches = [];

    // Process synonym lookups in batches
    for (let i = 0; i < uniqueWordsArray.length; i += SYNONYM_BATCH_SIZE) {
      const batch = uniqueWordsArray.slice(i, i + SYNONYM_BATCH_SIZE);
      const batchPromises = batch.map(word => this.getSynonyms(word)
        .then(synonyms => ({ word, synonyms: synonyms[0] }))  // Only take first synonym
      );
      synonymBatches.push(Promise.all(batchPromises));
    }

    // Wait for all batches to complete
    const allSynonyms = (await Promise.all(synonymBatches)).flat();
    const synonymMap = new Map(
      allSynonyms
        .filter(({ synonyms }) => synonyms)  // Only keep words that have synonyms
        .map(({ word, synonyms }) => [word, synonyms])
    );

    // Create synonym variants
    terms.forEach(term => {
      const words = term.searchTerm.split(' ');
      for (let i = 0; i < words.length; i++) {
        const word = words[i];
        const synonym = synonymMap.get(word);
        
        if (synonym) {
          const modifiedWords = [...words];
          modifiedWords[i] = synonym;
          const synonymTerm = modifiedWords.join(' ');

          if (!enhancedTerms.has(synonymTerm)) {
            enhancedTerms.set(synonymTerm, {
              ...term,
              searchTerm: synonymTerm
            });
            break; // Only create one synonym variant per term
          }
        }
      }
    });

    return Array.from(enhancedTerms.values());
  }

  




  public async extractSearchTerms(items: FeedItem[]): Promise<SearchTerm[]> {
    const allTerms = new Map<string, Set<string>>();
    const totalItems = items.length;
    let processedCount = 0;
    const totalBatches = Math.ceil(items.length / this.BATCH_SIZE);

    for (let i = 0; i < items.length; i += this.BATCH_SIZE) {
      const batch = items.slice(i, i + this.BATCH_SIZE);
      const currentBatch = Math.floor(i / this.BATCH_SIZE) + 1;

      const batchTerms = await this.processBatch(batch);

      batchTerms.forEach((productIds, term) => {
        if (!allTerms.has(term)) {
          allTerms.set(term, new Set());
        }
        productIds.forEach(id => allTerms.get(term)!.add(id));
      });

      processedCount += batch.length;
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

        searchTerms.push({
          id: matchingProducts[0].id,
          productName: matchingProducts[0].productName,
          searchTerm: term,
          pattern: `Description-based: ${matchingProducts.length} products`,
          estimatedVolume: 0,
          matchingProducts,
          keywordMetrics: undefined
        });
      }
    }

    const enhancedSearchTerms = await this.addBrandAndSynonymsToTerms(searchTerms, items);
    return enhancedSearchTerms;
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

  private cleanPhrase(phrase: string): string {
    return phrase
      .toLowerCase()
      .split(' ')
      .filter(word => !STOPWORDS.has(word))
      .join(' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isValidPhrase(phrase: string): boolean {
    const words = phrase.split(' ');

    if (words.length < 2 || words.length > MAX_WORDS_IN_PHRASE) {
      return false;
    }

    if (words.every(word => STOPWORDS.has(word))) {
      return false;
    }

    const hasSubstantialWord = words.some(word => 
      word.length > 3 && !STOPWORDS.has(word)
    );

    return hasSubstantialWord;
  }

  private isRelevantCombination(phrase: string, identifier: string): boolean {
    const phraseWords = phrase.split(' ');
    const lastWord = phraseWords[phraseWords.length - 1];

    const result = !identifier.includes(lastWord) && 
           !lastWord.includes(identifier) &&
           phraseWords.length + identifier.split(' ').length <= MAX_WORDS_IN_PHRASE;

    return result;
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
}
