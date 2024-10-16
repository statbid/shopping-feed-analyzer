import { parse } from 'csv-parse';
import { Transform } from 'stream';
import { Worker } from 'worker_threads';
import { cpus } from 'os';
import path from 'path';
import { FeedItem, ErrorResult, AnalysisResult } from './types';
import * as errorCheckers from './errorCheckers';

export class FeedAnalyzer {
  private result: AnalysisResult = {
    totalProducts: 0,
    errorCounts: {},
    errors: []
  };
  private idCounts: Map<string, number> = new Map();

  private numWorkers = Math.max(1, cpus().length - 1);
  private activeWorkers = 0;

  private processBatch(batch: FeedItem[]) {
    for (const item of batch) {
      this.result.totalProducts++;
      this.checkAllErrors(item);
    }
  }

  private checkAllErrors(item: FeedItem) {
    // Check for duplicate IDs
    this.checkDuplicateId(item);

    // Run all other error checks
    Object.values(errorCheckers).forEach(checker => {
      if (typeof checker === 'function') {
        const error = checker(item);
        if (error) {
          this.addErrors([error]);
        }
      } else if (Array.isArray(checker)) {
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
  }

  private checkDuplicateId(item: FeedItem) {
    if (item.id) {
      const count = (this.idCounts.get(item.id) || 0) + 1;
      this.idCounts.set(item.id, count);

      if (count > 1) {
        const error: ErrorResult = {
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

  analyzeStream(fileStream: NodeJS.ReadableStream, progressCallback?: (progress: number) => void): Promise<AnalysisResult> {
    return new Promise((resolve, reject) => {
      const parser = parse({
        columns: (header: string[]) => header.map((h: string) => h.trim().replace(/\s+/g, '_').toLowerCase()),
        skip_empty_lines: true,
        delimiter: '\t',
        relax_column_count: true,
      });

      const batchSize = 1000;
      let batch: FeedItem[] = [];
      let totalProcessed = 0;

      const transformer = new Transform({
        objectMode: true,
        transform: (item: FeedItem, _, callback) => {
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
          console.log(`Total products processed: ${this.result.totalProducts}`);
          console.log(`Total unique IDs: ${this.idCounts.size}`);
          console.log(`Total errors: ${this.result.errors.length}`);
          resolve(this.result);
        })
        .on('error', (err) => {
          console.error('Error parsing file:', err);
          reject(new Error('Error parsing file. Please ensure it is a valid TSV file.'));
        });
    });
  }

  private addErrors(errors: ErrorResult[]) {
    for (const error of errors) {
      // For duplicate IDs, update the existing error instead of adding a new one
      if (error.errorType === 'Duplicate Id') {
        const existingError = this.result.errors.find(e => e.errorType === 'Duplicate Id' && e.id === error.id);
        if (existingError) {
          existingError.details = error.details;
        } else {
          this.result.errors.push(error);
        }
      } else {
        this.result.errors.push(error);
      }
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
    this.idCounts.clear();
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