import logging
import uuid
from typing import List, Dict, Any, Tuple
import numpy as np

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.case import Case
from app.schemas.case import CaseResponse

logger = logging.getLogger(__name__)

class SemanticService:
    _model = None
    _embeddings_index: Dict[uuid.UUID, np.ndarray] = {}
    _is_initialized: bool = False
    _model_name: str = "sentence-transformers/all-MiniLM-L6-v2"

    @classmethod
    def _load_model(cls):
        if cls._model is None:
            try:
                logger.info(f"Loading semantic model {cls._model_name}...")
                from sentence_transformers import SentenceTransformer
                cls._model = SentenceTransformer(cls._model_name)
                logger.info("Semantic model loaded successfully.")
            except Exception as e:
                logger.error(f"Failed to load semantic model: {e}")
                cls._model = None

    @classmethod
    async def initialize_index(cls, db: AsyncSession, force_rebuild: bool = False):
        """Builds the in-memory index from all cases in the database."""
        if cls._is_initialized and not force_rebuild:
            return

        cls._load_model()
        if cls._model is None:
            logger.error("Cannot initialize index: model failed to load.")
            return

        logger.info("Building semantic embedding index from database...")
        try:
            result = await db.execute(select(Case))
            cases = result.scalars().all()
            
            # Filter cases with valid descriptions
            valid_cases = [c for c in cases if c.description and len(c.description.strip()) > 10]
            
            if not valid_cases:
                logger.warning("No valid cases found to index.")
                cls._is_initialized = True
                return

            texts = [c.description for c in valid_cases]
            ids = [c.id for c in valid_cases]

            logger.info(f"Computing embeddings for {len(valid_cases)} cases...")
            embeddings = cls._model.encode(texts, convert_to_numpy=True, normalize_embeddings=True)
            
            cls._embeddings_index = {
                case_id: embedding for case_id, embedding in zip(ids, embeddings)
            }
            cls._is_initialized = True
            logger.info("Semantic embedding index built successfully.")
        except Exception as e:
            logger.error(f"Failed to initialize semantic index: {e}")

    @classmethod
    def _cosine_similarity(cls, a: np.ndarray, b: np.ndarray) -> float:
        """Compute cosine similarity between two normalized vectors."""
        return float(np.dot(a, b))

    @classmethod
    async def get_similar_cases(
        cls, 
        target_case_id: uuid.UUID, 
        db: AsyncSession, 
        top_k: int = 5, 
        threshold: float = 0.5
    ) -> List[Dict[str, Any]]:
        """Returns top_k similar cases for a given target case."""
        if not cls._is_initialized:
            await cls.initialize_index(db)

        if cls._model is None:
            return []

        # Get target case
        target_case = await db.get(Case, target_case_id)
        if not target_case or not target_case.description or len(target_case.description.strip()) <= 10:
            return []

        # Ensure target is in index, if not, compute it
        if target_case_id not in cls._embeddings_index:
            target_emb = cls._model.encode([target_case.description], convert_to_numpy=True, normalize_embeddings=True)[0]
            cls._embeddings_index[target_case_id] = target_emb

        target_emb = cls._embeddings_index[target_case_id]

        # Compute similarities against all other cases
        similarities = []
        for case_id, emb in cls._embeddings_index.items():
            if case_id == target_case_id:
                continue
            sim = cls._cosine_similarity(target_emb, emb)
            if sim >= threshold:
                similarities.append((case_id, sim))

        # Sort descending by similarity
        similarities.sort(key=lambda x: x[1], reverse=True)
        top_matches = similarities[:top_k]

        if not top_matches:
            return []

        # Fetch case details for top matches
        matched_case_ids = [m[0] for m in top_matches]
        result = await db.execute(select(Case).where(Case.id.in_(matched_case_ids)))
        cases_dict = {c.id: c for c in result.scalars().all()}

        response = []
        for case_id, sim_score in top_matches:
            if case_id in cases_dict:
                c = cases_dict[case_id]
                response.append({
                    "case_id": c.id,
                    "scam_type": c.scam_type.value,
                    "risk_level": c.risk_level.value,
                    "similarity_score": sim_score,
                    "preview": c.description[:150] + "..." if len(c.description) > 150 else c.description,
                    "created_at": c.created_at
                })

        return response
