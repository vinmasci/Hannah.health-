// Configuration file for API keys
// IMPORTANT: Add this file to .gitignore if using version control

const CONFIG = {
    // Spoonacular API Key for recipe search
    // Get your free key at: https://spoonacular.com/food-api/console#Dashboard
    // IMPORTANT: Replace with your own API key!
    // Never commit API keys to public repositories
    SPOONACULAR_API_KEY: process.env.SPOONACULAR_API_KEY || 'YOUR_API_KEY_HERE',
    
    // You can add other API keys here as needed
};

// Export for use in other files
window.CONFIG = CONFIG;