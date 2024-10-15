// CategoryChecker.ts
import { FeedItem, ErrorResult } from '../types';

/*****Google Product Category isn't specific enough**********Google Product Category isn't set************** */


export function checkGoogleProductCategory(item: FeedItem): ErrorResult | null {
  // Ensure the category exists and is not just empty spaces
  const category = item.google_product_category?.trim();

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
  } else {
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


/*******Google Product Category contains “Apparel”, but color, size, gender, or age_group are missing************** */

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

