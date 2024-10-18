"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProductInfoChecker = void 0;
exports.checkImageLinkCommas = checkImageLinkCommas;
exports.checkProductType = checkProductType;
exports.checkProductTypePromotionalWords = checkProductTypePromotionalWords;
exports.checkProductTypeCommas = checkProductTypeCommas;
exports.checkProductTypeRepeatedTiers = checkProductTypeRepeatedTiers;
exports.checkProductTypeWhitespace = checkProductTypeWhitespace;
exports.checkProductTypeRepeatedWhitespace = checkProductTypeRepeatedWhitespace;
exports.checkProductTypeAngleBrackets = checkProductTypeAngleBrackets;
exports.checkGTINLength = checkGTINLength;
exports.checkGTINValidity = checkGTINValidity;
const constants_1 = require("../utils/constants");
function checkImageLinkCommas(item) {
    if (item.image_link && item.image_link.includes(',')) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Commas in Image Link',
            details: 'Image link contains commas',
            affectedField: 'image_link',
            value: item.image_link
        };
    }
    return null;
}
/*******Product Type isn't set***** */
function checkProductType(item) {
    if (!item.product_type || item.product_type.trim() === '') {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Missing Product Type',
            details: 'Product Type is not set',
            affectedField: 'product_type',
            value: item.product_type || ''
        };
    }
    return null;
}
function checkProductTypePromotionalWords(item) {
    if (item.product_type) {
        const foundWords = constants_1.promotionalWords.filter(word => {
            const regex = new RegExp(`\\b${word.replace(/\s+/g, '\\s+')}\\b`, 'i');
            return regex.test(item.product_type);
        });
        if (foundWords.length > 0) {
            const examples = foundWords.slice(0, 3).map(word => {
                const regex = new RegExp(`\\b${word.replace(/\s+/g, '\\s+')}\\b`, 'gi');
                const match = regex.exec(item.product_type);
                if (match) {
                    const startIndex = Math.max(0, match.index - 20);
                    const endIndex = Math.min(item.product_type.length, match.index + match[0].length + 20);
                    const context = item.product_type.slice(startIndex, endIndex);
                    return `"${context}"`;
                }
                return '';
            }).filter(Boolean);
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Promotional Words in Product Type',
                details: `Found ${foundWords.length} promotional word(s): ${foundWords.join(', ')}`,
                affectedField: 'product_type',
                value: examples[0] || item.product_type
            };
        }
    }
    return null;
}
function checkProductTypeCommas(item) {
    if (item.product_type && item.product_type.includes(',')) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Commas in Product Type',
            details: 'Product type contains commas',
            affectedField: 'product_type',
            value: item.product_type
        };
    }
    return null;
}
function checkProductTypeRepeatedTiers(item) {
    if (item.product_type) {
        const tiers = item.product_type.split('>').map(tier => tier.trim());
        const uniqueTiers = new Set(tiers);
        if (tiers.length !== uniqueTiers.size) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Repeated Tiers in Product Type',
                details: 'Product type contains repeated tiers',
                affectedField: 'product_type',
                value: item.product_type
            };
        }
    }
    return null;
}
function checkProductTypeWhitespace(item) {
    if (item.product_type && (/^\s|\s$/.test(item.product_type))) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Whitespace at Product Type Start/End',
            details: 'Product type contains whitespace at start or end',
            affectedField: 'product_type',
            value: item.product_type
        };
    }
    return null;
}
function checkProductTypeRepeatedWhitespace(item) {
    if (item.product_type && constants_1.repeatedWhitespaceRegex.test(item.product_type)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Repeated Whitespace in Product Type',
            details: 'Product type contains repeated whitespace',
            affectedField: 'product_type',
            value: item.product_type
        };
    }
    return null;
}
function checkProductTypeAngleBrackets(item) {
    if (item.product_type) {
        const trimmedProductType = item.product_type.trim();
        if (trimmedProductType.startsWith('>') || trimmedProductType.endsWith('>')) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Angle Bracket at Product Type Start or End',
                details: 'Product type starts or ends with an angle bracket',
                affectedField: 'product_type',
                value: item.product_type
            };
        }
    }
    return null;
}
function parseGTIN(gtin) {
    // Replace comma with dot for proper parsing of scientific notation
    const normalizedGTIN = gtin.replace(',', '.');
    // Check if the string is in scientific notation
    if (/e/i.test(normalizedGTIN)) {
        // Parse the scientific notation and convert to a regular number
        const number = parseFloat(normalizedGTIN);
        // Convert the number to a string, removing any decimal point
        return Math.round(number).toString();
    }
    // If not in scientific notation, just remove non-digit characters
    return normalizedGTIN.replace(/[^\d]/g, '');
}
function checkGTINLength(item) {
    if (item.gtin) {
        const cleanGTIN = parseGTIN(item.gtin);
        if (![8, 12, 13, 14].includes(cleanGTIN.length)) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Incorrect GTIN Length',
                details: `GTIN length is ${cleanGTIN.length}, expected 8, 12, 13, or 14 digits`,
                affectedField: 'gtin',
                value: item.gtin
            };
        }
    }
    return null;
}
function isValidGTIN(gtin) {
    const cleanGTIN = parseGTIN(gtin);
    const digits = cleanGTIN.split('').map(Number);
    const checkDigit = digits.pop();
    const sum = digits.reduce((acc, digit, index) => {
        return acc + digit * (index % 2 === 0 ? 3 : 1);
    }, 0);
    const calculatedCheckDigit = (10 - (sum % 10)) % 10;
    return checkDigit === calculatedCheckDigit;
}
function checkGTINValidity(item) {
    if (item.gtin) {
        const cleanGTIN = parseGTIN(item.gtin);
        if (![8, 12, 13, 14].includes(cleanGTIN.length) || !isValidGTIN(cleanGTIN)) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Invalid GTIN',
                details: 'GTIN is invalid (incorrect length or check digit)',
                affectedField: 'gtin',
                value: item.gtin
            };
        }
    }
    return null;
}
exports.ProductInfoChecker = [
    checkImageLinkCommas,
    checkProductTypePromotionalWords,
    checkProductTypeCommas,
    checkProductTypeRepeatedTiers,
    checkProductTypeWhitespace,
    checkProductTypeRepeatedWhitespace,
    checkProductTypeAngleBrackets,
    checkGTINLength,
    checkGTINValidity
];
