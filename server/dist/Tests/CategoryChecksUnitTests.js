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
describe('CategoryChecker', () => {
    describe('checkGoogleProductCategory', () => {
        it('should return an error if Google Product Category is a single number', () => {
            const item = { id: '1', google_product_category: '500' };
            const error = errorCheckers.checkGoogleProductCategory(item);
            expect(error).not.toBeNull();
            if (error) {
                expect(error.errorType).toBe('Invalid Google Product Category');
                expect(error.details).toContain('numbered category is not allowed');
                expect(error.affectedField).toBe('google_product_category');
            }
        });
        it('should return an error if Google Product Category has fewer than 3 levels', () => {
            const item = { id: '1', google_product_category: 'Electronics > Gadgets' };
            const error = errorCheckers.checkGoogleProductCategory(item);
            expect(error).not.toBeNull();
            if (error) {
                expect(error.errorType).toBe('Google Product Category is Incomplete');
                expect(error.details).toContain('less than 3 levels');
            }
        });
        it('should return an error if Google Product Category is not set', () => {
            const item = { id: '1', google_product_category: '' };
            const error = errorCheckers.checkGoogleProductCategory(item);
            expect(error).not.toBeNull();
            if (error) {
                expect(error.errorType).toBe('Google Product Category is not set');
                expect(error.details).toContain('not set');
            }
        });
        it('should return null if Google Product Category is valid with 3 levels', () => {
            const item = { id: '1', google_product_category: 'Electronics > Gadgets > Phones' };
            const error = errorCheckers.checkGoogleProductCategory(item);
            expect(error).toBeNull();
        });
    });
    describe('checkApparelAttributes', () => {
        it('should return an error if apparel item is missing required attributes', () => {
            const item = { id: '1', google_product_category: 'Apparel & Accessories', color: '', size: '', gender: '', age_group: '' };
            const error = errorCheckers.checkApparelAttributes(item);
            expect(error).not.toBeNull();
            if (error) {
                expect(error.errorType).toBe('Missing Apparel Attributes');
                expect(error.details).toContain('color, size, gender, age_group');
                expect(error.affectedField).toContain('color, size, gender, age_group');
            }
        });
        it('should return null if all required apparel attributes are present', () => {
            const item = { id: '1', google_product_category: 'Apparel & Accessories', color: 'Red', size: 'M', gender: 'Unisex', age_group: 'Adult' };
            const error = errorCheckers.checkApparelAttributes(item);
            expect(error).toBeNull();
        });
        it('should return null if category is not apparel-related', () => {
            const item = { id: '1', google_product_category: 'Electronics > Gadgets', color: '', size: '', gender: '', age_group: '' };
            const error = errorCheckers.checkApparelAttributes(item);
            expect(error).toBeNull();
        });
    });
    describe('checkGoogleProductCategoryValidity', () => {
        it('should return an error if Google Product Category is numeric', () => {
            const item = { id: '1', google_product_category: '1234' };
            const error = errorCheckers.checkGoogleProductCategoryValidity(item);
            expect(error).not.toBeNull();
            if (error) {
                expect(error.errorType).toBe('Google Product Category is Invalid');
                expect(error.details).toContain('numbered category is not allowed');
            }
        });
        it('should return null if Google Product Category is valid and not numeric', () => {
            const item = { id: '1', google_product_category: 'Electronics > Phones > Smartphones' };
            const error = errorCheckers.checkGoogleProductCategoryValidity(item);
            expect(error).toBeNull();
        });
    });
});
