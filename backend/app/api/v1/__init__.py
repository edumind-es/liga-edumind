# API v1 routes
from fastapi import APIRouter
from app.api.v1 import auth, ligas, equipos, tipos_deporte, jornadas, partidos, public

api_router = APIRouter()

# Include all route modules
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(ligas.router, prefix="/ligas", tags=["ligas"])
api_router.include_router(equipos.router, prefix="/equipos", tags=["equipos"])
api_router.include_router(tipos_deporte.router, prefix="/tipos-deporte", tags=["tipos-deporte"])
api_router.include_router(jornadas.router, prefix="/jornadas", tags=["jornadas"])
api_router.include_router(partidos.router, prefix="/partidos", tags=["partidos"])
api_router.include_router(public.router, prefix="/public", tags=["public"])

# Future routes:
# api_router.include_router(partidos.router, prefix="/partidos", tags=["partidos"])
