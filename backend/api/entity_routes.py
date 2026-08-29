"""
Entity Routes - Query and search extracted entities.
"""
from flask import Blueprint, request, jsonify
from backend.state import state

entity_bp = Blueprint('entities', __name__, url_prefix='/api/entities')


@entity_bp.route('', methods=['GET'])
def get_entities():
    """
    List all extracted entities with optional filtering.
    Query params: type (PER/LOC/ORG/MISC/PHONE/VEHICLE/EMAIL), limit, offset
    """
    entity_type = request.args.get('type')
    limit = int(request.args.get('limit', 100))
    offset = int(request.args.get('offset', 0))

    entities_list = list(state.entities.values())

    if entity_type:
        entities_list = [e for e in entities_list if e.get('type', '').upper() == entity_type.upper()]

    total = len(entities_list)
    paginated = entities_list[offset:offset + limit]

    return jsonify({
        'total': total,
        'limit': limit,
        'offset': offset,
        'entities': paginated
    })


@entity_bp.route('/search', methods=['GET'])
def search_entities():
    """Search entities by name (case-insensitive substring match)."""
    query = request.args.get('q', '').lower().strip()
    if not query:
        return jsonify({'results': [], 'query': '', 'count': 0})

    results = []
    for eid, e in state.entities.items():
        name = e.get('name', e.get('label', '')).lower()
        if query in name:
            results.append(e)

    return jsonify({
        'results': results,
        'query': query,
        'count': len(results)
    })


@entity_bp.route('/<entity_id>', methods=['GET'])
def get_entity(entity_id):
    """Get a single entity with all metadata and its connections."""
    entity = state.entities.get(entity_id)
    if not entity:
        return jsonify({'error': f'Entity {entity_id} not found'}), 404

    # Find all connections for this entity
    connections = []
    for rel in state.relationships:
        if rel.get('source') == entity_id:
            connected_id = rel.get('target')
            connected_entity = state.entities.get(connected_id, {'id': connected_id, 'name': connected_id})
            connections.append({
                'entity': connected_entity,
                'relationship': rel.get('relationship_type', 'UNKNOWN'),
                'weight': rel.get('weight', 1),
                'direction': 'outgoing'
            })
        elif rel.get('target') == entity_id:
            connected_id = rel.get('source')
            connected_entity = state.entities.get(connected_id, {'id': connected_id, 'name': connected_id})
            connections.append({
                'entity': connected_entity,
                'relationship': rel.get('relationship_type', 'UNKNOWN'),
                'weight': rel.get('weight', 1),
                'direction': 'incoming'
            })

    # Get centrality info if graph exists
    centrality_info = {}
    if state.graph is not None and entity_id in state.graph:
        node_data = state.graph.nodes[entity_id]
        centrality_info = {
            'degree_centrality': node_data.get('degree_centrality', 0.0),
            'betweenness_centrality': node_data.get('betweenness_centrality', 0.0),
            'pagerank': node_data.get('pagerank', 0.0),
            'community': node_data.get('community', -1)
        }

    return jsonify({
        'entity': entity,
        'connections': connections,
        'connection_count': len(connections),
        'centrality': centrality_info
    })
