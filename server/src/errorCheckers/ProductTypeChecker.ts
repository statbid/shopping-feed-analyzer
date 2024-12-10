/**
 * Product Information Validation Checkers
 *
 * This file contains validation functions for checking errors related to
 * product information fields in a feed item, such as `product_type` and
 * `image_link`. Each function performs a specific validation and returns an
 * `ErrorResult` if the validation fails.
 *
 * Exported Constants:
 * - `ProductInfoChecker`: Array of all product information validation functions.
 *
 * Functions:
 * - `checkImageLinkCommas`: Checks if the image link contains commas.
 * - `checkProductType`: Verifies if the product type is set.
 * - `checkProductTypePromotionalWords`: Detects promotional words in the product type.
 * - `checkProductTypeCommas`: Checks if the product type contains commas.
 * - `checkProductTypeRepeatedTiers`: Identifies repeated tiers in the product type hierarchy.
 * - `checkProductTypeWhitespace`: Detects leading or trailing whitespace in the product type.
 * - `checkProductTypeRepeatedWhitespace`: Checks for repeated whitespace in the product type.
 * - `checkProductTypeAngleBrackets`: Verifies if the product type starts or ends with angle brackets.
 *
 */

import { FeedItem, ErrorResult } from '../types';
import { 
  promotionalWords, 
  repeatedWhitespaceRegex 
} from '../utils/constants';

export function checkImageLinkCommas(item: FeedItem): ErrorResult | null {
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
export function checkProductType(item: FeedItem): ErrorResult | null {
  if (!item.product_type || item.product_type.trim() === '') {
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Product Type is not set',
      details: 'Product Type is not set',
      affectedField: 'product_type',
      value: item.product_type || ''
    };
  }
  return null;
}
export function checkProductTypePromotionalWords(item: FeedItem): ErrorResult | null {
  if (item.product_type) {
    const foundWords = promotionalWords.filter(word => {
      const regex = new RegExp(`\\b${word.replace(/\s+/g, '\\s+')}\\b`, 'i');
      return regex.test(item.product_type!);
    });

    if (foundWords.length > 0) {
      const examples = foundWords.slice(0, 3).map(word => {
        const regex = new RegExp(`\\b${word.replace(/\s+/g, '\\s+')}\\b`, 'gi');
        const match = regex.exec(item.product_type!);
        if (match) {
          const startIndex = Math.max(0, match.index - 20);
          const endIndex = Math.min(item.product_type!.length, match.index + match[0].length + 20);
          const context = item.product_type!.slice(startIndex, endIndex);
          return `"${context}"`;
        }
        return '';
      }).filter(Boolean);

      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Product Type Contains Promotional Words',
        details: `Found ${foundWords.length} promotional word(s): ${foundWords.join(', ')}`,
        affectedField: 'product_type',
        value: examples[0] || item.product_type
      };
    }
  }
  return null;
}

export function checkProductTypeCommas(item: FeedItem): ErrorResult | null {
  if (item.product_type && item.product_type.includes(',')) {
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Commas in Product Type',
      details: 'Product Type Contains Commas',
      affectedField: 'product_type',
      value: item.product_type
    };
  }
  return null;
}

export function checkProductTypeRepeatedTiers(item: FeedItem): ErrorResult | null {
  if (item.product_type) {
    const tiers = item.product_type.split('>').map(tier => tier.trim());
    const uniqueTiers = new Set(tiers);
    if (tiers.length !== uniqueTiers.size) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Product Type Contains Repeated Tiers',
        details: 'Product type contains repeated tiers',
        affectedField: 'product_type',
        value: item.product_type
      };
    }
  }
  return null;
}

export function checkProductTypeWhitespace(item: FeedItem): ErrorResult | null {
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

export function checkProductTypeRepeatedWhitespace(item: FeedItem): ErrorResult | null {
  if (item.product_type && repeatedWhitespaceRegex.test(item.product_type)) {
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


export function checkProductTypeAngleBrackets(item: FeedItem): ErrorResult | null {
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





export const ProductInfoChecker = [
  checkImageLinkCommas,
  checkProductTypePromotionalWords,
  checkProductTypeCommas,
  checkProductTypeRepeatedTiers,
  checkProductTypeWhitespace,
  checkProductTypeRepeatedWhitespace,
  checkProductTypeAngleBrackets,
  
];