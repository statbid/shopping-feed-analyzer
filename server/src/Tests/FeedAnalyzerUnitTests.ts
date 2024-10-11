import { FeedItem, ErrorResult } from '../types';
import * as errorCheckers from '../errorCheckers';

describe('FeedAnalyzer', () => {
  describe('errorCheckers', () => {

    /************Missing Spaces after commas***********************/

    describe('descriptionMissingSpaces', () => {
      it('should detect a single missing space after comma without numbering', () => {
        const item: FeedItem = {
          id: '1',
          description: 'This is a description,with a missing space.'
        };
        const error = errorCheckers.checkDescriptionMissingSpaces(item);
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Missing Spaces After Commas');
          expect(error.details).toBe('Found 1 comma(s) followed by non-space characters');
          expect(error.value).toContain('description,with a missing');
        }
      });
    
      it('should detect multiple missing spaces after commas with numbering', () => {
        const item: FeedItem = {
          id: '2',
          description: 'This is a description,with missing spaces,after commas. Another,example here.'
        };
        const error = errorCheckers.checkDescriptionMissingSpaces(item);
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Missing Spaces After Commas');
          expect(error.details).toBe('Found 3 comma(s) followed by non-space characters');
          expect(error.value).toContain('Case 1:');
          expect(error.value).toContain('Case 2:');
          expect(error.value).toContain('Case 3:');
        }
      });
    
      it('should not report errors when spaces are correct', () => {
        const item: FeedItem = {
          id: '3',
          description: 'This is a description, with correct spaces, after commas.'
        };
        const error = errorCheckers.checkDescriptionMissingSpaces(item);
        expect(error).toBeNull();
      });
    
      it('should not report errors for numbers with commas', () => {
        const item: FeedItem = {
          id: '4',
          description: 'The price is $6,886,187 for this item.'
        };
        const error = errorCheckers.checkDescriptionMissingSpaces(item);
        expect(error).toBeNull();
      });
    });


    /****************************************** */

    describe('titleSizeCheck', () => {
      it('should detect missing size in title when size is set', () => {
        const item: FeedItem = {
          id: '5',
          title: 'Nike Running Shoes',
          size: 'L'
        };
        console.log('Test input:', JSON.stringify(item));
        const error = errorCheckers.checkTitleSize(item);
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Size Mismatch');
          expect(error.details).toContain('L');
        }
      });

      it('should not report errors when size is in title', () => {
        const item: FeedItem = {
          id: '6',
          title: 'Nike Running Shoes - Large',
          size: 'Large'
        };
        const error = errorCheckers.checkTitleSize(item);
        expect(error).toHaveLength(0);
      });

      it('should not report errors when size abbreviation is in title', () => {
        const item: FeedItem = {
          id: '7',
          title: 'Nike Running Shoes - L',
          size: 'L'
        };
        const error = errorCheckers.checkTitleSize(item);
        expect(error).toHaveLength(0);
      });

      it('should not report errors when size is not set', () => {
        const item: FeedItem = {
          id: '8',
          title: 'Nike Running Shoes'
        };
        const error = errorCheckers.checkTitleSize(item);
        expect(error).toHaveLength(0);
      });

      it('should detect missing size when size is part of a word', () => {
        const item: FeedItem = {
          id: '9',
          title: 'Nike Large-Logo Running Shoes',
          size: 'L'
        };
        const error = errorCheckers.checkTitleSize(item);
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Size Mismatch');
        }
      });
    });


 

  });
});
