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
describe('ID Checks', () => {
    describe('checkIdLength', () => {
        it('should return an error if ID length exceeds MAX_ID_LENGTH', () => {
            const longId = 'A'.repeat(101); // Assume MAX_ID_LENGTH is 100
            const item = { id: longId };
            const error = errorCheckers.checkIdLength(item);
            expect(error).not.toBeNull();
            if (error) {
                expect(error.errorType).toBe('Id Too Long');
                expect(error.details).toContain('exceeds');
                expect(error.affectedField).toBe('id');
            }
        });
        it('should return null if ID length is within MAX_ID_LENGTH', () => {
            const validId = 'A'.repeat(50); // Within MAX_ID_LENGTH
            const item = { id: validId };
            const error = errorCheckers.checkIdLength(item);
            expect(error).toBeNull();
        });
    });
    describe('checkIdIsSet', () => {
        it('should return an error if ID is not set or blank', () => {
            const item = { id: '' };
            const error = errorCheckers.checkIdIsSet(item);
            expect(error).not.toBeNull();
            if (error) {
                expect(error.errorType).toBe('Id Not Set');
                expect(error.details).toContain('blank or not set');
                expect(error.affectedField).toBe('id');
            }
        });
        it('should return null if ID is set', () => {
            const item = { id: '12345' };
            const error = errorCheckers.checkIdIsSet(item);
            expect(error).toBeNull();
        });
    });
});
