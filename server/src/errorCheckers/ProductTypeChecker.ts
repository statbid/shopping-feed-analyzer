
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
        errorType: 'Promotional Words in Product Type',
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
      details: 'Product type contains commas',
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
        errorType: 'Repeated Tiers in Product Type',
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