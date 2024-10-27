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
exports.FeedAnalyzer = void 0;
const csv_parse_1 = require("csv-parse");
const stream_1 = require("stream");
const os_1 = require("os");
const errorCheckers = __importStar(require("./errorCheckers"));
const SpellChecker_1 = require("./errorCheckers/SpellChecker");
class FeedAnalyzer {
    constructor() {
        this.result = {
            totalProducts: 0,
            errorCounts: {},
            errors: []
        };
        this.idCounts = new Map();
        this.numWorkers = Math.max(1, (0, os_1.cpus)().length - 1);
        this.activeWorkers = 0;
    }
    async processBatch(batch) {
        for (const item of batch) {
            this.result.totalProducts++;
            await this.checkAllErrors(item);
        }
    }
    async checkAllErrors(item) {
        try {
            // Check for duplicate IDs
            this.checkDuplicateId(item);
            // Run all error checks from errorCheckers
            for (const checker of Object.values(errorCheckers)) {
                try {
                    if (typeof checker === 'function') {
                        // Handle both async and sync functions
                        const result = checker.constructor.name === 'AsyncFunction'
                            ? await checker(item)
                            : checker(item);
                        if (result) {
                            this.addErrors(Array.isArray(result) ? result : [result]);
                        }
                    }
                    else if (Array.isArray(checker)) {
                        for (const subChecker of checker) {
                            if (typeof subChecker === 'function') {
                                // Handle both async and sync functions
                                const result = subChecker.constructor.name === 'AsyncFunction'
                                    ? await subChecker(item)
                                    : subChecker(item);
                                if (result) {
                                    this.addErrors(Array.isArray(result) ? result : [result]);
                                }
                            }
                        }
                    }
                }
                catch (err) {
                    console.error('Error in error checker:', err);
                }
            }
            // Run spell checks
            try {
                const spellErrors = (0, SpellChecker_1.checkSpelling)(item);
                if (spellErrors && spellErrors.length > 0) {
                    this.addErrors(spellErrors);
                }
            }
            catch (err) {
                console.error('Error in spell checker:', err);
            }
        }
        catch (err) {
            console.error('Error checking item:', err);
        }
    }
    checkDuplicateId(item) {
        if (item.id) {
            const count = (this.idCounts.get(item.id) || 0) + 1;
            this.idCounts.set(item.id, count);
            if (count > 1) {
                const error = {
                    id: item.id,
                    errorType: 'Duplicate Id',
                    details: `This id appears ${count} times in the feed`,
                    affectedField: 'id',
                    value: item.id
                };
                this.addErrors([error]);
            }
        }
    }
    analyzeStream(fileStream, progressCallback) {
        return new Promise((resolve, reject) => {
            const parser = (0, csv_parse_1.parse)({
                columns: (header) => header.map((h) => h.trim().replace(/\s+/g, '_').toLowerCase()),
                skip_empty_lines: true,
                delimiter: '\t',
                relax_column_count: true,
            });
            const batchSize = 1000;
            let batch = [];
            let totalProcessed = 0;
            let spellCheckPerformed = false;
            const transformer = new stream_1.Transform({
                objectMode: true,
                transform: async (item, _, callback) => {
                    try {
                        batch.push(item);
                        if (batch.length >= batchSize) {
                            await this.processBatch(batch);
                            totalProcessed += batch.length;
                            spellCheckPerformed = true;
                            if (progressCallback) {
                                progressCallback(totalProcessed);
                            }
                            batch = [];
                        }
                        callback();
                    }
                    catch (err) {
                        console.error('Error processing batch:', err);
                        callback(err instanceof Error ? err : new Error(String(err)));
                    }
                },
                flush: async (callback) => {
                    try {
                        if (batch.length > 0) {
                            await this.processBatch(batch);
                            totalProcessed += batch.length;
                            spellCheckPerformed = true;
                            if (progressCallback) {
                                progressCallback(totalProcessed);
                            }
                        }
                        if (spellCheckPerformed) {
                            console.log('Saving spell checker cache after analysis completion...');
                            SpellChecker_1.spellChecker.saveCache();
                        }
                        callback();
                    }
                    catch (err) {
                        console.error('Error in flush:', err);
                        callback(err instanceof Error ? err : new Error(String(err)));
                    }
                }
            });
            // Add error handlers for better debugging
            parser.on('error', (error) => {
                console.error('Parser error:', error);
            });
            transformer.on('error', (error) => {
                console.error('Transformer error:', error);
            });
            fileStream.on('error', (error) => {
                console.error('File stream error:', error);
            });
            fileStream
                .pipe(parser)
                .pipe(transformer)
                .on('finish', () => {
                resolve(this.result);
            })
                .on('error', (err) => {
                console.error('Error parsing file:', err);
                reject(new Error('Error parsing file. Please ensure it is a valid TSV file.'));
            });
        });
    }
    addErrors(errors) {
        for (const error of errors) {
            if (error.errorType === 'Duplicate Id') {
                const existingError = this.result.errors.find(e => e.errorType === 'Duplicate Id' && e.id === error.id);
                if (existingError) {
                    existingError.details = error.details;
                }
                else {
                    this.result.errors.push(error);
                }
            }
            else {
                this.result.errors.push(error);
            }
            this.result.errorCounts[error.errorType] = (this.result.errorCounts[error.errorType] || 0) + 1;
        }
    }
    getResults() {
        return this.result;
    }
    resetAnalysis() {
        this.result = {
            totalProducts: 0,
            errorCounts: {},
            errors: []
        };
        this.idCounts.clear();
    }
    countTotalProducts(fileStream) {
        return new Promise((resolve, reject) => {
            let count = 0;
            const parser = (0, csv_parse_1.parse)({
                columns: true,
                skip_empty_lines: true,
                delimiter: '\t',
            });
            fileStream
                .pipe(parser)
                .on('data', () => {
                count++;
            })
                .on('end', () => {
                resolve(count);
            })
                .on('error', (err) => {
                reject(err);
            });
        });
    }
}
exports.FeedAnalyzer = FeedAnalyzer;
