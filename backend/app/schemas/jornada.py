"""
Pydantic schemas for Jornada.
"""
from pydantic import BaseModel, Field
from datetime import datetime

# Base schema
class JornadaBase(BaseModel):
    nombre: str = Field(..., min_length=1, max_length=100)
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None
    numero: int | None = None

# Create schema
class JornadaCreate(JornadaBase):
    liga_id: int

# Update schema
class JornadaUpdate(BaseModel):
    nombre: str | None = Field(None, min_length=1, max_length=100)
    fecha_inicio: datetime | None = None
    fecha_fin: datetime | None = None
    numero: int | None = None

# Response schema
class JornadaResponse(JornadaBase):
    id: int
    liga_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# Response with matches count
class JornadaWithStats(JornadaResponse):
    total_partidos: int = 0
