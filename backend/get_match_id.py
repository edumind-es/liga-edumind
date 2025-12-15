
import asyncio
from app.database import AsyncSessionLocal
from app.models import Partido
from sqlalchemy import select

async def get_ids():
    async with AsyncSessionLocal() as db:
        result = await db.execute(select(Partido).where(Partido.jornada_id == 7))
        partidos = result.scalars().all()
        if partidos:
            print(f"Partido ID: {partidos[0].id}")
        else:
            print("No matches found")

if __name__ == "__main__":
    asyncio.run(get_ids())
