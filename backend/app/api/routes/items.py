from fastapi import APIRouter

from app.api.deps import SessionDep
from app.crud.item import create_item, get_items
from app.models.item import Item
from app.schemas.item import ItemCreate, ItemRead

router = APIRouter()


@router.post("/items", response_model=ItemRead)  # response_model → the public output shape
def add_item(item_in: ItemCreate, session: SessionDep) -> Item:
    return create_item(session, item_in)


@router.get("/items", response_model=list[ItemRead])
def list_items(session: SessionDep) -> list[Item]:
    return get_items(session)
