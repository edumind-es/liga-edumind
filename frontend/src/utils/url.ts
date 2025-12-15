
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api/v1';

export const getImageUrl = (path: string | undefined | null): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;

    // Remove /api/v1 from the end of API_URL to get Base URL
    const baseUrl = API_URL.replace(/\/api\/v1\/?$/, '');

    // Ensure path starts with / if needed (but /static usually has it)
    const cleanPath = path.startsWith('/') ? path : `/${path}`;

    return `${baseUrl}${cleanPath}`;
};
