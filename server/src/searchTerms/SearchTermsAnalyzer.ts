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
  private readonly MIN_COMBINATION_SIZE = 2;
  private readonly MAX_COMBINATION_SIZE = 4;

  private static readonly ATTRIBUTE_CONFIGS: AttributeConfig[] = [
    { type: 'Brand', priority: 1 },
    { type: 'Product Type', priority: 2 },
    { type: 'Category', priority: 3 },
    { type: 'Color', priority: 4 },
    { type: 'Size', priority: 5 },
    { type: 'Material', priority: 6 },
    { type: 'Pattern', priority: 7 },
    { type: 'Gender', priority: 8 },
    { type: 'Age Group', priority: 9 },
    { type: 'Condition', priority: 10 }
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

  private getLastSegment(value: string | undefined): string | undefined {
    if (!value) return undefined;
    const segments = value.split('>');
    return this.cleanValue(segments[segments.length - 1]);
  }

  private isValidAttributePair(type1: string, type2: string): boolean {
    const invalidPairs = new Set([
      'Color-Size',
      'Condition-Color',
      'Condition-Size',
      'Product Type-Category',
      'Brand-Condition',
      'Gender-Condition',
      'Age Group-Condition'
    ]);

    const pair = [type1, type2].sort().join('-');
    return !invalidPairs.has(pair);
  }

  private isLogicalCombination(attrs: Array<{ type: string; value: string }>): boolean {
    // Check pairs within the combination
    for (let i = 0; i < attrs.length; i++) {
      for (let j = i + 1; j < attrs.length; j++) {
        if (!this.isValidAttributePair(attrs[i].type, attrs[j].type)) {
          return false;
        }
      }
    }

    const types = attrs.map(a => a.type);
    const unique = new Set(types);
    if (unique.size !== types.length) {
      return false; // Prevent duplicate attribute types
    }

    // Special rules for condition
    const hasCondition = types.includes('Condition');
    const hasColor = types.includes('Color');
    const hasSize = types.includes('Size');

    if (hasCondition && (hasColor || hasSize)) {
      return false;
    }

    // Rules for different combination sizes
    switch (attrs.length) {
      case 2:
        // Allow most 2-attribute combinations that passed the pair check
        return true;
      
      case 3:
        // Must include at least one primary identifier
        return attrs.some(a => ['Brand', 'Product Type', 'Category'].includes(a.type));
      
      case 4:
        // Must include at least one primary identifier and make logical sense
        const hasPrimaryIdentifier = attrs.some(a => 
          ['Brand', 'Product Type', 'Category'].includes(a.type)
        );
        
        const complementaryGroups = [
          ['Color', 'Size', 'Material'],
          ['Gender', 'Age Group'],
          ['Brand', 'Product Type', 'Category']
        ];

        // Check if the combination includes complementary attributes
        const hasComplementaryGroup = complementaryGroups.some(group => 
          group.filter(attr => types.includes(attr)).length >= 2
        );

        return hasPrimaryIdentifier && hasComplementaryGroup;

      default:
        return false;
    }
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

  private getAttributesFromItem(item: FeedItem): Array<{ type: string; value: string }> {
    const attributes = [
      { value: this.cleanValue(item.brand), type: 'Brand' },
      { value: this.getLastSegment(item.product_type), type: 'Product Type' },
      { value: this.getLastSegment(item.google_product_category), type: 'Category' },
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

    return attributes;
  }

  private createSearchTerm(attrs: Array<{ type: string; value: string }>): string {
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
    let processed = 0;
    const total = items.length;

    items.forEach(item => {
      const attributes = this.getAttributesFromItem(item);
      
      // Generate combinations for each size from MIN to MAX
      for (let size = this.MIN_COMBINATION_SIZE; size <= this.MAX_COMBINATION_SIZE; size++) {
        const combos = this.generateCombinations(attributes, size);
        
        combos.forEach(combo => {
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

      processed++;
      if (processed % 100 === 0) {
        console.log(`Processed ${processed}/${total} items for attribute combinations`);
      }
    });

    console.log('Filtering combinations by match count...');
    // Filter and log statistics about combinations
    const filteredCombinations = new Map(
      Array.from(combinations.entries())
        .filter(([_, data]) => data.items.length >= this.REQUIRED_MATCH_COUNT)
    );

    console.log(`Generated ${combinations.size} total combinations`);
    console.log(`Filtered to ${filteredCombinations.size} combinations with ${this.REQUIRED_MATCH_COUNT}+ matches`);
    
    // Log statistics about combination sizes
    const sizeStats = new Map<number, number>();
    filteredCombinations.forEach((data, term) => {
      const size = term.split(' ').length;
      sizeStats.set(size, (sizeStats.get(size) || 0) + 1);
    });

    console.log('Combination size distribution:');
    sizeStats.forEach((count, size) => {
      console.log(`${size} attributes: ${count} combinations`);
    });

    return filteredCombinations;
  }

  public async analyzeSearchTerms(items: FeedItem[]): Promise<SearchTerm[]> {
    console.log('Starting search terms analysis...');
    const results: SearchTerm[] = [];

    // Get attribute-based terms
    console.log('Generating attribute combinations...');
    const attributeResults = this.getAttributeCombinations(items);
    
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
        pattern: `Attribute-based: ${data.pattern} (${matchingProducts.length} products)`,
        estimatedVolume: 1,
        matchingProducts
      });
    });

    // Get description-based terms
    console.log('Extracting description-based terms...');
    const descriptionTerms = await this.descriptionExtractor.extractSearchTerms(items);
    
    descriptionTerms.forEach(term => {
      results.push({
        ...term,
        pattern: `${term.pattern} (${term.matchingProducts.length} products)`
      });
    });

    // Remove duplicates
    console.log('Removing duplicates...');
    const uniqueTerms = new Map<string, SearchTerm>();
    results.forEach(term => {
      const key = term.searchTerm.toLowerCase();
      if (!uniqueTerms.has(key) || 
          uniqueTerms.get(key)!.matchingProducts.length < term.matchingProducts.length) {
        uniqueTerms.set(key, term);
      }
    });

    const finalResults = Array.from(uniqueTerms.values());
    console.log(`Analysis complete. Generated ${finalResults.length} unique search terms`);
    
    return finalResults;
  }
}