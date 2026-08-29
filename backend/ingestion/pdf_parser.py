"""
PDF Parser module for data ingestion.
"""
import logging
import re
from typing import List, Dict, Union, Any, IO
import os

try:
    import pdfplumber
except ImportError:
    pdfplumber = None

logger = logging.getLogger(__name__)

class PDFParserError(Exception):
    """Base exception for PDF parser errors."""
    pass

class PDFParser:
    """
    Parser for PDF files using pdfplumber.
    """

    def __init__(self):
        if pdfplumber is None:
            logger.warning("pdfplumber is not installed. PDF extraction will fail.")

    def _clean_text(self, text: str) -> str:
        """
        Clean extracted text by normalizing whitespace and removing artifacts.
        """
        if not text:
            return ""
        # Replace multiple spaces/newlines with a single space
        text = re.sub(r'\s+', ' ', text)
        # Remove non-printable characters or artifacts if needed
        # Strip leading/trailing whitespace
        return text.strip()

    def extract_text(self, file_path_or_buffer: Union[str, IO[bytes]]) -> str:
        """
        Extract full text from a PDF file.
        
        Args:
            file_path_or_buffer: Path to PDF file or file-like object.
            
        Returns:
            Extracted and cleaned text as a single string.
            
        Raises:
            PDFParserError: If extraction fails or pdfplumber is missing.
        """
        if pdfplumber is None:
            raise PDFParserError("pdfplumber is required but not installed.")
            
        try:
            full_text = []
            with pdfplumber.open(file_path_or_buffer) as pdf:
                for page in pdf.pages:
                    text = page.extract_text()
                    if text:
                        full_text.append(text)
            
            raw_text = "\n".join(full_text)
            return self._clean_text(raw_text)
        except Exception as e:
            logger.error(f"Failed to extract text from PDF: {str(e)}")
            raise PDFParserError(f"Failed to extract text from PDF: {str(e)}") from e

    def extract_text_by_page(self, file_path_or_buffer: Union[str, IO[bytes]]) -> List[Dict[str, Any]]:
        """
        Extract text from a PDF file page by page.
        
        Args:
            file_path_or_buffer: Path to PDF file or file-like object.
            
        Returns:
            List of dictionaries containing page_number and text.
            
        Raises:
            PDFParserError: If extraction fails.
        """
        if pdfplumber is None:
            raise PDFParserError("pdfplumber is required but not installed.")
            
        try:
            pages_data = []
            with pdfplumber.open(file_path_or_buffer) as pdf:
                for i, page in enumerate(pdf.pages):
                    text = page.extract_text()
                    pages_data.append({
                        "page_number": i + 1,
                        "text": self._clean_text(text) if text else ""
                    })
            return pages_data
        except Exception as e:
            logger.error(f"Failed to extract text by page from PDF: {str(e)}")
            raise PDFParserError(f"Failed to extract text by page: {str(e)}") from e

    def extract_tables(self, file_path_or_buffer: Union[str, IO[bytes]]) -> List[Dict[str, Any]]:
        """
        Extract tables from a PDF file.
        
        Args:
            file_path_or_buffer: Path to PDF file or file-like object.
            
        Returns:
            List of dictionaries containing page_number and table data.
            
        Raises:
            PDFParserError: If extraction fails.
        """
        if pdfplumber is None:
            raise PDFParserError("pdfplumber is required but not installed.")
            
        try:
            tables_data = []
            with pdfplumber.open(file_path_or_buffer) as pdf:
                for i, page in enumerate(pdf.pages):
                    tables = page.extract_tables()
                    for table in tables:
                        # Clean table cells
                        cleaned_table = []
                        for row in table:
                            cleaned_row = [self._clean_text(str(cell)) if cell is not None else "" for cell in row]
                            cleaned_table.append(cleaned_row)
                            
                        tables_data.append({
                            "page_number": i + 1,
                            "table": cleaned_table
                        })
            return tables_data
        except Exception as e:
            logger.error(f"Failed to extract tables from PDF: {str(e)}")
            raise PDFParserError(f"Failed to extract tables from PDF: {str(e)}") from e
