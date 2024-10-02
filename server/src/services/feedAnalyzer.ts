import { parse } from 'csv-parse';
import { Transform } from 'stream';

// Types
interface FeedItem {
  id: string;
  title?: string;
  description?: string;
  [key: string]: string | undefined;
}

interface ErrorResult {
  id: string;
  errorType: string;
  details: string;
  affectedField: string;
  value: string;
}

interface AnalysisResult {
  totalProducts: number;
  errorCounts: { [key: string]: number };
  errors: ErrorResult[];
}

// Error checking functions
const errorCheckers = {
  descriptionMissingSpaces: (item: FeedItem): ErrorResult[] => {
    const errors: ErrorResult[] = [];
    if (item.description) {
      const missingSpaceRegex = /,(?=\S)/g;
      const matches = item.description.match(missingSpaceRegex);
      if (matches) {
        errors.push({
          id: item.id || 'UNKNOWN',
          errorType: 'Missing Spaces After Commas',
          details: `Description contains ${matches.length} instance(s) of missing spaces after commas`,
          affectedField: 'description',
          value: item.description
        });
      }
    }
    return errors;
  },

  titleDuplicateWords: (item: FeedItem): ErrorResult[] => {
    const errors: ErrorResult[] = [];
    if (item.title) {
      const words = item.title.toLowerCase().split(/\s+/);
      const duplicates = words.filter((word, index) => words.indexOf(word) !== index);
      if (duplicates.length > 0) {
        errors.push({
          id: item.id || 'UNKNOWN',
          errorType: 'Duplicate Words in Title',
          details: `Title contains duplicate words: ${[...new Set(duplicates)].join(', ')}`,
          affectedField: 'title',
          value: item.title
        });
      }
    }
    return errors;
  },

  
  titleSizeColorCheck: (item: FeedItem): ErrorResult[] => {
    const errors: ErrorResult[] = [];
    const sizeWords = ['XS', 'S', 'M', 'L', 'XL', 'small', 'medium', 'large'];
    
    if (item.size && item.title) {
      const hasSizeWord = sizeWords.some(size => 
        item.title!.toLowerCase().includes(size.toLowerCase())
      );
      
      if (!hasSizeWord) {
        errors.push({
          id: item.id || 'UNKNOWN',
          errorType: 'Size Mismatch',
          details: 'Title doesn\'t contain size when size is set',
          affectedField: 'title',
          value: item.title
        });
      }
    }

    if (item.color && item.title) {
      if (!item.title.toLowerCase().includes(item.color.toLowerCase())) {
        errors.push({
          id: item.id || 'UNKNOWN',
          errorType: 'Color Mismatch',
          details: 'Title doesn\'t contain color when color is set',
          affectedField: 'title',
          value: item.title
        });
      }
    }

    return errors;
  }



};

// Analyzer class
export class FeedAnalyzer {
  private result: AnalysisResult = {
    totalProducts: 0,
    errorCounts: {},
    errors: []
  };

  analyzeStream(fileStream: NodeJS.ReadableStream): Promise<AnalysisResult> {
    return new Promise((resolve, reject) => {
      const parser = parse({
        columns: true,
        skip_empty_lines: true,
        delimiter: '\t',
        relax_column_count: true,
        trim: true,
      });

      const transformer = new Transform({
        objectMode: true,
        transform: (item: FeedItem, _, callback) => {
          this.result.totalProducts++;
          
          // Run all error checkers
          Object.values(errorCheckers).forEach(checker => {
            const errors = checker(item);
            this.result.errors.push(...errors);
            
            errors.forEach(error => {
              this.result.errorCounts[error.errorType] = 
                (this.result.errorCounts[error.errorType] || 0) + 1;
            });
          });
          
          callback();
        }
      });

      fileStream
        .pipe(parser)
        .pipe(transformer)
        .on('finish', () => resolve(this.result))
        .on('error', (err) => {
          console.error('Error parsing file:', err);
          reject(new Error('Error parsing file. Please ensure it\'s a valid TSV file.'));
        });
    });
  }
}