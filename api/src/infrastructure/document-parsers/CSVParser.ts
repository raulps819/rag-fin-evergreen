import { IDocumentParser, ParsedDocument } from '@application/ports/IDocumentParser.js';
import Papa from 'papaparse';
import fs from 'fs/promises';
import { injectable } from 'tsyringe';

@injectable()
export class CSVParser implements IDocumentParser {
  async parse(filepath: string): Promise<ParsedDocument> {
    try {
      const fileContent = await fs.readFile(filepath, 'utf-8');

      const result = Papa.parse(fileContent, {
        header: true,
        skipEmptyLines: true,
        dynamicTyping: true,
      });

      if (result.errors.length > 0) {
        throw new Error(`CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`);
      }

      // Convert CSV data to readable text
      const text = this.convertToText(result.data as Record<string, unknown>[], result.meta.fields || []);

      return {
        text,
        metadata: {
          rowCount: result.data.length,
          columns: result.meta.fields,
        },
      };
    } catch (error) {
      throw new Error(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private convertToText(data: Record<string, unknown>[], fields: string[]): string {
    const lines: string[] = [];

    // Add header
    lines.push(fields.join(' | '));
    lines.push('-'.repeat(80));

    // Add rows
    data.forEach((row, index) => {
      const rowText = fields.map(field => `${field}: ${row[field] ?? ''}`).join(', ');
      lines.push(`Row ${index + 1}: ${rowText}`);
    });

    return lines.join('\n');
  }

  supports(mimeType: string): boolean {
    return mimeType === 'text/csv' || mimeType === 'application/csv';
  }
}