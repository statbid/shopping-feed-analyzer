"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.idChecks = void 0;
exports.checkIdLength = checkIdLength;
exports.checkIdIsSet = checkIdIsSet;
const constants_1 = require("../utils/constants");
function checkIdLength(item) {
    if (item.id && item.id.length > constants_1.MAX_ID_LENGTH) {
        return {
            id: item.id,
            errorType: 'Id Too Long',
            details: `Id exceeds ${constants_1.MAX_ID_LENGTH} characters`,
            affectedField: 'id',
            value: item.id
        };
    }
    return null;
}
function checkIdIsSet(item) {
    if (!item.id || item.id.trim() === '') {
        return {
            id: 'UNKNOWN',
            errorType: 'Id Not Set',
            details: `Id is blank or not set`,
            affectedField: 'id',
            value: ''
        };
    }
    return null;
}
exports.idChecks = [
    checkIdLength,
    checkIdIsSet
];
