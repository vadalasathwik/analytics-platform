"""add_preview_to_api_keys

Revision ID: e6681c73e653
Revises: e8a427ed9aa6
Create Date: 2026-06-07 12:28:07.226880

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e6681c73e653'
down_revision: Union[str, Sequence[str], None] = 'e8a427ed9aa6'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.add_column('api_keys', sa.Column('preview', sa.String(length=50), nullable=True))


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_column('api_keys', 'preview')
