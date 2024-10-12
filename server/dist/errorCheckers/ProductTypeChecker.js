"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkProductType = checkProductType;
exports.checkImageLink = checkImageLink;
exports.checkAvailability = checkAvailability;
exports.checkPrice = checkPrice;
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
