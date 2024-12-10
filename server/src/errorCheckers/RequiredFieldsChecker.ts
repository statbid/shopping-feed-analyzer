/**
 * Required Fields Validation
 *
 * This file contains validation functions to ensure the presence and correctness of required fields
 * in a `FeedItem` object, such as `link`, `image_link`, `price`, and others.
 *
 * Functions:
 * - `checkShippingWeight`: Validates the presence and format of the `shipping_weight` field.
 * - `checkLinkIsSet`: Validates the presence of the `link` field.
 * - `checkImageLink`: Validates the presence of the `image_link` field.
 * - `checkAvailability`: Validates the presence of the `availability` field.
 * - `checkPrice`: Validates the presence of the `price` field.
 * - `checkBrand`: Validates the presence of the `brand` field.
 * - `checkCondition`: Validates the presence of the `condition` field.
 * - `checkMPN`: Validates the presence of the `mpn` (Manufacturer Part Number) field.
 *
 * Constants:
 * - `validWeightUnits`: Set of valid units for the `shipping_weight` field.
 * - `requiredFieldsChecks`: Array of all required field validation functions.
 *
 * Features:
 * - Ensures essential fields like `link`, `image_link`, and `price` are present.
 * - Verifies `shipping_weight` uses a valid format and unit (e.g., "2.5 lbs").
 * - Generates detailed error messages for missing or invalid fields.
 */


import { FeedItem, ErrorResult } from '@shopping-feed/types';


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


function isValidWeightFormat(weight: string): boolean {
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


export function checkShippingWeight(item: FeedItem): ErrorResult | null {
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

export function checkLinkIsSet(item: FeedItem): ErrorResult | null {
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
export function checkImageLink(item: FeedItem): ErrorResult | null {
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
  
  export function checkAvailability(item: FeedItem): ErrorResult | null {
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
  
export function checkPrice(item: FeedItem): ErrorResult | null {
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
  
  export function checkBrand(item: FeedItem): ErrorResult | null {
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
  
  export function checkCondition(item: FeedItem): ErrorResult | null {
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

  
export function checkMPN(item: FeedItem): ErrorResult | null {
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


export const requiredFieldsChecks = [
  checkLinkIsSet,
  checkImageLink,
  checkPrice,
  checkCondition,
  checkBrand,
  checkAvailability,
  checkMPN,
  checkShippingWeight
];