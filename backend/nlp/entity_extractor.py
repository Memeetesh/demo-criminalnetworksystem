"""
Entity Extractor for Criminal Network Analysis.
Extracts Named Entities (PER, LOC, ORG, MISC) from text using a pre-trained BERT model.
"""

import logging
from typing import List, Dict, Optional, Any

logger = logging.getLogger(__name__)

class EntityExtractor:
    """
    Extracts entities using a HuggingFace NER pipeline.
    Lazy-loads the model.
    """

    # Map BERT NER output labels to frontend display types
    ENTITY_TYPE_MAP = {
        'PER': 'PERSON',
        'LOC': 'LOCATION',
        'ORG': 'ORGANIZATION',
        'MISC': 'MISC',
    }

    def __init__(self, model_name: str = "dslim/bert-base-NER", aggregation_strategy: str = "simple"):
        """
        Initialize the EntityExtractor.

        Args:
            model_name (str): The HuggingFace model identifier.
            aggregation_strategy (str): Aggregation strategy for pipeline.
        """
        self.model_name = model_name
        self.aggregation_strategy = aggregation_strategy
        self._pipeline = None

    def _load_model(self) -> None:
        """Loads the NER pipeline lazily."""
        if self._pipeline is None:
            try:
                from transformers import pipeline
                logger.info(f"Loading NER model {self.model_name}")
                self._pipeline = pipeline(
                    "ner",
                    model=self.model_name,
                    aggregation_strategy=self.aggregation_strategy
                )
                logger.info("Model loaded successfully.")
            except ImportError:
                logger.error("transformers library is not installed.")
                raise ImportError("Please install transformers to use the EntityExtractor.")
            except Exception as e:
                logger.error(f"Failed to load model {self.model_name}: {e}")
                raise

    def extract(self, text: str) -> List[Dict[str, Any]]:
        """
        Extracts entities from the given text.

        Args:
            text (str): The text to process.

        Returns:
            List[Dict]: List of extracted entities.
        """
        if not text or not isinstance(text, str):
            return []

        self._load_model()

        # Split into chunks of ~450 tokens roughly (approximation by words)
        # BERT max length is 512 tokens.
        words = text.split()
        chunk_size = 350
        chunks = []
        for i in range(0, len(words), chunk_size):
            chunks.append(" ".join(words[i:i + chunk_size]))

        extracted_entities = []
        for chunk in chunks:
            try:
                results = self._pipeline(chunk)
                for res in results:
                    if isinstance(res, dict):
                        extracted_entities.append(res)
            except Exception as e:
                logger.warning(f"Error processing chunk: {e}")

        # Filter and deduplicate
        unique_entities = set()
        filtered_entities = []
        for ent in extracted_entities:
            score = ent.get("score", 0.0)
            word = ent.get("word", "").strip()
            entity_group = ent.get("entity_group", "")

            if score < 0.75:
                continue
            if len(word) <= 1:
                continue
            # Skip BERT WordPiece subword fragments
            if word.startswith('##'):
                continue

            # Deduplicate by text+type
            key = (word.lower(), entity_group)
            if key not in unique_entities:
                unique_entities.add(key)
                filtered_entities.append({
                    "entity_type": self.ENTITY_TYPE_MAP.get(entity_group, entity_group),
                    "text": word,
                    "confidence": float(score),
                    "start": ent.get("start", -1),
                    "end": ent.get("end", -1)
                })

        return filtered_entities

    def extract_from_documents(self, documents: List[str]) -> Dict[str, List[Dict[str, Any]]]:
        """
        Batch process a list of documents.

        Args:
            documents (List[str]): List of texts.

        Returns:
            Dict[str, List[Dict]]: Dictionary mapping text to extracted entities.
        """
        results = {}
        for doc in documents:
            results[doc] = self.extract(doc)
        return results
