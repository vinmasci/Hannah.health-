// Meal Planner Application JavaScript

// Import data and constants
import { foodDatabase, categoryMetadata, getFoodByName, getAllFoods, getFoodsByCategory } from '../data/foodDatabase.js';
import { unitConversions, MEAL_TYPES, DAYS, DEFAULT_PORTIONS, MACRO_COLORS, INPUT_CONSTRAINTS, STORAGE_KEYS } from '../utils/constants.js';
import { NutritionCalculator } from '../services/nutritionCalculator.js';
import { UnitConverter } from '../services/unitConverter.js';
import { FoodItem } from './FoodItem.js';
import { FoodModule } from './FoodModule.js';
import { MealContainer } from './MealContainer.js';
import { RecipeContainer } from './RecipeContainer.js';
import AIService from '../services/ai-service.js';
import { OpenMojiService } from '../services/openmoji-service.js';
import { EmojiReplacer } from './emoji-replacer.js';
import DragDropManager from '../services/DragDropManager.js';
import aiSearchColumn from './AISearchColumn.js';
import UIStateManager from '../services/UIStateManager.js';
import DayMealManager from './DayMealManager.js';
import AIAssistantColumn from './ai-assistant-column.js';
import AIDisplayColumn from './AIDisplayColumn.js';
import AIUserAssessment from './AIUserAssessment.js';
import nutritionWorkflow from './NutritionWorkflow.js';
import eventBus from '../services/EventBus.js';

// DOM Elements
let mainBoard, categoryPillsContainer;
let activeColumns = [];
let lastActiveDay = null; // Track the last active day column

// Make activeColumns accessible to DragDropManager
window.activeColumns = activeColumns;

// AI Service for AI food chat (not search)
const aiService = new AIService();

// OpenMoji Service for emojis
const openMojiService = new OpenMojiService();
const emojiReplacer = new EmojiReplacer();

// AI Assistant for meal planning
const aiAssistant = new AIAssistantColumn();
window.aiAssistant = aiAssistant;

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    console.log('🍱 Initializing Hannah.health...');
    
    try {
        initializeElements();
        console.log('✅ Elements initialized');
    } catch (e) {
        console.error('❌ Failed to initialize elements:', e);
    }
    
    try {
        setupEventListeners();
        console.log('✅ Event listeners setup');
    } catch (e) {
        console.error('❌ Failed to setup event listeners:', e);
    }
    
    try {
        initializeEventBus();
        console.log('✅ EventBus initialized');
    } catch (e) {
        console.error('❌ Failed to initialize EventBus:', e);
    }
    
    // First create the day columns (needed as reference)
    try {
        DayMealManager.createInitialDayColumns();
        console.log('✅ Day columns created');
    } catch (e) {
        console.error('❌ Failed to create day columns:', e);
    }
    
    // Then initialize the nutrition workflow
    setTimeout(() => {
        try {
            nutritionWorkflow.init(mainBoard);
            console.log('✅ Nutrition workflow initialized');
        } catch (e) {
            console.error('❌ Failed to initialize nutrition workflow:', e);
        }
    }, 100); // Small delay to ensure DOM is ready
    
    // Initialize other services
    try {
        openMojiService.initializeStyles();
        emojiReplacer.init();
        UIStateManager.init();
        RecipeContainer.init();
        console.log('✅ Other services initialized');
    } catch (e) {
        console.error('❌ Failed to initialize other services:', e);
    }
    
    console.log('✅ Hannah.health ready!');
});

function initializeElements() {
    mainBoard = document.querySelector('.main-board');
    categoryPillsContainer = document.querySelector('.category-pills-container');
    
    // Initialize DragDropManager
    DragDropManager.init(mainBoard);
}

function initializeEventBus() {
    // Set up event listeners for module communication
    
    // Listen for food module creation
    eventBus.on('food-module:create', ({ dragData, container, meal }) => {
        const module = createFoodModule(dragData);
        if (module) {
            container.appendChild(module);
            eventBus.emit('meal:update-totals', { meal });
            eventBus.emit('day:update-totals', { dayColumn: meal.closest('.day-column') });
        }
    });
    
    // Listen for Kanban board population from Step 4
    eventBus.on('populate:kanban', ({ weekPlan, userData, preferences, targetCalories }) => {
        console.log('[App] Populating Kanban board with personalized meal plan');
        
        // Populate each day column with the meal plan
        weekPlan.forEach(dayPlan => {
            const dayColumn = document.querySelector(`[data-day="${dayPlan.day}"]`);
            if (!dayColumn) return;
            
            // Process each meal for this day
            dayPlan.meals.forEach(meal => {
                // Find the meal container by meal name
                const mealContainers = dayColumn.querySelectorAll('.meal');
                let targetMealContainer = null;
                
                // Find the meal container that matches this meal type
                mealContainers.forEach(container => {
                    const mealNameEl = container.querySelector('.meal-name');
                    if (mealNameEl) {
                        const mealName = mealNameEl.textContent.trim().toLowerCase();
                        const targetMealType = meal.type.toLowerCase();
                        
                        // Match meal names (e.g., "Breakfast" with "Breakfast", "Morning Snack" with "Morning Snack")
                        if (mealName === targetMealType) {
                            targetMealContainer = container;
                        }
                    }
                });
                
                if (targetMealContainer) {
                    // Find the food modules container within this meal
                    const foodContainer = targetMealContainer.querySelector('.food-modules-container');
                    if (foodContainer) {
                        // Clear existing items
                        foodContainer.innerHTML = '';
                        
                        // Add each food item as a proper food module
                        meal.items.forEach(item => {
                            // Create a proper food module using the global createFoodModule function
                            if (window.createFoodModule && item.dragData) {
                                const module = window.createFoodModule(item.dragData, false);
                                foodContainer.appendChild(module);
                            } else {
                                // Fallback: create simple food item if no dragData
                                const foodItem = document.createElement('div');
                                foodItem.className = 'food-module';
                                foodItem.innerHTML = `
                                    <span class="food-emoji">🍽️</span>
                                    <span class="food-name">${item.name || item}</span>
                                    <button class="remove-btn" onclick="this.parentElement.remove()">×</button>
                                `;
                                foodContainer.appendChild(foodItem);
                            }
                        });
                        
                        // Update meal totals after adding all items
                        UIStateManager.updateMealTotals(targetMealContainer);
                    }
                }
            });
            
            // Update day totals after all meals are populated
            UIStateManager.updateDayTotals(dayColumn);
        });
        
        console.log('[App] Kanban board populated with ' + weekPlan.length + ' days of meals');
    });
    
    // Listen for recipe removal
    eventBus.on('recipe:remove', ({ recipeId }) => {
        const recipe = document.querySelector(`[data-recipe-id="${recipeId}"]`);
        if (!recipe) return;
        
        const meal = recipe.closest('.meal');
        const dayColumn = recipe.closest('.day-column');
        
        recipe.style.animation = 'fadeOutScale 0.3s ease';
        setTimeout(() => {
            recipe.remove();
            eventBus.emit('meal:update-totals', { meal });
            eventBus.emit('day:update-totals', { dayColumn });
        }, 300);
    });
    
    console.log('[App] EventBus listeners initialized');
}

function createAIAssistantColumn() {
    if (window.aiAssistant) {
        const aiColumn = window.aiAssistant.createColumn();
        // Insert AI assistant before the first day column
        const firstDayColumn = mainBoard.querySelector('.day-column');
        if (firstDayColumn) {
            mainBoard.insertBefore(aiColumn, firstDayColumn);
        } else {
            mainBoard.appendChild(aiColumn);
        }
    }
}

function createAIDisplayColumn(insertBefore = null) {
    // Check if display column already exists
    if (document.querySelector('.ai-display-column')) return;
    
    const displayColumn = AIDisplayColumn.create();
    
    if (insertBefore) {
        mainBoard.insertBefore(displayColumn, insertBefore);
    } else {
        // Insert after the AI search column if it exists
        const aiSearchCol = document.querySelector('.ai-search-column');
        if (aiSearchCol && aiSearchCol.nextSibling) {
            mainBoard.insertBefore(displayColumn, aiSearchCol.nextSibling);
        } else {
            mainBoard.appendChild(displayColumn);
        }
    }
    
    activeColumns.push('ai-display');
}

function setupEventListeners() {
    // Category pill drag and click handlers
    document.querySelectorAll('.category-pill').forEach(pill => {
        DragDropManager.attachHandlers(pill, 'pill');
        pill.addEventListener('click', handlePillClick);
    });

    // Main board drop zone for pills
    mainBoard.addEventListener('dragover', DragDropManager.handleBoardDragOver);
    mainBoard.addEventListener('drop', DragDropManager.handleBoardDrop);

    // Header controls
    document.getElementById('addDayBtn')?.addEventListener('click', () => DayMealManager.addNewDay());
}

// Handle pill click - create column next to active day
function handlePillClick(e) {
    const category = e.target.closest('.category-pill').dataset.category;
    
    // Check if category column already exists
    if (document.querySelector(`.category-column[data-category="${category}"]`)) {
        return;
    }
    
    // Find the last active day, or first non-minimized day, or first day column
    let targetDay = lastActiveDay;
    
    // If no active day, find first non-minimized day column
    if (!targetDay) {
        targetDay = document.querySelector('.day-column:not(.minimized)');
    }
    
    // If still no target, just use first day column
    if (!targetDay) {
        targetDay = document.querySelector('.day-column');
    }
    
    if (!targetDay) return;
    
    // Create the category column and insert it before (to the left of) the target day
    createCategoryColumn(category, targetDay);
}

// Drag and Drop Handlers are now in DragDropManager.js

// Create Category Column
function createCategoryColumn(category, insertBefore = null) {
    if (activeColumns.includes(category)) return;
    
    // Handle AI Search column specially
    if (category === 'ai-search') {
        // Create AI Gatherer column
        aiSearchColumn.create(mainBoard, activeColumns, insertBefore);
        
        // Don't auto-create display column - NutritionWorkflow handles this now
        // createAIDisplayColumn(insertBefore);
        return;
    }
    
    // Handle Favorites column specially
    if (category === 'favorites') {
        createFavoritesColumn(insertBefore);
        return;
    }
    
    const column = document.createElement('div');
    column.className = `category-column ${category} animate-in`;
    column.dataset.category = category;
    column.draggable = true;
    
    const categoryData = foodDatabase[category] || [];
    const categoryColors = {
        protein: '#f56565',
        dairy: '#60a5fa',
        veg: '#48bb78',
        fruit: '#ed8936',
        grains: '#a78bfa',
        nuts: '#f59e0b',
        carbs: '#ecc94b',
        drinks: '#06b6d4',
        sweets: '#ec4899',
        extras: '#9f7aea'
    };
    
    const categoryEmojis = {
        protein: '1F356',  // meat on bone
        dairy: '1F95B',    // glass of milk
        veg: '1F966',      // broccoli
        fruit: '1F34E',    // red apple
        grains: '1F33E',   // ear of rice
        nuts: '1F95C',     // peanuts
        carbs: '1F956',    // baguette
        drinks: '1F964',   // cup with straw
        sweets: '1F9C1',   // cupcake
        extras: '2728'     // sparkles
    };
    
    // Category-specific filters
    const categoryFilters = {
        protein: `
            <button class="filter-btn active" onclick="filterByMacro('${category}', 'all', this)">All</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'lean', this)">Lean</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'fish', this)">Fish</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'poultry', this)">Poultry</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'red-meat', this)">Red Meat</button>
        `,
        dairy: `
            <button class="filter-btn active" onclick="filterByMacro('${category}', 'all', this)">All</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'low-fat', this)">Low Fat</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'cheese', this)">Cheese</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'yogurt', this)">Yogurt</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'milk', this)">Milk</button>
        `,
        veg: `
            <button class="filter-btn active" onclick="filterByMacro('${category}', 'all', this)">All</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'leafy', this)">Leafy Greens</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'colorful', this)">Colorful</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'low-carb', this)">Low Carb</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'root', this)">Root Veg</button>
        `,
        fruit: `
            <button class="filter-btn active" onclick="filterByMacro('${category}', 'all', this)">All</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'berries', this)">Berries</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'citrus', this)">Citrus</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'tropical', this)">Tropical</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'low-sugar', this)">Low Sugar</button>
        `,
        grains: `
            <button class="filter-btn active" onclick="filterByMacro('${category}', 'all', this)">All</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'whole', this)">Whole Grain</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'gluten-free', this)">Gluten Free</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'bread', this)">Bread</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'high-fiber', this)">High Fiber</button>
        `,
        nuts: `
            <button class="filter-btn active" onclick="filterByMacro('${category}', 'all', this)">All</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'tree-nuts', this)">Tree Nuts</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'seeds', this)">Seeds</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'butters', this)">Nut Butters</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'low-salt', this)">Low Salt</button>
        `,
        carbs: `
            <button class="filter-btn active" onclick="filterByMacro('${category}', 'all', this)">All</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'potato', this)">Potato</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'sweet', this)">Sweet Potato</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'pasta', this)">Pasta</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'rice', this)">Rice</button>
        `,
        drinks: `
            <button class="filter-btn active" onclick="filterByMacro('${category}', 'all', this)">All</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'zero-cal', this)">Zero Cal</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'coffee', this)">Coffee</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'tea', this)">Tea</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'sports', this)">Sports</button>
        `,
        sweets: `
            <button class="filter-btn active" onclick="filterByMacro('${category}', 'all', this)">All</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'chocolate', this)">Chocolate</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'candy', this)">Candy</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'baked', this)">Baked</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'low-sugar', this)">Low Sugar</button>
        `,
        extras: `
            <button class="filter-btn active" onclick="filterByMacro('${category}', 'all', this)">All</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'sauce', this)">Sauces</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'condiment', this)">Condiments</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'oil', this)">Oils</button>
            <button class="filter-btn" onclick="filterByMacro('${category}', 'spice', this)">Spices</button>
        `
    };
    
    // Create OpenMoji image element
    const emojiImg = openMojiService.createEmojiElement(categoryEmojis[category], 20, category);
    
    column.innerHTML = `
        <div class="category-header ${category}" style="background: ${categoryColors[category]}">
            <span class="category-title">
                <span class="category-emoji"></span>
                ${category.charAt(0).toUpperCase() + category.slice(1)}
            </span>
            <div class="header-buttons">
                <button class="close-column" onclick="removeCategoryColumn('${category}')">×</button>
            </div>
        </div>
        <div class="category-search">
            <input type="text" class="search-input" placeholder="Search ${category}..." 
                   data-category="${category}"
                   onkeyup="filterFoodItems('${category}', this.value)">
            <div class="filter-buttons">
                ${categoryFilters[category] || `
                    <button class="filter-btn active" onclick="filterByMacro('${category}', 'all', this)">All</button>
                    <button class="filter-btn" onclick="filterByMacro('${category}', 'high-protein', this)">High Protein</button>
                    <button class="filter-btn" onclick="filterByMacro('${category}', 'low-carb', this)">Low Carb</button>
                    <button class="filter-btn" onclick="filterByMacro('${category}', 'low-fat', this)">Low Fat</button>
                `}
            </div>
            <button class="ai-search-btn" onclick="openAISearchColumn('${category}')" title="AI Item Search">
                ✨ Find item using AI
            </button>
        </div>
        <div class="category-items" data-category="${category}">
            ${categoryData.map(food => createFoodItemHTML(food, category)).join('')}
        </div>
    `;
    
    // Insert at specified position
    if (insertBefore) {
        mainBoard.insertBefore(column, insertBefore);
    } else {
        // If no position specified, insert before first day column
        const firstDayColumn = mainBoard.querySelector('.day-column');
        if (firstDayColumn) {
            mainBoard.insertBefore(column, firstDayColumn);
        } else {
            mainBoard.appendChild(column);
        }
    }
    
    // Add OpenMoji icon to the header
    const emojiContainer = column.querySelector('.category-emoji');
    if (emojiContainer) {
        emojiContainer.appendChild(emojiImg);
    }
    
    activeColumns.push(category);
    
    // Setup drag handlers for the column itself
    DragDropManager.attachHandlers(column, 'column');
    
    // Setup drop handlers for category items container to accept AI foods
    const itemsContainer = column.querySelector('.category-items');
    if (itemsContainer) {
        DragDropManager.attachHandlers(itemsContainer, 'categoryItems');
    }
    
    
    // Setup drag handlers for food items
    column.querySelectorAll('.food-item').forEach(item => {
        DragDropManager.attachHandlers(item, 'food');
    });
    
    // Setup portion and unit change handlers
    column.querySelectorAll('.portion-input').forEach(input => {
        input.addEventListener('change', handlePortionChange);
    });
    
    column.querySelectorAll('.unit-select').forEach(select => {
        select.addEventListener('change', handleUnitChange);
    });
}

// Create Food Item HTML (delegate to FoodItem component)
function createFoodItemHTML(food, category) {
    return FoodItem.create(food, category);
}

// Get available units for conversion
// Handle portion change
function handlePortionChange(e) {
    const foodItem = e.target.closest('.food-item');
    if (!foodItem) return;
    
    const foodData = JSON.parse(foodItem.dataset.food);
    const newQuantity = parseFloat(e.target.value);
    const ratio = newQuantity / foodData.baseQuantity;
    
    UIStateManager.updateFoodItemMacros(foodItem, foodData, ratio);
}

// Handle unit change
function handleUnitChange(e) {
    const foodItem = e.target.closest('.food-item');
    if (!foodItem) return;
    
    const foodData = JSON.parse(foodItem.dataset.food);
    const currentUnit = foodData.currentUnit || foodData.baseUnit;
    const newUnit = e.target.value;
    const quantityInput = foodItem.querySelector('.portion-input');
    const currentQuantity = parseFloat(quantityInput.value);
    
    // Convert quantity
    const newQuantity = UnitConverter.convert(currentQuantity, currentUnit, newUnit);
    quantityInput.value = newQuantity.toFixed(2);
    
    // Update step and min based on unit
    if (newUnit === 'cup') {
        quantityInput.step = '0.25';
        quantityInput.min = '0.25';
    } else {
        quantityInput.step = '1';
        quantityInput.min = '1';
    }
    quantityInput.dataset.unit = newUnit;
    
    // Update food data
    foodData.currentUnit = newUnit;
    foodItem.dataset.food = JSON.stringify(foodData);
    
    // Calculate ratio for macros
    const baseQuantityInNewUnit = UnitConverter.convert(foodData.baseQuantity, foodData.baseUnit, newUnit);
    const ratio = newQuantity / baseQuantityInNewUnit;
    
    UIStateManager.updateFoodItemMacros(foodItem, foodData, ratio);
}

// Convert units


// Filter food items by search text
function filterFoodItems(category, searchText) {
    const column = document.querySelector(`.category-column[data-category="${category}"]`);
    const items = column.querySelectorAll('.food-item');
    
    items.forEach(item => {
        const foodName = item.querySelector('.food-name').textContent.toLowerCase();
        if (foodName.includes(searchText.toLowerCase())) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Remove a category column
function removeColumn(button) {
    const column = button.closest('.category-column');
    if (!column) return;
    
    const category = column.dataset.category;
    
    // Animate removal
    column.style.animation = 'fadeOut 0.3s ease';
    
    setTimeout(() => {
        column.remove();
        // Remove from activeColumns
        const index = activeColumns.indexOf(category);
        if (index > -1) {
            activeColumns.splice(index, 1);
        }
    }, 300);
}

// Create Favorites Column
function createFavoritesColumn(insertBefore = null) {
    if (activeColumns.includes('favorites')) return;
    
    const column = document.createElement('div');
    column.className = 'category-column favorites animate-in';
    column.dataset.category = 'favorites';
    column.draggable = true;
    
    // Get favorites from localStorage
    const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
    
    column.innerHTML = `
        <div class="category-header favorites-header" style="background: linear-gradient(135deg, #ef4444 0%, #ec4899 100%);">
            <span class="category-title">❤️ Favorites</span>
            <button class="remove-category-btn" onclick="removeColumn(this)">×</button>
        </div>
        <div class="filter-container">
            <input type="text" class="filter-input" placeholder="Search favorites..." 
                   onkeyup="filterFoodItems(this)">
        </div>
        <div class="category-items favorites-items">
            ${favorites.length > 0 ? 
                favorites.map(item => FoodItem.createHTML(item)).join('') :
                `<div class="empty-favorites" style="
                    padding: 40px 20px;
                    text-align: center;
                    color: #999;
                ">
                    <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.5;">💔</div>
                    <div style="font-size: 16px; font-weight: 600; color: #666; margin-bottom: 8px;">No favorites yet!</div>
                    <div style="font-size: 13px; color: #999;">Click the ❤️ on any food item to save it here</div>
                </div>`
            }
        </div>
    `;
    
    // Insert column
    if (insertBefore) {
        mainBoard.insertBefore(column, insertBefore);
    } else {
        // Find the last category column or day column
        const lastColumn = mainBoard.querySelector('.category-column:last-of-type, .day-column:last-of-type');
        if (lastColumn) {
            lastColumn.insertAdjacentElement('afterend', column);
        } else {
            mainBoard.appendChild(column);
        }
    }
    
    activeColumns.push('favorites');
    
    // Setup drag handlers for the column
    DragDropManager.attachHandlers(column, 'column');
    
    // Setup drag handlers for food items
    column.querySelectorAll('.food-item').forEach(item => {
        DragDropManager.attachHandlers(item, 'food');
    });
    
    // Setup portion and unit change handlers
    column.querySelectorAll('.portion-input').forEach(input => {
        input.addEventListener('change', handlePortionChange);
    });
    
    column.querySelectorAll('.unit-select').forEach(select => {
        select.addEventListener('change', handleUnitChange);
    });
}


// Note: AI foods now use regular food item drag handlers
// handleAIFoodDragStart and handleAIFoodDragEnd are no longer needed

// Open AI Search Column next to category column
function openAISearchColumn(categoryName) {
    // Check if AI search column is already open
    if (activeColumns.includes('ai-search')) {
        // If already open, just focus on it
        const aiColumn = document.querySelector('.ai-assistant-column');
        if (aiColumn) {
            aiColumn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
        return;
    }
    
    // Find the category column that triggered this
    const categoryColumn = document.querySelector(`.category-column[data-category="${categoryName}"]`);
    
    // Insert AI search column right after the category column
    if (categoryColumn) {
        aiSearchColumn.create(mainBoard, activeColumns, categoryColumn.nextSibling);
    } else {
        // If no category column found, just create it normally
        aiSearchColumn.create(mainBoard, activeColumns);
    }
}

// AI Food Chat Interface (Modal version - keep for category button)
function openAIFoodChat(category) {
    // Create modal overlay
    const modal = document.createElement('div');
    modal.className = 'ai-chat-modal';
    modal.innerHTML = `
        <div class="ai-chat-container">
            <div class="ai-chat-header">
                <h3>✨ AI Food Creator - ${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                <button class="close-chat" onclick="closeAIFoodChat()">×</button>
            </div>
            <div class="ai-chat-messages" id="aiChatMessages">
                <div class="ai-message">
                    <div class="message-content">
                        Hi! I can help you add any food item to your ${category} list. 
                        Just tell me what you're looking for - it can be a specific brand, 
                        a restaurant item, or any food you can think of!
                    </div>
                </div>
                <div class="ai-message">
                    <div class="message-content">
                        For example: "McDonald's Big Mac", "Woolworths organic eggs", 
                        "homemade lasagna", or "protein smoothie with banana and peanut butter"
                    </div>
                </div>
            </div>
            <div class="ai-chat-input">
                <input type="text" id="aiFoodInput" placeholder="Type any food item..." 
                       onkeypress="if(event.key==='Enter') sendAIFoodRequest('${category}')">
                <button onclick="sendAIFoodRequest('${category}')">Send</button>
            </div>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Focus on input
    setTimeout(() => {
        document.getElementById('aiFoodInput').focus();
    }, 100);
}

function closeAIFoodChat() {
    const modal = document.querySelector('.ai-chat-modal');
    if (modal) {
        modal.remove();
    }
}

function sendAIFoodRequest(category) {
    const input = document.getElementById('aiFoodInput');
    const foodRequest = input.value.trim();
    
    if (!foodRequest) return;
    
    const messagesContainer = document.getElementById('aiChatMessages');
    
    // Add user message
    messagesContainer.innerHTML += `
        <div class="user-message">
            <div class="message-content">${foodRequest}</div>
        </div>
    `;
    
    // Clear input
    input.value = '';
    
    // Simulate AI processing (in real app, this would call an API)
    setTimeout(() => {
        const foodItem = createAIFood(foodRequest, category);
        
        // Add AI response
        messagesContainer.innerHTML += `
            <div class="ai-message">
                <div class="message-content">
                    I've created "${foodItem.name}" for you! Here are the estimated nutritional values:
                </div>
            </div>
            <div class="ai-food-preview">
                <div class="ai-food-name">${foodItem.name}</div>
                <div class="ai-food-macros">
                    <span>🔥 ${foodItem.kcal} kcal</span>
                    <span>💪 ${foodItem.protein}g protein</span>
                    <span>🌾 ${foodItem.carbs}g carbs</span>
                    <span>🥑 ${foodItem.fat}g fat</span>
                </div>
                <button class="add-ai-food" onclick="addAIFoodToCategory('${category}', ${JSON.stringify(foodItem).replace(/"/g, '&quot;')})">
                    Add to ${category}
                </button>
            </div>
        `;
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }, 500);
}

function createAIFood(foodName, category) {
    // Return default values - real nutrition data should come from database
    return {
        name: foodName,
        baseQuantity: 100,
        baseUnit: 'g',
        kcal: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        cost: 0
    };
}


function addAIFoodToCategory(category, foodItem) {
    const column = document.querySelector(`.category-column[data-category="${category}"]`);
    if (!column) {
        console.error('Column not found for category:', category);
        return;
    }
    
    const itemsContainer = column.querySelector('.category-items');
    if (!itemsContainer) {
        console.error('Items container not found in column');
        return;
    }
    
    // Create new food item element
    const newFoodHTML = createFoodItemHTML(foodItem, category);
    
    // Add to the top of the list with animation
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newFoodHTML;
    const newElement = tempDiv.firstElementChild;
    
    if (newElement) {
        newElement.classList.add('ai-added');
        itemsContainer.insertBefore(newElement, itemsContainer.firstChild);
        
        // Setup drag handlers for the new item using DragDropManager
        DragDropManager.attachHandlers(newElement, 'food');
        
        // Setup portion and unit change handlers
        newElement.querySelector('.portion-input')?.addEventListener('change', handlePortionChange);
        newElement.querySelector('.unit-select')?.addEventListener('change', handleUnitChange);
    }
    
    // Close the chat modal
    closeAIFoodChat();
    
    // Show success message
    const successToast = document.createElement('div');
    successToast.className = 'success-toast';
    successToast.textContent = `✅ Added "${foodItem.name}" to ${category}!`;
    document.body.appendChild(successToast);
    
    setTimeout(() => {
        successToast.remove();
    }, 3000);
}


// Filter food items by macro criteria
function filterByMacro(category, filter, buttonElement) {
    const column = document.querySelector(`.category-column[data-category="${category}"]`);
    const items = column.querySelectorAll('.food-item');
    
    // Update active button state
    column.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
    
    items.forEach(item => {
        const foodData = JSON.parse(item.dataset.food);
        let show = true;
        
        show = NutritionCalculator.meetsMacroCriteria(foodData, filter);
        
        item.style.display = show ? 'block' : 'none';
    });
}

// Remove Category Column
function removeCategoryColumn(category) {
    const column = document.querySelector(`.category-column[data-category="${category}"]`);
    if (column) {
        column.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            column.remove();
            activeColumns = activeColumns.filter(c => c !== category);
        }, 300);
    }
}

// Create Initial Day Columns
// Create Day Column
// Create Meal HTML (delegate to MealContainer component)
// Meal Drop Handlers are now in DragDropManager.js
// Note: lastActiveDay update logic needs to be handled in DragDropManager callbacks
window.handleMealDrop = function(e) {
    // Update last active day when dropping in a meal
    const dayColumn = e.currentTarget.closest('.day-column');
    if (dayColumn) {
        lastActiveDay = dayColumn;
    }
    // Delegate to DragDropManager
    DragDropManager.handleMealDrop.call(this, e);
};

// Create Recipe Container (delegate to RecipeContainer component)
function createRecipeContainer(recipeName, recipeId = null) {
    return RecipeContainer.create(recipeName, recipeId);
}

// Create Food Module (delegate to FoodModule component)
function createFoodModule(dragData, isPartOfRecipe = false) {
    return FoodModule.create(dragData, isPartOfRecipe);
}

// Update Module Portion
// Update Module Unit
// Toggle Module Favorite
// Remove Module
// Update Meal Totals (delegate to MealContainer component)
// Update Day Totals
// Meal Management
// Handle meal name click for editing
// Handle meal time editing
// Add New Day
// Recipe handlers are now in DragDropManager.js

// Update Recipe Totals (delegate to RecipeContainer component)
function removeRecipe(recipeId) {
    const recipe = document.querySelector(`[data-recipe-id="${recipeId}"]`);
    if (!recipe) return;
    
    const meal = recipe.closest('.meal');
    const dayColumn = recipe.closest('.day-column');
    
    recipe.style.animation = 'fadeOutScale 0.3s ease';
    setTimeout(() => {
        recipe.remove();
        UIStateManager.updateMealTotals(meal);
        UIStateManager.updateDayTotals(dayColumn);
    }, 300);
}

// Expose functions to global scope for inline event handlers
window.handleMealDragOver = DragDropManager.handleMealDragOver;
window.handleMealDragLeave = DragDropManager.handleMealDragLeave;
// handleMealDrop is defined above to handle lastActiveDay
window.removeCategoryColumn = removeCategoryColumn;
window.removeModule = (moduleId) => eventBus.emit('module:remove', { moduleId });
window.toggleModuleFavorite = (moduleId) => eventBus.emit('module:toggle-favorite', { moduleId });
window.addMeal = (day) => DayMealManager.addMeal(day);
window.deleteMeal = (mealId) => DayMealManager.deleteMeal(mealId);
window.toggleMealMinimize = (mealId) => MealContainer.toggleMinimize(mealId);
window.toggleDayMinimize = (event) => UIStateManager.toggleDayMinimize(event);
window.handleMealNameClick = (event) => DayMealManager.handleMealNameClick(event);
window.handleMealNameBlur = (event, mealId) => DayMealManager.handleMealNameBlur(event, mealId);
window.handleMealNameKeydown = (event) => DayMealManager.handleMealNameKeydown(event);
window.handleMealTimeClick = (event) => DayMealManager.handleMealTimeClick(event);
window.handleMealTimeBlur = (event, mealId) => DayMealManager.handleMealTimeBlur(event, mealId);
window.handleMealTimeKeydown = (event) => DayMealManager.handleMealTimeKeydown(event);
window.handlePillClick = handlePillClick;
window.addNewDay = () => DayMealManager.addNewDay();
window.expandToAddDay = () => DayMealManager.expandToAddDay();
window.filterFoodItems = filterFoodItems;
window.removeColumn = removeColumn;
window.openAISearchColumn = openAISearchColumn;
window.openAIFoodChat = openAIFoodChat;
window.closeAIFoodChat = closeAIFoodChat;
window.sendAIFoodRequest = sendAIFoodRequest;
window.addAIFoodToCategory = addAIFoodToCategory;
// AI Search functions are now in AISearchColumn
window.aiSearchColumn = aiSearchColumn;
// Day/Meal functions are now in DayMealManager
window.dayMealManager = DayMealManager;
window.filterByMacro = filterByMacro;
window.createCategoryColumn = createCategoryColumn;
window.getAvailableUnits = (baseUnit) => UnitConverter.getAvailableUnits(baseUnit);

// Expose food database and functions for AI assistant
window.foodDatabase = foodDatabase;
window.createFoodModule = createFoodModule;
window.updateMealTotals = (meal) => eventBus.emit('meal:update-totals', { meal });
window.updateDayTotals = (dayColumn) => eventBus.emit('day:update-totals', { dayColumn });
window.createRecipeContainer = createRecipeContainer;
window.updateRecipeTotals = (recipeContainer) => eventBus.emit('recipe:update-totals', { recipeContainer });
window.handleRecipeDragOver = DragDropManager.handleRecipeDragOver;
window.handleRecipeDrop = DragDropManager.handleRecipeDrop;
window.toggleRecipeCollapse = (recipeId) => eventBus.emit('recipe:toggle-collapse', { recipeId });
window.removeRecipe = (recipeId) => eventBus.emit('recipe:remove', { recipeId });
window.toggleModuleExpand = (moduleId) => eventBus.emit('module:toggle-expand', { moduleId });
window.toggleFoodItemExpand = (itemId) => eventBus.emit('food-item:toggle-expand', { itemId });

// Animation styles
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: scale(0.9);
        }
    }
    
    @keyframes fadeOutScale {
        to {
            opacity: 0;
            transform: scale(0.8);
        }
    }
`;
document.head.appendChild(animationStyles);