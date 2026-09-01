from flask import Flask, jsonify, send_from_directory
from flask_cors import CORS
import os
from config import Config

def create_app():
    dist_folder = os.path.join(os.path.dirname(__file__), 'frontend', 'dist')
    static_folder = dist_folder if os.path.exists(dist_folder) else os.path.join(os.path.dirname(__file__), 'frontend')

    app = Flask(__name__, static_folder=static_folder, static_url_path='/')
    app.config.from_object(Config)
    CORS(app)

    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

    from backend.api.upload_routes import upload_bp
    from backend.api.entity_routes import entity_bp
    from backend.api.network_routes import network_bp
    from backend.api.analysis_routes import analysis_bp
    from backend.api.pattern_routes import pattern_bp

    app.register_blueprint(upload_bp)
    app.register_blueprint(entity_bp)
    app.register_blueprint(network_bp)
    app.register_blueprint(analysis_bp)
    app.register_blueprint(pattern_bp)

    @app.errorhandler(400)
    def bad_request(error):
        return jsonify({'error': 'Bad Request', 'message': str(error)}), 400

    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not Found', 'message': str(error)}), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal Server Error', 'message': str(error)}), 500

    @app.route('/health')
    def health():
        return jsonify({'status': 'healthy'})

    @app.route('/')
    def index():
        return app.send_static_file('index.html')

    return app

if __name__ == '__main__':
    app = create_app()
    app.run(host='0.0.0.0', port=5000, debug=False)
