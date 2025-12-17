"""Add competition mode to Liga

Revision ID: 005
Revises: 004
Create Date: 2025-12-16

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '005_add_league_competition_mode'
down_revision: Union[str, Sequence[str]] = ('004_add_consent_fields',)
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add modo_competicion column to ligas table
    op.add_column(
        'ligas',
        sa.Column('modo_competicion', sa.String(length=20), nullable=False, server_default='unico_deporte')
    )
    
    # Create index for faster filtering
    op.create_index(
        op.f('ix_ligas_modo_competicion'),
        'ligas',
        ['modo_competicion'],
        unique=False
    )


def downgrade() -> None:
    # Drop index
    op.drop_index(op.f('ix_ligas_modo_competicion'), table_name='ligas')
    
    # Drop column
    op.drop_column('ligas', 'modo_competicion')
