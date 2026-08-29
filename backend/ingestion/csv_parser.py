"""
CSV Parser module for data ingestion.
"""
import csv
import logging
from typing import List, Dict, Union, Any, IO
import io
import os

try:
    import pandas as pd
except ImportError:
    pd = None

try:
    import chardet
except ImportError:
    chardet = None

logger = logging.getLogger(__name__)

class CSVParserError(Exception):
    """Base exception for CSV parser errors."""
    pass

class CSVParser:
    """
    Parser for CSV files.
    """

    def __init__(self):
        pass

    def _detect_encoding(self, file_path_or_buffer: Union[str, IO[bytes]]) -> str:
        """Detect file encoding."""
        if isinstance(file_path_or_buffer, str) and os.path.exists(file_path_or_buffer):
            if chardet:
                with open(file_path_or_buffer, 'rb') as f:
                    raw_data = f.read(10000)
                    result = chardet.detect(raw_data)
                    return result['encoding'] or 'utf-8'
        return 'utf-8' # Fallback

    def _read_data(self, file_path_or_buffer: Union[str, IO[Any]], encoding: str) -> pd.DataFrame:
        """Read data into pandas dataframe."""
        if pd is None:
            raise CSVParserError("pandas is required but not installed.")
        
        try:
            if isinstance(file_path_or_buffer, str):
                df = pd.read_csv(file_path_or_buffer, encoding=encoding)
            else:
                df = pd.read_csv(file_path_or_buffer)
            return df
        except UnicodeDecodeError:
            if encoding == 'utf-8':
                logger.warning("Failed to decode with utf-8, trying latin-1")
                if isinstance(file_path_or_buffer, str):
                    return pd.read_csv(file_path_or_buffer, encoding='latin-1')
                else:
                    file_path_or_buffer.seek(0)
                    return pd.read_csv(file_path_or_buffer, encoding='latin-1')
            raise
        except Exception as e:
            raise CSVParserError(f"Failed to read CSV: {str(e)}") from e

    def _clean_dataframe(self, df: pd.DataFrame) -> List[Dict[str, Any]]:
        """Clean dataframe and convert to records."""
        # Handle missing values
        df = df.fillna(value="")
        
        # Strip whitespace from string columns
        df_obj = df.select_dtypes(['object'])
        df[df_obj.columns] = df_obj.apply(lambda x: x.str.strip())
        
        return df.to_dict(orient='records')

    def parse(self, file_path_or_buffer: Union[str, IO[Any]]) -> List[Dict[str, Any]]:
        """
        Parse CSV and return a list of dictionaries.
        
        Args:
            file_path_or_buffer: Path to CSV file or file-like object.
            
        Returns:
            List of dictionaries representing the records.
            
        Raises:
            CSVParserError: If parsing fails.
        """
        try:
            encoding = self._detect_encoding(file_path_or_buffer)
            df = self._read_data(file_path_or_buffer, encoding)
            return self._clean_dataframe(df)
        except Exception as e:
            logger.error(f"Error parsing CSV: {str(e)}")
            raise CSVParserError(f"Error parsing CSV: {str(e)}") from e

    def parse_cdr(self, file_path_or_buffer: Union[str, IO[Any]]) -> List[Dict[str, Any]]:
        """
        Parse Call Detail Records (CDR) specifically.
        
        Expected columns: Caller_Number, Receiver_Number, Duration_Sec, Timestamp, Call_Type, Cell_Tower_ID
        
        Args:
            file_path_or_buffer: Path to CSV file or file-like object.
            
        Returns:
            List of dictionaries representing the CDR records.
            
        Raises:
            CSVParserError: If parsing fails or required columns are missing.
        """
        expected_columns = {
            'Caller_Number', 'Receiver_Number', 'Duration_Sec', 
            'Timestamp', 'Call_Type', 'Cell_Tower_ID'
        }
        
        try:
            records = self.parse(file_path_or_buffer)
            if not records:
                return []
                
            # Verify columns exist in the first record
            first_record = records[0]
            missing_cols = expected_columns - set(first_record.keys())
            
            if missing_cols:
                raise CSVParserError(f"Missing required CDR columns: {missing_cols}")
                
            return records
        except Exception as e:
            logger.error(f"Error parsing CDR data: {str(e)}")
            raise CSVParserError(f"Error parsing CDR data: {str(e)}") from e
