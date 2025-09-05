// Main entry point for Meal Planner with AI Recipe Search
// CSS files are loaded via <link> tags in HTML, not imported in JS

// Import configuration first
import './components/config.js';

// Import AI Assistant
import './components/ai-assistant-column.js';

// Import meal planner components
import './services/storageService.js';
import './components/favorites-manager.js';
import './components/app.js';

// Import Shopping List
import './components/ShoppingList.js';

// Import AI Meal Plan (Step 3)
import './components/AIMealPlan.js';

console.log('🍱 Hannah.health Meal Planner with AI Assistant loaded');
console.log('🛒 Shopping List component loaded');
console.log('📋 AI Meal Plan (Step 3) component loaded');