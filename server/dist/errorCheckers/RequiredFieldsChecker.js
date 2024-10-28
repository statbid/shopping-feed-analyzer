"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requiredFieldsChecks = void 0;
exports.checkShippingWeight = checkShippingWeight;
exports.checkLinkIsSet = checkLinkIsSet;
exports.checkImageLink = checkImageLink;
exports.checkAvailability = checkAvailability;
exports.checkPrice = checkPrice;
exports.checkBrand = checkBrand;
exports.checkCondition = checkCondition;
exports.checkMPN = checkMPN;
const validWeightUnits = new Set([
    'oz', 'oz.',
    'lb', 'lb.',
    'lbs', 'lbs.',
    'g', 'g.',
    'kg', 'kg.',
    'gram', 'grams',
    'kilogram', 'kilograms',
    'ounce', 'ounces',
    'pound', 'pounds'
]);
function isValidWeightFormat(weight) {
    const weightPattern = /^(\d+\.?\d*)\s*([a-zA-Z.]+)$/;
    const match = weight.trim().match(weightPattern);
    if (!match) {
        return false;
    }
    const [, value, unit] = match;
    const numericValue = parseFloat(value);
    if (isNaN(numericValue) || numericValue < 0) {
        return false;
    }
    const cleanUnit = unit.toLowerCase().replace(/\.+$/, '');
    return validWeightUnits.has(cleanUnit);
}
function checkShippingWeight(item) {
    // First check if shipping_weight is set
    if (!item.shipping_weight || item.shipping_weight.trim() === '') {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Missing Shipping Weight',
            details: 'Shipping weight is not set',
            affectedField: 'shipping_weight',
            value: ''
        };
    }
    // Then check if it has the correct format
    if (!isValidWeightFormat(item.shipping_weight)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Invalid Shipping Weight Format',
            details: 'Shipping weight must be a non-negative number with a valid unit (e.g., "0 oz", "2.5 lbs", "1 kg")',
            affectedField: 'shipping_weight',
            value: item.shipping_weight
        };
    }
    return null;
}
function checkLinkIsSet(item) {
    if (!item.link || item.link.trim() === '') {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Link Not Set',
            details: 'Link is blank or not set',
            affectedField: 'link',
            value: ''
        };
    }
    return null;
}
function checkImageLink(item) {
    if (!item.image_link || item.image_link.trim() === '') {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Missing Image Link',
            details: 'Image link is not set',
            affectedField: 'image_link',
            value: item.image_link || ''
        };
    }
    return null;
}
function checkAvailability(item) {
    if (!item.availability || item.availability.trim() === '') {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Missing Availability',
            details: 'Availability is not set',
            affectedField: 'availability',
            value: item.availability || ''
        };
    }
    return null;
}
function checkPrice(item) {
    if (!item.price || item.price.trim() === '') {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Missing Price',
            details: 'Price is not set',
            affectedField: 'price',
            value: item.price || ''
        };
    }
    return null;
}
function checkBrand(item) {
    if (!item.brand || item.brand.trim() === '') {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Missing Brand',
            details: 'Brand is not set',
            affectedField: 'brand',
            value: item.brand || ''
        };
    }
    return null;
}
function checkCondition(item) {
    if (!item.condition || item.condition.trim() === '') {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Missing Condition',
            details: 'Condition is not set',
            affectedField: 'condition',
            value: item.condition || ''
        };
    }
    return null;
}
function checkMPN(item) {
    if (!item.mpn || item.mpn.trim() === '') {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Missing MPN',
            details: 'Manufacturer Part Number (MPN) is not set',
            affectedField: 'mpn',
            value: item.mpn || ''
        };
    }
    return null;
}
exports.requiredFieldsChecks = [
    checkLinkIsSet,
    checkImageLink,
    checkPrice,
    checkCondition,
    checkBrand,
    checkAvailability,
    checkMPN,
    checkShippingWeight
];
