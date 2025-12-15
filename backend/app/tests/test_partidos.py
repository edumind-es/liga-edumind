import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Liga, Equipo, Partido, TipoDeporte, Jornada
from app.tests.utils.utils import create_random_user, authentication_token_from_email

@pytest.mark.asyncio
async def test_create_partido(client: AsyncClient, session: AsyncSession):
    user = await create_random_user(session)
    headers = await authentication_token_from_email(client, user.email, session)
    
    # Setup data
    liga = Liga(nombre="Liga Partidos", usuario_id=user.id)
    session.add(liga)
    await session.commit()
    await session.refresh(liga)
    
    # Get a sport type (seeded in conftest)
    sport = await session.get(TipoDeporte, 1) # Assuming ID 1 exists (Fútbol Sala)
    if not sport:
        # Fallback if seeding failed or ID changed
        sport = TipoDeporte(nombre="Test Sport", codigo="TEST", tipo_marcador="goles")
        session.add(sport)
        await session.commit()
        await session.refresh(sport)
    
    equipo1 = Equipo(nombre="Local", liga_id=liga.id)
    equipo2 = Equipo(nombre="Visitante", liga_id=liga.id)
    session.add(equipo1)
    session.add(equipo2)
    await session.commit()
    await session.refresh(equipo1)
    await session.refresh(equipo2)
    
    data = {
        "liga_id": liga.id,
        "tipo_deporte_id": sport.id,
        "equipo_local_id": equipo1.id,
        "equipo_visitante_id": equipo2.id
    }
    
    response = await client.post("/api/v1/partidos/", json=data, headers=headers)
    assert response.status_code == 201
    content = response.json()
    assert content["equipo_local_id"] == equipo1.id
    assert content["equipo_visitante_id"] == equipo2.id
    assert content["finalizado"] is False

@pytest.mark.asyncio
async def test_update_marcador(client: AsyncClient, session: AsyncSession):
    user = await create_random_user(session)
    headers = await authentication_token_from_email(client, user.email, session)
    
    # Setup
    liga = Liga(nombre="Liga Marcador", usuario_id=user.id)
    session.add(liga)
    await session.commit()
    await session.refresh(liga)
    
    sport = TipoDeporte(nombre="Futbol Test", codigo="FUT_TEST", tipo_marcador="goles")
    session.add(sport)
    await session.commit()
    await session.refresh(sport)
    
    e1 = Equipo(nombre="L", liga_id=liga.id)
    e2 = Equipo(nombre="V", liga_id=liga.id)
    session.add(e1)
    session.add(e2)
    await session.commit()
    await session.refresh(e1)
    await session.refresh(e2)
    
    partido = Partido(
        liga_id=liga.id,
        tipo_deporte_id=sport.id,
        equipo_local_id=e1.id,
        equipo_visitante_id=e2.id
    )
    session.add(partido)
    await session.commit()
    await session.refresh(partido)
    
    # Update marcador (Local wins 3-1)
    marcador_data = {
        "marcador": {
            "goles_local": 3,
            "goles_visitante": 1
        }
    }
    
    response = await client.put(f"/api/v1/partidos/{partido.id}/marcador", json=marcador_data, headers=headers)
    assert response.status_code == 200
    content = response.json()
    assert content["marcador"]["goles_local"] == 3
    assert content["puntos_local"] == 3
    assert content["puntos_visitante"] == 1
    assert content["resultado"] == "V"
    assert content["finalizado"] is True

@pytest.mark.asyncio
async def test_update_evaluacion(client: AsyncClient, session: AsyncSession):
    user = await create_random_user(session)
    headers = await authentication_token_from_email(client, user.email, session)
    
    # Setup
    liga = Liga(nombre="Liga Eval", usuario_id=user.id)
    session.add(liga)
    await session.commit()
    await session.refresh(liga)
    
    sport = TipoDeporte(nombre="Basket", codigo="BAS", tipo_marcador="puntos")
    session.add(sport)
    await session.commit()
    await session.refresh(sport)
    
    e1 = Equipo(nombre="L", liga_id=liga.id)
    e2 = Equipo(nombre="V", liga_id=liga.id)
    session.add(e1)
    session.add(e2)
    await session.commit()
    await session.refresh(e1)
    await session.refresh(e2)
    
    partido = Partido(
        liga_id=liga.id,
        tipo_deporte_id=sport.id,
        equipo_local_id=e1.id,
        equipo_visitante_id=e2.id
    )
    session.add(partido)
    await session.commit()
    await session.refresh(partido)
    
    eval_data = {
        "puntos_juego_limpio_local": 1,
        "arbitro_conocimiento": 8,
        "arbitro_gestion": 7,
        "arbitro_apoyo": 9
    }
    
    response = await client.put(f"/api/v1/partidos/{partido.id}/evaluacion", json=eval_data, headers=headers)
    assert response.status_code == 200
    content = response.json()
    assert content["puntos_juego_limpio_local"] == 1
    assert content["arbitro_media"] == 8.0 # (8+7+9)/3

@pytest.mark.asyncio
async def test_read_partidos_filter(client: AsyncClient, session: AsyncSession):
    user = await create_random_user(session)
    headers = await authentication_token_from_email(client, user.email, session)
    
    liga = Liga(nombre="Liga Filter", usuario_id=user.id)
    session.add(liga)
    await session.commit()
    await session.refresh(liga)
    
    sport = TipoDeporte(nombre="Sport Filter", codigo="S_FILT", tipo_marcador="goles")
    session.add(sport)
    await session.commit()
    await session.refresh(sport)
    
    e1 = Equipo(nombre="E1", liga_id=liga.id)
    e2 = Equipo(nombre="E2", liga_id=liga.id)
    session.add(e1)
    session.add(e2)
    await session.commit()
    await session.refresh(e1)
    await session.refresh(e2)
    
    p1 = Partido(liga_id=liga.id, tipo_deporte_id=sport.id, equipo_local_id=e1.id, equipo_visitante_id=e2.id)
    session.add(p1)
    await session.commit()
    
    # Filter by liga
    response = await client.get(f"/api/v1/partidos/?liga_id={liga.id}", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
    
    # Filter by equipo
    response = await client.get(f"/api/v1/partidos/?equipo_id={e1.id}", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 1
    
    # Filter by wrong liga
    response = await client.get(f"/api/v1/partidos/?liga_id={liga.id + 999}", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) == 0
