"""
Network Routes - Graph data endpoints for Cytoscape.js visualization.
"""
from flask import Blueprint, jsonify
from backend.state import state
from backend.analysis.graph_builder import GraphBuilder
from backend.analysis.pathfinding import PathFinder

network_bp = Blueprint('network', __name__, url_prefix='/api/network')


@network_bp.route('/graph', methods=['GET'])
def get_graph():
    """Return the full network graph in Cytoscape.js JSON format."""
    if state.graph is None or state.graph.number_of_nodes() == 0:
        return jsonify({'nodes': [], 'edges': []})

    cytoscape_data = GraphBuilder.to_cytoscape_json(state.graph)
    return jsonify(cytoscape_data)


@network_bp.route('/subgraph/<entity_id>', methods=['GET'])
def get_subgraph(entity_id):
    """Return the ego network (2-hop neighborhood) for an entity."""
    if state.graph is None:
        return jsonify({'error': 'No graph available'}), 404

    ego = PathFinder.ego_network(state.graph, entity_id, radius=2)
    if ego.number_of_nodes() == 0:
        return jsonify({'error': f'Entity {entity_id} not found in graph'}), 404

    cytoscape_data = GraphBuilder.to_cytoscape_json(ego)
    return jsonify(cytoscape_data)


@network_bp.route('/path/<source>/<target>', methods=['GET'])
def get_path(source, target):
    """Find the shortest path between two entities."""
    if state.graph is None:
        return jsonify({'error': 'No graph available'}), 404

    result = PathFinder.shortest_path(state.graph, source, target)
    return jsonify(result)


@network_bp.route('/common/<node1>/<node2>', methods=['GET'])
def get_common(node1, node2):
    """Find common associates between two entities."""
    if state.graph is None:
        return jsonify({'error': 'No graph available'}), 404

    common = PathFinder.common_associates(state.graph, node1, node2)
    common_details = []
    for node_id in common:
        if node_id in state.entities:
            common_details.append(state.entities[node_id])
        else:
            common_details.append({'id': node_id, 'name': node_id})

    return jsonify({
        'node1': node1,
        'node2': node2,
        'common_associates': common_details,
        'count': len(common)
    })
