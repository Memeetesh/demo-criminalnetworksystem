"""
JSON Parser module for data ingestion.
"""
import json
import logging
import os
from typing import List, Dict, Union, Any, Optional

logger = logging.getLogger(__name__)

class JSONParserError(Exception):
    """Base exception for JSON parser errors."""
    pass

class JSONParser:
    """
    Parser for JSON files and strings.
    """

    def __init__(self):
        pass

    def _flatten_dict(self, d: Dict[str, Any], parent_key: str = '', sep: str = '_') -> Dict[str, Any]:
        """Flatten a nested dictionary."""
        items: List[tuple] = []
        for k, v in d.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, dict):
                items.extend(self._flatten_dict(v, new_key, sep=sep).items())
            else:
                items.append((new_key, v))
        return dict(items)

    def parse(self, file_path_or_string: str, flatten: bool = False) -> Union[Dict[str, Any], List[Dict[str, Any]]]:
        """
        Parse JSON file or string.
        
        Args:
            file_path_or_string: Path to JSON file or a JSON string.
            flatten: Whether to flatten nested structures.
            
        Returns:
            Parsed JSON data (dict or list of dicts).
            
        Raises:
            JSONParserError: If parsing fails.
        """
        try:
            # Check if it's a file path
            if os.path.exists(file_path_or_string) and os.path.isfile(file_path_or_string):
                with open(file_path_or_string, 'r', encoding='utf-8') as f:
                    data = json.load(f)
            else:
                # Treat as string
                data = json.loads(file_path_or_string)
                
            if flatten:
                if isinstance(data, list):
                    return [self._flatten_dict(item) if isinstance(item, dict) else item for item in data]
                elif isinstance(data, dict):
                    return self._flatten_dict(data)
                    
            return data
        except json.JSONDecodeError as e:
            logger.error(f"JSON decode error: {str(e)}")
            raise JSONParserError(f"Invalid JSON data: {str(e)}") from e
        except Exception as e:
            logger.error(f"Error parsing JSON: {str(e)}")
            raise JSONParserError(f"Error parsing JSON: {str(e)}") from e

    def parse_crime_reports(self, data: Union[str, Dict, List]) -> List[Dict[str, Any]]:
        """
        Parse JSON specifically to extract standardized crime reports.
        
        Args:
            data: JSON string, file path, or already parsed data (dict/list).
            
        Returns:
            List of standardized crime report records.
            
        Raises:
            JSONParserError: If parsing or validation fails.
        """
        try:
            if isinstance(data, str):
                parsed_data = self.parse(data, flatten=False)
            else:
                parsed_data = data
                
            reports = []
            
            # Normalize to list
            if isinstance(parsed_data, dict):
                # Maybe it's wrapped in a key like 'reports' or 'data'
                if 'reports' in parsed_data and isinstance(parsed_data['reports'], list):
                    reports_raw = parsed_data['reports']
                elif 'data' in parsed_data and isinstance(parsed_data['data'], list):
                    reports_raw = parsed_data['data']
                else:
                    reports_raw = [parsed_data]
            elif isinstance(parsed_data, list):
                reports_raw = parsed_data
            else:
                raise JSONParserError(f"Unexpected data type for crime reports: {type(parsed_data)}")
                
            standardized_reports = []
            for item in reports_raw:
                if not isinstance(item, dict):
                    continue
                    
                flat_item = self._flatten_dict(item)
                
                # Standardize keys (example mapping)
                report = {
                    'Report_ID': flat_item.get('id') or flat_item.get('report_id') or '',
                    'Date': flat_item.get('date') or flat_item.get('timestamp') or '',
                    'Type': flat_item.get('type') or flat_item.get('crime_type') or '',
                    'Location': flat_item.get('location') or flat_item.get('address') or '',
                    'Description': flat_item.get('description') or flat_item.get('details') or ''
                }
                standardized_reports.append(report)
                
            return standardized_reports
            
        except Exception as e:
            logger.error(f"Error extracting crime reports: {str(e)}")
            raise JSONParserError(f"Error extracting crime reports: {str(e)}") from e
