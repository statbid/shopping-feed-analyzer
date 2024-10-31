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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedAnalyzer = void 0;
const csv_parse_1 = require("csv-parse");
const stream_1 = require("stream");
const worker_threads_1 = require("worker_threads");
const os_1 = require("os");
const path_1 = __importDefault(require("path"));
const errorCheckers = __importStar(require("./errorCheckers"));
const environment_1 = __importDefault(require("./config/environment"));
class FeedAnalyzer {
    constructor() {
        this.result = {
            totalProducts: 0,
            errorCounts: {},
            errors: []
        };
        this.idCounts = new Map();
        this.numWorkers = environment_1.default.worker.maxWorkers === 'auto'
            ? Math.max(1, (0, os_1.cpus)().length - 1)
            : parseInt(environment_1.default.worker.maxWorkers);
        this.enabledChecks = [];
    }
    getBatchSize(enabledChecks) {
        const hasSpellCheck = enabledChecks.some(check => check.toLowerCase().includes('spell') ||
            check.toLowerCase().includes('spelling'));
        const hasOnlySimpleChecks = enabledChecks.every(check => check.startsWith('checkDescription') ||
            check.startsWith('checkTitle') ||
            check.startsWith('checkProduct'));
        if (hasSpellCheck) {
            return 1000;
        }
        else if (hasOnlySimpleChecks) {
            return 10000;
        }
        else {
            return 5000;
        }
    }
    createWorker(batch, enabledChecks) {
        return new Promise((resolve, reject) => {
            try {
                const workerPath = path_1.default.resolve(__dirname, '../src/worker.ts');
                const worker = new worker_threads_1.Worker(workerPath, {
                    workerData: { batch, enabledChecks },
                    execArgv: ['--require', 'ts-node/register']
                });
                worker.on('message', (message) => {
                    if (message.error) {
                        console.error('Worker error:', message.error);
                        reject(new Error(message.error));
                        return;
                    }
                    if (message.errors) {
                        this.addErrors(message.errors);
                    }
                    if (message.processedCount) {
                        this.result.totalProducts += message.processedCount;
                        if (this.progressCallback) {
                            this.progressCallback(this.result.totalProducts);
                        }
                    }
                });
                worker.on('error', (error) => {
                    console.error('Worker error:', error);
                    reject(error);
                });
                worker.on('exit', (code) => {
                    if (code === 0) {
                        resolve();
                    }
                    else {
                        reject(new Error(`Worker stopped with exit code ${code}`));
                    }
                });
            }
            catch (error) {
                console.error('Error creating worker:', error);
                reject(error);
            }
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
            this.result.errorCounts[error.errorType] =
                (this.result.errorCounts[error.errorType] || 0) + 1;
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
    async analyzeStream(fileStream, progressCallback, enabledChecks = []) {
        this.progressCallback = progressCallback;
        this.enabledChecks = enabledChecks;
        this.resetAnalysis();
        const batchSize = this.getBatchSize(enabledChecks);
        console.log(`Using batch size: ${batchSize} for enabled checks:`, enabledChecks);
        return new Promise((resolve, reject) => {
            const parserOptions = {
                columns: (headers) => headers.map((h) => h.trim().replace(/\s+/g, '_').toLowerCase()),
                skip_empty_lines: true,
                delimiter: '\t',
                relaxColumnCount: true,
                skipRecordsWithError: true,
                trim: true
            };
            const parser = (0, csv_parse_1.parse)(parserOptions);
            let batch = [];
            let activeWorkers = 0;
            const maxConcurrentWorkers = this.numWorkers;
            let parseError = null;
            let isStreamEnded = false;
            const processBatch = async (items) => {
                activeWorkers++;
                try {
                    await this.createWorker(items, this.enabledChecks);
                }
                finally {
                    activeWorkers--;
                    if (isStreamEnded && activeWorkers === 0) {
                        finishProcessing();
                    }
                }
            };
            const finishProcessing = () => {
                if (parseError) {
                    reject(parseError);
                }
                else {
                    resolve(this.result);
                }
            };
            const transformer = new stream_1.Transform({
                objectMode: true,
                transform: async (item, _, callback) => {
                    try {
                        batch.push(item);
                        if (batch.length >= batchSize && activeWorkers < maxConcurrentWorkers) {
                            const itemsToProcess = [...batch];
                            batch = [];
                            await processBatch(itemsToProcess);
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
                            await processBatch([...batch]);
                        }
                        isStreamEnded = true;
                        if (activeWorkers === 0) {
                            finishProcessing();
                        }
                        callback();
                    }
                    catch (err) {
                        callback(err instanceof Error ? err : new Error(String(err)));
                    }
                }
            });
            parser.on('error', (error) => {
                console.error('Parser error:', error);
                parseError = error;
            });
            transformer.on('error', (error) => {
                console.error('Transformer error:', error);
                parseError = error;
            });
            fileStream.on('error', (error) => {
                console.error('File stream error:', error);
                parseError = error;
            });
            fileStream
                .pipe(parser)
                .pipe(transformer)
                .on('error', (err) => {
                console.error('Stream error:', err);
                reject(new Error('Error parsing file. Please ensure it is a valid TSV file.'));
            });
        });
    }
    resetAnalysis() {
        this.result = {
            totalProducts: 0,
            errorCounts: {},
            errors: []
        };
        this.idCounts.clear();
    }
    getResults() {
        return this.result;
    }
    async countTotalProducts(fileStream) {
        return new Promise((resolve, reject) => {
            let count = 0;
            const parserOptions = {
                columns: true,
                skip_empty_lines: true,
                delimiter: '\t',
                relaxColumnCount: true
            };
            const parser = (0, csv_parse_1.parse)(parserOptions);
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
    validateChecker(checkerName) {
        console.log(`Validating checker: ${checkerName}`);
        let found = false;
        for (const [key, value] of Object.entries(errorCheckers)) {
            if (Array.isArray(value)) {
                if (value.some(fn => fn.name === checkerName)) {
                    console.log(`Found ${checkerName} in ${key} array`);
                    found = true;
                    break;
                }
            }
            else if (typeof value === 'function' && value.name === checkerName) {
                console.log(`Found ${checkerName} as direct function`);
                found = true;
                break;
            }
        }
        if (!found) {
            console.warn(`Checker "${checkerName}" not found in error checkers`);
        }
        return found;
    }
    validateEnabledChecks(checks) {
        console.log('Validating checks:', checks);
        const validChecks = checks.filter(check => this.validateChecker(check));
        console.log('Valid checks:', validChecks);
        return validChecks;
    }
}
exports.FeedAnalyzer = FeedAnalyzer;
