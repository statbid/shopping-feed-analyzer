import { FeedItem, ErrorResult } from '@shopping-feed/types';
import * as errorCheckers from '../../errorCheckers';

describe('ID Checks', () => {

  describe('checkIdLength', () => {
    it('should return an error if ID length exceeds MAX_ID_LENGTH', () => {
      const longId = 'A'.repeat(101); // Assume MAX_ID_LENGTH is 100
      const item: FeedItem = { id: longId };
      const error = errorCheckers.checkIdLength(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Id Too Long');
        expect(error.details).toContain('exceeds');
        expect(error.affectedField).toBe('id');
      }
    });

    it('should return null if ID length is within MAX_ID_LENGTH', () => {
      const validId = 'A'.repeat(50); // Within MAX_ID_LENGTH
      const item: FeedItem = { id: validId };
      const error = errorCheckers.checkIdLength(item);
      expect(error).toBeNull();
    });
  });

  describe('checkIdIsSet', () => {
    it('should return an error if ID is not set or blank', () => {
      const item: FeedItem = { id: '' };
      const error = errorCheckers.checkIdIsSet(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Id Not Set');
        expect(error.details).toContain('blank or not set');
        expect(error.affectedField).toBe('id');
      }
    });

    it('should return null if ID is set', () => {
      const item: FeedItem = { id: '12345' };
      const error = errorCheckers.checkIdIsSet(item);
      expect(error).toBeNull();
    });
  });

});
