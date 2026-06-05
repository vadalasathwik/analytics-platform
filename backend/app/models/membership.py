from sqlalchemy import (
    String,
    ForeignKey,
    UniqueConstraint
)

from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Membership(Base):
    __tablename__ = "memberships"

    __table_args__ = (
        UniqueConstraint(
            "user_id",
            "organization_id",
            name="uq_membership_user_org"
        ),
    )

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