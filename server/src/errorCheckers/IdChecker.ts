/**
 * ID Validation Checkers
 *
 * This file defines validation functions to ensure the correctness and uniqueness of the `id` attribute
 * in a `FeedItem`. The primary goal is to validate the ID format, ensure it is set, and detect duplicates.
 *
 * Exported Constants:
 * - `idChecks`: Array of all ID validation functions.
 *
 * Exported Functions:
 * - `checkIdLength`: Validates the length of the ID against the maximum allowed value.
 * - `checkIdIsSet`: Ensures the ID is present and not blank.
 * - `checkDuplicateIds`: Identifies duplicate IDs within the feed using a provided map.
 *
 * Dependencies:
 * - Types: `FeedItem`, `ErrorResult`.
 * - Constants: `MAX_ID_LENGTH`.
 *
 * The checks include:
 * - Verifying that the ID is not blank or missing.
 * - Validating that the ID length does not exceed the allowed maximum.
 * - Identifying duplicate IDs across the feed.
 *
 */


import { FeedItem, ErrorResult } from '@shopping-feed/types';
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

export function checkDuplicateIds(item: FeedItem, idCounts: Map<string, number>): ErrorResult | null {
  if (item.id) {
    const count = (idCounts.get(item.id) || 0) + 1;
    idCounts.set(item.id, count);

    if (count > 1) {
      return {
        id: item.id,
        errorType: 'Duplicate Id',
        details: `This id appears ${count} times in the feed`,
        affectedField: 'id',
        value: item.id
      };
    }
  }
  return null;
}

// Export all id checks together
export const idChecks = [
  checkDuplicateIds,
  checkIdLength,
  checkIdIsSet
];