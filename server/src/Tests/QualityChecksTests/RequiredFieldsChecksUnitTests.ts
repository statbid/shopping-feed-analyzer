import { FeedItem, ErrorResult } from '@shopping-feed/types';
import * as errorCheckers from '../../errorCheckers';


describe('Required Fields Checks', () => {

  describe('checkLinkIsSet', () => {
    it('should return an error if link is not set or blank', () => {
      const item: FeedItem = { id: '1', link: '' };
      const error = errorCheckers.checkLinkIsSet(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Link Not Set');
        expect(error.details).toBe('Link is blank or not set');
        expect(error.affectedField).toBe('link');
      }
    });

    it('should return null if link is set', () => {
      const item: FeedItem = { id: '1', link: 'http://example.com' };
      const error = errorCheckers.checkLinkIsSet(item);
      expect(error).toBeNull();
    });
  });

  describe('checkImageLink', () => {
    it('should return an error if image link is not set or blank', () => {
      const item: FeedItem = { id: '1', image_link: '' };
      const error = errorCheckers.checkImageLink(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Missing Image Link');
        expect(error.details).toBe('Image link is not set');
        expect(error.affectedField).toBe('image_link');
      }
    });

    it('should return null if image link is set', () => {
      const item: FeedItem = { id: '1', image_link: 'http://example.com/image.jpg' };
      const error = errorCheckers.checkImageLink(item);
      expect(error).toBeNull();
    });
  });

  describe('checkAvailability', () => {
    it('should return an error if availability is not set or blank', () => {
      const item: FeedItem = { id: '1', availability: '' };
      const error = errorCheckers.checkAvailability(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Missing Availability');
        expect(error.details).toBe('Availability is not set');
        expect(error.affectedField).toBe('availability');
      }
    });

    it('should return null if availability is set', () => {
      const item: FeedItem = { id: '1', availability: 'in stock' };
      const error = errorCheckers.checkAvailability(item);
      expect(error).toBeNull();
    });
  });

  describe('checkPrice', () => {
    it('should return an error if price is not set or blank', () => {
      const item: FeedItem = { id: '1', price: '' };
      const error = errorCheckers.checkPrice(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Missing Price');
        expect(error.details).toBe('Price is not set');
        expect(error.affectedField).toBe('price');
      }
    });

    it('should return null if price is set', () => {
      const item: FeedItem = { id: '1', price: '29.99 USD' };
      const error = errorCheckers.checkPrice(item);
      expect(error).toBeNull();
    });
  });

  describe('checkBrand', () => {
    it('should return an error if brand is not set or blank', () => {
      const item: FeedItem = { id: '1', brand: '' };
      const error = errorCheckers.checkBrand(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Missing Brand');
        expect(error.details).toBe('Brand is not set');
        expect(error.affectedField).toBe('brand');
      }
    });

    it('should return null if brand is set', () => {
      const item: FeedItem = { id: '1', brand: 'Nike' };
      const error = errorCheckers.checkBrand(item);
      expect(error).toBeNull();
    });
  });

  describe('checkCondition', () => {
    it('should return an error if condition is not set or blank', () => {
      const item: FeedItem = { id: '1', condition: '' };
      const error = errorCheckers.checkCondition(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Missing Condition');
        expect(error.details).toBe('Condition is not set');
        expect(error.affectedField).toBe('condition');
      }
    });

    it('should return null if condition is set', () => {
      const item: FeedItem = { id: '1', condition: 'new' };
      const error = errorCheckers.checkCondition(item);
      expect(error).toBeNull();
    });
  });

  describe('checkMPN', () => {
    it('should return an error if MPN is not set or blank', () => {
      const item: FeedItem = { id: '1', mpn: '' };
      const error = errorCheckers.checkMPN(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Missing MPN');
        expect(error.details).toBe('Manufacturer Part Number (MPN) is not set');
        expect(error.affectedField).toBe('mpn');
      }
    });

    it('should return null if MPN is set', () => {
      const item: FeedItem = { id: '1', mpn: '12345ABC' };
      const error = errorCheckers.checkMPN(item);
      expect(error).toBeNull();
    });
  });

});
