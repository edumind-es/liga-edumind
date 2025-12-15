from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class User(Base):
    """Usuario del sistema (docente/administrador)."""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    codigo = Column(String(20), unique=True, nullable=False, index=True)
    email = Column(String(120), unique=True, nullable=True, index=True)
    hashed_password = Column(String(255), nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    is_superuser = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Campos RGPD - Consentimiento (Auditoría LOPD/RGPD 2025-12-15)
    acepta_privacidad = Column(Boolean, default=False, nullable=False)
    fecha_consentimiento = Column(DateTime(timezone=True))
    ip_consentimiento = Column(String(45))  # Soporte IPv6
    
    # Relaciones
    ligas = relationship("Liga", back_populates="usuario")
    
    def __repr__(self):
        return f"<User(id={self.id}, codigo='{self.codigo}')>"
