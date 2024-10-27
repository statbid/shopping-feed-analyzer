import { ErrorResult } from '../../../../server/src/types';

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
    
    // Convert field to string and handle null/undefined
    const value = field?.toString() || '';
    
    // Check if field needs escaping
    const needsEscaping = /[",\n\r]/.test(value) || value.includes(this.DEFAULT_OPTIONS.delimiter!);
    
    if (needsEscaping) {
      // Replace double quotes with two double quotes and wrap in quotes
      return `"${value.replace(/"/g, '""')}"`;
    }
    
    return value;
  }

  private static formatRow(row: (string | number)[]): string {
    return row.map(field => this.escapeCSVField(field)).join(this.DEFAULT_OPTIONS.delimiter);
  }

  static exportErrors(errors: ErrorResult[], options: CSVOptions = {}): string {
    const { includeHeaders = true } = { ...this.DEFAULT_OPTIONS, ...options };
    const rows: string[] = [];

    // Add headers if required
    if (includeHeaders) {
      rows.push(this.formatRow(['Product ID', 'Error Type', 'Details', 'Affected Field', 'Value']));
    }

    // Add data rows
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

  static downloadCSV(content: string, filename: string): void {
    // Add BOM for Excel compatibility
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