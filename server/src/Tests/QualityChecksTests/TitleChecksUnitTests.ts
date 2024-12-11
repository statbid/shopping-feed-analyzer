import { FeedItem, ErrorResult } from '@shopping-feed/types';
import * as errorCheckers from '../../errorCheckers';

describe('TitleChecker', () => {
  
  describe('checkTitleSize', () => {
    it("should return an error if title doesn't contain size", () => {
      const item: FeedItem = { id: '1', title: 'Product without size', size: 'Large' };
      const error = errorCheckers.checkTitleSize(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe("Title Doesn't Contain Size When Size is Set");
        expect(error.details).toContain(item.size);
      }
    });

    it('should return null if title contains size', () => {
      const item: FeedItem = { id: '1', title: 'Product Large', size: 'Large' };
      const error = errorCheckers.checkTitleSize(item);
      expect(error).toBeNull();
    });
  });

  describe('checkTitleColor', () => {
    it("should return an error if title doesn't contain color", () => {
      const item: FeedItem = { id: '1', title: 'Product', color: 'Red' };
      const error = errorCheckers.checkTitleColor(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe("Title Doesn't Contain Color When Color Is Set");
        expect(error.details).toContain(item.color);
      }
    });

    it('should return null if title contains color', () => {
      const item: FeedItem = { id: '1', title: 'Red Product', color: 'Red' };
      const error = errorCheckers.checkTitleColor(item);
      expect(error).toBeNull();
    });
  });

  describe('checkTitleDuplicateWords', () => {
    it('should return an error if title contains duplicate words', () => {
      const item: FeedItem = { id: '1', title: 'Nike Air Jordan Jordan Shoes' };
      const error = errorCheckers.checkTitleDuplicateWords(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Title Contains Duplicate Words');
        expect(error.details).toContain('Title contains duplicate words: jordan');
      }
    });

    it('should return null if title does not contain duplicate words', () => {
      const item: FeedItem = { id: '1', title: 'Nike Air Jordan Shoes' };
      const error = errorCheckers.checkTitleDuplicateWords(item);
      expect(error).toBeNull();
    });
  });

  describe('checkTitleSpecialCharacters', () => {
    it('should return an error if title contains special characters', () => {
      const item: FeedItem = { id: '1', title: 'Product with @ special character' };
      const error = errorCheckers.checkTitleSpecialCharacters(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Title Contains Special Characters');
        expect(error.details).toContain('@');
      }
    });

    it('should return null if title does not contain special characters', () => {
      const item: FeedItem = { id: '1', title: 'Regular Product Title' };
      const error = errorCheckers.checkTitleSpecialCharacters(item);
      expect(error).toBeNull();
    });
  });

  describe('checkTitleBadAbbreviations', () => {
    it('should return an error if title contains bad abbreviations', () => {
      const item: FeedItem = { id: '1', title: 'Product 1 pck' };
      const error = errorCheckers.checkTitleBadAbbreviations(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Title Contains Bad Abbreviations');
        expect(error.details).toContain('pck');
      }
    });

    it('should return null if title does not contain bad abbreviations', () => {
      const item: FeedItem = { id: '1', title: 'Product 1 pack' };
      const error = errorCheckers.checkTitleBadAbbreviations(item);
      expect(error).toBeNull();
    });
  });

  describe('checkTitleMaterial', () => {
    it("should return an error if title doesn't contain material when material is set", () => {
      const item: FeedItem = { id: '1', title: 'Product', material: 'Leather' };
      const error = errorCheckers.checkTitleMaterial(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe("Title Doesn't Contain Material");
        expect(error.details).toContain(item.material);
      }
    });

    it('should return null if title contains material', () => {
      const item: FeedItem = { id: '1', title: 'Leather Product', material: 'Leather' };
      const error = errorCheckers.checkTitleMaterial(item);
      expect(error).toBeNull();
    });
  });

  describe('checkTitleWhitespace', () => {
    it('should return an error if title has whitespace at the start or end', () => {
      const item: FeedItem = { id: '1', title: ' Product ' };
      const error = errorCheckers.checkTitleWhitespace(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Title Contains Whitespace At Start Or End');
      }
    });

    it('should return null if title has no whitespace at start or end', () => {
      const item: FeedItem = { id: '1', title: 'Product' };
      const error = errorCheckers.checkTitleWhitespace(item);
      expect(error).toBeNull();
    });
  });

  describe('checkTitleRepeatedDashes', () => {
    it('should return an error if title contains repeated dashes', () => {
      const item: FeedItem = { id: '1', title: 'Product -- Extra' };
      const error = errorCheckers.checkTitleRepeatedDashes(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Title Contains Repeated Dashes');
      }
    });

    it('should return null if title does not contain repeated dashes', () => {
      const item: FeedItem = { id: '1', title: 'Product - Extra' };
      const error = errorCheckers.checkTitleRepeatedDashes(item);
      expect(error).toBeNull();
    });
  });
});
