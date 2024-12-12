/**
 * CSVExporter
 *
 * A utility class for exporting various types of data into CSV format. 
 * Designed for flexibility, it supports error results, search term analysis, 
 * and summary reports, along with advanced formatting options.
 *
 * Key Functionalities:
 * - **Error Checks Exporting:**
 *   - Export detailed errors with product-specific information.
 *   - Generate summary reports combining feed statistics and detailed errors.
 * - **Search Terms Exporting:**
 *   - Export search terms with detailed metrics, including monthly search volume, competition, and bid ranges.
 *   - Provide distribution of search term patterns (e.g., attribute-based, description-based, API suggestions).
 * - **Download Capabilities:**
 *   - Create and download CSV files with proper encoding (UTF-8 BOM for compatibility).
 *   - Automatically generate filenames based on input data.
 *
 * Key Features:
 * - **Customizable Options:** Includes headers, delimiters, and UTF-8 encoding for broad compatibility.
 * - **Pattern Distribution:** Summarizes search term categories in the header of CSV files.
 * - **Safe Field Handling:** Escapes special characters in fields to maintain CSV validity.
 * - **Dynamic Formatting:** Supports flexible row and field-level processing for CSV generation.
 *
 * Methods:
 * - **Error Handling:**
 *   - `exportErrors(errors: ErrorResult[]): string`: Converts error results into a CSV string.
 *   - `exportSummaryReport(fileName: string, totalProducts: number, errorCounts: { [key: string]: number }, errors: ErrorResult[]): string`: 
 *     Generates a CSV summary report with statistics and detailed errors.
 * - **Search Terms Handling:**
 *   - `exportSearchTerms(terms: SearchTerm[], includeHeader = true): string`: Converts search terms with metrics into a CSV string, including a summary header.
 *   - `getPatternDistribution(terms: SearchTerm[]): { attributeBased: number; descriptionBased: number; apiSuggestions: number; }`:
 *     Analyzes search term patterns for summary reporting.
 * - **File Download:**
 *   - `downloadCSV(content: string, filename: string): void`: Triggers the download of a CSV file with the provided content and filename.
 *
 * Notes:
 * - **File Encoding:** Adds a UTF-8 BOM for seamless Excel compatibility.
 * - **Field Validation:** Ensures proper escaping of fields containing special characters, commas, or line breaks.
 * - **Dynamic Report Generation:** Adapts summaries and detailed information based on provided data.
 *
 * Dependencies:
 * - Relies on types `SearchTerm` and `ErrorResult` for structuring input data.
 */


import { SearchTerm, ErrorResult } from '@shopping-feed/types';

export class CSVExporter {
  private static readonly DEFAULT_OPTIONS = {
    includeHeaders: true,
    delimiter: ',',
    encoding: 'utf-8'
  };

  private static escapeCSVField(field: string | number): string {
    if (typeof field === 'number') return field.toString();
    const value = field?.toString() || '';
    const needsEscaping = /[",\n\r]/.test(value) || value.includes(this.DEFAULT_OPTIONS.delimiter!);
    return needsEscaping ? `"${value.replace(/"/g, '""')}"` : value;
  }

  private static formatRow(row: (string | number)[]): string {
    return row.map(field => this.escapeCSVField(field)).join(this.DEFAULT_OPTIONS.delimiter);
  }

  // Error export methods
  static exportErrors(errors: ErrorResult[]): string {
    const rows: string[] = [];
    rows.push(this.formatRow(['Product ID', 'Error Type', 'Details', 'Affected Field', 'Value']));

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

  // Search terms export methods
  private static getPatternDistribution(terms: SearchTerm[]): {
    attributeBased: number;
    descriptionBased: number;
    apiSuggestions: number;
  } {
    return terms.reduce((acc, term) => ({
      attributeBased: acc.attributeBased + (term.pattern.includes('Attribute-based') ? 1 : 0),
      descriptionBased: acc.descriptionBased + (term.pattern.includes('Description-based') ? 1 : 0),
      apiSuggestions: acc.apiSuggestions + (term.pattern === 'API Suggestion' ? 1 : 0)
    }), {
      attributeBased: 0,
      descriptionBased: 0,
      apiSuggestions: 0
    });
  }

  static exportSearchTerms(terms: SearchTerm[], includeHeader = true): string {
    const rows: string[] = [];

    if (includeHeader) {
      const distribution = this.getPatternDistribution(terms);
      rows.push(
        'Search Terms Analysis Summary',
        `Total Search Terms: ${terms.length}`,
        '',
        'Pattern Distribution:',
        `Attribute-based Terms: ${distribution.attributeBased}`,
        `Description-based Terms: ${distribution.descriptionBased}`,
        `API Suggestions: ${distribution.apiSuggestions}`,
        '',
        'Detailed Search Terms:',
        this.formatRow([
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
        ])
      );
    }

    terms.forEach(term => {
      rows.push(this.formatRow([
        term.id,
        term.productName,
        term.searchTerm,
        term.pattern,
        term.keywordMetrics?.avgMonthlySearches || 'N/A',
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