"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GTINChecker = void 0;
exports.checkGTINLength = checkGTINLength;
exports.checkGTINValidity = checkGTINValidity;
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
exports.GTINChecker = [
    checkGTINLength,
    checkGTINValidity
];
