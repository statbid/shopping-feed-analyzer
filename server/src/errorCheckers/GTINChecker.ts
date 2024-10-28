import { FeedItem, ErrorResult } from '../types';

function cleanGTIN(gtin: string): string {
  // First check if it's in scientific notation
  if (/^-?\d*\.?\d+e[+-]?\d+$/i.test(gtin)) {
    // Convert scientific notation to regular number and remove decimals
    return Math.round(parseFloat(gtin)).toString();
  }
  
  // If not scientific notation, just remove non-digits
  return gtin.replace(/[^\d]/g, '');
}

export function checkGTINLength(item: FeedItem): ErrorResult | null {
  // Skip check if GTIN is null, undefined, or empty string
  if (!item.gtin?.trim()) {
    return null;
  }

  // Clean the GTIN
  const cleanedGTIN = cleanGTIN(item.gtin);
  const validLengths = [8, 12, 13, 14];

  // Skip check if input contains non-numeric characters after scientific notation conversion
  if (!/^\d+$/.test(cleanedGTIN)) {
    return null;
  }
  
  if (!validLengths.includes(cleanedGTIN.length)) {
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Incorrect GTIN Length',
      details: `GTIN length is ${cleanedGTIN.length}, expected 8, 12, 13, or 14 digits`,
      affectedField: 'gtin',
      value: `"${cleanedGTIN}"`
    };
  }

  return null;
}


export const GTINChecker = [
  checkGTINLength
];