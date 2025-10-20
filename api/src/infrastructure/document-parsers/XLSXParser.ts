import { IDocumentParser, ParsedDocument } from '@application/ports/IDocumentParser.js';
import * as XLSX from 'xlsx';
import { injectable } from 'tsyringe';

@injectable()
export class XLSXParser implements IDocumentParser {
  async parse(filepath: string): Promise<ParsedDocument> {
    try {
      const workbook = XLSX.readFile(filepath);
      const sheetNames = workbook.SheetNames;

      const sheets: string[] = [];

      sheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as unknown[][];

        sheets.push(`\n=== Sheet: ${sheetName} ===\n`);
        sheets.push(this.convertSheetToText(data));
      });

      const text = sheets.join('\n');

      return {
        text,
        metadata: {
          sheetCount: sheetNames.length,
          sheetNames,
        },
      };
    } catch (error) {
      throw new Error(`Failed to parse XLSX: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private convertSheetToText(data: unknown[][]): string {
    if (data.length === 0) return '';

    const lines: string[] = [];

    data.forEach((row, rowIndex) => {
      if (rowIndex === 0) {
        // Header
        lines.push((row as unknown[]).join(' | '));
        lines.push('-'.repeat(80));
      } else {
        // Data rows
        const rowText = (row as unknown[])
          .map((cell, colIndex) => {
            const header = data[0]?.[colIndex] || `Col${colIndex}`;
            return `${header}: ${cell ?? ''}`;
          })
          .join(', ');
        lines.push(`Row ${rowIndex}: ${rowText}`);
      }
    });

    return lines.join('\n');
  }

  supports(mimeType: string): boolean {
    return (
      mimeType === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      mimeType === 'application/vnd.ms-excel'
    );
  }
}