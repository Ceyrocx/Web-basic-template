from sqlmodel import SQLModel


class ItemCreate(SQLModel):  # request body (no id)
    name: str


class ItemRead(SQLModel):  # response shape (id always present)
    id: int
    name: str
