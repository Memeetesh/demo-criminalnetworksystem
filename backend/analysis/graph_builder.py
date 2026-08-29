"""
Graph Builder module for constructing and formatting network graphs.
"""
import networkx as nx
from typing import Dict, List, Any


class GraphBuilder:
    """
    Constructs and manipulates NetworkX graphs from entity and relationship data.
    """

    @staticmethod
    def build_from_entities_and_relationships(entities: Dict[str, Dict[str, Any]], relationships: List[Dict[str, Any]]) -> nx.Graph:
        """
        Builds a NetworkX graph from a dictionary of entities and a list of relationships.
        
        Args:
            entities (Dict[str, Dict]): Dictionary of entities, keyed by entity ID.
            relationships (List[Dict]): List of relationship dictionaries.
            
        Returns:
            nx.Graph: The constructed graph.
        """
        graph = nx.Graph()
        
        for entity_id, entity_data in entities.items():
            graph.add_node(
                entity_id,
                type=entity_data.get('type', 'Unknown'),
                name=entity_data.get('name', entity_data.get('label', str(entity_id))),
                label=entity_data.get('label', entity_data.get('name', str(entity_id))),
                mention_count=entity_data.get('mention_count', 0),
                first_seen=entity_data.get('first_seen', None),
                last_seen=entity_data.get('last_seen', None)
            )
            
        for rel in relationships:
            source = rel.get('source')
            target = rel.get('target')
            if source and target:
                graph.add_edge(
                    source, 
                    target,
                    relationship_type=rel.get('relationship_type', 'related_to'),
                    weight=rel.get('weight', 1.0),
                    source_documents=rel.get('source_documents', [])
                )
                
        return graph

    @staticmethod
    def to_cytoscape_json(graph: nx.Graph) -> Dict[str, List[Dict[str, Any]]]:
        """
        Converts a NetworkX graph to Cytoscape.js JSON format.
        
        Args:
            graph (nx.Graph): The graph to convert.
            
        Returns:
            Dict: Cytoscape.js formatted dictionary with 'nodes' and 'edges'.
        """
        cytoscape_data: Dict[str, List[Dict[str, Any]]] = {'nodes': [], 'edges': []}
        
        for node_id, data in graph.nodes(data=True):
            node_data = {
                'id': str(node_id),
                'label': data.get('label', str(node_id)),
                'type': data.get('type', 'Unknown'),
                'degree_centrality': data.get('degree_centrality', 0.0),
                'betweenness_centrality': data.get('betweenness_centrality', 0.0),
                'pagerank': data.get('pagerank', 0.0),
                'community': data.get('community', -1),
                'mention_count': data.get('mention_count', 0)
            }
            cytoscape_data['nodes'].append({'data': node_data})
            
        for u, v, data in graph.edges(data=True):
            edge_id = f"{u}_{v}"
            edge_data = {
                'id': edge_id,
                'source': str(u),
                'target': str(v),
                'label': data.get('relationship_type', ''),
                'weight': data.get('weight', 1.0),
                'relationship_type': data.get('relationship_type', 'related_to')
            }
            cytoscape_data['edges'].append({'data': edge_data})
            
        return cytoscape_data

    @staticmethod
    def get_graph_stats(graph: nx.Graph) -> Dict[str, Any]:
        """
        Calculates general statistics for the given graph.
        
        Args:
            graph (nx.Graph): The graph to analyze.
            
        Returns:
            Dict: Dictionary containing graph statistics.
        """
        node_count = graph.number_of_nodes()
        edge_count = graph.number_of_edges()
        
        if node_count == 0:
            return {
                'node_count': 0,
                'edge_count': 0,
                'density': 0.0,
                'connected_components': 0,
                'avg_degree': 0.0
            }
            
        density = nx.density(graph)
        components = nx.number_connected_components(graph)
        degrees = [d for n, d in graph.degree()]
        avg_degree = sum(degrees) / node_count if node_count > 0 else 0
        
        return {
            'node_count': node_count,
            'edge_count': edge_count,
            'density': density,
            'connected_components': components,
            'avg_degree': avg_degree
        }
