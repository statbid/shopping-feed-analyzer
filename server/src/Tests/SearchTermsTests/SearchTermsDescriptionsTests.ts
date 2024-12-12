import { FeedItem } from '@shopping-feed/types';
import { DescriptionExtractor } from '../../searchTerms/DescriptionTerms';

describe('DescriptionExtractor - Keyword Extraction and Filtering', () => {
  let extractor: DescriptionExtractor;

  beforeEach(() => {
    extractor = new DescriptionExtractor();
  });

  it('should extract and generate terms correctly from descriptions', async () => {
    const items: FeedItem[] = [
      { id: '1', description: 'HD Mesh safety covers give you all the benefits of a regular mesh safety cover with added sun-blocking and strength. It is just as easy to install and maintain. The densely woven mesh fabric filters out nearly all dust and small particles. It also prevents nearly all sunlight from getting through.', brand: 'Tara', 'product type': 'Pool & Spa Accessories', 'google product category': 'Home & Garden > Pool & Spa' },
      { id: '2', description: 'Each Tara Safety Cover is fully outfitted with high-quality hardware and installation equipment. The strength of the safety cover is doubled by sewing the webbing on both sides of the safety cover, doubling the thickness.', brand: 'Tara', 'product type': 'Pool & Spa Accessories', 'google product category': 'Home & Garden > Pool & Spa' },
      { id: '3', description: 'To provide maximum protection for the decking, all springs have tinted PVC covers and only non-staining polyethylene is used for rub-strips. Best of all, every Tara Manufacturing product comes with the service and support you have counted on for 30 years.', brand: 'Tara', 'product type': 'Pool & Spa Accessories', 'google product category': 'Home & Garden > Pool & Spa' },
      { id: '4', description: 'HD mesh blocks 99%* of sunlight to keep algae from growing. The 7.1 oz. fabric is still lightweight for easy installation and removal.', brand: 'Tara', 'product type': 'Pool & Spa Accessories', 'google product category': 'Home & Garden > Pool & Spa' },
      { id: '5', description: 'Our HD Mesh safety cover satisfies the needs of almost every pool owner. *U.S. Patent No. 6,886,187 - 99% Shade.', brand: 'Tara', 'product type': 'Pool & Spa Accessories', 'google product category': 'Home & Garden > Pool & Spa' },
    ];

    const searchTerms = await extractor.extractSearchTerms(items);

    console.log('Extracted Search Terms:', searchTerms);

    expect(searchTerms.length).toBeGreaterThan(0);
    searchTerms.forEach(term => {
      expect(term.searchTerm).toBeDefined();
      expect(term.searchTerm).not.toEqual('');
      expect(term.searchTerm.split(' ').length).toBeLessThanOrEqual(0);
    });
  });

  it('should only include terms that match at least 5 products', async () => {
    const items: FeedItem[] = [
      { id: '1', description: 'HD Mesh safety covers give you all the benefits of a regular mesh safety cover with added sun-blocking and strength. It is just as easy to install and maintain. The densely woven mesh fabric filters out nearly all dust and small particles. It also prevents nearly all sunlight from getting through.', brand: 'Tara', 'product type': 'Pool & Spa Accessories', 'google product category': 'Home & Garden > Pool & Spa' },
      { id: '2', description: 'Each Tara Safety Cover is fully outfitted with high-quality hardware and installation equipment. The strength of the safety cover is doubled by sewing the webbing on both sides of the safety cover, doubling the thickness.', brand: 'Tara', 'product type': 'Pool & Spa Accessories', 'google product category': 'Home & Garden > Pool & Spa' },
      { id: '3', description: 'To provide maximum protection for the decking, all springs have tinted PVC covers and only non-staining polyethylene is used for rub-strips. Best of all, every Tara Manufacturing product comes with the service and support you have counted on for 30 years.', brand: 'Tara', 'product type': 'Pool & Spa Accessories', 'google product category': 'Home & Garden > Pool & Spa' },
      { id: '4', description: 'HD mesh blocks 99%* of sunlight to keep algae from growing. The 7.1 oz. fabric is still lightweight for easy installation and removal.', brand: 'Tara', 'product type': 'Pool & Spa Accessories', 'google product category': 'Home & Garden > Pool & Spa' },
      { id: '5', description: 'Our HD Mesh safety cover satisfies the needs of almost every pool owner. *U.S. Patent No. 6,886,187 - 99% Shade.', brand: 'Tara', 'product type': 'Pool & Spa Accessories', 'google product category': 'Home & Garden > Pool & Spa' },
    ];

    const searchTerms = await extractor.extractSearchTerms(items);

    const validTerms = searchTerms.filter(term => term.matchingProducts.length >= 5);
    expect(validTerms.length).toBe(searchTerms.length);
  });
});
