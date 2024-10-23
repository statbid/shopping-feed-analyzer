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
        // Check for duplicate IDs
        this.checkDuplicateId(item);
        // Run all other error checks
        for (const checker of Object.values(errorCheckers)) {
            try {
                if (typeof checker === 'function') {
                    // Check if it's an async function
                    if (checker.constructor.name === 'AsyncFunction') {
                        const errors = await checker(item);
                        if (errors) {
                            if (Array.isArray(errors)) {
                                this.addErrors(errors);
                            }
                            else {
                                this.addErrors([errors]);
                            }
                        }
                    }
                    else {
                        // Handle synchronous checker
                        const error = checker(item);
                        if (error) {
                            // Make sure we only add it if it's an ErrorResult
                            if ('id' in error && 'errorType' in error) {
                                this.addErrors([error]);
                            }
                        }
                    }
                }
                else if (Array.isArray(checker)) {
                    for (const subChecker of checker) {
                        if (typeof subChecker === 'function') {
                            if (subChecker.constructor.name === 'AsyncFunction') {
                                const errors = await subChecker(item);
                                if (errors) {
                                    if (Array.isArray(errors)) {
                                        this.addErrors(errors);
                                    }
                                    else {
                                        this.addErrors([errors]);
                                    }
                                }
                            }
                            else {
                                const error = subChecker(item);
                                if (error && 'id' in error && 'errorType' in error) {
                                    this.addErrors([error]);
                                }
                            }
                        }
                    }
                }
            }
            catch (err) {
                console.error('Error in checker:', err);
            }
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
            // Define a function to randomize the batch size between 900 and 1100
            const getRandomBatchSize = () => Math.floor(Math.random() * 201) + 900; // random value between 900 and 1100
            let batchSize = getRandomBatchSize();
            let batch = [];
            let totalProcessed = 0;
            const transformer = new stream_1.Transform({
                objectMode: true,
                transform: async (item, _, callback) => {
                    try {
                        batch.push(item);
                        if (batch.length >= batchSize) {
                            await this.processBatch(batch);
                            totalProcessed += batch.length;
                            if (progressCallback) {
                                progressCallback(totalProcessed);
                            }
                            batch = [];
                            // Generate a new random batch size for the next batch
                            batchSize = getRandomBatchSize();
                        }
                        callback();
                    }
                    catch (err) {
                        callback(err instanceof Error ? err : new Error(String(err)));
                    }
                },
                flush: async (callback) => {
                    try {
                        if (batch.length > 0) {
                            await this.processBatch(batch);
                            totalProcessed += batch.length;
                            if (progressCallback) {
                                progressCallback(totalProcessed);
                            }
                        }
                        callback();
                    }
                    catch (err) {
                        callback(err instanceof Error ? err : new Error(String(err)));
                    }
                }
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
