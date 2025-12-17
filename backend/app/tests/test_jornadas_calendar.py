import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models import Liga, Equipo, TipoDeporte, Jornada
from app.tests.utils.utils import create_random_user, authentication_token_from_email


@pytest.mark.asyncio
async def test_generate_calendar_autosets_jornada_numero(client: AsyncClient, session: AsyncSession):
    user = await create_random_user(session)
    headers = await authentication_token_from_email(client, user.email, session)

    liga = Liga(nombre="Liga Jornadas Calendar", usuario_id=user.id)
    session.add(liga)
    await session.commit()
    await session.refresh(liga)

    # Ensure we have a sport type
    sport = await session.get(TipoDeporte, 1)
    if not sport:
        sport = TipoDeporte(nombre="Test Sport", codigo="TEST", tipo_marcador="goles")
        session.add(sport)
        await session.commit()
        await session.refresh(sport)

    # Need at least 5 teams
    equipos = [Equipo(nombre=f"Equipo {i}", liga_id=liga.id) for i in range(1, 6)]
    session.add_all(equipos)
    await session.commit()

    jornada = Jornada(nombre="Jornada sin numero", liga_id=liga.id, numero=None)
    session.add(jornada)
    await session.commit()
    await session.refresh(jornada)
    assert jornada.numero is None

    response = await client.post(
        f"/api/v1/jornadas/{jornada.id}/generar-calendario?tipo_deporte_id={sport.id}",
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["jornada_id"] == jornada.id
    assert data["partidos_creados"] > 0

    await session.refresh(jornada)
    assert isinstance(jornada.numero, int)
    assert jornada.numero >= 1

