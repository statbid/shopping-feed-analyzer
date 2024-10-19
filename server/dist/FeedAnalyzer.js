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
// FeedAnalyzer.ts - Updated with Spell Checker Integration
const csv_parse_1 = require("csv-parse");
const stream_1 = require("stream");
const os_1 = require("os");
const errorCheckers = __importStar(require("./errorCheckers"));
const spellChecker = __importStar(require("./errorCheckers/SpellChecker"));
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
    processBatch(batch) {
        for (const item of batch) {
            this.result.totalProducts++;
            this.checkAllErrors(item);
        }
    }
    checkAllErrors(item) {
        // Check for duplicate IDs
        this.checkDuplicateId(item);
        // Run all other error checks
        Object.values(errorCheckers).forEach(checker => {
            if (typeof checker === 'function') {
                const error = checker(item);
                if (error) {
                    this.addErrors([error]);
                }
            }
            else if (Array.isArray(checker)) {
                checker.forEach(subChecker => {
                    if (typeof subChecker === 'function') {
                        const error = subChecker(item);
                        if (error) {
                            this.addErrors([error]);
                        }
                    }
                });
            }
        });
        // Run spell checks
        Object.values(spellChecker).forEach(checker => {
            if (typeof checker === 'function') {
                const errors = checker(item);
                if (errors && errors.length > 0) {
                    this.addErrors(errors);
                }
            }
        });
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
            const transformer = new stream_1.Transform({
                objectMode: true,
                transform: (item, _, callback) => {
                    batch.push(item);
                    if (batch.length >= batchSize) {
                        this.processBatch(batch);
                        totalProcessed += batch.length;
                        if (progressCallback) {
                            progressCallback(totalProcessed);
                        }
                        batch = [];
                    }
                    callback();
                },
                flush: (callback) => {
                    if (batch.length > 0) {
                        this.processBatch(batch);
                        totalProcessed += batch.length;
                        if (progressCallback) {
                            progressCallback(totalProcessed);
                        }
                    }
                    callback();
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
            // For duplicate IDs, update the existing error instead of adding a new one
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
