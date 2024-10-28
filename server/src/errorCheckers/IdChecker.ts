import { FeedItem, ErrorResult } from '../types';
import { MAX_ID_LENGTH } from '../utils/constants';


export function checkIdLength(item: FeedItem): ErrorResult | null {
  
  if (item.id && item.id.length > MAX_ID_LENGTH) {
    return {
      id: item.id,
      errorType: 'Id Too Long',
      details: `Id exceeds ${MAX_ID_LENGTH} characters`,
      affectedField: 'id',
      value: item.id
    };
  }
  return null;
}



export function checkIdIsSet(item: FeedItem): ErrorResult | null {

  if (!item.id || item.id.trim() === '') {
    return {
      id: 'UNKNOWN',
      errorType: 'Id Not Set',
      details: `Id is blank or not set`,
      affectedField: 'id',
      value: ''
    };
  }
  return null;
}

export const idChecks = [
  checkIdLength,
  checkIdIsSet
];