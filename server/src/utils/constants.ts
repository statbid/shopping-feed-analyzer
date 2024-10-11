export const sizeWords = new Set(['xs', 's', 'm', 'l', 'xl', 'small', 'medium', 'large']);
export const ignoreWords = new Set(['x', 'by', 'in', 'inch', 'inches', 'ft', 'feet', 'cm', 'm', 'mm']);
export const missingSpaceRegex = /\b\w+,(?=[a-zA-Z])/g;
export const repeatedDashesRegex = /--|- -/g;
export const specialCharsRegex = /[^a-zA-Z0-9\s.,;:()\-]/g;
export const badAbbreviationsRegex = /\b(pck|pkg|qty|qt|pc|pcs|ea|(?<=\s|^)in\.(?=\s|$)|ft)\b/gi;
export const repeatedWhitespaceRegex = /\s{2,}/g;
export const repeatedDashRegex = /-{2,}/g;
export const repeatedCommaRegex = /,{2,}/g;
export const punctuationStartEndRegex = /^[!,.?:;]|[!,.?:;]$/;

export const htmlTagRegex = /<[^>]*>/;
export const htmlEntityRegex = /&[a-z]+;/i;
export const promotionalWords = [
  'save', 'off', 'free shipping', 'best seller', '% off', 'buy', 'open box', 'clearance'
];
export const nonBreakingSpaceRegex = /\u00A0/;

export const leadingTrailingWhitespaceRegex = /^\s|\s$/;
