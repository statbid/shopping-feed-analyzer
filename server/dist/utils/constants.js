"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badAbbreviationsRegex = exports.specialCharsRegex = exports.repeatedDashesRegex = exports.missingSpaceRegex = exports.ignoreWords = exports.sizeWords = void 0;
exports.sizeWords = new Set(['xs', 's', 'm', 'l', 'xl', 'small', 'medium', 'large']);
exports.ignoreWords = new Set(['x', 'by', 'in', 'inch', 'inches', 'ft', 'feet', 'cm', 'm', 'mm']);
exports.missingSpaceRegex = /\b\w+,(?=[a-zA-Z])/g;
exports.repeatedDashesRegex = /--|- -/g;
exports.specialCharsRegex = /[^a-zA-Z0-9\s.,;:()\-]/g;
exports.badAbbreviationsRegex = /\b(pck|pkg|qty|qt|pc|pcs|ea|(?<=\s|^)in\.(?=\s|$)|ft)\b/gi;
