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
        describe('ProductInfoChecker', () => {
            describe('checkImageLinkCommas', () => {
                it('should return an error if image link contains commas', () => {
                    const item = { id: '1', image_link: 'http://example.com/image,1.jpg' };
                    const error = errorCheckers.checkImageLinkCommas(item);
                    expect(error).not.toBeNull();
                    if (error) {
                        expect(error.errorType).toBe('Commas in Image Link');
                        expect(error.details).toBe('Image link contains commas');
                        expect(error.value).toBe('http://example.com/image,1.jpg');
                    }
                });
                it('should return null if image link does not contain commas', () => {
                    const item = { id: '1', image_link: 'http://example.com/image1.jpg' };
                    const error = errorCheckers.checkImageLinkCommas(item);
                    expect(error).toBeNull();
                });
            });
            describe('checkProductType', () => {
                it('should return an error if product type is not set', () => {
                    const item = { id: '1' };
                    const error = errorCheckers.checkProductType(item);
                    expect(error).not.toBeNull();
                    if (error) {
                        expect(error.errorType).toBe('Missing Product Type');
                        expect(error.details).toBe('Product Type is not set');
                        expect(error.value).toBe('');
                    }
                });
                it('should return an error if product type is empty', () => {
                    const item = { id: '1', product_type: '  ' };
                    const error = errorCheckers.checkProductType(item);
                    expect(error).not.toBeNull();
                    if (error) {
                        expect(error.errorType).toBe('Missing Product Type');
                        expect(error.details).toBe('Product Type is not set');
                        expect(error.value).toBe('  ');
                    }
                });
                it('should return null if product type is set', () => {
                    const item = { id: '1', product_type: 'Electronics > Computers' };
                    const error = errorCheckers.checkProductType(item);
                    expect(error).toBeNull();
                });
            });
            describe('checkProductTypePromotionalWords', () => {
                it('should return an error if product type contains promotional words', () => {
                    const item = { id: '1', product_type: 'Electronics > Computers on sale' };
                    const error = errorCheckers.checkProductTypePromotionalWords(item);
                    expect(error).not.toBeNull();
                    if (error) {
                        expect(error.errorType).toBe('Promotional Words in Product Type');
                        expect(error.details).toContain('Found 1 promotional word(s): sale');
                        expect(error.value).toContain('Computers on sale');
                    }
                });
                it('should return null if product type does not contain promotional words', () => {
                    const item = { id: '1', product_type: 'Electronics > Computers' };
                    const error = errorCheckers.checkProductTypePromotionalWords(item);
                    expect(error).toBeNull();
                });
            });
            describe('checkProductTypeCommas', () => {
                it('should return an error if product type contains commas', () => {
                    const item = { id: '1', product_type: 'Electronics, Computers' };
                    const error = errorCheckers.checkProductTypeCommas(item);
                    expect(error).not.toBeNull();
                    if (error) {
                        expect(error.errorType).toBe('Commas in Product Type');
                        expect(error.details).toBe('Product type contains commas');
                        expect(error.value).toBe('Electronics, Computers');
                    }
                });
                it('should return null if product type does not contain commas', () => {
                    const item = { id: '1', product_type: 'Electronics > Computers' };
                    const error = errorCheckers.checkProductTypeCommas(item);
                    expect(error).toBeNull();
                });
            });
            describe('checkProductTypeRepeatedTiers', () => {
                it('should return an error if product type contains repeated tiers', () => {
                    const item = { id: '1', product_type: 'Electronics > Electronics > Computers' };
                    const error = errorCheckers.checkProductTypeRepeatedTiers(item);
                    expect(error).not.toBeNull();
                    if (error) {
                        expect(error.errorType).toBe('Repeated Tiers in Product Type');
                        expect(error.details).toBe('Product type contains repeated tiers');
                        expect(error.value).toBe('Electronics > Electronics > Computers');
                    }
                });
                it('should return null if product type does not contain repeated tiers', () => {
                    const item = { id: '1', product_type: 'Electronics > Computers > Laptops' };
                    const error = errorCheckers.checkProductTypeRepeatedTiers(item);
                    expect(error).toBeNull();
                });
            });
            describe('checkProductTypeWhitespace', () => {
                it('should return an error if product type has leading whitespace', () => {
                    const item = { id: '1', product_type: ' Electronics > Computers' };
                    const error = errorCheckers.checkProductTypeWhitespace(item);
                    expect(error).not.toBeNull();
                    if (error) {
                        expect(error.errorType).toBe('Whitespace at Product Type Start/End');
                        expect(error.details).toBe('Product type contains whitespace at start or end');
                        expect(error.value).toBe(' Electronics > Computers');
                    }
                });
                it('should return an error if product type has trailing whitespace', () => {
                    const item = { id: '1', product_type: 'Electronics > Computers ' };
                    const error = errorCheckers.checkProductTypeWhitespace(item);
                    expect(error).not.toBeNull();
                    if (error) {
                        expect(error.errorType).toBe('Whitespace at Product Type Start/End');
                        expect(error.details).toBe('Product type contains whitespace at start or end');
                        expect(error.value).toBe('Electronics > Computers ');
                    }
                });
                it('should return null if product type does not have leading or trailing whitespace', () => {
                    const item = { id: '1', product_type: 'Electronics > Computers' };
                    const error = errorCheckers.checkProductTypeWhitespace(item);
                    expect(error).toBeNull();
                });
            });
            describe('checkProductTypeRepeatedWhitespace', () => {
                it('should return an error if product type contains repeated whitespace', () => {
                    const item = { id: '1', product_type: 'Electronics  >  Computers' };
                    const error = errorCheckers.checkProductTypeRepeatedWhitespace(item);
                    expect(error).not.toBeNull();
                    if (error) {
                        expect(error.errorType).toBe('Repeated Whitespace in Product Type');
                        expect(error.details).toBe('Product type contains repeated whitespace');
                        expect(error.value).toBe('Electronics  >  Computers');
                    }
                });
                it('should return null if product type does not contain repeated whitespace', () => {
                    const item = { id: '1', product_type: 'Electronics > Computers' };
                    const error = errorCheckers.checkProductTypeRepeatedWhitespace(item);
                    expect(error).toBeNull();
                });
            });
            describe('checkProductTypeAngleBrackets', () => {
                it('should return an error if product type starts with an angle bracket', () => {
                    const item = { id: '1', product_type: '>Electronics > Computers' };
                    const error = errorCheckers.checkProductTypeAngleBrackets(item);
                    expect(error).not.toBeNull();
                    if (error) {
                        expect(error.errorType).toBe('Angle Bracket at Product Type Start or End');
                        expect(error.details).toBe('Product type starts or ends with an angle bracket');
                        expect(error.value).toBe('>Electronics > Computers');
                    }
                });
                it('should return an error if product type ends with an angle bracket', () => {
                    const item = { id: '1', product_type: 'Electronics > Computers>' };
                    const error = errorCheckers.checkProductTypeAngleBrackets(item);
                    expect(error).not.toBeNull();
                    if (error) {
                        expect(error.errorType).toBe('Angle Bracket at Product Type Start or End');
                        expect(error.details).toBe('Product type starts or ends with an angle bracket');
                        expect(error.value).toBe('Electronics > Computers>');
                    }
                });
                it('should return null if product type does not start or end with an angle bracket', () => {
                    const item = { id: '1', product_type: 'Electronics > Computers' };
                    const error = errorCheckers.checkProductTypeAngleBrackets(item);
                    expect(error).toBeNull();
                });
            });
            describe('checkGTINLength', () => {
                it('should return an error if GTIN length is incorrect', () => {
                    const item = { id: '1', gtin: '12345' };
                    const error = errorCheckers.checkGTINLength(item);
                    expect(error).not.toBeNull();
                    if (error) {
                        expect(error.errorType).toBe('Incorrect GTIN Length');
                        expect(error.details).toBe('GTIN length is 5, expected 8, 12, 13, or 14 digits');
                        expect(error.value).toBe('12345');
                    }
                });
                it('should return null if GTIN length is correct', () => {
                    const item = { id: '1', gtin: '12345678' };
                    const error = errorCheckers.checkGTINLength(item);
                    expect(error).toBeNull();
                });
                it('should handle GTIN in scientific notation', () => {
                    const item = { id: '1', gtin: '7,6157E+11' };
                    const error = errorCheckers.checkGTINLength(item);
                    expect(error).toBeNull();
                });
            });
            describe('checkGTINValidity', () => {
                it('should return an error if GTIN is invalid', () => {
                    const item = { id: '1', gtin: '12345678' };
                    const error = errorCheckers.checkGTINValidity(item);
                    expect(error).not.toBeNull();
                    if (error) {
                        expect(error.errorType).toBe('Invalid GTIN');
                        expect(error.details).toBe('GTIN is invalid (incorrect length or check digit)');
                        expect(error.value).toBe('12345678');
                    }
                });
                it('should return null if GTIN is valid', () => {
                    const item = { id: '1', gtin: '73513537' }; // Valid GTIN-8
                    const error = errorCheckers.checkGTINValidity(item);
                    expect(error).toBeNull();
                });
                it('should handle GTIN in scientific notation', () => {
                    const item = { id: '1', gtin: '7,6157E+11' };
                    const error = errorCheckers.checkGTINValidity(item);
                    expect(error).toBeNull(); // Assuming this is a valid GTIN when expanded
                });
            });
        });
    });
});
