"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const errorCheckers = __importStar(require("./errorCheckers"));
const allChecks = [
    errorCheckers.checkTitleSize,
    errorCheckers.checkTitleColor,
    errorCheckers.checkTitleDuplicateWords,
    errorCheckers.checkTitleSpecialCharacters,
    errorCheckers.checkTitleBadAbbreviations,
    errorCheckers.checkTitleBrand,
    errorCheckers.checkDescriptionMissingSpaces,
    errorCheckers.checkDescriptionRepeatedDashes,
    errorCheckers.checkGoogleProductCategory,
    errorCheckers.checkApparelAttributes,
    errorCheckers.checkProductType,
    errorCheckers.checkTitleMaterial,
    errorCheckers.checkTitleWhitespace,
    errorCheckers.checkTitleRepeatedWhitespace,
    errorCheckers.checkTitleRepeatedDashes,
    errorCheckers.checkTitleRepeatedCommas,
    errorCheckers.checkTitlePunctuation,
    errorCheckers.checkTitleHtml,
    errorCheckers.checkTitleHtmlEntities,
    errorCheckers.checkTitlePromotionalWords,
    // errorCheckers.checkTitleSpacing, 
    errorCheckers.checkTitleNonBreakingSpaces,
    errorCheckers.checkDescriptionWhitespace,
    errorCheckers.checkDescriptionRepeatedWhitespace,
    errorCheckers.checkDescriptionRepeatedCommas,
    errorCheckers.checkDescriptionHtml,
    errorCheckers.checkDescriptionHtmlEntities,
    errorCheckers.checkDescriptionLength,
    errorCheckers.checkDescriptionNonBreakingSpaces,
    errorCheckers.checkIdLength,
    errorCheckers.checkIdIsSet,
    errorCheckers.checkImageLink,
    errorCheckers.checkAvailability,
    errorCheckers.checkPrice,
    errorCheckers.checkLinkIsSet,
    errorCheckers.checkPrice,
    errorCheckers.checkMPN,
    errorCheckers.checkCondition,
    errorCheckers.checkBrand,
    errorCheckers.checkImageLinkCommas,
    errorCheckers.checkProductTypePromotionalWords,
    errorCheckers.checkProductTypeCommas,
    errorCheckers.checkProductTypeRepeatedTiers,
    errorCheckers.checkProductTypeWhitespace,
    errorCheckers.checkProductTypeRepeatedWhitespace,
    errorCheckers.checkProductTypeAngleBrackets,
    errorCheckers.checkGTINLength,
    errorCheckers.checkMonitoredPharmacyWords,
    errorCheckers.checkGenderMismatch,
    errorCheckers.checkAgeGroupMismatch,
];
function processItem(item) {
    const errors = [];
    for (const check of allChecks) {
        const result = check(item);
        if (result) {
            // If result is an array, spread it; if single error, add it
            errors.push(...(Array.isArray(result) ? result : [result]));
        }
    }
    return errors;
}
if (worker_threads_1.parentPort) {
    const { batch } = worker_threads_1.workerData;
    const errors = [];
    for (const item of batch) {
        const itemErrors = processItem(item);
        errors.push(...itemErrors);
        // console.log(`Processed item ${item.id}, found ${itemErrors.length} errors`);
    }
    //  console.log(`Worker finished processing ${batch.length} items, found ${errors.length} total errors`);
    worker_threads_1.parentPort.postMessage({ errors, processedCount: batch.length });
}
