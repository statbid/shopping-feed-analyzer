import { FeedItem, ErrorResult } from '../types';
import * as errorCheckers from '../errorCheckers';

describe('FeedAnalyzer', () => {
  describe('errorCheckers', () => {



/************ Unit Tests for Availability, Price, Brand, Condition Checks ************************** */

describe('checkAvailability', () => {
    it('should return null when the availability is set', () => {
      const item: FeedItem = { id: '1', availability: 'in stock' };
      const error = errorCheckers.checkAvailability(item);
      expect(error).toBeNull();
    });
  
    it('should return an error when the availability is not set', () => {
      const item: FeedItem = { id: '1', availability: '' };
      const error = errorCheckers.checkAvailability(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Missing Availability');
        expect(error.details).toBe('Availability is not set');
        expect(error.value).toBe('');
      }
    });
  });
  
  describe('checkPrice', () => {
    it('should return null when the price is set', () => {
      const item: FeedItem = { id: '1', price: '19.99' };
      const error = errorCheckers.checkPrice(item);
      expect(error).toBeNull();
    });
  
    it('should return an error when the price is not set', () => {
      const item: FeedItem = { id: '1', price: '' };
      const error = errorCheckers.checkPrice(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Missing Price');
        expect(error.details).toBe('Price is not set');
        expect(error.value).toBe('');
      }
    });
  });
  
  describe('checkBrand', () => {
    it('should return null when the brand is set', () => {
      const item: FeedItem = { id: '1', brand: 'Nike' };
      const error = errorCheckers.checkBrand(item);
      expect(error).toBeNull();
    });
  
    it('should return an error when the brand is not set', () => {
      const item: FeedItem = { id: '1', brand: '' };
      const error = errorCheckers.checkBrand(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Missing Brand');
        expect(error.details).toBe('Brand is not set');
        expect(error.value).toBe('');
      }
    });
  });
  
  describe('checkCondition', () => {
    it('should return null when the condition is set', () => {
      const item: FeedItem = { id: '1', condition: 'new' };
      const error = errorCheckers.checkCondition(item);
      expect(error).toBeNull();
    });
  
    it('should return an error when the condition is not set', () => {
      const item: FeedItem = { id: '1', condition: '' };
      const error = errorCheckers.checkCondition(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Missing Condition');
        expect(error.details).toBe('Condition is not set');
        expect(error.value).toBe('');
      }
    });
  });
  
  /************ Unit Tests for ID Checks ************************** */
  
  describe('checkIdLength', () => {
    const MAX_ID_LENGTH = 50;
  
    it('should return null when the id is within the length limit', () => {
      const item: FeedItem = { id: '12345' };
      const error = errorCheckers.checkIdLength(item);
      expect(error).toBeNull();
    });
  
    it('should return an error when the id exceeds the length limit', () => {
      const longId = 'a'.repeat(51); // 51-character ID
      const item: FeedItem = { id: longId };
      const error = errorCheckers.checkIdLength(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Id Too Long');
        expect(error.details).toBe(`Id exceeds ${MAX_ID_LENGTH} characters`);
        expect(error.value).toBe(longId);
      }
    });
  });
  
  describe('checkIdIsSet', () => {
    it('should return null when the id is set', () => {
      const item: FeedItem = { id: '12345' };
      const error = errorCheckers.checkIdIsSet(item);
      expect(error).toBeNull();
    });
  
    it('should return an error when the id is blank', () => {
      const item: FeedItem = { id: '' };
      const error = errorCheckers.checkIdIsSet(item);
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Id Not Set');
        expect(error.details).toBe('Id is blank or not set');
        expect(error.value).toBe('');
      }
    });
  
  });

});
});
