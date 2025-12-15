# Import all models here for Alembic autogenerate
from app.models.user import User
from app.models.tipo_deporte import TipoDeporte
from app.models.liga import Liga
from app.models.equipo import Equipo
from app.models.jornada import Jornada
from app.models.partido import Partido

__all__ = [
    "User",
    "TipoDeporte",
    "Liga",
    "Equipo",
    "Jornada",
    "Partido",
]
