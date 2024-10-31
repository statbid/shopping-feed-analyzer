import { parse, Parser, Options as ParseOptions } from 'csv-parse';
import { Transform, TransformCallback } from 'stream';
import { Worker } from 'worker_threads';
import { cpus } from 'os';
import path from 'path';
import { FeedItem, ErrorResult, AnalysisResult } from './types';
import * as errorCheckers from './errorCheckers';
import { spellChecker } from './errorCheckers/SpellChecker';
import environment from './config/environment';


export class FeedAnalyzer {
  private result: AnalysisResult;
  private idCounts: Map<string, number>;
  private numWorkers: number;
  private progressCallback?: (progress: number) => void;
  private enabledChecks: string[];

  constructor() {
    this.result = {
      totalProducts: 0,
      errorCounts: {},
      errors: []
    };
    this.idCounts = new Map();
    this.numWorkers = environment.worker.maxWorkers === 'auto' 
    ? Math.max(1, cpus().length - 1)
    : parseInt(environment.worker.maxWorkers);
    
    this.enabledChecks = [];
  }

  private getBatchSize(enabledChecks: string[]): number {
    const hasSpellCheck = enabledChecks.some(check => 
      check.toLowerCase().includes('spell') || 
      check.toLowerCase().includes('spelling')
    );

    const hasOnlySimpleChecks = enabledChecks.every(check =>
      check.startsWith('checkDescription') ||
      check.startsWith('checkTitle') ||
      check.startsWith('checkProduct')
    );

    if (hasSpellCheck) {
      return 1000;
    } else if (hasOnlySimpleChecks) {
      return 10000;
    } else {
      return 5000;
    }
  }

  private createWorker(batch: FeedItem[], enabledChecks: string[]): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const workerPath = path.resolve(__dirname, '../src/worker.ts');
        
        const worker = new Worker(workerPath, {
          workerData: { batch, enabledChecks },
          execArgv: ['--require', 'ts-node/register']
        });

        worker.on('message', (message: { error?: string; errors?: ErrorResult[]; processedCount?: number }) => {
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
          } else {
            reject(new Error(`Worker stopped with exit code ${code}`));
          }
        });
      } catch (error) {
        console.error('Error creating worker:', error);
        reject(error);
      }
    });
  }

  private addErrors(errors: ErrorResult[]): void {
    for (const error of errors) {
      if (error.errorType === 'Duplicate Id') {
        const existingError = this.result.errors.find(
          e => e.errorType === 'Duplicate Id' && e.id === error.id
        );
        if (existingError) {
          existingError.details = error.details;
        } else {
          this.result.errors.push(error);
        }
      } else {
        this.result.errors.push(error);
      }
      this.result.errorCounts[error.errorType] = 
        (this.result.errorCounts[error.errorType] || 0) + 1;
    }
  }

  private checkDuplicateId(item: FeedItem): void {
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

  public async analyzeStream(
    fileStream: NodeJS.ReadableStream,
    progressCallback?: (progress: number) => void,
    enabledChecks: string[] = []
  ): Promise<AnalysisResult> {
    this.progressCallback = progressCallback;
    this.enabledChecks = enabledChecks;
    this.resetAnalysis();

    const batchSize = this.getBatchSize(enabledChecks);
    console.log(`Using batch size: ${batchSize} for enabled checks:`, enabledChecks);

    return new Promise((resolve, reject) => {
      const parserOptions: ParseOptions = {
        columns: (headers: string[]): string[] => 
          headers.map((h: string) => h.trim().replace(/\s+/g, '_').toLowerCase()),
        skip_empty_lines: true,
        delimiter: '\t',
        relaxColumnCount: true,  
        skipRecordsWithError: true,
        trim: true
      };

      const parser = parse(parserOptions);

      let batch: FeedItem[] = [];
      let activeWorkers = 0;
      const maxConcurrentWorkers = this.numWorkers;
      let parseError: Error | null = null;
      let isStreamEnded = false;

      const processBatch = async (items: FeedItem[]): Promise<void> => {
        activeWorkers++;
        try {
          await this.createWorker(items, this.enabledChecks);
        } finally {
          activeWorkers--;
          if (isStreamEnded && activeWorkers === 0) {
            finishProcessing();
          }
        }
      };

      const finishProcessing = () => {
        if (parseError) {
          reject(parseError);
        } else {
          resolve(this.result);
        }
      };

      const transformer = new Transform({
        objectMode: true,
        transform: async (item: FeedItem, _: BufferEncoding, callback: TransformCallback): Promise<void> => {
          try {
            batch.push(item);
            
            if (batch.length >= batchSize && activeWorkers < maxConcurrentWorkers) {
              const itemsToProcess = [...batch];
              batch = [];
              await processBatch(itemsToProcess);
            }
            callback();
          } catch (err) {
            callback(err instanceof Error ? err : new Error(String(err)));
          }
        },
        flush: async (callback: TransformCallback): Promise<void> => {
          try {
            if (batch.length > 0) {
              await processBatch([...batch]);
            }
            isStreamEnded = true;
            if (activeWorkers === 0) {
              finishProcessing();
            }
            callback();
          } catch (err) {
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

  public resetAnalysis(): void {
    this.result = {
      totalProducts: 0,
      errorCounts: {},
      errors: []
    };
    this.idCounts.clear();
  }

  public getResults(): AnalysisResult {
    return this.result;
  }

  public async countTotalProducts(fileStream: NodeJS.ReadableStream): Promise<number> {
    return new Promise((resolve, reject) => {
      let count = 0;
      const parserOptions: ParseOptions = {
        columns: true,
        skip_empty_lines: true,
        delimiter: '\t',
        relaxColumnCount: true  
      };

      const parser = parse(parserOptions);

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

  private validateChecker(checkerName: string): boolean {
    console.log(`Validating checker: ${checkerName}`);
    
    let found = false;
    for (const [key, value] of Object.entries(errorCheckers)) {
      if (Array.isArray(value)) {
        if (value.some(fn => fn.name === checkerName)) {
          console.log(`Found ${checkerName} in ${key} array`);
          found = true;
          break;
        }
      } else if (typeof value === 'function' && value.name === checkerName) {
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

  public validateEnabledChecks(checks: string[]): string[] {
    console.log('Validating checks:', checks);
    const validChecks = checks.filter(check => this.validateChecker(check));
    console.log('Valid checks:', validChecks);
    return validChecks;
  }
}