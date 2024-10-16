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
        /************ Unit Tests for Description Contains Repeated Dashes ************************** */
        describe('checkDescriptionRepeatedDashes', () => {
            it('should return null when there are no repeated dashes', () => {
                const item = {
                    id: '1',
                    description: 'This is a simple description.'
                };
                const error = errorCheckers.checkDescriptionRepeatedDashes(item);
                expect(error).toBeNull();
            });
            it('should detect repeated dashes in the description', () => {
                const item = {
                    id: '2',
                    description: 'This is a description with -- repeated dashes.'
                };
                const error = errorCheckers.checkDescriptionRepeatedDashes(item);
                expect(error).not.toBeNull();
                if (error) {
                    expect(error.errorType).toBe('Repeated Dashes in Description');
                    expect(error.details).toBe('Found 1 instance(s) of repeated dashes');
                    expect(error.value).toContain('\"....a description with -- repeated dashes....\"');
                }
            });
        });
        /************ Unit Tests for Whitespace at Edges in Description ************************** */
        describe('checkDescriptionWhitespace', () => {
            it('should return null when there is no leading or trailing whitespace', () => {
                const item = {
                    id: '3',
                    description: 'This is a clean description.'
                };
                const error = errorCheckers.checkDescriptionWhitespace(item);
                expect(error).toBeNull();
            });
            it('should detect leading whitespace in the description', () => {
                const item = {
                    id: '4',
                    description: '   Leading space here.'
                };
                const error = errorCheckers.checkDescriptionWhitespace(item);
                expect(error).not.toBeNull();
                if (error) {
                    expect(error.errorType).toBe('Whitespace at Edges in Description');
                    expect(error.details).toBe('Description has 3 whitespaces at the begining and 0  whitespaces at the end');
                    expect(error.value).toBe('"  Leading..."');
                }
            });
            it('should detect trailing whitespace in the description', () => {
                const item = {
                    id: '5',
                    description: 'Trailing space here.   '
                };
                const error = errorCheckers.checkDescriptionWhitespace(item);
                expect(error).not.toBeNull();
                if (error) {
                    expect(error.errorType).toBe('Whitespace at Edges in Description');
                    expect(error.details).toBe('Description has 0 whitespaces at the begining and 3  whitespaces at the end');
                    expect(error.value).toBe('"...here.  "');
                }
            });
        });
        /************ Unit Tests for Repeated Whitespace in Description ************************** */
        describe('checkDescriptionRepeatedWhitespace', () => {
            it('should return null when there are no repeated whitespaces', () => {
                const item = {
                    id: '6',
                    description: 'This description is fine.'
                };
                const error = errorCheckers.checkDescriptionRepeatedWhitespace(item);
                expect(error).toBeNull();
            });
            it('should detect repeated whitespaces in the description', () => {
                const item = {
                    id: '7',
                    description: 'This description  has repeated whitespaces.'
                };
                const error = errorCheckers.checkDescriptionRepeatedWhitespace(item);
                expect(error).not.toBeNull();
                if (error) {
                    expect(error.errorType).toBe('Repeated Whitespace in Description');
                    expect(error.details).toBe('Found 1 instance(s) of repeated whitespaces in description');
                    expect(error.value).toContain("\"...This description␣␣has repeated whitespaces....\"");
                }
            });
        });
        /************ Unit Tests for Repeated Commas in Description ************************** */
        describe('checkDescriptionRepeatedCommas', () => {
            it('should return null when there are no repeated commas', () => {
                const item = {
                    id: '8',
                    description: 'This description is clear.'
                };
                const error = errorCheckers.checkDescriptionRepeatedCommas(item);
                expect(error).toBeNull();
            });
            it('should detect repeated commas in the description', () => {
                const item = {
                    id: '9',
                    description: 'This description,, has repeated commas.'
                };
                const error = errorCheckers.checkDescriptionRepeatedCommas(item);
                expect(error).not.toBeNull();
                if (error) {
                    expect(error.errorType).toBe('Repeated Commas in Description');
                    expect(error.details).toBe('Found 1 instance(s) of repeated commas in description');
                    expect(error.value).toContain('\"...This description,, has repeated commas....\"');
                }
            });
        });
        /************ Unit Tests for HTML in Description ************************** */
        describe('checkDescriptionHtml', () => {
            it('should return null when there are no HTML tags', () => {
                const item = {
                    id: '10',
                    description: 'This description has no HTML.'
                };
                const error = errorCheckers.checkDescriptionHtml(item);
                expect(error).toBeNull();
            });
            it('should detect HTML tags in the description', () => {
                const item = {
                    id: '11',
                    description: 'This description contains <div>HTML</div> tags.'
                };
                const error = errorCheckers.checkDescriptionHtml(item);
                expect(error).not.toBeNull();
                if (error) {
                    expect(error.errorType).toBe('HTML in Description');
                    expect(error.details).toBe('Found 2 HTML tag(s): <div>, </div>');
                    expect(error.value).toContain("\"...This description contains <div>HTML</div> tags....\"; \"...This description contains <div>HTML</div> tags....\"");
                }
            });
        });
        /************ Unit Tests for HTML Entities in Description ************************** */
        describe('checkDescriptionHtmlEntities', () => {
            it('should return null when there are no HTML entities', () => {
                const item = {
                    id: '12',
                    description: 'This description has no entities.'
                };
                const error = errorCheckers.checkDescriptionHtmlEntities(item);
                expect(error).toBeNull();
            });
            it('should detect HTML entities in the description', () => {
                const item = {
                    id: '13',
                    description: 'This description contains &copy; and &reg; entities.'
                };
                const error = errorCheckers.checkDescriptionHtmlEntities(item);
                expect(error).not.toBeNull();
                if (error) {
                    expect(error.errorType).toBe('HTML Entities in Description');
                    expect(error.details).toBe('Found 2 HTML entitie(s): &copy;, &reg;');
                    expect(error.value).toContain("\"...This description contains &copy; and &reg; entities....\"; \"...This description contains &copy; and &reg; entities....\"");
                }
            });
        });
        /************ Unit Tests for Description Contains Non-Breaking Spaces ************************** */
        describe('checkDescriptionNonBreakingSpaces', () => {
            it('should return null when there are no non-breaking spaces', () => {
                const item = {
                    id: '1',
                    description: 'This is a simple description without non-breaking spaces.'
                };
                const error = errorCheckers.checkDescriptionNonBreakingSpaces(item);
                expect(error).toBeNull();
            });
            it('should detect non-breaking spaces in the description', () => {
                const item = {
                    id: '2',
                    description: 'This is a description with one non-breaking space.'
                };
                const error = errorCheckers.checkDescriptionNonBreakingSpaces(item);
                expect(error).not.toBeNull();
                if (error) {
                    expect(error.errorType).toBe('Non-Breaking Spaces in Description');
                    expect(error.details).toBe('Found 1 instance(s) of non-breaking spaces in description');
                    expect(error.value).toContain('"...a description with one..."');
                }
            });
        });
    });
});
