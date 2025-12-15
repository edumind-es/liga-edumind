"""
Servicio de clasificación para ligas.
Acumula puntos deportivos + puntos educativos (MRPS, arbitraje, grada).
"""
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Dict, Any
from app.models import Liga, Equipo, Partido

class ClasificacionService:
    """Servicio para calcular clasificaciones de ligas."""
    
    @staticmethod
    async def calcular_clasificacion(liga_id: int, db: AsyncSession) -> List[Dict[str, Any]]:
        """
        Calcula la clasificación completa de una liga.
        
        Incluye:
        - Puntos deportivos (3-2-1 sistema EDUmind)
        - Puntos educativos: MRPS + Arbitraje + Grada
        
        Returns:
            Lista de equipos ordenados por puntos totales
        """
        # Obtener todos los equipos de la liga
        result = await db.execute(
            select(Equipo).where(Equipo.liga_id == liga_id)
        )
        equipos = result.scalars().all()
        
        # Obtener todos los partidos finalizados
        result = await db.execute(
            select(Partido).where(
                Partido.liga_id == liga_id,
                Partido.finalizado == True
            )
        )
        partidos = result.scalars().all()
        
        # Inicializar clasificación
        clasificacion = {}
        for equipo in equipos:
            clasificacion[equipo.id] = {
                "equipo_id": equipo.id,
                "equipo_nombre": equipo.nombre,
                "logo_filename": equipo.logo_filename,
                # Puntos deportivos
                "puntos_deportivos": 0,
                "partidos_jugados": 0,
                "ganados": 0,
                "empatados": 0,
                "perdidos": 0,
                # Puntos educativos
                "puntos_juego_limpio": 0,
                "puntos_arbitro": 0,
                "puntos_grada": 0,
                "puntos_educativos_total": 0,
                # Total
                "puntos_totales": 0,
            }
        
        # Procesar partidos
        for partido in partidos:
            # Equipo local
            if partido.equipo_local_id in clasificacion:
                cl = clasificacion[partido.equipo_local_id]
                cl["puntos_deportivos"] += partido.puntos_local
                cl["partidos_jugados"] += 1
                
                if partido.resultado == "V":
                    cl["ganados"] += 1
                elif partido.resultado == "E":
                    cl["empatados"] += 1
                elif partido.resultado == "D":
                    cl["perdidos"] += 1
                
                # Puntos educativos
                cl["puntos_juego_limpio"] += partido.puntos_juego_limpio_local
                cl["puntos_arbitro"] += partido.puntos_arbitro if partido.arbitro_id == partido.equipo_local_id else 0
                cl["puntos_grada"] += partido.puntos_grada_local
            
            # Equipo visitante
            if partido.equipo_visitante_id in clasificacion:
                cv = clasificacion[partido.equipo_visitante_id]
                cv["puntos_deportivos"] += partido.puntos_visitante
                cv["partidos_jugados"] += 1
                
                if partido.resultado == "D":
                    cv["ganados"] += 1
                elif partido.resultado == "E":
                    cv["empatados"] += 1
                elif partido.resultado == "V":
                    cv["perdidos"] += 1
                
                # Puntos educativos
                cv["puntos_juego_limpio"] += partido.puntos_juego_limpio_visitante
                cv["puntos_arbitro"] += partido.puntos_arbitro if partido.arbitro_id == partido.equipo_visitante_id else 0
                cv["puntos_grada"] += partido.puntos_grada_visitante
        
        # Calcular totales
        for equipo_id, datos in clasificacion.items():
            datos["puntos_educativos_total"] = (
                datos["puntos_juego_limpio"] +
                datos["puntos_arbitro"] +
                datos["puntos_grada"]
            )
            datos["puntos_totales"] = (
                datos["puntos_deportivos"] +
                datos["puntos_educativos_total"]
            )
        
        # Ordenar por:
        # 1. Puntos totales (desc)
        # 2. Puntos deportivos (desc)
        # 3. Diferencia ganados-perdidos (desc)
        # 4. Puntos educativos (desc)
        clasificacion_ordenada = sorted(
            clasificacion.values(),
            key=lambda x: (
                x["puntos_totales"],
                x["puntos_deportivos"],
                x["ganados"] - x["perdidos"],
                x["puntos_educativos_total"]
            ),
            reverse=True
        )
        
        # Añadir posición
        for i, equipo in enumerate(clasificacion_ordenada, start=1):
            equipo["posicion"] = i
        
        return clasificacion_ordenada
    
    @staticmethod
    async def actualizar_stats_equipo(equipo_id: int, db: AsyncSession):
        """
        Actualiza las estadísticas denormalizadas de un equipo.
        Se llama después de finalizar un partido.
        """
        equipo = await db.get(Equipo, equipo_id)
        if not equipo:
            return
        
        # Obtener partidos finalizados del equipo
        result = await db.execute(
            select(Partido).where(
                Partido.finalizado == True,
                (Partido.equipo_local_id == equipo_id) | (Partido.equipo_visitante_id == equipo_id)
            )
        )
        partidos = result.scalars().all()
        
        # Resetear stats
        equipo.puntos_totales = 0
        equipo.ganados = 0
        equipo.empatados = 0
        equipo.perdidos = 0
        equipo.puntos_juego_limpio = 0
        equipo.puntos_arbitro = 0
        equipo.puntos_grada = 0
        
        # Acumular
        for partido in partidos:
            if partido.equipo_local_id == equipo_id:
                equipo.puntos_totales += partido.puntos_local
                if partido.resultado == "V":
                    equipo.ganados += 1
                elif partido.resultado == "E":
                    equipo.empatados += 1
                elif partido.resultado == "D":
                    equipo.perdidos += 1
                
                equipo.puntos_juego_limpio += partido.puntos_juego_limpio_local
                if partido.arbitro_id == equipo_id:
                    equipo.puntos_arbitro += partido.puntos_arbitro
                equipo.puntos_grada += partido.puntos_grada_local
            
            elif partido.equipo_visitante_id == equipo_id:
                equipo.puntos_totales += partido.puntos_visitante
                if partido.resultado == "D":
                    equipo.ganados += 1
                elif partido.resultado == "E":
                    equipo.empatados += 1
                elif partido.resultado == "V":
                    equipo.perdidos += 1
                
                equipo.puntos_juego_limpio += partido.puntos_juego_limpio_visitante
                if partido.arbitro_id == equipo_id:
                    equipo.puntos_arbitro += partido.puntos_arbitro
                equipo.puntos_grada += partido.puntos_grada_visitante
        
        # Sumar puntos educativos al total
        equipo.puntos_totales += (
            equipo.puntos_juego_limpio +
            equipo.puntos_arbitro +
            equipo.puntos_grada
        )
        
        await db.commit()
