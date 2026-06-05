from sqlalchemy import String, Boolean
from sqlalchemy.orm import Mapped, mapped_column
from uuid import uuid4

from app.database.base import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(
        String,
        primary_key=True,
        default=lambda: str(uuid4())
    )

    name: Mapped[str] = mapped_column(
        String(255)
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True
    )

    password_hash: Mapped[str] = mapped_column(
        String(255)
    )

    auth_provider: Mapped[str] = mapped_column(
        String(50),
        default="local"
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True
    )