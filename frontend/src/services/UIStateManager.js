// UIStateManager - Handles all UI state updates and toggles
// Extracted from app.js to centralize state management

import { NutritionCalculator } from './nutritionCalculator.js';
import { UnitConverter } from './unitConverter.js';
import { FoodModule } from '../components/FoodModule.js';
import { MealContainer } from '../components/MealContainer.js';
import { RecipeContainer } from '../components/RecipeContainer.js';
import eventBus from './EventBus.js';

export class UIStateManager {
    
    // Update food item macros when portion/unit changes
    static updateFoodItemMacros(foodItem, foodData, ratio) {
        // Update macro bar
        const macroBar = foodItem.querySelector('.macro-bar');
        if (macroBar) {
            macroBar.innerHTML = NutritionCalculator.createMacroBarHTML(
                foodData.protein * ratio,
                foodData.carbs * ratio,
                foodData.fat * ratio
            );
        }
        
        // Update macro labels
        const macroLabels = foodItem.querySelector('.macro-labels');
        if (macroLabels) {
            macroLabels.innerHTML = NutritionCalculator.createMacroLabelsHTML(
                foodData.protein * ratio,
                foodData.carbs * ratio,
                foodData.fat * ratio
            );
        }
        
        // Update calories display
        const caloriesSpan = foodItem.querySelector('.food-calories');
        if (caloriesSpan) {
            caloriesSpan.textContent = `${Math.round(foodData.kcal * ratio)} kcal`;
        }
    }
    
    // Update module portion
    static updateModulePortion(moduleId, newQuantity) {
        const module = document.querySelector(`[data-module-id="${moduleId}"]`);
        if (!module) return;
        
        const moduleData = FoodModule.getModuleData(moduleId);
        if (!moduleData) return;
        
        const baseFood = moduleData.baseFood;
        const currentUnit = module.querySelector('.module-unit-select').value;
        
        // Calculate ratio based on new quantity and current unit
        let ratio;
        if (currentUnit === baseFood.baseUnit) {
            ratio = newQuantity / baseFood.baseQuantity;
        } else {
            // Convert to base unit first
            const quantityInBaseUnit = UnitConverter.convert(newQuantity, currentUnit, baseFood.baseUnit);
            ratio = quantityInBaseUnit / baseFood.baseQuantity;
        }
        
        // Update module data
        moduleData.quantity = newQuantity;
        moduleData.kcal = Math.round(baseFood.kcal * ratio);
        moduleData.protein = baseFood.protein * ratio;
        moduleData.carbs = baseFood.carbs * ratio;
        moduleData.fat = baseFood.fat * ratio;
        moduleData.cost = baseFood.cost * ratio;
        
        // Update display
        module.querySelector('.module-calories').textContent = `${moduleData.kcal} kcal`;
        module.querySelector('.module-portion-input').value = newQuantity;
        
        // Update macro bar if expanded
        const macroBar = module.querySelector('.macro-bar');
        if (macroBar) {
            macroBar.innerHTML = NutritionCalculator.createMacroBarHTML(moduleData.protein, moduleData.carbs, moduleData.fat);
        }
        
        // Update totals
        const meal = module.closest('.meal');
        if (meal) {
            this.updateMealTotals(meal);
            const dayColumn = meal.closest('.day-column');
            if (dayColumn) {
                this.updateDayTotals(dayColumn);
            }
        }
        
        // Update recipe totals if in recipe
        const recipe = module.closest('.recipe-container');
        if (recipe) {
            this.updateRecipeTotals(recipe);
        }
    }
    
    // Update module unit
    static updateModuleUnit(moduleId, newUnit) {
        const module = document.querySelector(`[data-module-id="${moduleId}"]`);
        if (!module) return;
        
        const moduleData = FoodModule.getModuleData(moduleId);
        if (!moduleData) return;
        
        const baseFood = moduleData.baseFood;
        const currentQuantity = parseFloat(module.querySelector('.module-portion-input').value);
        const currentUnit = module.querySelector('.module-unit-select').value;
        
        // Convert quantity to new unit
        const newQuantity = UnitConverter.convert(currentQuantity, currentUnit, newUnit);
        
        // Calculate ratio based on base values
        let ratio;
        if (newUnit === baseFood.baseUnit) {
            ratio = newQuantity / baseFood.baseQuantity;
        } else {
            // Convert new quantity to base unit for ratio calculation
            const quantityInBaseUnit = UnitConverter.convert(newQuantity, newUnit, baseFood.baseUnit);
            ratio = quantityInBaseUnit / baseFood.baseQuantity;
        }
        
        // Update module data
        moduleData.quantity = newQuantity;
        moduleData.unit = newUnit;
        moduleData.kcal = Math.round(baseFood.kcal * ratio);
        moduleData.protein = baseFood.protein * ratio;
        moduleData.carbs = baseFood.carbs * ratio;
        moduleData.fat = baseFood.fat * ratio;
        moduleData.cost = baseFood.cost * ratio;
        
        // Update display
        module.querySelector('.module-calories').textContent = `${moduleData.kcal} kcal`;
        module.querySelector('.module-portion-input').value = newQuantity.toFixed(1);
        module.querySelector('.module-unit-select').value = newUnit;
        
        // Update macro bar if expanded
        const macroBar = module.querySelector('.macro-bar');
        if (macroBar) {
            macroBar.innerHTML = NutritionCalculator.createMacroBarHTML(moduleData.protein, moduleData.carbs, moduleData.fat);
        }
        
        // Update totals
        const meal = module.closest('.meal');
        if (meal) {
            this.updateMealTotals(meal);
            const dayColumn = meal.closest('.day-column');
            if (dayColumn) {
                this.updateDayTotals(dayColumn);
            }
        }
        
        // Update recipe totals if in recipe
        const recipe = module.closest('.recipe-container');
        if (recipe) {
            this.updateRecipeTotals(recipe);
        }
    }
    
    // Toggle module favorite status
    static toggleModuleFavorite(moduleId) {
        const module = document.querySelector(`[data-module-id="${moduleId}"]`);
        if (!module) return;
        
        const moduleData = FoodModule.getModuleData(moduleId);
        if (!moduleData) return;
        
        const favBtn = module.querySelector('.module-favorite-btn');
        const isFavorite = favBtn.classList.contains('active');
        
        if (isFavorite) {
            favBtn.classList.remove('active');
            favBtn.innerHTML = '☆';
            moduleData.isFavorite = false;
            // Remove from favorites if needed
            if (window.favoritesManager) {
                window.favoritesManager.removeFromFavorites(moduleData.baseFood);
            }
        } else {
            favBtn.classList.add('active');
            favBtn.innerHTML = '★';
            moduleData.isFavorite = true;
            // Add to favorites if needed
            if (window.favoritesManager) {
                window.favoritesManager.addToFavorites(moduleData.baseFood);
            }
        }
    }
    
    // Toggle module expansion
    static toggleModuleExpand(moduleId) {
        FoodModule.toggleExpand(moduleId);
    }
    
    // Toggle food item expansion
    static toggleFoodItemExpand(itemId) {
        const item = document.getElementById(itemId);
        if (item) {
            item.classList.toggle('expanded');
        }
    }
    
    // Remove module from meal
    static removeModule(moduleId) {
        const module = document.querySelector(`[data-module-id="${moduleId}"]`);
        if (!module) return;
        
        const meal = module.closest('.meal');
        const dayColumn = meal?.closest('.day-column');
        const recipe = module.closest('.recipe-container');
        
        // Remove from data store
        FoodModule.removeModuleData(moduleId);
        
        // Remove from DOM
        module.remove();
        
        // Update totals
        if (meal) this.updateMealTotals(meal);
        if (dayColumn) this.updateDayTotals(dayColumn);
        if (recipe) this.updateRecipeTotals(recipe);
    }
    
    // Update meal totals
    static updateMealTotals(meal) {
        return MealContainer.updateTotals(meal);
    }
    
    // Update day totals
    static updateDayTotals(dayColumn) {
        if (!dayColumn) return;
        
        const meals = dayColumn.querySelectorAll('.meal');
        const dayTotals = {
            kcal: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            cost: 0
        };
        
        meals.forEach(meal => {
            const modules = meal.querySelectorAll('.food-module');
            modules.forEach(module => {
                const moduleId = module.dataset.moduleId;
                const moduleData = FoodModule.getModuleData(moduleId);
                if (moduleData) {
                    dayTotals.kcal += moduleData.kcal || 0;
                    dayTotals.protein += moduleData.protein || 0;
                    dayTotals.carbs += moduleData.carbs || 0;
                    dayTotals.fat += moduleData.fat || 0;
                    dayTotals.cost += moduleData.cost || 0;
                }
            });
            
            // Also include recipes within meals
            const recipes = meal.querySelectorAll('.recipe-container');
            recipes.forEach(recipe => {
                const recipeModules = recipe.querySelectorAll('.food-module');
                recipeModules.forEach(module => {
                    const moduleId = module.dataset.moduleId;
                    const moduleData = FoodModule.getModuleData(moduleId);
                    if (moduleData) {
                        dayTotals.kcal += moduleData.kcal || 0;
                        dayTotals.protein += moduleData.protein || 0;
                        dayTotals.carbs += moduleData.carbs || 0;
                        dayTotals.fat += moduleData.fat || 0;
                        dayTotals.cost += moduleData.cost || 0;
                    }
                });
            });
        });
        
        // Update day totals display
        const totalsContainer = dayColumn.querySelector('.day-totals');
        if (totalsContainer) {
            totalsContainer.querySelector('.total-calories').textContent = `${dayTotals.kcal} kcal`;
            totalsContainer.querySelector('.total-cost').textContent = `$${dayTotals.cost.toFixed(2)}`;
            
            const macroBar = totalsContainer.querySelector('.macro-bar');
            if (macroBar) {
                macroBar.innerHTML = NutritionCalculator.createMacroBarHTML(dayTotals.protein, dayTotals.carbs, dayTotals.fat);
            }
            
            const macroText = totalsContainer.querySelector('.total-macros');
            if (macroText) {
                macroText.textContent = `${dayTotals.protein.toFixed(0)}g P • ${dayTotals.carbs.toFixed(0)}g C • ${dayTotals.fat.toFixed(0)}g F`;
            }
        }
    }
    
    // Toggle meal minimize
    static toggleMealMinimize(mealId) {
        MealContainer.toggleMinimize(mealId);
    }
    
    // Toggle day minimize
    static toggleDayMinimize(event) {
        const button = event.target;
        const dayColumn = button.closest('.day-column');
        const dayContent = dayColumn.querySelector('.day-content');
        const isMinimized = dayColumn.classList.contains('minimized');
        
        if (isMinimized) {
            // Expand
            dayColumn.classList.remove('minimized');
            dayContent.style.display = 'block';
            button.textContent = '−';
            button.title = 'Minimize day';
        } else {
            // Minimize
            dayColumn.classList.add('minimized');
            dayContent.style.display = 'none';
            button.textContent = '+';
            button.title = 'Expand day';
        }
    }
    
    // Update recipe totals
    static updateRecipeTotals(recipeContainer) {
        return RecipeContainer.updateTotals(recipeContainer);
    }
    
    // Toggle recipe collapse
    static toggleRecipeCollapse(recipeId) {
        RecipeContainer.toggleCollapse(recipeId);
    }
}

// Set up event listeners
class UIStateManagerWithEvents extends UIStateManager {
    static init() {
        // Listen for events from other modules
        eventBus.on('meal:update-totals', ({ meal }) => {
            this.updateMealTotals(meal);
        });
        
        eventBus.on('day:update-totals', ({ dayColumn }) => {
            this.updateDayTotals(dayColumn);
        });
        
        eventBus.on('module:remove', ({ moduleId }) => {
            this.removeModule(moduleId);
        });
        
        eventBus.on('module:toggle-favorite', ({ moduleId }) => {
            this.toggleModuleFavorite(moduleId);
        });
        
        eventBus.on('module:toggle-expand', ({ moduleId }) => {
            this.toggleModuleExpand(moduleId);
        });
        
        eventBus.on('food-item:toggle-expand', ({ itemId }) => {
            this.toggleFoodItemExpand(itemId);
        });
        
        eventBus.on('recipe:update-totals', ({ recipeContainer }) => {
            this.updateRecipeTotals(recipeContainer);
        });
        
        eventBus.on('recipe:toggle-collapse', ({ recipeId }) => {
            this.toggleRecipeCollapse(recipeId);
        });
        
        console.log('[UIStateManager] Event listeners initialized');
    }
}

// Export singleton for use in app.js
export default UIStateManagerWithEvents;