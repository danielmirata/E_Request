export const API_CONFIG = {
    // If you're running on a physical device, use your computer's local IP address
    // If you're using an emulator, you can use localhost
    BASE_URL: 'http://192.168.1.14:8000', // Replace with your Laravel backend URL
    ENDPOINTS: {
        AUTH: '/api/mobile/login',
        REGISTER: '/api/register',
        USER: '/api/user',
        DOCUMENTS: '/api/documents',
        TRACKING: '/api/tracking',
        LOGOUT: '/api/logout'
    },
    // Request Timeout (in milliseconds)
    TIMEOUT: 10000,
    // Default Headers
    DEFAULT_HEADERS: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
};