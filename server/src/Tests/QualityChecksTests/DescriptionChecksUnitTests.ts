import { FeedItem, ErrorResult } from '@shopping-feed/types';
import * as errorCheckers from '../../errorCheckers';

describe('DescriptionChecker', () => {

  describe('checkDescriptionMissingSpaces', () => {
    it('should return an error if description contains missing spaces after commas', () => {
      const item: FeedItem = { id: '1', description: 'This is an example,with a missing space' };
      const error = errorCheckers.checkDescriptionMissingSpaces(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Description Contains Missing Spaces After Commas');
        expect(error.details).toContain('Missing Spaces After Commas');
      }
    });

    it('should return null if description does not contain missing spaces after commas', () => {
      const item: FeedItem = { id: '1', description: 'This is an example, with proper spacing' };
      const error = errorCheckers.checkDescriptionMissingSpaces(item);
      expect(error).toBeNull();
    });
  });

  describe('checkDescriptionRepeatedDashes', () => {
    it('should return an error if description contains repeated dashes', () => {
      const item: FeedItem = { id: '1', description: 'This description has -- repeated dashes' };
      const error = errorCheckers.checkDescriptionRepeatedDashes(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Description Contains Repeated Dashes');
      }
    });

    it('should return null if description does not contain repeated dashes', () => {
      const item: FeedItem = { id: '1', description: 'This description has single dashes - only' };
      const error = errorCheckers.checkDescriptionRepeatedDashes(item);
      expect(error).toBeNull();
    });
  });

  describe('checkDescriptionWhitespace', () => {
    it('should return an error if description has whitespace at start or end', () => {
      const item: FeedItem = { id: '1', description: '  This description has leading and trailing spaces  ' };
      const error = errorCheckers.checkDescriptionWhitespace(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Description Contains Whitespace at Start or End');
      }
    });

    it('should return null if description has no whitespace at start or end', () => {
      const item: FeedItem = { id: '1', description: 'This description is well formatted' };
      const error = errorCheckers.checkDescriptionWhitespace(item);
      expect(error).toBeNull();
    });
  });

  describe('checkDescriptionRepeatedWhitespace', () => {
    it('should return an error if description contains repeated whitespace', () => {
      const item: FeedItem = { id: '1', description: 'This  description has repeated whitespace' };
      const error = errorCheckers.checkDescriptionRepeatedWhitespace(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Description Contains Repeated Whitespace');
      }
    });

    it('should return null if description does not contain repeated whitespace', () => {
      const item: FeedItem = { id: '1', description: 'This description has proper spacing' };
      const error = errorCheckers.checkDescriptionRepeatedWhitespace(item);
      expect(error).toBeNull();
    });
  });

  describe('checkDescriptionRepeatedCommas', () => {
    it('should return an error if description contains repeated commas', () => {
      const item: FeedItem = { id: '1', description: 'This description has,, repeated commas' };
      const error = errorCheckers.checkDescriptionRepeatedCommas(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Description Contains Repeated Commas');
      }
    });

    it('should return null if description does not contain repeated commas', () => {
      const item: FeedItem = { id: '1', description: 'This description has, proper, commas' };
      const error = errorCheckers.checkDescriptionRepeatedCommas(item);
      expect(error).toBeNull();
    });
  });

  describe('checkDescriptionHtml', () => {
    it('should return an error if description contains HTML tags', () => {
      const item: FeedItem = { id: '1', description: 'This description has <b>HTML</b> tags' };
      const error = errorCheckers.checkDescriptionHtml(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Description Contains HTML');
      }
    });

    it('should return null if description does not contain HTML tags', () => {
      const item: FeedItem = { id: '1', description: 'This description has no HTML tags' };
      const error = errorCheckers.checkDescriptionHtml(item);
      expect(error).toBeNull();
    });
  });

  describe('checkDescriptionHtmlEntities', () => {
    it('should return an error if description contains HTML entities', () => {
      const item: FeedItem = { id: '1', description: 'This description has &copy; entities' };
      const error = errorCheckers.checkDescriptionHtmlEntities(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Description Contains HTML Entities');
      }
    });

    it('should return null if description does not contain HTML entities', () => {
      const item: FeedItem = { id: '1', description: 'This description has no HTML entities' };
      const error = errorCheckers.checkDescriptionHtmlEntities(item);
      expect(error).toBeNull();
    });
  });

  describe('checkDescriptionPromotionalWords', () => {
    it('should return an error if description contains promotional words', () => {
      const item: FeedItem = { id: '1', description: 'This description offers free shipping' };
      const error = errorCheckers.checkDescriptionPromotionalWords(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Description contains Promotional Words');
      }
    });

    it('should return null if description does not contain promotional words', () => {
      const item: FeedItem = { id: '1', description: 'This description is promotional-free' };
      const error = errorCheckers.checkDescriptionPromotionalWords(item);
      expect(error).toBeNull();
    });
  });

  describe('checkDescriptionNonBreakingSpaces', () => {
    it('should return an error if description contains non-breaking spaces', () => {
      const item: FeedItem = { id: '1', description: 'This description has non-breaking spaces\u00A0.' };
      const error = errorCheckers.checkDescriptionNonBreakingSpaces(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Description Contains Nonbreaking Spaces');
      }
    });

    it('should return null if description does not contain non-breaking spaces', () => {
      const item: FeedItem = { id: '1', description: 'This description has regular spaces.' };
      const error = errorCheckers.checkDescriptionNonBreakingSpaces(item);
      expect(error).toBeNull();
    });
  });

 

});
