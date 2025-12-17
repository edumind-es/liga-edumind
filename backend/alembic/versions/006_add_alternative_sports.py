"""Add alternative and adapted sports

Revision ID: 006
Revises: 005
Create Date: 2025-12-16

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '006_add_alternative_sports'
down_revision: Union[str, None] = '005_add_league_competition_mode'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add alternative and adapted sports
    op.execute("""
        INSERT INTO tipos_deporte (nombre, codigo, tipo_marcador, permite_empate, config, icono, descripcion)
        VALUES 
            -- Deportes Alternativos
            ('Kin-Ball', 'kinball', 'puntos', true, '{"equipos": 3, "puntos_para_ganar": 13}', '⚪', 'Deporte cooperativo con pelota grande donde 3 equipos compiten simultáneamente'),
            ('Floorball', 'floorball', 'goles', true, '{"tiempo_regulacion": 60, "jugadores": 6}', '🏑', 'Hockey en sala con stick de plástico y bola perforada'),
            ('Tchoukball', 'tchoukball', 'puntos', true, '{"puntos_para_ganar": 21, "marcos": 2}', '🤾', 'Deporte de equipo sin contacto con marcos de rebote'),
            ('Lacrosse Escolar', 'lacrosse', 'goles', true, '{"tiempo_regulacion": 40, "jugadores": 10}', '🥍', 'Versión adaptada de lacrosse para educación física'),
            ('Quidditch (Quadball)', 'quadball', 'puntos', true, '{"valor_quaffle": 10, "valor_snitch": 30}', '🧹', 'Deporte inspirado en Harry Potter adaptado a tierra'),
            ('Spikeball', 'spikeball', 'puntos', false, '{"puntos_para_ganar": 21, "jugadores": 4}', '🏐', 'Deporte de red circular a nivel del suelo'),
            ('Rounders', 'rounders', 'carreras', true, '{"innings": 5}', '⚾', 'Deporte británico similar al béisbol'),
            ('TowerTouchball', 'towertouchball', 'puntos', true, '{"torres": 4, "puntos_para_ganar": 50}', '🗼', 'Deporte alternativo creado por Luis Vilela con torres como objetivos'),
            ('Datchball', 'datchball', 'puntos', true, '{"puntos_para_ganar": 21}', '🎯', 'Deporte de precisión con lanzamientos a diana'),
            ('Goubak', 'goubak', 'goles', true, '{"tiempo_regulacion": 40, "porterias": 2}', '⚽', 'Deporte colectivo sin contacto con dos porterías por equipo'),
            
            -- Deportes Adaptados y de Discapacidad
            ('Goalball', 'goalball', 'goles', true, '{"tiempo_regulacion": 24, "jugadores": 3}', '🥅', 'Deporte paralímpico para personas con discapacidad visual'),
            ('Boccia', 'boccia', 'puntos', true, '{"bolas_por_jugador": 6}', '🎱', 'Deporte de precisión para personas con discapacidad física severa'),
            ('Sitting Volleyball', 'sitting_vball', 'sets', true, '{"sets_para_ganar": 2, "puntos_por_set": 25}', '🏐', 'Voleibol sentado para personas con discapacidad física'),
            ('Wheelchair Basketball', 'wheelchair_bball', 'puntos', false, '{"cuartos": 4, "duracion_cuarto": 10}', '♿🏀', 'Baloncesto en silla de ruedas'),
            ('Fútbol 5', 'futbol_5', 'goles', true, '{"tiempo_regulacion": 40, "jugadores": 5}', '⚽👁️', 'Fútbol para personas  con discapacidad visual (balon sonoro)'),
            ('Fútbol 7 PC', 'futbol_7_pc', 'goles', true, '{"tiempo_regulacion": 60, "jugadores": 7}', '⚽♿', 'Fútbol para personas con parálisis cerebral'),
            ('Atletismo Adaptado', 'atletismo_adapt', 'tiempo', false, '{"categorias": ["carreras", "saltos", "lanzamientos"]}', '🏃♿', 'Atletismo adaptado para diferentes discapacidades'),
            ('Natación Adaptada', 'natacion_adapt', 'tiempo', false, '{"categorias": ["libre", "espalda", "braza", "mariposa"]}', '🏊♿', 'Natación adaptada para diferentes discapacidades'),
            ('Volleyball Adaptado Ciegos', 'vball_ciegos', 'sets', true, '{"sets_para_ganar": 2, "puntos_por_set": 25}', '🏐👁️', 'Voleibol adaptado para personas con discapacidad visual usando balón sonoro')
    """)


def downgrade() -> None:
    # Remove added sports
    op.execute("""
        DELETE FROM tipos_deporte 
        WHERE codigo IN (
            'kinball', 'floorball', 'tchoukball', 'lacrosse', 'quadball', 
            'spikeball', 'rounders', 'towertouchball', 'datchball', 'goubak',
            'goalball', 'boccia', 'sitting_vball', 'wheelchair_bball',
            'futbol_5', 'futbol_7_pc', 'atletismo_adapt', 'natacion_adapt',
            'vball_ciegos'
        )
    """)
