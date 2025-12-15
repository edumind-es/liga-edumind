# Services package
from app.services.student_code_generator import (
    generar_codigo_estudiante,
    generar_codigos_para_equipo,
    generar_codigos_para_liga,
    validar_codigo,
    obtener_estadisticas_diccionario,
    DICCIONARIO_CODIGOS
)

__all__ = [
    "generar_codigo_estudiante",
    "generar_codigos_para_equipo",
    "generar_codigos_para_liga",
    "validar_codigo",
    "obtener_estadisticas_diccionario",
    "DICCIONARIO_CODIGOS",
]
