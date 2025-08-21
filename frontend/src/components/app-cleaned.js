// Main app.js - Cleaned and refactored version
// Imports all modular components and services

import { foodDatabase } from '../data/foodDatabase.js';
import { unitConversions, DAYS, DEFAULT_PORTIONS, MACRO_COLORS, INPUT_CONSTRAINTS, STORAGE_KEYS } from '../utils/constants.js';
import { NutritionCalculator } from '../services/nutritionCalculator.js';
import { UnitConverter } from '../services/unitConverter.js';
import { FoodItem } from './FoodItem.js';
import { FoodModule } from './FoodModule.js';
import { MealContainer } from './MealContainer.js';
import { RecipeContainer } from './RecipeContainer.js';
import { DragDropService } from '../services/dragDropService.js';
import { StorageService } from '../services/storageService.js';

// Global variables
let mainBoard = null;
let categoryPillsContainer = null;
let draggedElement = null;
let draggedData = null;

// Initialize app when DOM is ready
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
    mainBoard.addEventListener('dragleave', clearDropIndicators);
}

// Category Pill Handlers
function handlePillClick(e) {
    const pill = e.currentTarget;
    const category = pill.dataset.category;
    
    // Check if column already exists
    const existingColumn = document.querySelector(`.category-column[data-category="${category}"]`);
    if (existingColumn) {
        existingColumn.scrollIntoView({ behavior: 'smooth', block: 'center' });
        existingColumn.classList.add('highlight-flash');
        setTimeout(() => existingColumn.classList.remove('highlight-flash'), 1000);
        return;
    }
    
    createCategoryColumn(category);
}

function handlePillDragStart(e) {
    const pill = e.currentTarget;
    draggedElement = pill;
    draggedData = {
        type: 'category-pill',
        category: pill.dataset.category
    };
    e.dataTransfer.effectAllowed = 'copy';
    pill.classList.add('dragging');
}

function handlePillDragEnd(e) {
    const pill = e.currentTarget;
    pill.classList.remove('dragging');
    draggedElement = null;
    draggedData = null;
}

function handleBoardDragOver(e) {
    e.preventDefault();
    
    if (!draggedData) return;
    
    if (draggedData.type === 'category-pill') {
        const afterColumn = getDragAfterColumn(mainBoard, e.clientX);
        
        clearDropIndicators();
        
        if (afterColumn == null) {
            const columns = [...mainBoard.querySelectorAll('.day-column, .category-column')];
            if (columns.length > 0) {
                columns[columns.length - 1].classList.add('drop-indicator-right');
            }
        } else {
            afterColumn.classList.add('drop-indicator-left');
        }
    }
}

function handleBoardDrop(e) {
    e.preventDefault();
    
    if (!draggedData || draggedData.type !== 'category-pill') return;
    
    const category = draggedData.category;
    const existingColumn = document.querySelector(`.category-column[data-category="${category}"]`);
    
    if (!existingColumn) {
        const afterColumn = getDragAfterColumn(mainBoard, e.clientX);
        createCategoryColumn(category, afterColumn);
    }
    
    clearDropIndicators();
}

function clearDropIndicators() {
    document.querySelectorAll('.drop-indicator-left, .drop-indicator-right').forEach(el => {
        el.classList.remove('drop-indicator-left', 'drop-indicator-right');
    });
}

function getDragAfterColumn(container, x) {
    const draggableColumns = [...container.querySelectorAll('.day-column:not(.dragging), .category-column:not(.dragging)')];
    
    return draggableColumns.reduce((closest, column) => {
        const box = column.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: column };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Food Item Drag Handlers
function handleFoodDragStart(e) {
    const foodItem = e.currentTarget;
    draggedElement = foodItem;
    draggedData = {
        type: 'food',
        food: JSON.parse(foodItem.dataset.food),
        category: foodItem.dataset.category,
        itemId: foodItem.dataset.itemId
    };
    e.dataTransfer.effectAllowed = 'copy';
    foodItem.classList.add('dragging');
}

function handleFoodDragEnd(e) {
    const foodItem = e.currentTarget;
    foodItem.classList.remove('dragging');
    draggedElement = null;
    draggedData = null;
    clearDropIndicators();
}

// Food Module Drag Handlers
function handleModuleDragStart(e) {
    const module = e.currentTarget;
    draggedElement = module;
    draggedData = {
        type: 'module',
        module: JSON.parse(module.dataset.module),
        sourceElement: module
    };
    e.dataTransfer.effectAllowed = 'move';
    module.classList.add('dragging');
}

function handleModuleDragEnd(e) {
    const module = e.currentTarget;
    module.classList.remove('dragging');
    draggedElement = null;
    draggedData = null;
    document.querySelectorAll('.drag-over').forEach(el => el.classList.remove('drag-over'));
}

// Column Drag Handlers
function handleColumnDragStart(e) {
    const column = e.currentTarget.closest('.category-column');
    if (!column) return;
    
    draggedElement = column;
    draggedData = {
        type: 'column',
        category: column.dataset.category
    };
    e.dataTransfer.effectAllowed = 'move';
    column.classList.add('dragging');
}

function handleColumnDragEnd(e) {
    const column = e.currentTarget.closest('.category-column');
    if (!column) return;
    
    column.classList.remove('dragging');
    draggedElement = null;
    draggedData = null;
    clearDropIndicators();
}

function handleColumnDragOver(e) {
    e.preventDefault();
    
    if (!draggedData || draggedData.type !== 'column') return;
    
    const afterColumn = getDragAfterColumn(mainBoard, e.clientX);
    
    clearDropIndicators();
    
    if (afterColumn == null) {
        const columns = [...mainBoard.querySelectorAll('.day-column, .category-column')];
        if (columns.length > 0) {
            columns[columns.length - 1].classList.add('drop-indicator-right');
        }
    } else {
        afterColumn.classList.add('drop-indicator-left');
    }
}

function handleColumnDrop(e) {
    e.preventDefault();
    
    if (!draggedData || draggedData.type !== 'column') return;
    
    const draggedColumn = draggedElement;
    const afterColumn = getDragAfterColumn(mainBoard, e.clientX);
    
    if (afterColumn == null) {
        mainBoard.appendChild(draggedColumn);
    } else {
        mainBoard.insertBefore(draggedColumn, afterColumn);
    }
    
    clearDropIndicators();
}

// Create Category Column
function createCategoryColumn(category, insertBefore = null) {
    const existingColumn = document.querySelector(`.category-column[data-category="${category}"]`);
    if (existingColumn) return;

    const column = document.createElement('div');
    column.className = 'category-column';
    column.dataset.category = category;
    
    const foods = foodDatabase[category] || [];
    const popularFoods = foods.slice(0, 5);
    const categoryEmojis = {
        protein: '🥩',
        dairy: '🥛',
        veg: '🥦',
        fruit: '🍎',
        grains: '🌾',
        nuts: '🥜',
        carbs: '🍞',
        drinks: '🥤',
        sweets: '🍫',
        extras: '🧂'
    };
    
    column.innerHTML = `
        <div class="category-header" draggable="true" ondragstart="handleColumnDragStart(event)" ondragend="handleColumnDragEnd(event)">
            <div class="category-header-left">
                <span class="category-icon">${categoryEmojis[category] || '🍽️'}</span>
                <span class="category-title">${category.charAt(0).toUpperCase() + category.slice(1)}</span>
            </div>
            <button class="close-btn" onclick="removeCategoryColumn('${category}')">×</button>
        </div>
        <div class="category-search">
            <input type="text" placeholder="Search ${category}..." oninput="filterFoodItems('${category}', this.value)">
            <div class="macro-filter-row">
                <button class="macro-filter-btn protein-btn" onclick="filterByMacro('${category}', 'protein', this)">P</button>
                <button class="macro-filter-btn carbs-btn" onclick="filterByMacro('${category}', 'carbs', this)">C</button>
                <button class="macro-filter-btn fat-btn" onclick="filterByMacro('${category}', 'fat', this)">F</button>
                <button class="macro-filter-btn kcal-btn" onclick="filterByMacro('${category}', 'kcal', this)">Cal</button>
            </div>
        </div>
        <div class="popular-header">
            <span>Popular</span>
            <button class="toggle-popular-btn" onclick="hidePopularItems('${category}')">Hide</button>
        </div>
        <div class="popular-items">
            ${popularFoods.map(food => FoodItem.create(food, category)).join('')}
        </div>
        <div class="all-items-header" style="display: none;">
            <span>All ${category}</span>
        </div>
        <div class="food-list" style="display: none;">
            ${foods.map(food => FoodItem.create(food, category)).join('')}
        </div>
    `;
    
    // Insert the column at the appropriate position
    if (insertBefore) {
        mainBoard.insertBefore(column, insertBefore);
    } else {
        mainBoard.appendChild(column);
    }
    
    // Set up drag event listeners for the new food items
    column.querySelectorAll('.food-item').forEach(item => {
        item.addEventListener('dragstart', handleFoodDragStart);
        item.addEventListener('dragend', handleFoodDragEnd);
    });
    
    // Set up drag event listeners for the column itself
    column.addEventListener('dragover', handleColumnDragOver);
    column.addEventListener('drop', handleColumnDrop);
    
    // Scroll to the new column
    column.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Helper functions that use extracted components
function createMacroBar(protein, carbs, fat) {
    return NutritionCalculator.createMacroBarHTML(protein, carbs, fat);
}

function createMacroLabels(protein, carbs, fat) {
    return NutritionCalculator.createMacroLabelsHTML(protein, carbs, fat);
}

function createFoodItemHTML(food, category) {
    return FoodItem.create(food, category);
}

// Show/Hide popular items
function showPopularItems(category) {
    const column = document.querySelector(`.category-column[data-category="${category}"]`);
    if (!column) return;
    
    column.querySelector('.popular-header').style.display = 'flex';
    column.querySelector('.popular-items').style.display = 'block';
    column.querySelector('.all-items-header').style.display = 'none';
    column.querySelector('.food-list').style.display = 'none';
}

function hidePopularItems(category) {
    const column = document.querySelector(`.category-column[data-category="${category}"]`);
    if (!column) return;
    
    column.querySelector('.popular-header').style.display = 'none';
    column.querySelector('.popular-items').style.display = 'none';
    column.querySelector('.all-items-header').style.display = 'block';
    column.querySelector('.food-list').style.display = 'block';
}

// Filter functions
function filterFoodItems(category, searchText) {
    const column = document.querySelector(`.category-column[data-category="${category}"]`);
    if (!column) return;
    
    const foodItems = column.querySelectorAll('.food-list .food-item');
    foodItems.forEach(item => {
        const foodName = item.querySelector('.food-name').textContent.toLowerCase();
        if (foodName.includes(searchText.toLowerCase())) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

function filterByMacro(category, filter, buttonElement) {
    const column = document.querySelector(`.category-column[data-category="${category}"]`);
    if (!column) return;
    
    // Toggle active state
    buttonElement.classList.toggle('active');
    const isActive = buttonElement.classList.contains('active');
    
    // If deactivating, show all items
    if (!isActive) {
        column.querySelectorAll('.food-item').forEach(item => item.style.display = 'block');
        return;
    }
    
    // Deactivate other filters
    column.querySelectorAll('.macro-filter-btn').forEach(btn => {
        if (btn !== buttonElement) btn.classList.remove('active');
    });
    
    // Apply filter logic would go here based on the macro type
    // This would filter items based on highest macro content
}

function removeCategoryColumn(category) {
    const column = document.querySelector(`.category-column[data-category="${category}"]`);
    if (!column) return;
    
    column.style.animation = 'fadeOutScale 0.3s ease';
    setTimeout(() => {
        column.remove();
    }, 300);
}

// Day columns
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
    column.className = 'day-column';
    column.dataset.day = dayName.toLowerCase();
    
    column.innerHTML = `
        <div class="day-header">
            <div class="day-name">${dayName}</div>
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
            <div class="day-totals-title">Day Total</div>
            <div class="macro-bar-container">
                <div class="macro-bar day-macro-bar">
                    <div class="macro-bar-empty">No macros yet</div>
                </div>
                <div class="macro-labels">
                    <!-- Labels will appear when macros are added -->
                </div>
            </div>
            <div class="day-total-stats">
                <div class="day-total-item">
                    <span class="day-total-label">Calories</span>
                    <span class="day-total-value">0</span>
                </div>
                <div class="day-total-item">
                    <span class="day-total-label">Cost</span>
                    <span class="day-total-value">$0.00</span>
                </div>
            </div>
        </div>
    `;
    
    mainBoard.appendChild(column);
}

// Essential wrapper function for meal creation
function createMealHTML(day, mealName, time) {
    return MealContainer.create(day, mealName, time);
}

// Meal drag and drop handlers
function handleMealDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const dropZone = e.currentTarget;
    
    if (draggedData && (draggedData.type === 'food' || draggedData.type === 'module')) {
        dropZone.classList.add('drag-over');
        e.dataTransfer.dropEffect = draggedData.type === 'food' ? 'copy' : 'move';
    }
}

function handleMealDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleMealDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const dropZone = e.currentTarget;
    dropZone.classList.remove('drag-over');
    
    if (!draggedData) return;
    
    const meal = dropZone.closest('.meal');
    const targetContainer = e.target.closest('.recipes-container, .food-modules-container, .add-food-zone');
    
    if (draggedData.type === 'food') {
        // Create new food module
        const newModule = createFoodModule(draggedData);
        
        if (targetContainer && targetContainer.classList.contains('recipes-container')) {
            // Create or find recipe container
            let recipeContainer = targetContainer.querySelector('.recipe-container');
            if (!recipeContainer) {
                const recipeName = prompt('Enter recipe name:');
                if (!recipeName) return;
                recipeContainer = createRecipeContainer(recipeName);
                targetContainer.appendChild(recipeContainer);
            }
            recipeContainer.querySelector('.recipe-items').appendChild(newModule);
            updateRecipeTotals(recipeContainer);
        } else {
            // Add to standalone modules
            const modulesContainer = meal.querySelector('.food-modules-container');
            const afterElement = getDragAfterElement(modulesContainer, e.clientY);
            
            if (afterElement == null) {
                modulesContainer.appendChild(newModule);
            } else {
                modulesContainer.insertBefore(newModule, afterElement);
            }
        }
        
        updateMealTotals(meal);
        updateDayTotals(meal.closest('.day-column'));
        
    } else if (draggedData.type === 'module') {
        // Move existing module
        const module = draggedData.sourceElement;
        const sourceMeal = module.closest('.meal');
        
        if (targetContainer && targetContainer.classList.contains('recipes-container')) {
            // Moving to recipe - handle recipe logic
        } else {
            // Moving to standalone modules
            const modulesContainer = meal.querySelector('.food-modules-container');
            const afterElement = getDragAfterElement(modulesContainer, e.clientY);
            
            if (afterElement == null) {
                modulesContainer.appendChild(module);
            } else {
                modulesContainer.insertBefore(module, afterElement);
            }
        }
        
        // Update totals for both source and target meals
        if (sourceMeal && sourceMeal !== meal) {
            updateMealTotals(sourceMeal);
            updateDayTotals(sourceMeal.closest('.day-column'));
        }
        updateMealTotals(meal);
        updateDayTotals(meal.closest('.day-column'));
    }
}

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

// Recipe container wrapper
function createRecipeContainer(recipeName, recipeId = null) {
    return RecipeContainer.create(recipeName, recipeId);
}

// Food module wrapper
function createFoodModule(dragData, isPartOfRecipe = false) {
    return FoodModule.create(dragData, isPartOfRecipe);
}

// Module update functions that delegate to components
function updateModulePortion(moduleId, newQuantity) {
    FoodModule.updatePortion(moduleId, newQuantity);
}

function updateModuleUnit(moduleId, newUnit) {
    FoodModule.updateUnit(moduleId, newUnit);
}

function toggleModuleFavorite(moduleId) {
    FoodModule.toggleFavorite(moduleId);
}

function toggleModuleExpand(moduleId) {
    FoodModule.toggleExpand(moduleId);
}

function toggleFoodItemExpand(itemId) {
    FoodItem.toggleExpand(itemId);
}

function removeModule(moduleId) {
    FoodModule.remove(moduleId);
}

// Meal totals update wrapper
function updateMealTotals(meal) {
    MealContainer.updateTotals(meal);
}

// Day totals calculation
function updateDayTotals(dayColumn) {
    if (!dayColumn) return;
    
    const modules = dayColumn.querySelectorAll('.food-module');
    const totalsDiv = dayColumn.querySelector('.day-totals');
    
    if (!totalsDiv) return;
    
    let totals = {
        kcal: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        cost: 0
    };
    
    modules.forEach(module => {
        const moduleData = JSON.parse(module.dataset.module);
        totals.kcal += moduleData.kcal || 0;
        totals.protein += moduleData.protein || 0;
        totals.carbs += moduleData.carbs || 0;
        totals.fat += moduleData.fat || 0;
        totals.cost += moduleData.cost || 0;
    });
    
    // Update macro bar
    const macroBar = totalsDiv.querySelector('.day-macro-bar');
    const macroLabels = totalsDiv.querySelector('.macro-labels');
    
    if (totals.kcal > 0) {
        macroBar.innerHTML = NutritionCalculator.createMacroBarHTML(totals.protein, totals.carbs, totals.fat);
        macroLabels.innerHTML = NutritionCalculator.createMacroLabelsHTML(totals.protein, totals.carbs, totals.fat);
        
        // Add description
        const existingDesc = totalsDiv.querySelector('.macro-description');
        if (existingDesc) existingDesc.remove();
        
        const description = document.createElement('div');
        description.className = 'macro-description';
        description.textContent = `Macros: ${NutritionCalculator.formatMacroSplit(totals.protein, totals.carbs, totals.fat)}`;
        macroBar.parentElement.insertBefore(description, macroBar);
    } else {
        macroBar.innerHTML = '<div class="macro-bar-empty">No macros yet</div>';
        macroLabels.innerHTML = '';
        const existingDesc = totalsDiv.querySelector('.macro-description');
        if (existingDesc) existingDesc.remove();
    }
    
    // Update stats
    totalsDiv.querySelector('.day-total-stats').innerHTML = `
        <div class="day-total-item">
            <span class="day-total-label">Calories</span>
            <span class="day-total-value">${Math.round(totals.kcal)}</span>
        </div>
        <div class="day-total-item">
            <span class="day-total-label">Cost</span>
            <span class="day-total-value">$${totals.cost.toFixed(2)}</span>
        </div>
    `;
}

// Add new meal
function addMeal(day) {
    const dayColumn = document.querySelector(`.day-column[data-day="${day}"]`);
    if (!dayColumn) return;
    
    const mealsContainer = dayColumn.querySelector('.meals-container');
    const mealName = prompt('Enter meal name:', 'Custom Meal');
    
    if (!mealName) return;
    
    const time = prompt('Enter meal time:', '12:00');
    if (!time) return;
    
    const mealHTML = createMealHTML(day, mealName, time);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = mealHTML;
    const newMeal = tempDiv.firstElementChild;
    
    mealsContainer.appendChild(newMeal);
    newMeal.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Recipe handlers
function handleRecipeDragOver(e) {
    e.preventDefault();
    const recipeItems = e.currentTarget;
    
    if (draggedData && draggedData.type === 'food') {
        recipeItems.classList.add('drag-over');
        e.dataTransfer.dropEffect = 'copy';
    }
}

function handleRecipeDrop(e) {
    e.preventDefault();
    const recipeItems = e.currentTarget;
    recipeItems.classList.remove('drag-over');
    
    if (!draggedData || draggedData.type !== 'food') return;
    
    const newModule = createFoodModule(draggedData, true);
    recipeItems.appendChild(newModule);
    
    const recipeContainer = recipeItems.closest('.recipe-container');
    updateRecipeTotals(recipeContainer);
    
    const meal = recipeContainer.closest('.meal');
    updateMealTotals(meal);
    
    const dayColumn = meal.closest('.day-column');
    updateDayTotals(dayColumn);
}

// Recipe totals wrapper
function updateRecipeTotals(recipeContainer) {
    RecipeContainer.updateTotals(recipeContainer);
}

function toggleRecipeCollapse(recipeId) {
    RecipeContainer.toggleCollapse(recipeId);
}

function removeRecipe(recipeId) {
    RecipeContainer.remove(recipeId);
}

// Utility functions
function addNewDay() {
    const dayName = prompt('Enter day name:');
    if (!dayName) return;
    createDayColumn(dayName);
}

function clearBoard() {
    if (confirm('Are you sure you want to clear the entire board?')) {
        mainBoard.innerHTML = '';
        createInitialDayColumns();
    }
}

// Helper function for unit conversions
function getAvailableUnits(baseUnit) {
    return UnitConverter.getAvailableUnits(baseUnit);
}

function convertUnit(quantity, fromUnit, toUnit) {
    return UnitConverter.convert(quantity, fromUnit, toUnit);
}

function handlePortionChange(e) {
    const input = e.target;
    const foodItem = input.closest('.food-item');
    const quantity = parseFloat(input.value) || 0;
    
    if (quantity <= 0) {
        input.value = input.dataset.lastValue || 100;
        return;
    }
    
    input.dataset.lastValue = quantity;
    FoodItem.updatePortion(foodItem.dataset.itemId, quantity);
}

function handleUnitChange(e) {
    const select = e.target;
    const foodItem = select.closest('.food-item');
    const unit = select.value;
    
    FoodItem.updateUnit(foodItem.dataset.itemId, unit);
}

// Export functions to window for onclick handlers
window.handleMealDragOver = handleMealDragOver;
window.handleMealDragLeave = handleMealDragLeave;
window.handleMealDrop = handleMealDrop;
window.removeCategoryColumn = removeCategoryColumn;
window.removeModule = removeModule;
window.toggleModuleFavorite = toggleModuleFavorite;
window.addMeal = addMeal;
window.deleteMeal = (mealId) => MealContainer.delete(mealId);
window.toggleMealMinimize = (mealId) => MealContainer.toggleMinimize(mealId);
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
window.filterByMacro = filterByMacro;
window.showPopularItems = showPopularItems;
window.hidePopularItems = hidePopularItems;
window.createCategoryColumn = createCategoryColumn;
window.getAvailableUnits = getAvailableUnits;
window.createMacroBar = createMacroBar;
window.createMacroLabels = createMacroLabels;

// Export for other modules that might need these
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
window.handlePortionChange = handlePortionChange;
window.handleUnitChange = handleUnitChange;
window.handleColumnDragStart = handleColumnDragStart;
window.handleColumnDragEnd = handleColumnDragEnd;
window.convertUnit = convertUnit;

// Export drag and drop functions for food items
window.handleFoodDragStart = handleFoodDragStart;
window.handleFoodDragEnd = handleFoodDragEnd;
window.handleModuleDragStart = handleModuleDragStart;
window.handleModuleDragEnd = handleModuleDragEnd;