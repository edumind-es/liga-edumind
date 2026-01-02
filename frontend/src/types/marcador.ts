/**
 * Typed interfaces for all scoreboard types in Liga EDUmind
 * Each sport type has its own marcador structure
 */

// Base interface with common timer field
export interface MarcadorBase {
    tiempo_restante?: number;
}

// Goles (Fútbol, Balonmano, Hockey, etc.)
export interface MarcadorGoles extends MarcadorBase {
    goles_local: number;
    goles_visitante: number;
}

// Puntos (Baloncesto, Bádminton, etc.)
export interface MarcadorPuntos extends MarcadorBase {
    puntos_local: number;
    puntos_visitante: number;
}

// Sets (Voleibol, Tenis, Voleibol Sentado, etc.)
export interface MarcadorSets extends MarcadorBase {
    sets_local: number;
    sets_visitante: number;
    set_actual: number;
    puntos_set_actual_local: number;
    puntos_set_actual_visitante: number;
    // Historical set scores
    set_1_local?: number;
    set_1_visitante?: number;
    set_2_local?: number;
    set_2_visitante?: number;
    set_3_local?: number;
    set_3_visitante?: number;
    set_4_local?: number;
    set_4_visitante?: number;
    set_5_local?: number;
    set_5_visitante?: number;
}

// Tries (Rugby Tag, Rugby)
export interface MarcadorTries extends MarcadorBase {
    tries_local: number;
    tries_visitante: number;
    conversiones_local: number;
    conversiones_visitante: number;
}

// Carreras (Béisbol, Softball)
export interface MarcadorCarreras extends MarcadorBase {
    carreras_local: number;
    carreras_visitante: number;
}

// TowerTouchball (specific EDUmind sport)
export interface MarcadorTowerTouchball extends MarcadorBase {
    puntos_local: number;
    puntos_visitante: number;
    conos_local: [boolean, boolean, boolean];
    conos_visitante: [boolean, boolean, boolean];
}

// Union type for any marcador
export type Marcador =
    | MarcadorGoles
    | MarcadorPuntos
    | MarcadorSets
    | MarcadorTries
    | MarcadorCarreras
    | MarcadorTowerTouchball;

// Generic marcador for cases where type is unknown at compile time
// Uses index signature for flexibility - requires type assertions at usage sites
export interface MarcadorGeneric {
    // Timer
    tiempo_restante?: number;
    // Goles
    goles_local?: number;
    goles_visitante?: number;
    // Puntos
    puntos_local?: number;
    puntos_visitante?: number;
    // Sets
    sets_local?: number;
    sets_visitante?: number;
    set_actual?: number;
    puntos_set_actual_local?: number;
    puntos_set_actual_visitante?: number;
    // Tries
    tries_local?: number;
    tries_visitante?: number;
    conversiones_local?: number;
    conversiones_visitante?: number;
    // Carreras
    carreras_local?: number;
    carreras_visitante?: number;
    // TowerTouchball
    conos_local?: boolean[];
    conos_visitante?: boolean[];
    // Allow dynamic key access with unknown type (requires casting at usage)
    [key: string]: unknown;
}

// Sport config type
export interface DeporteConfig {
    puntos_por_try?: number;
    puntos_por_conversion?: number;
    duracion_partido?: number;
    reglas_especiales?: string[];
    [key: string]: unknown;
}

// TipoMarcador literal
export type TipoMarcador = 'goles' | 'puntos' | 'sets' | 'tries' | 'carreras' | 'towertouchball';
