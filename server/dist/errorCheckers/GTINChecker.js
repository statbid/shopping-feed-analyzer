"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GTINChecker = void 0;
exports.checkGTINLength = checkGTINLength;
function cleanGTIN(gtin) {
    // First check if it's in scientific notation
    if (/^-?\d*\.?\d+e[+-]?\d+$/i.test(gtin)) {
        // Convert scientific notation to regular number and remove decimals
        return Math.round(parseFloat(gtin)).toString();
    }
    // If not scientific notation, just remove non-digits
    return gtin.replace(/[^\d]/g, '');
}
function checkGTINLength(item) {
    var _a;
    // Skip check if GTIN is null, undefined, or empty string
    if (!((_a = item.gtin) === null || _a === void 0 ? void 0 : _a.trim())) {
        return null;
    }
    // Clean the GTIN
    const cleanedGTIN = cleanGTIN(item.gtin);
    const validLengths = [8, 12, 13, 14];
    // Skip check if input contains non-numeric characters after scientific notation conversion
    if (!/^\d+$/.test(cleanedGTIN)) {
        return null;
    }
    if (!validLengths.includes(cleanedGTIN.length)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Incorrect GTIN Length',
            details: `GTIN length is ${cleanedGTIN.length}, expected 8, 12, 13, or 14 digits`,
            affectedField: 'gtin',
            value: `"${cleanedGTIN}"`
        };
    }
    return null;
}
exports.GTINChecker = [
    checkGTINLength
];
