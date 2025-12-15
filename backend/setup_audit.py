
import asyncio
from sqlalchemy import select
from app.database import AsyncSessionLocal
from app.models import User, Liga, Equipo, Jornada, TipoDeporte
from app.utils.security import get_password_hash
from datetime import datetime

from app.database import AsyncSessionLocal
from app.config import settings

async def setup():
    print(f"Connecting to DB: {settings.DATABASE_URL.split('@')[-1]}") # Print host only
    async with AsyncSessionLocal() as db:
        print("Starting seeding...")
        
        # 1. Ensure User
        result = await db.execute(select(User).where(User.email == "testdocente@edumind.es"))
        user = result.scalars().first()
        
        if not user:
            print("Creating user testdocente...")
            user = User(
                email="testdocente@edumind.es",
                codigo="testdocente",
                hashed_password=get_password_hash("TestDocente123!"),
                is_active=True
            )
            db.add(user)
            await db.commit()
            await db.refresh(user)
        else:
            print(f"User {user.codigo} exists.")

        # 2. Get Tipo Deporte (Futbol)
        result = await db.execute(select(TipoDeporte).where(TipoDeporte.codigo == "futbol"))
        td_futbol = result.scalars().first()
        # If not exists, try 'goles' type or any
        if not td_futbol:
             result = await db.execute(select(TipoDeporte))
             td_futbol = result.scalars().first()
        
        if not td_futbol:
            print("No sport types found! Please init DB first.")
            return

        print(f"Using Sport: {td_futbol.nombre} (ID: {td_futbol.id})")

        # 3. Create Liga
        liga_nombre = "Liga Auditoria RR"
        result = await db.execute(select(Liga).where(Liga.nombre == liga_nombre))
        liga = result.scalars().first()
        
        if not liga:
            print("Creating Liga...")
            liga = Liga(
                nombre=liga_nombre,
                usuario_id=user.id,
                descripcion="Liga para probar Round Robin"
            )
            db.add(liga)
            await db.commit()
            await db.refresh(liga)
        
        print(f"Liga ID: {liga.id}")

        # 4. Create Equipos (6 teams)
        result = await db.execute(select(Equipo).where(Equipo.liga_id == liga.id))
        equipos = result.scalars().all()
        
        needed = 6 - len(equipos)
        if needed > 0:
            print(f"Creating {needed} teams...")
            for i in range(len(equipos) + 1, 7):
                eq = Equipo(
                    nombre=f"Equipo Audit {i}",
                    color_principal="#3B82F6",
                    liga_id=liga.id,
                    acceso_token=f"token_{i}"
                )
                db.add(eq)
            await db.commit()
        
        print("Teams ready.")

        # 5. Create Jornada if not exists
        result = await db.execute(select(Jornada).where(Jornada.liga_id == liga.id, Jornada.numero == 1))
        jornada = result.scalars().first()
        
        if not jornada:
            print("Creating Jornada 1...")
            jornada = Jornada(
                nombre="Jornada 1",
                numero=1,
                liga_id=liga.id,
                fecha_inicio=datetime.now(),
                fecha_fin=datetime.now()
            )
            db.add(jornada)
            await db.commit()
            await db.refresh(jornada)
        
        print(f"Jornada 1 ID: {jornada.id}")
        
    print("Setup completed successfully.")

if __name__ == "__main__":
    asyncio.run(setup())
