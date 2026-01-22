// API Configuration
// Determine environment and set appropriate URLs
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

const API_CONFIG = {
    BASE_URL: isProduction 
        ? 'https://lionschatapp-backend.onrender.com'  // Update this with your Render URL
        : 'https://localhost:7218',
    WS_URL: isProduction 
        ? 'https://lionschatapp-backend.onrender.com'  // Update this with your Render URL
        : 'https://localhost:7218'
};

export default API_CONFIG;
