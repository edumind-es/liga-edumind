import secrets

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Liga


async def generate_unique_public_pin(
    db: AsyncSession,
    *,
    length: int = 6,
    exclude_liga_id: int | None = None,
    max_attempts: int = 50,
) -> str:
    digits = "0123456789"

    for _ in range(max_attempts):
        pin = "".join(secrets.choice(digits) for _ in range(length))
        query = select(Liga.id).where(Liga.public_pin == pin)
        if exclude_liga_id is not None:
            query = query.where(Liga.id != exclude_liga_id)

        existing = await db.scalar(query)
        if existing is None:
            return pin

    raise ValueError("No se pudo generar un PIN único, reintenta.")

