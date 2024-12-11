import { FeedItem, ErrorResult } from '@shopping-feed/types';
import * as errorCheckers from '../../errorCheckers';

describe('FeedAnalyzer', () => {
  describe('errorCheckers', () => {
    
    describe('checkImageLinkCommas', () => {
      it('should return an error if image link contains commas', () => {
        const item: FeedItem = { id: '1', image_link: 'http://example.com/image,1.jpg' };
        const error = errorCheckers.checkImageLinkCommas(item);
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Commas in Image Link');
          expect(error.details).toBe('Image link contains commas');
          expect(error.value).toBe('http://example.com/image,1.jpg');
        }
      });

      it('should return null if image link does not contain commas', () => {
        const item: FeedItem = { id: '1', image_link: 'http://example.com/image1.jpg' };
        const error = errorCheckers.checkImageLinkCommas(item);
        expect(error).toBeNull();
      });
    });

    describe('checkProductType', () => {
      it('should return an error if product type is not set', () => {
        const item: FeedItem = { id: '1', product_type: '' };
        const error = errorCheckers.checkProductType(item);
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Product Type is not set');
          expect(error.details).toBe('Product Type is not set');
        }
      });

      it('should return null if product type is set', () => {
        const item: FeedItem = { id: '1', product_type: 'Electronics' };
        const error = errorCheckers.checkProductType(item);
        expect(error).toBeNull();
      });
    });

    describe('checkProductTypePromotionalWords', () => {
      it('should return an error if product type contains promotional words', () => {
        const item: FeedItem = { id: '1', product_type: 'save on Electronics' };
        const error = errorCheckers.checkProductTypePromotionalWords(item);
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Product Type Contains Promotional Words');
          expect(error.details).toContain('promotional word(s)');
        }
      });

      it('should return null if product type does not contain promotional words', () => {
        const item: FeedItem = { id: '1', product_type: 'Electronics' };
        const error = errorCheckers.checkProductTypePromotionalWords(item);
        expect(error).toBeNull();
      });
    });

    describe('checkProductTypeCommas', () => {
      it('should return an error if product type contains commas', () => {
        const item: FeedItem = { id: '1', product_type: 'Electronics, Gadgets' };
        const error = errorCheckers.checkProductTypeCommas(item);
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Commas in Product Type');
          expect(error.details).toBe('Product Type Contains Commas');
        }
      });

      it('should return null if product type does not contain commas', () => {
        const item: FeedItem = { id: '1', product_type: 'Electronics' };
        const error = errorCheckers.checkProductTypeCommas(item);
        expect(error).toBeNull();
      });
    });

    describe('checkProductTypeRepeatedTiers', () => {
      it('should return an error if product type contains repeated tiers', () => {
        const item: FeedItem = { id: '1', product_type: 'Electronics > Electronics' };
        const error = errorCheckers.checkProductTypeRepeatedTiers(item);
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Product Type Contains Repeated Tiers');
          expect(error.details).toBe('Product type contains repeated tiers');
        }
      });

      it('should return null if product type does not contain repeated tiers', () => {
        const item: FeedItem = { id: '1', product_type: 'Electronics > Gadgets' };
        const error = errorCheckers.checkProductTypeRepeatedTiers(item);
        expect(error).toBeNull();
      });
    });

    describe('checkProductTypeWhitespace', () => {
      it('should return an error if product type has whitespace at start or end', () => {
        const item: FeedItem = { id: '1', product_type: ' Electronics ' };
        const error = errorCheckers.checkProductTypeWhitespace(item);
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Whitespace at Product Type Start/End');
          expect(error.details).toBe('Product type contains whitespace at start or end');
        }
      });

      it('should return null if product type has no whitespace at start or end', () => {
        const item: FeedItem = { id: '1', product_type: 'Electronics' };
        const error = errorCheckers.checkProductTypeWhitespace(item);
        expect(error).toBeNull();
      });
    });

    describe('checkProductTypeRepeatedWhitespace', () => {
      it('should return an error if product type contains repeated whitespace', () => {
        const item: FeedItem = { id: '1', product_type: 'Electronics  Gadgets' };
        const error = errorCheckers.checkProductTypeRepeatedWhitespace(item);
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Repeated Whitespace in Product Type');
          expect(error.details).toBe('Product type contains repeated whitespace');
        }
      });

      it('should return null if product type does not contain repeated whitespace', () => {
        const item: FeedItem = { id: '1', product_type: 'Electronics Gadgets' };
        const error = errorCheckers.checkProductTypeRepeatedWhitespace(item);
        expect(error).toBeNull();
      });
    });

    describe('checkProductTypeAngleBrackets', () => {
      it('should return an error if product type starts or ends with angle brackets', () => {
        const item: FeedItem = { id: '1', product_type: '> Electronics' };
        const error = errorCheckers.checkProductTypeAngleBrackets(item);
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Angle Bracket at Product Type Start or End');
          expect(error.details).toBe('Product type starts or ends with an angle bracket');
        }
      });

      it('should return null if product type does not start or end with angle brackets', () => {
        const item: FeedItem = { id: '1', product_type: 'Electronics' };
        const error = errorCheckers.checkProductTypeAngleBrackets(item);
        expect(error).toBeNull();
      });
    });

  });
});
