"""
Modelo Jornada - Agrupación de partidos.
"""
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Jornada(Base):
    """Jornada que agrupa partidos de una liga."""
    __tablename__ = "jornadas"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)  # "Jornada 1", "Semifinales"
    numero = Column(Integer, nullable=True)  # 1, 2, 3...
    
    # Fechas opcionales
    fecha_inicio = Column(DateTime(timezone=True), nullable=True)
    fecha_fin = Column(DateTime(timezone=True), nullable=True)
    
    # Liga a la que pertenece
    liga_id = Column(Integer, ForeignKey("ligas.id"), nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    # Relaciones
    liga = relationship("Liga", back_populates="jornadas")
    partidos = relationship("Partido", back_populates="jornada", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Jornada(id={self.id}, nombre='{self.nombre}', numero={self.numero})>"
