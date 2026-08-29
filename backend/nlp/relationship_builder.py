"""
Relationship Builder for Criminal Network Analysis.
Builds relationships between extracted entities based on co-occurrence.
"""

from typing import List, Dict, Any, Set, Tuple
import uuid

class RelationshipBuilder:
    """
    Builds relationships between extracted entities through co-occurrence analysis.
    """

    def __init__(self):
        self._entity_registry: Dict[str, Dict[str, Any]] = {}
        self._edges: Dict[Tuple[str, str, str], Dict[str, Any]] = {}

    def _register_entity(self, entity_text: str, entity_type: str, doc_id: str) -> str:
        """
        Registers an entity in the registry or updates its metadata.
        Returns a unique identifier for the entity.
        """
        entity_key = entity_text.lower()
        if entity_key not in self._entity_registry:
            self._entity_registry[entity_key] = {
                "text": entity_text,
                "type": entity_type,
                "mention_count": 1,
                "first_seen": doc_id,
                "documents": {doc_id}
            }
        else:
            self._entity_registry[entity_key]["mention_count"] += 1
            self._entity_registry[entity_key]["documents"].add(doc_id)
        return entity_key

    def _determine_relationship_type(self, type1: str, type2: str) -> str:
        """
        Determines the relationship type between two entity types.
        """
        types = {type1, type2}
        if types == {"PER", "LOC"}:
            return "LOCATED_AT"
        if types == {"PER", "VEHICLE"}:
            return "OWNS_VEHICLE"
        if types == {"PER", "PHONE"}:
            return "USES_PHONE"
        if types == {"PER", "ORG"}:
            return "MEMBER_OF"
        if types == {"PER", "PER"}:
            return "ASSOCIATES_WITH"
        return "ASSOCIATES_WITH"

    def _add_edge(self, source_key: str, target_key: str, rel_type: str, doc_id: str):
        """Adds or updates an edge between two entities."""
        source_ent = self._entity_registry[source_key]
        target_ent = self._entity_registry[target_key]
        
        if target_ent["type"] == "PER" and source_ent["type"] != "PER":
            source_key, target_key = target_key, source_key

        edge_key = (source_key, target_key, rel_type)
        
        if edge_key not in self._edges:
            self._edges[edge_key] = {
                "source": source_key,
                "target": target_key,
                "relationship_type": rel_type,
                "weight": 1,
                "source_documents": {doc_id}
            }
        else:
            self._edges[edge_key]["weight"] += 1
            self._edges[edge_key]["source_documents"].add(doc_id)

    def build_relationships(self, entity_sets: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Builds relationships through co-occurrence in documents.
        
        Args:
            entity_sets (List[Dict]): List of dicts, each with "doc_id" and "entities".
        
        Returns:
            List[Dict]: A list of edges.
        """
        for doc_data in entity_sets:
            doc_id = doc_data.get("doc_id", str(uuid.uuid4()))
            entities = doc_data.get("entities", [])
            
            doc_entities = []
            for ent in entities:
                ent_text = ent.get("text")
                ent_type = ent.get("entity_type")
                if ent_text and ent_type:
                    ent_key = self._register_entity(ent_text, ent_type, doc_id)
                    doc_entities.append((ent_key, ent_type))
            
            unique_doc_entities = list(set(doc_entities))
            
            for i in range(len(unique_doc_entities)):
                for j in range(i + 1, len(unique_doc_entities)):
                    key1, type1 = unique_doc_entities[i]
                    key2, type2 = unique_doc_entities[j]
                    
                    rel_type = self._determine_relationship_type(type1, type2)
                    self._add_edge(key1, key2, rel_type, doc_id)
                    
        formatted_edges = []
        for edge_data in self._edges.values():
            formatted_edge = edge_data.copy()
            formatted_edge["source_documents"] = list(formatted_edge["source_documents"])
            formatted_edges.append(formatted_edge)
            
        return formatted_edges

    def get_entity_registry(self) -> Dict[str, Dict[str, Any]]:
        """
        Returns all unique entities with their metadata.
        """
        formatted_registry = {}
        for key, data in self._entity_registry.items():
            formatted_data = data.copy()
            formatted_data["documents"] = list(formatted_data["documents"])
            formatted_registry[key] = formatted_data
        return formatted_registry
