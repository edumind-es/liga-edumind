"""
Modelo Partido - Partid multi-deporte con marcador flexible.
"""
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Partido(Base):
    """Partido entre dos equipos (multi-deporte)."""
    __tablename__ = "partidos"
    
    id = Column(Integer, primary_key=True, index=True)
    liga_id = Column(Integer, ForeignKey("ligas.id"), nullable=False, index=True)
    jornada_id = Column(Integer, ForeignKey("jornadas.id"), nullable=True, index=True)
    tipo_deporte_id = Column(Integer, ForeignKey("tipos_deporte.id"), nullable=False)
    
    # Equipos participantes
    equipo_local_id = Column(Integer, ForeignKey("equipos.id"), nullable=False, index=True)
    equipo_visitante_id = Column(Integer, ForeignKey("equipos.id"), nullable=False, index=True)
    
    # Roles especiales
    arbitro_id = Column(Integer, ForeignKey("equipos.id"), nullable=True)
    tutor_grada_local_id = Column(Integer, ForeignKey("equipos.id"), nullable=True)
    tutor_grada_visitante_id = Column(Integer, ForeignKey("equipos.id"), nullable=True)
    
    # Marcador específico del deporte (JSON flexible)
    marcador = Column(JSON, nullable=False, server_default='{}')
    
    # Puntuación unificada (Sistema EDUmind 3-2-1: todos suman)
    puntos_local = Column(Integer, default=0)  # 3 victoria, 2 empate, 1 derrota
    puntos_visitante = Column(Integer, default=0)
    resultado = Column(String(10), nullable=True)  # "V", "E", "D"
    
    # Estado
    finalizado = Column(Boolean, default=False, nullable=False)
    fecha_hora = Column(DateTime(timezone=True), nullable=True)
    
    # Valores educativos
    puntos_juego_limpio_local = Column(Integer, default=0)
    puntos_juego_limpio_visitante = Column(Integer, default=0)
    puntos_arbitro = Column(Integer, default=0)
    puntos_grada_local = Column(Float, default=0.0)  # Soporta 0, 0.5, 1
    puntos_grada_visitante = Column(Float, default=0.0)  # Soporta 0, 0.5, 1
    
    # Evaluación arbitraje (0-10)
    arbitro_conocimiento = Column(Integer, nullable=True)
    arbitro_gestion = Column(Integer, nullable=True)
    arbitro_apoyo = Column(Integer, nullable=True)
    arbitro_media = Column(Float, nullable=True)
    
    # Evaluación grada (0-10)
    grada_animar_local = Column(Integer, nullable=True)
    grada_respeto_local = Column(Integer, nullable=True)
    grada_participacion_local = Column(Integer, nullable=True)
    grada_animar_visitante = Column(Integer, nullable=True)
    grada_respeto_visitante = Column(Integer, nullable=True)
    grada_participacion_visitante = Column(Integer, nullable=True)
    
    # PIN de acceso público
    pin = Column(String(6), nullable=True, index=True)
    pin_valid_from = Column(DateTime(timezone=True), nullable=True)
    pin_valid_until = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    liga = relationship("Liga", back_populates="partidos")
    jornada = relationship("Jornada", back_populates="partidos")
    tipo_deporte = relationship("TipoDeporte")
    equipo_local = relationship("Equipo", foreign_keys=[equipo_local_id])
    equipo_visitante = relationship("Equipo", foreign_keys=[equipo_visitante_id])
    arbitro = relationship("Equipo", foreign_keys=[arbitro_id])
    tutor_grada_local = relationship("Equipo", foreign_keys=[tutor_grada_local_id])
    tutor_grada_visitante = relationship("Equipo", foreign_keys=[tutor_grada_visitante_id])
    
    def calcular_puntos_desde_marcador(self):
        """
        Convierte marcador del deporte a puntos unificados.
        Sistema EDUmind: +3 victoria, +2 empate, +1 derrota.
        """
        if not self.marcador or not self.tipo_deporte:
            return
        
        # Extraer resultado según tipo de marcador
        tipo = self.tipo_deporte.tipo_marcador
        
        if tipo == "goles":
            local = self.marcador.get("goles_local", 0)
            visitante = self.marcador.get("goles_visitante", 0)
        elif tipo == "sets":
            local = self.marcador.get("sets_local", 0)
            visitante = self.marcador.get("sets_visitante", 0)
        elif tipo == "puntos":
            local = self.marcador.get("puntos_local", 0)
            visitante = self.marcador.get("puntos_visitante", 0)
        elif tipo == "tries":
            # Sumar tries + conversiones para total
            local = (self.marcador.get("tries_local", 0) * 5) + (self.marcador.get("conversiones_local", 0) * 2)
            visitante = (self.marcador.get("tries_visitante", 0) * 5) + (self.marcador.get("conversiones_visitante", 0) * 2)
        elif tipo == "carreras":
            local = self.marcador.get("carreras_local", 0)
            visitante = self.marcador.get("carreras_visitante", 0)
        elif tipo == "towertouchball":
            # Sumar torres (3 puntos) + conos (1 punto cada uno)
            torres_local = self.marcador.get("torres_local", 0)
            torres_visitante = self.marcador.get("torres_visitante", 0)
            
            # Contar conos derribados (True = 1 punto)
            conos_local = sum([
                1 for i in range(1, 7) 
                if self.marcador.get(f"cono_local_{i}", False)
            ])
            conos_visitante = sum([
                1 for i in range(1, 7) 
                if self.marcador.get(f"cono_visitante_{i}", False)
            ])
            
            local = (torres_local * 3) + conos_local
            visitante = (torres_visitante * 3) + conos_visitante
        else:
            # Fallback genérico
            local = self.marcador.get("local", 0)
            visitante = self.marcador.get("visitante", 0)
        
        # Sistema 3-2-1 (todos suman por participar)
        if local > visitante:
            self.puntos_local = 3
            self.puntos_visitante = 1
            self.resultado = "V"
        elif local < visitante:
            self.puntos_local = 1
            self.puntos_visitante = 3
            self.resultado = "D"
        else:
            self.puntos_local = 2
            self.puntos_visitante = 2
            self.resultado = "E"
    
    def __repr__(self):
        return f"<Partido(id={self.id}, local_id={self.equipo_local_id}, visitante_id={self.equipo_visitante_id}, resultado='{self.resultado}')>"
