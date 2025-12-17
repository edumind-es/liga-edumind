"""
Pydantic schemas for Liga.
"""
from pydantic import BaseModel, Field, field_validator
from datetime import datetime

# Base schema
class LigaBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    descripcion: str | None = None
    temporada: str | None = Field(None, max_length=20, description="Ej: 2024-2025")
    activa: bool = True
    modo_competicion: str = Field(default='unico_deporte', description="Modo de competición: 'unico_deporte' o 'multi_deporte'")

# Create schema
class LigaCreate(LigaBase):
    pass

# Update schema
class LigaUpdate(BaseModel):
    nombre: str | None = Field(None, min_length=1, max_length=100)
    descripcion: str | None = None
    temporada: str | None = None
    activa: bool | None = None
    modo_competicion: str | None = Field(None, description="Modo de competición: 'unico_deporte' o 'multi_deporte'")
    public_pin: str | None = Field(
        None,
        description="PIN de 6 caracteres para acceso público. Usa null/vacío para deshabilitar.",
        max_length=6,
    )

    @field_validator("public_pin", mode="before")
    @classmethod
    def normalize_public_pin(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            v = v.strip()
            return v or None
        return v

    @field_validator("public_pin")
    @classmethod
    def validate_public_pin_length(cls, v):
        if v is None:
            return None
        if len(v) != 6:
            raise ValueError("El PIN debe tener exactamente 6 caracteres")
        return v

# Calendar generation schema
class CalendarCreate(BaseModel):
    tipo_deporte_id: int
    start_date: datetime | None = None

# Public Login schema
class PublicLogin(BaseModel):
    liga_id: int
    pin: str

    @field_validator("pin", mode="before")
    @classmethod
    def normalize_pin(cls, v):
        if v is None:
            return v
        if isinstance(v, str):
            return v.strip()
        return v

    @field_validator("pin")
    @classmethod
    def validate_pin_length(cls, v):
        if len(v) != 6:
            raise ValueError("El PIN debe tener exactamente 6 caracteres")
        return v

# Response schema
class LigaResponse(LigaBase):
    id: int
    usuario_id: int
    modo_competicion: str
    public_pin: str | None = None
    created_at: datetime
    updated_at: datetime | None
    
    class Config:
        from_attributes = True

class LigaPublicResponse(LigaBase):
    id: int
    usuario_id: int
    created_at: datetime
    updated_at: datetime | None

    class Config:
        from_attributes = True

# Response with counts
class LigaWithStats(LigaResponse):
    total_equipos: int = 0
    total_jornadas: int = 0
    total_partidos: int = 0
