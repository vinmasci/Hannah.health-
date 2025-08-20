// Configuration file for API keys
// Frontend config - API keys are handled by backend for security

const CONFIG = {
    // API endpoints - all go through backend proxy
    API_BASE_URL: '/api',
    
    // Spoonacular API is handled by backend
    // No API keys exposed in frontend!
    SPOONACULAR_API_KEY: null, // Handled by backend
};

// Export for use in other files
window.CONFIG = CONFIG;