from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_
from sqlalchemy.orm import selectinload

from app.database import get_db
from app.models import Partido, Liga, Equipo, TipoDeporte, Jornada, User
from app.schemas.partido import (
    PartidoCreate, 
    PartidoResponse, 
    PartidoDetailed, 
    PartidoUpdateMarcador, 
    PartidoUpdateEvaluacion
)
from app.api.v1.auth import get_current_user
from app.services.clasificacion_service import ClasificacionService

router = APIRouter()

@router.post("/", response_model=PartidoResponse, status_code=status.HTTP_201_CREATED)
async def create_partido(
    partido: PartidoCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Crear un nuevo partido.
    Solo el propietario de la liga puede crear partidos.
    """
    # Verificar liga y permisos
    result = await db.execute(select(Liga).filter(Liga.id == partido.liga_id))
    liga = result.scalar_one_or_none()
    
    if not liga:
        raise HTTPException(status_code=404, detail="Liga no encontrada")
    
    if liga.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para crear partidos en esta liga")
    
    # Verificar equipos
    result = await db.execute(
        select(Equipo).filter(Equipo.id.in_([partido.equipo_local_id, partido.equipo_visitante_id]))
    )
    equipos = result.scalars().all()
    if len(equipos) != 2:
        raise HTTPException(status_code=404, detail="Uno o ambos equipos no existen")
    
    # Verificar que equipos pertenecen a la liga
    for equipo in equipos:
        if equipo.liga_id != partido.liga_id:
            raise HTTPException(status_code=400, detail=f"El equipo {equipo.nombre} no pertenece a esta liga")
            
    # Crear partido
    db_partido = Partido(**partido.model_dump())
    db.add(db_partido)
    await db.commit()
    await db.refresh(db_partido)
    
    return db_partido

@router.get("/", response_model=List[PartidoDetailed])
async def read_partidos(
    liga_id: Optional[int] = None,
    jornada_id: Optional[int] = None,
    equipo_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """
    Listar partidos con filtros opcionales.
    """
    query = select(Partido).options(
        selectinload(Partido.tipo_deporte),
        selectinload(Partido.equipo_local),
        selectinload(Partido.equipo_visitante),
        selectinload(Partido.arbitro),
        selectinload(Partido.tutor_grada_local),
        selectinload(Partido.tutor_grada_visitante)
    )
    
    if liga_id:
        query = query.filter(Partido.liga_id == liga_id)
    
    if jornada_id:
        query = query.filter(Partido.jornada_id == jornada_id)
        
    if equipo_id:
        query = query.filter(
            or_(
                Partido.equipo_local_id == equipo_id,
                Partido.equipo_visitante_id == equipo_id
            )
        )
        
    query = query.offset(skip).limit(limit)
    result = await db.execute(query)
    partidos = result.scalars().all()
    
    return partidos

@router.get("/{partido_id}", response_model=PartidoDetailed)
async def read_partido(
    partido_id: int,
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener detalles de un partido.
    """
    query = select(Partido).filter(Partido.id == partido_id).options(
        selectinload(Partido.tipo_deporte),
        selectinload(Partido.equipo_local),
        selectinload(Partido.equipo_visitante),
        selectinload(Partido.arbitro),
        selectinload(Partido.tutor_grada_local),
        selectinload(Partido.tutor_grada_visitante)
    )
    result = await db.execute(query)
    partido = result.scalar_one_or_none()
    
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
        
    return partido

@router.put("/{partido_id}/marcador", response_model=PartidoResponse)
async def update_marcador(
    partido_id: int,
    marcador_update: PartidoUpdateMarcador,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar el marcador de un partido.
    Calcula automáticamente los puntos y resultado.
    """
    # Obtener partido con relaciones necesarias para validación
    query = select(Partido).filter(Partido.id == partido_id).options(
        selectinload(Partido.liga),
        selectinload(Partido.tipo_deporte)
    )
    result = await db.execute(query)
    partido = result.scalar_one_or_none()
    
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
        
    # Verificar permisos
    if partido.liga.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para editar este partido")
        
    # Actualizar marcador
    partido.marcador = marcador_update.marcador
    partido.finalizado = True # Marcar como finalizado al poner marcador
    
    # Calcular puntos
    partido.calcular_puntos_desde_marcador()
    
    await db.commit()
    await db.refresh(partido)
    
    # Actualizar estadísticas de equipos
    await ClasificacionService.actualizar_stats_equipo(partido.equipo_local_id, db)
    await ClasificacionService.actualizar_stats_equipo(partido.equipo_visitante_id, db)
    
    return partido

@router.put("/{partido_id}/evaluacion", response_model=PartidoResponse)
async def update_evaluacion(
    partido_id: int,
    evaluacion: PartidoUpdateEvaluacion,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Actualizar evaluación educativa (juego limpio, árbitro, grada).
    """
    query = select(Partido).filter(Partido.id == partido_id).options(
        selectinload(Partido.liga)
    )
    result = await db.execute(query)
    partido = result.scalar_one_or_none()
    
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
        
    if partido.liga.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para editar este partido")
        
    # Actualizar campos proporcionados
    update_data = evaluacion.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(partido, key, value)
        
    # Calcular media árbitro si aplica
    if any(k in update_data for k in ['arbitro_conocimiento', 'arbitro_gestion', 'arbitro_apoyo']):
        vals = [
            partido.arbitro_conocimiento,
            partido.arbitro_gestion,
            partido.arbitro_apoyo
        ]
        # Filter None values
        valid_vals = [v for v in vals if v is not None]
        
        if valid_vals:
            partido.arbitro_media = sum(valid_vals) / len(valid_vals)
            # Sistema de puntuación: +2 puntos si logra evaluación positiva (>= 5)
            partido.puntos_arbitro = 2 if partido.arbitro_media >= 5 else 0
        
    # Calcular media grada local
    if any(k in update_data for k in ['grada_animar_local', 'grada_respeto_local', 'grada_participacion_local']):
        vals = [
            partido.grada_animar_local,
            partido.grada_respeto_local,
            partido.grada_participacion_local
        ]
        valid_vals = [v for v in vals if v is not None]
        if valid_vals:
            media_local = sum(valid_vals) / len(valid_vals)
            # Sistema de puntuación normalizado (escala 0-4):
            # >75% (>3) → 1 punto | 50-75% (2-3) → 0.5 puntos | <50% (<2) → 0 puntos
            if media_local > 3:
                partido.puntos_grada_local = 1
            elif media_local >= 2:
                partido.puntos_grada_local = 0.5
            else:
                partido.puntos_grada_local = 0
            
    # Calcular media grada visitante
    if any(k in update_data for k in ['grada_animar_visitante', 'grada_respeto_visitante', 'grada_participacion_visitante']):
        vals = [
            partido.grada_animar_visitante,
            partido.grada_respeto_visitante,
            partido.grada_participacion_visitante
        ]
        valid_vals = [v for v in vals if v is not None]
        if valid_vals:
            media_visitante = sum(valid_vals) / len(valid_vals)
            # Sistema de puntuación normalizado (escala 0-4):
            # >75% (>3) → 1 punto | 50-75% (2-3) → 0.5 puntos | <50% (<2) → 0 puntos
            if media_visitante > 3:
                partido.puntos_grada_visitante = 1
            elif media_visitante >= 2:
                partido.puntos_grada_visitante = 0.5
            else:
                partido.puntos_grada_visitante = 0

    await db.commit()
    await db.refresh(partido)
    
    # Actualizar estadísticas de equipos (Including Arbitro and Grada teams)
    await ClasificacionService.actualizar_stats_equipo(partido.equipo_local_id, db)
    await ClasificacionService.actualizar_stats_equipo(partido.equipo_visitante_id, db)
    
    if partido.arbitro_id:
        await ClasificacionService.actualizar_stats_equipo(partido.arbitro_id, db)
    if partido.tutor_grada_local_id:
        await ClasificacionService.actualizar_stats_equipo(partido.tutor_grada_local_id, db)
    if partido.tutor_grada_visitante_id:
        await ClasificacionService.actualizar_stats_equipo(partido.tutor_grada_visitante_id, db)
    
    return partido

@router.delete("/{partido_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_partido(
    partido_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Eliminar un partido.
    """
    query = select(Partido).filter(Partido.id == partido_id).options(
        selectinload(Partido.liga)
    )
    result = await db.execute(query)
    partido = result.scalar_one_or_none()
    
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
        
    if partido.liga.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos para eliminar este partido")
        
    await db.delete(partido)
    await db.commit()

@router.get("/{partido_id}/export/acta")
async def export_acta_pdf(
    partido_id: int,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Exportar acta del partido a PDF.
    """
    query = select(Partido).filter(Partido.id == partido_id).options(
        selectinload(Partido.liga),
        selectinload(Partido.tipo_deporte),
        selectinload(Partido.equipo_local),
        selectinload(Partido.equipo_visitante)
    )
    result = await db.execute(query)
    partido = result.scalar_one_or_none()
    
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
        
    if partido.liga.usuario_id != current_user.id:
        raise HTTPException(status_code=403, detail="No tienes permisos")
        
    from app.services.report_service import ReportService
    from fastapi.responses import Response
    
    # Convertir objeto SQLAlchemy a dict para el servicio
    partido_dict = {
        "id": partido.id,
        "fecha_hora": partido.fecha_hora.strftime('%d/%m/%Y %H:%M') if partido.fecha_hora else None,
        "jornada_id": partido.jornada_id,
        "tipo_deporte": {"nombre": partido.tipo_deporte.nombre},
        "equipo_local": {"nombre": partido.equipo_local.nombre},
        "equipo_visitante": {"nombre": partido.equipo_visitante.nombre},
        "puntos_local": partido.puntos_local,
        "puntos_visitante": partido.puntos_visitante,
        "puntos_juego_limpio_local": partido.puntos_juego_limpio_local,
        "puntos_juego_limpio_visitante": partido.puntos_juego_limpio_visitante,
        "grada_animar_local": partido.grada_animar_local,
        "grada_animar_visitante": partido.grada_animar_visitante,
        "grada_respeto_local": partido.grada_respeto_local,
        "grada_respeto_visitante": partido.grada_respeto_visitante,
        "grada_participacion_local": partido.grada_participacion_local,
        "grada_participacion_visitante": partido.grada_participacion_visitante,
    }
    
    pdf_content = ReportService.generate_acta_partido_pdf(partido_dict)
    
    return Response(
        content=pdf_content,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=acta_partido_{partido_id}.pdf"}
    )
