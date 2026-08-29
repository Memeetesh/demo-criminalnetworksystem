"""
Temporal Analysis module for evaluating activity patterns over time.
"""
import numpy as np
from scipy import stats
from typing import Dict, List, Any


class TemporalAnalyzer:
    """
    Analyzes temporal patterns and activities for entities.
    """

    @staticmethod
    def build_timeline(records: List[Dict[str, Any]], entity_field: str, time_field: str) -> Dict[str, Dict[str, int]]:
        """
        Builds activity timelines per entity from a list of records.
        
        Args:
            records (List[Dict]): List of activity records.
            entity_field (str): The field containing the entity ID.
            time_field (str): The field containing the time unit (e.g., date, timestamp, day, month).
            
        Returns:
            Dict: Dictionary mapping entity IDs to a timeline of counts {time: count}.
        """
        timelines: Dict[str, Dict[str, int]] = {}
        
        for record in records:
            entity = record.get(entity_field)
            time_val = record.get(time_field)
            
            if entity is None or time_val is None:
                continue
                
            entity = str(entity)
            time_val = str(time_val)
            
            if entity not in timelines:
                timelines[entity] = {}
                
            if time_val not in timelines[entity]:
                timelines[entity][time_val] = 0
                
            timelines[entity][time_val] += 1
            
        return timelines

    @staticmethod
    def detect_spikes(timeline: Dict[str, int], method: str = 'zscore', threshold: float = 2.0) -> List[Dict[str, Any]]:
        """
        Detects unusual activity spikes in a timeline.
        
        Args:
            timeline (Dict[str, int]): Timeline mapping time string to activity count.
            method (str): Statistical method to use ('zscore' or 'iqr').
            threshold (float): Threshold for identifying a spike.
            
        Returns:
            List[Dict]: List of identified spikes with time and severity.
        """
        if not timeline or len(timeline) < 3:
            return []
            
        # Sort chronologically or lexically
        times = sorted(timeline.keys())
        counts = np.array([timeline[t] for t in times], dtype=float)
        
        spikes = []
        
        if method == 'zscore':
            mean = np.mean(counts)
            std = np.std(counts)
            
            if std == 0:
                return []
                
            z_scores = (counts - mean) / std
            
            for i, z in enumerate(z_scores):
                if z >= threshold:
                    spikes.append({
                        'time': times[i],
                        'count': counts[i],
                        'score': float(z),
                        'method': 'zscore'
                    })
                    
        elif method == 'iqr':
            q1 = np.percentile(counts, 25)
            q3 = np.percentile(counts, 75)
            iqr = q3 - q1
            upper_bound = q3 + (threshold * iqr)
            
            for i, count in enumerate(counts):
                if count >= upper_bound:
                    spikes.append({
                        'time': times[i],
                        'count': float(count),
                        'score': float((count - q3) / iqr) if iqr > 0 else float(count),
                        'method': 'iqr'
                    })
                    
        return spikes

    @staticmethod
    def find_correlated_activities(timelines: Dict[str, Dict[str, int]], min_correlation: float = 0.7) -> List[Dict[str, Any]]:
        """
        Finds pairs of entities with highly correlated activity patterns.
        
        Args:
            timelines (Dict[str, Dict[str, int]]): Timelines for multiple entities.
            min_correlation (float): Minimum Pearson correlation coefficient to consider.
            
        Returns:
            List[Dict]: List of highly correlated pairs.
        """
        if len(timelines) < 2:
            return []
            
        # Collect all unique time periods across all timelines
        all_times = set()
        for t_dict in timelines.values():
            all_times.update(t_dict.keys())
            
        sorted_times = sorted(list(all_times))
        
        # Build dense arrays for each entity
        entities = list(timelines.keys())
        arrays = []
        for entity in entities:
            arr = np.array([timelines[entity].get(t, 0) for t in sorted_times], dtype=float)
            arrays.append(arr)
            
        correlations = []
        n = len(entities)
        
        for i in range(n):
            for j in range(i + 1, n):
                arr1, arr2 = arrays[i], arrays[j]
                
                # Check for standard deviation to avoid warnings
                if np.std(arr1) == 0 or np.std(arr2) == 0:
                    continue
                    
                r, _ = stats.pearsonr(arr1, arr2)
                
                if r >= min_correlation:
                    correlations.append({
                        'entity1': entities[i],
                        'entity2': entities[j],
                        'correlation': float(r)
                    })
                    
        correlations.sort(key=lambda x: x['correlation'], reverse=True)
        return correlations

    @staticmethod
    def get_activity_summary(timelines: Dict[str, Dict[str, int]]) -> List[Dict[str, Any]]:
        """
        Calculates summary statistics for each entity's timeline.
        
        Args:
            timelines (Dict[str, Dict[str, int]]): Timelines for multiple entities.
            
        Returns:
            List[Dict]: List of summary statistics per entity.
        """
        summaries = []
        
        for entity, timeline in timelines.items():
            if not timeline:
                summaries.append({
                    'entity': entity,
                    'total_activity': 0,
                    'peak_period': None,
                    'avg_activity': 0.0,
                    'active_periods': 0
                })
                continue
                
            counts = list(timeline.values())
            total = sum(counts)
            peak_time = max(timeline.items(), key=lambda x: x[1])[0]
            
            summaries.append({
                'entity': entity,
                'total_activity': total,
                'peak_period': peak_time,
                'avg_activity': float(np.mean(counts)),
                'active_periods': len(counts)
            })
            
        summaries.sort(key=lambda x: x['total_activity'], reverse=True)
        return summaries
