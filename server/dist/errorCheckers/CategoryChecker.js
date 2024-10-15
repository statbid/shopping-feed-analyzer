"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGoogleProductCategory = checkGoogleProductCategory;
exports.checkApparelAttributes = checkApparelAttributes;
function checkGoogleProductCategory(item) {
    var _a;
    // Ensure the category exists and is not just empty spaces
    const category = (_a = item.google_product_category) === null || _a === void 0 ? void 0 : _a.trim();
    if (category) {
        // Split the category by ">" and filter out empty levels
        const categoryLevels = category.split('>').filter(level => level.trim()).length;
        // If fewer than 3 levels, mark it as an error
        if (categoryLevels < 3) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Unspecific Google Product Category',
                details: `Google Product Category isn't specific enough (less than 3 levels)`,
                affectedField: 'google_product_category',
                value: item.google_product_category || ''
            };
        }
    }
    else {
        // If the category is missing, mark it as an error
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Missing Google Product Category',
            details: 'Google Product Category is not set',
            affectedField: 'google_product_category',
            value: ''
        };
    }
    return null;
}
function checkApparelAttributes(item) {
    if (item.google_product_category && item.google_product_category.toLowerCase().includes('apparel')) {
        const missingAttributes = [];
        if (!item.color)
            missingAttributes.push('color');
        if (!item.size)
            missingAttributes.push('size');
        if (!item.gender)
            missingAttributes.push('gender');
        if (!item.age_group)
            missingAttributes.push('age_group');
        if (missingAttributes.length > 0) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Missing Apparel Attributes',
                details: `Apparel item is missing: ${missingAttributes.join(', ')}`,
                affectedField: 'google_product_category',
                value: item.google_product_category
            };
        }
    }
    return null;
}
