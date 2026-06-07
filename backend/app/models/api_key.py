# app/models/api_key.py

from datetime import datetime

from sqlalchemy import (
    String,
    ForeignKey,
    DateTime
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column
)

from app.database.base import Base


class ApiKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    organization_id: Mapped[str] = mapped_column(
        ForeignKey("organizations.id")
    )

    name: Mapped[str] = mapped_column(
        String(100)
    )

    key: Mapped[str] = mapped_column(
        String(255),
        unique=True
    )

    preview: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )