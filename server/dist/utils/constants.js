"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sizeWordBoundaryRegex = exports.tokenBoundaryRegex = exports.unitMatchRegex = exports.numberOnlyRegex = exports.sizeTokenSplitRegex = exports.trailingPeriodRegex = exports.nonBreakingSpaceRegex = exports.htmlEntityRegex = exports.htmlTagRegex = exports.repeatedCommaRegex = exports.repeatedWhitespaceRegex = exports.leadingTrailingWhitespaceRegex = exports.repeatedDashesRegex = exports.missingSpaceRegex = exports.MAX_ID_LENGTH = exports.MAX_DESCRIPTION_LENGTH = exports.promotionalWords = exports.punctuationStartEndRegex = exports.repeatedDashRegex = exports.badAbbreviationsRegex = exports.specialCharsRegex = exports.ignoreWords = exports.inchMatch = exports.sizeSynonyms = exports.sizeWords = void 0;
exports.escapeRegExp = escapeRegExp;
exports.sizeWords = new Set(['xs', 's', 'm', 'l', 'xl', 'small', 'medium', 'large']);
exports.sizeSynonyms = {
    'xs': ['xs', 'extra small'],
    's': ['s', 'small'],
    'm': ['m', 'medium'],
    'l': ['l', 'large'],
    'xl': ['xl', 'extra large'],
};
exports.inchMatch = (/^(\d+(\.\d+)?)(["']|in\.?|inch)$/);
exports.ignoreWords = new Set(['x', 'by', 'in', 'inch', 'inches', 'ft', 'feet', 'cm', 'm', 'mm']);
exports.specialCharsRegex = /[^a-zA-Z0-9\s.,;:()]/g;
exports.badAbbreviationsRegex = /\b(pck|pkg|qty|qt|pc|pcs|ea|(?<=\s|^)in\.(?=\s|$)|ft)\b/gi;
exports.repeatedDashRegex = /-{2,}/g;
exports.punctuationStartEndRegex = /^[\p{P}]|[\p{P}]$/u;
exports.promotionalWords = [
    'save', 'free shipping', 'best seller', '% off', 'buy', 'open box', 'clearance'
];
exports.MAX_DESCRIPTION_LENGTH = 5000;
exports.MAX_ID_LENGTH = 50;
exports.missingSpaceRegex = /\b\w+,(?=[a-zA-Z])/g;
exports.repeatedDashesRegex = /--|- -/g;
exports.leadingTrailingWhitespaceRegex = /^\s|\s$/g;
exports.repeatedWhitespaceRegex = /\s{2,}/g;
exports.repeatedCommaRegex = /,{2,}/g;
exports.htmlTagRegex = /<[^>]*>/g;
exports.htmlEntityRegex = /&[a-z]+;/gi;
exports.nonBreakingSpaceRegex = /\xA0/g;
// Helper function to escape special characters in regex patterns
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
exports.trailingPeriodRegex = /\.$/;
exports.sizeTokenSplitRegex = /[\s()]+/;
exports.numberOnlyRegex = /^\d+(\.\d+)?$/;
exports.unitMatchRegex = /^([\d\.]+(\+\d+(\.\d+)?)?)([a-z"'.\/]+)$/i;
const tokenBoundaryRegex = (token) => new RegExp(`(^|\\s)${token}(\\s|$)`, 'i');
exports.tokenBoundaryRegex = tokenBoundaryRegex;
const sizeWordBoundaryRegex = (token) => new RegExp(`\\b${token}\\b(?!-)`, 'i');
exports.sizeWordBoundaryRegex = sizeWordBoundaryRegex;
