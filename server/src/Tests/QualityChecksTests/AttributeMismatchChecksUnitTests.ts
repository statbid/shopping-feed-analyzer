import { FeedItem } from '@shopping-feed/types';
import * as errorCheckers from '../../errorCheckers';

describe('Attribute Mismatch Checks', () => {
  describe('checkMonitoredPharmacyWords', () => {
    it('should return null when no monitored words are found', () => {
      const item: FeedItem = {
        id: '1',
        title: 'Regular Product',
        description: 'This is a normal product description'
      };
      const result = errorCheckers.checkMonitoredPharmacyWords(item);
      expect(result).toBeNull();
    });

    it('should detect monitored words in the title', () => {
      const item: FeedItem = {
        id: '2',
        title: 'Product with 72 Hours Effect',
        description: 'Normal description'
      };
      const result = errorCheckers.checkMonitoredPharmacyWords(item);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.errorType).toBe('Monitored Pharmacy Words');
        expect(result.details).toContain('72 hours');
        expect(result.affectedField).toBe('title');
      }
    });

    it('should detect monitored words in the description', () => {
      const item: FeedItem = {
        id: '3',
        title: 'Regular Product',
        description: 'This product contains Alteril Fast Acting Softgels'
      };
      const result = errorCheckers.checkMonitoredPharmacyWords(item);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.errorType).toBe('Monitored Pharmacy Words');
        expect(result.details).toContain("Found 1 monitored word(s): Alteril Fast Acting Softgels");
        expect(result.affectedField).toBe('description');
      }
    });
  });

  describe('checkGenderMismatch', () => {
    it('should return null when there is no gender mismatch', () => {
      const item: FeedItem = {
        id: '4',
        title: "Women's Dress",
        gender: 'female'
      };
      const result = errorCheckers.checkGenderMismatch(item);
      expect(result).toBeNull();
    });

    it('should detect gender mismatch - female words in title, male gender', () => {
      const item: FeedItem = {
        id: '5',
        title: "Women's T-Shirt",
        gender: 'male'
      };
      const result = errorCheckers.checkGenderMismatch(item);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.errorType).toBe('Gender Mismatch');
        expect(result.value).toContain("Women's T-Shirt");
        expect(result.value).toContain('male');
      }
    });

    it('should detect gender mismatch - male words in title, female gender', () => {
      const item: FeedItem = {
        id: '6',
        title: "Men's Jeans",
        gender: 'female'
      };
      const result = errorCheckers.checkGenderMismatch(item);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.errorType).toBe('Gender Mismatch');
        expect(result.value).toContain("Men's Jeans");
        expect(result.value).toContain('female');
      }
    });
  });

  describe('checkAgeGroupMismatch', () => {
    it('should return null when there is no age group mismatch', () => {
      const item: FeedItem = {
        id: '7',
        title: "Kid's Toy",
        age_group: 'kids'
      };
      const result = errorCheckers.checkAgeGroupMismatch(item);
      expect(result).toBeNull();
    });

    it('should detect age group mismatch - kid words in title, adult age group', () => {
      const item: FeedItem = {
        id: '8',
        title: "Toddler's Shoes",
        age_group: 'adult'
      };
      const result = errorCheckers.checkAgeGroupMismatch(item);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.errorType).toBe('Age Group Mismatch');
        expect(result.value).toContain("Toddler's Shoes");
        expect(result.value).toContain('adult');
      }
    });

    it('should detect age group mismatch - adult words in title, kid age group', () => {
      const item: FeedItem = {
        id: '9',
        title: "Men's Watch",
        age_group: 'kids'
      };
      const result = errorCheckers.checkAgeGroupMismatch(item);
      expect(result).not.toBeNull();
      if (result) {
        expect(result.errorType).toBe('Age Group Mismatch');
        expect(result.value).toContain("Men's Watch");
        expect(result.value).toContain('kids');
      }
    });
  });
});