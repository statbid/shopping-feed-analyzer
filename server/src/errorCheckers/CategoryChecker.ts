// CategoryChecker.ts
import { FeedItem, ErrorResult } from '../types';

export function checkGoogleProductCategory(item: FeedItem): ErrorResult | null {
  if (item.google_product_category) {
    const categoryLevels = item.google_product_category.split('>').filter(Boolean).length;
    if (categoryLevels < 3) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Unspecific Google Product Category',
        details: `Google Product Category isn't specific enough (less than 3 levels)`,
        affectedField: 'google_product_category',
        value: item.google_product_category
      };
    }
  } else {
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

export function checkApparelAttributes(item: FeedItem): ErrorResult | null {
  if (item.google_product_category && item.google_product_category.toLowerCase().includes('apparel')) {
    const missingAttributes = [];
    if (!item.color) missingAttributes.push('color');
    if (!item.size) missingAttributes.push('size');
    if (!item.gender) missingAttributes.push('gender');
    if (!item.age_group) missingAttributes.push('age_group');

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
