import { FeedItem, SearchTerm, ProgressCallback, DescriptionProgressCallback } from '@shopping-feed/types';
import { DescriptionExtractor } from './DescriptionTerms';

export class SearchTermsAnalyzer {
  private readonly descriptionExtractor: DescriptionExtractor;
  private readonly MIN_COMBINATION_SIZE = 2;
  private readonly MAX_COMBINATION_SIZE = 4;
  private readonly MIN_MATCHING_PRODUCTS = 5;
  private readonly progressCallback?: ProgressCallback;

  private static readonly ATTRIBUTE_PRIORITY: { [key: string]: number } = {
    'Condition': 1,
    'Brand': 2,
    'Age Group': 3,
    'Gender': 4,
    'Color': 5,
    'Material': 6,
    'Size': 7,
    'Product Type': 8,
    'Category': 9,
  };

  private static readonly FIELD_MAPPINGS = {
    category: ['google product category', 'google_product_category', 'category'],
    productType: ['product type', 'product_type'],
  };

  private static readonly IDENTIFIER_ATTRIBUTES = new Set([
    'Brand',
    'Product Type',
    'Category',
  ]);

  private static readonly ATTRIBUTES = [
    'Condition',
    'Brand',
    'Age Group',
    'Gender',
    'Color',
    'Material',
    'Size',
    'Product Type',
  ];

  constructor(progressCallback?: ProgressCallback) {
    this.progressCallback = progressCallback;

    // Modified to pass current batch and total batches
    this.descriptionExtractor = new DescriptionExtractor(
      (stage: string, current: number, total: number) => {
        const progress = (current / total) * 100;
        console.log(
          `Description extraction progress: ${current}/${total} batches (${progress.toFixed(1)}%)`
        );
        this.progressCallback?.('description', progress);
      }
    );
  }

  private getFieldValue(item: FeedItem, fieldType: 'category' | 'productType'): string | undefined {
    const possibleFields = SearchTermsAnalyzer.FIELD_MAPPINGS[fieldType];
    for (const field of possibleFields) {
      const value = (item as any)[field];
      if (value) {
        return value;
      }
    }
    return undefined;
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

  private getAttributeValue(item: FeedItem, type: string): string | undefined {
    switch (type) {
      case 'Brand':
        return this.cleanValue(item.brand);
      case 'Product Type':
        return this.getLastSegment(this.getFieldValue(item, 'productType'));
      case 'Category':
        return this.getLastSegment(this.getFieldValue(item, 'category'));
      case 'Color':
        return this.cleanValue(item.color);
      case 'Size':
        return this.cleanValue(item.size);
      case 'Material':
        return this.cleanValue(item.material);
      case 'Gender':
        return this.cleanValue(item.gender);
      case 'Age Group':
        return this.cleanValue(item.age_group);
      case 'Condition':
        return this.cleanValue(item.condition);
      default:
        return undefined;
    }
  }

  private hasIdentifierAttribute(combination: string[]): boolean {
    return combination.some(attr => SearchTermsAnalyzer.IDENTIFIER_ATTRIBUTES.has(attr));
  }

  private orderAttributesNaturally(attributes: string[]): string[] {
    return [...attributes].sort((a, b) => {
      const priorityA = SearchTermsAnalyzer.ATTRIBUTE_PRIORITY[a] || 999;
      const priorityB = SearchTermsAnalyzer.ATTRIBUTE_PRIORITY[b] || 999;
      return priorityA - priorityB;
    });
  }

  private generateCombinations(size: number): string[][] {
    const allAttributes = SearchTermsAnalyzer.ATTRIBUTES;
    const combinations: string[][] = [];

    const generate = (current: string[], start: number) => {
      if (current.length === size) {
        if (this.hasIdentifierAttribute(current)) {
          combinations.push(this.orderAttributesNaturally(current));
        }
        return;
      }

      for (let i = start; i < allAttributes.length; i++) {
        current.push(allAttributes[i]);
        generate(current, i + 1);
        current.pop();
      }
    };

    generate([], 0);
    return combinations;
  }

  private permute<T>(inputArr: T[]): T[][] {
    let result: T[][] = [];

    const permuteRecursive = (arr: T[], m: T[] = []) => {
      if (arr.length === 0) {
        result.push(m);
      } else {
        for (let i = 0; i < arr.length; i++) {
          let curr = arr.slice();
          let next = curr.splice(i, 1);
          permuteRecursive(curr.slice(), m.concat(next));
        }
      }
    };

    permuteRecursive(inputArr);
    return result;
  }

  private matchItemsToPattern(
    item: FeedItem,
    pattern: string[]
  ): { searchTerm: string; pattern: string; attributeValues: Array<{ type: string; value: string }>; category: string } | undefined {
    const category = this.getAttributeValue(item, 'Category');
    if (!category) {
      return undefined;
    }

    const attributeValues: Array<{ type: string; value: string }> = [];
    for (const attr of pattern) {
      const value = this.getAttributeValue(item, attr);
      if (!value) return undefined;
      attributeValues.push({ type: attr, value });
    }

    if (attributeValues.length === pattern.length) {
      const values = attributeValues.map(av => av.value);
      return {
        searchTerm: `${values.join(' ')} ${category}`,
        pattern: `${pattern.join(' + ')} + Category`,
        attributeValues: attributeValues,
        category: category,
      };
    }

    return undefined;
  }

  private generateAllCombinations(items: FeedItem[]): Map<string, { items: FeedItem[]; pattern: string; attributeValues: Array<{ type: string; value: string }>; category: string }> {
    const validItems = items.filter(item => this.getAttributeValue(item, 'Category'));

    const allMatches = new Map<string, { items: FeedItem[]; pattern: string; attributeValues: Array<{ type: string; value: string }>; category: string }>();

    for (let size = this.MIN_COMBINATION_SIZE; size <= this.MAX_COMBINATION_SIZE; size++) {
      const patterns = this.generateCombinations(size);
      patterns.forEach(pattern => {
        validItems.forEach(item => {
          const result = this.matchItemsToPattern(item, pattern);
          if (result) {
            if (!allMatches.has(result.searchTerm)) {
              allMatches.set(result.searchTerm, {
                items: [],
                pattern: result.pattern,
                attributeValues: result.attributeValues,
                category: result.category,
              });
            }
            allMatches.get(result.searchTerm)!.items.push(item);
          }
        });
      });
    }

    const filteredMatches = new Map(
      [...allMatches].filter(([_, data]) => data.items.length >= this.MIN_MATCHING_PRODUCTS)
    );

    return filteredMatches;
  }





  public async analyzeSearchTerms(items: FeedItem[]): Promise<SearchTerm[]> {
    try {
      const attributeResults: SearchTerm[] = [];
      const combinations = this.generateAllCombinations(items);
      let combinationCount = 0;
      const totalCombinations = combinations.size;
  
      console.log(`Processing ${totalCombinations} attribute combinations...`);
  
      for (const [searchTerm, data] of combinations.entries()) {
        attributeResults.push({
          id: data.items[0].id,
          productName: data.items[0].title || '',
          searchTerm: searchTerm,
          pattern: `Attribute-based: ${data.pattern} (${data.items.length} products)`,
          estimatedVolume: 0,
          matchingProducts: data.items.map(item => ({
            id: item.id,
            productName: item.title || '',
          })),
        });
  
        combinationCount++;
        const progress = Math.round((combinationCount / totalCombinations) * 100);
        if (this.progressCallback) {
          this.progressCallback('attribute', progress);
        }
      }
  
      console.log(`Completed attribute analysis. Found ${attributeResults.length} combinations.`);
  
      // Then process description-based terms
      const descriptionTerms = await this.descriptionExtractor.extractSearchTerms(items);
  
      return [...attributeResults, ...descriptionTerms];
    } catch (error) {
      console.error('Error during search terms analysis:', error);
      throw error;
    }
  }





}
