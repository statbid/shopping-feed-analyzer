import { parse } from 'csv-parse';
import { Transform } from 'stream';
import { Worker } from 'worker_threads';
import { cpus } from 'os';
import path from 'path';
import { FeedItem, ErrorResult, AnalysisResult } from './types';




export class FeedAnalyzer {
  private result: AnalysisResult = {
    totalProducts: 0,
    errorCounts: {},
    errors: []
  };
  private idSet: Set<string> = new Set();

  private numWorkers = Math.max(1, cpus().length - 1);
  private activeWorkers = 0;

  private processBatch(batch: FeedItem[]) {
    for (const item of batch) {
      this.result.totalProducts++;
      this.checkDuplicateId(item);
    }
  }

  private checkDuplicateId(item: FeedItem) {
    if (item.id) {
      if (this.idSet.has(item.id)) {
        const error: ErrorResult = {
          id: item.id,
          errorType: 'Duplicate Id',
          details: 'This id appears multiple times in the feed',
          affectedField: 'id',
          value: item.id
        };
        this.addErrors([error]);
      } else {
        this.idSet.add(item.id);
      }
    }
  }

  analyzeStream(fileStream: NodeJS.ReadableStream, progressCallback?: (progress: number) => void): Promise<AnalysisResult> {
    return new Promise((resolve, reject) => {
      const parser = parse({
        columns: (header: string[]) => header.map((h: string) => h.trim().replace(/\s+/g, '_').toLowerCase()), // Normalize headers
        skip_empty_lines: true,
        delimiter: '\t',
        relax_column_count: true,
        trim: true,
      });
      
      

      const batchSize = 1000;
      let batch: FeedItem[] = [];
      let totalProcessed = 0;

      const transformer = new Transform({
        objectMode: true,
        transform: (item: FeedItem, _, callback) => {
          batch.push(item);
          
          if (batch.length >= batchSize) {
            this.processBatchWithWorker(batch);
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
            this.processBatchWithWorker(batch);
            totalProcessed += batch.length;
            if (progressCallback) {
              progressCallback(totalProcessed);
            }
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
  private processBatchWithWorker(batch: FeedItem[]) {
    const workerPath = path.join(__dirname, '..', 'dist', 'worker.js');
    console.log('Worker path:', workerPath);
    console.log('Current directory:', __dirname);
    console.log('File exists:', require('fs').existsSync(workerPath));

    const worker = new Worker(workerPath, { 
      workerData: { batch },
      stderr: true
    });

    worker.on('message', (message: { errors: ErrorResult[], processedCount: number }) => {
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

  private waitForWorkers(): Promise<void> {
    return new Promise((resolve) => {
      const checkWorkers = () => {
        if (this.activeWorkers === 0) {
          resolve();
        } else {
          setTimeout(checkWorkers, 100);
        }
      };
      checkWorkers();
    });
  }

  private addErrors(errors: ErrorResult[]) {
    for (const error of errors) {
      this.result.errors.push(error);
      this.result.errorCounts[error.errorType] = (this.result.errorCounts[error.errorType] || 0) + 1;
    }
  }

  getResults(): AnalysisResult {
    return this.result;
  }

  resetAnalysis() {
    this.result = {
      totalProducts: 0,
      errorCounts: {},
      errors: []
    };
    this.idSet.clear();
  }


  countTotalProducts(fileStream: NodeJS.ReadableStream): Promise<number> {
    return new Promise((resolve, reject) => {
      let count = 0;
      const parser = parse({
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