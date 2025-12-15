"""
Pytest configuration and fixtures.
"""
import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from app.main import app
from app.database import Base, get_db
# Import all models to ensure they are registered in Base.metadata
from app.models import User, Liga, Equipo, TipoDeporte, Jornada, Partido

# Test database URL (in-memory SQLite for testing)
TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"

@pytest_asyncio.fixture
async def db():
    """Create test database."""
    engine = create_async_engine(TEST_DATABASE_URL, echo=False)
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    
    async_session = async_sessionmaker(
        engine, class_=AsyncSession, expire_on_commit=False
    )
    
    # Seed initial data (TiposDeporte)
    from app.models import TipoDeporte
    async with async_session() as session:
        sports = [
            TipoDeporte(nombre="Fútbol Sala", codigo="FUT", tipo_marcador="goles"),
            TipoDeporte(nombre="Baloncesto", codigo="BAL", tipo_marcador="puntos"),
            TipoDeporte(nombre="Voleibol", codigo="VOL", tipo_marcador="sets"),
            TipoDeporte(nombre="Balonmano", codigo="BM", tipo_marcador="goles"),
            TipoDeporte(nombre="Badminton", codigo="BAD", tipo_marcador="sets"),
            TipoDeporte(nombre="Colpball", codigo="COL", tipo_marcador="goles"),
            TipoDeporte(nombre="Rugby Tag", codigo="RUG", tipo_marcador="ensayos"),
            TipoDeporte(nombre="Ultimate", codigo="ULT", tipo_marcador="puntos"),
        ]
        session.add_all(sports)
        await session.commit()
    
    yield async_session
    
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.drop_all)
    
    await engine.dispose()

@pytest_asyncio.fixture
async def session(db):
    """Create test session."""
    async with db() as session:
        yield session

@pytest_asyncio.fixture
async def client(db):
    """Create test client with test database."""
    async def override_get_db():
        async with db() as session:
            yield session
    
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()
