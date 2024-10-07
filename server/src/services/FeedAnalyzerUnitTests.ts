import { FeedAnalyzer, FeedItem } from './FeedAnalyzer';

describe('FeedAnalyzer', () => {
  describe('errorCheckers', () => {


/************Missing Spaces after commas***********************/

describe('descriptionMissingSpaces', () => {
  it('should detect a single missing space after comma without numbering', () => {
    const item: FeedItem = {
      id: '1',
      description: 'This is a description,with a missing space.'
    };
    const errors = FeedAnalyzer.errorCheckers.descriptionMissingSpaces(item);
    expect(errors).toHaveLength(1);
    expect(errors[0].errorType).toBe('Missing Spaces After Commas');
    expect(errors[0].details).toBe('Found 1 comma(s) followed by non-space characters');
    expect(errors[0].value).not.toContain('Case 1:');
    expect(errors[0].value).toContain('description,with a missing');
  });

  it('should detect multiple missing spaces after commas with numbering', () => {
    const item: FeedItem = {
      id: '2',
      description: 'This is a description,with missing spaces,after commas. Another,example here.'
    };
    const errors = FeedAnalyzer.errorCheckers.descriptionMissingSpaces(item);
    expect(errors).toHaveLength(1);
    expect(errors[0].errorType).toBe('Missing Spaces After Commas');
    expect(errors[0].details).toBe('Found 3 comma(s) followed by non-space characters');
    expect(errors[0].value).toContain('Case 1:');
    expect(errors[0].value).toContain('Case 2:');
    expect(errors[0].value).toContain('Case 3:');
  });

  it('should not report errors when spaces are correct', () => {
    const item: FeedItem = {
      id: '3',
      description: 'This is a description, with correct spaces, after commas.'
    };
    const errors = FeedAnalyzer.errorCheckers.descriptionMissingSpaces(item);
    expect(errors).toHaveLength(0);
  });

  it('should not report errors for numbers with commas', () => {
    const item: FeedItem = {
      id: '4',
      description: 'The price is $6,886,187 for this item.'
    };
    const errors = FeedAnalyzer.errorCheckers.descriptionMissingSpaces(item);
    expect(errors).toHaveLength(0);
  });
});


/***************************************************************** */
    describe('titleDuplicateWords', () => {
      it('should detect duplicate words in title', () => {
        const item: FeedItem = {
          id: '3',
          title: 'Nike Air Jordan Jordan Shoes'
        };
        const errors = FeedAnalyzer.errorCheckers.titleDuplicateWords(item);
        expect(errors).toHaveLength(1);
        expect(errors[0].errorType).toBe('Duplicate Words in Title');
        expect(errors[0].details).toContain('jordan');
      });

      it('should not report errors when no duplicates exist', () => {
        const item: FeedItem = {
          id: '4',
          title: 'Nike Air Jordan Shoes'
        };
        const errors = FeedAnalyzer.errorCheckers.titleDuplicateWords(item);
        expect(errors).toHaveLength(0);
      });
    });




    describe('titleSizeCheck', () => {
      it('should detect missing size in title when size is set', () => {
        const item: FeedItem = {
          id: '5',
          title: 'Nike Running Shoes',
          size: 'L'
        };
        console.log('Test input:', JSON.stringify(item));
        const errors = FeedAnalyzer.errorCheckers.titleSizeCheck(item);
        console.log('Errors returned:', JSON.stringify(errors));
        expect(errors).toHaveLength(1);
        expect(errors[0].errorType).toBe('Size Mismatch');
        expect(errors[0].details).toContain('L');
      });

      it('should not report errors when size is in title', () => {
        const item: FeedItem = {
          id: '6',
          title: 'Nike Running Shoes - Large',
          size: 'Large'
        };
        const errors = FeedAnalyzer.errorCheckers.titleSizeCheck(item);
        expect(errors).toHaveLength(0);
      });

      it('should not report errors when size abbreviation is in title', () => {
        const item: FeedItem = {
          id: '7',
          title: 'Nike Running Shoes - L',
          size: 'L'
        };
        const errors = FeedAnalyzer.errorCheckers.titleSizeCheck(item);
        expect(errors).toHaveLength(0);
      });

      it('should not report errors when size is not set', () => {
        const item: FeedItem = {
          id: '8',
          title: 'Nike Running Shoes'
        };
        const errors = FeedAnalyzer.errorCheckers.titleSizeCheck(item);
        expect(errors).toHaveLength(0);
      });

      it('should detect missing size when size is part of a word', () => {
        const item: FeedItem = {
          id: '9',
          title: 'Nike Large-Logo Running Shoes',
          size: 'L'
        };
        const errors = FeedAnalyzer.errorCheckers.titleSizeCheck(item);
        expect(errors).toHaveLength(1);
        expect(errors[0].errorType).toBe('Size Mismatch');
      });
    });





    describe('titleColorCheck', () => {
      it('should detect missing color in title when color is set', () => {
        const item: FeedItem = {
          id: '7',
          title: 'Nike Running Shoes',
          color: 'Red'
        };
        const errors = FeedAnalyzer.errorCheckers.titleColorCheck(item);
        expect(errors).toHaveLength(1);
        expect(errors[0].errorType).toBe('Color Mismatch');
      });

      it('should not report errors when color is in title', () => {
        const item: FeedItem = {
          id: '8',
          title: 'Nike Red Running Shoes',
          color: 'Red'
        };
        const errors = FeedAnalyzer.errorCheckers.titleColorCheck(item);
        expect(errors).toHaveLength(0);
      });
    });
  });

  // Add more tests for the FeedAnalyzer class if needed
});