/**
 * CSVExporter
 *
 * Utility class for exporting various types of data into CSV format. 
 * Provides methods to generate and download CSV content for error results, 
 * search terms, and their summaries. Includes built-in options for customization 
 * like headers, delimiters, and encoding.
 *
 * Key Functionalities:
 * - Export errors with detailed information.
 * - Export summary reports for errors and search terms.
 * - Download CSV files with proper encoding and format.
 */


import { ErrorResult, SearchTerm, KeywordMetrics } from '@shopping-feed/types';

interface CSVOptions {
  includeHeaders?: boolean;
  delimiter?: string;
  encoding?: string;
}

export class CSVExporter {
  /**
 * Default options for CSV generation:
 * - `includeHeaders`: Whether to include a header row in the CSV.
 * - `delimiter`: The character used to separate fields (default is a comma).
 * - `encoding`: The encoding format of the CSV file.
 */

  private static readonly DEFAULT_OPTIONS: CSVOptions = {
    includeHeaders: true,
    delimiter: ',',
    encoding: 'utf-8'
  };

  /**
 * Escapes a CSV field to ensure proper formatting:
 * - Encloses the field in double quotes if it contains special characters (e.g., `,`, `"`).
 * - Escapes any double quotes in the field.
 * - Handles both string and numeric fields.
 *
 * @param field - The field value to be escaped.
 * @returns The escaped field as a string.
 */

  private static escapeCSVField(field: string | number): string {
    if (typeof field === 'number') return field.toString();
    
    const value = field?.toString() || '';
    const needsEscaping = /[",\n\r]/.test(value) || value.includes(this.DEFAULT_OPTIONS.delimiter!);
    
    if (needsEscaping) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    
    return value;
  }


  /**
 * Formats a single row for a CSV file:
 * - Escapes each field in the row.
 * - Joins the fields using the specified delimiter.
 *
 * @param row - Array of field values for the row.
 * @returns A string representing the formatted row.
 */

  private static formatRow(row: (string | number)[]): string {
    return row.map(field => this.escapeCSVField(field)).join(this.DEFAULT_OPTIONS.delimiter);
  }

  // Original error export functionality
  static exportErrors(errors: ErrorResult[], options: CSVOptions = {}): string {
    const { includeHeaders = true } = { ...this.DEFAULT_OPTIONS, ...options };
    const rows: string[] = [];

    if (includeHeaders) {
      rows.push(this.formatRow(['Product ID', 'Error Type', 'Details', 'Affected Field', 'Value']));
    }

    errors.forEach(error => {
      rows.push(this.formatRow([
        error.id,
        error.errorType,
        error.details,
        error.affectedField,
        error.value
      ]));
    });

    return rows.join('\n');
  }

  /**
 * Exports a summary report for feed analysis as a CSV string:
 * - Includes a summary section with file name, total products, and error counts.
 * - Appends detailed error information below the summary.
 *
 * @param fileName - Name of the analyzed file.
 * @param totalProducts - Total number of products analyzed.
 * @param errorCounts - Object mapping error types to their counts.
 * @param errors - Array of detailed error results.
 * @returns A CSV string containing the summary and detailed errors.
 */

  static exportSummaryReport(
    fileName: string,
    totalProducts: number,
    errorCounts: { [key: string]: number },
    errors: ErrorResult[]
  ): string {
    const summary = [
      'Feed Analysis Summary',
      `File Name: ${this.escapeCSVField(fileName)}`,
      `Total Products: ${totalProducts}`,
      `Total Errors: ${Object.values(errorCounts).reduce((a, b) => a + b, 0)}`,
      '',
      'Error Counts:',
      ...Object.entries(errorCounts).map(([type, count]) => 
        `${this.escapeCSVField(type)}: ${count}`
      ),
      '',
      'Detailed Errors:'
    ].join('\n');

    const detailedErrors = this.exportErrors(errors);
    return `${summary}\n${detailedErrors}`;
  }


  /**
 * Exports search term data as a CSV string:
 * - Includes metrics such as monthly search volume, competition, and bid ranges.
 * - Supports custom options for headers and delimiter.
 *
 * @param terms - Array of search term results.
 * @param options - Custom options for CSV formatting.
 * @returns A CSV string containing the search term data.
 *
 * Example CSV Header:
 * - Product ID, Product Name, Search Term, Pattern Type, Monthly Search Volume, ...
 */

  static exportSearchTerms(
    terms: SearchTerm[],
    options: CSVOptions = {}
  ): string {
    const { includeHeaders = true } = { ...this.DEFAULT_OPTIONS, ...options };
    const rows: string[] = [];

    if (includeHeaders) {
      rows.push(this.formatRow([
        'Product ID',
        'Product Name',
        'Search Term',
        'Pattern Type',
        'Monthly Search Volume',
        'Competition',
        'Competition Index',
        'Min Bid',
        'Max Bid',
        'Matching Products'
      ]));
    }

    terms.forEach(term => {
      rows.push(this.formatRow([
        term.id,
        term.productName,
        term.searchTerm,
        term.pattern,
        term.estimatedVolume,
        term.keywordMetrics?.competition || 'N/A',
        term.keywordMetrics?.competitionIndex 
          ? `${(term.keywordMetrics.competitionIndex * 100).toFixed(1)}%` 
          : 'N/A',
        term.keywordMetrics?.lowTopPageBid 
          ? `$${term.keywordMetrics.lowTopPageBid.toFixed(2)}` 
          : 'N/A',
        term.keywordMetrics?.highTopPageBid 
          ? `$${term.keywordMetrics.highTopPageBid.toFixed(2)}` 
          : 'N/A',
        term.matchingProducts?.length || 0
      ]));
    });

    return rows.join('\n');
  }

  /**
 * Exports a summary report for search term analysis as a CSV string:
 * - Includes a summary section with patterns, statistics, and volume data.
 * - Appends detailed search term information below the summary.
 *
 * @param fileName - Name of the analyzed file.
 * @param terms - Array of all search term results.
 * @param filteredTerms - (Optional) Array of filtered search term results.
 * @returns A CSV string containing the summary and detailed terms.
 */

  static exportSearchTermsSummary(
    fileName: string,
    terms: SearchTerm[],
    filteredTerms: SearchTerm[] | null = null
  ): string {
    const attributeBasedCount = terms.filter(t => 
      t.pattern.includes('Attribute-based')).length;
    const descriptionBasedCount = terms.filter(t => 
      t.pattern.includes('Description-based')).length;

    const summary = [
      'Search Terms Analysis Summary',
      `File Name: ${this.escapeCSVField(fileName)}`,
      `Total Search Terms: ${terms.length}`,
      '',
      'Pattern Distribution:',
      `Attribute-based Terms: ${attributeBasedCount}`,
      `Description-based Terms: ${descriptionBasedCount}`,
      '',
      'Search Volume Statistics:',
      `Average Monthly Searches: ${this.calculateAverageSearchVolume(terms)}`,
      `Median Monthly Searches: ${this.calculateMedianSearchVolume(terms)}`,
      '',
      'Detailed Search Terms:'
    ].join('\n');

    const detailedTerms = this.exportSearchTerms(filteredTerms || terms);
    return `${summary}\n${detailedTerms}`;
  }

  private static calculateAverageSearchVolume(terms: SearchTerm[]): string {
    const total = terms.reduce((sum, term) => sum + term.estimatedVolume, 0);
    return (total / terms.length).toFixed(0);
  }

  private static calculateMedianSearchVolume(terms: SearchTerm[]): string {
    const volumes = terms.map(term => term.estimatedVolume).sort((a, b) => a - b);
    const mid = Math.floor(volumes.length / 2);
    return volumes.length % 2 === 0
      ? ((volumes[mid - 1] + volumes[mid]) / 2).toFixed(0)
      : volumes[mid].toString();
  }

  /**
 * Initiates a download of a CSV file:
 * - Adds a BOM (Byte Order Mark) for proper encoding.
 * - Creates a temporary link to trigger the download.
 * - Cleans up resources after the download.
 *
 * @param content - The CSV content to download.
 * @param filename - The name of the downloaded file.
 */

  static downloadCSV(content: string, filename: string): void {
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, content], { 
      type: 'text/csv;charset=utf-8;' 
    });
    
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}