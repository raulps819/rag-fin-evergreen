import { IDocumentParser } from '@application/ports/IDocumentParser.js';
import { PDFParser } from './PDFParser.js';
import { CSVParser } from './CSVParser.js';
import { XLSXParser } from './XLSXParser.js';
import { injectable } from 'tsyringe';

@injectable()
export class ParserFactory {
  private parsers: IDocumentParser[];

  constructor() {
    this.parsers = [
      new PDFParser(),
      new CSVParser(),
      new XLSXParser(),
    ];
  }

  getParser(mimeType: string): IDocumentParser | null {
    return this.parsers.find(parser => parser.supports(mimeType)) || null;
  }

  getSupportedMimeTypes(): string[] {
    return [
      'application/pdf',
      'text/csv',
      'application/csv',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel',
    ];
  }
}