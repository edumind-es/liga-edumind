
import asyncio
from app.database import AsyncSessionLocal
from app.services.calendar_generator import generar_calendario_jornada
from app.models import Partido
from sqlalchemy import select

async def verify():
    async with AsyncSessionLocal() as db:
        print("Calling generar_calendario_jornada...")
        try:
            partidos = await generar_calendario_jornada(
                db=db,
                jornada_id=7, # Jornada ID from setup
                liga_id=9,    # Liga ID from setup
                tipo_deporte_id=1
            )
            await db.commit()
            
            print(f"Generated {len(partidos)} matches.")
            for p in partidos:
                print(f"Match: Local={p.equipo_local_id} vs Visitante={p.equipo_visitante_id} | Arbitro={p.arbitro_id}")
            
            if len(partidos) == 3:
                print("SUCCESS: 3 matches generated as expected for 6 teams.")
            else:
                print(f"FAILURE: Expected 3 matches, got {len(partidos)}.")
                
        except Exception as e:
            print(f"Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(verify())
