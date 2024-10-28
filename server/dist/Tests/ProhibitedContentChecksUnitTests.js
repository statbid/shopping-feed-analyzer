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
describe('checkMonitoredPharmacyWords', () => {
    it('should return null if both title and description are not set', () => {
        const item = { id: '1', title: '', description: '' };
        const error = errorCheckers.checkMonitoredPharmacyWords(item);
        expect(error).toBeNull();
    });
    it('should return an error if a monitored word is found in the title', () => {
        const item = { id: '1', title: 'Amazing Herbal Viagra', description: 'Natural health benefits' };
        const error = errorCheckers.checkMonitoredPharmacyWords(item);
        expect(error).not.toBeNull();
        if (error) {
            expect(error.errorType).toBe('Monitored Pharmacy Words');
            expect(error.details).toContain('Herbal Viagra');
            expect(error.affectedField).toBe('title');
        }
    });
    it('should return an error if a monitored word is found in the description', () => {
        const item = { id: '1', title: 'Health Supplement', description: 'This product includes Slim Fort and Core Burn' };
        const error = errorCheckers.checkMonitoredPharmacyWords(item);
        expect(error).not.toBeNull();
        if (error) {
            expect(error.errorType).toBe('Monitored Pharmacy Words');
            expect(error.details).toContain("Found 1 monitored word(s): Core Burn");
            expect(error.affectedField).toBe('description');
        }
    });
    it('should return an error with multiple monitored words in title and description', () => {
        const item = { id: '1', title: 'Energy Boost with Brain Booster', description: 'Boost performance with Herbal Xanax and Slim Forte' };
        const error = errorCheckers.checkMonitoredPharmacyWords(item);
        expect(error).not.toBeNull();
        if (error) {
            expect(error.errorType).toBe('Monitored Pharmacy Words');
            expect(error.details).toContain('Found 3 monitored word(s): Brain Booster, Herbal Xanax, herbal xanax');
            expect(error.value).toContain('(found: "Brain Booster" in title)');
            expect(error.value).toContain('(found: "Herbal Xanax" in description)');
            expect(error.value).toContain("\"Energy Boost with Brain Booster\" (found: \"Brain Booster\" in title); \"st performance with Herbal Xanax and Slim Forte\" (found: \"Herbal Xanax\" in description); \"st performance with Herbal Xanax and Slim Forte\" (found: \"herbal xanax\" in description)");
        }
    });
    it('should return null if no monitored words are found in title and description', () => {
        const item = { id: '1', title: 'Health Product', description: 'Safe for daily use' };
        const error = errorCheckers.checkMonitoredPharmacyWords(item);
        expect(error).toBeNull();
    });
});
