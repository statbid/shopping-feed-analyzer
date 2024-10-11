"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkTitleSize = checkTitleSize;
exports.checkTitleColor = checkTitleColor;
exports.checkTitleDuplicateWords = checkTitleDuplicateWords;
exports.checkTitleSpecialCharacters = checkTitleSpecialCharacters;
exports.checkTitleBadAbbreviations = checkTitleBadAbbreviations;
exports.checkTitleBrand = checkTitleBrand;
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
