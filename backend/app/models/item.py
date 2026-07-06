from sqlmodel import Field, SQLModel


class Item(SQLModel, table=True):  # table=True → real database table
    id: int | None = Field(default=None, primary_key=True)  # None until the DB assigns it
    name: str
