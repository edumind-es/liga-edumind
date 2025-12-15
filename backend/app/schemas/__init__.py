# Import all schemas here
from app.schemas.user import UserCreate, UserLogin, UserResponse, Token, TokenData
from app.schemas.tipo_deporte import TipoDeporteResponse
from app.schemas.liga import (
    LigaCreate,
    LigaUpdate,
    LigaResponse,
    LigaPublicResponse,
    LigaWithStats,
    CalendarCreate,
    PublicLogin,
)
from app.schemas.equipo import EquipoCreate, EquipoUpdate, EquipoResponse, EquipoWithLogo
from app.schemas.partido import (
    PartidoCreate,
    PartidoUpdateMarcador,
    PartidoUpdateEvaluacion,
    PartidoResponse,
    PartidoDetailed,
)
from app.schemas.jornada import JornadaCreate, JornadaUpdate, JornadaResponse, JornadaWithStats

__all__ = [
    # User/Auth
    "UserCreate",
    "UserLogin", 
    "UserResponse",
    "Token",
    "TokenData",
    # TipoDeporte
    "TipoDeporteResponse",
    # Liga
    "LigaCreate",
    "LigaUpdate",
    "LigaResponse",
    "LigaPublicResponse",
    "LigaWithStats",
    "CalendarCreate",
    "PublicLogin",
    # Equipo
    "EquipoCreate",
    "EquipoUpdate",
    "EquipoResponse",
    "EquipoWithLogo",
    # Partido
    "PartidoCreate",
    "PartidoUpdateMarcador",
    "PartidoUpdateEvaluacion",
    "PartidoResponse",
    "PartidoDetailed",
    # Jornada
    "JornadaCreate",
    "JornadaUpdate",
    "JornadaResponse",
    "JornadaWithStats",
]
