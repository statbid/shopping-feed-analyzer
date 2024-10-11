import { FeedItem, ErrorResult } from '../types';

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

  
export const requiredFieldsChecks = [
  checkLinkIsSet
];