export interface ExpressTeam {
    id: string;
    nombre: string;
    color?: string;
    rol: 'local' | 'visitante' | 'arbitro' | 'grada_local' | 'grada_visitante';
}

export interface ExpressMatch {
    id: string;
    deporte: {
        id: number;
        nombre: string;
        codigo: string;
        tipo_marcador: string;
        icono: string;
        config?: Record<string, any>;
    };
    equipos: ExpressTeam[];
    marcador: Record<string, any>;
    evaluaciones: {
        juego_limpio?: { local: number; visitante: number };
        arbitro?: { conocimiento: number; gestion: number; apoyo: number };
        grada?: {
            local?: { animar: number; respeto: number; participacion: number };
            visitante?: { animar: number; respeto: number; participacion: number };
        };
    };
    fecha: string;
    finalizado: boolean;
    tiempoInicio?: string;
    duracion?: number;
}

export interface ExpressMatchShare {
    m: string; // match data encoded
    v: number; // version
}
