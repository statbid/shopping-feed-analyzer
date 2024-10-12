import { FeedItem, ErrorResult } from '../types';

export function checkProductType(item: FeedItem): ErrorResult | null {
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
  