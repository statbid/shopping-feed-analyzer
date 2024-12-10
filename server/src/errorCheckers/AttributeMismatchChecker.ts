/**
 * Attribute Validation Checkers
 *
 * This file defines validation functions to check for mismatches between product attributes 
 * (such as gender and age group) and the textual content of the product title in a `FeedItem`.
 * Each function performs a single validation and returns an `ErrorResult` if the validation fails.
 *
 * Exported Functions:
 * - `checkGenderMismatch`: Validates consistency between the gender attribute and title references.
 * - `checkAgeGroupMismatch`: Validates consistency between the age group attribute and title references.
 *
 * Dependencies:
 * - Types: `FeedItem`, `ErrorResult`.
 * - Helper Function: `wordInText` for keyword detection in text.
 *
 * The checks include:
 * - Detecting gender inconsistencies, such as "women" in the title but "male" in the gender attribute.
 * - Detecting age group inconsistencies, such as "baby" in the title but "adult" in the age group attribute.
 *
 */


import { FeedItem, ErrorResult } from '../types';

const femaleWords = ['female', 'women', 'woman', 'girl', 'females','girls'];
const maleWords = ['male', 'men', 'man', 'boy', 'boys'];
const kidWords = ['kid', 'toddler', 'infant', 'baby', 'newborn', 'kids', 'babies'];
const adultWords = ['adult', 'men', 'women', 'man', 'woman'];

function wordInText(words: string[], text: string): boolean {
  return words.some(word => new RegExp(`\\b${word}\\b`, 'i').test(text));
}

export function checkGenderMismatch(item: FeedItem): ErrorResult | null {
  if (item.title && item.gender) {
    const titleLower = item.title.toLowerCase();
    const genderLower = item.gender.toLowerCase();

    if ((wordInText(femaleWords, titleLower) && genderLower === 'male') ||
        (wordInText(maleWords, titleLower) && genderLower === 'female')) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Gender Mismatch',
        details: `Mismatch between title gender reference and gender attribute`,
        affectedField: 'gender',
        value: `Title: "${item.title}", Gender: "${item.gender}"`
      };
    }
  }
  return null;
}

export function checkAgeGroupMismatch(item: FeedItem): ErrorResult | null {
  if (item.title && item.age_group) {
    const titleLower = item.title.toLowerCase();
    const ageGroupLower = item.age_group.toLowerCase();

    if ((wordInText(kidWords, titleLower) && ageGroupLower === 'adult') ||
        (wordInText(adultWords, titleLower) && ['newborn', 'infant', 'toddler', 'kids'].includes(ageGroupLower))) {
      return {
        id: item.id || 'UNKNOWN',
        errorType: 'Age Group Mismatch',
        details: `Mismatch between title age reference and age_group attribute`,
        affectedField: 'age_group',
        value: `Title: "${item.title}", Age Group: "${item.age_group}"`
      };
    }
  }
  return null;
}