import { FeedItem, ErrorResult } from '../types';
import { missingSpaceRegex, repeatedDashesRegex } from '../utils/constants';

import { 
    leadingTrailingWhitespaceRegex, 
    repeatedWhitespaceRegex, 
    repeatedCommaRegex,
    htmlTagRegex, 
    htmlEntityRegex 
  } from '../utils/constants';


export function checkDescriptionMissingSpaces(item: FeedItem): ErrorResult | null {
  if (item.description) {
    const missingSpaceMatches = [...item.description.matchAll(missingSpaceRegex)];
    if (missingSpaceMatches.length > 0) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Missing Spaces After Commas',
        details: `Found ${missingSpaceMatches.length} comma(s) followed by non-space characters`,
        affectedField: 'description',
        value: item.description
      };
    }
  }
  return null;
}

export function checkDescriptionRepeatedDashes(item: FeedItem): ErrorResult | null {
  if (item.description) {
    const repeatedDashesMatches = [...item.description.matchAll(repeatedDashesRegex)];
    if (repeatedDashesMatches.length > 0) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Repeated Dashes in Description',
        details: `Found ${repeatedDashesMatches.length} instance(s) of repeated dashes`,
        affectedField: 'description',
        value: item.description
      };
    }
  }
  return null;
}



export function checkDescriptionWhitespace(item: FeedItem): ErrorResult | null {
    if (item.description && leadingTrailingWhitespaceRegex.test(item.description)) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Whitespace at Edges in Description',
        details: 'Description contains whitespace at the start or end',
        affectedField: 'description',
        value: item.description
      };
    }
    return null;
  }
  
  export function checkDescriptionRepeatedWhitespace(item: FeedItem): ErrorResult | null {
    if (item.description && repeatedWhitespaceRegex.test(item.description)) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Repeated Whitespace in Description',
        details: 'Description contains repeated whitespace characters',
        affectedField: 'description',
        value: item.description
      };
    }
    return null;
  }
  
  export function checkDescriptionRepeatedCommas(item: FeedItem): ErrorResult | null {
    if (item.description && repeatedCommaRegex.test(item.description)) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Repeated Commas in Description',
        details: 'Description contains repeated commas',
        affectedField: 'description',
        value: item.description
      };
    }
    return null;
  }
  
  export function checkDescriptionHtml(item: FeedItem): ErrorResult | null {
    if (item.description && htmlTagRegex.test(item.description)) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'HTML in Description',
        details: 'Description contains HTML tags',
        affectedField: 'description',
        value: item.description
      };
    }
    return null;
  }
  
  export function checkDescriptionHtmlEntities(item: FeedItem): ErrorResult | null {
    if (item.description && htmlEntityRegex.test(item.description)) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'HTML Entities in Description',
        details: 'Description contains HTML entities',
        affectedField: 'description',
        value: item.description
      };
    }
    return null;
  }