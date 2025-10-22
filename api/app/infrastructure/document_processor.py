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
    def chunk_text(text: str, chunk_size: int = 1000, overlap: int = 200) -> List[str]:
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