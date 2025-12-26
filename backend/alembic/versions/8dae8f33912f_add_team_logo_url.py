"""add_team_logo_url

Revision ID: 8dae8f33912f
Revises: 007_update_sports_catalog
Create Date: 2025-12-17 09:15:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '8dae8f33912f'
down_revision: Union[str, None] = '007_update_sports_catalog'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add logo_url column to equipos table
    op.add_column('equipos', sa.Column('logo_url', sa.String(length=255), nullable=True))


def downgrade() -> None:
    # Remove logo_url column
    op.drop_column('equipos', 'logo_url')
