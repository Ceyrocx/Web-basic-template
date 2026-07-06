from typing import Annotated

from fastapi import Depends
from sqlmodel import Session

from app.db.session import get_session

# Inject a DB session into a route with `session: SessionDep`
SessionDep = Annotated[Session, Depends(get_session)]
