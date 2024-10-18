"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkGenderMismatch = checkGenderMismatch;
exports.checkAgeGroupMismatch = checkAgeGroupMismatch;
const femaleWords = ['female', 'women', 'woman', 'girl', 'females', 'girls'];
const maleWords = ['male', 'men', 'man', 'boy', 'boys'];
const kidWords = ['kid', 'toddler', 'infant', 'baby', 'newborn', 'kids', 'babies'];
const adultWords = ['adult', 'men', 'women', 'man', 'woman'];
function wordInText(words, text) {
    return words.some(word => new RegExp(`\\b${word}\\b`, 'i').test(text));
}
function checkGenderMismatch(item) {
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
function checkAgeGroupMismatch(item) {
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
