"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkDescriptionMissingSpaces = checkDescriptionMissingSpaces;
exports.checkDescriptionRepeatedDashes = checkDescriptionRepeatedDashes;
const constants_1 = require("../utils/constants");
function checkDescriptionMissingSpaces(item) {
    if (item.description) {
        const missingSpaceMatches = [...item.description.matchAll(constants_1.missingSpaceRegex)];
        if (missingSpaceMatches.length > 0) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Missing Spaces After Commas',
                details: `Found ${missingSpaceMatches.length} comma(s) followed by non-space characters`,
                affectedField: 'description',
                value: item.description
            };
        }
    }
    return null;
}
function checkDescriptionRepeatedDashes(item) {
    if (item.description) {
        const repeatedDashesMatches = [...item.description.matchAll(constants_1.repeatedDashesRegex)];
        if (repeatedDashesMatches.length > 0) {
            return {
                id: item.id || 'UNKNOWN',
                errorType: 'Repeated Dashes in Description',
                details: `Found ${repeatedDashesMatches.length} instance(s) of repeated dashes`,
                affectedField: 'description',
                value: item.description
            };
        }
    }
    return null;
}
