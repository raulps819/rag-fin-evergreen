import { IDocumentParser } from './IDocumentParser.js';

export interface IDocumentParserFactory {
  /**
   * Get a parser that supports the given MIME type
   * @param mimeType - The MIME type of the document
   * @returns A parser instance or null if no parser supports the MIME type
   */
  getParser(mimeType: string): IDocumentParser | null;

  /**
   * Get all supported MIME types
   * @returns Array of supported MIME types
   */
  getSupportedMimeTypes(): string[];
}