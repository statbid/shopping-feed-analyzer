import { FeedItem, ErrorResult } from '../types';
import * as errorCheckers from '../errorCheckers';

describe('FeedAnalyzer', () => {
  describe('errorCheckers', () => {




    /****************************************** */
    describe('titleSizeCheck', () => {
      it('should detect missing size in title when size is set', () => {
        const item: FeedItem = {
          id: '1',
          title: 'Nike Running Shoes',
          size: 'L'
        };
        const error = errorCheckers.checkTitleSize(item);
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Size Mismatch');
          expect(error.details).toContain('L');
        }
      });

      it('should not report errors when size is in title', () => {
        const item: FeedItem = {
          id: '2',
          title: 'Nike Running Shoes - Large',
          size: 'Large'
        };
        const error = errorCheckers.checkTitleSize(item);
        expect(error).toBeNull();
      });

      it('should not report errors when size abbreviation is in title', () => {
        const item: FeedItem = {
          id: '3',
          title: 'Nike Running Shoes - L',
          size: 'L'
        };
        const error = errorCheckers.checkTitleSize(item);
        expect(error).toBeNull();
      });

      it('should not report errors when size is not set', () => {
        const item: FeedItem = {
          id: '4',
          title: 'Nike Running Shoes'
        };
        const error = errorCheckers.checkTitleSize(item);
        expect(error).toBeNull();
      });

      it('should not report errors when complex size is in title', () => {
        const item: FeedItem = {
          id: '5',
          title: 'Monkeysports Premium Senior Practice Hockey Jersey in Orange/White Size Goal Cut (Senior)',
          size: 'Goal Cut (Senior)'
        };
        const error = errorCheckers.checkTitleSize(item);
        expect(error).toBeNull();
      });

      it('should not report errors when size with inches is in title', () => {
        const item: FeedItem = {
          id: '6',
          title: 'Bauer Vapor 3X Junior Hockey Gloves in Black/Red Size 11in',
          size: '11in.'
        };
        const error = errorCheckers.checkTitleSize(item);
        expect(error).toBeNull();
      });

      it('should detect missing size when size is part of a word', () => {
        const item: FeedItem = {
          id: '7',
          title: 'Nike Large-Logo Running Shoes',
          size: 'L'
        };
        const error = errorCheckers.checkTitleSize(item);
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Size Mismatch');
        }
      });

      it('should detect size at the beginning of the title', () => {
        const item: FeedItem = {
          id: '8',
          title: 'XL T-Shirt in Blue',
          size: 'XL'
        };
        const error = errorCheckers.checkTitleSize(item);
        expect(error).toBeNull();
      });

      it('should detect size at the end of the title', () => {
        const item: FeedItem = {
          id: '9',
          title: 'Blue T-Shirt XL',
          size: 'XL'
        };
        const error = errorCheckers.checkTitleSize(item);
        expect(error).toBeNull();
      });


      it('should not report errors when size with optional period is in title', () => {
        const item: FeedItem = {
          id: '10',
          title: 'Warrior Ritual V1 Pro Intermediate Goalie Stick in Silver/White/Red Size 23.5in',
          size: '23.5in.',
        };
        const error = errorCheckers.checkTitleSize(item);
        expect(error).toBeNull();
      });


    });

   
    



     describe('titleColorCheck', () => {
      it('should detect missing color in title when color is set', () => {
        const item: FeedItem = {
          id: '1',
          title: 'Nike Running Shoes',
          color: 'Red'
        };
        const error = errorCheckers.checkTitleColor(item);
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Color Mismatch');
          expect(error.details).toContain('Red');
        }
      });
    
      it('should not report errors when color is in title', () => {
        const item: FeedItem = {
          id: '2',
          title: 'Relay Petite in Gold with Blue Water Lenses',
          color: 'Gold/Blue Water'
        };
        const error = errorCheckers.checkTitleColor(item);
        expect(error).toBeNull();
      });
    
      it('should detect missing color components in title', () => {
        const item: FeedItem = {
          id: '3',
          title: 'Relay Petite in Gold Lenses',
          color: 'Gold/Blue Water'
        };
        const error = errorCheckers.checkTitleColor(item);
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Color Mismatch');
          expect(error.details).toContain('Blue Water');
        }
      });
    
      it('should not report errors when title contains all color components', () => {
        const item: FeedItem = {
          id: '4',
          title: 'Stylish Gold Blue Water Sneakers',
          color: 'Gold/Blue Water'
        };
        const error = errorCheckers.checkTitleColor(item);
        expect(error).toBeNull();
      });
    });


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
      
  











/*********** Unit Tests for Non-Breaking Spaces Check ******************** */

describe('checkTitleNonBreakingSpaces', () => {
  it('should return null when there are no non-breaking spaces', () => {
    const item: FeedItem = {
      id: '1',
      title: 'Nike Running Shoes'
    };
    const error = errorCheckers.checkTitleNonBreakingSpaces(item);
    expect(error).toBeNull();
  });

  it('should detect non-breaking spaces in the title', () => {
    const item: FeedItem = {
      id: '2',
      title: 'Nike Running Shoes' // Contains non-breaking spaces
    };
    const error = errorCheckers.checkTitleNonBreakingSpaces(item);
    
    expect(error).not.toBeNull();
    if (error) {
      expect(error.errorType).toBe('Non-Breaking Spaces in Title');
      expect(error.details).toBe('Title contains non-breaking spaces');
      expect(error.value).toBe(item.title);
    }
  });

});





/************ Unit Tests for Product Description Too Long ************************** */
describe('checkDescriptionLength', () => {
  const MAX_DESCRIPTION_LENGTH = 5000;

  it('should return null when the description is within the limit', () => {
    const item: FeedItem = {
      id: '1',
      description: 'This is a short description within the limit.'
    };
    const error = errorCheckers.checkDescriptionLength(item);
    expect(error).toBeNull();
  });

  it('should detect when the description exceeds the limit', () => {
    const longDescription = 'a'.repeat(5050); // Create a string with 5050 'a' characters
    const item: FeedItem = {
      id: '2',
      description: longDescription
    };
    const error = errorCheckers.checkDescriptionLength(item);
    expect(error).not.toBeNull();
    if (error) {
      expect(error.errorType).toBe('Description Too Long');
      expect(error.details).toBe('Description exceeds 5000 characters (current length: 5050)');
      expect(error.value).toBe(`${longDescription.substring(0, 50)}...${longDescription.substring(5000)}`);
    }
  });

  it('should handle an empty description without returning an error', () => {
    const item: FeedItem = {
      id: '3',
      description: ''
    };
    const error = errorCheckers.checkDescriptionLength(item);
    expect(error).toBeNull();
  });
});





































    
  });
});
