import { FeedItem } from './types';

interface SearchTerm {
  id: string;
  productName: string;
  searchTerm: string;
  pattern: string;
  estimatedVolume: number;
}

export class SearchTermsAnalyzer {
  private cleanValue(value: string | undefined): string | undefined {
    if (!value) return undefined;
    
    // Remove special characters and normalize spaces
    return value
      .toLowerCase()
      .replace(/[\/\\]/g, ' ') // Replace slashes with spaces
      .replace(/\s+/g, ' ')    // Normalize multiple spaces
      .trim();
  }

  private getAttributeCombinations(items: FeedItem[]): Map<string, { items: FeedItem[]; pattern: string }> {
    const combinations = new Map<string, { items: FeedItem[]; pattern: string }>();

    items.forEach(item => {
      // Clean and structure attributes
      const attributes = [
        { value: this.cleanValue(item.brand), type: 'Brand' },
        { value: this.cleanValue(item.color), type: 'Color' },
        { value: this.cleanValue(item.gender), type: 'Gender' },
        { value: this.cleanValue(item.age_group), type: 'Age Group' },
        { value: this.cleanValue(item.size), type: 'Size' },
        { value: this.cleanValue(item.material), type: 'Material' },
        { value: this.cleanValue(item.pattern), type: 'Pattern' },
        { 
          value: this.cleanValue(item.product_type?.split('>').pop()), 
          type: 'Product Type' 
        },
        { 
          value: this.cleanValue(item.google_product_category?.split('>').pop()), 
          type: 'Category' 
        }
      ].filter(attr => attr.value) as { value: string; type: string }[]; // Filter out undefined values and cast

      // Generate combinations
      this.generateCombinations(attributes).forEach(combination => {
        // Create a clean search term
        const searchTerm = this.createSearchTerm(combination);
        const pattern = combination.map(c => c.type).join(' + ');

        if (!combinations.has(searchTerm)) {
          combinations.set(searchTerm, { items: [], pattern: pattern });
        }
        combinations.get(searchTerm)!.items.push(item);
      });
    });

    // Filter out combinations with less than 5 items
    return new Map(
      Array.from(combinations.entries())
        .filter(([_, data]) => data.items.length >= 5)
    );
  }

  private createSearchTerm(combination: Array<{ value: string; type: string }>): string {
    // Sort attributes in a logical order for search terms
    const order = ['Brand', 'Color', 'Material', 'Pattern', 'Size', 'Gender', 'Age Group', 'Product Type', 'Category'];

    // Sort combination by the defined order
    const sorted = [...combination].sort((a, b) => order.indexOf(a.type) - order.indexOf(b.type));

    // Create a clean search term
    return sorted.map(attr => attr.value).join(' ');
  }

  private generateCombinations(attributes: Array<{ value: string; type: string }>): Array<Array<{ value: string; type: string }>> {
    const combinations: Array<Array<{ value: string; type: string }>> = [];

    const makesCombination = (attrs: Array<{ value: string; type: string }>) => {
      // At least one should be either Brand, Product Type, or Category
      return attrs.some(attr => ['Brand', 'Product Type', 'Category'].includes(attr.type));
    };

    // Generate 2-attribute combinations
    for (let i = 0; i < attributes.length; i++) {
      for (let j = i + 1; j < attributes.length; j++) {
        const combo = [attributes[i], attributes[j]];
        if (makesCombination(combo)) {
          combinations.push(combo);
        }
      }
    }

    // Generate 3-attribute combinations
    for (let i = 0; i < attributes.length; i++) {
      for (let j = i + 1; j < attributes.length; j++) {
        for (let k = j + 1; k < attributes.length; k++) {
          const combo = [attributes[i], attributes[j], attributes[k]];
          if (makesCombination(combo)) {
            combinations.push(combo);
          }
        }
      }
    }

    return combinations;
  }

  public analyzeSearchTerms(items: FeedItem[]): SearchTerm[] {
    const combinations = this.getAttributeCombinations(items);
    const searchTerms: SearchTerm[] = [];

    combinations.forEach((data, combination) => {
      const sampleItem = data.items[0];
      searchTerms.push({
        id: sampleItem.id,
        productName: sampleItem.title || '',
        searchTerm: combination,
        pattern: `Matches ${data.items.length} products (${data.pattern})`,
        estimatedVolume: this.calculateEstimatedVolume(data.items.length)
      });
    });

    return searchTerms.sort((a, b) => b.estimatedVolume - a.estimatedVolume);
  }

  private calculateEstimatedVolume(matchCount: number): number {
    const baseVolume = matchCount * 10;
    const multiplier = Math.log10(matchCount + 1);
    return Math.round(baseVolume * multiplier);
  }
}
