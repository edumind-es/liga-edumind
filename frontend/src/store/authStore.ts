import { create } from 'zustand';
import { apiClient } from '@/api/client';
import { User } from '@/types/auth';
import { getErrorMessage } from '@/utils/apiUtils';

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    login: (codigo: string, password: string) => Promise<void>;
    register: (codigo: string, email: string, password: string, aceptaPrivacidad: boolean) => Promise<void>;
    logout: () => void;
    fetchCurrentUser: () => Promise<void>;
    clearError: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isAuthenticated: false,
    isLoading: false,
    error: null,

    login: async (codigo, password) => {
        set({ isLoading: true, error: null });
        try {
            await apiClient.login(codigo, password);
            const user = await apiClient.getCurrentUser();
            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({
                error: getErrorMessage(error),
                isLoading: false
            });
            throw error;
        }
    },

    register: async (codigo, email, password, aceptaPrivacidad) => {
        set({ isLoading: true, error: null });
        try {
            await apiClient.register(codigo, email, password, aceptaPrivacidad);
            // Auto-login after registration
            await apiClient.login(codigo, password);
            const user = await apiClient.getCurrentUser();
            set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
            set({
                error: getErrorMessage(error),
                isLoading: false
            });
            throw error;
        }
    },

    logout: () => {
        apiClient.logout();
        set({ user: null, isAuthenticated: false });
    },

    fetchCurrentUser: async () => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            set({ isAuthenticated: false });
            return;
        }

        set({ isLoading: true });
        try {
            const user = await apiClient.getCurrentUser();
            set({ user, isAuthenticated: true, isLoading: false });
        } catch {
            apiClient.logout();
            set({ user: null, isAuthenticated: false, isLoading: false });
        }
    },

    clearError: () => set({ error: null }),
}));
