"""
Modelo TipoDeporte - Catálogo de deportes escolares.
"""
from sqlalchemy import Column, Integer, String, Boolean, Text, DateTime, JSON
from sqlalchemy.sql import func
from app.database import Base

class TipoDeporte(Base):
    """Catálogo de tipos de deportes para partidos."""
    __tablename__ = "tipos_deporte"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(50), unique=True, nullable=False)  # "Fútbol", "Bádminton"
    codigo = Column(String(20), unique=True, nullable=False, index=True)  # "futbol", "badminton"
    
    # Configuración del marcador
    tipo_marcador = Column(String(20), nullable=False)  # "goles", "sets", "puntos", "tries"
    permite_empate = Column(Boolean, default=True, nullable=False)
    
    # Metadata adicional (JSON)
    config = Column(JSON, nullable=True)
    """
    Ejemplos de config:
    - Fútbol: {"tiempo_regulacion": 40, "prórroga": false}
    - Bádminton: {"sets_para_ganar": 2, "puntos_por_set": 21}
    - Rugby: {"valor_try": 5, "valor_conversion": 2}
    """
    
    # Información adicional
    descripcion = Column(Text, nullable=True)
    icono = Column(String(50), nullable=True)  # emoji o código de icono
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    
    def __repr__(self):
        return f"<TipoDeporte(id={self.id}, nombre='{self.nombre}', tipo_marcador='{self.tipo_marcador}')>"
