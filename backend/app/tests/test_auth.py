"""
Tests for authentication endpoints.
"""
import pytest
from httpx import AsyncClient
from app.main import app
from app.utils.security import get_password_hash

@pytest.mark.asyncio
class TestAuth:
    """Tests for authentication endpoints."""
    
    async def test_register_success(self, client: AsyncClient):
        """Test successful user registration."""
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "codigo": "test_user",
                "email": "test@example.com",
                "password": "password123",
                "acepta_privacidad": True
            }
        )
        
        assert response.status_code == 201
        data = response.json()
        assert data["codigo"] == "test_user"
        assert data["email"] == "test@example.com"
        assert "hashed_password" not in data
        assert "password" not in data
    
    async def test_register_duplicate_codigo(self, client: AsyncClient):
        """Test registration with duplicate codigo."""
        # First registration
        await client.post(
            "/api/v1/auth/register",
            json={
                "codigo": "duplicate",
                "email": "user1@example.com",
                "password": "password123",
                "acepta_privacidad": True
            }
        )
        
        # Second registration with same codigo
        response = await client.post(
            "/api/v1/auth/register",
            json={
                "codigo": "duplicate",
                "email": "user2@example.com",
                "password": "password456",
                "acepta_privacidad": True
            }
        )
        
        assert response.status_code == 400
        assert "Código ya registrado" in response.json()["detail"]
    
    async def test_login_success(self, client: AsyncClient):
        """Test successful login."""
        # Register user first
        await client.post(
            "/api/v1/auth/register",
            json={
                "codigo": "login_test",
                "email": "login@example.com",
                "password": "password123",
                "acepta_privacidad": True
            }
        )
        
        # Login
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "codigo": "login_test",
                "password": "password123"
            }
        )
        
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
    
    async def test_login_wrong_password(self, client: AsyncClient):
        """Test login with wrong password."""
        # Register user
        await client.post(
            "/api/v1/auth/register",
            json={
                "codigo": "wrong_pass",
                "email": "wrong@example.com",
                "password": "correct_password",
                "acepta_privacidad": True
            }
        )
        
        # Login with wrong password
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "codigo": "wrong_pass",
                "password": "wrong_password"
            }
        )
        
        assert response.status_code == 401
        assert "incorrectos" in response.json()["detail"].lower()
    
    async def test_login_nonexistent_user(self, client: AsyncClient):
        """Test login with non-existent user."""
        response = await client.post(
            "/api/v1/auth/login",
            json={
                "codigo": "nonexistent",
                "password": "password123"
            }
        )
        
        assert response.status_code == 401
    
    async def test_get_me_success(self, client: AsyncClient):
        """Test getting current user."""
        # Register and login
        await client.post(
            "/api/v1/auth/register",
            json={
                "codigo": "me_test",
                "email": "me@example.com",
                "password": "password123",
                "acepta_privacidad": True
            }
        )
        
        login_response = await client.post(
            "/api/v1/auth/login",
            json={
                "codigo": "me_test",
                "password": "password123"
            }
        )
        
        token = login_response.json()["access_token"]
        
        # Get current user
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {token}"}
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["codigo"] == "me_test"
        assert data["email"] == "me@example.com"
    
    async def test_get_me_no_token(self, client: AsyncClient):
        """Test getting current user without token."""
        response = await client.get("/api/v1/auth/me")
        
        assert response.status_code == 401
    
    async def test_get_me_invalid_token(self, client: AsyncClient):
        """Test getting current user with invalid token."""
        response = await client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )
        
        assert response.status_code == 401
