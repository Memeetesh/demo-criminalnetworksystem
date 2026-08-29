"""
Pathfinding module for discovering connections between nodes.
"""
import networkx as nx
from typing import Dict, List, Any


class PathFinder:
    """
    Provides pathfinding and neighborhood analysis methods for graphs.
    """

    @staticmethod
    def shortest_path(graph: nx.Graph, source: str, target: str) -> Dict[str, Any]:
        """
        Finds the shortest path between two nodes.
        
        Args:
            graph (nx.Graph): The network graph.
            source (str): Source node ID.
            target (str): Target node ID.
            
        Returns:
            Dict: Path nodes, edges, and hop count.
        """
        if source not in graph or target not in graph:
            return {'path_nodes': [], 'path_edges': [], 'hop_count': -1, 'error': 'Source or target not in graph'}
            
        try:
            path_nodes = nx.shortest_path(graph, source=source, target=target, weight=None)
            path_edges = []
            for i in range(len(path_nodes) - 1):
                u, v = path_nodes[i], path_nodes[i+1]
                edge_data = graph.get_edge_data(u, v)
                path_edges.append({
                    'source': str(u),
                    'target': str(v),
                    'relationship_type': edge_data.get('relationship_type', 'related_to'),
                    'weight': edge_data.get('weight', 1.0)
                })
                
            return {
                'path_nodes': [str(n) for n in path_nodes],
                'path_edges': path_edges,
                'hop_count': len(path_nodes) - 1
            }
        except nx.NetworkXNoPath:
            return {'path_nodes': [], 'path_edges': [], 'hop_count': -1, 'error': 'No path exists between nodes'}

    @staticmethod
    def all_simple_paths(graph: nx.Graph, source: str, target: str, max_depth: int = 5) -> List[List[str]]:
        """
        Finds all simple paths between two nodes up to a certain depth.
        
        Args:
            graph (nx.Graph): The network graph.
            source (str): Source node ID.
            target (str): Target node ID.
            max_depth (int): Maximum path length.
            
        Returns:
            List[List[str]]: List of paths, where each path is a list of node IDs.
        """
        if source not in graph or target not in graph:
            return []
            
        try:
            paths = nx.all_simple_paths(graph, source=source, target=target, cutoff=max_depth)
            return [[str(n) for n in path] for path in paths]
        except nx.NetworkXNoPath:
            return []
        except Exception:
            return []

    @staticmethod
    def common_associates(graph: nx.Graph, node1: str, node2: str) -> List[str]:
        """
        Finds common neighbors (associates) between two nodes.
        
        Args:
            graph (nx.Graph): The network graph.
            node1 (str): First node ID.
            node2 (str): Second node ID.
            
        Returns:
            List[str]: List of common neighbor node IDs.
        """
        if node1 not in graph or node2 not in graph:
            return []
            
        neighbors1 = set(graph.neighbors(node1))
        neighbors2 = set(graph.neighbors(node2))
        
        return [str(n) for n in neighbors1.intersection(neighbors2)]

    @staticmethod
    def degrees_of_separation(graph: nx.Graph, source: str, target: str) -> int:
        """
        Calculates the degrees of separation (shortest path length) between two nodes.
        
        Args:
            graph (nx.Graph): The network graph.
            source (str): Source node ID.
            target (str): Target node ID.
            
        Returns:
            int: Number of hops between nodes, or -1 if disconnected or missing.
        """
        if source not in graph or target not in graph:
            return -1
            
        try:
            return nx.shortest_path_length(graph, source=source, target=target)
        except nx.NetworkXNoPath:
            return -1

    @staticmethod
    def ego_network(graph: nx.Graph, node_id: str, radius: int = 2) -> nx.Graph:
        """
        Extracts the ego network (neighborhood up to radius) for a specific node.
        
        Args:
            graph (nx.Graph): The network graph.
            node_id (str): The focal node ID.
            radius (int): Maximum depth to include.
            
        Returns:
            nx.Graph: Subgraph representing the ego network.
        """
        if node_id not in graph:
            return nx.Graph()
            
        ego_nodes = set(nx.single_source_shortest_path_length(graph, node_id, cutoff=radius).keys())
        return graph.subgraph(ego_nodes).copy()
