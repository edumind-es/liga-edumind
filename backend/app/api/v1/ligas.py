"""
API endpoints for Ligas (Leagues).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models import Liga, User, Equipo
from app.schemas import LigaCreate, LigaUpdate, LigaResponse, LigaWithStats, CalendarCreate
from app.api.deps import get_current_user
from app.services.clasificacion_service import ClasificacionService
# CalendarGenerator deprecated - use /jornadas/{id}/generar-calendario instead
from app.services.public_pin_service import generate_unique_public_pin

router = APIRouter()

@router.get("/", response_model=List[LigaResponse])
async def list_ligas(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Listar todas las ligas del usuario actual.
    """
    result = await db.execute(
        select(Liga).where(Liga.usuario_id == current_user.id)
    )
    ligas = result.scalars().all()
    return ligas

@router.post("/", response_model=LigaResponse, status_code=status.HTTP_201_CREATED)
async def create_liga(
    liga_data: LigaCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Crear una nueva liga.
    """
    nueva_liga = Liga(
        nombre=liga_data.nombre,
        descripcion=liga_data.descripcion,
        temporada=liga_data.temporada,
        activa=liga_data.activa,
        usuario_id=current_user.id
    )
    
    db.add(nueva_liga)
    await db.commit()
    await db.refresh(nueva_liga)
    
    return nueva_liga

@router.get("/{liga_id}", response_model=LigaWithStats)
async def get_liga(
    liga_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener una liga específica con estadísticas.
    """
    liga = await db.get(Liga, liga_id)
    
    if not liga:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liga no encontrada"
        )
    
    if liga.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a esta liga"
        )
    
    # Contar elementos
    # Contar elementos de forma eficiente
    from sqlalchemy import func
    from app.models import Equipo, Jornada, Partido
    
    total_equipos = await db.scalar(
        select(func.count()).select_from(Equipo).where(Equipo.liga_id == liga_id)
    )
    
    total_jornadas = await db.scalar(
        select(func.count()).select_from(Jornada).where(Jornada.liga_id == liga_id)
    )
    
    total_partidos = await db.scalar(
        select(func.count()).select_from(Partido).where(Partido.liga_id == liga_id)
    )
    
    # Convertir a dict y añadir stats
    liga_dict = {
        "id": liga.id,
        "nombre": liga.nombre,
        "descripcion": liga.descripcion,
        "temporada": liga.temporada,
        "activa": liga.activa,
        "usuario_id": liga.usuario_id,
        "public_pin": liga.public_pin,
        "created_at": liga.created_at,
        "updated_at": liga.updated_at,
        "total_equipos": total_equipos,
        "total_jornadas": total_jornadas,
        "total_partidos": total_partidos,
    }
    
    return liga_dict

@router.put("/{liga_id}", response_model=LigaResponse)
async def update_liga(
    liga_id: int,
    liga_data: LigaUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Actualizar una liga.
    """
    liga = await db.get(Liga, liga_id)
    
    if not liga:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liga no encontrada"
        )
    
    if liga.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para modificar esta liga"
        )
    
    # Actualizar campos
    if liga_data.nombre is not None:
        liga.nombre = liga_data.nombre
    if liga_data.descripcion is not None:
        liga.descripcion = liga_data.descripcion
    if liga_data.temporada is not None:
        liga.temporada = liga_data.temporada
    if liga_data.activa is not None:
        liga.activa = liga_data.activa
    if "public_pin" in liga_data.model_fields_set:
        if liga_data.public_pin is not None:
            existing = await db.scalar(
                select(Liga.id).where(Liga.public_pin == liga_data.public_pin, Liga.id != liga_id)
            )
            if existing is not None:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Este PIN ya está en uso por otra liga",
                )
        liga.public_pin = liga_data.public_pin
    
    await db.commit()
    await db.refresh(liga)
    
    return liga


@router.post("/{liga_id}/public-pin")
async def generar_public_pin(
    liga_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Generar (o regenerar) un PIN público único para la liga.
    """
    liga = await db.get(Liga, liga_id)
    if not liga:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Liga no encontrada")

    if liga.usuario_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos")

    try:
        pin = await generate_unique_public_pin(db, exclude_liga_id=liga_id)
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(e))

    liga.public_pin = pin
    await db.commit()
    await db.refresh(liga)

    return {"public_pin": liga.public_pin}


@router.delete("/{liga_id}/public-pin", status_code=status.HTTP_204_NO_CONTENT)
async def desactivar_public_pin(
    liga_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """
    Desactivar acceso público eliminando el PIN.
    """
    liga = await db.get(Liga, liga_id)
    if not liga:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Liga no encontrada")

    if liga.usuario_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tienes permisos")

    liga.public_pin = None
    await db.commit()

@router.delete("/{liga_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_liga(
    liga_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Eliminar una liga (y todos sus datos en cascada).
    """
    liga = await db.get(Liga, liga_id)
    
    if not liga:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liga no encontrada"
        )
    
    if liga.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para eliminar esta liga"
        )
    
    await db.delete(liga)
    await db.commit()

@router.get("/{liga_id}/clasificacion")
async def get_clasificacion(
    liga_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener clasificación de la liga.
    
    Incluye:
    - Puntos deportivos (sistema 3-2-1)
    - Puntos educativos (MRPS + arbitraje + grada)
    - Total de puntos
    """
    liga = await db.get(Liga, liga_id)
    
    if not liga:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liga no encontrada"
        )
    
    if liga.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos para acceder a esta liga"
        )
    
    clasificacion = await ClasificacionService.calcular_clasificacion(liga_id, db)
    
    return {
        "liga_id": liga_id,
        "liga_nombre": liga.nombre,
        "clasificacion": clasificacion
    }

# DEPRECATED: Use /jornadas/{id}/generar-calendario instead
# This endpoint generated entire league calendar at once
# New approach: Generate calendar per jornada for better control
"""
@router.post("/{liga_id}/generar-calendario", status_code=status.HTTP_201_CREATED)
async def generate_calendar(
    liga_id: int,
    calendar_data: CalendarCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    # DEPRECATED - Use /jornadas/{id}/generar-calendario for per-jornada generation
    raise HTTPException(
        status_code=status.HTTP_410_GONE,
        detail="Este endpoint está deprecado. Usa /jornadas/{id}/generar-calendario para generar partidos por jornada."
    )
"""

@router.get("/{liga_id}/export/clasificacion/csv")
async def export_clasificacion_csv(
    liga_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Exportar clasificación a CSV.
    """
    liga = await db.get(Liga, liga_id)
    if not liga or liga.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Liga no encontrada")
        
    clasificacion = await ClasificacionService.calcular_clasificacion(liga_id, db)
    
    from app.services.report_service import ReportService
    from fastapi.responses import Response
    
    csv_content = ReportService.generate_clasificacion_csv(clasificacion)
    
    return Response(
        content=csv_content,
        media_type="text/csv",
        headers={"Content-Disposition": f"attachment; filename=clasificacion_{liga_id}.csv"}
    )

@router.get("/{liga_id}/export/clasificacion/pdf")
async def export_clasificacion_pdf(
    liga_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Exportar clasificación a PDF.
    """
    liga = await db.get(Liga, liga_id)
    if not liga or liga.usuario_id != current_user.id:
        raise HTTPException(status_code=404, detail="Liga no encontrada")
        
    clasificacion = await ClasificacionService.calcular_clasificacion(liga_id, db)
    
    from app.services.report_service import ReportService
    from fastapi.responses import Response
    
    pdf_content = ReportService.generate_clasificacion_pdf(liga.nombre, clasificacion)
    
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=clasificacion_{liga_id}.pdf"}
    )
