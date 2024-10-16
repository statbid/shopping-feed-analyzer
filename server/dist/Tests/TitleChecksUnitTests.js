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
        /******Title contains duplicate words like Nike Air Jordan Jordan Shoes**************************** */
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
        /*********** Unit Tests for Non-Breaking Spaces Check ******************** */
        describe('checkTitleNonBreakingSpaces', () => {
            it('should return null when there are no non-breaking spaces', () => {
                const item = {
                    id: '1',
                    title: 'Nike Running Shoes'
                };
                const error = errorCheckers.checkTitleNonBreakingSpaces(item);
                expect(error).toBeNull();
            });
            it('should detect non-breaking spaces in the title', () => {
                const item = {
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
                const item = {
                    id: '1',
                    description: 'This is a short description within the limit.'
                };
                const error = errorCheckers.checkDescriptionLength(item);
                expect(error).toBeNull();
            });
            it('should detect when the description exceeds the limit', () => {
                const longDescription = 'a'.repeat(5050); // Create a string with 5050 'a' characters
                const item = {
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
                const item = {
                    id: '3',
                    description: ''
                };
                const error = errorCheckers.checkDescriptionLength(item);
                expect(error).toBeNull();
            });
        });
    });
});
