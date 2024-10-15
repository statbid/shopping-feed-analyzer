"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkProductType = checkProductType;
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
