import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.models import Liga, Equipo
from app.tests.utils.utils import create_random_user, authentication_token_from_email

@pytest.mark.asyncio
async def test_create_equipo(client: AsyncClient, session: AsyncSession):
    user = await create_random_user(session)
    headers = await authentication_token_from_email(client, user.email, session)
    
    # Create liga first
    liga = Liga(nombre="Liga Equipos", usuario_id=user.id)
    session.add(liga)
    await session.commit()
    await session.refresh(liga)
    
    data = {
        "nombre": "Equipo Test",
        "color_principal": "#FF0000",
        "liga_id": liga.id
    }
    
    response = await client.post("/api/v1/equipos/", json=data, headers=headers)
    assert response.status_code == 201
    content = response.json()
    assert content["nombre"] == "Equipo Test"
    assert content["liga_id"] == liga.id
    assert content["acceso_token"] is not None

@pytest.mark.asyncio
async def test_read_equipos_by_liga(client: AsyncClient, session: AsyncSession):
    user = await create_random_user(session)
    headers = await authentication_token_from_email(client, user.email, session)
    
    liga = Liga(nombre="Liga Lista", usuario_id=user.id)
    session.add(liga)
    await session.commit()
    await session.refresh(liga)
    
    equipo1 = Equipo(nombre="E1", liga_id=liga.id)
    equipo2 = Equipo(nombre="E2", liga_id=liga.id)
    session.add(equipo1)
    session.add(equipo2)
    await session.commit()
    
    response = await client.get(f"/api/v1/equipos/?liga_id={liga.id}", headers=headers)
    assert response.status_code == 200
    content = response.json()
    assert len(content) == 2

@pytest.mark.asyncio
async def test_update_equipo(client: AsyncClient, session: AsyncSession):
    user = await create_random_user(session)
    headers = await authentication_token_from_email(client, user.email, session)
    
    liga = Liga(nombre="Liga Update", usuario_id=user.id)
    session.add(liga)
    await session.commit()
    await session.refresh(liga)
    
    equipo = Equipo(nombre="Equipo Old", liga_id=liga.id)
    session.add(equipo)
    await session.commit()
    await session.refresh(equipo)
    
    data = {"nombre": "Equipo New", "color_principal": "#00FF00"}
    response = await client.put(f"/api/v1/equipos/{equipo.id}", json=data, headers=headers)
    assert response.status_code == 200
    content = response.json()
    assert content["nombre"] == "Equipo New"
    assert content["color_principal"] == "#00FF00"

@pytest.mark.asyncio
async def test_delete_equipo(client: AsyncClient, session: AsyncSession):
    user = await create_random_user(session)
    headers = await authentication_token_from_email(client, user.email, session)
    
    liga = Liga(nombre="Liga Delete", usuario_id=user.id)
    session.add(liga)
    await session.commit()
    await session.refresh(liga)
    
    equipo = Equipo(nombre="Equipo Delete", liga_id=liga.id)
    session.add(equipo)
    await session.commit()
    await session.refresh(equipo)
    
    response = await client.delete(f"/api/v1/equipos/{equipo.id}", headers=headers)
    assert response.status_code == 204
    
    # Verify gone
    response = await client.get(f"/api/v1/equipos/{equipo.id}", headers=headers)
    assert response.status_code == 404
