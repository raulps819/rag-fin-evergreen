export interface ParsedDocument {
  text: string;
  pageCount?: number;
  metadata?: Record<string, unknown>;
}

export interface IDocumentParser {
  parse(filepath: string): Promise<ParsedDocument>;
  supports(mimeType: string): boolean;
}