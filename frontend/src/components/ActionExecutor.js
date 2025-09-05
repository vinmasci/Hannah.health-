// Action Executor
// Handles execution of AI-generated actions

export class ActionExecutor {
    constructor() {
        this.recipeProcessor = null; // Will be injected
    }
    
    // Set dependencies
    setDependencies(recipeProcessor) {
        this.recipeProcessor = recipeProcessor;
    }
    
    // Execute a list of actions
    async executeActions(actions) {
        const results = [];
        
        for (const action of actions) {
            try {
                const result = await this.executeAction(action);
                results.push({ success: true, action, result });
            } catch (error) {
                console.error(`Failed to execute action ${action.action}:`, error);
                results.push({ success: false, action, error });
            }
        }
        
        return results;
    }
    
    // Execute a single action
    async executeAction(action) {
        switch (action.action) {
            case 'add_recipe':
                return await this.addRecipeToPlanner(action);
                
            case 'add_meal':
                if (action.items) {
                    for (const item of action.items) {
                        await this.addFoodToPlanner(item);
                    }
                }
                return { added: action.items?.length || 0 };
                
            case 'clear_meal':
                return await this.clearMeal(action.day, action.meal);
                
            case 'clear_day':
                return await this.clearDay(action.day);
                
            default:
                throw new Error(`Unknown action: ${action.action}`);
        }
    }
    
    // Add recipe to planner (delegates to RecipeProcessor)
    async addRecipeToPlanner(recipeData) {
        if (!this.recipeProcessor) {
            throw new Error('RecipeProcessor not initialized');
        }
        
        // If the action contains a recipe_url, fetch and add it
        if (recipeData.recipe_url) {
            try {
                // Scrape the recipe
                const scrapeResponse = await fetch('/api/recipe/scrape', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: recipeData.recipe_url })
                });
                
                if (scrapeResponse.ok) {
                    const scrapedData = await scrapeResponse.json();
                    
                    if (scrapedData.ingredients && scrapedData.ingredients.length > 0) {
                        // Add all ingredients to the specified meal
                        for (const ingredient of scrapedData.ingredients) {
                            await this.addFoodToPlanner({
                                food: ingredient.name,
                                day: recipeData.day || 'Monday',
                                meal: recipeData.meal || 'lunch',
                                quantity: parseInt(ingredient.amount) || 100,
                                unit: ingredient.amount.includes('ml') ? 'ml' : 'g'
                            });
                        }
                        return { added: scrapedData.ingredients.length };
                    }
                }
            } catch (error) {
                console.error('Recipe scraping error:', error);
            }
        }
        
        // Otherwise use the traditional recipe data format
        return await this.recipeProcessor.addRecipeToPlanner(recipeData);
    }
    
    // Add individual food item to planner
    async addFoodToPlanner(item) {
        try {
            // Find the day column
            const dayColumn = document.querySelector(`.day-column[data-day="${item.day}"]`);
            if (!dayColumn) {
                console.warn(`Day column not found: ${item.day}`);
                return false;
            }
            
            // Find the target meal
            const meals = dayColumn.querySelectorAll('.meal');
            let targetMeal = null;
            const mealName = item.meal.toLowerCase();
            
            for (const meal of meals) {
                const mealNameEl = meal.querySelector('.meal-name');
                if (mealNameEl) {
                    const currentMealName = mealNameEl.textContent.toLowerCase();
                    
                    if (currentMealName.includes(mealName) || 
                        (mealName === 'breakfast' && currentMealName.includes('morning')) ||
                        (mealName === 'lunch' && currentMealName.includes('noon')) ||
                        (mealName === 'dinner' && currentMealName.includes('evening'))) {
                        targetMeal = meal;
                        break;
                    }
                }
            }
            
            if (!targetMeal) {
                console.warn('Target meal not found:', item.meal);
                return false;
            }
            
            // Create food module
            const moduleData = {
                name: item.name,
                category: item.category || 'custom',
                calories: item.calories || 0,
                protein: item.protein || 0,
                carbs: item.carbs || 0,
                fat: item.fat || 0,
                emoji: item.emoji || '🍽️'
            };
            
            const module = this.recipeProcessor ? 
                await this.recipeProcessor.createFoodModule(moduleData) :
                this.createBasicFoodModule(moduleData);
            
            // Add to meal
            const modulesContainer = targetMeal.querySelector('.food-modules-container');
            if (!modulesContainer) {
                console.warn('Modules container not found in meal');
                return false;
            }
            
            modulesContainer.appendChild(module);
            
            // Update totals
            if (window.updateMealTotals) {
                window.updateMealTotals(targetMeal);
            }
            if (window.updateDayTotals) {
                window.updateDayTotals(dayColumn);
            }
            
            return true;
        } catch (error) {
            console.error('Error adding food to planner:', error);
            return false;
        }
    }
    
    // Clear a specific meal
    async clearMeal(day, meal) {
        try {
            const dayColumn = document.querySelector(`.day-column[data-day="${day}"]`);
            if (!dayColumn) {
                console.warn(`Day column not found: ${day}`);
                return false;
            }
            
            const mealName = meal.toLowerCase().replace(/[-_]/g, ' ');
            const meals = dayColumn.querySelectorAll('.meal');
            
            for (const mealEl of meals) {
                const mealNameEl = mealEl.querySelector('.meal-name');
                if (mealNameEl) {
                    const currentMealName = mealNameEl.textContent.toLowerCase();
                    if (currentMealName.includes(mealName)) {
                        // Clear all food modules
                        const modules = mealEl.querySelectorAll('.food-module');
                        modules.forEach(module => {
                            module.classList.add('removing');
                            setTimeout(() => module.remove(), 300);
                        });
                        
                        // Update totals after delay
                        setTimeout(() => {
                            if (window.updateMealTotals) {
                                window.updateMealTotals(mealEl);
                            }
                            if (window.updateDayTotals) {
                                window.updateDayTotals(dayColumn);
                            }
                        }, 350);
                        
                        return true;
                    }
                }
            }
            
            return false;
        } catch (error) {
            console.error('Error clearing meal:', error);
            return false;
        }
    }
    
    // Clear an entire day
    async clearDay(day) {
        try {
            const dayColumn = document.querySelector(`.day-column[data-day="${day}"]`);
            if (!dayColumn) {
                console.warn(`Day column not found: ${day}`);
                return false;
            }
            
            // Clear all food modules in all meals
            const modules = dayColumn.querySelectorAll('.food-module');
            modules.forEach(module => {
                module.classList.add('removing');
                setTimeout(() => module.remove(), 300);
            });
            
            // Update totals after delay
            setTimeout(() => {
                const meals = dayColumn.querySelectorAll('.meal');
                meals.forEach(meal => {
                    if (window.updateMealTotals) {
                        window.updateMealTotals(meal);
                    }
                });
                if (window.updateDayTotals) {
                    window.updateDayTotals(dayColumn);
                }
            }, 350);
            
            return true;
        } catch (error) {
            console.error('Error clearing day:', error);
            return false;
        }
    }
    
    // Fallback method to create basic food module
    createBasicFoodModule(moduleData) {
        const module = document.createElement('div');
        module.className = `food-module food-module-${moduleData.category || 'custom'}`;
        module.draggable = true;
        
        module.innerHTML = `
            <div class="module-content">
                <span class="module-emoji">${moduleData.emoji}</span>
                <span class="module-name">${moduleData.name}</span>
                <button class="module-remove" onclick="this.closest('.food-module').remove()">×</button>
            </div>
            <div class="module-nutrition">
                <span class="nutrition-calories">${moduleData.calories} cal</span>
                <span class="nutrition-macros">${moduleData.protein}p ${moduleData.carbs}c ${moduleData.fat}f</span>
            </div>
        `;
        
        return module;
    }
}

export default ActionExecutor;