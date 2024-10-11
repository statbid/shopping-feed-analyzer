import { FeedItem, ErrorResult } from '../types';
import { missingSpaceRegex, repeatedDashesRegex } from '../utils/constants';

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