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
console.log('Worker started');
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
];
function processItem(item) {
    const errors = [];
    for (const check of allChecks) {
        const error = check(item);
        if (error) {
            errors.push(error);
        }
    }
    return errors;
}
if (worker_threads_1.parentPort) {
    const { batch } = worker_threads_1.workerData;
    const errors = [];
    for (const item of batch) {
        errors.push(...processItem(item));
    }
    worker_threads_1.parentPort.postMessage({ errors, processedCount: batch.length });
}
