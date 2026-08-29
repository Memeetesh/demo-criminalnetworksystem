class Config:
    UPLOAD_FOLDER = 'uploads'
    MAX_CONTENT_LENGTH = 50 * 1024 * 1024  # 50MB
    ALLOWED_EXTENSIONS = {'csv', 'json', 'pdf'}
    NER_MODEL = 'dslim/bert-base-NER'
    NER_CONFIDENCE_THRESHOLD = 0.75
    MAX_PATH_DEPTH = 5
    COMMUNITY_RESOLUTION = 1.0
    TOP_N_KEY_PLAYERS = 10
