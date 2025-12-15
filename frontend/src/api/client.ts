/// <reference types="vite/client" />
import axios, { AxiosInstance } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api/v1';

export class ApiClient {
    public client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: API_URL,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add auth token to requests if available
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('auth_token');
            if (token) {
                const headers: any = config.headers ?? {};
                const existing =
                    (typeof headers.get === 'function' && (headers.get('Authorization') || headers.get('authorization'))) ||
                    headers.Authorization ||
                    headers.authorization;

                if (!existing) {
                    headers.Authorization = `Bearer ${token}`;
                    config.headers = headers;
                }
            }
            return config;
        });

        // Handle auth errors
        this.client.interceptors.response.use(
            (response) => response,
            (error) => {
                if (error.response?.status === 401) {
                    // Clear token and redirect to login
                    localStorage.removeItem('auth_token');
                    window.location.href = '/login';
                }
                return Promise.reject(error);
            }
        );
    }

    // Auth endpoints
    async register(codigo: string, email: string, password: string, aceptaPrivacidad: boolean) {
        const response = await this.client.post('/auth/register', {
            codigo,
            email,
            password,
            acepta_privacidad: aceptaPrivacidad,
        });
        return response.data;
    }

    async login(codigo: string, password: string) {
        const response = await this.client.post('/auth/login', {
            codigo,
            password,
        });

        if (response.data.access_token) {
            localStorage.setItem('auth_token', response.data.access_token);
        }

        return response.data;
    }

    async getCurrentUser() {
        const response = await this.client.get('/auth/me');
        return response.data;
    }

    logout() {
        localStorage.removeItem('auth_token');
    }
}

export const apiClient = new ApiClient();
