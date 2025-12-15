export interface Liga {
    id: number;
    nombre: string;
    descripcion?: string;
    temporada?: string;
    activa: boolean;
    usuario_id: number;
    created_at: string;
    updated_at?: string;
    public_pin?: string;
}

export interface LigaWithStats extends Liga {
    total_equipos: number;
    total_jornadas: number;
    total_partidos: number;
    tipo_deporte?: {
        id: number;
        nombre: string;
    };
}

export interface CreateLigaData {
    nombre: string;
    descripcion?: string;
    temporada?: string;
}

export interface UpdateLigaData {
    nombre?: string;
    descripcion?: string;
    temporada?: string;
    activa?: boolean;
    public_pin?: string;
}

export interface Jornada {
    id: number;
    nombre: string;
    numero?: number;
    fecha_inicio?: string;
    fecha_fin?: string;
    liga_id: number;
}

export interface JornadaWithStats extends Jornada {
    total_partidos: number;
}

export interface JornadaCreate {
    nombre: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    numero?: number;
    liga_id: number;
}

export interface JornadaUpdate {
    nombre?: string;
    fecha_inicio?: string;
    fecha_fin?: string;
    numero?: number;
}

export interface Equipo {
    id: number;
    nombre: string;
    logo_filename?: string;
    color_principal?: string;
    acceso_token?: string;
    liga_id: number;
    puntos_totales: number;
    ganados: number;
    empatados: number;
    perdidos: number;
    puntos_juego_limpio: number;
    puntos_arbitro: number;
    puntos_grada: number;
}

export interface EquipoCreate {
    nombre: string;
    color_principal?: string;
    liga_id: number;
}

export interface EquipoUpdate {
    nombre?: string;
    color_principal?: string;
}

export interface TipoDeporte {
    id: number;
    nombre: string;
    codigo: string;
    tipo_marcador: string;
}

export interface PartidoCreate {
    liga_id: number;
    jornada_id?: number;
    tipo_deporte_id: number;
    equipo_local_id: number;
    equipo_visitante_id: number;
    arbitro_id?: number;
    tutor_grada_local_id?: number;
    tutor_grada_visitante_id?: number;
    fecha_hora?: string;
}

export interface PartidoUpdateMarcador {
    marcador: Record<string, unknown>;
}

export interface PartidoUpdateEvaluacion {
    puntos_juego_limpio_local?: number;
    puntos_juego_limpio_visitante?: number;
    arbitro_conocimiento?: number;
    arbitro_gestion?: number;
    arbitro_apoyo?: number;
    grada_animar_local?: number;
    grada_respeto_local?: number;
    grada_participacion_local?: number;
    grada_animar_visitante?: number;
    grada_respeto_visitante?: number;
    grada_participacion_visitante?: number;
}

export interface PartidoResponse {
    id: number;
    liga_id: number;
    jornada_id?: number;
    tipo_deporte_id: number;
    equipo_local_id: number;
    equipo_visitante_id: number;
    marcador: Record<string, unknown>;
    puntos_local: number;
    puntos_visitante: number;
    resultado?: string;
    finalizado: boolean;
    fecha_hora?: string;
    puntos_juego_limpio_local: number;
    puntos_juego_limpio_visitante: number;
    puntos_arbitro: number;
    puntos_grada_local: number;
    puntos_grada_visitante: number;
    arbitro_media?: number;
}

export interface PartidoDetailed extends PartidoResponse {
    tipo_deporte: TipoDeporte;
    equipo_local: Equipo;
    equipo_visitante: Equipo;
    arbitro?: Equipo;
    tutor_grada_local?: Equipo;
    tutor_grada_visitante?: Equipo;
    // Evaluation fields
    arbitro_conocimiento?: number;
    arbitro_gestion?: number;
    arbitro_apoyo?: number;
    grada_animar_local?: number;
    grada_respeto_local?: number;
    grada_participacion_local?: number;
    grada_animar_visitante?: number;
    grada_respeto_visitante?: number;
    grada_participacion_visitante?: number;
}

export type LigaResponse = Liga;

export interface Marcador {
    goles_local?: number;
    goles_visitante?: number;
    [key: string]: unknown;
}

export interface ClasificacionItem {
    equipo_id: number;
    equipo_nombre: string;
    posicion: number;
    partidos_jugados: number;
    ganados: number;
    empatados: number;
    perdidos: number;
    puntos_deportivos: number;
    puntos_educativos_total: number;
    puntos_totales: number;
    puntos_juego_limpio: number;
    puntos_arbitro: number;
    puntos_grada: number;
}
