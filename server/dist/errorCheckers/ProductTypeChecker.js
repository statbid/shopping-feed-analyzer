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
        const foundWords = constants_1.promotionalWords.filter(word => new RegExp(`\\b${word}\\b`, 'i').test(item.product_type));
        if (foundWords.length > 0) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Promotional Words in Product Type',
                details: `Found promotional word(s): ${foundWords.join(', ')}`,
                affectedField: 'product_type',
                value: item.product_type
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
    if (item.product_type && (/^>|\s>|>\s|>$/.test(item.product_type))) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Angle Brackets at Product Type Start/End',
            details: 'Product type contains angle brackets at start or end',
            affectedField: 'product_type',
            value: item.product_type
        };
    }
    return null;
}
function checkGTINLength(item) {
    if (item.gtin && ![8, 12, 13, 14].includes(item.gtin.length)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Incorrect GTIN Length',
            details: 'GTIN length is incorrect',
            affectedField: 'gtin',
            value: item.gtin
        };
    }
    return null;
}
// Bonus: GTIN check digit validation
function isValidGTIN(gtin) {
    const digits = gtin.split('').map(Number);
    const checkDigit = digits.pop();
    const sum = digits.reduce((acc, digit, index) => {
        return acc + digit * (index % 2 === 0 ? 3 : 1);
    }, 0);
    const calculatedCheckDigit = (10 - (sum % 10)) % 10;
    return checkDigit === calculatedCheckDigit;
}
function checkGTINValidity(item) {
    if (item.gtin && !isValidGTIN(item.gtin)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Invalid GTIN',
            details: 'GTIN check digit is invalid',
            affectedField: 'gtin',
            value: item.gtin
        };
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
