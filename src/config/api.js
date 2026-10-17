// Centralized API configuration
// Controlled via VITE_API_BASE_URL in Front/.env
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

// Backend server root URL (e.g. http://localhost:5000 without /api)
export const BACKEND_URL = API_BASE.replace(/\/api\/?$/, '');

export default API_BASE;
