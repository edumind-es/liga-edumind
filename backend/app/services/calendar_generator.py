"""
Service for automatic calendar generation using round-robin algorithm.
Based on /var/www/liga_valores logic with 5-team role rotation.
"""
from typing import List, Dict, Set, Tuple, Optional
from itertools import combinations
import random
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from app.models.partido import Partido
from app.models.equipo import Equipo
from app.models.jornada import Jornada
from datetime import datetime


def _initialize_role_usage(equipos: List[Equipo]) -> Dict[int, Dict[str, int]]:
    """Track how many times each team has been assigned to each role."""
    return {
        equipo.id: {
            "local": 0,
            "visitante": 0,
            "arbitro": 0,
            "grada": 0
        } 
        for equipo in equipos
    }


def _select_support_roles(
    equipos: List[Equipo], 
    uso_roles: Dict, 
    en_juego: Set[int]
) -> Tuple[Optional[Equipo], Optional[Equipo], Optional[Equipo]]:
    """
    Select arbitro, tutor_grada_local, tutor_grada_visitante.
    Prioritize teams with lowest usage in those roles to ensure fairness.
    """
    disponibles = [e for e in equipos if e.id not in en_juego]
    
    if len(disponibles) < 3:
        return None, None, None
    
    # Sort by arbitro usage (ascending) - pick the team that has been arbitro the least
    disponibles.sort(key=lambda e: (uso_roles[e.id]["arbitro"], uso_roles[e.id]["grada"], e.id))
    arbitro = disponibles[0]
    
    # Remove arbitro from available pool
    restantes = [e for e in disponibles if e.id != arbitro.id]
    
    if len(restantes) < 2:
        return arbitro, None, None
    
    # Sort by grada usage - pick teams that have been in stands the least
    restantes.sort(key=lambda e: (uso_roles[e.id]["grada"], uso_roles[e.id]["arbitro"], e.id))
    tutor_grada_local = restantes[0]
    tutor_grada_visitante = restantes[1] if len(restantes) > 1 else None
    
    return arbitro, tutor_grada_local, tutor_grada_visitante


async def generar_calendario_all_vs_all(
    db: AsyncSession,
    jornada_id: int,
    liga_id: int,
    tipo_deporte_id: int
) -> List[Partido]:
    """
    Generate ALL possible matches for a jornada (all-vs-all / all combinations).
    For N teams, generates C(N,2) = N*(N-1)/2 matches.
    
    Used for multi-sport leagues where each jornada plays all possible combinations.
    
    Args:
        db: Database session
        jornada_id: ID of the jornada
        liga_id: ID of the league
        tipo_deporte_id: ID of the sport type
        
    Returns:
        List of created Partido objects
        
    Raises:
        ValueError: If less than 2 teams in league
    """
    # Get all equipos in liga (sorted alphabetically for deterministic ordering)
    result = await db.execute(
        select(Equipo)
        .where(Equipo.liga_id == liga_id)
        .order_by(Equipo.nombre)
    )
    equipos = list(result.scalars().all())
    
    if len(equipos) < 2:
        raise ValueError("Se requieren mínimo 2 equipos para generar calendario")
    
    # Initialize role usage tracking
    uso_roles = _initialize_role_usage(equipos)
    
    # Get all existing partidos to populate role usage stats (excluding current jornada)
    result = await db.execute(
        select(Partido).where(Partido.liga_id == liga_id)
    )
    partidos_existentes = list(result.scalars().all())
    
    for p in partidos_existentes:
        if p.jornada_id == jornada_id:
            continue
        
        if p.equipo_local_id in uso_roles:
            uso_roles[p.equipo_local_id]["local"] += 1
        if p.equipo_visitante_id in uso_roles:
            uso_roles[p.equipo_visitante_id]["visitante"] += 1
        if p.arbitro_id and p.arbitro_id in uso_roles:
            uso_roles[p.arbitro_id]["arbitro"] += 1
        if p.tutor_grada_local_id and p.tutor_grada_local_id in uso_roles:
            uso_roles[p.tutor_grada_local_id]["grada"] += 1
        if p.tutor_grada_visitante_id and p.tutor_grada_visitante_id in uso_roles:
            uso_roles[p.tutor_grada_visitante_id]["grada"] += 1
    
    # Delete existing partidos for this jornada
    await db.execute(
        delete(Partido).where(Partido.jornada_id == jornada_id)
    )
    await db.flush()
    
    partidos_creados = []
    
    # Generate all possible combinations of teams (all-vs-all)
    for equipo_a, equipo_b in combinations(equipos, 2):
        # Determine Local/Visitor based on historical balance
        if uso_roles[equipo_a.id]["local"] <= uso_roles[equipo_b.id]["local"]:
            equipo_local, equipo_visitante = equipo_a, equipo_b
        else:
            equipo_local, equipo_visitante = equipo_b, equipo_a
        
        # Select support roles
        en_juego = {equipo_local.id, equipo_visitante.id}
        arbitro, grada_local, grada_visitante = _select_support_roles(
            equipos, uso_roles, en_juego
        )
        
        # Generate random PIN
        pin = f"{random.randint(0, 999999):06d}"
        
        # Create partido
        partido = Partido(
            liga_id=liga_id,
            jornada_id=jornada_id,
            tipo_deporte_id=tipo_deporte_id,
            equipo_local_id=equipo_local.id,
            equipo_visitante_id=equipo_visitante.id,
            arbitro_id=arbitro.id if arbitro else None,
            tutor_grada_local_id=grada_local.id if grada_local else None,
            tutor_grada_visitante_id=grada_visitante.id if grada_visitante else None,
            fecha_hora=datetime.now(),
            pin=pin,
            marcador={}
        )
        
        db.add(partido)
        partidos_creados.append(partido)
        
        # Update usage for next iteration
        uso_roles[equipo_local.id]["local"] += 1
        uso_roles[equipo_visitante.id]["visitante"] += 1
        if arbitro:
            uso_roles[arbitro.id]["arbitro"] += 1
        if grada_local:
            uso_roles[grada_local.id]["grada"] += 1
        if grada_visitante:
            uso_roles[grada_visitante.id]["grada"] += 1
    
    # Commit all changes
    await db.flush()
    
    return partidos_creados




async def generar_calendario_jornada(
    db: AsyncSession,
    jornada_id: int,
    liga_id: int,
    tipo_deporte_id: int
) -> List[Partido]:
    """
    Generate matches for a jornada using Berger (Round-Robin) algorithm with role rotation.
    Ensures maximum number of matches per jornada (All teams play if even number).
    
    Args:
        db: Database session
        jornada_id: ID of the jornada to generate matches for
        liga_id: ID of the league
        tipo_deporte_id: ID of the sport type
        
    Returns:
        List of created Partido objects
        
    Raises:
        ValueError: If less than 5 teams in league (due to 5-role requirement)
    """
    # Get current jornada info for numbering
    jornada_actual = await db.get(Jornada, jornada_id)
    if not jornada_actual:
        raise ValueError("Jornada no encontrada")

    # Get all equipos in liga (sorted alphabetically for deterministic indexing)
    result = await db.execute(
        select(Equipo)
        .where(Equipo.liga_id == liga_id)
        .order_by(Equipo.nombre)
    )
    equipos = list(result.scalars().all())
    
    if len(equipos) < 5:
        raise ValueError("Se requieren mínimo 5 equipos para generar calendario automático")
    
    # Initialize role usage tracking from historical data
    uso_roles = _initialize_role_usage(equipos)
    
    # Get all existing partidos to populate role usage stats
    result = await db.execute(
        select(Partido).where(Partido.liga_id == liga_id)
    )
    partidos_existentes = list(result.scalars().all())
    
    for p in partidos_existentes:
        # Skip partidos from current jornada (will be deleted)
        if p.jornada_id == jornada_id:
            continue
        
        # Update role usage counts
        if p.equipo_local_id in uso_roles:
            uso_roles[p.equipo_local_id]["local"] += 1
        if p.equipo_visitante_id in uso_roles:
            uso_roles[p.equipo_visitante_id]["visitante"] += 1
        if p.arbitro_id and p.arbitro_id in uso_roles:
            uso_roles[p.arbitro_id]["arbitro"] += 1
        if p.tutor_grada_local_id and p.tutor_grada_local_id in uso_roles:
            uso_roles[p.tutor_grada_local_id]["grada"] += 1
        if p.tutor_grada_visitante_id and p.tutor_grada_visitante_id in uso_roles:
            uso_roles[p.tutor_grada_visitante_id]["grada"] += 1
    
    # Delete existing partidos for this jornada before generating new ones
    await db.execute(
        delete(Partido).where(Partido.jornada_id == jornada_id)
    )
    await db.flush()
    
    # --- Berger Algorithm for Pairing ---
    n = len(equipos)
    equipos_berger = list(equipos) # Copy list
    
    if n % 2 == 1:
        equipos_berger.append(None) # Dummy team for bye
        n += 1
    
    # Calculate round index (0-based) from jornada number
    # Assumes jornada.numero is 1-based.
    ronda_idx = (jornada_actual.numero - 1) % (n - 1)
    
    # Rotate teams: Keep first fixed, rotate the rest
    # teams[0] is fixed. teams[1:] rotates.
    fijo = equipos_berger[0]
    resto = equipos_berger[1:]
    
    # Rotate 'resto' list by 'ronda_idx'
    resto_rotado = resto[ronda_idx:] + resto[:ronda_idx]
    
    # Reconstruct list for pairing
    lista_pairing = [fijo] + resto_rotado
    
    partidos_creados = []
    
    # Pair teams: 0 vs N-1, 1 vs N-2, etc.
    for i in range(n // 2):
        equipo_a = lista_pairing[i]
        equipo_b = lista_pairing[n - 1 - i]
        
        # Skip match if it involves dummy team (bye)
        if equipo_a is None or equipo_b is None:
            continue
            
        # Determine Local/Visitor to balance home/away games
        # Simple alternation based on round number
        if ronda_idx % 2 == 1:
            equipo_local, equipo_visitante = equipo_a, equipo_b
        else:
            equipo_local, equipo_visitante = equipo_b, equipo_a
            
        # Select support roles (arbitro, grada_local, grada_visitante)
        # We allow selecting teams that are playing in other matches of this jornada
        # to ensure we can fill roles even if everyone plays.
        en_juego = {equipo_local.id, equipo_visitante.id}
        
        # Note: _select_support_roles uses current 'uso_roles' to balance load
        arbitro, grada_local, grada_visitante = _select_support_roles(
            equipos, uso_roles, en_juego
        )
        
        # Generate random PIN
        pin = f"{random.randint(0, 999999):06d}"
        
        # Create partido
        partido = Partido(
            liga_id=liga_id,
            jornada_id=jornada_id,
            tipo_deporte_id=tipo_deporte_id,
            equipo_local_id=equipo_local.id,
            equipo_visitante_id=equipo_visitante.id,
            arbitro_id=arbitro.id if arbitro else None,
            tutor_grada_local_id=grada_local.id if grada_local else None,
            tutor_grada_visitante_id=grada_visitante.id if grada_visitante else None,
            fecha_hora=datetime.now(),
            pin=pin,
            marcador={}
        )
        
        db.add(partido)
        partidos_creados.append(partido)
        
        # Update usage for next iteration in this loop (greedy balancing within jornada)
        uso_roles[equipo_local.id]["local"] += 1
        uso_roles[equipo_visitante.id]["visitante"] += 1
        if arbitro:
            uso_roles[arbitro.id]["arbitro"] += 1
        if grada_local:
            uso_roles[grada_local.id]["grada"] += 1
        if grada_visitante:
            uso_roles[grada_visitante.id]["grada"] += 1
            
    # Commit all changes
    await db.flush()
    
    return partidos_creados
