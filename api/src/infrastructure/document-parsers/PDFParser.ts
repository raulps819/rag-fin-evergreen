import { IDocumentParser, ParsedDocument } from '@application/ports/IDocumentParser.js';
import { PDFParse } from 'pdf-parse';
import fs from 'fs/promises';
import { injectable } from 'tsyringe';

@injectable()
export class PDFParser implements IDocumentParser {
  async parse(filepath: string): Promise<ParsedDocument> {
    try {
      const dataBuffer = await fs.readFile(filepath);
      const parser = new PDFParse({data: dataBuffer});
      const [textResult, infoResult] = await Promise.all([
        parser.getText(),
        parser.getInfo()
      ]);

      return {
        text: textResult.text,
        pageCount: textResult.total,
        metadata: {
          info: infoResult.info,
          metadata: infoResult.metadata,
          fingerprints: infoResult.fingerprints,
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