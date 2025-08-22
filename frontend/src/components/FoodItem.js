// FoodItem component - represents a draggable food item in category columns
import { UnitConverter } from '../services/unitConverter.js';
import { NutritionCalculator } from '../services/nutritionCalculator.js';

export class FoodItem {
    /**
     * Create a food item HTML element
     * @param {Object} food - Food object with nutritional data
     * @param {string} category - Food category
     * @returns {string} HTML string for the food item
     */
    static create(food, category) {
        const foodData = {
            ...food,
            category: category,
            currentQuantity: food.baseQuantity,
            currentUnit: food.baseUnit
        };
        
        const units = UnitConverter.getAvailableUnits(food.baseUnit);
        const step = UnitConverter.getStepSize(food.baseUnit);
        const min = UnitConverter.getMinValue(food.baseUnit);
        
        const isFavorited = window.favoritesManager ? 
            window.favoritesManager.isFavorite(foodData) : false;
        const itemId = `food-item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        // Escape the JSON for safe HTML attribute use - this fixes the McDonald's apostrophe issue!
        const escapedFoodData = JSON.stringify(foodData).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
        
        return `
            <div class="food-item food-item-${category}" draggable="true" 
                 data-food="${escapedFoodData}" data-item-id="${itemId}">
                <div class="food-item-header">
                    <div class="food-name">
                        <span class="food-emoji-placeholder" data-food-name="${food.name}" data-category="${category}"></span>
                        ${food.name}
                    </div>
                    <div class="food-item-actions">
                        <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" 
                                onclick="event.stopPropagation(); window.favoritesManager.toggleFavorite(this)" 
                                title="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}">
                            ${isFavorited ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
                <div class="food-portion">
                    <div class="food-portion-inputs">
                        <input type="number" class="portion-input" 
                               value="${food.baseQuantity}" 
                               min="${min}" 
                               step="${step}" 
                               data-unit="${food.baseUnit}">
                        <select class="unit-select">
                            ${units.map(unit => 
                                `<option value="${unit}" ${unit === food.baseUnit ? 'selected' : ''}>${unit}</option>`
                            ).join('')}
                        </select>
                    </div>
                    <button class="food-item-expand-btn" onclick="FoodItem.toggleExpand('${itemId}')">▼</button>
                </div>
                <div class="food-macros">
                    <div class="macro-bar-container">
                        <div class="macro-bar">
                            ${NutritionCalculator.createMacroBarHTML(food.protein, food.carbs, food.fat)}
                        </div>
                        <div class="macro-labels">
                            ${NutritionCalculator.createMacroLabelsHTML(food.protein, food.carbs, food.fat)}
                        </div>
                        <div class="macro-stats">
                            <span class="macro kcal" title="Calories">${food.kcal} kcal</span>
                            <span class="macro cost" title="Cost">$${food.cost.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Update portion for a food item
     * @param {string} itemId - The food item ID
     * @param {number} quantity - New quantity
     */
    static updatePortion(itemId, quantity) {
        const foodItem = document.querySelector(`[data-item-id="${itemId}"]`);
        if (!foodItem) return;
        
        const foodData = JSON.parse(foodItem.dataset.food);
        const newQuantity = parseFloat(quantity);
        const ratio = newQuantity / foodData.baseQuantity;
        
        this.updateMacros(foodItem, foodData, ratio);
    }
    
    /**
     * Update unit for a food item
     * @param {string} itemId - The food item ID  
     * @param {string} newUnit - New unit
     */
    static updateUnit(itemId, newUnit) {
        const foodItem = document.querySelector(`[data-item-id="${itemId}"]`);
        if (!foodItem) return;
        
        const foodData = JSON.parse(foodItem.dataset.food);
        const currentUnit = foodData.currentUnit || foodData.baseUnit;
        const quantityInput = foodItem.querySelector('.portion-input');
        const currentQuantity = parseFloat(quantityInput.value);
        
        // Convert quantity
        const newQuantity = UnitConverter.convert(currentQuantity, currentUnit, newUnit);
        quantityInput.value = newQuantity.toFixed(2);
        
        // Update step and min based on unit
        quantityInput.step = UnitConverter.getStepSize(newUnit);
        quantityInput.min = UnitConverter.getMinValue(newUnit);
        quantityInput.dataset.unit = newUnit;
        
        // Update food data
        foodData.currentUnit = newUnit;
        foodItem.dataset.food = JSON.stringify(foodData);
        
        // Calculate ratio for macros
        const baseQuantityInNewUnit = UnitConverter.convert(
            foodData.baseQuantity, 
            foodData.baseUnit, 
            newUnit
        );
        const ratio = newQuantity / baseQuantityInNewUnit;
        
        this.updateMacros(foodItem, foodData, ratio);
    }
    
    /**
     * Update macros display for a food item
     * @param {HTMLElement} foodItem - The food item element
     * @param {Object} foodData - Food data object
     * @param {number} ratio - Scaling ratio
     */
    static updateMacros(foodItem, foodData, ratio) {
        const protein = foodData.protein * ratio;
        const carbs = foodData.carbs * ratio;
        const fat = foodData.fat * ratio;
        const kcal = Math.round(foodData.kcal * ratio);
        const cost = foodData.cost * ratio;
        
        const macrosDiv = foodItem.querySelector('.food-macros');
        macrosDiv.innerHTML = `
            <div class="macro-bar-container">
                <div class="macro-bar">
                    ${NutritionCalculator.createMacroBarHTML(protein, carbs, fat)}
                </div>
                <div class="macro-labels">
                    ${NutritionCalculator.createMacroLabelsHTML(protein, carbs, fat)}
                </div>
                <div class="macro-stats">
                    <span class="macro kcal" title="Calories">${kcal} kcal</span>
                    <span class="macro cost" title="Cost">$${cost.toFixed(2)}</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Toggle expand state of a food item
     * @param {string} itemId - The food item ID
     */
    static toggleExpand(itemId) {
        const foodItem = document.querySelector(`[data-item-id="${itemId}"]`);
        if (!foodItem) return;
        
        foodItem.classList.toggle('expanded');
    }
    
    /**
     * Remove a food item
     * @param {string} itemId - The food item ID
     */
    static destroy(itemId) {
        const foodItem = document.querySelector(`[data-item-id="${itemId}"]`);
        if (!foodItem) return;
        
        foodItem.style.animation = 'fadeOutScale 0.3s ease';
        setTimeout(() => {
            foodItem.remove();
        }, 300);
    }
    
    /**
     * Setup event handlers for a food item element
     * @param {HTMLElement} element - The food item element
     */
    static setupEventHandlers(element) {
        // Drag handlers
        element.addEventListener('dragstart', (e) => {
            const foodItem = e.target.closest('.food-item');
            if (!foodItem) return;
            
            foodItem.classList.add('dragging');
            const foodData = JSON.parse(foodItem.dataset.food);
            
            // Store drag data globally for compatibility
            window.draggedElement = foodItem;
            window.draggedData = {
                type: 'food',
                food: foodData,
                quantity: parseFloat(foodItem.querySelector('.portion-input').value),
                unit: foodItem.querySelector('.unit-select').value
            };
            
            e.dataTransfer.effectAllowed = 'copy';
        });
        
        element.addEventListener('dragend', (e) => {
            const foodItem = e.target.closest('.food-item');
            if (foodItem) {
                foodItem.classList.remove('dragging');
            }
            window.draggedElement = null;
            window.draggedData = null;
        });
        
        // Portion and unit change handlers
        const portionInput = element.querySelector('.portion-input');
        const unitSelect = element.querySelector('.unit-select');
        const itemId = element.dataset.itemId;
        
        if (portionInput) {
            portionInput.addEventListener('change', (e) => {
                this.updatePortion(itemId, e.target.value);
            });
        }
        
        if (unitSelect) {
            unitSelect.addEventListener('change', (e) => {
                this.updateUnit(itemId, e.target.value);
            });
        }
    }
}

// Make FoodItem available globally for onclick handlers
window.FoodItem = FoodItem;