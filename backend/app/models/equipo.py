"""
Modelo Equipo - Equipos participantes en una liga.
"""
from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Equipo(Base):
    """Equipo participante en una liga."""
    __tablename__ = "equipos"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    logo_filename = Column(String(255), nullable=True)
    color_principal = Column(String(7), nullable=True)  # Hex color (#FF5733)
    logo_url = Column(String(255), nullable=True)  # URL to team logo image
    
    # Token de acceso público (para QR)
    acceso_token = Column(String(64), unique=True, nullable=True, index=True)
    
    # Liga a la que pertenece
    liga_id = Column(Integer, ForeignKey("ligas.id"), nullable=False, index=True)
    
    # Estadísticas acumuladas (denormalizadas para performance)
    puntos_totales = Column(Integer, default=0)
    ganados = Column(Integer, default=0)
    empatados = Column(Integer, default=0)
    perdidos = Column(Integer, default=0)
    
    # Puntos educativos acumulados
    puntos_juego_limpio = Column(Integer, default=0)
    puntos_arbitro = Column(Integer, default=0)
    puntos_grada = Column(Float, default=0.0)  # Soporta medios puntos (0, 0.5, 1)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relaciones
    liga = relationship("Liga", back_populates="equipos")
    # estudiantes = relationship("Student", back_populates="equipo", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Equipo(id={self.id}, nombre='{self.nombre}', puntos={self.puntos_totales})>"
