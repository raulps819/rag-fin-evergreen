export enum DocumentType {
  CONTRACT = 'CONTRACT',
  PURCHASE_ORDER = 'PURCHASE_ORDER',
  INVOICE = 'INVOICE',
  SALES_RECORD = 'SALES_RECORD',
  OTHER = 'OTHER',
}

export const isValidDocumentType = (type: string): type is DocumentType => {
  return Object.values(DocumentType).includes(type as DocumentType);
};

export namespace DocumentType {
  export function fromString(type: string): DocumentType {
    if (!isValidDocumentType(type)) {
      throw new Error(`Invalid document type: ${type}`);
    }
    return type as DocumentType;
  }

  export function toString(type: DocumentType): string {
    return type;
  }
}