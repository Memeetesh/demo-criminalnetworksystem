"""
Pattern Extractor for Criminal Network Analysis.
Uses regular expressions to extract structured information like phones, vehicles, emails, money, and dates.
"""

import re
from typing import Dict, List, Any
import datetime
from dateutil import parser as date_parser

class PatternExtractor:
    """
    Extracts structured data patterns using regex.
    """

    STATE_CODES = {
        'AP', 'AR', 'AS', 'BR', 'CG', 'CH', 'DD', 'DL', 'DN', 'GA', 'GJ', 'HP', 
        'HR', 'JH', 'JK', 'KA', 'KL', 'LA', 'LD', 'MH', 'ML', 'MN', 'MP', 'MZ', 
        'NL', 'OD', 'PB', 'PY', 'RJ', 'SK', 'TN', 'TR', 'TS', 'UK', 'UP', 'WB'
    }

    # Regex patterns
    PHONE_PATTERN = re.compile(r'(?:(?:\+|00)91[\s.-]?)?(?:0[\s.-]?)?([6-9]\d{4}[\s.-]?\d{5}|[6-9]\d{9}|[1-9]\d{1,3}[\s.-]?\d{6,8})\b')
    VEHICLE_STD_PATTERN = re.compile(r'\b([A-Z]{2}[-\s]?[0-9]{1,2}(?:[-\s]?[A-Z]{1,3})?[-\s]?[0-9]{4})\b')
    VEHICLE_BH_PATTERN = re.compile(r'\b([0-9]{2}[-\s]?BH[-\s]?[0-9]{4}[-\s]?[A-Z]{1,2})\b')
    EMAIL_PATTERN = re.compile(r'\b([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})\b')
    MONEY_PATTERN = re.compile(r'(₹|Rs\.?|INR|USD|\$)\s*([\d,]+(?:\.\d+)?)\b', re.IGNORECASE)
    
    # Simple date formats
    DATE_PATTERN = re.compile(
        r'\b(?:\d{1,2}[/.-]\d{1,2}[/.-]\d{2,4}|'
        r'(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2},?\s+\d{4})\b',
        re.IGNORECASE
    )

    def extract_phones(self, text: str) -> List[Dict[str, str]]:
        """Extract Indian phone numbers."""
        results = []
        for match in self.PHONE_PATTERN.finditer(text):
            raw = match.group(0)
            digits = re.sub(r'\D', '', raw)
            if len(digits) > 10:
                if digits.startswith('91'):
                    digits = digits[2:]
                elif digits.startswith('0'):
                    digits = digits[1:]
            
            phone_type = "MOBILE" if len(digits) == 10 and digits[0] in "6789" else "LANDLINE"
            
            results.append({
                "raw": raw,
                "normalized": digits,
                "type": phone_type
            })
        return results

    def extract_vehicles(self, text: str) -> List[Dict[str, str]]:
        """Extract Indian vehicle registration plates."""
        results = []
        
        # Standard RTO plates
        for match in self.VEHICLE_STD_PATTERN.finditer(text):
            raw = match.group(1)
            normalized = re.sub(r'[-\s]', '', raw).upper()
            state_code = normalized[:2]
            if state_code in self.STATE_CODES:
                results.append({
                    "raw": raw,
                    "normalized": normalized,
                    "plate_type": "STATE_RTO"
                })

        # Bharat series plates
        for match in self.VEHICLE_BH_PATTERN.finditer(text):
            raw = match.group(1)
            normalized = re.sub(r'[-\s]', '', raw).upper()
            results.append({
                "raw": raw,
                "normalized": normalized,
                "plate_type": "BH_SERIES"
            })
            
        return results

    def extract_emails(self, text: str) -> List[Dict[str, str]]:
        """Extract email addresses."""
        results = []
        for match in self.EMAIL_PATTERN.finditer(text):
            raw = match.group(1)
            domain = raw.split('@')[1] if '@' in raw else ""
            results.append({
                "raw": raw,
                "domain": domain
            })
        return results

    def extract_money(self, text: str) -> List[Dict[str, Any]]:
        """Extract money/currency amounts."""
        results = []
        for match in self.MONEY_PATTERN.finditer(text):
            currency = match.group(1).strip().upper()
            amount_str = match.group(2).replace(',', '')
            try:
                amount = float(amount_str)
                results.append({
                    "raw": match.group(0),
                    "amount": amount,
                    "currency": currency
                })
            except ValueError:
                pass
        return results

    def extract_dates(self, text: str) -> List[Dict[str, str]]:
        """Extract dates."""
        results = []
        for match in self.DATE_PATTERN.finditer(text):
            raw = match.group(0)
            try:
                parsed = date_parser.parse(raw, dayfirst=True)
                normalized = parsed.date().isoformat()
                results.append({
                    "raw": raw,
                    "normalized": normalized
                })
            except (ValueError, OverflowError):
                pass
        return results

    def extract_all(self, text: str) -> Dict[str, List[Dict[str, Any]]]:
        """Extract all patterns from text."""
        return {
            "phones": self.extract_phones(text),
            "vehicles": self.extract_vehicles(text),
            "emails": self.extract_emails(text),
            "money": self.extract_money(text),
            "dates": self.extract_dates(text)
        }
