"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nonBreakingSpaceRegex = exports.htmlEntityRegex = exports.htmlTagRegex = exports.repeatedCommaRegex = exports.repeatedWhitespaceRegex = exports.leadingTrailingWhitespaceRegex = exports.repeatedDashesRegex = exports.missingSpaceRegex = exports.MAX_ID_LENGTH = exports.MAX_DESCRIPTION_LENGTH = exports.promotionalWords = exports.punctuationStartEndRegex = exports.repeatedDashRegex = exports.badAbbreviationsRegex = exports.specialCharsRegex = exports.ignoreWords = exports.sizeWords = void 0;
exports.sizeWords = new Set(['xs', 's', 'm', 'l', 'xl', 'small', 'medium', 'large']);
exports.ignoreWords = new Set(['x', 'by', 'in', 'inch', 'inches', 'ft', 'feet', 'cm', 'm', 'mm']);
exports.specialCharsRegex = /[^a-zA-Z0-9\s.,;:()\-]/g;
exports.badAbbreviationsRegex = /\b(pck|pkg|qty|qt|pc|pcs|ea|(?<=\s|^)in\.(?=\s|$)|ft)\b/gi;
exports.repeatedDashRegex = /-{2,}/g;
exports.punctuationStartEndRegex = /^[!,.?:;]|[!,.?:;]$/;
exports.promotionalWords = [
    'save', 'off', 'free shipping', 'best seller', '% off', 'buy', 'open box', 'clearance'
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
exports.nonBreakingSpaceRegex = /\u00A0/g;
