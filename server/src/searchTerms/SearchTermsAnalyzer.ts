import { FeedItem, SearchTerm, Product} from '../types';

interface AttributeMatch {
  items: FeedItem[];
  pattern: string;
}


export class SearchTermsAnalyzer {

  private readonly REQUIRED_MATCH_COUNT = 5;

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

  private getAttributeCombinations(items: FeedItem[]): Map<string, AttributeMatch> {
    const combinations = new Map<string, AttributeMatch>();

    items.forEach(item => {
      const attributes = [
        // High priority attributes
        { value: this.cleanValue(item.brand), type: 'Brand', priority: 1 },
        { value: this.cleanValue(item.product_type?.split('>').pop()), type: 'Product Type', priority: 1 },
        { value: this.cleanValue(item.google_product_category?.split('>').pop()), type: 'Category', priority: 1 },
        // Medium priority attributes
        { value: this.cleanValue(item.material), type: 'Material', priority: 2 },
        { value: this.cleanValue(item.pattern), type: 'Pattern', priority: 2 },
        // Lower priority attributes
        { value: this.cleanValue(item.color), type: 'Color', priority: 3 },
        { value: this.cleanValue(item.size), type: 'Size', priority: 3 },
        { value: this.cleanValue(item.gender), type: 'Gender', priority: 3 },
        { value: this.cleanValue(item.age_group), type: 'Age Group', priority: 3 },
        { value: this.cleanValue(item.condition), type: 'Condition', priority: 3 },
        { value: this.cleanValue(item.mpn), type: 'MPN', priority: 3 }
      ].filter((attr): attr is { value: string; type: string; priority: number } => 
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

  private createSearchTerm(attrs: Array<{ value: string; priority: number }>): string {
    return attrs
      .sort((a, b) => a.priority - b.priority)
      .map(attr => attr.value)
      .join(' ');
  }

  public analyzeSearchTerms(items: FeedItem[]): SearchTerm[] {
    const attributeCombinations = this.getAttributeCombinations(items);
    const results: SearchTerm[] = [];

    attributeCombinations.forEach((data, combination) => {
      // Get representative product
      const representativeProduct = data.items[0];
      
      // Create matching products array
      const matchingProducts: Product[] = data.items.map(item => ({
        id: item.id,
        productName: item.title || ''
      }));

      results.push({
        id: representativeProduct.id,
        productName: representativeProduct.title || '',
        searchTerm: combination,
        pattern: `Attribute-based: ${data.pattern} (${matchingProducts.length} products)`,
        estimatedVolume: 1,
        matchingProducts
      });
    });

    return results;
  }
}