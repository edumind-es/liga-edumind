export interface User {
    id: number;
    codigo: string;
    email: string | null;
    is_active: boolean;
    is_superuser: boolean;
    created_at: string;
    ligas_count?: number;
}

export interface LoginCredentials {
    codigo: string;
    password: string;
}

export interface RegisterData {
    codigo: string;
    email?: string;
    password: string;
}

export interface AuthResponse {
    access_token: string;
    token_type: string;
}
