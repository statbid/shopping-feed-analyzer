import { FeedItem, SearchTerm, Product } from '../types';
import { DescriptionExtractor } from './DescriptionTerms';

interface AttributeMatch {
  items: FeedItem[];
  pattern: string;
}

interface AttributeConfig {
  type: string;
  priority: number;
}

export class SearchTermsAnalyzer {
  private readonly descriptionExtractor: DescriptionExtractor;
  private readonly REQUIRED_MATCH_COUNT = 5;

  private static readonly ATTRIBUTE_CONFIGS: AttributeConfig[] = [
    // Descriptive attributes first
    { type: 'Condition', priority: 1 },
    { type: 'Color', priority: 2 },
    { type: 'Size', priority: 3 },
    { type: 'Material', priority: 4 },
    { type: 'Pattern', priority: 5 },
    
    // Identity attributes next
    { type: 'Gender', priority: 6 },
    { type: 'Age Group', priority: 7 },
    
    // Core product attributes last
    { type: 'Brand', priority: 8 },
    { type: 'Product Type', priority: 9 },
    { type: 'Category', priority: 10 }
  ];

  constructor(progressCallback?: (status: string, count: number) => void) {
    this.descriptionExtractor = new DescriptionExtractor(progressCallback);
  }

  private cleanValue(value: string | undefined): string | undefined {
    if (!value) return undefined;
    return value
      .toLowerCase()
      .replace(/[\/\\]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  private isValidAttributePair(type1: string, type2: string): boolean {
    const invalidPairs = new Set([
      'Color-Size',
      'Condition-Color',
      'Condition-Size',
      'Product Type-Category'
    ]);

    const pair = [type1, type2].sort().join('-');
    return !invalidPairs.has(pair);
  }

  private isLogicalCombination(attrs: Array<{ type: string; value: string }>): boolean {
    // Check for invalid pairs
    for (let i = 0; i < attrs.length; i++) {
      for (let j = i + 1; j < attrs.length; j++) {
        if (!this.isValidAttributePair(attrs[i].type, attrs[j].type)) {
          return false;
        }
      }
    }

    // Check for invalid combinations
    const hasCondition = attrs.some(a => a.type === 'Condition');
    const hasColor = attrs.some(a => a.type === 'Color');
    const hasSize = attrs.some(a => a.type === 'Size');

    if (hasCondition && (hasColor || hasSize)) {
      return false;
    }

    if (hasCondition && hasColor && hasSize) {
      return false;
    }

    // Check for at least one high-value attribute in larger combinations
    const hasHighValueAttr = attrs.some(a => 
      ['Brand', 'Product Type', 'Category'].includes(a.type)
    );

    if (attrs.length >= 3 && !hasHighValueAttr) {
      return false;
    }

    // Calculate value score
    const valueScore = attrs.reduce((score, attr) => {
      switch (attr.type) {
        case 'Brand':
        case 'Product Type':
        case 'Category':
          return score + 3;
        case 'Material':
        case 'Pattern':
          return score + 2;
        default:
          return score + 1;
      }
    }, 0);

    // Ensure reasonable value scores for different combination sizes
    if (attrs.length === 2) return valueScore >= 2;
    if (attrs.length === 3) return valueScore >= 4;
    if (attrs.length === 4) return valueScore >= 6;

    return true;
  }

  private generateCombinations<T>(items: T[], size: number): T[][] {
    if (size === 0) return [[]];
    if (items.length === 0) return [];
    
    const first = items[0];
    const rest = items.slice(1);
    
    const combosWithoutFirst = this.generateCombinations(rest, size);
    const combosWithFirst = this.generateCombinations(rest, size - 1)
      .map(combo => [first, ...combo]);
    
    return [...combosWithoutFirst, ...combosWithFirst];
  }

  private createSearchTerm(attrs: Array<{ type: string; value: string }>): string {
    // Sort attributes by priority defined in ATTRIBUTE_CONFIGS
    return attrs
      .sort((a, b) => {
        const priorityA = SearchTermsAnalyzer.ATTRIBUTE_CONFIGS.find(c => c.type === a.type)?.priority || 999;
        const priorityB = SearchTermsAnalyzer.ATTRIBUTE_CONFIGS.find(c => c.type === b.type)?.priority || 999;
        return priorityA - priorityB;
      })
      .map(attr => attr.value)
      .join(' ');
  }

  private getAttributeCombinations(items: FeedItem[]): Map<string, AttributeMatch> {
    const combinations = new Map<string, AttributeMatch>();

    items.forEach(item => {
      const attributes = [
        // Map directly to attribute configs with consistent priorities
        { value: this.cleanValue(item.brand), type: 'Brand' },
        { value: this.cleanValue(item.product_type?.split('>').pop()), type: 'Product Type' },
        { value: this.cleanValue(item.google_product_category?.split('>').pop()), type: 'Category' },
        { value: this.cleanValue(item.material), type: 'Material' },
        { value: this.cleanValue(item.pattern), type: 'Pattern' },
        { value: this.cleanValue(item.color), type: 'Color' },
        { value: this.cleanValue(item.size), type: 'Size' },
        { value: this.cleanValue(item.gender), type: 'Gender' },
        { value: this.cleanValue(item.age_group), type: 'Age Group' },
        { value: this.cleanValue(item.condition), type: 'Condition' }
      ].filter((attr): attr is { value: string; type: string } => 
        attr.value !== undefined && attr.value.length > 1
      );

      // Generate combinations of 2-4 attributes
      for (let size = 2; size <= 4; size++) {
        this.generateCombinations(attributes, size).forEach(combo => {
          if (this.isLogicalCombination(combo)) {
            const searchTerm = this.createSearchTerm(combo);
            const pattern = combo.map(attr => attr.type).join(' + ');
            
            if (!combinations.has(searchTerm)) {
              combinations.set(searchTerm, { items: [], pattern });
            }
            combinations.get(searchTerm)!.items.push(item);
          }
        });
      }
    });

    return new Map(
      Array.from(combinations.entries())
        .filter(([_, data]) => data.items.length >= this.REQUIRED_MATCH_COUNT)
    );
  }

  public async analyzeSearchTerms(items: FeedItem[]): Promise<SearchTerm[]> {
    // Get attribute-based terms
    const attributeResults = this.getAttributeCombinations(items);
    const results: SearchTerm[] = [];

    // Convert attribute combinations to search terms
    attributeResults.forEach((data, combination) => {
      const matchingProducts = data.items.map(item => ({
        id: item.id,
        productName: item.title || ''
      }));

      results.push({
        id: matchingProducts[0].id,
        productName: matchingProducts[0].productName,
        searchTerm: combination,
        pattern: `Attribute-based: ${data.pattern}`,
        estimatedVolume: 1,
        matchingProducts
      });
    });

    // Get description-based terms
    const descriptionTerms = await this.descriptionExtractor.extractSearchTerms(items);
    results.push(...descriptionTerms);

    // Remove duplicates by search term
    const uniqueTerms = new Map<string, SearchTerm>();
    results.forEach(term => {
      const key = term.searchTerm.toLowerCase();
      if (!uniqueTerms.has(key) || 
          uniqueTerms.get(key)!.matchingProducts.length < term.matchingProducts.length) {
        uniqueTerms.set(key, term);
      }
    });

    return Array.from(uniqueTerms.values());
  }
}