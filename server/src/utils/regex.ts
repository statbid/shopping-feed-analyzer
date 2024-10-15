export const missingSpaceRegex = /\b\w+,(?=[a-zA-Z])/g;
export const repeatedDashesRegex = /--|- -/g;
export const specialCharsRegex = /[^a-zA-Z0-9\s.,;:()\-]/g;
export const badAbbreviationsRegex = /\b(pck|pkg|qty|qt|pc|pcs|ea|(?<=\s|^)in\.(?=\s|$)|ft)\b/gi;

