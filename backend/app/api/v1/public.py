"""
API endpoints for Public Access (QR/PIN).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from jose import jwt, JWTError
from datetime import timedelta

from app.database import get_db
from app.models import Liga, Jornada, Partido, Equipo
from app.schemas import PublicLogin, Token, LigaPublicResponse
from app.utils.security import create_access_token
from app.config import settings
from app.services.clasificacion_service import ClasificacionService

router = APIRouter()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/v1/public/login")

async def get_public_token_payload(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        if payload.get("scope") != "public":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token scope",
                headers={"WWW-Authenticate": "Bearer"},
            )
        return payload
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

@router.post("/login", response_model=Token)
async def public_login(
    login_data: PublicLogin,
    db: AsyncSession = Depends(get_db)
):
    """
    Login público con PIN de liga.
    """
    liga = await db.get(Liga, login_data.liga_id)
    
    if not liga:
        raise HTTPException(status_code=404, detail="Liga no encontrada")
    
    if not liga.public_pin:
        raise HTTPException(status_code=400, detail="Esta liga no tiene acceso público habilitado")
        
    if liga.public_pin != login_data.pin:
        raise HTTPException(status_code=401, detail="PIN incorrecto")
    
    # Create token
    access_token_expires = timedelta(minutes=60 * 24) # 24 hours
    access_token = create_access_token(
        data={"sub": "public", "liga_id": liga.id, "scope": "public"},
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/ligas/{liga_id}", response_model=LigaPublicResponse)
async def get_public_liga(
    liga_id: int,
    payload: dict = Depends(get_public_token_payload),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener datos básicos de la liga (vista pública).
    """
    if payload.get("liga_id") != liga_id:
        raise HTTPException(status_code=403, detail="Token no válido para esta liga")
        
    liga = await db.get(Liga, liga_id)
    if not liga:
        raise HTTPException(status_code=404, detail="Liga no encontrada")
        
    return liga

@router.get("/ligas/{liga_id}/clasificacion")
async def get_public_clasificacion(
    liga_id: int,
    payload: dict = Depends(get_public_token_payload),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener clasificación pública.
    """
    if payload.get("liga_id") != liga_id:
        raise HTTPException(status_code=403, detail="Token no válido para esta liga")
        
    clasificacion = await ClasificacionService.calcular_clasificacion(liga_id, db)
    return {"clasificacion": clasificacion}

@router.get("/ligas/{liga_id}/jornadas")
async def get_public_jornadas(
    liga_id: int,
    payload: dict = Depends(get_public_token_payload),
    db: AsyncSession = Depends(get_db)
):
    """
    Obtener jornadas y partidos (vista pública).
    """
    if payload.get("liga_id") != liga_id:
        raise HTTPException(status_code=403, detail="Token no válido para esta liga")
        
    # Obtener jornadas
    result = await db.execute(
        select(Jornada).where(Jornada.liga_id == liga_id).order_by(Jornada.numero)
    )
    jornadas = result.scalars().all()
    
    # Obtener partidos (podría optimizarse con join)
    result_partidos = await db.execute(
        select(Partido).where(Partido.liga_id == liga_id)
    )
    partidos = result_partidos.scalars().all()
    
    # Estructurar respuesta
    jornadas_data = []
    for jornada in jornadas:
        j_partidos = [p for p in partidos if p.jornada_id == jornada.id]
        jornadas_data.append({
            "id": jornada.id,
            "nombre": jornada.nombre,
            "numero": jornada.numero,
            "fecha_inicio": jornada.fecha_inicio,
            "partidos": j_partidos
        })
        
    return jornadas_data
