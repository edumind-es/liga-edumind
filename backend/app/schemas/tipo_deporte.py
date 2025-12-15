"""
Pydantic schemas for TipoDeporte.
"""
from pydantic import BaseModel
from datetime import datetime
from typing import Dict, Any

# Response schema (read-only for users)
class TipoDeporteResponse(BaseModel):
    id: int
    nombre: str
    codigo: str
    tipo_marcador: str  # "goles", "sets", "puntos", "tries"
    permite_empate: bool
    config: Dict[str, Any] | None
    descripcion: str | None
    icono: str | None
    created_at: datetime
    
    class Config:
        from_attributes = True
