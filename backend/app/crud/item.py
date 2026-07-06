from sqlmodel import Session, select

from app.models.item import Item
from app.schemas.item import ItemCreate


def create_item(session: Session, item_in: ItemCreate) -> Item:
    item = Item(name=item_in.name)
    session.add(item)
    session.commit()
    session.refresh(item)  # reload to get the generated id
    return item


def get_items(session: Session) -> list[Item]:
    statement = select(Item)
    return list(session.exec(statement).all())
