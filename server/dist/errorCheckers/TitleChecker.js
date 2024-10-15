"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TitleChecker = void 0;
exports.checkTitleSize = checkTitleSize;
exports.checkTitleColor = checkTitleColor;
exports.checkTitleDuplicateWords = checkTitleDuplicateWords;
exports.checkTitleSpecialCharacters = checkTitleSpecialCharacters;
exports.checkTitleBadAbbreviations = checkTitleBadAbbreviations;
exports.checkTitleBrand = checkTitleBrand;
exports.checkTitleMaterial = checkTitleMaterial;
exports.checkTitleWhitespace = checkTitleWhitespace;
exports.checkTitleRepeatedWhitespace = checkTitleRepeatedWhitespace;
exports.checkTitleRepeatedDashes = checkTitleRepeatedDashes;
exports.checkTitleRepeatedCommas = checkTitleRepeatedCommas;
exports.checkTitlePunctuation = checkTitlePunctuation;
exports.checkTitleHtml = checkTitleHtml;
exports.checkTitleHtmlEntities = checkTitleHtmlEntities;
exports.checkTitlePromotionalWords = checkTitlePromotionalWords;
exports.checkTitleMissingSpaces = checkTitleMissingSpaces;
exports.checkTitleNonBreakingSpaces = checkTitleNonBreakingSpaces;
const constants_1 = require("../utils/constants");
function checkTitleSize(item) {
    // Early return if size or title is not set
    if (!item.size || !item.title) {
        return null;
    }
    // Convert the title to lowercase for case-insensitive comparison
    const titleLower = item.title.toLowerCase();
    // Normalize the size string by removing any trailing period
    const normalizedSize = item.size.toLowerCase().replace(constants_1.trailingPeriodRegex, '');
    // Split the normalized size into tokens for individual checking
    const sizeTokens = normalizedSize.split(constants_1.sizeTokenSplitRegex);
    // Flag to determine if the size is found in the title
    const sizeInTitle = sizeTokens.some(token => {
        // Escape special characters in the token for regex patterns
        const escapedToken = (0, constants_1.escapeRegExp)(token);
        // Check for exact match of the token in the title with word boundaries
        const tokenRegex = (0, constants_1.tokenBoundaryRegex)(escapedToken);
        if (tokenRegex.test(titleLower)) {
            return true;
        }
        // Match tokens that include units (e.g., 'in', 'oz', 'cm') and handle variations
        const unitMatch = token.match(constants_1.unitMatchRegex);
        if (unitMatch) {
            const numberPart = unitMatch[1]; // Numeric part of the token
            let unitPart = unitMatch[4]; // Unit part of the token
            // Remove any trailing period from the unit part
            unitPart = unitPart.replace(constants_1.trailingPeriodRegex, '');
            // Create variations of the unit (with and without trailing period)
            const unitVariations = [unitPart, `${unitPart}.`];
            // Construct possible token variations
            const tokenVariations = unitVariations.map(unit => `${numberPart}${unit}`);
            // Escape each variation for regex and compile into a single regex pattern
            const escapedVariations = tokenVariations.map(constants_1.escapeRegExp).join('|');
            const unitRegex = new RegExp(`(^|\\s)(${escapedVariations})(\\s|$)`, 'i');
            // Check if any of the variations exist in the title
            if (unitRegex.test(titleLower)) {
                return true;
            }
        }
        // Check if the token is a number only and present in the title
        if (constants_1.numberOnlyRegex.test(token)) {
            const numberRegex = (0, constants_1.tokenBoundaryRegex)(escapedToken);
            if (numberRegex.test(titleLower)) {
                return true;
            }
        }
        // Check for single-letter sizes and size words (e.g., 'S', 'M', 'L', 'small', 'medium', 'large')
        if (constants_1.sizeWords.has(token)) {
            const sizeWordRegex = (0, constants_1.sizeWordBoundaryRegex)(escapedToken);
            if (sizeWordRegex.test(titleLower)) {
                return true;
            }
        }
        // Check for size synonyms (e.g., 'XL' and 'extra large')
        if (constants_1.sizeSynonyms[token]) {
            return constants_1.sizeSynonyms[token].some(synonym => {
                const synonymRegex = (0, constants_1.sizeWordBoundaryRegex)((0, constants_1.escapeRegExp)(synonym));
                return synonymRegex.test(titleLower);
            });
        }
        // If none of the checks pass, the size token is not found in the title
        return false;
    });
    // If size is not found in the title, return an error result
    if (!sizeInTitle) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Size Mismatch',
            details: `Title does not contain size (${item.size}) when size is set`,
            affectedField: 'title',
            value: item.title,
        };
    }
    // All checks passed, return null indicating no error
    return null;
}
/**********************Title doesn't contain color when color is set************************** */
function checkTitleColor(item) {
    var _a;
    const titleLower = ((_a = item.title) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    if (item.color) {
        const colorLower = item.color.toLowerCase();
        const colorComponents = colorLower.split(/[\s\/]+/);
        // Check if all color components are present in the title
        const allColorsInTitle = colorComponents.every(colorComponent => titleLower.includes(colorComponent));
        if (!allColorsInTitle) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Color Mismatch',
                details: `Title does not contain color "${item.color}" when color is set`,
                affectedField: 'title',
                value: item.title || ''
            };
        }
    }
    return null;
}
/**********Title contains duplicate words like Nike Air Jordan Jordan Shoes************************** */
function checkTitleDuplicateWords(item) {
    var _a;
    const titleLower = ((_a = item.title) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    const titleWords = titleLower.split(/\s+/);
    const filteredWords = titleWords.filter(word => !constants_1.ignoreWords.has(word) &&
        !/^\d+('|ft|in|cm|m|mm)?$/.test(word) &&
        word.length > 2);
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
/**********Product Title contains bad characters like: ^, $, @, !, "", ''************ */
function checkTitleSpecialCharacters(item) {
    if (item.title) {
        const specialCharsMatches = item.title.match(constants_1.specialCharsRegex);
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
/*************Product Title contains abbreviations like pck instead of pack***************************** */
function checkTitleBadAbbreviations(item) {
    if (item.title) {
        const badAbbreviationsMatches = item.title.match(constants_1.badAbbreviationsRegex);
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
/***********Product Title doesn't contain brand************** */
function checkTitleBrand(item) {
    var _a, _b;
    const titleLower = ((_a = item.title) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    const brandLower = ((_b = item.brand) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
    if (item.brand) {
        // Tokenize the brand by splitting on spaces and hyphens, allowing partial brand matches
        const brandTokens = brandLower.split(/[\s\-]+/);
        const isBrandInTitle = brandTokens.some(token => titleLower.includes(token));
        if (!isBrandInTitle) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Missing Brand in Title',
                details: `Missing brand: ${item.brand}`,
                affectedField: 'title',
                value: item.title || ''
            };
        }
    }
    return null;
}
/************Product Title doesn't contain material when material is set***************** */
function checkTitleMaterial(item) {
    var _a;
    const titleLower = ((_a = item.title) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    if (item.material && !titleLower.includes(item.material.toLowerCase())) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Missing Material in Title',
            details: `Missing material: ${item.material}`,
            affectedField: 'title',
            value: item.title || ''
        };
    }
    return null;
}
/*********Product Title contains whitespace at start or end**************** */
function checkTitleWhitespace(item) {
    if (item.title && (/^\s/.test(item.title) || /\s$/.test(item.title))) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Whitespace at Title Start/End',
            details: 'Title contains whitespace at start or end',
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
/***************Product Title contains repeated whitespace**************************** */
function checkTitleRepeatedWhitespace(item) {
    if (item.title && constants_1.repeatedWhitespaceRegex.test(item.title)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Repeated Whitespace in Title',
            details: 'Title contains repeated whitespace',
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
/*************Product Title contains repeated dashes*********************** */
function checkTitleRepeatedDashes(item) {
    if (item.title && constants_1.repeatedDashRegex.test(item.title)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Repeated Dashes in Title',
            details: 'Title contains repeated dashes',
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
/***********Product Title contains repeated commas************* */
function checkTitleRepeatedCommas(item) {
    if (item.title && constants_1.repeatedCommaRegex.test(item.title)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Repeated Commas in Title',
            details: 'Title contains repeated commas',
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
/************Product Title contains punctuation at start or end************************* */
function checkTitlePunctuation(item) {
    if (item.title && constants_1.punctuationStartEndRegex.test(item.title)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Punctuation at Title Start/End',
            details: 'Title contains punctuation at start or end',
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
/*****************Product Title contains HTML********************* */
function checkTitleHtml(item) {
    if (item.title && constants_1.htmlTagRegex.test(item.title)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'HTML in Title',
            details: 'Title contains HTML tags',
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
/********Product Title contains HTML entities (&reg, &copy, &trade)******************** */
function checkTitleHtmlEntities(item) {
    if (item.title && constants_1.htmlEntityRegex.test(item.title)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'HTML Entities in Title',
            details: 'Title contains HTML entities',
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
/***********Product Title contains promotional words
 *       (save, off, free shipping, best seller, 30% off, buy one get one, open box)********************************* */
function checkTitlePromotionalWords(item) {
    if (item.title) {
        const foundWords = constants_1.promotionalWords.filter(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            return regex.test(item.title);
        });
        if (foundWords.length > 0) {
            const examples = foundWords.slice(0, 3).map(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                const match = regex.exec(item.title);
                if (match) {
                    const startIndex = Math.max(0, match.index - 20);
                    const endIndex = Math.min(item.title.length, match.index + match[0].length + 20);
                    const context = item.title.slice(startIndex, endIndex);
                    return `"${context}"`;
                }
                return '';
            }).filter(Boolean);
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Promotional Words in Title',
                details: `Found ${foundWords.length} promotional word(s): ${foundWords.join(', ')}`,
                affectedField: 'title',
                value: examples[0] || item.title
            };
        }
    }
    return null;
}
/***************TODO*************** */
function checkTitleMissingSpaces(item) {
    if (item.title && constants_1.missingSpaceRegex.test(item.title)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Missing Spaces in Title',
            details: 'Title contains words without spaces after commas',
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
function checkTitleNonBreakingSpaces(item) {
    if (item.title && constants_1.nonBreakingSpaceRegex.test(item.title)) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Non-Breaking Spaces in Title',
            details: 'Title contains non-breaking spaces',
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
exports.TitleChecker = [
    checkTitleSize,
    checkTitleColor,
    checkTitleDuplicateWords,
    checkTitleSpecialCharacters,
    checkTitleBadAbbreviations,
    checkTitleBrand,
    checkTitleMaterial,
    checkTitleWhitespace,
    checkTitleRepeatedWhitespace,
    checkTitleRepeatedDashes,
    checkTitleRepeatedCommas,
    checkTitlePunctuation,
    checkTitleHtml,
    checkTitleHtmlEntities,
    checkTitlePromotionalWords,
    checkTitleMissingSpaces,
    checkTitleNonBreakingSpaces
];
