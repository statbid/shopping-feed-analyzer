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
describe('GTINChecker', () => {
    describe('checkGTINLength', () => {
        it('should return null if GTIN is not set', () => {
            const item = { id: '1', gtin: '' };
            const error = errorCheckers.checkGTINLength(item);
            expect(error).toBeNull();
        });
        it('should return null if GTIN is in scientific notation and has invalid length after conversion', () => {
            const item = { id: '1', gtin: '1.2345e7' }; // Equivalent to "12345000" (8 digits)
            const error = errorCheckers.checkGTINLength(item);
            expect(error).toBeNull();
        });
        it('should return an error if GTIN length is incorrect', () => {
            const item = { id: '1', gtin: '1234567' }; // Only 7 digits
            const error = errorCheckers.checkGTINLength(item);
            expect(error).not.toBeNull();
            if (error) {
                expect(error.errorType).toBe('Incorrect GTIN Length');
                expect(error.details).toContain('expected 8, 12, 13, or 14 digits');
                expect(error.affectedField).toBe('gtin');
            }
        });
        it('should return an error if GTIN length is valid but in scientific notation with incorrect conversion', () => {
            const item = { id: '1', gtin: '1.234567e8' }; // Converts to "123456700" (9 digits, invalid)
            const error = errorCheckers.checkGTINLength(item);
            expect(error).not.toBeNull();
            if (error) {
                expect(error.errorType).toBe('Incorrect GTIN Length');
            }
        });
        it('should return null if GTIN length is correct (8 digits)', () => {
            const item = { id: '1', gtin: '12345678' };
            const error = errorCheckers.checkGTINLength(item);
            expect(error).toBeNull();
        });
        it('should return null if GTIN length is correct (12 digits)', () => {
            const item = { id: '1', gtin: '123456789012' };
            const error = errorCheckers.checkGTINLength(item);
            expect(error).toBeNull();
        });
        it('should return null if GTIN length is correct (13 digits)', () => {
            const item = { id: '1', gtin: '1234567890123' };
            const error = errorCheckers.checkGTINLength(item);
            expect(error).toBeNull();
        });
        it('should return null if GTIN length is correct (14 digits)', () => {
            const item = { id: '1', gtin: '12345678901234' };
            const error = errorCheckers.checkGTINLength(item);
            expect(error).toBeNull();
        });
    });
});
