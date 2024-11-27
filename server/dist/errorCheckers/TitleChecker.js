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
exports.checkTitleNonBreakingSpaces = checkTitleNonBreakingSpaces;
const constants_1 = require("../utils/constants");
const abbreviationMappings = {
    'pck': 'pack',
    'pkg': 'package',
    'qty': 'quantity',
    'qt': 'quart',
    'pc': 'piece',
    'pcs': 'pieces',
    'ea': 'each',
    'in.': 'inch',
    'ft': 'feet'
};
// Helper function to safely get matches
function getMatches(regex, text) {
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        matches.push(match);
    }
    return matches;
}
function checkTitleSize(item) {
    if (!item.size || !item.title)
        return null;
    const titleLower = item.title.toLowerCase();
    const normalizedSize = item.size.toLowerCase().replace(constants_1.trailingPeriodRegex, '');
    const sizeTokens = normalizedSize.split(constants_1.sizeTokenSplitRegex);
    const sizeInTitle = sizeTokens.some(token => {
        const escapedToken = (0, constants_1.escapeRegExp)(token);
        const tokenRegex = (0, constants_1.tokenBoundaryRegex)(escapedToken);
        if (tokenRegex.test(titleLower))
            return true;
        const unitMatch = token.match(constants_1.unitMatchRegex);
        if (unitMatch) {
            const numberPart = unitMatch[1];
            let unitPart = unitMatch[4].replace(constants_1.trailingPeriodRegex, '');
            const unitVariations = [unitPart, `${unitPart}.`];
            const tokenVariations = unitVariations.map(unit => `${numberPart}${unit}`);
            const escapedVariations = tokenVariations.map(constants_1.escapeRegExp).join('|');
            const unitRegex = new RegExp(`(^|\\s)(${escapedVariations})(\\s|$)`, 'i');
            if (unitRegex.test(titleLower))
                return true;
        }
        if (constants_1.numberOnlyRegex.test(token)) {
            const numberRegex = (0, constants_1.tokenBoundaryRegex)(escapedToken);
            if (numberRegex.test(titleLower))
                return true;
        }
        if (constants_1.sizeWords.has(token)) {
            const sizeWordRegex = (0, constants_1.sizeWordBoundaryRegex)(escapedToken);
            if (sizeWordRegex.test(titleLower))
                return true;
        }
        if (constants_1.sizeSynonyms[token]) {
            return constants_1.sizeSynonyms[token].some(synonym => {
                const synonymRegex = (0, constants_1.sizeWordBoundaryRegex)((0, constants_1.escapeRegExp)(synonym));
                return synonymRegex.test(titleLower);
            });
        }
        return false;
    });
    if (!sizeInTitle) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Title Doesn\'t Contain Size When Size is Set',
            details: `Title does not contain size (${item.size}) when size is set`,
            affectedField: 'title',
            value: item.title
        };
    }
    return null;
}
function checkTitleColor(item) {
    var _a;
    const titleLower = ((_a = item.title) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    if (item.color) {
        const colorComponents = item.color.toLowerCase().split(/[\s\/]+/);
        const allColorsInTitle = colorComponents.every(colorComponent => titleLower.includes(colorComponent));
        if (!allColorsInTitle) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Title Doesn\'t Contain Color When Color Is Set',
                details: `Title does not contain color "${item.color}" when color is set`,
                affectedField: 'title',
                value: item.title || ''
            };
        }
    }
    return null;
}
function checkTitleDuplicateWords(item) {
    var _a;
    const titleLower = ((_a = item.title) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    const titleWords = titleLower.split(/\s+/);
    const filteredWords = titleWords.filter(word => !constants_1.ignoreWords.has(word) && !/^\d+('|ft|in|cm|m|mm)?$/.test(word) && word.length > 2);
    const duplicates = filteredWords.filter((word, index) => filteredWords.indexOf(word) !== index);
    if (duplicates.length > 0) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Title Contains Duplicate Words',
            details: `Title contains duplicate words: ${[...new Set(duplicates)].join(', ')}`,
            affectedField: 'title',
            value: item.title || ''
        };
    }
    return null;
}
function checkTitleSpecialCharacters(item) {
    if (item.title) {
        const matches = getMatches(new RegExp(constants_1.specialCharsRegex.source, 'g'), item.title);
        if (matches.length > 0) {
            const foundChars = [...new Set(matches.map(m => m[0]))];
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Title Contains Special Characters',
                details: `Found ${matches.length} instance(s) of special characters: ${foundChars.join(', ')}`,
                affectedField: 'title',
                value: item.title
            };
        }
    }
    return null;
}
function checkTitleBadAbbreviations(item) {
    if (item.title) {
        const matches = getMatches(/\b(pck|pkg|qty|qt|pc|pcs|ea|(?<=\s|^)in\.(?=\s|$)|ft)\b/gi, item.title);
        if (matches.length > 0) {
            const foundAbbreviations = [...new Set(matches.map(m => m[0].toLowerCase()))];
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Title Contains Bad Abbreviations',
                details: `Found ${matches.length} instance(s) of bad abbreviations: ${foundAbbreviations.join(', ')}`,
                affectedField: 'title',
                value: item.title
            };
        }
    }
    return null;
}
function checkTitleBrand(item) {
    var _a, _b;
    const titleLower = ((_a = item.title) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    const brandLower = ((_b = item.brand) === null || _b === void 0 ? void 0 : _b.toLowerCase()) || '';
    if (item.brand) {
        const brandTokens = brandLower.split(/[\s\-]+/);
        const isBrandInTitle = brandTokens.some(token => titleLower.includes(token));
        if (!isBrandInTitle) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Title Doesn\'t Contain Brand',
                details: `Missing brand: ${item.brand}`,
                affectedField: 'title',
                value: item.title || ''
            };
        }
    }
    return null;
}
function checkTitleMaterial(item) {
    var _a;
    const titleLower = ((_a = item.title) === null || _a === void 0 ? void 0 : _a.toLowerCase()) || '';
    if (item.material && !titleLower.includes(item.material.toLowerCase())) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Title Doesn\'t Contain Material',
            details: `Missing material: ${item.material}`,
            affectedField: 'title',
            value: item.title || ''
        };
    }
    return null;
}
function checkTitleWhitespace(item) {
    if (item.title) {
        const hasLeadingSpace = /^\s+/.test(item.title);
        const hasTrailingSpace = /\s+$/.test(item.title);
        if (hasLeadingSpace || hasTrailingSpace) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Title Contains Whitespace At Start Or End',
                details: `Found whitespace at ${hasLeadingSpace ? 'the beginning' : ''}${hasTrailingSpace ? ' the end' : ''}`,
                affectedField: 'title',
                value: item.title
            };
        }
    }
    return null;
}
function checkTitleRepeatedWhitespace(item) {
    if (item.title) {
        const matches = getMatches(constants_1.repeatedWhitespaceRegex, item.title);
        if (matches.length > 0) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Title Contains Repeated Whitespace',
                details: `Found ${matches.length} instance(s) of repeated whitespace in title`,
                affectedField: 'title',
                value: item.title
            };
        }
    }
    return null;
}
function checkTitleRepeatedDashes(item) {
    if (item.title) {
        const matches = getMatches(constants_1.repeatedDashRegex, item.title);
        if (matches.length > 0) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Title Contains Repeated Dashes',
                details: `Found ${matches.length} instance(s) of repeated dashes in title`,
                affectedField: 'title',
                value: item.title
            };
        }
    }
    return null;
}
function checkTitleRepeatedCommas(item) {
    if (item.title) {
        const matches = getMatches(constants_1.repeatedCommaRegex, item.title);
        if (matches.length > 0) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Title Contains Repeated Commas',
                details: `Found ${matches.length} instance(s) of repeated commas in title`,
                affectedField: 'title',
                value: item.title
            };
        }
    }
    return null;
}
function checkTitlePunctuation(item) {
    if (item.title) {
        const punctuationRegex = /^[.,!?;:"'`]+|[.,!?;:"'`]+$/u;
        const startMatch = punctuationRegex.exec(item.title);
        const endMatch = /[.,!?;:"'`]+$/u.exec(item.title);
        if (startMatch || endMatch) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Title Contains Punctuation At Start Or End',
                details: `Found punctuation at ${startMatch ? 'the beginning' : ''}${endMatch ? ' the end' : ''}`,
                affectedField: 'title',
                value: item.title
            };
        }
    }
    return null;
}
function checkTitleHtml(item) {
    if (item.title) {
        const matches = getMatches(constants_1.htmlTagRegex, item.title);
        if (matches.length > 0) {
            const foundTags = [...new Set(matches.map(m => m[0]))];
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Title Contains HTML Tags',
                details: `Found ${matches.length} HTML tag(s): ${foundTags.join(', ')}`,
                affectedField: 'title',
                value: item.title
            };
        }
    }
    return null;
}
function checkTitleHtmlEntities(item) {
    if (item.title) {
        const matches = getMatches(constants_1.htmlEntityRegex, item.title);
        if (matches.length > 0) {
            const foundEntities = [...new Set(matches.map(m => m[0]))];
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Title Contains HTML Entities',
                details: `Found ${matches.length} HTML entity(ies): ${foundEntities.join(', ')}`,
                affectedField: 'title',
                value: item.title
            };
        }
    }
    return null;
}
function checkTitlePromotionalWords(item) {
    if (item.title) {
        const matches = [];
        for (const word of constants_1.promotionalWords) {
            const regex = new RegExp(`\\b${word}\\b`, 'gi');
            let match;
            while ((match = regex.exec(item.title)) !== null) {
                matches.push({ word, match });
            }
        }
        if (matches.length > 0) {
            const foundWords = [...new Set(matches.map(m => m.word))];
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Title Contains Promotional Words',
                details: `Found ${matches.length} promotional word(s): ${foundWords.join(', ')}`,
                affectedField: 'title',
                value: item.title
            };
        }
    }
    return null;
}
function checkTitleNonBreakingSpaces(item) {
    /* if (item.title) {
       const matches = getMatches(nonBreakingSpaceRegex, item.title);
       if (matches.length > 0) {
         return {
           id: item.id || 'UNKNOWN',
           errorType: 'Title Contains Non-Breaking Spaces',
           details: `Found ${matches.length} instance(s) of non-breaking spaces in title`,
           affectedField: 'title',
           value: item.title
         };
       }
     }*/
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
    checkTitleNonBreakingSpaces
];
