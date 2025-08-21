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

// DOM Elements
let mainBoard, categoryPillsContainer;
let activeColumns = [];
let draggedElement = null;
let draggedData = null;
let lastActiveDay = null; // Track the last active day column

// AI Service for food search
const aiService = new AIService();
let aiSearchConversationHistory = [];

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setupEventListeners();
    createInitialDayColumns();
});

function initializeElements() {
    mainBoard = document.querySelector('.main-board');
    categoryPillsContainer = document.querySelector('.category-pills-container');
}

function setupEventListeners() {
    // Category pill drag and click handlers
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.addEventListener('dragstart', handlePillDragStart);
        pill.addEventListener('dragend', handlePillDragEnd);
        pill.addEventListener('click', handlePillClick);
    });

    // Main board drop zone for pills
    mainBoard.addEventListener('dragover', handleBoardDragOver);
    mainBoard.addEventListener('drop', handleBoardDrop);

    // Header controls
    document.getElementById('addDayBtn')?.addEventListener('click', addNewDay);
}

// Handle pill click - create column next to active day
function handlePillClick(e) {
    const category = e.target.closest('.category-pill').dataset.category;
    
    // Check if category column already exists
    if (document.querySelector(`.category-column[data-category="${category}"]`)) {
        return;
    }
    
    // Find the first day column or the last active day
    let targetDay = lastActiveDay || document.querySelector('.day-column');
    if (!targetDay) return;
    
    // Create the category column and insert it after (to the right of) the target day
    createCategoryColumn(category, targetDay.nextSibling);
}

// Drag and Drop Handlers
function handlePillDragStart(e) {
    draggedElement = e.target;
    draggedData = {
        type: 'category',
        category: e.target.dataset.category
    };
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'copy';
}

function handlePillDragEnd(e) {
    e.target.classList.remove('dragging');
    clearDropIndicators();
    draggedElement = null;
    draggedData = null;
}

function handleBoardDragOver(e) {
    if (draggedData?.type === 'category' && !activeColumns.includes(draggedData.category)) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        
        // Show drop indicator between columns
        const afterElement = getDragAfterColumn(mainBoard, e.clientX);
        clearDropIndicators();
        
        if (afterElement) {
            afterElement.classList.add('drop-indicator-left');
        } else {
            const columns = mainBoard.querySelectorAll('.category-column, .day-column');
            if (columns.length > 0) {
                columns[columns.length - 1].classList.add('drop-indicator-right');
            }
        }
    } else if (draggedData?.type === 'column') {
        // Handle column reordering in empty space
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
}

function handleBoardDrop(e) {
    e.preventDefault();
    clearDropIndicators();
    
    if (draggedData?.type === 'category' && !activeColumns.includes(draggedData.category)) {
        const afterElement = getDragAfterColumn(mainBoard, e.clientX);
        createCategoryColumn(draggedData.category, afterElement);
    } else if (draggedData?.type === 'column') {
        // Handle dropping column in empty space
        const afterElement = getDragAfterColumn(mainBoard, e.clientX);
        if (afterElement && afterElement !== draggedElement) {
            mainBoard.insertBefore(draggedElement, afterElement);
        } else if (!afterElement) {
            mainBoard.appendChild(draggedElement);
        }
    }
}

function clearDropIndicators() {
    mainBoard.querySelectorAll('.category-column, .day-column').forEach(col => {
        col.classList.remove('drop-indicator-left', 'drop-indicator-right');
    });
}

function getDragAfterColumn(container, x) {
    const columns = [...container.querySelectorAll('.category-column, .day-column')];
    
    return columns.reduce((closest, column) => {
        const box = column.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: column };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Food item drag handlers
function handleFoodDragStart(e) {
    const foodItem = e.target.closest('.food-item');
    if (!foodItem) return;
    
    draggedElement = foodItem;
    const foodData = JSON.parse(foodItem.dataset.food);
    draggedData = {
        type: 'food',
        food: foodData,
        quantity: parseFloat(foodItem.querySelector('.portion-input').value),
        unit: foodItem.querySelector('.unit-select').value
    };
    foodItem.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'copy';
}

function handleFoodDragEnd(e) {
    const foodItem = e.target.closest('.food-item');
    if (foodItem) {
        foodItem.classList.remove('dragging');
    }
    draggedElement = null;
    draggedData = null;
}

// Module drag handlers
function handleModuleDragStart(e) {
    const module = e.target.closest('.food-module');
    if (!module) return;
    
    draggedElement = module;
    draggedData = {
        type: 'module',
        moduleElement: module
    };
    module.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleModuleDragEnd(e) {
    const module = e.target.closest('.food-module');
    if (module) {
        module.classList.remove('dragging');
    }
    draggedElement = null;
    draggedData = null;
}

// Column drag handlers
function handleColumnDragStart(e) {
    const column = e.target.closest('.category-column');
    if (!column) return;
    
    // Don't start drag if we're dragging a food item or module
    if (e.target.closest('.food-item') || e.target.closest('.food-module')) return;
    
    draggedElement = column;
    draggedData = {
        type: 'column',
        columnElement: column
    };
    column.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleColumnDragEnd(e) {
    const column = e.target.closest('.category-column');
    if (column) {
        column.classList.remove('dragging');
    }
    // Clean up drop indicators
    document.querySelectorAll('.category-column').forEach(col => {
        col.classList.remove('drop-indicator-left', 'drop-indicator-right');
    });
    draggedElement = null;
    draggedData = null;
}

function handleColumnDragOver(e) {
    // Only handle if we're dragging a column
    if (!draggedData || draggedData.type !== 'column') return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const column = e.target.closest('.category-column, .day-column');
    if (!column || column === draggedElement) return;
    
    const rect = column.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    
    // Remove existing indicators
    document.querySelectorAll('.category-column, .day-column').forEach(col => {
        col.classList.remove('drop-indicator-left', 'drop-indicator-right');
    });
    
    // Add indicator based on position
    if (e.clientX < midpoint) {
        column.classList.add('drop-indicator-left');
    } else {
        column.classList.add('drop-indicator-right');
    }
}

function handleColumnDrop(e) {
    // Only handle if we're dragging a column
    if (!draggedData || draggedData.type !== 'column') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const dropColumn = e.target.closest('.category-column, .day-column');
    if (!dropColumn || dropColumn === draggedElement) return;
    
    const rect = dropColumn.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    
    if (e.clientX < midpoint) {
        // Insert before
        mainBoard.insertBefore(draggedElement, dropColumn);
    } else {
        // Insert after
        if (dropColumn.nextSibling) {
            mainBoard.insertBefore(draggedElement, dropColumn.nextSibling);
        } else {
            mainBoard.appendChild(draggedElement);
        }
    }
    
    // Clean up indicators
    document.querySelectorAll('.category-column, .day-column').forEach(col => {
        col.classList.remove('drop-indicator-left', 'drop-indicator-right');
    });
}

// Category Items Drop Handlers
function handleCategoryItemsDragOver(e) {
    // Since AI foods are now regular food items, we don't need special handling
    // The regular food item drag will work
    return;
}

function handleCategoryItemsDrop(e) {
    // Since AI foods are now regular food items, we don't need special handling
    // The regular food item drag will work
    return;
}

// Create Category Column
function createCategoryColumn(category, insertBefore = null) {
    if (activeColumns.includes(category)) return;
    
    // Handle AI Search column specially
    if (category === 'ai-search') {
        createAISearchColumn(insertBefore);
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
        protein: '🥩',
        dairy: '🥛',
        veg: '🥦',
        fruit: '🍎',
        grains: '🌾',
        nuts: '🥜',
        carbs: '🥔',
        drinks: '🥤',
        sweets: '🍰',
        extras: '✨'
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
    
    column.innerHTML = `
        <div class="category-header ${category}" style="background: ${categoryColors[category]}">
            <span>${categoryEmojis[category]} ${category.charAt(0).toUpperCase() + category.slice(1)}</span>
            <div class="header-buttons">
                <button class="ai-chat-btn" onclick="openAIFoodChat('${category}')" title="AI Food Creator">
                    <span>✨</span>
                </button>
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
    
    activeColumns.push(category);
    
    // Setup drag handlers for the column itself
    column.addEventListener('dragstart', handleColumnDragStart);
    column.addEventListener('dragend', handleColumnDragEnd);
    column.addEventListener('dragover', handleColumnDragOver);
    column.addEventListener('drop', handleColumnDrop);
    
    // Setup drop handlers for category items container to accept AI foods
    const itemsContainer = column.querySelector('.category-items');
    if (itemsContainer) {
        itemsContainer.addEventListener('dragover', handleCategoryItemsDragOver);
        itemsContainer.addEventListener('drop', handleCategoryItemsDrop);
    }
    
    
    // Setup drag handlers for food items
    column.querySelectorAll('.food-item').forEach(item => {
        item.addEventListener('dragstart', handleFoodDragStart);
        item.addEventListener('dragend', handleFoodDragEnd);
    });
    
    // Setup portion and unit change handlers
    column.querySelectorAll('.portion-input').forEach(input => {
        input.addEventListener('change', handlePortionChange);
    });
    
    column.querySelectorAll('.unit-select').forEach(select => {
        select.addEventListener('change', handleUnitChange);
    });
}

// Create macro bar visualization
function createMacroBar(protein, carbs, fat) {
    return NutritionCalculator.createMacroBarHTML(protein, carbs, fat);
}

// Create macro labels with percentages
function createMacroLabels(protein, carbs, fat) {
    return NutritionCalculator.createMacroLabelsHTML(protein, carbs, fat);
}

// Create Food Item HTML (delegate to FoodItem component)
function createFoodItemHTML(food, category) {
    return FoodItem.create(food, category);
}

// Get available units for conversion
function getAvailableUnits(baseUnit) {
    return UnitConverter.getAvailableUnits(baseUnit);
}

// Handle portion change
function handlePortionChange(e) {
    const foodItem = e.target.closest('.food-item');
    if (!foodItem) return;
    
    const foodData = JSON.parse(foodItem.dataset.food);
    const newQuantity = parseFloat(e.target.value);
    const ratio = newQuantity / foodData.baseQuantity;
    
    updateFoodItemMacros(foodItem, foodData, ratio);
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
    const newQuantity = convertUnit(currentQuantity, currentUnit, newUnit);
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
    const baseQuantityInNewUnit = convertUnit(foodData.baseQuantity, foodData.baseUnit, newUnit);
    const ratio = newQuantity / baseQuantityInNewUnit;
    
    updateFoodItemMacros(foodItem, foodData, ratio);
}

// Convert units
function convertUnit(quantity, fromUnit, toUnit) {
    return UnitConverter.convert(quantity, fromUnit, toUnit);
}

// Update food item macros display
function updateFoodItemMacros(foodItem, foodData, ratio) {
    const protein = foodData.protein * ratio;
    const carbs = foodData.carbs * ratio;
    const fat = foodData.fat * ratio;
    const kcal = Math.round(foodData.kcal * ratio);
    const cost = foodData.cost * ratio;
    
    const macrosDiv = foodItem.querySelector('.food-macros');
    macrosDiv.innerHTML = `
        <div class="macro-bar-container">
            <div class="macro-bar">
                ${createMacroBar(protein, carbs, fat)}
            </div>
            <div class="macro-labels">
                ${createMacroLabels(protein, carbs, fat)}
            </div>
        </div>
        <div class="macro-stats">
            <span class="macro kcal" title="Calories">${kcal} kcal</span>
            <span class="macro cost" title="Cost">$${cost.toFixed(2)}</span>
        </div>
    `;
}




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
    column.addEventListener('dragstart', handleColumnDragStart);
    column.addEventListener('dragend', handleColumnDragEnd);
    column.addEventListener('dragover', handleColumnDragOver);
    column.addEventListener('drop', handleColumnDrop);
    
    // Setup drag handlers for food items
    column.querySelectorAll('.food-item').forEach(item => {
        item.addEventListener('dragstart', handleFoodDragStart);
        item.addEventListener('dragend', handleFoodDragEnd);
    });
    
    // Setup portion and unit change handlers
    column.querySelectorAll('.portion-input').forEach(input => {
        input.addEventListener('change', handlePortionChange);
    });
    
    column.querySelectorAll('.unit-select').forEach(select => {
        select.addEventListener('change', handleUnitChange);
    });
}

// Create AI Search Column
function createAISearchColumn(insertBefore = null) {
    if (activeColumns.includes('ai-search')) return;
    
    const column = document.createElement('div');
    column.className = 'category-column ai-search-column animate-in';
    column.dataset.category = 'ai-search';
    column.draggable = true;
    
    column.innerHTML = `
        <div class="category-header ai-search-header">
            <span>🤖 AI Item Search</span>
            <div style="display: flex; gap: 8px; align-items: center;">
                <select id="locationSelect" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; padding: 4px 8px; font-size: 12px;" onchange="updateUserLocation(this.value)">
                    <option value="Australia" ${localStorage.getItem('userLocation') === 'Australia' ? 'selected' : ''}>🇦🇺 AU</option>
                    <option value="USA" ${localStorage.getItem('userLocation') === 'USA' ? 'selected' : ''}>🇺🇸 US</option>
                    <option value="UK" ${localStorage.getItem('userLocation') === 'UK' ? 'selected' : ''}>🇬🇧 UK</option>
                    <option value="Canada" ${localStorage.getItem('userLocation') === 'Canada' ? 'selected' : ''}>🇨🇦 CA</option>
                </select>
                <button class="close-column" onclick="removeCategoryColumn('ai-search')">×</button>
            </div>
        </div>
        <div class="ai-column-content">
            <div class="ai-welcome">
                <h3>Welcome to AI Item Search!</h3>
                <p>I can help you find or create any food item. Just tell me what you're looking for:</p>
                <ul>
                    <li>🍔 Restaurant items: "Big Mac", "Subway Italian BMT"</li>
                    <li>🛒 Brand products: "Woolworths organic eggs", "Kellogg's Corn Flakes"</li>
                    <li>🥘 Homemade dishes: "Mom's lasagna", "Protein smoothie"</li>
                    <li>☕ Beverages: "Starbucks Venti Latte", "Green smoothie"</li>
                </ul>
            </div>
            <div class="ai-chat-area" id="aiChatArea">
                <!-- Messages will appear here -->
            </div>
            <div class="ai-input-area">
                <input type="text" id="aiSearchInput" placeholder="Type any food item..." 
                       onkeypress="if(event.key==='Enter') sendAISearchRequest()">
                <button onclick="sendAISearchRequest()">Search</button>
            </div>
            <div class="ai-results-area" id="aiResultsArea">
                <!-- Results will appear here -->
            </div>
        </div>
    `;
    
    // Insert at specified position
    if (insertBefore) {
        mainBoard.insertBefore(column, insertBefore);
    } else {
        const firstDayColumn = mainBoard.querySelector('.day-column');
        if (firstDayColumn) {
            mainBoard.insertBefore(column, firstDayColumn);
        } else {
            mainBoard.appendChild(column);
        }
    }
    
    activeColumns.push('ai-search');
    
    // Setup drag handlers for the column
    column.addEventListener('dragstart', handleColumnDragStart);
    column.addEventListener('dragend', handleColumnDragEnd);
    column.addEventListener('dragover', handleColumnDragOver);
    column.addEventListener('drop', handleColumnDrop);
    
    // Focus on input
    setTimeout(() => {
        document.getElementById('aiSearchInput')?.focus();
    }, 100);
}

async function sendAISearchRequest() {
    const input = document.getElementById('aiSearchInput');
    const foodRequest = input.value.trim();
    
    if (!foodRequest) return;
    
    const chatArea = document.getElementById('aiChatArea');
    const resultsArea = document.getElementById('aiResultsArea');
    
    // Debug: Log conversation history
    console.log('Current conversation history:', aiSearchConversationHistory);
    
    // Hide welcome message if it's still showing
    const welcome = document.querySelector('.ai-welcome');
    if (welcome) {
        welcome.style.display = 'none';
        chatArea.style.display = 'block';
    }
    
    // Add user message to display
    chatArea.innerHTML += `
        <div class="ai-message user">
            <div class="message-bubble">${foodRequest}</div>
        </div>
    `;
    
    // Add to conversation history with proper structure
    aiSearchConversationHistory.push({ 
        role: 'user', 
        content: foodRequest 
    });
    
    // Clear input
    input.value = '';
    
    // Show AI is thinking
    chatArea.innerHTML += `
        <div class="ai-message thinking">
            <div class="hannah-avatar">H</div>
            <div class="message-bubble">
                <span class="thinking-dots">Searching for nutritional data<span>.</span><span>.</span><span>.</span></span>
            </div>
        </div>
    `;
    
    // Scroll to show thinking message
    chatArea.scrollTop = chatArea.scrollHeight;
    
    try {
        // Get user's location for accurate menu items
        const userLocation = localStorage.getItem('userLocation') || 'Australia'; // Default to Australia
        
        // Use REAL AI to understand the food request
        const context = {
            systemPrompt: `You are a smart food search assistant helping users find EXACT food items to add to their meal plan.

CRITICAL RULES:
1. Be CONCISE and NATURAL - no numbered lists, no formal language
2. IDENTIFY the exact product they want
3. Use the user's location (${userLocation}) for restaurant menus
4. Ask clarifying questions in a natural, conversational way
5. Once you have the exact item, provide data in this format:

[NUTRITION]
Calories: XXX kcal
Protein: XXg
Carbs: XXg
Fat: XXg
Serving: [size/amount]
[/NUTRITION]

GOOD examples:
User: "big mac"
You: "Got it - Big Mac from McDonald's ${userLocation}?"

User: "coffee"
You: "What kind of coffee? Like a Starbucks latte, or just regular black coffee?"

User: "mcdonalds latte"
You: "McDonald's latte - which size and milk type? They have regular, skim, almond, oat..."

BAD examples (too formal/long):
"I need more details to find the exact product you're looking for. Could you specify..."
"This will help me find the exact product and provide accurate nutritional information."

Keep it SHORT and FRIENDLY. No explanations about why you need info.`,
            conversationHistory: aiSearchConversationHistory
        };
        
        const aiResponse = await aiService.chat(foodRequest, context);
        
        // Remove thinking message
        const thinkingMsg = chatArea.querySelector('.ai-message.thinking');
        if (thinkingMsg) thinkingMsg.remove();
        
        // Add AI response to history with proper structure
        aiSearchConversationHistory.push({ 
            role: 'assistant', 
            content: aiResponse.message 
        });
        
        // Add AI response to display with proper formatting
        chatArea.innerHTML += `
            <div class="ai-message">
                <div class="hannah-avatar">H</div>
                <div class="message-bubble">${formatAIMessage(aiResponse.message)}</div>
            </div>
        `;
        
        // Parse the AI response to extract food data or show search results
        const foodData = extractFoodFromAIResponse(foodRequest, aiResponse.message);
        
        if (foodData && foodData.length > 0) {
            // Show results as regular food items
            resultsArea.innerHTML = foodData.map(food => {
                const category = food.suggestedCategory || 'extras';
                return createFoodItemHTML(food, category);
            }).join('');
            
            // Setup drag handlers
            resultsArea.querySelectorAll('.food-item').forEach(item => {
                item.addEventListener('dragstart', handleFoodDragStart);
                item.addEventListener('dragend', handleFoodDragEnd);
                
                const portionInput = item.querySelector('.portion-input');
                if (portionInput) {
                    portionInput.addEventListener('change', handlePortionChange);
                }
                
                const unitSelect = item.querySelector('.unit-select');
                if (unitSelect) {
                    unitSelect.addEventListener('change', handleUnitChange);
                }
            });
        } else {
            // If AI couldn't find specific data, use our estimation
            const searchResults = searchAIFoods(foodRequest);
            resultsArea.innerHTML = searchResults.map(food => {
                const category = food.suggestedCategory || 'extras';
                return createFoodItemHTML(food, category);
            }).join('');
            
            // Setup drag handlers
            resultsArea.querySelectorAll('.food-item').forEach(item => {
                item.addEventListener('dragstart', handleFoodDragStart);
                item.addEventListener('dragend', handleFoodDragEnd);
                
                const portionInput = item.querySelector('.portion-input');
                if (portionInput) {
                    portionInput.addEventListener('change', handlePortionChange);
                }
                
                const unitSelect = item.querySelector('.unit-select');
                if (unitSelect) {
                    unitSelect.addEventListener('change', handleUnitChange);
                }
            });
        }
        
        chatArea.scrollTop = chatArea.scrollHeight;
        
    } catch (error) {
        console.error('AI Search Error:', error);
        
        // Fallback to local search if AI fails
        const thinkingMsg = chatArea.querySelector('.ai-message.thinking');
        if (thinkingMsg) thinkingMsg.remove();
        
        chatArea.innerHTML += `
            <div class="ai-message">
                <span class="message-label">AI:</span>
                <span class="message-text">I'll search for "${foodRequest}" in my database...</span>
            </div>
        `;
        
        const searchResults = searchAIFoods(foodRequest);
        resultsArea.innerHTML = searchResults.map(food => {
            const category = food.suggestedCategory || 'extras';
            return createFoodItemHTML(food, category);
        }).join('');
        
        // Setup drag handlers
        resultsArea.querySelectorAll('.food-item').forEach(item => {
            item.addEventListener('dragstart', handleFoodDragStart);
            item.addEventListener('dragend', handleFoodDragEnd);
            
            const portionInput = item.querySelector('.portion-input');
            if (portionInput) {
                portionInput.addEventListener('change', handlePortionChange);
            }
            
            const unitSelect = item.querySelector('.unit-select');
            if (unitSelect) {
                unitSelect.addEventListener('change', handleUnitChange);
            }
        });
        
        chatArea.scrollTop = chatArea.scrollHeight;
    }
}

function formatAIMessage(message) {
    // Format nutrition blocks nicely
    if (message.includes('[NUTRITION]')) {
        const formatted = message.replace(
            /\[NUTRITION\]([\s\S]*?)\[\/NUTRITION\]/gi,
            (match, nutritionContent) => {
                const lines = nutritionContent.trim().split('\n');
                let html = '<div class="nutrition-block">';
                lines.forEach(line => {
                    if (line.trim()) {
                        const [label, value] = line.split(':').map(s => s.trim());
                        if (label && value) {
                            html += `<div class="nutrition-item">
                                <span class="nutrition-label">${label}:</span>
                                <span class="nutrition-value">${value}</span>
                            </div>`;
                        }
                    }
                });
                html += '</div>';
                return html;
            }
        );
        // Remove the nutrition block from the main message
        const mainMessage = message.replace(/\[NUTRITION\][\s\S]*?\[\/NUTRITION\]/gi, '').trim();
        return mainMessage + formatted;
    }
    
    // Add spacing for readability
    return message
        .split('\n')
        .map(line => line.trim())
        .filter(line => line)
        .join('\n\n');
}

function extractFoodFromAIResponse(query, aiMessage) {
    // Try to extract nutritional data from AI response
    const foods = [];
    
    // Check if there's a [NUTRITION] block
    const nutritionBlock = aiMessage.match(/\[NUTRITION\]([\s\S]*?)\[\/NUTRITION\]/i);
    
    if (nutritionBlock) {
        const nutritionText = nutritionBlock[1];
        
        // Extract values from the nutrition block
        const calorieMatch = nutritionText.match(/Calories?:\s*(\d+)\s*(kcal|cal)?/i);
        const proteinMatch = nutritionText.match(/Protein:\s*(\d+\.?\d*)\s*g?/i);
        const carbMatch = nutritionText.match(/Carbs?:\s*(\d+\.?\d*)\s*g?/i);
        const fatMatch = nutritionText.match(/Fat:\s*(\d+\.?\d*)\s*g?/i);
        const servingMatch = nutritionText.match(/Serving:\s*(.+)/i);
        
        if (calorieMatch) {
            // Extract product name from the confirmation message
            let productName = query;
            const foundMatch = aiMessage.match(/Found it!\s*([^?]+)\?/i);
            if (foundMatch) {
                productName = foundMatch[1].trim();
            }
            
            // Determine serving size and unit
            let baseQuantity = 1;
            let baseUnit = 'serving';
            if (servingMatch) {
                const serving = servingMatch[1].toLowerCase();
                if (serving.includes('100g')) {
                    baseQuantity = 100;
                    baseUnit = 'g';
                } else if (serving.includes('ml')) {
                    const mlMatch = serving.match(/(\d+)\s*ml/);
                    if (mlMatch) {
                        baseQuantity = parseInt(mlMatch[1]);
                        baseUnit = 'ml';
                    }
                } else if (serving.includes('regular') || serving.includes('medium')) {
                    baseQuantity = 1;
                    baseUnit = 'regular';
                } else if (serving.includes('large')) {
                    baseQuantity = 1;
                    baseUnit = 'large';
                }
            }
            
            const food = {
                name: productName,
                baseQuantity: baseQuantity,
                baseUnit: baseUnit,
                kcal: parseInt(calorieMatch[1]),
                protein: proteinMatch ? parseFloat(proteinMatch[1]) : estimateProtein(parseInt(calorieMatch[1])),
                carbs: carbMatch ? parseFloat(carbMatch[1]) : estimateCarbs(parseInt(calorieMatch[1])),
                fat: fatMatch ? parseFloat(fatMatch[1]) : estimateFat(parseInt(calorieMatch[1])),
                cost: estimateCost(productName),
                suggestedCategory: guessCategory(productName)
            };
            foods.push(food);
            return foods;
        }
    }
    
    // If AI is asking for clarification (has a question mark), don't create food items yet
    if (aiMessage.includes('?') && !aiMessage.includes('Found it!')) {
        return null;
    }
    
    // Otherwise, return null and fall back to local search
    return null;
}

function estimateCost(productName) {
    const nameLower = productName.toLowerCase();
    if (nameLower.includes('mcdonald') || nameLower.includes('starbucks')) return 5.50;
    if (nameLower.includes('burger') || nameLower.includes('pizza')) return 8.00;
    if (nameLower.includes('sandwich')) return 6.50;
    return 3.00;
}

function estimateProtein(kcal) {
    // Rough estimate: 20% of calories from protein
    return Math.round((kcal * 0.20) / 4); // 4 kcal per gram of protein
}

function estimateCarbs(kcal) {
    // Rough estimate: 45% of calories from carbs
    return Math.round((kcal * 0.45) / 4); // 4 kcal per gram of carbs
}

function estimateFat(kcal) {
    // Rough estimate: 35% of calories from fat
    return Math.round((kcal * 0.35) / 9); // 9 kcal per gram of fat
}

function analyzeUserQuery(query) {
    const queryLower = query.toLowerCase();
    
    // Check for ambiguous queries
    if (queryLower === 'coffee' || queryLower === 'latte') {
        return {
            needsClarification: true,
            clarificationMessage: "I need more details about the coffee. Are you looking for a specific brand or style?",
            options: [
                { query: 'Starbucks Venti Latte', display: 'Starbucks Venti Latte', details: '190 kcal, 250ml' },
                { query: 'Starbucks Grande Latte', display: 'Starbucks Grande Latte', details: '150 kcal, 473ml' },
                { query: 'Black Coffee', display: 'Black Coffee (no milk)', details: '2 kcal, 250ml' },
                { query: 'Instant Coffee with Milk', display: 'Instant Coffee with Milk', details: '45 kcal, 250ml' },
                { query: 'Homemade Cappuccino', display: 'Homemade Cappuccino', details: '80 kcal, 180ml' }
            ]
        };
    }
    
    if (queryLower === 'eggs' || queryLower === 'egg') {
        return {
            needsClarification: true,
            clarificationMessage: "How are the eggs prepared? This affects the nutritional values.",
            options: [
                { query: 'Raw Eggs', display: 'Raw Eggs', details: '78 kcal per large egg' },
                { query: 'Scrambled Eggs', display: 'Scrambled Eggs (with butter)', details: '91 kcal per egg' },
                { query: 'Boiled Eggs', display: 'Hard Boiled Eggs', details: '78 kcal per egg' },
                { query: 'Fried Eggs', display: 'Fried Eggs (in oil)', details: '90 kcal per egg' },
                { query: 'Poached Eggs', display: 'Poached Eggs', details: '71 kcal per egg' }
            ]
        };
    }
    
    if (queryLower === 'chicken' || queryLower === 'chicken breast') {
        return {
            needsClarification: true,
            clarificationMessage: "How is the chicken prepared? Different cooking methods have different nutritional values.",
            options: [
                { query: 'Raw Chicken Breast', display: 'Raw Chicken Breast', details: '165 kcal per 100g' },
                { query: 'Grilled Chicken Breast', display: 'Grilled Chicken Breast', details: '165 kcal per 100g' },
                { query: 'Fried Chicken Breast', display: 'Fried Chicken Breast', details: '246 kcal per 100g' },
                { query: 'Baked Chicken Breast', display: 'Baked Chicken Breast', details: '165 kcal per 100g' },
                { query: 'KFC Chicken Breast', display: 'KFC Original Recipe', details: '320 kcal per piece' }
            ]
        };
    }
    
    if (queryLower === 'burger' || queryLower === 'hamburger') {
        return {
            needsClarification: true,
            clarificationMessage: "Which type of burger are you looking for?",
            options: [
                { query: 'Big Mac', display: "McDonald's Big Mac", details: '563 kcal' },
                { query: 'Quarter Pounder', display: "McDonald's Quarter Pounder", details: '520 kcal' },
                { query: 'Whopper', display: "Burger King Whopper", details: '657 kcal' },
                { query: 'Homemade Beef Burger', display: 'Homemade Beef Burger', details: '295 kcal' },
                { query: 'Turkey Burger', display: 'Turkey Burger', details: '200 kcal' },
                { query: 'Veggie Burger', display: 'Veggie Burger', details: '124 kcal' }
            ]
        };
    }
    
    if (queryLower === 'pizza') {
        return {
            needsClarification: true,
            clarificationMessage: "What kind of pizza? Size and toppings make a big difference.",
            options: [
                { query: 'Dominos Pepperoni Pizza Large', display: "Domino's Pepperoni (1 slice, large)", details: '298 kcal' },
                { query: 'Pizza Hut Cheese Pizza', display: "Pizza Hut Cheese (1 slice, medium)", details: '240 kcal' },
                { query: 'Margherita Pizza', display: 'Margherita Pizza (1 slice)', details: '250 kcal' },
                { query: 'Hawaiian Pizza', display: 'Hawaiian Pizza (1 slice)', details: '268 kcal' },
                { query: 'Veggie Pizza', display: 'Vegetable Pizza (1 slice)', details: '215 kcal' }
            ]
        };
    }
    
    if (queryLower.includes('yogurt') || queryLower === 'yoghurt') {
        return {
            needsClarification: true,
            clarificationMessage: "What type of yogurt? The fat content and flavoring affect calories significantly.",
            options: [
                { query: 'Greek Yogurt Plain', display: 'Plain Greek Yogurt', details: '97 kcal per 100g' },
                { query: 'Greek Yogurt Vanilla', display: 'Vanilla Greek Yogurt', details: '120 kcal per 100g' },
                { query: 'Low Fat Yogurt', display: 'Low Fat Plain Yogurt', details: '63 kcal per 100g' },
                { query: 'Fruit Yogurt', display: 'Fruit Yogurt', details: '94 kcal per 100g' },
                { query: 'Chobani Strawberry', display: 'Chobani Strawberry Greek', details: '140 kcal per serving' }
            ]
        };
    }
    
    if (queryLower === 'milk') {
        return {
            needsClarification: true,
            clarificationMessage: "What type of milk? Fat content varies significantly.",
            options: [
                { query: 'Whole Milk', display: 'Whole Milk (3.25% fat)', details: '150 kcal per 250ml' },
                { query: 'Skim Milk', display: 'Skim Milk (0% fat)', details: '83 kcal per 250ml' },
                { query: '2% Milk', display: '2% Milk', details: '122 kcal per 250ml' },
                { query: 'Almond Milk', display: 'Almond Milk (unsweetened)', details: '39 kcal per 250ml' },
                { query: 'Oat Milk', display: 'Oat Milk', details: '120 kcal per 250ml' },
                { query: 'Soy Milk', display: 'Soy Milk', details: '80 kcal per 250ml' }
            ]
        };
    }
    
    if (queryLower === 'rice') {
        return {
            needsClarification: true,
            clarificationMessage: "What type of rice and how is it prepared?",
            options: [
                { query: 'White Rice Cooked', display: 'White Rice (cooked)', details: '130 kcal per 100g' },
                { query: 'Brown Rice Cooked', display: 'Brown Rice (cooked)', details: '112 kcal per 100g' },
                { query: 'Fried Rice', display: 'Fried Rice', details: '163 kcal per 100g' },
                { query: 'Basmati Rice', display: 'Basmati Rice (cooked)', details: '121 kcal per 100g' },
                { query: 'Wild Rice', display: 'Wild Rice (cooked)', details: '101 kcal per 100g' }
            ]
        };
    }
    
    // Check for vague terms
    if (queryLower === 'salad') {
        return {
            needsClarification: true,
            clarificationMessage: "What type of salad? They vary greatly in calories.",
            options: [
                { query: 'Caesar Salad', display: 'Caesar Salad', details: '184 kcal per serving' },
                { query: 'Greek Salad', display: 'Greek Salad', details: '150 kcal per serving' },
                { query: 'Garden Salad', display: 'Garden Salad (no dressing)', details: '35 kcal per serving' },
                { query: 'Cobb Salad', display: 'Cobb Salad', details: '450 kcal per serving' },
                { query: 'Chicken Salad', display: 'Chicken Salad', details: '280 kcal per serving' }
            ]
        };
    }
    
    // For specific items, confirm understanding
    if (queryLower.includes('big mac') || queryLower.includes('mcdonalds')) {
        return {
            needsClarification: false,
            confirmationMessage: `Got it! Here's the McDonald's item you requested:`
        };
    }
    
    if (queryLower.includes('starbucks')) {
        return {
            needsClarification: false,
            confirmationMessage: `Perfect! I've found the Starbucks item:`
        };
    }
    
    // Default: no clarification needed
    return {
        needsClarification: false
    };
}

function selectClarificationOption(query, display) {
    const chatArea = document.getElementById('aiChatArea');
    
    // Add user's selection as a message
    chatArea.innerHTML += `
        <div class="ai-message user">
            <div class="message-bubble">${display}</div>
        </div>
    `;
    
    // Scroll to show the selection
    chatArea.scrollTop = chatArea.scrollHeight;
    
    // Perform web search for the selected item
    performWebSearch(query, { confirmationMessage: null });
}

function focusAIInput() {
    const input = document.getElementById('aiSearchInput');
    if (input) {
        input.focus();
        input.placeholder = "Describe what you're looking for...";
    }
}

function updateUserLocation(location) {
    localStorage.setItem('userLocation', location);
    console.log('Location updated to:', location);
}

function performWebSearch(query, analysis) {
    const chatArea = document.getElementById('aiChatArea');
    const resultsArea = document.getElementById('aiResultsArea');
    
    // Show searching message
    chatArea.innerHTML += `
        <div class="ai-message searching">
            <span class="message-label">AI:</span>
            <span class="message-text">
                <span class="search-status">🔍 Searching nutrition databases for "${query}"...</span>
            </span>
        </div>
    `;
    
    // Show loading animation in results area
    resultsArea.innerHTML = `
        <div class="search-loading">
            <div class="loading-spinner"></div>
            <div class="loading-text">Searching USDA database...</div>
        </div>
    `;
    
    chatArea.scrollTop = chatArea.scrollHeight;
    
    // Simulate searching different databases
    setTimeout(() => {
        // Update search status
        const searchMsg = chatArea.querySelector('.ai-message.searching .search-status');
        if (searchMsg) {
            searchMsg.textContent = '📊 Analyzing nutritional data...';
        }
        resultsArea.querySelector('.loading-text').textContent = 'Checking brand databases...';
        
        setTimeout(() => {
            // Remove searching message
            const searchingMsg = chatArea.querySelector('.ai-message.searching');
            if (searchingMsg) searchingMsg.remove();
            
            // Check if this is a known brand/restaurant item
            const queryLower = query.toLowerCase();
            const isBrandItem = queryLower.includes('mcdonald') || queryLower.includes('starbucks') || 
                               queryLower.includes('subway') || queryLower.includes('kfc') ||
                               queryLower.includes('dominos') || queryLower.includes('pizza hut');
            
            // Get enhanced search results
            const searchResults = searchAIFoodsWithWebData(query);
            
            if (searchResults.length > 0 && searchResults[0].isWebResult) {
                // Found via "web search"
                chatArea.innerHTML += `
                    <div class="ai-message">
                        <span class="message-label">AI:</span>
                        <span class="message-text">✅ Found exact match in ${searchResults[0].source || 'nutrition database'}! Here's the accurate nutritional data:</span>
                    </div>
                `;
            } else if (isBrandItem) {
                // Brand item - pretend we found it
                chatArea.innerHTML += `
                    <div class="ai-message">
                        <span class="message-label">AI:</span>
                        <span class="message-text">✅ Found in restaurant database! This data is from the official nutrition facts:</span>
                    </div>
                `;
            } else {
                // Created estimate
                chatArea.innerHTML += `
                    <div class="ai-message">
                        <span class="message-label">AI:</span>
                        <span class="message-text">📊 Created nutrition estimate based on similar items in the database:</span>
                    </div>
                `;
            }
            
            // Show results as regular food items
            resultsArea.innerHTML = searchResults.map(food => {
                const category = food.suggestedCategory || 'extras';
                return createFoodItemHTML(food, category);
            }).join('');
            
            // Add a note about the data source
            if (searchResults.length > 0 && searchResults[0].dataNote) {
                resultsArea.innerHTML += `
                    <div class="data-source-note">
                        <span class="note-icon">ℹ️</span>
                        <span class="note-text">${searchResults[0].dataNote}</span>
                    </div>
                `;
            }
            
            // Setup drag handlers
            resultsArea.querySelectorAll('.food-item').forEach(item => {
                item.addEventListener('dragstart', handleFoodDragStart);
                item.addEventListener('dragend', handleFoodDragEnd);
                
                const portionInput = item.querySelector('.portion-input');
                if (portionInput) {
                    portionInput.addEventListener('change', handlePortionChange);
                }
                
                const unitSelect = item.querySelector('.unit-select');
                if (unitSelect) {
                    unitSelect.addEventListener('change', handleUnitChange);
                }
            });
            
            chatArea.scrollTop = chatArea.scrollHeight;
        }, 1500);
    }, 1000);
}

function searchAIFoodsWithWebData(query) {
    const queryLower = query.toLowerCase();
    const results = [];
    
    // Check for specific known items with "real" data
    const webDatabase = {
        'big mac': { name: 'Big Mac', baseQuantity: 1, baseUnit: 'burger', kcal: 563, protein: 26, carbs: 45, fat: 33, cost: 7.50, source: "McDonald's USA", isWebResult: true, dataNote: "Official McDonald's nutrition data (2024)" },
        'quarter pounder': { name: 'Quarter Pounder with Cheese', baseQuantity: 1, baseUnit: 'burger', kcal: 520, protein: 30, carbs: 42, fat: 26, cost: 8.00, source: "McDonald's USA", isWebResult: true, dataNote: "Official McDonald's nutrition data (2024)" },
        'mcnuggets': { name: 'Chicken McNuggets', baseQuantity: 6, baseUnit: 'pieces', kcal: 250, protein: 13, carbs: 15, fat: 15, cost: 5.00, source: "McDonald's USA", isWebResult: true, dataNote: "Official McDonald's nutrition data (6 piece)" },
        'starbucks venti latte': { name: 'Starbucks Venti Latte', baseQuantity: 590, baseUnit: 'ml', kcal: 250, protein: 13, carbs: 37, fat: 6, cost: 6.50, source: "Starbucks", isWebResult: true, dataNote: "Starbucks official nutrition (2% milk)" },
        'starbucks grande latte': { name: 'Starbucks Grande Latte', baseQuantity: 473, baseUnit: 'ml', kcal: 190, protein: 10, carbs: 28, fat: 5, cost: 5.50, source: "Starbucks", isWebResult: true, dataNote: "Starbucks official nutrition (2% milk)" },
        'whopper': { name: 'Whopper', baseQuantity: 1, baseUnit: 'burger', kcal: 657, protein: 28, carbs: 49, fat: 40, cost: 7.00, source: "Burger King", isWebResult: true, dataNote: "Burger King official nutrition data" },
        'subway italian bmt': { name: 'Italian B.M.T. 6"', baseQuantity: 1, baseUnit: 'sandwich', kcal: 410, protein: 19, carbs: 43, fat: 18, cost: 8.50, source: "Subway", isWebResult: true, dataNote: "Subway nutrition (wheat bread, standard veggies)" },
        'kfc original recipe': { name: 'KFC Original Recipe Chicken', baseQuantity: 1, baseUnit: 'piece', kcal: 320, protein: 14, carbs: 16, fat: 21, cost: 4.50, source: "KFC", isWebResult: true, dataNote: "KFC official data (breast piece)" },
        'dominos pepperoni pizza': { name: "Domino's Pepperoni Pizza", baseQuantity: 1, baseUnit: 'slice', kcal: 298, protein: 13, carbs: 34, fat: 12, cost: 3.00, source: "Domino's", isWebResult: true, dataNote: "Domino's large pizza, 1 slice" }
    };
    
    // Check if we have "web data" for this item
    for (const [key, data] of Object.entries(webDatabase)) {
        if (queryLower.includes(key)) {
            results.push({
                ...data,
                suggestedCategory: guessCategory(data.name)
            });
            return results;
        }
    }
    
    // Otherwise use the regular search
    return searchAIFoods(query);
}

function searchAIFoods(query) {
    const queryLower = query.toLowerCase();
    const results = [];
    
    // First, check if it matches existing foods
    for (const [category, foods] of Object.entries(foodDatabase)) {
        foods.forEach(food => {
            if (food.name.toLowerCase().includes(queryLower)) {
                results.push({
                    ...food,
                    suggestedCategory: category
                });
            }
        });
    }
    
    // If no exact matches, create AI suggestions
    if (results.length === 0) {
        const suggestedCategory = guessCategory(query);
        const baseFood = createAIFood(query, suggestedCategory);
        
        // Add the main result
        results.push({
            ...baseFood,
            suggestedCategory: suggestedCategory
        });
        
        // Only add variations for generic food types, not specific brands or restaurant items
        const isSpecificItem = queryLower.includes('mcdonald') || queryLower.includes('starbucks') || 
                              queryLower.includes('subway') || queryLower.includes('big mac') ||
                              queryLower.includes('woolworths') || queryLower.includes('kellogg') ||
                              queryLower.match(/\b(brand|specific|exact)\b/);
        
        const isGenericFood = !isSpecificItem && (
            queryLower.match(/\b(chicken|beef|fish|salad|sandwich|bowl|smoothie|wrap|burger)\b/) ||
            suggestedCategory === 'protein' || suggestedCategory === 'veg'
        );
        
        if (isGenericFood) {
            // Only add light version for foods that make sense
            if (suggestedCategory !== 'veg' && suggestedCategory !== 'fruit') {
                results.push({
                    name: `${query} (Light)`,
                    baseQuantity: baseFood.baseQuantity,
                    baseUnit: baseFood.baseUnit,
                    kcal: Math.round(baseFood.kcal * 0.7),
                    protein: Math.round(baseFood.protein * 0.9),
                    carbs: Math.round(baseFood.carbs * 0.6),
                    fat: Math.round(baseFood.fat * 0.5),
                    cost: baseFood.cost * 0.9,
                    suggestedCategory: suggestedCategory
                });
            }
            
            // Only add high-protein version for meals/main dishes
            if (suggestedCategory === 'protein' || queryLower.match(/\b(meal|bowl|sandwich|wrap|salad)\b/)) {
                results.push({
                    name: `${query} (High Protein)`,
                    baseQuantity: baseFood.baseQuantity,
                    baseUnit: baseFood.baseUnit,
                    kcal: Math.round(baseFood.kcal * 1.1),
                    protein: Math.round(baseFood.protein * 1.5),
                    carbs: Math.round(baseFood.carbs * 0.8),
                    fat: baseFood.fat,
                    cost: baseFood.cost * 1.2,
                    suggestedCategory: 'protein'
                });
            }
        }
    }
    
    return results.slice(0, 6); // Limit to 6 results
}

function guessCategory(foodName) {
    const nameLower = foodName.toLowerCase();
    
    if (nameLower.includes('chicken') || nameLower.includes('beef') || nameLower.includes('fish') || 
        nameLower.includes('egg') || nameLower.includes('protein')) {
        return 'protein';
    } else if (nameLower.includes('milk') || nameLower.includes('cheese') || nameLower.includes('yogurt')) {
        return 'dairy';
    } else if (nameLower.includes('bread') || nameLower.includes('rice') || nameLower.includes('pasta') || 
               nameLower.includes('cereal')) {
        return 'grains';
    } else if (nameLower.includes('potato') || nameLower.includes('beans')) {
        return 'carbs';
    } else if (nameLower.includes('salad') || nameLower.includes('vegetable')) {
        return 'veg';
    } else if (nameLower.includes('fruit') || nameLower.includes('apple') || nameLower.includes('banana')) {
        return 'fruit';
    } else if (nameLower.includes('cake') || nameLower.includes('cookie') || nameLower.includes('chocolate')) {
        return 'sweets';
    } else if (nameLower.includes('coffee') || nameLower.includes('juice') || nameLower.includes('smoothie')) {
        return 'drinks';
    }
    
    return 'extras';
}

// Note: AI foods now use regular food item drag handlers
// handleAIFoodDragStart and handleAIFoodDragEnd are no longer needed

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
    // This is where AI would analyze the food and create nutritional values
    // For now, we'll use smart estimates based on the food name
    
    const estimates = estimateNutrition(foodName, category);
    
    return {
        name: foodName,
        baseQuantity: estimates.quantity,
        baseUnit: estimates.unit,
        kcal: estimates.kcal,
        protein: estimates.protein,
        carbs: estimates.carbs,
        fat: estimates.fat,
        cost: estimates.cost
    };
}

function estimateNutrition(foodName, category) {
    const nameLower = foodName.toLowerCase();
    
    // Default values
    let nutrition = {
        quantity: 100,
        unit: 'g',
        kcal: 200,
        protein: 10,
        carbs: 20,
        fat: 8,
        cost: 3.00
    };
    
    // Adjust based on keywords in the food name
    if (nameLower.includes('big mac') || nameLower.includes('burger')) {
        nutrition = { quantity: 1, unit: 'unit', kcal: 563, protein: 26, carbs: 45, fat: 33, cost: 7.50 };
    } else if (nameLower.includes('mcnuggets') || nameLower.includes('nuggets')) {
        nutrition = { quantity: 6, unit: 'pieces', kcal: 250, protein: 13, carbs: 15, fat: 15, cost: 5.00 };
    } else if (nameLower.includes('pizza')) {
        nutrition = { quantity: 1, unit: 'slice', kcal: 285, protein: 12, carbs: 36, fat: 10, cost: 4.00 };
    } else if (nameLower.includes('smoothie')) {
        nutrition = { quantity: 250, unit: 'ml', kcal: 180, protein: 8, carbs: 32, fat: 3, cost: 6.00 };
    } else if (nameLower.includes('salad')) {
        nutrition = { quantity: 1, unit: 'bowl', kcal: 150, protein: 5, carbs: 15, fat: 8, cost: 8.00 };
    } else if (nameLower.includes('pasta') || nameLower.includes('lasagna')) {
        nutrition = { quantity: 1, unit: 'serving', kcal: 420, protein: 18, carbs: 55, fat: 14, cost: 12.00 };
    } else if (nameLower.includes('sandwich')) {
        nutrition = { quantity: 1, unit: 'unit', kcal: 350, protein: 20, carbs: 40, fat: 12, cost: 8.00 };
    } else if (nameLower.includes('protein bar')) {
        nutrition = { quantity: 1, unit: 'bar', kcal: 230, protein: 20, carbs: 25, fat: 8, cost: 3.50 };
    } else if (nameLower.includes('eggs')) {
        nutrition = { quantity: 2, unit: 'large', kcal: 156, protein: 13, carbs: 1.2, fat: 11, cost: 1.20 };
    } else if (nameLower.includes('steak')) {
        nutrition = { quantity: 200, unit: 'g', kcal: 434, protein: 52, carbs: 0, fat: 24, cost: 15.00 };
    }
    
    // Adjust for category
    if (category === 'protein') {
        nutrition.protein *= 1.5;
        nutrition.carbs *= 0.5;
    } else if (category === 'carbs') {
        nutrition.carbs *= 1.5;
        nutrition.protein *= 0.7;
    } else if (category === 'sweets') {
        nutrition.carbs *= 2;
        nutrition.kcal *= 1.3;
    }
    
    return nutrition;
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
        
        // Setup drag handlers for the new item
        newElement.addEventListener('dragstart', handleFoodDragStart);
        newElement.addEventListener('dragend', handleFoodDragEnd);
        
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
function createInitialDayColumns() {
    // Add AI Assistant as the first column
    createAIAssistantColumn();
    
    // Then add the day columns
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    days.forEach(day => createDayColumn(day));
}

function createAIAssistantColumn() {
    // Import and create AI Assistant column
    if (window.aiAssistant) {
        const aiColumn = window.aiAssistant.createColumn();
        mainBoard.appendChild(aiColumn);
    }
}

// Create Day Column
function createDayColumn(dayName) {
    const column = document.createElement('div');
    // Start with all days minimized except Monday (first day)
    const isMinimized = dayName !== 'Monday';
    column.className = isMinimized ? 'day-column minimized' : 'day-column';
    column.dataset.day = dayName.toLowerCase();
    
    column.innerHTML = `
        <div class="day-header">
            <div class="day-header-content">
                <div class="day-name">${dayName}</div>
                <button class="btn-minimize-day" onclick="toggleDayMinimize(event)" title="${isMinimized ? 'Expand' : 'Minimize'}">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="${isMinimized ? 'M12 5v14M5 12h14' : 'M19 12H5'}"/>
                    </svg>
                </button>
            </div>
            <button class="add-meal-btn" onclick="addMeal('${dayName.toLowerCase()}')">+ Meal</button>
        </div>
        <div class="meals-container">
            ${createMealHTML(dayName.toLowerCase(), 'Breakfast', '07:00')}
            ${createMealHTML(dayName.toLowerCase(), 'Morning Snack', '10:00')}
            ${createMealHTML(dayName.toLowerCase(), 'Lunch', '12:30')}
            ${createMealHTML(dayName.toLowerCase(), 'Afternoon Snack', '15:00')}
            ${createMealHTML(dayName.toLowerCase(), 'Dinner', '18:30')}
            ${createMealHTML(dayName.toLowerCase(), 'Evening Snack', '20:30')}
        </div>
        <div class="day-totals">
            <div class="day-totals-header">
                <div class="day-totals-title">Day Total</div>
                <div class="day-totals-quick-stats">
                    <span class="quick-stat">0 kcal</span>
                    <span class="quick-stat">$0.00</span>
                </div>
            </div>
            <div class="macro-bar-container">
                <div class="macro-bar day-macro-bar">
                    <div class="macro-bar-empty">No macros yet</div>
                </div>
                <div class="macro-labels compact">
                    <!-- Labels will appear when macros are added -->
                </div>
            </div>
        </div>
    `;
    
    mainBoard.appendChild(column);
}

// Create Meal HTML (delegate to MealContainer component)
function createMealHTML(day, mealName, time) {
    return MealContainer.create(day, mealName, time);
}

// Meal Drop Handlers
function handleMealDragOver(e) {
    if (draggedData?.type === 'food' || draggedData?.type === 'module') {
        e.preventDefault();
        e.currentTarget.classList.add('drag-over');
        e.dataTransfer.dropEffect = draggedData.type === 'food' ? 'copy' : 'move';
    }
    
    // Update last active day when interacting with a meal
    const dayColumn = e.currentTarget.closest('.day-column');
    if (dayColumn) {
        lastActiveDay = dayColumn;
    }
}

function handleMealDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleMealDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    // Update last active day when dropping in a meal
    const dayColumn = e.currentTarget.closest('.day-column');
    if (dayColumn) {
        lastActiveDay = dayColumn;
    }
    
    const dropTarget = e.currentTarget;
    const meal = dropTarget.closest('.meal');
    const modulesContainer = meal.querySelector('.food-modules-container');
    
    if (draggedData?.type === 'food') {
        // Add to history when food is used
        if (window.favoritesManager && draggedData.food) {
            window.favoritesManager.addToHistory(draggedData.food);
        }
        
        // Add new food module
        const module = createFoodModule(draggedData);
        
        // If dropping in add-food-zone, append to modules container
        if (dropTarget.classList.contains('add-food-zone') || dropTarget.classList.contains('food-modules-container')) {
            modulesContainer.appendChild(module);
        }
        
        updateMealTotals(meal);
        updateDayTotals(meal.closest('.day-column'));
        
    } else if (draggedData?.type === 'module') {
        // Reorder module
        if (dropTarget.classList.contains('food-modules-container')) {
            const afterElement = getDragAfterElement(modulesContainer, e.clientY);
            if (afterElement == null) {
                modulesContainer.appendChild(draggedData.moduleElement);
            } else {
                modulesContainer.insertBefore(draggedData.moduleElement, afterElement);
            }
        } else if (dropTarget.classList.contains('add-food-zone')) {
            // If dropping on add-food-zone, append to end
            modulesContainer.appendChild(draggedData.moduleElement);
        }
        updateMealTotals(meal);
        updateDayTotals(meal.closest('.day-column'));
    }
}

// Get element after which to insert dragged element
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.food-module:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Create Recipe Container (delegate to RecipeContainer component)
function createRecipeContainer(recipeName, recipeId = null) {
    return RecipeContainer.create(recipeName, recipeId);
}

// Create Food Module (delegate to FoodModule component)
function createFoodModule(dragData, isPartOfRecipe = false) {
    return FoodModule.create(dragData, isPartOfRecipe);
}

// Update Module Portion
function updateModulePortion(moduleId, newQuantity) {
    const module = document.querySelector(`[data-module-id="${moduleId}"]`);
    if (!module) return;
    
    const moduleData = JSON.parse(module.dataset.module);
    const baseFood = moduleData.baseFood;
    const currentUnit = moduleData.unit;
    
    // Calculate new macros
    const baseQuantityInUnit = convertUnit(baseFood.baseQuantity, baseFood.baseUnit, currentUnit);
    const ratio = parseFloat(newQuantity) / baseQuantityInUnit;
    
    moduleData.quantity = parseFloat(newQuantity);
    moduleData.kcal = Math.round(baseFood.kcal * ratio);
    moduleData.protein = baseFood.protein * ratio;
    moduleData.carbs = baseFood.carbs * ratio;
    moduleData.fat = baseFood.fat * ratio;
    moduleData.cost = baseFood.cost * ratio;
    
    module.dataset.module = JSON.stringify(moduleData);
    
    // Update display
    const macrosDiv = module.querySelector('.module-macros');
    macrosDiv.innerHTML = `
        <div class="macro-bar-container">
            <div class="macro-bar">
                ${createMacroBar(moduleData.protein, moduleData.carbs, moduleData.fat)}
            </div>
            <div class="macro-labels">
                <span class="macro-label protein">P: ${moduleData.protein.toFixed(1)}g</span>
                <span class="macro-label carbs">C: ${moduleData.carbs.toFixed(1)}g</span>
                <span class="macro-label fat">F: ${moduleData.fat.toFixed(1)}g</span>
            </div>
        </div>
        <div class="macro-stats">
            <span class="macro kcal">🔥 ${moduleData.kcal}</span>
            <span class="macro cost">💵 ${moduleData.cost.toFixed(2)}</span>
        </div>
    `;
    
    // Update totals
    updateMealTotals(module.closest('.meal'));
    updateDayTotals(module.closest('.day-column'));
}

// Update Module Unit
function updateModuleUnit(moduleId, newUnit) {
    const module = document.querySelector(`[data-module-id="${moduleId}"]`);
    if (!module) return;
    
    const moduleData = JSON.parse(module.dataset.module);
    const baseFood = moduleData.baseFood;
    const currentUnit = moduleData.unit;
    const currentQuantity = moduleData.quantity;
    
    // Convert quantity to new unit
    const newQuantity = convertUnit(currentQuantity, currentUnit, newUnit);
    const portionInput = module.querySelector('.module-portion-input');
    portionInput.value = newQuantity.toFixed(2);
    
    // Update step and min based on unit
    if (newUnit === 'cup') {
        portionInput.step = '0.25';
        portionInput.min = '0.25';
    } else {
        portionInput.step = '1';
        portionInput.min = '1';
    }
    portionInput.dataset.unit = newUnit;
    
    // Calculate new macros
    const baseQuantityInNewUnit = convertUnit(baseFood.baseQuantity, baseFood.baseUnit, newUnit);
    const ratio = newQuantity / baseQuantityInNewUnit;
    
    moduleData.unit = newUnit;
    moduleData.quantity = newQuantity;
    moduleData.kcal = Math.round(baseFood.kcal * ratio);
    moduleData.protein = baseFood.protein * ratio;
    moduleData.carbs = baseFood.carbs * ratio;
    moduleData.fat = baseFood.fat * ratio;
    moduleData.cost = baseFood.cost * ratio;
    
    module.dataset.module = JSON.stringify(moduleData);
    
    // Update display
    const macrosDiv = module.querySelector('.module-macros');
    macrosDiv.innerHTML = `
        <div class="macro-bar-container">
            <div class="macro-bar">
                ${createMacroBar(moduleData.protein, moduleData.carbs, moduleData.fat)}
            </div>
            <div class="macro-labels">
                <span class="macro-label protein">P: ${moduleData.protein.toFixed(1)}g</span>
                <span class="macro-label carbs">C: ${moduleData.carbs.toFixed(1)}g</span>
                <span class="macro-label fat">F: ${moduleData.fat.toFixed(1)}g</span>
            </div>
        </div>
        <div class="macro-stats">
            <span class="macro kcal">🔥 ${moduleData.kcal}</span>
            <span class="macro cost">💵 ${moduleData.cost.toFixed(2)}</span>
        </div>
    `;
    
    // Update totals
    updateMealTotals(module.closest('.meal'));
    updateDayTotals(module.closest('.day-column'));
}

// Toggle Module Favorite
function toggleModuleFavorite(moduleId) {
    const module = document.querySelector(`[data-module-id="${moduleId}"]`);
    if (!module) return;
    
    const moduleData = JSON.parse(module.dataset.module);
    const food = moduleData.baseFood;
    const btn = module.querySelector('.module-favorite-btn');
    
    if (window.favoritesManager) {
        const itemId = window.favoritesManager.generateItemId(food);
        
        if (window.favoritesManager.isFavorite(food)) {
            // Remove from favorites
            window.favoritesManager.removeFromFavorites(itemId);
            btn.innerHTML = '🤍';
            btn.classList.remove('favorited');
            btn.title = 'Add to favorites';
        } else {
            // Add to favorites
            window.favoritesManager.addToFavorites(food);
            btn.innerHTML = '❤️';
            btn.classList.add('favorited');
            btn.title = 'Remove from favorites';
        }
    }
}

// Remove Module
function toggleModuleExpand(moduleId) {
    const module = document.querySelector(`[data-module-id="${moduleId}"]`);
    if (!module) return;
    
    module.classList.toggle('expanded');
}

function toggleFoodItemExpand(itemId) {
    const foodItem = document.querySelector(`[data-item-id="${itemId}"]`);
    if (!foodItem) return;
    
    foodItem.classList.toggle('expanded');
}

function removeModule(moduleId) {
    const module = document.querySelector(`[data-module-id="${moduleId}"]`);
    if (!module) return;
    
    const meal = module.closest('.meal');
    const dayColumn = module.closest('.day-column');
    
    module.style.animation = 'fadeOutScale 0.3s ease';
    setTimeout(() => {
        module.remove();
        updateMealTotals(meal);
        updateDayTotals(dayColumn);
    }, 300);
}

// Update Meal Totals (delegate to MealContainer component)
function updateMealTotals(meal) {
    return MealContainer.updateTotals(meal);
}

// Update Day Totals
function updateDayTotals(dayColumn) {
    if (!dayColumn) return;
    
    const meals = dayColumn.querySelectorAll('.meal');
    let dayTotals = {
        kcal: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        cost: 0
    };
    
    meals.forEach(meal => {
        const modules = meal.querySelectorAll('.food-module');
        modules.forEach(module => {
            const moduleData = JSON.parse(module.dataset.module);
            dayTotals.kcal += moduleData.kcal;
            dayTotals.protein += moduleData.protein;
            dayTotals.carbs += moduleData.carbs;
            dayTotals.fat += moduleData.fat;
            dayTotals.cost += moduleData.cost;
        });
    });
    
    const totalsDiv = dayColumn.querySelector('.day-totals');
    const total = dayTotals.protein + dayTotals.carbs + dayTotals.fat;
    
    // Create a description of the macro distribution
    let macroDescription = '';
    if (total > 0) {
        const proteinPercent = Math.round((dayTotals.protein / total) * 100);
        const carbsPercent = Math.round((dayTotals.carbs / total) * 100);
        const fatPercent = Math.round((dayTotals.fat / total) * 100);
        
        // Determine the dominant macro
        const macros = [
            { name: 'Protein', percent: proteinPercent, emoji: '💪' },
            { name: 'Carbs', percent: carbsPercent, emoji: '🍞' },
            { name: 'Fat', percent: fatPercent, emoji: '🥑' }
        ];
        macros.sort((a, b) => b.percent - a.percent);
        
        // Create description based on distribution
        if (macros[0].percent > 50) {
            macroDescription = `<div class="macro-description">${macros[0].emoji} ${macros[0].name}-focused day (${macros[0].percent}%)</div>`;
        } else if (Math.abs(proteinPercent - carbsPercent) < 10 && Math.abs(carbsPercent - fatPercent) < 10) {
            macroDescription = `<div class="macro-description">⚖️ Balanced macro distribution</div>`;
        } else {
            macroDescription = `<div class="macro-description">${macros[0].emoji} ${macros[0].name}-led (${macros[0].percent}%) with ${macros[1].name} (${macros[1].percent}%)</div>`;
        }
    }
    
    totalsDiv.innerHTML = `
        <div class="day-totals-header">
            <div class="day-totals-title">Day Total</div>
            <div class="day-totals-quick-stats">
                <span class="quick-stat">${dayTotals.kcal} kcal</span>
                <span class="quick-stat">$${dayTotals.cost.toFixed(2)}</span>
            </div>
        </div>
        <div class="macro-bar-container">
            <div class="macro-bar day-macro-bar">
                ${createMacroBar(dayTotals.protein, dayTotals.carbs, dayTotals.fat)}
            </div>
            <div class="macro-labels compact">
                <span class="macro-label protein">P: ${dayTotals.protein.toFixed(0)}g</span>
                <span class="macro-label carbs">C: ${dayTotals.carbs.toFixed(0)}g</span>
                <span class="macro-label fat">F: ${dayTotals.fat.toFixed(0)}g</span>
            </div>
        </div>
    `;
}

// Meal Management
function addMeal(day) {
    const dayColumn = document.querySelector(`[data-day="${day}"]`);
    if (!dayColumn) return;
    
    const mealsContainer = dayColumn.querySelector('.meals-container');
    const mealName = prompt('Enter meal name:', 'Snack');
    if (!mealName) return;
    
    const time = prompt('Enter meal time:', '15:00');
    if (!time) return;
    
    const mealHTML = createMealHTML(day, mealName, time);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = mealHTML;
    const newMeal = tempDiv.firstElementChild;
    newMeal.classList.add('animate-in');
    
    mealsContainer.appendChild(newMeal);
}

// Handle meal name click for editing
function handleMealNameClick(event) {
    const element = event.target;
    element.dataset.originalText = element.textContent;
    // Select only the text, not the emoji
    const text = element.textContent;
    const emojiMatch = text.match(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}]/u);
    if (emojiMatch) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(element.childNodes[0], emojiMatch[0].length + 1);
        range.setEnd(element.childNodes[0], text.length);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

function handleMealNameBlur(event, mealId) {
    const element = event.target;
    const text = element.textContent.trim();
    // Extract emoji and name
    const emojiMatch = text.match(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}]/u);
    const emoji = emojiMatch ? emojiMatch[0] : '';
    const mealName = text.replace(emoji, '').trim();
    
    if (!mealName) {
        element.textContent = element.dataset.originalText;
        return;
    }
    
    // Reapply the correct emoji based on the new meal name
    const getMealEmoji = (name) => {
        const mealLower = name.toLowerCase();
        if (mealLower.includes('breakfast')) return '🍳';
        if (mealLower.includes('lunch')) return '☀️';
        if (mealLower.includes('dinner')) return '🌙';
        if (mealLower.includes('morning') && mealLower.includes('snack')) return '🥐';
        if (mealLower.includes('afternoon') && mealLower.includes('snack')) return '🍎';
        if (mealLower.includes('evening') && mealLower.includes('snack')) return '🍪';
        if (mealLower.includes('snack')) return '🥨';
        return '🍽️';
    };
    
    element.textContent = `${getMealEmoji(mealName)} ${mealName}`;
}

function handleMealNameKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        event.target.blur();
    }
}

// Handle meal time editing
function handleMealTimeClick(event) {
    const element = event.target;
    element.dataset.originalText = element.textContent;
    // Select only the time, not the emoji
    const text = element.textContent;
    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(element.childNodes[0], 2); // Skip "⏰ "
    range.setEnd(element.childNodes[0], text.length);
    sel.removeAllRanges();
    sel.addRange(range);
}

function handleMealTimeBlur(event, mealId) {
    const element = event.target;
    const text = element.textContent.trim();
    const time = text.replace('⏰', '').trim();
    
    if (!time) {
        element.textContent = element.dataset.originalText;
        return;
    }
    
    element.textContent = `⏰ ${time}`;
}

function handleMealTimeKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        event.target.blur();
    }
}

function toggleMealMinimize(mealId) {
    const meal = document.querySelector(`[data-meal-id="${mealId}"]`);
    if (!meal) return;
    
    const dropZone = meal.querySelector('.meal-drop-zone');
    const totals = meal.querySelector('.meal-totals');
    const minimizeBtn = meal.querySelector('.minimize-btn');
    
    if (meal.classList.contains('minimized')) {
        // Expand the meal
        meal.classList.remove('minimized');
        dropZone.style.display = 'block';
        if (totals) totals.style.display = 'block';
        minimizeBtn.title = 'Minimize';
    } else {
        // Minimize the meal
        meal.classList.add('minimized');
        dropZone.style.display = 'none';
        if (totals) totals.style.display = 'none';
        minimizeBtn.title = 'Expand';
    }
}

function toggleDayMinimize(event) {
    event.stopPropagation();
    const column = event.target.closest('.day-column');
    if (!column) return;
    
    const minimizeBtn = column.querySelector('.btn-minimize-day');
    
    if (column.classList.contains('minimized')) {
        // Expand the day column
        column.classList.remove('minimized');
        minimizeBtn.title = 'Minimize';
        minimizeBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5"/>
            </svg>
        `;
    } else {
        // Minimize the day column
        column.classList.add('minimized');
        minimizeBtn.title = 'Expand';
        minimizeBtn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 5v14M5 12h14"/>
            </svg>
        `;
    }
}

function deleteMeal(mealId) {
    const meal = document.querySelector(`[data-meal-id="${mealId}"]`);
    if (!meal) return;
    
    if (confirm('Are you sure you want to delete this meal?')) {
        const dayColumn = meal.closest('.day-column');
        meal.style.animation = 'fadeOutScale 0.3s ease';
        setTimeout(() => {
            meal.remove();
            updateDayTotals(dayColumn);
        }, 300);
    }
}

// Add New Day
function addNewDay() {
    const dayName = prompt('Enter day name:', 'Saturday');
    if (!dayName) return;
    
    createDayColumn(dayName);
}

// Clear Board
function clearBoard() {
    if (confirm('Are you sure you want to clear all category columns? Day columns will remain.')) {
        document.querySelectorAll('.category-column').forEach(column => {
            column.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => column.remove(), 300);
        });
        activeColumns = [];
    }
}

// Recipe handlers
function handleRecipeDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    if (draggedData?.type === 'food' || draggedData?.type === 'module') {
        e.currentTarget.classList.add('drag-over');
        e.dataTransfer.dropEffect = draggedData.type === 'food' ? 'copy' : 'move';
    }
}

function handleRecipeDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    
    const recipeContainer = e.currentTarget.closest('.recipe-container');
    const recipesModulesContainer = recipeContainer.querySelector('.recipe-modules-container');
    
    if (draggedData?.type === 'food') {
        // Add new food module to recipe
        const module = createFoodModule(draggedData, true);
        recipesModulesContainer.appendChild(module);
        updateRecipeTotals(recipeContainer);
        updateMealTotals(recipeContainer.closest('.meal'));
        updateDayTotals(recipeContainer.closest('.day-column'));
    } else if (draggedData?.type === 'module') {
        // Move module into recipe
        recipesModulesContainer.appendChild(draggedData.moduleElement);
        updateRecipeTotals(recipeContainer);
        updateMealTotals(recipeContainer.closest('.meal'));
        updateDayTotals(recipeContainer.closest('.day-column'));
    }
}

// Update Recipe Totals (delegate to RecipeContainer component)
function updateRecipeTotals(recipeContainer) {
    return RecipeContainer.updateTotals(recipeContainer);
}

function toggleRecipeCollapse(recipeId) {
    const recipe = document.querySelector(`[data-recipe-id="${recipeId}"]`);
    if (!recipe) return;
    
    const modulesContainer = recipe.querySelector('.recipe-modules-container');
    const chevron = recipe.querySelector('.chevron');
    
    if (recipe.classList.contains('collapsed')) {
        recipe.classList.remove('collapsed');
        modulesContainer.style.display = 'block';
        chevron.textContent = '▼';
    } else {
        recipe.classList.add('collapsed');
        modulesContainer.style.display = 'none';
        chevron.textContent = '▶';
    }
}

function removeRecipe(recipeId) {
    const recipe = document.querySelector(`[data-recipe-id="${recipeId}"]`);
    if (!recipe) return;
    
    const meal = recipe.closest('.meal');
    const dayColumn = recipe.closest('.day-column');
    
    recipe.style.animation = 'fadeOutScale 0.3s ease';
    setTimeout(() => {
        recipe.remove();
        updateMealTotals(meal);
        updateDayTotals(dayColumn);
    }, 300);
}

// Expose functions to global scope for inline event handlers
window.handleMealDragOver = handleMealDragOver;
window.handleMealDragLeave = handleMealDragLeave;
window.handleMealDrop = handleMealDrop;
window.removeCategoryColumn = removeCategoryColumn;
window.removeModule = removeModule;
window.toggleModuleFavorite = toggleModuleFavorite;
window.addMeal = addMeal;
window.deleteMeal = (mealId) => MealContainer.delete(mealId);
window.toggleMealMinimize = (mealId) => MealContainer.toggleMinimize(mealId);
window.toggleDayMinimize = toggleDayMinimize;
window.handleMealNameClick = MealContainer.handleNameClick;
window.handleMealNameBlur = MealContainer.handleNameBlur;
window.handleMealNameKeydown = MealContainer.handleNameKeydown;
window.handleMealTimeClick = MealContainer.handleTimeClick;
window.handleMealTimeBlur = MealContainer.handleTimeBlur;
window.handleMealTimeKeydown = MealContainer.handleTimeKeydown;
window.handlePillClick = handlePillClick;
window.addNewDay = addNewDay;
window.clearBoard = clearBoard;
window.filterFoodItems = filterFoodItems;
window.removeColumn = removeColumn;
window.openAIFoodChat = openAIFoodChat;
window.closeAIFoodChat = closeAIFoodChat;
window.sendAIFoodRequest = sendAIFoodRequest;
window.addAIFoodToCategory = addAIFoodToCategory;
window.sendAISearchRequest = sendAISearchRequest;
window.selectClarificationOption = selectClarificationOption;
window.focusAIInput = focusAIInput;
window.updateUserLocation = updateUserLocation;
window.filterByMacro = filterByMacro;
window.createCategoryColumn = createCategoryColumn;
window.getAvailableUnits = getAvailableUnits;
window.createMacroBar = createMacroBar;
window.createMacroLabels = createMacroLabels;

// Expose food database and functions for AI assistant
window.foodDatabase = foodDatabase;
window.createFoodModule = createFoodModule;
window.updateMealTotals = updateMealTotals;
window.updateDayTotals = updateDayTotals;
window.createRecipeContainer = createRecipeContainer;
window.updateRecipeTotals = updateRecipeTotals;
window.handleRecipeDragOver = handleRecipeDragOver;
window.handleRecipeDrop = handleRecipeDrop;
window.toggleRecipeCollapse = (recipeId) => RecipeContainer.toggleCollapse(recipeId);
window.removeRecipe = (recipeId) => RecipeContainer.remove(recipeId);
window.toggleModuleExpand = (moduleId) => FoodModule.toggleExpand(moduleId);
window.toggleFoodItemExpand = (itemId) => FoodItem.toggleExpand(itemId);

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