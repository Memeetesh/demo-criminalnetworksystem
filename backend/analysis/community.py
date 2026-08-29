"""
Community Detection module for clustering network nodes.
"""
import networkx as nx
from networkx.algorithms.community import louvain_communities, modularity
from typing import Dict, List, Set, Any


class CommunityDetector:
    """
    Detects and analyzes communities within NetworkX graphs.
    """

    @staticmethod
    def detect_communities(graph: nx.Graph, resolution: float = 1.0) -> Dict[str, Any]:
        """
        Detects communities using the Louvain method.
        
        Args:
            graph (nx.Graph): The network graph.
            resolution (float): Resolution parameter for Louvain algorithm.
            
        Returns:
            Dict: Information about detected communities including mapping and modularity.
        """
        if len(graph) == 0:
            return {
                'communities': [],
                'community_mapping': {},
                'modularity_score': 0.0,
                'community_count': 0
            }
            
        # Ensure graph has edges
        if graph.number_of_edges() == 0:
            communities = [{n} for n in graph.nodes()]
            return {
                'communities': communities,
                'community_mapping': {n: i for i, n in enumerate(graph.nodes())},
                'modularity_score': 0.0,
                'community_count': len(communities)
            }
            
        communities = list(louvain_communities(graph, weight='weight', resolution=resolution))
        
        community_mapping = {}
        for i, comm in enumerate(communities):
            for node in comm:
                community_mapping[node] = i
                
        mod_score = modularity(graph, communities, weight='weight')
        
        return {
            'communities': communities,
            'community_mapping': community_mapping,
            'modularity_score': mod_score,
            'community_count': len(communities)
        }

    @classmethod
    def assign_communities(cls, graph: nx.Graph, resolution: float = 1.0) -> nx.Graph:
        """
        Detects communities and assigns the community ID as a node attribute.
        
        Args:
            graph (nx.Graph): The network graph.
            resolution (float): Resolution parameter for Louvain algorithm.
            
        Returns:
            nx.Graph: The graph with 'community' attributes added to nodes.
        """
        result = cls.detect_communities(graph, resolution=resolution)
        mapping = result.get('community_mapping', {})
        
        for node, comm_id in mapping.items():
            graph.nodes[node]['community'] = comm_id
            
        return graph

    @classmethod
    def get_inter_community_bridges(cls, graph: nx.Graph) -> List[Dict[str, Any]]:
        """
        Identifies nodes that connect different communities.
        Assumes communities have already been assigned to the graph.
        
        Args:
            graph (nx.Graph): The network graph with 'community' attributes.
            
        Returns:
            List[Dict]: List of nodes acting as bridges between communities.
        """
        # Ensure communities exist
        if not any('community' in data for _, data in graph.nodes(data=True)):
            cls.assign_communities(graph)
            
        bridges = []
        for node in graph.nodes():
            node_comm = graph.nodes[node].get('community')
            connected_comms = set()
            
            for neighbor in graph.neighbors(node):
                neighbor_comm = graph.nodes[neighbor].get('community')
                if neighbor_comm is not None and neighbor_comm != node_comm:
                    connected_comms.add(neighbor_comm)
                    
            if len(connected_comms) > 0:
                bridges.append({
                    'node': str(node),
                    'label': graph.nodes[node].get('label', str(node)),
                    'home_community': node_comm,
                    'connected_communities': list(connected_comms),
                    'bridge_score': len(connected_comms)
                })
                
        bridges.sort(key=lambda x: x['bridge_score'], reverse=True)
        return bridges

    @classmethod
    def get_community_summary(cls, graph: nx.Graph) -> List[Dict[str, Any]]:
        """
        Provides a summary of each community in the graph.
        
        Args:
            graph (nx.Graph): The network graph.
            
        Returns:
            List[Dict]: List of community summaries.
        """
        # Ensure communities are assigned
        if not any('community' in data for _, data in graph.nodes(data=True)):
            cls.assign_communities(graph)
            
        communities_map: Dict[int, Set[Any]] = {}
        for node, data in graph.nodes(data=True):
            c = data.get('community')
            if c is not None:
                if c not in communities_map:
                    communities_map[c] = set()
                communities_map[c].add(node)
                
        summary = []
        for comm_id, members in communities_map.items():
            subgraph = graph.subgraph(members)
            internal_edges = subgraph.number_of_edges()
            
            # Find key members based on degree within the community
            degrees = dict(subgraph.degree())
            sorted_members = sorted(degrees.items(), key=lambda x: x[1], reverse=True)
            key_members = [
                {'node': str(n), 'label': graph.nodes[n].get('label', str(n)), 'internal_degree': d}
                for n, d in sorted_members[:5]
            ]
            
            summary.append({
                'community_id': comm_id,
                'member_count': len(members),
                'key_members': key_members,
                'internal_edge_count': internal_edges
            })
            
        summary.sort(key=lambda x: x['member_count'], reverse=True)
        return summary
