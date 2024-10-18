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