"""Add config_sugerida to sport_proposals

Revision ID: 017_sport_proposal_cfg
Revises: 016_add_evaluacion_completa
Create Date: 2026-02-11 19:10:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '017_sport_proposal_cfg'
down_revision: Union[str, None] = '016_add_evaluacion_completa'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)

    # Reparación de cadena: sport_proposals se creó manualmente en producción
    # (create_proposals_table.py, fuera de Alembic). En instalaciones desde
    # cero no existe: se crea aquí con su forma original (DDL del script).
    # En bases existentes este bloque es un no-op.
    if not inspector.has_table("sport_proposals"):
        op.create_table(
            "sport_proposals",
            sa.Column("id", sa.Integer(), primary_key=True),
            sa.Column("nombre", sa.String(50), nullable=False),
            sa.Column("tipo_marcador", sa.String(20), nullable=False),
            sa.Column("descripcion", sa.Text(), nullable=True),
            sa.Column("web_url", sa.String(255), nullable=True),
            sa.Column("email_contacto", sa.String(100), nullable=False),
            sa.Column("status", sa.String(20), server_default="PENDING"),
            sa.Column("admin_notes", sa.Text(), nullable=True),
            sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
            sa.CheckConstraint("length(descripcion) >= 20", name="sport_proposals_descripcion_check"),
            sa.CheckConstraint("status IN ('PENDING', 'APPROVED', 'REJECTED')", name="sport_proposals_status_check"),
        )
        op.create_index("idx_sport_proposals_status", "sport_proposals", ["status"])
        inspector = sa.inspect(bind)

    existing_columns = {column["name"] for column in inspector.get_columns("sport_proposals")}

    if "config_sugerida" not in existing_columns:
        op.add_column("sport_proposals", sa.Column("config_sugerida", sa.JSON(), nullable=True))


def downgrade() -> None:
    bind = op.get_bind()
    inspector = sa.inspect(bind)
    existing_columns = {column["name"] for column in inspector.get_columns("sport_proposals")}

    if "config_sugerida" in existing_columns:
        op.drop_column("sport_proposals", "config_sugerida")
