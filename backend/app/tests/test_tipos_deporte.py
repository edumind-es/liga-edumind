import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from app.tests.utils.utils import create_random_user, authentication_token_from_email

@pytest.mark.asyncio
async def test_read_tipos_deporte(client: AsyncClient, session: AsyncSession):
    # Public endpoint, no auth needed
    response = await client.get("/api/v1/tipos-deporte/")
    assert response.status_code == 200
    content = response.json()
    assert len(content) >= 8  # We seeded 8 sports
    
    # Check structure
    sport = content[0]
    assert "nombre" in sport
    assert "codigo" in sport
    assert "tipo_marcador" in sport

@pytest.mark.asyncio
async def test_read_tipo_deporte_detail(client: AsyncClient, session: AsyncSession):
    # Get ID from list first
    response = await client.get("/api/v1/tipos-deporte/")
    content = response.json()
    sport_id = content[0]["id"]
    
    response = await client.get(f"/api/v1/tipos-deporte/{sport_id}")
    assert response.status_code == 200
    content = response.json()
    assert content["id"] == sport_id
