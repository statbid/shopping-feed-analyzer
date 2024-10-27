// CategoryChecker.ts
import { FeedItem, ErrorResult } from '../types';

/*****Google Product Category isn't specific enough**********Google Product Category isn't set************** */


export function checkGoogleProductCategory(item: FeedItem): ErrorResult | null {
  // Ensure the category exists and is not just empty spaces
  const category = item.google_product_category?.trim();

  if (category) {
    //check if the category is purely numeric (e.g., "500")
    if (/^\d+$/.test(category)) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Invalid Google Product Category',
        details: 'Google Product Category is invalid (numbered category is not allowed)',
        affectedField: 'google_product_category',
        value: item.google_product_category || ''
      };
    }

    // Split the category by ">" and filter out empty levels
    const categoryLevels = category.split('>').filter(level => level.trim()).length;
    
    // If fewer than 3 levels, mark it as an error
    if (categoryLevels < 3) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Google Product Category is Incomplete',
        details: `Google Product Category is incomplete (less than 3 levels)`,
        affectedField: 'google_product_category',
        value: item.google_product_category || ''
      };
    }
  } else {
    // If the category is missing, mark it as an error
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Google Product Category is not set',
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
        affectedField: missingAttributes.join(', '), // List all missing fields here
        value: `Missing required fields for Google Product Category: ${item.google_product_category}`
      };
    }
  }
  return null;
}

/*******Google Product Category isn't valid****** */

export function checkGoogleProductCategoryValidity(item: FeedItem): ErrorResult | null {
  const category = item.google_product_category?.trim();
 
  if (category && /^\d+$/.test(category)) {
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Google Product Category is Invalid',
      details: 'Google Product Category is invalid (numbered category is not allowed)',
      affectedField: 'google_product_category',
      value: item.google_product_category || ''
    };
  }

  return null;
}

