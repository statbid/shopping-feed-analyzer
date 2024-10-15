import { FeedItem, ErrorResult } from '../types';
import * as errorCheckers from '../errorCheckers';

describe('FeedAnalyzer', () => {
  describe('errorCheckers', () => {




    /******Title contains duplicate words like Nike Air Jordan Jordan Shoes**************************** */
    
    describe('titleDuplicateWordsCheck', () => {
        it('should return null when there are no duplicate words', () => {
          const item: FeedItem = {
            id: '1',
            title: 'Nike Running Shoes'
          };
          const error = errorCheckers.checkTitleDuplicateWords(item);
          expect(error).toBeNull();
        });
      
        it('should detect duplicate words in the title', () => {
          const item: FeedItem = {
            id: '2',
            title: 'Nike Air Jordan Jordan Shoes'
          };
          const error = errorCheckers.checkTitleDuplicateWords(item);
          
          expect(error).not.toBeNull();
          if (error) {
            expect(error.errorType).toBe('Duplicate Words in Title');
            expect(error.details).toContain('Title contains duplicate words: jordan');
          }
        });
         
        it('should ignore numeric values with units', () => {
          const item: FeedItem = {
            id: '4',
            title: 'Nike 12in Jordan 12ft Shoes'
          };
          const error = errorCheckers.checkTitleDuplicateWords(item);
          expect(error).toBeNull();
        });
         
      
        it('should detect multiple duplicate words', () => {
          const item: FeedItem = {
            id: '5',
            title: 'Nike Jordan Jordan Shoes Shoes'
          };
          const error = errorCheckers.checkTitleDuplicateWords(item);
          
          expect(error).not.toBeNull();
          if (error) {
            expect(error.errorType).toBe('Duplicate Words in Title');
            expect(error.details).toContain('Title contains duplicate words: jordan, shoes');
           
          }
        });
      
      });
      
  













    
  });
});
