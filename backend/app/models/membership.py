from sqlalchemy import String, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Membership(Base):
    __tablename__ = "memberships"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    user_id: Mapped[str] = mapped_column(
        ForeignKey("users.id")
    )

    organization_id: Mapped[str] = mapped_column(
        ForeignKey("organizations.id")
    )

    role: Mapped[str] = mapped_column(
        String(50)
    )