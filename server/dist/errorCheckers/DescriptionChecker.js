"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DescriptionChecker = void 0;
exports.checkDescriptionMissingSpaces = checkDescriptionMissingSpaces;
exports.checkDescriptionRepeatedDashes = checkDescriptionRepeatedDashes;
exports.checkDescriptionWhitespace = checkDescriptionWhitespace;
exports.checkDescriptionRepeatedWhitespace = checkDescriptionRepeatedWhitespace;
exports.checkDescriptionRepeatedCommas = checkDescriptionRepeatedCommas;
exports.checkDescriptionHtml = checkDescriptionHtml;
exports.checkDescriptionHtmlEntities = checkDescriptionHtmlEntities;
exports.checkDescriptionLength = checkDescriptionLength;
exports.checkDescriptionNonBreakingSpaces = checkDescriptionNonBreakingSpaces;
exports.checkDescriptionPromotionalWords = checkDescriptionPromotionalWords;
const constants_1 = require("../utils/constants");
// Helper function to get context
function getContext(text, index, length) {
    const words = text.split(/\s+/);
    const wordIndex = words.findIndex((word, i) => {
        const startIndex = words.slice(0, i).join(' ').length;
        return startIndex <= index && index < startIndex + word.length;
    });
    const start = Math.max(0, wordIndex - 3);
    const end = Math.min(words.length, wordIndex + 4);
    return words.slice(start, end).join(' ');
}
// Helper function to safely get matches
function getMatches(regex, text) {
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
        matches.push(match);
    }
    return matches;
}
function checkDescriptionMissingSpaces(item) {
    if (item.description) {
        const matches = getMatches(constants_1.missingSpaceRegex, item.description);
        if (matches.length > 0) {
            const examples = matches.slice(0, 3).map(match => {
                const context = getContext(item.description, match.index, match[0].length);
                return `"${context}" (found: "${match[0]}")`;
            });
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Missing Spaces After Commas',
                details: `Found ${matches.length} instance(s): ${examples.join('; ')}`,
                affectedField: 'description',
                value: examples[0]
            };
        }
    }
    return null;
}
function checkDescriptionRepeatedDashes(item) {
    if (item.description) {
        const matches = getMatches(constants_1.repeatedDashesRegex, item.description);
        if (matches.length > 0) {
            const examples = matches.slice(0, 3).map(match => {
                const context = getContext(item.description, match.index, match[0].length);
                return `"${context}" (found: "${match[0]}")`;
            });
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Repeated Dashes in Description',
                details: `Found ${matches.length} instance(s): ${examples.join('; ')}`,
                affectedField: 'description',
                value: examples[0]
            };
        }
    }
    return null;
}
function checkDescriptionWhitespace(item) {
    if (item.description && constants_1.leadingTrailingWhitespaceRegex.test(item.description)) {
        const trimmed = item.description.trim();
        const leadingSpace = item.description.length - item.description.trimStart().length;
        const trailingSpace = item.description.length - item.description.trimEnd().length;
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Whitespace at Edges in Description',
            details: `Description has ${leadingSpace} leading and ${trailingSpace} trailing whitespace characters`,
            affectedField: 'description',
            value: `"${item.description.slice(0, 10)}...${item.description.slice(-10)}"`
        };
    }
    return null;
}
function checkDescriptionRepeatedWhitespace(item) {
    if (item.description) {
        const matches = getMatches(constants_1.repeatedWhitespaceRegex, item.description);
        if (matches.length > 0) {
            const examples = matches.slice(0, 3).map(match => {
                const context = getContext(item.description, match.index, match[0].length);
                return `"${context}" (found: "${match[0].replace(/\s/g, '␣')}")`;
            });
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Repeated Whitespace in Description',
                details: `Found ${matches.length} instance(s): ${examples.join('; ')}`,
                affectedField: 'description',
                value: examples[0]
            };
        }
    }
    return null;
}
function checkDescriptionRepeatedCommas(item) {
    if (item.description) {
        const matches = getMatches(constants_1.repeatedCommaRegex, item.description);
        if (matches.length > 0) {
            const examples = matches.slice(0, 3).map(match => {
                const context = getContext(item.description, match.index, match[0].length);
                return `"${context}" (found: "${match[0]}")`;
            });
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Repeated Commas in Description',
                details: `Found ${matches.length} instance(s): ${examples.join('; ')}`,
                affectedField: 'description',
                value: examples[0]
            };
        }
    }
    return null;
}
function checkDescriptionHtml(item) {
    if (item.description) {
        const matches = getMatches(constants_1.htmlTagRegex, item.description);
        if (matches.length > 0) {
            const examples = matches.slice(0, 3).map(match => {
                const context = getContext(item.description, match.index, match[0].length);
                return `"${context}" (found: "${match[0]}")`;
            });
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'HTML in Description',
                details: `Found ${matches.length} HTML tag(s): ${examples.join('; ')}`,
                affectedField: 'description',
                value: examples[0]
            };
        }
    }
    return null;
}
function checkDescriptionHtmlEntities(item) {
    if (item.description) {
        const matches = getMatches(constants_1.htmlEntityRegex, item.description);
        if (matches.length > 0) {
            const examples = matches.slice(0, 3).map(match => {
                const context = getContext(item.description, match.index, match[0].length);
                return `"${context}" (found: "${match[0]}")`;
            });
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'HTML Entities in Description',
                details: `Found ${matches.length} HTML entitie(s): ${examples.join('; ')}`,
                affectedField: 'description',
                value: examples[0]
            };
        }
    }
    return null;
}
function checkDescriptionLength(item) {
    if (item.description && item.description.length > constants_1.MAX_DESCRIPTION_LENGTH) {
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Description Too Long',
            details: `Description exceeds ${constants_1.MAX_DESCRIPTION_LENGTH} characters (current length: ${item.description.length})`,
            affectedField: 'description',
            value: `${item.description.substring(0, 50)}...${item.description.substring(item.description.length - 50)}`
        };
    }
    return null;
}
function checkDescriptionNonBreakingSpaces(item) {
    if (item.description) {
        const matches = getMatches(constants_1.nonBreakingSpaceRegex, item.description);
        if (matches.length > 0) {
            const examples = matches.slice(0, 3).map(match => {
                const context = getContext(item.description, match.index, match[0].length);
                return `"${context}" (found: "␠")`;
            });
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Non-Breaking Spaces in Description',
                details: `Found ${matches.length} non-breaking space(s): ${examples.join('; ')}`,
                affectedField: 'description',
                value: examples[0]
            };
        }
    }
    return null;
}
function checkDescriptionPromotionalWords(item) {
    if (item.description) {
        const foundWords = constants_1.promotionalWords.filter(word => {
            const regex = new RegExp(`\\b${word}\\b`, 'i');
            return regex.test(item.description);
        });
        if (foundWords.length > 0) {
            const examples = foundWords.slice(0, 3).map(word => {
                const regex = new RegExp(`\\b${word}\\b`, 'gi');
                const match = regex.exec(item.description);
                if (match) {
                    const context = getContext(item.description, match.index, match[0].length);
                    return `"${context}" (found: "${match[0]}")`;
                }
                return '';
            }).filter(Boolean);
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Promotional Words in Description',
                details: `Found ${foundWords.length} promotional word(s): ${foundWords.join(', ')}`,
                affectedField: 'description',
                value: examples[0] || ''
            };
        }
    }
    return null;
}
exports.DescriptionChecker = [
    checkDescriptionMissingSpaces,
    checkDescriptionRepeatedDashes,
    checkDescriptionWhitespace,
    checkDescriptionRepeatedWhitespace,
    checkDescriptionRepeatedCommas,
    checkDescriptionHtml,
    checkDescriptionHtmlEntities,
    checkDescriptionLength,
    checkDescriptionNonBreakingSpaces,
    checkDescriptionPromotionalWords
];
