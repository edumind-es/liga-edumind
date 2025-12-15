"""
API endpoints for TiposDeporte (Sports catalog).
"""
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models import TipoDeporte
from app.schemas import TipoDeporteResponse

router = APIRouter()

@router.get("/", response_model=List[TipoDeporteResponse])
async def list_tipos_deporte(
    db: AsyncSession = Depends(get_db)
):
    """
    Listar todos los tipos de deporte disponibles.
    Endpoint público (no requiere autenticación).
    """
    result = await db.execute(select(TipoDeporte))
    tipos = result.scalars().all()
    return tipos

@router.get("/{tipo_id}", response_model=TipoDeporteResponse)
async def get_tipo_deporte(
    tipo_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener un tipo de deporte específico.
    """
    tipo = await db.get(TipoDeporte, tipo_id)
    
    if not tipo:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tipo de deporte no encontrado"
        )
    
    return tipo
