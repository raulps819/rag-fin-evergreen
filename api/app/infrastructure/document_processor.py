"""
Document processing utilities.
"""
from typing import List
from io import BytesIO
from pdfminer.high_level import extract_text
import pandas as pd


class DocumentProcessor:
    """
    Utility class for processing different document types.
    """

    @staticmethod
    async def extract_text_from_pdf(file_content: bytes) -> str:
        """
        Extract text from PDF file.

        Args:
            file_content: PDF file content as bytes

        Returns:
            Extracted text
        """
        try:
            text = extract_text(BytesIO(file_content))
            return text.strip()
        except Exception as e:
            raise ValueError(f"Error extracting text from PDF: {str(e)}")

    @staticmethod
    async def extract_text_from_csv(file_content: bytes) -> str:
        """
        Extract text from CSV file.

        Args:
            file_content: CSV file content as bytes

        Returns:
            Extracted text
        """
        try:
            df = pd.read_csv(BytesIO(file_content))
            # Convert dataframe to text representation
            return df.to_string(index=False)
        except Exception as e:
            raise ValueError(f"Error extracting text from CSV: {str(e)}")

    @staticmethod
    async def extract_text_from_excel(file_content: bytes) -> str:
        """
        Extract text from Excel file.

        Args:
            file_content: Excel file content as bytes

        Returns:
            Extracted text
        """
        try:
            df = pd.read_excel(BytesIO(file_content))
            return df.to_string(index=False)
        except Exception as e:
            raise ValueError(f"Error extracting text from Excel: {str(e)}")

    @staticmethod
    async def extract_text(file_content: bytes, file_type: str) -> str:
        """
        Extract text from a document based on its type.

        Args:
            file_content: File content as bytes
            file_type: File extension (pdf, csv, xlsx, etc.)

        Returns:
            Extracted text
        """
        file_type = file_type.lower().replace(".", "")

        if file_type == "pdf":
            return await DocumentProcessor.extract_text_from_pdf(file_content)
        elif file_type == "csv":
            return await DocumentProcessor.extract_text_from_csv(file_content)
        elif file_type in ["xlsx", "xls"]:
            return await DocumentProcessor.extract_text_from_excel(file_content)
        else:
            raise ValueError(f"Unsupported file type: {file_type}")

    @staticmethod
    async def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
        """
        Split text into chunks with overlap.

        Args:
            text: Text to chunk
            chunk_size: Maximum chunk size in characters
            overlap: Overlap between chunks

        Returns:
            List of text chunks
        """
        if not text:
            return []

        chunks = []
        start = 0

        while start < len(text):
            end = start + chunk_size
            chunk = text[start:end]

            # Try to break at sentence boundary
            if end < len(text):
                # Look for last period, question mark, or exclamation point
                last_break = max(
                    chunk.rfind(". "),
                    chunk.rfind("? "),
                    chunk.rfind("! ")
                )
                if last_break > chunk_size * 0.5:  # Only break if past halfway
                    chunk = chunk[:last_break + 1]
                    end = start + last_break + 1

            chunks.append(chunk.strip())
            start = end - overlap if end < len(text) else end

        return [c for c in chunks if c]  # Filter empty chunks

    @staticmethod
    async def extract_tabular_chunks_from_csv(file_content: bytes) -> List[str]:
        """
        Extract chunks from CSV file, one chunk per row.
        Supports multiple encodings including UTF-8, UTF-16, Latin-1, etc.

        Args:
            file_content: CSV file content as bytes

        Returns:
            List of text chunks (one per row)
        """
        # Try multiple encodings in order of likelihood
        encodings = ['utf-8', 'utf-16', 'utf-16-le', 'utf-16-be', 'latin-1', 'iso-8859-1', 'cp1252']

        last_error = None
        for encoding in encodings:
            try:
                df = pd.read_csv(BytesIO(file_content), encoding=encoding)
                return DocumentProcessor._rows_to_text_chunks(df)
            except (UnicodeDecodeError, UnicodeError):
                last_error = f"Failed with encoding {encoding}"
                continue
            except Exception as e:
                # If it's not an encoding error, raise immediately
                raise ValueError(f"Error extracting tabular chunks from CSV: {str(e)}")

        # If all encodings failed
        raise ValueError(f"Error extracting tabular chunks from CSV: Could not decode file with any supported encoding. Last error: {last_error}")

    @staticmethod
    async def extract_tabular_chunks_from_excel(file_content: bytes) -> List[str]:
        """
        Extract chunks from Excel file, one chunk per row.

        Args:
            file_content: Excel file content as bytes

        Returns:
            List of text chunks (one per row)
        """
        try:
            df = pd.read_excel(BytesIO(file_content))
            return DocumentProcessor._rows_to_text_chunks(df)
        except Exception as e:
            raise ValueError(f"Error extracting tabular chunks from Excel: {str(e)}")

    @staticmethod
    def _rows_to_text_chunks(df: pd.DataFrame) -> List[str]:
        """
        Convert DataFrame rows to text chunks.

        Each row becomes a structured text chunk with format:
        "column1: value1 | column2: value2 | ..."

        Args:
            df: pandas DataFrame

        Returns:
            List of text chunks (one per row)
        """
        chunks = []
        for _, row in df.iterrows():
            parts = []
            for col in df.columns:
                val = row[col]
                # Skip NaN/None values
                if pd.isna(val):
                    continue
                parts.append(f"{col}: {val}")

            # Only add non-empty rows
            if parts:
                chunks.append(" | ".join(parts))

        return chunks