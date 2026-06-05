"""add auth provider

Revision ID: ca12441c9c88
Revises: edcf6789541c
Create Date: 2026-06-05 14:00:10.896412
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision: str = "ca12441c9c88"
down_revision: Union[str, Sequence[str], None] = "edcf6789541c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "users",
        sa.Column(
            "auth_provider",
            sa.String(length=50),
            nullable=False,
            server_default="local",
        ),
    )


def downgrade() -> None:
    op.drop_column(
        "users",
        "auth_provider",
    )