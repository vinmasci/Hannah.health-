// FoodModule component - represents a food item within a meal
import { UnitConverter } from '../services/unitConverter.js';
import { NutritionCalculator } from '../services/nutritionCalculator.js';
import { categoryMetadata } from '../data/foodDatabase.js';

export class FoodModule {
    /**
     * Create a food module element
     * @param {Object} dragData - Data from dragged food item
     * @param {boolean} isPartOfRecipe - Whether this module is part of a recipe
     * @returns {HTMLElement} The food module element
     */
    static create(dragData, isPartOfRecipe = false) {
        const module = document.createElement('div');
        const category = dragData.food.category || 'default';
        module.className = `food-module food-module-${category} animate-in`;
        module.draggable = true;
        
        const moduleId = `module-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const food = dragData.food;
        const quantity = dragData.quantity;
        const unit = dragData.unit;
        
        // Calculate macros based on portion
        const baseQuantityInUnit = UnitConverter.convert(
            food.baseQuantity, 
            food.baseUnit, 
            unit
        );
        const ratio = quantity / baseQuantityInUnit;
        
        const moduleData = {
            id: moduleId,
            name: food.name,
            category: food.category,
            quantity: quantity,
            unit: unit,
            baseFood: food,
            kcal: Math.round(food.kcal * ratio),
            protein: food.protein * ratio,
            carbs: food.carbs * ratio,
            fat: food.fat * ratio,
            cost: food.cost * ratio
        };
        
        const units = UnitConverter.getAvailableUnits(food.baseUnit);
        const isFavorited = window.favoritesManager ? 
            window.favoritesManager.isFavorite(food) : false;
        
        const categoryColor = categoryMetadata[food.category]?.color || '#9ca3af';
        const categoryInitial = food.category ? food.category.charAt(0).toUpperCase() : '';
        
        module.innerHTML = `
            <div class="module-category-badge" style="background: ${categoryColor}">${categoryInitial}</div>
            <div class="module-header">
                <div class="module-name">${food.name}</div>
                <div class="module-actions">
                    <button class="module-favorite-btn ${isFavorited ? 'favorited' : ''}" 
                            onclick="event.stopPropagation(); FoodModule.toggleFavorite('${moduleId}')" 
                            title="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}">
                        ${isFavorited ? '❤️' : '🤍'}
                    </button>
                    <button class="remove-module" onclick="FoodModule.remove('${moduleId}')">×</button>
                </div>
            </div>
            <div class="module-controls">
                <div class="module-inputs">
                    <input type="number" 
                           class="module-portion-input" 
                           value="${quantity}" 
                           min="${UnitConverter.getMinValue(unit)}" 
                           step="${UnitConverter.getStepSize(unit)}" 
                           data-module-id="${moduleId}" 
                           data-unit="${unit}">
                    <select class="module-unit-select" data-module-id="${moduleId}">
                        ${units.map(u => 
                            `<option value="${u}" ${u === unit ? 'selected' : ''}>${u}</option>`
                        ).join('')}
                    </select>
                </div>
                <button class="module-expand-btn" onclick="FoodModule.toggleExpand('${moduleId}')">▼</button>
            </div>
            <div class="module-macros">
                <div class="macro-bar-container">
                    <div class="macro-bar">
                        ${NutritionCalculator.createMacroBarHTML(moduleData.protein, moduleData.carbs, moduleData.fat)}
                    </div>
                    <div class="macro-labels">
                        ${NutritionCalculator.createMacroLabelsHTML(moduleData.protein, moduleData.carbs, moduleData.fat)}
                    </div>
                </div>
                <div class="macro-stats">
                    <span class="macro kcal">${moduleData.kcal} kcal</span>
                    <span class="macro cost">$${moduleData.cost.toFixed(2)}</span>
                </div>
            </div>
        `;
        
        module.dataset.moduleId = moduleId;
        module.dataset.module = JSON.stringify(moduleData);
        
        // Setup event handlers
        this.setupEventHandlers(module);
        
        return module;
    }
    
    /**
     * Update module data
     * @param {string} moduleId - Module ID
     * @param {Object} data - New data to update
     */
    static update(moduleId, data) {
        const module = document.querySelector(`[data-module-id="${moduleId}"]`);
        if (!module) return;
        
        const moduleData = JSON.parse(module.dataset.module);
        Object.assign(moduleData, data);
        module.dataset.module = JSON.stringify(moduleData);
        
        // Update display if needed
        this.refreshDisplay(module, moduleData);
    }
    
    /**
     * Update module portion
     * @param {string} moduleId - Module ID
     * @param {number} newQuantity - New quantity
     */
    static updatePortion(moduleId, newQuantity) {
        const module = document.querySelector(`[data-module-id="${moduleId}"]`);
        if (!module) return;
        
        const moduleData = JSON.parse(module.dataset.module);
        const baseFood = moduleData.baseFood;
        const currentUnit = moduleData.unit;
        
        // Calculate new macros
        const baseQuantityInUnit = UnitConverter.convert(
            baseFood.baseQuantity, 
            baseFood.baseUnit, 
            currentUnit
        );
        const ratio = parseFloat(newQuantity) / baseQuantityInUnit;
        
        moduleData.quantity = parseFloat(newQuantity);
        moduleData.kcal = Math.round(baseFood.kcal * ratio);
        moduleData.protein = baseFood.protein * ratio;
        moduleData.carbs = baseFood.carbs * ratio;
        moduleData.fat = baseFood.fat * ratio;
        moduleData.cost = baseFood.cost * ratio;
        
        module.dataset.module = JSON.stringify(moduleData);
        this.refreshDisplay(module, moduleData);
        
        // Update totals
        this.updateTotals(module);
    }
    
    /**
     * Update module unit
     * @param {string} moduleId - Module ID
     * @param {string} newUnit - New unit
     */
    static updateUnit(moduleId, newUnit) {
        const module = document.querySelector(`[data-module-id="${moduleId}"]`);
        if (!module) return;
        
        const moduleData = JSON.parse(module.dataset.module);
        const baseFood = moduleData.baseFood;
        const currentUnit = moduleData.unit;
        const currentQuantity = moduleData.quantity;
        
        // Convert quantity to new unit
        const newQuantity = UnitConverter.convert(currentQuantity, currentUnit, newUnit);
        const portionInput = module.querySelector('.module-portion-input');
        portionInput.value = newQuantity.toFixed(2);
        
        // Update step and min based on unit
        portionInput.step = UnitConverter.getStepSize(newUnit);
        portionInput.min = UnitConverter.getMinValue(newUnit);
        portionInput.dataset.unit = newUnit;
        
        // Calculate new macros
        const baseQuantityInNewUnit = UnitConverter.convert(
            baseFood.baseQuantity, 
            baseFood.baseUnit, 
            newUnit
        );
        const ratio = newQuantity / baseQuantityInNewUnit;
        
        moduleData.unit = newUnit;
        moduleData.quantity = newQuantity;
        moduleData.kcal = Math.round(baseFood.kcal * ratio);
        moduleData.protein = baseFood.protein * ratio;
        moduleData.carbs = baseFood.carbs * ratio;
        moduleData.fat = baseFood.fat * ratio;
        moduleData.cost = baseFood.cost * ratio;
        
        module.dataset.module = JSON.stringify(moduleData);
        this.refreshDisplay(module, moduleData);
        
        // Update totals
        this.updateTotals(module);
    }
    
    /**
     * Refresh module display
     * @param {HTMLElement} module - Module element
     * @param {Object} moduleData - Module data
     */
    static refreshDisplay(module, moduleData) {
        const macrosDiv = module.querySelector('.module-macros');
        macrosDiv.innerHTML = `
            <div class="macro-bar-container">
                <div class="macro-bar">
                    ${NutritionCalculator.createMacroBarHTML(moduleData.protein, moduleData.carbs, moduleData.fat)}
                </div>
                <div class="macro-labels">
                    ${NutritionCalculator.createMacroLabelsHTML(moduleData.protein, moduleData.carbs, moduleData.fat)}
                </div>
            </div>
            <div class="macro-stats">
                <span class="macro kcal">${moduleData.kcal} kcal</span>
                <span class="macro cost">$${moduleData.cost.toFixed(2)}</span>
            </div>
        `;
    }
    
    /**
     * Update totals for meal and day
     * @param {HTMLElement} module - Module element
     */
    static updateTotals(module) {
        const meal = module.closest('.meal');
        const dayColumn = module.closest('.day-column');
        
        if (window.updateMealTotals) window.updateMealTotals(meal);
        if (window.updateDayTotals) window.updateDayTotals(dayColumn);
    }
    
    /**
     * Toggle module favorite status
     * @param {string} moduleId - Module ID
     */
    static toggleFavorite(moduleId) {
        const module = document.querySelector(`[data-module-id="${moduleId}"]`);
        if (!module) return;
        
        const moduleData = JSON.parse(module.dataset.module);
        const food = moduleData.baseFood;
        const btn = module.querySelector('.module-favorite-btn');
        
        if (window.favoritesManager) {
            const itemId = window.favoritesManager.generateItemId(food);
            
            if (window.favoritesManager.isFavorite(food)) {
                window.favoritesManager.removeFromFavorites(itemId);
                btn.innerHTML = '🤍';
                btn.classList.remove('favorited');
                btn.title = 'Add to favorites';
            } else {
                window.favoritesManager.addToFavorites(food);
                btn.innerHTML = '❤️';
                btn.classList.add('favorited');
                btn.title = 'Remove from favorites';
            }
        }
    }
    
    /**
     * Toggle module expand state
     * @param {string} moduleId - Module ID
     */
    static toggleExpand(moduleId) {
        const module = document.querySelector(`[data-module-id="${moduleId}"]`);
        if (!module) return;
        
        module.classList.toggle('expanded');
    }
    
    /**
     * Remove module
     * @param {string} moduleId - Module ID
     */
    static remove(moduleId) {
        const module = document.querySelector(`[data-module-id="${moduleId}"]`);
        if (!module) return;
        
        const meal = module.closest('.meal');
        const dayColumn = module.closest('.day-column');
        
        module.style.animation = 'fadeOutScale 0.3s ease';
        setTimeout(() => {
            module.remove();
            if (window.updateMealTotals) window.updateMealTotals(meal);
            if (window.updateDayTotals) window.updateDayTotals(dayColumn);
        }, 300);
    }
    
    /**
     * Setup event handlers for a module element
     * @param {HTMLElement} module - Module element
     */
    static setupEventHandlers(module) {
        const moduleId = module.dataset.moduleId;
        
        // Drag handlers
        module.addEventListener('dragstart', (e) => {
            if (!module) return;
            
            module.classList.add('dragging');
            window.draggedElement = module;
            window.draggedData = {
                type: 'module',
                moduleElement: module
            };
            e.dataTransfer.effectAllowed = 'move';
        });
        
        module.addEventListener('dragend', (e) => {
            if (module) {
                module.classList.remove('dragging');
            }
            window.draggedElement = null;
            window.draggedData = null;
        });
        
        // Portion and unit change handlers
        const portionInput = module.querySelector('.module-portion-input');
        const unitSelect = module.querySelector('.module-unit-select');
        
        if (portionInput) {
            portionInput.addEventListener('change', (e) => {
                this.updatePortion(moduleId, e.target.value);
            });
        }
        
        if (unitSelect) {
            unitSelect.addEventListener('change', (e) => {
                this.updateUnit(moduleId, e.target.value);
            });
        }
    }
}

// Make FoodModule available globally for onclick handlers
window.FoodModule = FoodModule;