import { IDocumentParser } from '@application/ports/IDocumentParser.js';
import { IDocumentParserFactory } from '@application/ports/IDocumentParserFactory.js';
import { inject, injectable } from 'tsyringe';

@injectable()
export class ParserFactory implements IDocumentParserFactory {
  constructor(
    @inject('PDFParser') private readonly pdfParser: IDocumentParser,
    @inject('CSVParser') private readonly csvParser: IDocumentParser,
    @inject('XLSXParser') private readonly xlsxParser: IDocumentParser,
  ) {}

  private get parsers(): IDocumentParser[] {
    return [
      this.pdfParser,
      this.csvParser,
      this.xlsxParser,
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