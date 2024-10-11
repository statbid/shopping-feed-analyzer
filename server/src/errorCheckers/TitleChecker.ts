import { FeedItem, ErrorResult } from '../types';
import { sizeWords, ignoreWords, specialCharsRegex, badAbbreviationsRegex } from '../utils/constants';

export function checkTitleSize(item: FeedItem): ErrorResult | null {
  const titleLower = item.title?.toLowerCase() || '';
  const titleWords = titleLower.split(/\s+/);
  
  if (item.size && !sizeWords.has(item.size.toLowerCase()) && !titleWords.includes(item.size.toLowerCase())) {
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Size Mismatch',
      details: `Title does not contain size (${item.size}) when size is set`,
      affectedField: 'title',
      value: item.title || ''
    };
  }
  return null;
}

export function checkTitleColor(item: FeedItem): ErrorResult | null {
  const titleLower = item.title?.toLowerCase() || '';
  
  if (item.color && !titleLower.includes(item.color.toLowerCase())) {
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Color Mismatch',
      details: `Title does not contain color "${item.color}" when color is set`,
      affectedField: 'title',
      value: item.title || ''
    };
  }
  return null;
}

export function checkTitleDuplicateWords(item: FeedItem): ErrorResult | null {
  const titleLower = item.title?.toLowerCase() || '';
  const titleWords = titleLower.split(/\s+/);
  
  const filteredWords = titleWords.filter(word => 
    !ignoreWords.has(word) && 
    !/^\d+('|ft|in|cm|m|mm)?$/.test(word) &&
    word.length > 2
  );
  const duplicates = filteredWords.filter((word, index) => filteredWords.indexOf(word) !== index);
  
  if (duplicates.length > 0) {
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Duplicate Words in Title',
      details: `Title contains duplicate words: ${[...new Set(duplicates)].join(', ')}`,
      affectedField: 'title',
      value: item.title || ''
    };
  }
  return null;
}

export function checkTitleSpecialCharacters(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const specialCharsMatches = item.title.match(specialCharsRegex);
    if (specialCharsMatches) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Special Characters in Title',
        details: `Found special character(s): ${specialCharsMatches.join(', ')}`,
        affectedField: 'title',
        value: item.title
      };
    }
  }
  return null;
}

export function checkTitleBadAbbreviations(item: FeedItem): ErrorResult | null {
  if (item.title) {
    const badAbbreviationsMatches = item.title.match(badAbbreviationsRegex);
    if (badAbbreviationsMatches) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Bad Abbreviations in Title',
        details: `Found bad abbreviation(s): ${[...new Set(badAbbreviationsMatches.map(m => m.toLowerCase()))].join(', ')}`,
        affectedField: 'title',
        value: item.title
      };
    }
  }
  return null;
}

export function checkTitleBrand(item: FeedItem): ErrorResult | null {
  const titleLower = item.title?.toLowerCase() || '';
  
  if (item.brand && !titleLower.includes(item.brand.toLowerCase())) {
    return {
      id: item.id || 'UNKNOWN',
      errorType: 'Missing Brand in Title',
      details: `Missing brand: ${item.brand}`,
      affectedField: 'title',
      value: item.title || ''
    };
  }
  return null;
}
