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

   
    


    /************Missing Spaces after commas***********************/
    describe('descriptionMissingSpacesCheck', () => {
      it('should return null when there is no description', () => {
        const item: FeedItem = { id: '1', description: '' };
        const error = errorCheckers.checkDescriptionMissingSpaces(item);
        expect(error).toBeNull();
      });
    
      it('should return null when there are no matches', () => {
        const item: FeedItem = { id: '2', description: 'This description, is perfectly formatted.' };
        const error = errorCheckers.checkDescriptionMissingSpaces(item);
        expect(error).toBeNull();
      });
    
      it('should return one instance without case numbering when there is one match', () => {
        const item: FeedItem = { id: '3', description: 'This handmade,acetate frame is great.' };
        const error = errorCheckers.checkDescriptionMissingSpaces(item);
        
        expect(error).not.toBeNull();
        if (error) {
          expect(error.details).toBe('Found 1 instance(s) of Missing Spaces After Commas');
          expect(error.value).toBe('\".This handmade,acetate frame i..\"');
        }
      });
    
      it('should return multiple instances with case numbering when there are multiple matches', () => {
        const item: FeedItem = { id: '4', description: 'This handmade,acetate frame is unique,craftsmanship is key.' };
        const error = errorCheckers.checkDescriptionMissingSpaces(item);
        
        expect(error).not.toBeNull();
        if (error) {
          expect(error.details).toBe('Found 2 instance(s) of Missing Spaces After Commas');
          expect(error.value).toContain('(case 1) \".This handmade,acetate frame i..\"; (case 2) \"..cetate frame is unique,craftsmanship is..\"');
          
        }
      });
    
      it('should return all instances when there are more matches', () => {
        const item: FeedItem = { 
          id: '5', 
          description: 'This handmade,acetate frame,unique design,craftsmanship is key,work of art,beauty.' 
        };
        const error = errorCheckers.checkDescriptionMissingSpaces(item);
        
        expect(error).not.toBeNull();
        if (error) {
          expect(error.details).toBe('Found 5 instance(s) of Missing Spaces After Commas');
          expect(error.value).toContain('(case 1) \".This handmade,acetate frame,u..\"; (case 2) \"..handmade,acetate frame,unique design,cra..\"; (case 3) \"..te frame,unique design,craftsmanship is..\"; (case 4) \"..,craftsmanship is key,work of art,beauty..\"; (case 5) \"..ip is key,work of art,beauty..\"');

        }
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


/******************************** */
    describe('googleProductCategoryCheck', () => {
      it('should return an error when Google Product Category is not set', () => {
        const item: FeedItem = {
          id: '1',
          google_product_category: ''
        };
        const error = errorCheckers.checkGoogleProductCategory(item);
        
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Missing Google Product Category');
          expect(error.details).toBe('Google Product Category is not set');
        }
      });
    
      it('should return an error when Google Product Category has fewer than 3 levels', () => {
        const item: FeedItem = {
          id: '2',
          google_product_category: 'Apparel & Accessories'
        };
        const error = errorCheckers.checkGoogleProductCategory(item);
        
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Unspecific Google Product Category');
          expect(error.details).toBe('Google Product Category isn\'t specific enough (less than 3 levels)');
        }
      });
    
      it('should return null when Google Product Category has exactly 3 levels', () => {
        const item: FeedItem = {
          id: '3',
          google_product_category: 'Apparel & Accessories > Clothing > Dresses'
        };
        const error = errorCheckers.checkGoogleProductCategory(item);
        expect(error).toBeNull();
      });
    
      it('should return null when Google Product Category has more than 3 levels', () => {
        const item: FeedItem = {
          id: '4',
          google_product_category: 'Apparel & Accessories > Clothing > Dresses > Casual Dresses'
        };
        const error = errorCheckers.checkGoogleProductCategory(item);
        expect(error).toBeNull();
      });
    
      it('should handle categories with extra spaces', () => {
        const item: FeedItem = {
          id: '5',
          google_product_category: '  Apparel & Accessories  > Clothing  > Dresses   '
        };
        const error = errorCheckers.checkGoogleProductCategory(item);
        expect(error).toBeNull();
      });
    });
    



    describe('productTypeCheck', () => {
      it('should return an error when Product Type is not set', () => {
        const item: FeedItem = {
          id: '1',
          product_type: ''
        };
        const error = errorCheckers.checkProductType(item);
        
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Missing Product Type');
          expect(error.details).toBe('Product Type is not set');
          expect(error.affectedField).toBe('product_type');
          expect(error.value).toBe('');
        }
      });
    
      it('should return an error when Product Type is only whitespace', () => {
        const item: FeedItem = {
          id: '2',
          product_type: '   ' // Whitespace only
        };
        const error = errorCheckers.checkProductType(item);
        
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Missing Product Type');
          expect(error.details).toBe('Product Type is not set');
          expect(error.affectedField).toBe('product_type');
          expect(error.value).toBe('   ');
        }
      });
    
      it('should return null when Product Type is properly set', () => {
        const item: FeedItem = {
          id: '3',
          product_type: 'Apparel & Accessories > Clothing > Dresses'
        };
        const error = errorCheckers.checkProductType(item);
        expect(error).toBeNull();
      });
    });
    

    describe('apparelAttributesCheck', () => {
      it('should return null when the product category does not contain "apparel"', () => {
        const item: FeedItem = {
          id: '1',
          google_product_category: 'Electronics > Audio > Headphones',
          color: 'Black',
          size: 'Medium',
          gender: 'unisex',
          age_group: 'adult'
        };
        const error = errorCheckers.checkApparelAttributes(item);
        expect(error).toBeNull();
      });
    
      it('should return null when all apparel attributes are set', () => {
        const item: FeedItem = {
          id: '2',
          google_product_category: 'Apparel & Accessories > Clothing > Shirts',
          color: 'Red',
          size: 'Large',
          gender: 'male',
          age_group: 'adult'
        };
        const error = errorCheckers.checkApparelAttributes(item);
        expect(error).toBeNull();
      });
    
      it('should return an error when an apparel item is missing the color attribute', () => {
        const item: FeedItem = {
          id: '3',
          google_product_category: 'Apparel & Accessories > Clothing > Shirts',
          size: 'Large',
          gender: 'male',
          age_group: 'adult'
        };
        const error = errorCheckers.checkApparelAttributes(item);
        
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Missing Apparel Attributes');
          expect(error.details).toContain('color');
        }
      });
    
      it('should return an error when an apparel item is missing the size attribute', () => {
        const item: FeedItem = {
          id: '4',
          google_product_category: 'Apparel & Accessories > Clothing > Shirts',
          color: 'Red',
          gender: 'female',
          age_group: 'kids'
        };
        const error = errorCheckers.checkApparelAttributes(item);
        
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Missing Apparel Attributes');
          expect(error.details).toContain('size');
        }
      });
    
      it('should return an error when an apparel item is missing multiple attributes', () => {
        const item: FeedItem = {
          id: '5',
          google_product_category: 'Apparel & Accessories > Clothing > Shirts',
          color: 'Blue'
        };
        const error = errorCheckers.checkApparelAttributes(item);
        
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Missing Apparel Attributes');
          expect(error.details).toContain('size');
          expect(error.details).toContain('gender');
          expect(error.details).toContain('age_group');
        }
      });
    
      it('should return an error when an apparel item is missing all attributes', () => {
        const item: FeedItem = {
          id: '6',
          google_product_category: 'Apparel & Accessories > Clothing > Shirts'
        };
        const error = errorCheckers.checkApparelAttributes(item);
        
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Missing Apparel Attributes');
          expect(error.details).toContain('color');
          expect(error.details).toContain('size');
          expect(error.details).toContain('gender');
          expect(error.details).toContain('age_group');
        }
      });
    });
    



    describe('descriptionRepeatedDashesCheck', () => {
      it('should return null when there are no repeated dashes', () => {
        const item: FeedItem = { id: '1', description: 'This is a normal description.' };
        const error = errorCheckers.checkDescriptionRepeatedDashes(item);
        expect(error).toBeNull();
      });
    
      it('should return an error when repeated dashes are found', () => {
        const item: FeedItem = { id: '2', description: 'This is a description with repeated--dashes.' };
        const error = errorCheckers.checkDescriptionRepeatedDashes(item);
        
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Repeated Dashes in Description');
          expect(error.details).toContain('1 instance(s)');
          expect(error.value).toContain('repeated--dashes');
        }
      });
    
      it('should return multiple instances of repeated dashes with context', () => {
        const item: FeedItem = { id: '3', description: 'First repeated--dashes here. Another--dash there.' };
        const error = errorCheckers.checkDescriptionRepeatedDashes(item);
        
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Repeated Dashes in Description');
          expect(error.details).toContain('2 instance(s)');
          expect(error.value).toContain('(case 1)');
          expect(error.value).toContain('(case 2)');
        }
      });
    
     
    });
    



    describe('titleBadAbbreviationsCheck', () => {
      it('should return an error for bad abbreviations in title', () => {
        const item: FeedItem = { id: '1', title: 'Package contains 2 pck and 1 pkg' };
        const error = errorCheckers.checkTitleBadAbbreviations(item);
        
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Bad Abbreviations in Title');
          expect(error.details).toContain('pck');
          expect(error.details).toContain('pkg');
        }
      });
    
      it('should return null for valid abbreviations like "2pcs"', () => {
        const item: FeedItem = { id: '2', title: 'Package contains 2pcs of items' };
        const error = errorCheckers.checkTitleBadAbbreviations(item);
        expect(error).toBeNull();
      });
    
      it('should return an error for standalone "pcs"', () => {
        const item: FeedItem = { id: '3', title: 'Package contains pcs of items' };
        const error = errorCheckers.checkTitleBadAbbreviations(item);
        
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Bad Abbreviations in Title');
          expect(error.details).toContain('pcs');
        }
      });
    
      it('should return null when there are no bad abbreviations', () => {
        const item: FeedItem = { id: '4', title: 'This is a normal title with no bad abbreviations' };
        const error = errorCheckers.checkTitleBadAbbreviations(item);
        expect(error).toBeNull();
      });
    });
    


    describe('googleProductCategoryValidityCheck', () => {
      it('should return an error for purely numeric Google Product Category', () => {
        const item: FeedItem = {
          id: '1',
          google_product_category: '499954'
        };
        const error = errorCheckers.checkGoogleProductCategoryValidity(item);
        
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Invalid Google Product Category');
          expect(error.details).toBe('Google Product Category is invalid (numbered category is not allowed)');
        }
      });
    
      it('should return null for valid hierarchical Google Product Category', () => {
        const item: FeedItem = {
          id: '2',
          google_product_category: 'Animals & Pet Supplies > Pet Supplies'
        };
        const error = errorCheckers.checkGoogleProductCategoryValidity(item);
        expect(error).toBeNull();
      });
    
      it('should return null for a deeper hierarchical Google Product Category', () => {
        const item: FeedItem = {
          id: '3',
          google_product_category: 'Animals & Pet Supplies > Pet Supplies > Cat Supplies > Cat Litter Box Liners'
        };
        const error = errorCheckers.checkGoogleProductCategoryValidity(item);
        expect(error).toBeNull();
      });
    
   
    });
    


    describe('titleSpecialCharactersCheck', () => {
      it('should return null when there are no special characters in the title', () => {
        const item: FeedItem = {
          id: '1',
          title: 'Nike Running Shoes Black'
        };
        const error = errorCheckers.checkTitleSpecialCharacters(item);
        expect(error).toBeNull();
      });
    
      it('should return an error for special characters like "@", "$", and "^"', () => {
        const item: FeedItem = {
          id: '2',
          title: 'Nike Running Shoes @$%^'
        };
        const error = errorCheckers.checkTitleSpecialCharacters(item);
    
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Special Characters in Title');
          expect(error.details).toContain('@');
          expect(error.details).toContain('$');
          expect(error.details).toContain('%');
          expect(error.details).toContain('^');
        }
      });
    
      it('should return an error for quotes (single or double)', () => {
        const item: FeedItem = {
          id: '3',
          title: 'Nike "Air" Jordan\'s'
        };
        const error = errorCheckers.checkTitleSpecialCharacters(item);
    
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Special Characters in Title');
          expect(error.details).toContain('"');
          expect(error.details).toContain("'");
        }
      });
    
      it('should return an error for special characters like "!" and "#"', () => {
        const item: FeedItem = {
          id: '4',
          title: 'Nike Running Shoes #Best!'
        };
        const error = errorCheckers.checkTitleSpecialCharacters(item);
    
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Special Characters in Title');
          expect(error.details).toContain('#');
          expect(error.details).toContain('!');
        }
      });
    
      it('should return null for titles with allowed punctuation marks', () => {
        const item: FeedItem = {
          id: '5',
          title: 'Nike Running Shoes: New Model, (2022 Edition)'
        };
        const error = errorCheckers.checkTitleSpecialCharacters(item);
        expect(error).toBeNull();
      });
    });
    



    describe('titleBrandCheck', () => {
      it('should return null when the full brand is present in the title', () => {
        const item: FeedItem = {
          id: '1',
          title: 'Nike Running Shoes',
          brand: 'Nike'
        };
        const error = errorCheckers.checkTitleBrand(item);
        expect(error).toBeNull();
      });
    
      it('should return null when a partial brand is present in the title', () => {
        const item: FeedItem = {
          id: '2',
          title: 'Jocko GO Energy Drink - Blue Raspberry (12 pk)',
          brand: 'Jocko Fuel'
        };
        const error = errorCheckers.checkTitleBrand(item);
        expect(error).toBeNull();
      });
    
   
    
      it('should return an error when the brand is missing in the title', () => {
        const item: FeedItem = {
          id: '4',
          title: 'Running Shoes',
          brand: 'Nike'
        };
        const error = errorCheckers.checkTitleBrand(item);
    
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Missing Brand in Title');
          expect(error.details).toContain('Nike');
        }
      });
    
    });
    

  
    describe('titleMaterialCheck', () => {
      it('should return null when material is present in the title', () => {
        const item: FeedItem = {
          id: '1',
          title: 'Stainless Steel Water Bottle - 750ml',
          material: 'Stainless Steel'
        };
        const error = errorCheckers.checkTitleMaterial(item);
        expect(error).toBeNull();
      });
    
      it('should return an error when material is missing from the title', () => {
        const item: FeedItem = {
          id: '2',
          title: 'Water Bottle - 750ml',
          material: 'Stainless Steel'
        };
        const error = errorCheckers.checkTitleMaterial(item);
    
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Missing Material in Title');
          expect(error.details).toContain('Stainless Steel');
        }
      });
    
      it('should return null when no material is set', () => {
        const item: FeedItem = {
          id: '3',
          title: 'Plastic Water Bottle - 500ml',
          material: ''
        };
        const error = errorCheckers.checkTitleMaterial(item);
        expect(error).toBeNull();
      });
    
    });
    
    describe('titleWhitespaceCheck', () => {
      it('should return null when there is no whitespace at the start or end of the title', () => {
        const item: FeedItem = {
          id: '1',
          title: 'Nike Running Shoes'
        };
        const error = errorCheckers.checkTitleWhitespace(item);
        expect(error).toBeNull();
      });
    
      it('should return an error when there is whitespace at the start of the title', () => {
        const item: FeedItem = {
          id: '2',
          title: ' Nike Running Shoes'
        };
        const error = errorCheckers.checkTitleWhitespace(item);
    
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Whitespace at Title Start/End');
          expect(error.details).toBe('Title contains whitespace at start or end');
          expect(error.value).toBe(' Nike Running Shoes');
        }
      });
    
      it('should return an error when there is whitespace at the end of the title', () => {
        const item: FeedItem = {
          id: '3',
          title: 'Nike Running Shoes '
        };
        const error = errorCheckers.checkTitleWhitespace(item);
    
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Whitespace at Title Start/End');
          expect(error.details).toBe('Title contains whitespace at start or end');
          expect(error.value).toBe('Nike Running Shoes ');
        }
      });
    
      it('should return an error when there is whitespace at both the start and end of the title', () => {
        const item: FeedItem = {
          id: '4',
          title: ' Nike Running Shoes '
        };
        const error = errorCheckers.checkTitleWhitespace(item);
    
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Whitespace at Title Start/End');
          expect(error.details).toBe('Title contains whitespace at start or end');
          expect(error.value).toBe(' Nike Running Shoes ');
        }
      });
    
      it('should return null when the title does not have whitespace at the start or end but contains whitespace internally', () => {
        const item: FeedItem = {
          id: '5',
          title: 'Nike Running Shoes with extra comfort'
        };
        const error = errorCheckers.checkTitleWhitespace(item);
        expect(error).toBeNull();
      });
    });
    

    describe('titleRepeatedWhitespaceCheck', () => {
      it('should return null when there is no repeated whitespace in the title', () => {
        const item: FeedItem = {
          id: '1',
          title: 'Nike Running Shoes'
        };
        const error = errorCheckers.checkTitleRepeatedWhitespace(item);
        expect(error).toBeNull();
      });
    
      it('should return an error when there is repeated whitespace in the title', () => {
        const item: FeedItem = {
          id: '2',
          title: 'Nike  Running  Shoes'
        };
        const error = errorCheckers.checkTitleRepeatedWhitespace(item);
    
        expect(error).not.toBeNull();
        if (error) {
          expect(error.errorType).toBe('Repeated Whitespace in Title');
          expect(error.details).toBe('Title contains repeated whitespace');
          expect(error.value).toBe('Nike  Running  Shoes');
        }
      });
    
  });




  describe('titleRepeatedDashesCheck', () => {
    it('should return null when there are no repeated dashes in the title', () => {
      const item: FeedItem = {
        id: '1',
        title: 'Nike Running Shoes - New Model'
      };
      const error = errorCheckers.checkTitleRepeatedDashes(item);
      expect(error).toBeNull();
    });
  
    it('should return an error when repeated dashes are present in the title', () => {
      const item: FeedItem = {
        id: '2',
        title: 'Nike--Running--Shoes - New Model'
      };
      const error = errorCheckers.checkTitleRepeatedDashes(item);
  
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Repeated Dashes in Title');
        expect(error.details).toBe('Title contains repeated dashes');
        expect(error.value).toBe('Nike--Running--Shoes - New Model');
      }
    });
  
    it('should return null when single dashes are used appropriately in the title', () => {
      const item: FeedItem = {
        id: '5',
        title: 'Nike - Running - Shoes - New Model'
      };
      const error = errorCheckers.checkTitleRepeatedDashes(item);
      expect(error).toBeNull();
    });
  
  });


  describe('checkTitleRepeatedCommas', () => {
    it('should return null when there are no repeated commas in the title', () => {
      const item: FeedItem = {
        id: '1',
        title: 'Nike Running Shoes, New Model'
      };
      const error = errorCheckers.checkTitleRepeatedCommas(item);
      expect(error).toBeNull();
    });

    it('should return an error when there are repeated commas in the title', () => {
      const item: FeedItem = {
        id: '2',
        title: 'Nike,,Running,,Shoes'
      };
      const error = errorCheckers.checkTitleRepeatedCommas(item);

      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Repeated Commas in Title');
        expect(error.details).toBe('Title contains repeated commas');
        expect(error.value).toBe('Nike,,Running,,Shoes');
      }
    });

  });

  describe('checkTitlePunctuation', () => {
    it('should return null when there is no punctuation at the start or end of the title', () => {
      const item: FeedItem = {
        id: '4',
        title: 'Nike Running Shoes'
      };
      const error = errorCheckers.checkTitlePunctuation(item);
      expect(error).toBeNull();
    });

    it('should return an error when there is punctuation at the start of the title', () => {
      const item: FeedItem = {
        id: '5',
        title: '!Nike Running Shoes'
      };
      const error = errorCheckers.checkTitlePunctuation(item);

      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Punctuation at Title Start/End');
        expect(error.details).toBe('Title contains punctuation at start or end');
        expect(error.value).toBe('!Nike Running Shoes');
      }
    });

    it('should return an error when there is punctuation at the end of the title', () => {
      const item: FeedItem = {
        id: '6',
        title: 'Nike Running Shoes!'
      };
      const error = errorCheckers.checkTitlePunctuation(item);

      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Punctuation at Title Start/End');
        expect(error.details).toBe('Title contains punctuation at start or end');
        expect(error.value).toBe('Nike Running Shoes!');
      }
    });

    it('should return an error when there is punctuation at both the start and end of the title', () => {
      const item: FeedItem = {
        id: '7',
        title: '!Nike Running Shoes!'
      };
      const error = errorCheckers.checkTitlePunctuation(item);

      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Punctuation at Title Start/End');
        expect(error.details).toBe('Title contains punctuation at start or end');
        expect(error.value).toBe('!Nike Running Shoes!');
      }
    });
  });

  describe('checkTitleHtml', () => {
    it('should return null when there are no HTML tags in the title', () => {
      const item: FeedItem = {
        id: '8',
        title: 'Nike Running Shoes'
      };
      const error = errorCheckers.checkTitleHtml(item);
      expect(error).toBeNull();
    });

    it('should return an error when there are HTML tags in the title', () => {
      const item: FeedItem = {
        id: '9',
        title: 'Nike <b>Running</b> Shoes'
      };
      const error = errorCheckers.checkTitleHtml(item);

      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('HTML in Title');
        expect(error.details).toBe('Title contains HTML tags');
        expect(error.value).toBe('Nike <b>Running</b> Shoes');
      }
    });

    it('should return an error when there are multiple HTML tags in the title', () => {
      const item: FeedItem = {
        id: '10',
        title: '<div>Nike Running Shoes</div>'
      };
      const error = errorCheckers.checkTitleHtml(item);

      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('HTML in Title');
        expect(error.details).toBe('Title contains HTML tags');
        expect(error.value).toBe('<div>Nike Running Shoes</div>');
      }
    });
  });



  describe('titleHtmlEntitiesCheck', () => {
    it('should return null when there are no HTML entities in the title', () => {
      const item: FeedItem = {
        id: '1',
        title: 'Nike Running Shoes'
      };
      const error = errorCheckers.checkTitleHtmlEntities(item);
      expect(error).toBeNull();
    });
  
    it('should return an error when there is a registered HTML entity in the title', () => {
      const item: FeedItem = {
        id: '2',
        title: 'Nike Running Shoes &reg; New Model'
      };
      const error = errorCheckers.checkTitleHtmlEntities(item);
  
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('HTML Entities in Title');
        expect(error.details).toBe('Title contains HTML entities');
        expect(error.value).toBe('Nike Running Shoes &reg; New Model');
      }
    });
  
    it('should return an error when there are multiple HTML entities in the title', () => {
      const item: FeedItem = {
        id: '3',
        title: 'Nike &copy; Running Shoes &trade;'
      };
      const error = errorCheckers.checkTitleHtmlEntities(item);
  
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('HTML Entities in Title');
        expect(error.details).toBe('Title contains HTML entities');
        expect(error.value).toBe('Nike &copy; Running Shoes &trade;');
      }
    });
    
  });
  


  describe('titlePromotionalWordsCheck', () => {
    it('should return null when there are no promotional words in the title', () => {
      const item: FeedItem = {
        id: '1',
        title: 'Nike Running Shoes - New Model'
      };
      const error = errorCheckers.checkTitlePromotionalWords(item);
      expect(error).toBeNull();
    });
  
    it('should return an error when a single promotional word is present in the title', () => {
      const item: FeedItem = {
        id: '2',
        title: 'Best Seller Nike Running Shoes'
      };
      const error = errorCheckers.checkTitlePromotionalWords(item);
  
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Promotional Words in Title');
        expect(error.details).toContain('Found 1 promotional word(s): best seller');
        expect(error.value).toContain('\"Best Seller Nike Running Shoes\"');
      }
    });
  
    it('should return an error when multiple promotional words are present in the title', () => {
      const item: FeedItem = {
        id: '3',
        title: 'Save on Nike Running Shoes - Best Seller'
      };
      const error = errorCheckers.checkTitlePromotionalWords(item);
  
      expect(error).not.toBeNull();
      if (error) {
        expect(error.errorType).toBe('Promotional Words in Title');
        expect(error.details).toContain('Found 2 promotional word(s): save, best seller');
        expect(error.value).toContain('\"Save on Nike Running Sho\"');
      }
    });
    
  });
  






























































    



  });
});
