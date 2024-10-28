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
                const item = { id: '1', product_type: '' };
                const error = errorCheckers.checkProductType(item);
                expect(error).not.toBeNull();
                if (error) {
                    expect(error.errorType).toBe('Product Type is not set');
                    expect(error.details).toBe('Product Type is not set');
                }
            });
            it('should return null if product type is set', () => {
                const item = { id: '1', product_type: 'Electronics' };
                const error = errorCheckers.checkProductType(item);
                expect(error).toBeNull();
            });
        });
        describe('checkProductTypePromotionalWords', () => {
            it('should return an error if product type contains promotional words', () => {
                const item = { id: '1', product_type: 'save on Electronics' };
                const error = errorCheckers.checkProductTypePromotionalWords(item);
                expect(error).not.toBeNull();
                if (error) {
                    expect(error.errorType).toBe('Product Type Contains Promotional Words');
                    expect(error.details).toContain('promotional word(s)');
                }
            });
            it('should return null if product type does not contain promotional words', () => {
                const item = { id: '1', product_type: 'Electronics' };
                const error = errorCheckers.checkProductTypePromotionalWords(item);
                expect(error).toBeNull();
            });
        });
        describe('checkProductTypeCommas', () => {
            it('should return an error if product type contains commas', () => {
                const item = { id: '1', product_type: 'Electronics, Gadgets' };
                const error = errorCheckers.checkProductTypeCommas(item);
                expect(error).not.toBeNull();
                if (error) {
                    expect(error.errorType).toBe('Commas in Product Type');
                    expect(error.details).toBe('Product Type Contains Commas');
                }
            });
            it('should return null if product type does not contain commas', () => {
                const item = { id: '1', product_type: 'Electronics' };
                const error = errorCheckers.checkProductTypeCommas(item);
                expect(error).toBeNull();
            });
        });
        describe('checkProductTypeRepeatedTiers', () => {
            it('should return an error if product type contains repeated tiers', () => {
                const item = { id: '1', product_type: 'Electronics > Electronics' };
                const error = errorCheckers.checkProductTypeRepeatedTiers(item);
                expect(error).not.toBeNull();
                if (error) {
                    expect(error.errorType).toBe('Product Type Contains Repeated Tiers');
                    expect(error.details).toBe('Product type contains repeated tiers');
                }
            });
            it('should return null if product type does not contain repeated tiers', () => {
                const item = { id: '1', product_type: 'Electronics > Gadgets' };
                const error = errorCheckers.checkProductTypeRepeatedTiers(item);
                expect(error).toBeNull();
            });
        });
        describe('checkProductTypeWhitespace', () => {
            it('should return an error if product type has whitespace at start or end', () => {
                const item = { id: '1', product_type: ' Electronics ' };
                const error = errorCheckers.checkProductTypeWhitespace(item);
                expect(error).not.toBeNull();
                if (error) {
                    expect(error.errorType).toBe('Whitespace at Product Type Start/End');
                    expect(error.details).toBe('Product type contains whitespace at start or end');
                }
            });
            it('should return null if product type has no whitespace at start or end', () => {
                const item = { id: '1', product_type: 'Electronics' };
                const error = errorCheckers.checkProductTypeWhitespace(item);
                expect(error).toBeNull();
            });
        });
        describe('checkProductTypeRepeatedWhitespace', () => {
            it('should return an error if product type contains repeated whitespace', () => {
                const item = { id: '1', product_type: 'Electronics  Gadgets' };
                const error = errorCheckers.checkProductTypeRepeatedWhitespace(item);
                expect(error).not.toBeNull();
                if (error) {
                    expect(error.errorType).toBe('Repeated Whitespace in Product Type');
                    expect(error.details).toBe('Product type contains repeated whitespace');
                }
            });
            it('should return null if product type does not contain repeated whitespace', () => {
                const item = { id: '1', product_type: 'Electronics Gadgets' };
                const error = errorCheckers.checkProductTypeRepeatedWhitespace(item);
                expect(error).toBeNull();
            });
        });
        describe('checkProductTypeAngleBrackets', () => {
            it('should return an error if product type starts or ends with angle brackets', () => {
                const item = { id: '1', product_type: '> Electronics' };
                const error = errorCheckers.checkProductTypeAngleBrackets(item);
                expect(error).not.toBeNull();
                if (error) {
                    expect(error.errorType).toBe('Angle Bracket at Product Type Start or End');
                    expect(error.details).toBe('Product type starts or ends with an angle bracket');
                }
            });
            it('should return null if product type does not start or end with angle brackets', () => {
                const item = { id: '1', product_type: 'Electronics' };
                const error = errorCheckers.checkProductTypeAngleBrackets(item);
                expect(error).toBeNull();
            });
        });
    });
});
