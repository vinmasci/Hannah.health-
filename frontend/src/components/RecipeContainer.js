// RecipeContainer component - represents a recipe within a meal
import { NutritionCalculator } from '../services/nutritionCalculator.js';
import eventBus from '../services/EventBus.js';

export class RecipeContainer {
    /**
     * Create a recipe container element
     * @param {string} recipeName - Name of the recipe
     * @param {string} recipeId - Optional recipe ID
     * @returns {HTMLElement} Recipe container element
     */
    static create(recipeName, recipeId = null) {
        const id = recipeId || `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const container = document.createElement('div');
        container.className = 'recipe-container';
        container.dataset.recipeId = id;
        
        container.innerHTML = `
            <div class="recipe-header">
                <div class="recipe-name">
                    <span class="recipe-icon">📖</span>
                    <span class="recipe-title" contenteditable="true">${recipeName}</span>
                </div>
                <div class="recipe-controls">
                    <button class="recipe-control-btn" 
                            onclick="RecipeContainer.toggleCollapse('${id}')" 
                            title="Collapse">
                        <span class="chevron">▼</span>
                    </button>
                    <button class="recipe-control-btn" 
                            onclick="window.removeRecipe('${id}')" 
                            title="Remove Recipe">×</button>
                </div>
            </div>
            <div class="recipe-modules-container" 
                 ondragover="handleRecipeDragOver(event)" 
                 ondrop="handleRecipeDrop(event)">
                <!-- Food modules for this recipe go here -->
            </div>
            <div class="recipe-totals">
                <span class="recipe-total-calories">0 kcal</span>
                <span class="recipe-total-macros">0g P • 0g C • 0g F</span>
            </div>
        `;
        
        return container;
    }
    
    /**
     * Add a food module to the recipe
     * @param {string} recipeId - Recipe ID
     * @param {Object} moduleData - Module data to add
     */
    static addModule(recipeId, moduleData) {
        const recipe = document.querySelector(`[data-recipe-id="${recipeId}"]`);
        if (!recipe) return;
        
        const modulesContainer = recipe.querySelector('.recipe-modules-container');
        const module = window.FoodModule ? 
            window.FoodModule.create(moduleData, true) : 
            window.createFoodModule(moduleData, true);
        
        modulesContainer.appendChild(module);
        this.updateTotals(recipe);
        
        // Update meal and day totals
        const meal = recipe.closest('.meal');
        const dayColumn = recipe.closest('.day-column');
        if (window.updateMealTotals) window.updateMealTotals(meal);
        if (window.updateDayTotals) window.updateDayTotals(dayColumn);
    }
    
    /**
     * Update recipe totals
     * @param {HTMLElement|string} recipeOrId - Recipe element or ID
     */
    static updateTotals(recipeOrId) {
        const recipeContainer = typeof recipeOrId === 'string' ? 
            document.querySelector(`[data-recipe-id="${recipeOrId}"]`) : 
            recipeOrId;
        
        if (!recipeContainer) return;
        
        const modules = recipeContainer.querySelectorAll('.food-module');
        let totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
        
        modules.forEach(module => {
            const moduleData = JSON.parse(module.dataset.module);
            totals.kcal += moduleData.kcal;
            totals.protein += moduleData.protein;
            totals.carbs += moduleData.carbs;
            totals.fat += moduleData.fat;
        });
        
        const totalsDiv = recipeContainer.querySelector('.recipe-totals');
        totalsDiv.innerHTML = `
            <span class="recipe-total-calories">${totals.kcal} kcal</span>
            <span class="recipe-total-macros">${NutritionCalculator.formatMacros(totals)}</span>
        `;
    }
    
    /**
     * Toggle recipe collapse state
     * @param {string} recipeId - Recipe ID
     */
    static toggleCollapse(recipeId) {
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
    
    /**
     * Remove recipe
     * @param {string} recipeId - Recipe ID
     */
    static remove(recipeId) {
        const recipe = document.querySelector(`[data-recipe-id="${recipeId}"]`);
        if (!recipe) return;
        
        const meal = recipe.closest('.meal');
        const dayColumn = recipe.closest('.day-column');
        
        recipe.style.animation = 'fadeOutScale 0.3s ease';
        setTimeout(() => {
            recipe.remove();
            if (window.updateMealTotals) window.updateMealTotals(meal);
            if (window.updateDayTotals) window.updateDayTotals(dayColumn);
        }, 300);
    }
    
    /**
     * Save recipe as template
     * @param {string} recipeId - Recipe ID
     * @returns {Object} Recipe template data
     */
    static saveAsTemplate(recipeId) {
        const recipe = document.querySelector(`[data-recipe-id="${recipeId}"]`);
        if (!recipe) return null;
        
        const recipeName = recipe.querySelector('.recipe-title').textContent;
        const modules = recipe.querySelectorAll('.food-module');
        const moduleData = [];
        
        modules.forEach(module => {
            const data = JSON.parse(module.dataset.module);
            moduleData.push({
                food: data.baseFood,
                quantity: data.quantity,
                unit: data.unit
            });
        });
        
        const template = {
            id: `template-${Date.now()}`,
            name: recipeName,
            modules: moduleData,
            createdAt: new Date().toISOString()
        };
        
        // Save to localStorage
        const templates = JSON.parse(localStorage.getItem('recipe-templates') || '[]');
        templates.push(template);
        localStorage.setItem('recipe-templates', JSON.stringify(templates));
        
        return template;
    }
    
    /**
     * Load recipe from template
     * @param {Object} template - Recipe template
     * @returns {HTMLElement} Recipe container element
     */
    static loadFromTemplate(template) {
        const container = this.create(template.name);
        const recipeId = container.dataset.recipeId;
        
        // Add all modules from template
        template.modules.forEach(moduleData => {
            this.addModule(recipeId, moduleData);
        });
        
        return container;
    }
    
    /**
     * Get all saved templates
     * @returns {Array} Array of recipe templates
     */
    static getTemplates() {
        return JSON.parse(localStorage.getItem('recipe-templates') || '[]');
    }
    
    /**
     * Delete a template
     * @param {string} templateId - Template ID to delete
     */
    static deleteTemplate(templateId) {
        const templates = this.getTemplates();
        const filtered = templates.filter(t => t.id !== templateId);
        localStorage.setItem('recipe-templates', JSON.stringify(filtered));
    }
    
    /**
     * Initialize event listeners
     */
    static init() {
        // Listen for recipe removal from event bus
        eventBus.on('recipe:remove', ({ recipeId }) => {
            this.remove(recipeId);
        });
        
        console.log('[RecipeContainer] Event listeners initialized');
    }
}

// Initialize when loaded
RecipeContainer.init();

// Make RecipeContainer available globally for onclick handlers
window.RecipeContainer = RecipeContainer;