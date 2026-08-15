from sqlmodel import SQLModel, Session, create_engine
from app.core.config import get_settings

settings = get_settings()
# pool_pre_ping avoids stale-connection errors against managed Postgres (Supabase/Neon)
engine = create_engine(settings.DATABASE_URL, pool_pre_ping=True, echo=False)


def init_db() -> None:
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
