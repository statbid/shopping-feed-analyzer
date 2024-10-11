"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.badAbbreviationsRegex = exports.specialCharsRegex = exports.repeatedDashesRegex = exports.missingSpaceRegex = void 0;
exports.missingSpaceRegex = /\b\w+,(?=[a-zA-Z])/g;
exports.repeatedDashesRegex = /--|- -/g;
exports.specialCharsRegex = /[^a-zA-Z0-9\s.,;:()\-]/g;
exports.badAbbreviationsRegex = /\b(pck|pkg|qty|qt|pc|pcs|ea|(?<=\s|^)in\.(?=\s|$)|ft)\b/gi;
