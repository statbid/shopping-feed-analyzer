"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const FeedAnalyzer_1 = require("../FeedAnalyzer");
describe('FeedAnalyzer', () => {
    describe('errorCheckers', () => {
        /************Missing Spaces after commas***********************/
        describe('descriptionMissingSpaces', () => {
            it('should detect a single missing space after comma without numbering', () => {
                const item = {
                    id: '1',
                    description: 'This is a description,with a missing space.'
                };
                const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.descriptionMissingSpaces(item);
                expect(errors).toHaveLength(1);
                expect(errors[0].errorType).toBe('Missing Spaces After Commas');
                expect(errors[0].details).toBe('Found 1 comma(s) followed by non-space characters');
                expect(errors[0].value).not.toContain('Case 1:');
                expect(errors[0].value).toContain('description,with a missing');
            });
            it('should detect multiple missing spaces after commas with numbering', () => {
                const item = {
                    id: '2',
                    description: 'This is a description,with missing spaces,after commas. Another,example here.'
                };
                const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.descriptionMissingSpaces(item);
                expect(errors).toHaveLength(1);
                expect(errors[0].errorType).toBe('Missing Spaces After Commas');
                expect(errors[0].details).toBe('Found 3 comma(s) followed by non-space characters');
                expect(errors[0].value).toContain('Case 1:');
                expect(errors[0].value).toContain('Case 2:');
                expect(errors[0].value).toContain('Case 3:');
            });
            it('should not report errors when spaces are correct', () => {
                const item = {
                    id: '3',
                    description: 'This is a description, with correct spaces, after commas.'
                };
                const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.descriptionMissingSpaces(item);
                expect(errors).toHaveLength(0);
            });
            it('should not report errors for numbers with commas', () => {
                const item = {
                    id: '4',
                    description: 'The price is $6,886,187 for this item.'
                };
                const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.descriptionMissingSpaces(item);
                expect(errors).toHaveLength(0);
            });
        });
        describe('titleSizeCheck', () => {
            it('should detect missing size in title when size is set', () => {
                const item = {
                    id: '5',
                    title: 'Nike Running Shoes',
                    size: 'L'
                };
                console.log('Test input:', JSON.stringify(item));
                const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.titleSizeCheck(item);
                console.log('Errors returned:', JSON.stringify(errors));
                expect(errors).toHaveLength(1);
                expect(errors[0].errorType).toBe('Title Doesn\'t Contain Size When Size is Set');
                expect(errors[0].details).toContain('L');
            });
            it('should not report errors when size is in title', () => {
                const item = {
                    id: '6',
                    title: 'Nike Running Shoes - Large',
                    size: 'Large'
                };
                const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.titleSizeCheck(item);
                expect(errors).toHaveLength(0);
            });
            it('should not report errors when size abbreviation is in title', () => {
                const item = {
                    id: '7',
                    title: 'Nike Running Shoes - L',
                    size: 'L'
                };
                const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.titleSizeCheck(item);
                expect(errors).toHaveLength(0);
            });
            it('should not report errors when size is not set', () => {
                const item = {
                    id: '8',
                    title: 'Nike Running Shoes'
                };
                const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.titleSizeCheck(item);
                expect(errors).toHaveLength(0);
            });
            it('should detect missing size when size is part of a word', () => {
                const item = {
                    id: '9',
                    title: 'Nike Large-Logo Running Shoes',
                    size: 'L'
                };
                const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.titleSizeCheck(item);
                expect(errors).toHaveLength(1);
                expect(errors[0].errorType).toBe('Title Doesn\'t Contain Size When Size is Set');
            });
        });
        /**********************Duplicate Words in title ******************************************* */
        describe('titleDuplicateWords', () => {
            it('should detect duplicate words in title', () => {
                const item = {
                    id: '1',
                    title: 'Nike Air Jordan Jordan Shoes'
                };
                const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.titleDuplicateWords(item);
                expect(errors).toHaveLength(1);
                expect(errors[0].errorType).toBe('Duplicate Words in Title');
                expect(errors[0].details).toContain('jordan');
            });
            it('should not report errors when no duplicates exist', () => {
                const item = {
                    id: '2',
                    title: 'Nike Air Jordan Shoes'
                };
                const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.titleDuplicateWords(item);
                expect(errors).toHaveLength(0);
            });
            it('should ignore numbers and measurement units', () => {
                const item = {
                    id: '3',
                    title: "17' X 29' Winter Cover For 12' X 24' Rectangle Pool"
                };
                const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.titleDuplicateWords(item);
                expect(errors).toHaveLength(0);
            });
            it('should still detect actual duplicates in complex titles', () => {
                const item = {
                    id: '5',
                    title: "17' X 29' Winter Cover Winter For 12' X 24' Rectangle Pool Cover"
                };
                const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.titleDuplicateWords(item);
                expect(errors).toHaveLength(1);
                expect(errors[0].details).toContain('winter, cover');
            });
        });
        /***********Color check************* */
        describe('titleColorCheck', () => {
            it('should detect missing color in title when color is set', () => {
                const item = {
                    id: '7',
                    title: 'Nike Running Shoes',
                    color: 'Red'
                };
                const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.titleColorCheck(item);
                expect(errors).toHaveLength(1);
                expect(errors[0].errorType).toBe('Color Mismatch');
                expect(errors[0].details).toBe('Title does not contain color "Red" when color is set');
            });
            it('should not report errors when color is in title', () => {
                const item = {
                    id: '8',
                    title: 'Nike Red Running Shoes',
                    color: 'Red'
                };
                const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.titleColorCheck(item);
                expect(errors).toHaveLength(0);
            });
        });
    });
    describe('googleProductCategorySpecificity', () => {
        it('should detect unspecific Google Product Category', () => {
            const item = {
                id: '1',
                google_product_category: 'Apparel & Accessories'
            };
            const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.googleProductCategorySpecificity(item);
            expect(errors).toHaveLength(1);
            expect(errors[0].errorType).toBe('Unspecific Google Product Category');
        });
        it('should not report errors for specific Google Product Category', () => {
            const item = {
                id: '2',
                google_product_category: 'Apparel & Accessories > Clothing > Shirts & Tops'
            };
            const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.googleProductCategorySpecificity(item);
            expect(errors).toHaveLength(0);
        });
    });
    describe('productTypeCheck', () => {
        it('should detect missing Product Type', () => {
            const item = {
                id: '3',
                product_type: ''
            };
            const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.productTypeCheck(item);
            expect(errors).toHaveLength(1);
            expect(errors[0].errorType).toBe('Missing Product Type');
        });
        it('should not report errors when Product Type is set', () => {
            const item = {
                id: '4',
                product_type: 'T-Shirt'
            };
            const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.productTypeCheck(item);
            expect(errors).toHaveLength(0);
        });
    });
    describe('googleProductCategoryCheck', () => {
        it('should detect missing Google Product Category', () => {
            const item = {
                id: '5',
                google_product_category: ''
            };
            const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.googleProductCategoryCheck(item);
            expect(errors).toHaveLength(1);
            expect(errors[0].errorType).toBe('Missing Google Product Category');
        });
        it('should not report errors when Google Product Category is set', () => {
            const item = {
                id: '6',
                google_product_category: 'Apparel & Accessories > Clothing'
            };
            const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.googleProductCategoryCheck(item);
            expect(errors).toHaveLength(0);
        });
    });
    describe('apparelAttributesCheck', () => {
        it('should detect missing attributes for apparel items', () => {
            const item = {
                id: '7',
                google_product_category: 'Apparel & Accessories > Clothing',
                color: 'Red'
            };
            const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.apparelAttributesCheck(item);
            expect(errors).toHaveLength(1);
            expect(errors[0].errorType).toBe('Missing Apparel Attributes');
            expect(errors[0].details).toContain('size, gender, age_group');
        });
        it('should not report errors when all apparel attributes are present', () => {
            const item = {
                id: '8',
                google_product_category: 'Apparel & Accessories > Clothing',
                color: 'Red',
                size: 'M',
                gender: 'Male',
                age_group: 'Adult'
            };
            const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.apparelAttributesCheck(item);
            expect(errors).toHaveLength(0);
        });
        it('should not check for apparel attributes in non-apparel items', () => {
            const item = {
                id: '9',
                google_product_category: 'Electronics > Computers'
            };
            const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.apparelAttributesCheck(item);
            expect(errors).toHaveLength(0);
        });
    });
    describe('repeatedDashesCheck', () => {
        it('should detect repeated dashes in description', () => {
            const item = {
                id: '10',
                description: 'This is a description with repeated dashes -- like this'
            };
            const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.repeatedDashesCheck(item);
            expect(errors).toHaveLength(1);
            expect(errors[0].errorType).toBe('Repeated Dashes in Description');
        });
        it('should detect repeated dashes with space in description', () => {
            const item = {
                id: '11',
                description: 'This is a description with repeated dashes - - like this'
            };
            const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.repeatedDashesCheck(item);
            expect(errors).toHaveLength(1);
            expect(errors[0].errorType).toBe('Repeated Dashes in Description');
        });
        it('should not report errors for single dashes in description', () => {
            const item = {
                id: '12',
                description: 'This is a description with single dashes - like this'
            };
            const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.repeatedDashesCheck(item);
            expect(errors).toHaveLength(0);
        });
    });
    /*******Repeated Dashes in Description*********/
    describe('repeatedDashesCheck', () => {
        it('should detect repeated dashes in description', () => {
            const item = {
                id: '1',
                description: 'This is a description -- with repeated dashes - - like this'
            };
            const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.repeatedDashesCheck(item);
            expect(errors).toHaveLength(1);
            expect(errors[0].errorType).toBe('Repeated Dashes in Description');
            expect(errors[0].details).toBe('Found 2 instance(s) of repeated dashes');
            expect(errors[0].value).toContain('Case 1:');
            expect(errors[0].value).toContain('Case 2:');
        });
        it('should not report errors for single dashes in description', () => {
            const item = {
                id: '2',
                description: 'This is a description with single dashes - like this'
            };
            const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.repeatedDashesCheck(item);
            expect(errors).toHaveLength(0);
        });
    });
    /*******Product Title Abbreviations*********/
    it('should not report errors for allowed words', () => {
        const item = {
            id: '1',
            title: 'Camera Pack of 5'
        };
        const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.titleAbbreviationsCheck(item);
        expect(errors).toHaveLength(0);
    });
    it('should not flag "in" when it\'s not an abbreviation', () => {
        const item = {
            id: '2',
            title: 'Pool All In One Kit'
        };
        const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.titleAbbreviationsCheck(item);
        expect(errors).toHaveLength(0);
    });
});
/*******Product Title Brand Check*********/
describe('titleBrandCheck', () => {
    it('should detect missing brand in title', () => {
        const item = {
            id: '10',
            title: 'Digital Camera 20MP',
            brand: 'Canon'
        };
        const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.titleBrandCheck(item);
        expect(errors).toHaveLength(1);
        expect(errors[0].errorType).toBe('Missing Brand in Title');
    });
    it('should not report errors when brand is in title', () => {
        const item = {
            id: '11',
            title: 'Canon Digital Camera 20MP',
            brand: 'Canon'
        };
        const errors = FeedAnalyzer_1.FeedAnalyzer.errorCheckers.titleBrandCheck(item);
        expect(errors).toHaveLength(0);
    });
});
