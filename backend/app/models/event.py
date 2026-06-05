from datetime import datetime

from sqlalchemy import (
    String,
    ForeignKey,
    DateTime,
    JSON
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column
)

from app.database.base import Base


class Event(Base):
    __tablename__ = "events"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    organization_id: Mapped[str] = mapped_column(
        ForeignKey("organizations.id")
    )

    event_name: Mapped[str] = mapped_column(
        String(100)
    )

    user_id: Mapped[str] = mapped_column(
        String(255)
    )

    properties: Mapped[dict] = mapped_column(
        JSON,
        nullable=True
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )