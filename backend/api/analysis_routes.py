"""
Analysis Routes - Centrality, community detection, and network statistics.
"""
from flask import Blueprint, jsonify, request, current_app
from backend.state import state
from backend.analysis.centrality import CentralityAnalyzer
from backend.analysis.community import CommunityDetector
from backend.analysis.graph_builder import GraphBuilder

analysis_bp = Blueprint('analysis', __name__, url_prefix='/api/analysis')


@analysis_bp.route('/centrality', methods=['GET'])
def get_centrality():
    """Return key influencer rankings by combined centrality score."""
    if state.graph is None or state.graph.number_of_nodes() == 0:
        return jsonify([])

    top_n = int(request.args.get('top_n', current_app.config.get('TOP_N_KEY_PLAYERS', 10)))
    key_players = CentralityAnalyzer.get_key_players(state.graph, top_n=top_n)
    return jsonify(key_players)


@analysis_bp.route('/centrality/<metric>', methods=['GET'])
def get_specific_centrality(metric):
    """Return rankings by a specific centrality metric."""
    if state.graph is None or state.graph.number_of_nodes() == 0:
        return jsonify([])

    metric_map = {
        'degree': CentralityAnalyzer.degree_centrality,
        'betweenness': CentralityAnalyzer.betweenness_centrality,
        'pagerank': CentralityAnalyzer.pagerank,
        'eigenvector': CentralityAnalyzer.eigenvector_centrality,
    }

    func = metric_map.get(metric)
    if func is None:
        return jsonify({'error': f'Unknown metric: {metric}. Use: degree, betweenness, pagerank, eigenvector'}), 400

    scores = func(state.graph)
    ranked = sorted(
        [{'id': k, 'label': state.graph.nodes[k].get('label', k), 'type': state.graph.nodes[k].get('type', ''), 'score': v}
         for k, v in scores.items()],
        key=lambda x: x['score'],
        reverse=True
    )
    return jsonify(ranked)


@analysis_bp.route('/communities', methods=['GET'])
def get_communities():
    """Return detected communities with summaries."""
    if state.graph is None or state.graph.number_of_nodes() == 0:
        return jsonify([])

    summary = CommunityDetector.get_community_summary(state.graph)
    return jsonify(summary)


@analysis_bp.route('/summary', methods=['GET'])
def get_summary():
    """Return overall network statistics."""
    if state.graph is None:
        return jsonify({
            'node_count': 0, 'edge_count': 0, 'density': 0.0,
            'connected_components': 0, 'avg_degree': 0.0,
            'community_count': 0, 'total_entities': len(state.entities)
        })

    stats = GraphBuilder.get_graph_stats(state.graph)
    stats['community_count'] = len(state.analysis_results.get('communities', []))
    stats['total_entities'] = len(state.entities)
    stats['total_relationships'] = len(state.relationships)
    return jsonify(stats)


@analysis_bp.route('/bridges', methods=['GET'])
def get_bridges():
    """Return inter-community bridge nodes (potential informants/brokers)."""
    if state.graph is None or state.graph.number_of_nodes() == 0:
        return jsonify([])

    bridges = CommunityDetector.get_inter_community_bridges(state.graph)
    return jsonify(bridges)
