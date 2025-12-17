"""
Modelo Liga - Liga escolar.
"""
from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

class Liga(Base):
    """Liga escolar para competiciones deportivas."""
    __tablename__ = "ligas"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    descripcion = Column(Text, nullable=True)
    temporada = Column(String(20), nullable=True)  # "2024-2025"
    activa = Column(Boolean, default=True, nullable=False)
    modo_competicion = Column(String(20), nullable=False, default='unico_deporte')  # 'unico_deporte' | 'multi_deporte'
    public_pin = Column(String(6), nullable=True)  # PIN de 6 dígitos para acceso público
    
    # Usuario propietario
    usuario_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relaciones
    usuario = relationship("User", back_populates="ligas")
    equipos = relationship("Equipo", back_populates="liga", cascade="all, delete-orphan")
    jornadas = relationship("Jornada", back_populates="liga", cascade="all, delete-orphan")
    partidos = relationship("Partido", back_populates="liga", cascade="all, delete-orphan")
    
    def __repr__(self):
        return f"<Liga(id={self.id}, nombre='{self.nombre}', temporada='{self.temporada}')>"
