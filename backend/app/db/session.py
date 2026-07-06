from collections.abc import Generator

from sqlmodel import Session, create_engine

from app.core.config import settings

# Connection pool to Postgres. echo=True logs SQL — disable in production.
engine = create_engine(settings.DATABASE_URL, echo=True)


def get_session() -> Generator[Session]:
    # One session per request, closed automatically at the end.
    with Session(engine) as session:
        yield session
