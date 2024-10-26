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
function truncateContext(context, match) {
    const maxLength = 40;
    const matchIndex = context.indexOf(match);
    const start = Math.max(0, matchIndex - Math.floor((maxLength - match.length) / 2));
    const end = Math.min(context.length, matchIndex + match.length + Math.floor((maxLength - match.length) / 2));
    let truncatedContext = context.substring(start, end).trim();
    if (start > 0) {
        truncatedContext = '.' + truncatedContext;
    }
    if (end < context.length) {
        truncatedContext += '.';
    }
    return truncatedContext;
}
function getContext(description, matchIndex, matchLength) {
    const contextRadius = 15; // Number of characters to show around the match
    const start = Math.max(0, matchIndex - contextRadius);
    const end = Math.min(description.length, matchIndex + matchLength + contextRadius);
    return description.substring(start, end);
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
/*************************Description contains missing spaces like word,word******************************************** */
function checkDescriptionMissingSpaces(item) {
    if (item.description) {
        const matches = getMatches(constants_1.missingSpaceRegex, item.description);
        if (matches.length > 0) {
            // Generate context for each match, without limiting to 3 instances
            const examples = matches.map((match, index) => {
                const context = getContext(item.description, match.index, match[0].length);
                const truncatedContext = truncateContext(context, match[0]);
                return matches.length > 1 ? `(case ${index + 1}) ".${truncatedContext}."` : `".${truncatedContext}."`;
            });
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Description Contains Missing Spaces After Commas',
                details: `Found ${matches.length} instance(s) of Missing Spaces After Commas`,
                affectedField: 'description',
                // Join all the cases with semicolons
                value: examples.join('; ')
            };
        }
    }
    return null;
}
/************Description contains repeated dashes************************** */
function checkDescriptionRepeatedDashes(item) {
    if (item.description) {
        const matches = getMatches(constants_1.repeatedDashesRegex, item.description);
        if (matches.length > 0) {
            const examples = matches.map((match, index) => {
                const context = getContext(item.description, match.index, match[0].length);
                const truncatedContext = truncateContext(context, match[0]);
                return matches.length > 1
                    ? `(case ${index + 1}) "...${truncatedContext}..."`
                    : `"...${truncatedContext}..."`;
            });
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Description Contains Repeated Dashes',
                details: `Found ${matches.length} instance(s) of repeated dashes`,
                affectedField: 'description',
                value: examples.join('; ')
            };
        }
    }
    return null;
}
/************Whitespace at Edges in Description************************** */
function checkDescriptionWhitespace(item) {
    if (item.description && constants_1.leadingTrailingWhitespaceRegex.test(item.description)) {
        const leadingSpace = item.description.length - item.description.trimStart().length;
        const trailingSpace = item.description.length - item.description.trimEnd().length;
        let value = '';
        if (leadingSpace > 0) {
            const firstWord = item.description.trimStart().split(' ')[0];
            value = `"  ${firstWord}..."`;
        }
        if (trailingSpace > 0) {
            const lastWord = item.description.trimEnd().split(' ').pop();
            value = `"...${lastWord}  "`;
        }
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Whitespace at Edges in Description',
            details: `Description has ${leadingSpace} whitespaces at the begining and ${trailingSpace}  whitespaces at the end`,
            affectedField: 'description',
            value: value
        };
    }
    return null;
}
/************Repeated Whitespace in Description************************** */
function checkDescriptionRepeatedWhitespace(item) {
    if (item.description) {
        const matches = getMatches(constants_1.repeatedWhitespaceRegex, item.description);
        if (matches.length > 0) {
            const examples = matches.map((match, index) => {
                const context = getContext(item.description, match.index, match[0].length);
                const markedContext = context.replace(match[0], match[0].replace(/\s/g, '␣'));
                return `"...${markedContext}..."`;
            });
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Repeated Whitespace in Description',
                details: `Found ${matches.length} instance(s) of repeated whitespaces in description`,
                affectedField: 'description',
                value: examples.join('; ')
            };
        }
    }
    return null;
}
/************Repeated Commas in Description************************** */
function checkDescriptionRepeatedCommas(item) {
    if (item.description) {
        const matches = getMatches(constants_1.repeatedCommaRegex, item.description);
        if (matches.length > 0) {
            const examples = matches.map((match, index) => {
                const context = getContext(item.description, match.index, match[0].length);
                const markedContext = context.replace(match[0], match[0]); // Repeated commas are already visible
                return `"...${markedContext}..."`;
            });
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Repeated Commas in Description',
                details: `Found ${matches.length} instance(s) of repeated commas in description`,
                affectedField: 'description',
                value: examples.join('; ') // Display all found instances
            };
        }
    }
    return null;
}
/************HTML in Description************************** */
function checkDescriptionHtml(item) {
    if (item.description) {
        const matches = getMatches(constants_1.htmlTagRegex, item.description);
        if (matches.length > 0) {
            const foundTags = matches.map(match => match[0]).join(', ');
            const examples = matches.map((match, index) => {
                const context = getContext(item.description, match.index, match[0].length);
                return `"...${context}..."`;
            });
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'HTML in Description',
                details: `Found ${matches.length} HTML tag(s): ${foundTags}`,
                affectedField: 'description',
                value: examples.join('; ')
            };
        }
    }
    return null;
}
/************HTML Entities in Description************************** */
function checkDescriptionHtmlEntities(item) {
    if (item.description) {
        const matches = getMatches(constants_1.htmlEntityRegex, item.description);
        if (matches.length > 0) {
            const foundEntities = matches.map(match => match[0]).join(', ');
            const examples = matches.map((match, index) => {
                const context = getContext(item.description, match.index, match[0].length);
                return `"...${context}..."`;
            });
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'HTML Entities in Description',
                details: `Found ${matches.length} HTML entitie(s): ${foundEntities}`,
                affectedField: 'description',
                value: examples.join('; ')
            };
        }
    }
    return null;
}
/**********Product Description too long************ */
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
/***********Description contains non-breaking spaces******************** */
function checkDescriptionNonBreakingSpaces(item) {
    if (item.description && constants_1.nonBreakingSpaceRegex.test(item.description)) {
        const matches = getMatches(constants_1.nonBreakingSpaceRegex, item.description);
        const examples = matches.map((match, index) => {
            const context = getContext(item.description, match.index, match[0].length);
            return `"...${context}..."`; // Display context with the non-breaking space
        });
        return {
            id: item.id || 'UNKNOWN',
            errorType: 'Non-Breaking Spaces in Description',
            details: `Found ${matches.length} instance(s) of non-breaking spaces in description`,
            affectedField: 'description',
            value: examples.join('; ') // Show all cases with context
        };
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
