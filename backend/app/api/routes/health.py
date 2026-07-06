from fastapi import APIRouter
from sqlalchemy import text

from app.api.deps import SessionDep

router = APIRouter()


@router.get("/health")
def health() -> dict[str, str]:
    return {"message": "Hello World"}


@router.get("/health/db")
def health_db(session: SessionDep) -> dict[str, str]:
    session.execute(text("SELECT 1"))  # raises if the DB is unreachable
    return {"database": "ok"}
