"""
API endpoints for Equipos (Teams).
"""
from fastapi import APIRouter, Depends, HTTPException, status, File, UploadFile
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
import secrets
import os

from app.database import get_db
from app.models import Equipo, Liga, User
from app.schemas import EquipoCreate, EquipoUpdate, EquipoResponse
from app.models import Partido, Jornada
from app.api.deps import get_current_user
from app.config import settings

router = APIRouter()

@router.get("/", response_model=List[EquipoResponse])
async def list_equipos_by_liga(
    liga_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Listar todos los equipos de una liga.
    """
    # Verificar que la liga pertenece al usuario
    liga = await db.get(Liga, liga_id)
    if not liga or liga.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liga no encontrada"
        )
    
    result = await db.execute(
        select(Equipo).where(Equipo.liga_id == liga_id)
    )
    equipos = result.scalars().all()
    return equipos

@router.post("/", response_model=EquipoResponse, status_code=status.HTTP_201_CREATED)
async def create_equipo(
    equipo_data: EquipoCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Crear un nuevo equipo en una liga.
    """
    # Verificar que la liga pertenece al usuario
    liga = await db.get(Liga, equipo_data.liga_id)
    if not liga or liga.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Liga no encontrada"
        )
    
    # Generar token de acceso para QR
    acceso_token = secrets.token_urlsafe(32)
    
    nuevo_equipo = Equipo(
        nombre=equipo_data.nombre,
        color_principal=equipo_data.color_principal,
        liga_id=equipo_data.liga_id,
        acceso_token=acceso_token
    )
    
    db.add(nuevo_equipo)
    await db.commit()
    await db.refresh(nuevo_equipo)
    
    return nuevo_equipo

@router.get("/{equipo_id}", response_model=EquipoResponse)
async def get_equipo(
    equipo_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener un equipo específico.
    """
    equipo = await db.get(Equipo, equipo_id)
    
    if not equipo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipo no encontrado"
        )
    
    # Verificar que la liga pertenece al usuario
    liga = await db.get(Liga, equipo.liga_id)
    if not liga or liga.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos"
        )
    
    return equipo

@router.put("/{equipo_id}", response_model=EquipoResponse)
async def update_equipo(
    equipo_id: int,
    equipo_data: EquipoUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Actualizar un equipo.
    """
    equipo = await db.get(Equipo, equipo_id)
    
    if not equipo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipo no encontrado"
        )
    
    # Verificar permisos
    liga = await db.get(Liga, equipo.liga_id)
    if not liga or liga.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos"
        )
    
    # Actualizar campos
    if equipo_data.nombre is not None:
        equipo.nombre = equipo_data.nombre
    if equipo_data.color_principal is not None:
        equipo.color_principal = equipo_data.color_principal
    
    await db.commit()
    await db.refresh(equipo)
    
    return equipo

@router.delete("/{equipo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_equipo(
    equipo_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Eliminar un equipo.
    """
    equipo = await db.get(Equipo, equipo_id)
    
    if not equipo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipo no encontrado"
        )
    
    # Verificar permisos
    liga = await db.get(Liga, equipo.liga_id)
    if not liga or liga.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos"
        )
    
    # Eliminar logo si existe
    if equipo.logo_filename:
        logo_path = os.path.join(settings.UPLOAD_DIR, equipo.logo_filename)
        if os.path.exists(logo_path):
            os.remove(logo_path)
    
    await db.delete(equipo)
    await db.commit()

@router.post("/{equipo_id}/logo")
async def upload_logo(
    equipo_id: int,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Upload and optimize team logo.
    Automatically resizes to 200x200px and converts to WebP format.
    """
    from app.services.image_service import ImageService
    
    equipo = await db.get(Equipo, equipo_id)
    
    if not equipo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipo no encontrado"
        )
    
    # Verificar permisos
    liga = await db.get(Liga, equipo.liga_id)
    if not liga or liga.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos"
        )
    
    # Delete old logo if exists
    if equipo.logo_url:
        ImageService.delete_team_logo(equipo.logo_url)
    
    # Process and save new logo
    logo_url = await ImageService.save_team_logo(file, equipo_id)
    
    # Update equipo
    equipo.logo_url = logo_url
    await db.commit()
    await db.refresh(equipo)
    
    return {
        "logo_url": logo_url,
        "message": "Logo actualizado exitosamente"
    }

@router.delete("/{equipo_id}/logo", status_code=status.HTTP_204_NO_CONTENT)
async def delete_logo(
    equipo_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Delete team logo.
    """
    from app.services.image_service import ImageService
    
    equipo = await db.get(Equipo, equipo_id)
    
    if not equipo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipo no encontrado"
        )
    
    # Verificar permisos
    liga = await db.get(Liga, equipo.liga_id)
    if not liga or liga.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos"
        )
    
    # Delete logo from disk
    if equipo.logo_url:
        ImageService.delete_team_logo(equipo.logo_url)
        equipo.logo_url = None
        await db.commit()


@router.get("/{equipo_id}/stats_history")
async def get_equipo_stats_history(
    equipo_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener historial de estadísticas partido a partido para gráficos de evolución.
    """
    equipo = await db.get(Equipo, equipo_id)
    if not equipo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipo no encontrado"
        )
        
    liga = await db.get(Liga, equipo.liga_id)
    if not liga or liga.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos"
        )

    # Consulta de partidos finalizados donde participa el equipo
    query = select(Partido, Jornada).join(Jornada).where(
        (Partido.liga_id == liga.id) &
        (Partido.finalizado == True) &
        ((Partido.equipo_local_id == equipo_id) | 
         (Partido.equipo_visitante_id == equipo_id) |
         (Partido.arbitro_id == equipo_id))
    ).order_by(Jornada.numero)
    
    result = await db.execute(query)
    rows = result.all()
    
    history = []
    
    for partido, jornada in rows:
        stats = {
            "jornada": f"J{jornada.numero}",
            "jornada_numero": jornada.numero,
            "partido_id": partido.id,
            "juego_limpio": 0,
            "arbitraje": 0.0, # Promedio si fue árbitro, o 0 si no
            "grada": 0.0,
            "rol": "jugador"
        }
        
        if partido.equipo_local_id == equipo_id:
            stats["juego_limpio"] = partido.puntos_juego_limpio_local
            stats["grada"] = partido.puntos_grada_local
            stats["rol"] = "local"
        elif partido.equipo_visitante_id == equipo_id:
            stats["juego_limpio"] = partido.puntos_juego_limpio_visitante
            stats["grada"] = partido.puntos_grada_visitante
            stats["rol"] = "visitante"
        elif partido.arbitro_id == equipo_id:
            # Calcular promedio de arbitraje
            c = partido.arbitro_conocimiento or 0
            g = partido.arbitro_gestion or 0
            a = partido.arbitro_apoyo or 0
            stats["arbitraje"] = round((c + g + a) / 3, 2)
            stats["rol"] = "arbitro"
            
        history.append(stats)
        
    return history

@router.post("/{equipo_id}/regenerate_token")
async def regenerate_token(
    equipo_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Regenerar token de acceso para el equipo.
    """
    equipo = await db.get(Equipo, equipo_id)
    if not equipo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipo no encontrado"
        )
        
    liga = await db.get(Liga, equipo.liga_id)
    if not liga or liga.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos"
        )
        
    # Regenerar token
    new_token = secrets.token_urlsafe(32)
    equipo.acceso_token = new_token
    
    await db.commit()
    await db.refresh(equipo)
    
    return {"acceso_token": new_token}

@router.get("/{equipo_id}/badges")
async def get_equipo_badges(
    equipo_id: int,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener medallas (badges) del equipo calculadas dinámicamente.
    """
    from app.services.badges_service import BadgesService
    
    equipo = await db.get(Equipo, equipo_id)
    if not equipo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Equipo no encontrado"
        )
        
    liga = await db.get(Liga, equipo.liga_id)
    # Allow public access? For now restrict to authorized users as requested in general
    if not liga or liga.usuario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permisos"
        )
        
    badges = await BadgesService.calculate_badges(equipo_id, db)
    return badges
