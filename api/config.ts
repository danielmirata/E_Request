export const API_CONFIG = {
    // If you're running on a physical device, use your computer's local IP address
    // If you're using an emulator, you can use localhost
    BASE_URL: 'http://192.168.254.111:8000', // Replace with your Laravel backend URL
    ENDPOINTS: {
        AUTH: '/api/mobile/login',
        REGISTER: '/api/register',
        USER: '/api/user',
        DOCUMENTS: '/api/documents',
        MY_REQUESTS: '/api/my-requests', // Added my-requests endpoint
        TRACKING: '/api/tracking',
        LOGOUT: '/api/logout',
        COMPLAINTS: '/api/complaints', // Added complaints endpoint
        PROFILE: '/api/profile' // Added profile endpoint
    },
    // Request Timeout (in milliseconds)
    TIMEOUT: 10000,
    // Default Headers
    DEFAULT_HEADERS: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
    }
};