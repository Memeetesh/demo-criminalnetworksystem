"""
Upload Routes - Handles file upload and full NLP/graph processing pipeline.
"""
from flask import Blueprint, request, jsonify, current_app
import os
import json
import logging
from datetime import datetime
from werkzeug.utils import secure_filename
from backend.state import state
import uuid

logger = logging.getLogger(__name__)

upload_bp = Blueprint('upload', __name__, url_prefix='/api/upload')


def allowed_file(filename: str) -> bool:
    """Check if the file extension is allowed."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in current_app.config['ALLOWED_EXTENSIONS']


def process_file(filepath: str, filename: str) -> dict:
    """
    Full processing pipeline: parse -> extract entities -> extract patterns ->
    build relationships -> build graph -> run analysis.
    """
    ext = filename.rsplit('.', 1)[1].lower()
    texts = []
    report_dates = []

    # ── Step 1: Parse the file ──────────────────────────────────────────
    if ext == 'json':
        from backend.ingestion.json_parser import JSONParser
        parser = JSONParser()
        data = parser.parse(filepath)

        if isinstance(data, dict) and 'reports' in data:
            for report in data['reports']:
                desc = report.get('description', '')
                location = report.get('location', '')
                suspects = ', '.join(report.get('suspects', []))
                text = f"{desc} Location: {location}. Suspects: {suspects}"
                texts.append({
                    'doc_id': report.get('report_id', str(uuid.uuid4())),
                    'text': text,
                    'date': report.get('date', ''),
                    'type': report.get('type', 'Unknown')
                })
                if report.get('date'):
                    report_dates.append(report['date'])
        elif isinstance(data, list):
            for i, item in enumerate(data):
                text = json.dumps(item) if isinstance(item, dict) else str(item)
                texts.append({'doc_id': f"doc_{i}", 'text': text, 'date': '', 'type': 'Unknown'})
        else:
            texts.append({'doc_id': 'doc_0', 'text': json.dumps(data), 'date': '', 'type': 'Unknown'})

    elif ext == 'csv':
        from backend.ingestion.csv_parser import CSVParser
        parser = CSVParser()
        records = parser.parse(filepath)
        for i, record in enumerate(records):
            text = ' '.join(str(v) for v in record.values() if v)
            texts.append({'doc_id': f"csv_{i}", 'text': text, 'date': '', 'type': 'CSV Record'})

    elif ext == 'pdf':
        from backend.ingestion.pdf_parser import PDFParser
        parser = PDFParser()
        full_text = parser.extract_text(filepath)
        texts.append({'doc_id': 'pdf_0', 'text': full_text, 'date': '', 'type': 'PDF Document'})

    # ── Step 2: Extract entities (NER) ──────────────────────────────────
    from backend.nlp.entity_extractor import EntityExtractor
    extractor = EntityExtractor(model_name=current_app.config.get('NER_MODEL', 'dslim/bert-base-NER'))

    entity_sets = []
    for doc in texts:
        try:
            ner_entities = extractor.extract(doc['text'])
            entity_sets.append({
                'doc_id': doc['doc_id'],
                'entities': ner_entities,
                'date': doc.get('date', ''),
                'type': doc.get('type', 'Unknown')
            })
        except Exception as e:
            logger.warning(f"NER extraction failed for {doc['doc_id']}: {e}")
            entity_sets.append({
                'doc_id': doc['doc_id'],
                'entities': [],
                'date': doc.get('date', ''),
                'type': doc.get('type', 'Unknown')
            })

    # ── Step 3: Extract patterns (regex) ────────────────────────────────
    from backend.nlp.pattern_extractor import PatternExtractor
    pattern_ext = PatternExtractor()

    all_phones = []
    all_vehicles = []
    all_emails = []
    all_money = []
    all_dates = []

    for doc in texts:
        patterns = pattern_ext.extract_all(doc['text'])
        all_phones.extend(patterns.get('phones', []))
        all_vehicles.extend(patterns.get('vehicles', []))
        all_emails.extend(patterns.get('emails', []))
        all_money.extend(patterns.get('money', []))
        all_dates.extend(patterns.get('dates', []))

        # Add pattern entities to the entity set for this document
        doc_id = doc['doc_id']
        matching_set = next((es for es in entity_sets if es['doc_id'] == doc_id), None)
        if matching_set:
            for phone in patterns.get('phones', []):
                matching_set['entities'].append({
                    'entity_type': 'PHONE',
                    'text': phone['normalized'],
                    'confidence': 1.0,
                    'start': -1, 'end': -1
                })
            for vehicle in patterns.get('vehicles', []):
                matching_set['entities'].append({
                    'entity_type': 'VEHICLE',
                    'text': vehicle['normalized'],
                    'confidence': 1.0,
                    'start': -1, 'end': -1
                })
            for email in patterns.get('emails', []):
                matching_set['entities'].append({
                    'entity_type': 'EMAIL',
                    'text': email['raw'],
                    'confidence': 1.0,
                    'start': -1, 'end': -1
                })

    state.pattern_results = {
        'phones': all_phones,
        'vehicles': all_vehicles,
        'emails': all_emails,
        'money': all_money,
        'dates': all_dates
    }

    # ── Step 4: Build relationships ─────────────────────────────────────
    from backend.nlp.relationship_builder import RelationshipBuilder
    rel_builder = RelationshipBuilder()
    relationships = rel_builder.build_relationships(entity_sets)
    entity_registry = rel_builder.get_entity_registry()

    # Store entities with proper structure
    for key, ent_data in entity_registry.items():
        state.entities[key] = {
            'id': key,
            'name': ent_data.get('text', key),
            'label': ent_data.get('text', key),
            'type': ent_data.get('type', 'MISC'),
            'mention_count': ent_data.get('mention_count', 1),
            'first_seen': ent_data.get('first_seen', ''),
            'documents': ent_data.get('documents', [])
        }

    state.relationships = relationships

    # ── Step 5: Build graph ─────────────────────────────────────────────
    from backend.analysis.graph_builder import GraphBuilder
    graph = GraphBuilder.build_from_entities_and_relationships(state.entities, relationships)
    state.graph = graph

    # ── Step 6: Run analysis ────────────────────────────────────────────
    from backend.analysis.centrality import CentralityAnalyzer
    from backend.analysis.community import CommunityDetector

    if graph.number_of_nodes() > 0:
        CentralityAnalyzer.calculate_all(graph)
        CommunityDetector.assign_communities(graph)

        state.analysis_results['centrality'] = CentralityAnalyzer.get_key_players(graph, top_n=20)
        state.analysis_results['communities'] = CommunityDetector.get_community_summary(graph)
        state.analysis_results['bridges'] = CommunityDetector.get_inter_community_bridges(graph)
        state.analysis_results['stats'] = GraphBuilder.get_graph_stats(graph)

    # ── Step 7: Build temporal data ─────────────────────────────────────
    temporal_records = []
    for doc in texts:
        if doc.get('date'):
            for es in entity_sets:
                if es['doc_id'] == doc['doc_id']:
                    for ent in es['entities']:
                        temporal_records.append({
                            'entity': ent['text'],
                            'entity_type': ent['entity_type'],
                            'date': doc['date'],
                            'doc_id': doc['doc_id'],
                            'doc_type': doc.get('type', 'Unknown')
                        })
    state.temporal_data = temporal_records

    return {
        'entities_extracted': len(state.entities),
        'relationships_found': len(relationships),
        'phones_found': len(all_phones),
        'vehicles_found': len(all_vehicles),
        'emails_found': len(all_emails),
        'graph_nodes': graph.number_of_nodes() if graph else 0,
        'graph_edges': graph.number_of_edges() if graph else 0,
        'communities_detected': len(state.analysis_results.get('communities', []))
    }


@upload_bp.route('', methods=['POST'])
def upload_file():
    """Upload and process a crime data file (CSV, JSON, or PDF)."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file part in request'}), 400

    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        filepath = os.path.join(current_app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)

        try:
            summary = process_file(filepath, filename)

            upload_record = {
                'id': str(uuid.uuid4()),
                'filename': filename,
                'timestamp': datetime.now().isoformat(),
                'summary': summary
            }
            state.upload_history.append(upload_record)

            return jsonify({
                'message': 'File uploaded and processed successfully',
                'record': upload_record
            }), 200

        except Exception as e:
            logger.error(f"Processing failed for {filename}: {e}")
            return jsonify({'error': f'Processing failed: {str(e)}'}), 500

    return jsonify({'error': 'File type not allowed. Use CSV, JSON, or PDF.'}), 400


@upload_bp.route('/history', methods=['GET'])
def get_history():
    """Return the upload history."""
    return jsonify(state.upload_history)
