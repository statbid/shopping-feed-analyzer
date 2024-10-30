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
// worker.ts
const worker_threads_1 = require("worker_threads");
const errorCheckers = __importStar(require("./errorCheckers"));
const SpellChecker_1 = require("./errorCheckers/SpellChecker");
// Map to track duplicate IDs across the batch
const idCountsMap = new Map();
function findCheckerFunction(name) {
    // Handle special cases first
    if (name === 'checkDuplicateIds') {
        return (item) => { var _a; return (_a = errorCheckers.checkDuplicateIds) === null || _a === void 0 ? void 0 : _a.call(errorCheckers, item, idCountsMap); };
    }
    // Handle spell checking
    if (name === 'checkSpelling') {
        return SpellChecker_1.checkSpelling;
    }
    // Check for direct function export
    if (typeof errorCheckers[name] === 'function') {
        return errorCheckers[name];
    }
    // Search in checker arrays
    for (const [key, value] of Object.entries(errorCheckers)) {
        if (Array.isArray(value)) {
            const checker = value.find(fn => fn.name === name);
            if (checker) {
                return checker;
            }
        }
    }
    // If checker not found, log warning and return undefined
    console.warn(`Checker function "${name}" not found`);
    return undefined;
}
if (worker_threads_1.parentPort) {
    try {
        const { batch, enabledChecks } = worker_threads_1.workerData;
        const errors = [];
        // Get all checker functions up front
        const checkerFunctions = enabledChecks
            .map(name => ({
            name,
            fn: findCheckerFunction(name)
        }))
            .filter((checker) => {
            if (!checker.fn) {
                console.warn(`Skipping missing checker: ${checker.name}`);
                return false;
            }
            return true;
        });
        // Process each item in the batch
        for (const item of batch) {
            // Run each enabled checker
            for (const checker of checkerFunctions) {
                try {
                    const result = checker.fn(item);
                    if (result) {
                        // Handle both single results and arrays of results
                        if (Array.isArray(result)) {
                            errors.push(...result);
                        }
                        else {
                            errors.push(result);
                        }
                    }
                }
                catch (error) {
                    console.error(`Error in checker ${checker.name}:`, error);
                    // Continue with other checks even if one fails
                }
            }
        }
        // Send results back to main thread
        worker_threads_1.parentPort.postMessage({
            errors,
            processedCount: batch.length
        });
    }
    catch (error) {
        console.error('Worker error:', error);
        worker_threads_1.parentPort.postMessage({
            error: String(error),
            processedCount: 0
        });
    }
}
