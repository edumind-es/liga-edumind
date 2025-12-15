from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

# Base schema
class UserBase(BaseModel):
    codigo: str = Field(..., min_length=3, max_length=20, description="Código de usuario único")
    email: EmailStr | None = Field(None, description="Email del usuario (opcional)")

# Create schema (para registro)
class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Contraseña (mínimo 6 caracteres)")
    acepta_privacidad: bool = Field(..., description="Aceptación de Política de Privacidad (obligatorio)")

# Login schema
class UserLogin(BaseModel):
    codigo: str = Field(..., description="Código de usuario")
    password: str = Field(..., description="Contraseña")

# Response schema (lo que devuelve la API)
class UserResponse(UserBase):
    id: int
    is_active: bool
    is_superuser: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Token schemas
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class TokenData(BaseModel):
    codigo: str | None = None
