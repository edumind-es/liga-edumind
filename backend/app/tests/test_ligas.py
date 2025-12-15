import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.main import app
from app.models import Liga, User, Equipo
from app.tests.utils.utils import create_random_user, authentication_token_from_email

@pytest.mark.asyncio
async def test_create_liga(client: AsyncClient, session: AsyncSession):
    user = await create_random_user(session)
    headers = await authentication_token_from_email(client, user.email, session)
    
    data = {
        "nombre": "Liga Test",
        "descripcion": "Descripción de prueba",
        "temporada": "2024-2025"
    }
    
    response = await client.post("/api/v1/ligas/", json=data, headers=headers)
    assert response.status_code == 201
    content = response.json()
    assert content["nombre"] == data["nombre"]
    assert content["usuario_id"] == user.id
    assert content["activa"] is True

@pytest.mark.asyncio
async def test_read_ligas(client: AsyncClient, session: AsyncSession):
    user = await create_random_user(session)
    headers = await authentication_token_from_email(client, user.email, session)
    
    # Create 2 leagues
    liga1 = Liga(nombre="Liga 1", usuario_id=user.id)
    liga2 = Liga(nombre="Liga 2", usuario_id=user.id)
    session.add(liga1)
    session.add(liga2)
    await session.commit()
    
    response = await client.get("/api/v1/ligas/", headers=headers)
    assert response.status_code == 200
    content = response.json()
    assert len(content) == 2

@pytest.mark.asyncio
async def test_read_liga_detail(client: AsyncClient, session: AsyncSession):
    user = await create_random_user(session)
    headers = await authentication_token_from_email(client, user.email, session)
    
    liga = Liga(nombre="Liga Detalle", usuario_id=user.id)
    session.add(liga)
    await session.commit()
    await session.refresh(liga)
    
    response = await client.get(f"/api/v1/ligas/{liga.id}", headers=headers)
    assert response.status_code == 200
    content = response.json()
    assert content["nombre"] == "Liga Detalle"
    assert "total_equipos" in content

@pytest.mark.asyncio
async def test_update_liga(client: AsyncClient, session: AsyncSession):
    user = await create_random_user(session)
    headers = await authentication_token_from_email(client, user.email, session)
    
    liga = Liga(nombre="Liga Original", usuario_id=user.id)
    session.add(liga)
    await session.commit()
    await session.refresh(liga)
    
    data = {"nombre": "Liga Actualizada"}
    response = await client.put(f"/api/v1/ligas/{liga.id}", json=data, headers=headers)
    assert response.status_code == 200
    content = response.json()
    assert content["nombre"] == "Liga Actualizada"

@pytest.mark.asyncio
async def test_generate_public_pin(client: AsyncClient, session: AsyncSession):
    user = await create_random_user(session)
    headers = await authentication_token_from_email(client, user.email, session)

    liga = Liga(nombre="Liga PIN", usuario_id=user.id)
    session.add(liga)
    await session.commit()
    await session.refresh(liga)

    response = await client.post(f"/api/v1/ligas/{liga.id}/public-pin", headers=headers)
    assert response.status_code == 200
    pin = response.json()["public_pin"]
    assert isinstance(pin, str)
    assert len(pin) == 6

    # Verify persisted
    await session.refresh(liga)
    assert liga.public_pin == pin


@pytest.mark.asyncio
async def test_public_pin_uniqueness_on_update(client: AsyncClient, session: AsyncSession):
    user = await create_random_user(session)
    headers = await authentication_token_from_email(client, user.email, session)

    liga1 = Liga(nombre="Liga PIN 1", usuario_id=user.id, public_pin="123456")
    liga2 = Liga(nombre="Liga PIN 2", usuario_id=user.id)
    session.add(liga1)
    session.add(liga2)
    await session.commit()
    await session.refresh(liga2)

    response = await client.put(
        f"/api/v1/ligas/{liga2.id}",
        json={"public_pin": "123456"},
        headers=headers,
    )
    assert response.status_code == 409


@pytest.mark.asyncio
async def test_disable_public_pin(client: AsyncClient, session: AsyncSession):
    user = await create_random_user(session)
    headers = await authentication_token_from_email(client, user.email, session)

    liga = Liga(nombre="Liga PIN Off", usuario_id=user.id, public_pin="654321")
    session.add(liga)
    await session.commit()
    await session.refresh(liga)

    response = await client.delete(f"/api/v1/ligas/{liga.id}/public-pin", headers=headers)
    assert response.status_code == 204

    await session.refresh(liga)
    assert liga.public_pin is None

@pytest.mark.asyncio
async def test_delete_liga(client: AsyncClient, session: AsyncSession):
    user = await create_random_user(session)
    headers = await authentication_token_from_email(client, user.email, session)
    
    liga = Liga(nombre="Liga Borrar", usuario_id=user.id)
    session.add(liga)
    await session.commit()
    await session.refresh(liga)
    
    response = await client.delete(f"/api/v1/ligas/{liga.id}", headers=headers)
    assert response.status_code == 204
    
    # Verify it's gone
    response = await client.get(f"/api/v1/ligas/{liga.id}", headers=headers)
    assert response.status_code == 404
