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