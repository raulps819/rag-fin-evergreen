export interface DocumentMetadata {
  provider?: string;
  date?: Date;
  amount?: number;
  currency?: string;
  [key: string]: unknown;
}

export class DocumentMetadataVO {
  private constructor(private readonly data: DocumentMetadata) {}

  static create(data: DocumentMetadata): DocumentMetadataVO {
    return new DocumentMetadataVO(data);
  }

  getValue(): DocumentMetadata {
    return { ...this.data };
  }

  toJSON(): string {
    return JSON.stringify(this.data);
  }

  static fromJSON(json: string): DocumentMetadataVO {
    const data = JSON.parse(json) as DocumentMetadata;
    return new DocumentMetadataVO(data);
  }
}