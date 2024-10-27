import { parse } from 'csv-parse';
import { Transform } from 'stream';
import { Worker } from 'worker_threads';
import { cpus } from 'os';
import path from 'path';
import { FeedItem, ErrorResult, AnalysisResult } from './types';
import * as errorCheckers from './errorCheckers';
import { spellChecker, checkSpelling, ISpellChecker } from './errorCheckers/SpellChecker';


export class FeedAnalyzer {
  private result: AnalysisResult = {
    totalProducts: 0,
    errorCounts: {},
    errors: []
  };
  private idCounts: Map<string, number> = new Map();

  private numWorkers = Math.max(1, cpus().length - 1);
  private activeWorkers = 0;

  private async processBatch(batch: FeedItem[]) {
    for (const item of batch) {
      this.result.totalProducts++;
      await this.checkAllErrors(item);
    }
  }

  private async checkAllErrors(item: FeedItem) {
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
          } else if (Array.isArray(checker)) {
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
        } catch (err) {
          console.error('Error in error checker:', err);
        }
      }

      // Run spell checks
      try {
        
        const spellErrors = checkSpelling(item);
        if (spellErrors && spellErrors.length > 0) {
         
          this.addErrors(spellErrors);
        }
      } catch (err) {
        console.error('Error in spell checker:', err);
      }

    } catch (err) {
      console.error('Error checking item:', err);
    }
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
      let spellCheckPerformed = false;

      const transformer = new Transform({
        objectMode: true,
        transform: async (item: FeedItem, _, callback) => {
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
          } catch (err) {
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
              spellChecker.saveCache();
            }

            callback();
          } catch (err) {
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

  private addErrors(errors: ErrorResult[]) {
    for (const error of errors) {
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