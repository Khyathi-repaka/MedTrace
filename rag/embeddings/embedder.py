"""Local, free embedding model — no external API dependency for embeddings."""
from functools import lru_cache
from app.core.config import get_settings


@lru_cache
def _get_model():
    from sentence_transformers import SentenceTransformer
    return SentenceTransformer(get_settings().EMBEDDING_MODEL)


def embed_texts(texts: list[str]) -> list[list[float]]:
    if not texts:
        return []
    model = _get_model()
    return model.encode(texts, normalize_embeddings=True).tolist()
