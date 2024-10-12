"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TitleChecker = void 0;
exports.checkTitleSize = checkTitleSize;
exports.checkTitleColor = checkTitleColor;
exports.checkTitleDuplicateWords = checkTitleDuplicateWords;
exports.checkTitleSpecialCharacters = checkTitleSpecialCharacters;
exports.checkTitleBadAbbreviations = checkTitleBadAbbreviations;
exports.checkTitleBrand = checkTitleBrand;
exports.checkTitleMaterial = checkTitleMaterial;
exports.checkTitleWhitespace = checkTitleWhitespace;
exports.checkTitleRepeatedWhitespace = checkTitleRepeatedWhitespace;
exports.checkTitleRepeatedDashes = checkTitleRepeatedDashes;
exports.checkTitleRepeatedCommas = checkTitleRepeatedCommas;
exports.checkTitlePunctuation = checkTitlePunctuation;
exports.checkTitleHtml = checkTitleHtml;
exports.checkTitleHtmlEntities = checkTitleHtmlEntities;
exports.checkTitlePromotionalWords = checkTitlePromotionalWords;
exports.checkTitleMissingSpaces = checkTitleMissingSpaces;
exports.checkTitleNonBreakingSpaces = checkTitleNonBreakingSpaces;
const constants_1 = require("../utils/constants");
function checkTitleSize(item) {
    var _a;
    const titleLower = ((_a = item.title) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    const titleWords = titleLower.split(/\s+/);
    if (item.size && !constants_1.sizeWords.has(item.size.toLowerCase()) && !titleWords.includes(item.size.toLowerCase())) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Size Mismatch',
            details: `Title does not contain size (${item.size}) when size is set`,
            affectedField: 'title',
            value: item.title || ''
        };
    }
    return null;
}
function checkTitleColor(item) {
    var _a;
    const titleLower = ((_a = item.title) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    if (item.color && !titleLower.includes(item.color.toLowerCase())) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Color Mismatch',
            details: `Title does not contain color "${item.color}" when color is set`,
            affectedField: 'title',
            value: item.title || ''
        };
    }
    return null;
}
function checkTitleDuplicateWords(item) {
    var _a;
    const titleLower = ((_a = item.title) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    const titleWords = titleLower.split(/\s+/);
    const filteredWords = titleWords.filter(word => !constants_1.ignoreWords.has(word) &&
        !/^\d+('|ft|in|cm|m|mm)?$/.test(word) &&
        word.length > 2);
    const duplicates = filteredWords.filter((word, index) => filteredWords.indexOf(word) !== index);
    if (duplicates.length > 0) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Duplicate Words in Title',
            details: `Title contains duplicate words: ${[...new Set(duplicates)].join(', ')}`,
            affectedField: 'title',
            value: item.title || ''
        };
    }
    return null;
}
function checkTitleSpecialCharacters(item) {
    if (item.title) {
        const specialCharsMatches = item.title.match(constants_1.specialCharsRegex);
        if (specialCharsMatches) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Special Characters in Title',
                details: `Found special character(s): ${specialCharsMatches.join(', ')}`,
                affectedField: 'title',
                value: item.title
            };
        }
    }
    return null;
}
function checkTitleBadAbbreviations(item) {
    if (item.title) {
        const badAbbreviationsMatches = item.title.match(constants_1.badAbbreviationsRegex);
        if (badAbbreviationsMatches) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Bad Abbreviations in Title',
                details: `Found bad abbreviation(s): ${[...new Set(badAbbreviationsMatches.map(m => m.toLowerCase()))].join(', ')}`,
                affectedField: 'title',
                value: item.title
            };
        }
    }
    return null;
}
function checkTitleBrand(item) {
    var _a;
    const titleLower = ((_a = item.title) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    if (item.brand && !titleLower.includes(item.brand.toLowerCase())) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Missing Brand in Title',
            details: `Missing brand: ${item.brand}`,
            affectedField: 'title',
            value: item.title || ''
        };
    }
    return null;
}
function checkTitleMaterial(item) {
    var _a;
    const titleLower = ((_a = item.title) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    if (item.material && !titleLower.includes(item.material.toLowerCase())) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Missing Material in Title',
            details: `Missing material: ${item.material}`,
            affectedField: 'title',
            value: item.title || ''
        };
    }
    return null;
}
function checkTitleWhitespace(item) {
    if (item.title && (item.title.startsWith(' ') || item.title.endsWith(' '))) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Whitespace at Title Start/End',
            details: 'Title contains whitespace at start or end',
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
function checkTitleRepeatedWhitespace(item) {
    if (item.title && constants_1.repeatedWhitespaceRegex.test(item.title)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Repeated Whitespace in Title',
            details: 'Title contains repeated whitespace',
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
function checkTitleRepeatedDashes(item) {
    if (item.title && constants_1.repeatedDashRegex.test(item.title)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Repeated Dashes in Title',
            details: 'Title contains repeated dashes',
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
function checkTitleRepeatedCommas(item) {
    if (item.title && constants_1.repeatedCommaRegex.test(item.title)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Repeated Commas in Title',
            details: 'Title contains repeated commas',
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
function checkTitlePunctuation(item) {
    if (item.title && constants_1.punctuationStartEndRegex.test(item.title)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Punctuation at Title Start/End',
            details: 'Title contains punctuation at start or end',
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
function checkTitleHtml(item) {
    if (item.title && constants_1.htmlTagRegex.test(item.title)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'HTML in Title',
            details: 'Title contains HTML tags',
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
function checkTitleHtmlEntities(item) {
    if (item.title && constants_1.htmlEntityRegex.test(item.title)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'HTML Entities in Title',
            details: 'Title contains HTML entities',
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
function checkTitlePromotionalWords(item) {
    if (item.title) {
        const foundWords = constants_1.promotionalWords.filter(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            return regex.test(item.title);
        });
        if (foundWords.length > 0) {
            const examples = foundWords.slice(0, 3).map(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                const match = regex.exec(item.title);
                if (match) {
                    const startIndex = Math.max(0, match.index - 20);
                    const endIndex = Math.min(item.title.length, match.index + match[0].length + 20);
                    const context = item.title.slice(startIndex, endIndex);
                    return `"${context}" (found: "${match[0]}")`;
                }
                return '';
            }).filter(Boolean);
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Promotional Words in Title',
                details: `Found ${foundWords.length} promotional word(s): ${foundWords.join(', ')}`,
                affectedField: 'title',
                value: examples[0] || item.title
            };
        }
    }
    return null;
}
/***************TODO*************** */
function checkTitleMissingSpaces(item) {
    if (item.title && constants_1.missingSpaceRegex.test(item.title)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Missing Spaces in Title',
            details: 'Title contains words without spaces after commas',
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
function checkTitleNonBreakingSpaces(item) {
    if (item.title && constants_1.nonBreakingSpaceRegex.test(item.title)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Non-Breaking Spaces in Title',
            details: 'Title contains non-breaking spaces',
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
exports.TitleChecker = [
    checkTitleSize,
    checkTitleColor,
    checkTitleDuplicateWords,
    checkTitleSpecialCharacters,
    checkTitleBadAbbreviations,
    checkTitleBrand,
    checkTitleMaterial,
    checkTitleWhitespace,
    checkTitleRepeatedWhitespace,
    checkTitleRepeatedDashes,
    checkTitleRepeatedCommas,
    checkTitlePunctuation,
    checkTitleHtml,
    checkTitleHtmlEntities,
    checkTitlePromotionalWords,
    checkTitleMissingSpaces,
    checkTitleNonBreakingSpaces
];
