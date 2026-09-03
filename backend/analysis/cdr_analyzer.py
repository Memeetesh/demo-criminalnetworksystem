"""
CDR Analyzer - Analyzes Call Detail Records for communication patterns.
"""
from typing import List, Dict, Any, Tuple
from collections import defaultdict, Counter
import math


class CDRAnalyzer:
    """
    Analyzes CDR records to produce timeline, chord, and summary data.
    """
    
    def __init__(self, records: List[Dict[str, Any]], phone_to_name: Dict[str, str] = None):
        self.records = records
        self.phone_to_name = phone_to_name or {}
    
    def get_label(self, phone: str) -> str:
        """Get display label for a phone number (name if known, else last 4 digits)."""
        return self.phone_to_name.get(phone, f"...{phone[-4:]}" if len(phone) >= 4 else phone)
    
    def get_summary(self) -> Dict[str, Any]:
        """Get aggregate CDR statistics."""
        if not self.records:
            return {'total_records': 0, 'total_calls': 0, 'total_sms': 0,
                    'total_duration_seconds': 0, 'total_duration_display': '0m',
                    'unique_contacts': 0, 'date_range': '', 'peak_hour': 0,
                    'most_active_pair': '', 'most_active_pair_count': 0}
        
        calls = [r for r in self.records if r['type'] == 'CALL']
        sms = [r for r in self.records if r['type'] == 'SMS']
        total_dur = sum(r['duration_seconds'] for r in self.records)
        
        # Unique contacts
        contacts = set()
        for r in self.records:
            contacts.add(r['caller'])
            contacts.add(r['callee'])
        
        # Peak hour
        hour_counts = Counter(r['hour'] for r in self.records)
        peak_hour = hour_counts.most_common(1)[0][0] if hour_counts else 0
        
        # Most active pair
        pair_counts = Counter()
        for r in self.records:
            pair = tuple(sorted([r['caller'], r['callee']]))
            pair_counts[pair] += 1
        top_pair, top_count = pair_counts.most_common(1)[0] if pair_counts else (('', ''), 0)
        
        # Date range
        dates = sorted(r['date'] for r in self.records)
        
        # Duration display
        hours, rem = divmod(total_dur, 3600)
        minutes, _ = divmod(rem, 60)
        dur_display = f"{hours}h {minutes}m" if hours > 0 else f"{minutes}m"
        
        return {
            'total_records': len(self.records),
            'total_calls': len(calls),
            'total_sms': len(sms),
            'total_duration_seconds': total_dur,
            'total_duration_display': dur_display,
            'unique_contacts': len(contacts),
            'date_range': f"{dates[0]} to {dates[-1]}" if dates else '',
            'peak_hour': peak_hour,
            'peak_hour_display': f"{peak_hour:02d}:00-{(peak_hour+1)%24:02d}:00",
            'most_active_pair': f"{self.get_label(top_pair[0])} ↔ {self.get_label(top_pair[1])}",
            'most_active_pair_count': top_count,
            'hour_distribution': dict(hour_counts)
        }
    
    def get_timeline(self) -> Dict[str, Any]:
        """Get timeline data for swim-lane visualization."""
        # Collect unique contacts and assign lane indices
        contacts = []
        seen = set()
        for r in self.records:
            for phone in [r['caller'], r['callee']]:
                if phone not in seen:
                    seen.add(phone)
                    contacts.append({
                        'phone': phone,
                        'label': self.get_label(phone),
                        'lane': len(contacts)
                    })
        
        contact_map = {c['phone']: c for c in contacts}
        
        # Build timeline events
        events = []
        for r in self.records:
            events.append({
                'id': r['id'],
                'caller': r['caller'],
                'callee': r['callee'],
                'caller_label': self.get_label(r['caller']),
                'callee_label': self.get_label(r['callee']),
                'caller_lane': contact_map[r['caller']]['lane'],
                'callee_lane': contact_map[r['callee']]['lane'],
                'timestamp': r['timestamp'],
                'date': r['date'],
                'hour': r['hour'],
                'duration_seconds': r['duration_seconds'],
                'duration_display': r['duration_display'],
                'type': r['type'],
                'cell_tower': r['cell_tower']
            })
        
        return {
            'contacts': contacts,
            'events': events,
            'total_events': len(events)
        }
    
    def get_chord(self) -> Dict[str, Any]:
        """Get chord diagram data showing communication frequency between pairs."""
        # Collect contacts
        contacts = []
        seen = set()
        for r in self.records:
            for phone in [r['caller'], r['callee']]:
                if phone not in seen:
                    seen.add(phone)
                    contacts.append({
                        'phone': phone,
                        'label': self.get_label(phone),
                        'index': len(contacts)
                    })
        
        contact_idx = {c['phone']: c['index'] for c in contacts}
        
        # Build pair matrix
        pair_data = defaultdict(lambda: {'calls': 0, 'sms': 0, 'total_duration': 0})
        for r in self.records:
            pair = tuple(sorted([r['caller'], r['callee']]))
            pair_data[pair]['calls' if r['type'] == 'CALL' else 'sms'] += 1
            pair_data[pair]['total_duration'] += r['duration_seconds']
        
        # Build links
        links = []
        for (p1, p2), data in pair_data.items():
            total = data['calls'] + data['sms']
            links.append({
                'source': contact_idx.get(p1, 0),
                'target': contact_idx.get(p2, 0),
                'source_phone': p1,
                'target_phone': p2,
                'source_label': self.get_label(p1),
                'target_label': self.get_label(p2),
                'calls': data['calls'],
                'sms': data['sms'],
                'total': total,
                'total_duration': data['total_duration'],
                'weight': total  # for arc thickness
            })
        
        # Sort by weight descending
        links.sort(key=lambda x: x['weight'], reverse=True)
        max_weight = links[0]['weight'] if links else 1
        
        return {
            'contacts': contacts,
            'links': links,
            'max_weight': max_weight
        }
