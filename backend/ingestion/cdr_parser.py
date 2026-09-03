"""
CDR (Call Detail Records) Parser.
Parses CSV files containing call/SMS records.
"""
import csv
import logging
from typing import List, Dict, Any
from datetime import datetime

logger = logging.getLogger(__name__)


class CDRParser:
    """
    Parses CDR CSV files into structured records.
    Expected columns: caller, callee, timestamp, duration_seconds, type, cell_tower
    """
    
    REQUIRED_COLUMNS = {'caller', 'callee', 'timestamp'}
    OPTIONAL_COLUMNS = {'duration_seconds', 'type', 'cell_tower'}
    
    def parse(self, filepath: str) -> List[Dict[str, Any]]:
        """Parse a CDR CSV file and return structured records."""
        records = []
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                
                # Validate columns
                if reader.fieldnames is None:
                    raise ValueError("Empty CSV file")
                
                headers = set(h.strip().lower() for h in reader.fieldnames)
                missing = self.REQUIRED_COLUMNS - headers
                if missing:
                    raise ValueError(f"Missing required columns: {missing}")
                
                for i, row in enumerate(reader):
                    try:
                        record = self._parse_row(row, i)
                        if record:
                            records.append(record)
                    except Exception as e:
                        logger.warning(f"Skipping row {i}: {e}")
            
            # Sort by timestamp
            records.sort(key=lambda r: r['timestamp'])
            logger.info(f"Parsed {len(records)} CDR records from {filepath}")
            
        except Exception as e:
            logger.error(f"Failed to parse CDR file {filepath}: {e}")
            raise
        
        return records
    
    def _parse_row(self, row: dict, index: int) -> Dict[str, Any]:
        """Parse a single CDR row."""
        # Normalize keys
        row = {k.strip().lower(): v.strip() for k, v in row.items()}
        
        caller = self._normalize_phone(row.get('caller', ''))
        callee = self._normalize_phone(row.get('callee', ''))
        
        if not caller or not callee:
            return None
        
        # Parse timestamp
        ts_str = row.get('timestamp', '')
        try:
            timestamp = datetime.strptime(ts_str, '%Y-%m-%d %H:%M:%S')
        except ValueError:
            try:
                timestamp = datetime.strptime(ts_str, '%Y-%m-%d')
            except ValueError:
                raise ValueError(f"Cannot parse timestamp: {ts_str}")
        
        # Duration
        try:
            duration = int(row.get('duration_seconds', 0))
        except (ValueError, TypeError):
            duration = 0
        
        comm_type = row.get('type', 'CALL').upper()
        if comm_type not in ('CALL', 'SMS', 'MMS'):
            comm_type = 'CALL'
        
        return {
            'id': index,
            'caller': caller,
            'callee': callee,
            'timestamp': timestamp.isoformat(),
            'timestamp_epoch': timestamp.timestamp(),
            'duration_seconds': duration,
            'duration_display': self._format_duration(duration),
            'type': comm_type,
            'cell_tower': row.get('cell_tower', 'Unknown'),
            'date': timestamp.date().isoformat(),
            'hour': timestamp.hour
        }
    
    @staticmethod
    def _normalize_phone(phone: str) -> str:
        """Normalize phone number by stripping country code and non-digits."""
        import re
        digits = re.sub(r'\D', '', phone)
        if len(digits) > 10:
            if digits.startswith('91'):
                digits = digits[2:]
            elif digits.startswith('0'):
                digits = digits[1:]
        return digits if len(digits) >= 10 else phone
    
    @staticmethod
    def _format_duration(seconds: int) -> str:
        """Format duration in seconds to human readable string."""
        if seconds == 0:
            return '-'
        minutes, secs = divmod(seconds, 60)
        if minutes > 0:
            return f"{minutes}m {secs}s"
        return f"{secs}s"
