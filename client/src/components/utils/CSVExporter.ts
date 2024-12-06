import { ErrorResult, SearchTerm, KeywordMetrics } from '../../../../server/src/types';

interface CSVOptions {
  includeHeaders?: boolean;
  delimiter?: string;
  encoding?: string;
}

export class CSVExporter {
  private static readonly DEFAULT_OPTIONS: CSVOptions = {
    includeHeaders: true,
    delimiter: ',',
    encoding: 'utf-8'
  };

  private static escapeCSVField(field: string | number): string {
    if (typeof field === 'number') return field.toString();
    
    const value = field?.toString() || '';
    const needsEscaping = /[",\n\r]/.test(value) || value.includes(this.DEFAULT_OPTIONS.delimiter!);
    
    if (needsEscaping) {
      return `"${value.replace(/"/g, '""')}"`;
    }
    
    return value;
  }

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

  // Original summary report functionality
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

  // New search terms export functionality
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

  // New search terms summary functionality
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