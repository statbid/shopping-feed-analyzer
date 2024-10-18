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
describe('Attribute Mismatch Checks', () => {
    describe('checkMonitoredPharmacyWords', () => {
        it('should return null when no monitored words are found', () => {
            const item = {
                id: '1',
                title: 'Regular Product',
                description: 'This is a normal product description'
            };
            const result = errorCheckers.checkMonitoredPharmacyWords(item);
            expect(result).toBeNull();
        });
        it('should detect monitored words in the title', () => {
            const item = {
                id: '2',
                title: 'Product with 72 Hours Effect',
                description: 'Normal description'
            };
            const result = errorCheckers.checkMonitoredPharmacyWords(item);
            expect(result).not.toBeNull();
            if (result) {
                expect(result.errorType).toBe('Monitored Pharmacy Words');
                expect(result.details).toContain('72 hours');
                expect(result.affectedField).toBe('title');
            }
        });
        it('should detect monitored words in the description', () => {
            const item = {
                id: '3',
                title: 'Regular Product',
                description: 'This product contains Alteril Fast Acting Softgels'
            };
            const result = errorCheckers.checkMonitoredPharmacyWords(item);
            expect(result).not.toBeNull();
            if (result) {
                expect(result.errorType).toBe('Monitored Pharmacy Words');
                expect(result.details).toContain('alteril fast acting softgels');
                expect(result.affectedField).toBe('description');
            }
        });
    });
    describe('checkGenderMismatch', () => {
        it('should return null when there is no gender mismatch', () => {
            const item = {
                id: '4',
                title: "Women's Dress",
                gender: 'female'
            };
            const result = errorCheckers.checkGenderMismatch(item);
            expect(result).toBeNull();
        });
        it('should detect gender mismatch - female words in title, male gender', () => {
            const item = {
                id: '5',
                title: "Women's T-Shirt",
                gender: 'male'
            };
            const result = errorCheckers.checkGenderMismatch(item);
            expect(result).not.toBeNull();
            if (result) {
                expect(result.errorType).toBe('Gender Mismatch');
                expect(result.value).toContain("Women's T-Shirt");
                expect(result.value).toContain('male');
            }
        });
        it('should detect gender mismatch - male words in title, female gender', () => {
            const item = {
                id: '6',
                title: "Men's Jeans",
                gender: 'female'
            };
            const result = errorCheckers.checkGenderMismatch(item);
            expect(result).not.toBeNull();
            if (result) {
                expect(result.errorType).toBe('Gender Mismatch');
                expect(result.value).toContain("Men's Jeans");
                expect(result.value).toContain('female');
            }
        });
    });
    describe('checkAgeGroupMismatch', () => {
        it('should return null when there is no age group mismatch', () => {
            const item = {
                id: '7',
                title: "Kid's Toy",
                age_group: 'kids'
            };
            const result = errorCheckers.checkAgeGroupMismatch(item);
            expect(result).toBeNull();
        });
        it('should detect age group mismatch - kid words in title, adult age group', () => {
            const item = {
                id: '8',
                title: "Toddler's Shoes",
                age_group: 'adult'
            };
            const result = errorCheckers.checkAgeGroupMismatch(item);
            expect(result).not.toBeNull();
            if (result) {
                expect(result.errorType).toBe('Age Group Mismatch');
                expect(result.value).toContain("Toddler's Shoes");
                expect(result.value).toContain('adult');
            }
        });
        it('should detect age group mismatch - adult words in title, kid age group', () => {
            const item = {
                id: '9',
                title: "Men's Watch",
                age_group: 'kids'
            };
            const result = errorCheckers.checkAgeGroupMismatch(item);
            expect(result).not.toBeNull();
            if (result) {
                expect(result.errorType).toBe('Age Group Mismatch');
                expect(result.value).toContain("Men's Watch");
                expect(result.value).toContain('kids');
            }
        });
    });
});
