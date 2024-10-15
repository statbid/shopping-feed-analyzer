"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const errorCheckers = __importStar(require("../errorCheckers"));
describe('FeedAnalyzer', () => {
    describe('errorCheckers', () => {
        /****************************************** */
        describe('titleSizeCheck', () => {
            it('should detect missing size in title when size is set', () => {
                const item = {
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
                const item = {
                    id: '2',
                    title: 'Nike Running Shoes - Large',
                    size: 'Large'
                };
                const error = errorCheckers.checkTitleSize(item);
                expect(error).toBeNull();
            });
            it('should not report errors when size abbreviation is in title', () => {
                const item = {
                    id: '3',
                    title: 'Nike Running Shoes - L',
                    size: 'L'
                };
                const error = errorCheckers.checkTitleSize(item);
                expect(error).toBeNull();
            });
            it('should not report errors when size is not set', () => {
                const item = {
                    id: '4',
                    title: 'Nike Running Shoes'
                };
                const error = errorCheckers.checkTitleSize(item);
                expect(error).toBeNull();
            });
            it('should not report errors when complex size is in title', () => {
                const item = {
                    id: '5',
                    title: 'Monkeysports Premium Senior Practice Hockey Jersey in Orange/White Size Goal Cut (Senior)',
                    size: 'Goal Cut (Senior)'
                };
                const error = errorCheckers.checkTitleSize(item);
                expect(error).toBeNull();
            });
            it('should not report errors when size with inches is in title', () => {
                const item = {
                    id: '6',
                    title: 'Bauer Vapor 3X Junior Hockey Gloves in Black/Red Size 11in',
                    size: '11in.'
                };
                const error = errorCheckers.checkTitleSize(item);
                expect(error).toBeNull();
            });
            it('should detect missing size when size is part of a word', () => {
                const item = {
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
                const item = {
                    id: '8',
                    title: 'XL T-Shirt in Blue',
                    size: 'XL'
                };
                const error = errorCheckers.checkTitleSize(item);
                expect(error).toBeNull();
            });
            it('should detect size at the end of the title', () => {
                const item = {
                    id: '9',
                    title: 'Blue T-Shirt XL',
                    size: 'XL'
                };
                const error = errorCheckers.checkTitleSize(item);
                expect(error).toBeNull();
            });
            it('should not report errors when size with optional period is in title', () => {
                const item = {
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
                const item = { id: '1', description: '' };
                const error = errorCheckers.checkDescriptionMissingSpaces(item);
                expect(error).toBeNull();
            });
            it('should return null when there are no matches', () => {
                const item = { id: '2', description: 'This description, is perfectly formatted.' };
                const error = errorCheckers.checkDescriptionMissingSpaces(item);
                expect(error).toBeNull();
            });
            it('should return one instance without case numbering when there is one match', () => {
                const item = { id: '3', description: 'This handmade,acetate frame is great.' };
                const error = errorCheckers.checkDescriptionMissingSpaces(item);
                expect(error).not.toBeNull();
                if (error) {
                    expect(error.details).toBe('Found 1 instance(s) of Missing Spaces After Commas');
                    expect(error.value).toBe('\".This handmade,acetate frame i..\"');
                }
            });
            it('should return multiple instances with case numbering when there are multiple matches', () => {
                const item = { id: '4', description: 'This handmade,acetate frame is unique,craftsmanship is key.' };
                const error = errorCheckers.checkDescriptionMissingSpaces(item);
                expect(error).not.toBeNull();
                if (error) {
                    expect(error.details).toBe('Found 2 instance(s) of Missing Spaces After Commas');
                    expect(error.value).toContain('(case 1) \".This handmade,acetate frame i..\"; (case 2) \"..cetate frame is unique,craftsmanship is..\"');
                }
            });
            it('should return all instances when there are more matches', () => {
                const item = {
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
                const item = {
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
                const item = {
                    id: '2',
                    title: 'Relay Petite in Gold with Blue Water Lenses',
                    color: 'Gold/Blue Water'
                };
                const error = errorCheckers.checkTitleColor(item);
                expect(error).toBeNull();
            });
            it('should detect missing color components in title', () => {
                const item = {
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
                const item = {
                    id: '4',
                    title: 'Stylish Gold Blue Water Sneakers',
                    color: 'Gold/Blue Water'
                };
                const error = errorCheckers.checkTitleColor(item);
                expect(error).toBeNull();
            });
        });
        /********************************** */
        describe('titleDuplicateWordsCheck', () => {
            it('should return null when there are no duplicate words', () => {
                const item = {
                    id: '1',
                    title: 'Nike Running Shoes'
                };
                const error = errorCheckers.checkTitleDuplicateWords(item);
                expect(error).toBeNull();
            });
            it('should detect duplicate words in the title', () => {
                const item = {
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
                const item = {
                    id: '4',
                    title: 'Nike 12in Jordan 12ft Shoes'
                };
                const error = errorCheckers.checkTitleDuplicateWords(item);
                expect(error).toBeNull();
            });
            it('should detect multiple duplicate words', () => {
                const item = {
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
        /******************************** */
        describe('googleProductCategoryCheck', () => {
            it('should return an error when Google Product Category is not set', () => {
                const item = {
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
                const item = {
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
                const item = {
                    id: '3',
                    google_product_category: 'Apparel & Accessories > Clothing > Dresses'
                };
                const error = errorCheckers.checkGoogleProductCategory(item);
                expect(error).toBeNull();
            });
            it('should return null when Google Product Category has more than 3 levels', () => {
                const item = {
                    id: '4',
                    google_product_category: 'Apparel & Accessories > Clothing > Dresses > Casual Dresses'
                };
                const error = errorCheckers.checkGoogleProductCategory(item);
                expect(error).toBeNull();
            });
            it('should handle categories with extra spaces', () => {
                const item = {
                    id: '5',
                    google_product_category: '  Apparel & Accessories  > Clothing  > Dresses   '
                };
                const error = errorCheckers.checkGoogleProductCategory(item);
                expect(error).toBeNull();
            });
        });
        describe('productTypeCheck', () => {
            it('should return an error when Product Type is not set', () => {
                const item = {
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
                const item = {
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
                const item = {
                    id: '3',
                    product_type: 'Apparel & Accessories > Clothing > Dresses'
                };
                const error = errorCheckers.checkProductType(item);
                expect(error).toBeNull();
            });
        });
        describe('apparelAttributesCheck', () => {
            it('should return null when the product category does not contain "apparel"', () => {
                const item = {
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
                const item = {
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
                const item = {
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
                const item = {
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
                const item = {
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
                const item = {
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
                const item = { id: '1', description: 'This is a normal description.' };
                const error = errorCheckers.checkDescriptionRepeatedDashes(item);
                expect(error).toBeNull();
            });
            it('should return an error when repeated dashes are found', () => {
                const item = { id: '2', description: 'This is a description with repeated--dashes.' };
                const error = errorCheckers.checkDescriptionRepeatedDashes(item);
                expect(error).not.toBeNull();
                if (error) {
                    expect(error.errorType).toBe('Repeated Dashes in Description');
                    expect(error.details).toContain('1 instance(s)');
                    expect(error.value).toContain('repeated--dashes');
                }
            });
            it('should return multiple instances of repeated dashes with context', () => {
                const item = { id: '3', description: 'First repeated--dashes here. Another--dash there.' };
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
    });
});
