import { IDocumentParser, ParsedDocument } from '@application/ports/IDocumentParser.js';
import pdf from 'pdf-parse';
import fs from 'fs/promises';
import { injectable } from 'tsyringe';

@injectable()
export class PDFParser implements IDocumentParser {
  async parse(filepath: string): Promise<ParsedDocument> {
    try {
      const dataBuffer = await fs.readFile(filepath);
      const data = await pdf(dataBuffer);

      return {
        text: data.text,
        pageCount: data.numpages,
        metadata: {
          info: data.info,
          version: data.version,
        },
      };
    } catch (error) {
      throw new Error(`Failed to parse PDF: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  supports(mimeType: string): boolean {
    return mimeType === 'application/pdf';
  }
}