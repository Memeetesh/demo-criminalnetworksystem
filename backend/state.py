class AppState:
    def __init__(self):
        self.entities = {}  # entity_id -> entity_data
        self.relationships = []  # list of edge dicts
        self.graph = None  # NetworkX graph
        self.upload_history = []  # list of upload records
        self.analysis_results = {}  # cached analysis
        self.temporal_data = []  # temporal records
        self.pattern_results = {'phones': [], 'vehicles': [], 'emails': [], 'money': [], 'dates': []}
        self.cdr_records = []
        self.cdr_analysis = {}

    def reset(self):
        """Reset all state for a fresh analysis."""
        self.entities = {}
        self.relationships = []
        self.graph = None
        self.analysis_results = {}
        self.temporal_data = []
        self.pattern_results = {'phones': [], 'vehicles': [], 'emails': [], 'money': [], 'dates': []}
        self.cdr_records = []
        self.cdr_analysis = {}

state = AppState()
