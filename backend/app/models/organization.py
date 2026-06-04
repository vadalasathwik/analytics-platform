from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column
from uuid import uuid4

from app.database.base import Base


class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid4())
    )

    name: Mapped[str] = mapped_column(
        String(255)
    )