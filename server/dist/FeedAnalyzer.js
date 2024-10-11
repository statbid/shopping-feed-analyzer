"use strict";
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
class FeedAnalyzer {
    constructor() {
        this.result = {
            totalProducts: 0,
            errorCounts: {},
            errors: []
        };
        this.numWorkers = Math.max(1, (0, os_1.cpus)().length - 1);
        this.activeWorkers = 0;
    }
    analyzeStream(fileStream) {
        return new Promise((resolve, reject) => {
            const parser = (0, csv_parse_1.parse)({
                columns: true,
                skip_empty_lines: true,
                delimiter: '\t',
                relax_column_count: true,
                trim: true,
            });
            const batchSize = 1000;
            let batch = [];
            const transformer = new stream_1.Transform({
                objectMode: true,
                transform: (item, _, callback) => {
                    batch.push(item);
                    if (batch.length >= batchSize) {
                        this.processBatchWithWorker(batch);
                        batch = [];
                    }
                    callback();
                },
                flush: (callback) => {
                    if (batch.length > 0) {
                        this.processBatchWithWorker(batch);
                    }
                    this.waitForWorkers().then(() => callback());
                }
            });
            fileStream
                .pipe(parser)
                .pipe(transformer)
                .on('finish', () => resolve(this.result))
                .on('error', (err) => {
                console.error('Error parsing file:', err);
                reject(new Error('Error parsing file. Please ensure it is a valid TSV file.'));
            });
        });
    }
    processBatchWithWorker(batch) {
        // Use path.join to create a path that works across different operating systems
        const workerPath = path_1.default.join(__dirname, 'worker.js');
        console.log('Worker path:', workerPath); // Add this line for debugging
        const worker = new worker_threads_1.Worker(workerPath, {
            workerData: { batch },
            // Add this option to see more detailed error messages
            stderr: true
        });
        worker.on('message', (message) => {
            this.result.totalProducts += message.processedCount;
            this.addErrors(message.errors);
        });
        worker.on('error', (err) => {
            console.error('Worker error:', err);
        });
        worker.on('exit', (code) => {
            if (code !== 0) {
                console.error(`Worker stopped with exit code ${code}`);
            }
            this.activeWorkers--;
        });
        this.activeWorkers++;
    }
    waitForWorkers() {
        return new Promise((resolve) => {
            const checkWorkers = () => {
                if (this.activeWorkers === 0) {
                    resolve();
                }
                else {
                    setTimeout(checkWorkers, 100);
                }
            };
            checkWorkers();
        });
    }
    addErrors(errors) {
        for (const error of errors) {
            this.result.errors.push(error);
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
    }
}
exports.FeedAnalyzer = FeedAnalyzer;
