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
      const missingSpaceRegex = /,\S/g;
      const matches = item.description.match(missingSpaceRegex);
      if (matches) {
        matches.forEach(match => {
          const index = item.description!.indexOf(match);
          const start = Math.max(0, index - 15);
          const end = Math.min(item.description!.length, index + 15);
          const context = item.description!.slice(start, end);
          errors.push({
            id: item.id || 'UNKNOWN',
            errorType: 'Missing Space After Comma',
            details: `...${context}...`,
            affectedField: 'description',
            value: match
          });
        });
      }
    }
    return errors;
  },

  titleDuplicateWords: (item: FeedItem): ErrorResult[] => {
    const errors: ErrorResult[] = [];
    if (item.title) {
      const words = item.title.split(/\s+/).filter(word => /^[a-zA-Z]+$/.test(word));
      const uniqueWords = new Set(words);
      if (words.length !== uniqueWords.size) {
        const duplicates = words.filter((word, index) => words.indexOf(word) !== index);
        errors.push({
          id: item.id || 'UNKNOWN',
          errorType: 'Duplicate Words in Title',
          details: `Duplicate words found: ${duplicates.join(', ')}`,
          affectedField: 'title',
          value: item.title
        });
      }
    }
    return errors;
  },

  titleSizeCheck: (item: FeedItem): ErrorResult[] => {
    const errors: ErrorResult[] = [];
    const sizeWords = ['XS', 'S', 'M', 'L', 'XL', 'small', 'medium', 'large'];
    
    if (item.size && item.title) {
      const hasSizeWord = sizeWords.some(size => 
        item.title!.toLowerCase().includes(size.toLowerCase())
      );
      
      if (!hasSizeWord) {
        errors.push({
          id: item.id || 'UNKNOWN',
          errorType: 'Size Missing in Title',
          details: `Size '${item.size}' not found in title`,
          affectedField: 'title',
          value: item.title
        });
      }
    }
    return errors;
  },

  titleColorCheck: (item: FeedItem): ErrorResult[] => {
    const errors: ErrorResult[] = [];
    if (item.color && item.title) {
      if (!item.title.toLowerCase().includes(item.color.toLowerCase())) {
        errors.push({
          id: item.id || 'UNKNOWN',
          errorType: 'Color Missing in Title',
          details: `Color '${item.color}' not found in title`,
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