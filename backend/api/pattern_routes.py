"""
Pattern Routes - Temporal anomalies, suspicious patterns, and extracted structured data.
"""
from flask import Blueprint, jsonify
from backend.state import state
from backend.analysis.centrality import CentralityAnalyzer
from backend.analysis.community import CommunityDetector

pattern_bp = Blueprint('patterns', __name__, url_prefix='/api/patterns')


@pattern_bp.route('/temporal', methods=['GET'])
def get_temporal():
    """Return temporal activity data for entities."""
    return jsonify(state.temporal_data)


@pattern_bp.route('/suspicious', methods=['GET'])
def get_suspicious():
    """
    Return flagged suspicious patterns.
    Combines high centrality nodes + inter-community bridges + temporal activity.
    """
    suspicious = []

    if state.graph is not None and state.graph.number_of_nodes() > 0:
        # Get key players (high centrality)
        key_players = CentralityAnalyzer.get_key_players(state.graph, top_n=10)
        for player in key_players:
            player['flags'] = ['HIGH_CENTRALITY']
            player['risk_score'] = player.get('combined_score', 0.0)

        # Get bridge nodes
        bridges = CommunityDetector.get_inter_community_bridges(state.graph)
        bridge_ids = {b['node'] for b in bridges}

        # Merge flags
        for player in key_players:
            if player['id'] in bridge_ids:
                player['flags'].append('INTER_COMMUNITY_BRIDGE')
                player['risk_score'] += 0.2  # Boost risk for bridges

            # Check temporal activity
            entity_activity = [t for t in state.temporal_data if t.get('entity', '').lower() == player['id']]
            if len(entity_activity) > 3:
                player['flags'].append('HIGH_ACTIVITY')
                player['risk_score'] += 0.1

            suspicious.append(player)

        suspicious.sort(key=lambda x: x['risk_score'], reverse=True)

    return jsonify(suspicious)


@pattern_bp.route('/phones', methods=['GET'])
def get_phones():
    """Return all extracted phone numbers."""
    return jsonify(state.pattern_results.get('phones', []))


@pattern_bp.route('/vehicles', methods=['GET'])
def get_vehicles():
    """Return all extracted vehicle registration plates."""
    return jsonify(state.pattern_results.get('vehicles', []))


@pattern_bp.route('/emails', methods=['GET'])
def get_emails():
    """Return all extracted email addresses."""
    return jsonify(state.pattern_results.get('emails', []))


@pattern_bp.route('/money', methods=['GET'])
def get_money():
    """Return all extracted money/currency amounts."""
    return jsonify(state.pattern_results.get('money', []))
