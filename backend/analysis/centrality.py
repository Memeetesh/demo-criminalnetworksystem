"""
Centrality Analysis module for computing key player metrics.
"""
import networkx as nx
from typing import Dict, List, Any


class CentralityAnalyzer:
    """
    Computes centrality metrics for NetworkX graphs.
    """

    @staticmethod
    def degree_centrality(graph: nx.Graph) -> Dict[str, float]:
        """
        Computes degree centrality for nodes.
        
        Args:
            graph (nx.Graph): The network graph.
            
        Returns:
            Dict[str, float]: Dictionary mapping node ID to degree centrality score.
        """
        if len(graph) == 0:
            return {}
        return nx.degree_centrality(graph)

    @staticmethod
    def betweenness_centrality(graph: nx.Graph) -> Dict[str, float]:
        """
        Computes weighted betweenness centrality for nodes.
        
        Args:
            graph (nx.Graph): The network graph.
            
        Returns:
            Dict[str, float]: Dictionary mapping node ID to betweenness centrality score.
        """
        if len(graph) == 0:
            return {}
        return nx.betweenness_centrality(graph, weight='weight')

    @staticmethod
    def pagerank(graph: nx.Graph, alpha: float = 0.85) -> Dict[str, float]:
        """
        Computes weighted PageRank for nodes.
        
        Args:
            graph (nx.Graph): The network graph.
            alpha (float): Damping parameter.
            
        Returns:
            Dict[str, float]: Dictionary mapping node ID to PageRank score.
        """
        if len(graph) == 0:
            return {}
        try:
            return nx.pagerank(graph, alpha=alpha, weight='weight')
        except nx.NetworkXError:
            return {n: 0.0 for n in graph.nodes()}

    @staticmethod
    def eigenvector_centrality(graph: nx.Graph) -> Dict[str, float]:
        """
        Computes eigenvector centrality for nodes.
        
        Args:
            graph (nx.Graph): The network graph.
            
        Returns:
            Dict[str, float]: Dictionary mapping node ID to eigenvector centrality score.
        """
        if len(graph) == 0:
            return {}
        try:
            return nx.eigenvector_centrality(graph, weight='weight', max_iter=1000)
        except nx.NetworkXError:
            # Fallback if it fails to converge
            return {n: 0.0 for n in graph.nodes()}

    @classmethod
    def get_key_players(cls, graph: nx.Graph, top_n: int = 10) -> List[Dict[str, Any]]:
        """
        Identifies key players based on a combined centrality score.
        
        Args:
            graph (nx.Graph): The network graph.
            top_n (int): Number of top players to return.
            
        Returns:
            List[Dict]: List of dictionaries containing node info and combined centrality score.
        """
        if len(graph) == 0:
            return []
            
        dc = cls.degree_centrality(graph)
        bc = cls.betweenness_centrality(graph)
        pr = cls.pagerank(graph)
        
        key_players = []
        for node in graph.nodes():
            # Simple combined score: average of the three metrics
            # (assuming they are roughly in [0, 1] scale)
            combined = (dc.get(node, 0.0) + bc.get(node, 0.0) + pr.get(node, 0.0)) / 3.0
            
            node_data = graph.nodes[node]
            key_players.append({
                'id': str(node),
                'label': node_data.get('label', str(node)),
                'type': node_data.get('type', 'Unknown'),
                'degree_centrality': dc.get(node, 0.0),
                'betweenness_centrality': bc.get(node, 0.0),
                'pagerank': pr.get(node, 0.0),
                'combined_score': combined
            })
            
        key_players.sort(key=lambda x: x['combined_score'], reverse=True)
        return key_players[:top_n]

    @classmethod
    def calculate_all(cls, graph: nx.Graph) -> Dict[str, Dict[str, float]]:
        """
        Computes all centrality metrics and attaches them as node attributes.
        
        Args:
            graph (nx.Graph): The network graph.
            
        Returns:
            Dict: Dictionary mapping node IDs to their centrality metrics.
        """
        if len(graph) == 0:
            return {}
            
        dc = cls.degree_centrality(graph)
        bc = cls.betweenness_centrality(graph)
        pr = cls.pagerank(graph)
        ec = cls.eigenvector_centrality(graph)
        
        results = {}
        for node in graph.nodes():
            metrics = {
                'degree_centrality': dc.get(node, 0.0),
                'betweenness_centrality': bc.get(node, 0.0),
                'pagerank': pr.get(node, 0.0),
                'eigenvector_centrality': ec.get(node, 0.0)
            }
            results[node] = metrics
            
            # Attach to graph
            for key, val in metrics.items():
                graph.nodes[node][key] = val
                
        return results
