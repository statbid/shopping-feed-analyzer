import { FeedItem } from '@shopping-feed/types';
import { SearchTermsAnalyzer } from '../../searchTerms/SearchTermsAnalyzer';

describe('SearchTermsAnalyzer - Attribute Combinations', () => {
  let analyzer: SearchTermsAnalyzer;

  beforeEach(() => {
    analyzer = new SearchTermsAnalyzer();
  });

  it('should generate all valid combinations of attributes', () => {
    const items: FeedItem[] = [
      { id: '1', brand: 'Nike', color: 'Red', size: 'M', gender: 'Unisex', age_group: 'Adult', material: 'Cotton', condition: 'New', product_type: 'Shoes', google_product_category: 'Apparel > Shoes > Sneakers' },
      { id: '2', brand: 'Nike', color: 'Red', size: 'M', gender: 'Unisex', age_group: 'Adult', material: 'Cotton', condition: 'New', product_type: 'Shoes', google_product_category: 'Apparel > Shoes > Sneakers' },
      { id: '3', brand: 'Nike', color: 'Red', size: 'M', gender: 'Unisex', age_group: 'Adult', material: 'Cotton', condition: 'New', product_type: 'Shoes', google_product_category: 'Apparel > Shoes > Sneakers' },
      { id: '4', brand: 'Nike', color: 'Red', size: 'M', gender: 'Unisex', age_group: 'Adult', material: 'Cotton', condition: 'New', product_type: 'Shoes', google_product_category: 'Apparel > Shoes > Sneakers' },
      { id: '5', brand: 'Nike', color: 'Red', size: 'M', gender: 'Unisex', age_group: 'Adult', material: 'Cotton', condition: 'New', product_type: 'Shoes', google_product_category: 'Apparel > Shoes > Sneakers' },
    ];

    const combinations = analyzer['generateAllCombinations'](items);

    // Log generated combinations for debugging
    console.log('Generated Combinations:', [...combinations.keys()]);

    // Assert that combinations are generated
    expect(combinations.size).toBeGreaterThan(0);

    // Example assertion (adjust based on logged output)
    expect([...combinations.keys()]).toContain('nike red m sneakers');
  });

  it('should only include combinations with 5 or more matching products', () => {
    const items: FeedItem[] = [
      { id: '1', brand: 'Nike', color: 'Blue', size: 'L', gender: 'Unisex', age_group: 'Adult', material: 'Polyester', condition: 'New', product_type: 'Shoes', google_product_category: 'Apparel > Shoes > Sneakers' },
      { id: '2', brand: 'Nike', color: 'Blue', size: 'L', gender: 'Unisex', age_group: 'Adult', material: 'Polyester', condition: 'New', product_type: 'Shoes', google_product_category: 'Apparel > Shoes > Sneakers' },
      { id: '3', brand: 'Nike', color: 'Blue', size: 'L', gender: 'Unisex', age_group: 'Adult', material: 'Polyester', condition: 'New', product_type: 'Shoes', google_product_category: 'Apparel > Shoes > Sneakers' },
    ];

    const combinations = analyzer['generateAllCombinations'](items);

    // Log filtered combinations for debugging
    console.log('Filtered Combinations:', [...combinations.keys()]);

    // Ensure no combinations are included if fewer than 5 matches
    expect(combinations.size).toBe(0);
  });

 
});
