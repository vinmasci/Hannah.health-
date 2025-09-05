// Recipe Processor
// Handles recipe URL processing and adding recipes to planner

export class RecipeProcessor {
    constructor() {
        this.lastRecipeUrls = [];
    }
    
    // Process a recipe URL
    async processRecipeUrl(recipeUrl, userText, onMessage, onSearchStatus) {
        try {
            if (onSearchStatus) {
                onSearchStatus('Fetching recipe details...');
            }
            
            const scrapeResponse = await fetch('/api/scrape-recipe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url: recipeUrl })
            });
            
            if (scrapeResponse.ok) {
                const recipeData = await scrapeResponse.json();
                
                if (recipeData.ingredients && recipeData.ingredients.length > 0) {
                    // Determine target meal from context
                    let targetMeal = 'lunch'; // Default
                    if (userText.toLowerCase().includes('breakfast')) targetMeal = 'breakfast';
                    else if (userText.toLowerCase().includes('lunch')) targetMeal = 'lunch';
                    else if (userText.toLowerCase().includes('dinner')) targetMeal = 'dinner';
                    
                    // Determine target day
                    let targetDay = 'Monday'; // Default
                    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                    for (const day of days) {
                        if (userText.toLowerCase().includes(day.toLowerCase())) {
                            targetDay = day;
                            break;
                        }
                    }
                    
                    recipeData.targetDay = targetDay;
                    recipeData.targetMeal = targetMeal;
                    
                    // Parse ingredients into structured format
                    const parsedIngredients = [];
                    for (const ingredient of recipeData.ingredients) {
                        parsedIngredients.push({
                            name: ingredient,
                            quantity: 1,
                            unit: 'serving',
                            custom: true
                        });
                    }
                    recipeData.items = parsedIngredients;
                    
                    await this.addRecipeToPlanner(recipeData);
                    
                    if (onMessage) {
                        onMessage(`✅ Added "${recipeData.title}" to ${targetDay} ${targetMeal}!`, 'hannah');
                    }
                    return true;
                }
            }
        } catch (error) {
            console.error('Error processing recipe:', error);
            if (onMessage) {
                onMessage('Sorry, I had trouble loading that recipe. Please try again.', 'hannah');
            }
        }
        return false;
    }
    
    // Add recipe to the meal planner
    async addRecipeToPlanner(recipeData) {
        try {
            const dayColumn = document.querySelector(`.day-column[data-day="${recipeData.targetDay}"]`);
            if (!dayColumn) {
                console.error('Day column not found:', recipeData.targetDay);
                return;
            }
            
            // Find the target meal
            const meals = dayColumn.querySelectorAll('.meal');
            let targetMeal = null;
            const mealName = recipeData.targetMeal.toLowerCase();
            
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
                console.error('Target meal not found:', recipeData.targetMeal);
                return;
            }
            
            // Find or create recipes container
            let recipesContainer = targetMeal.querySelector('.recipes-container');
            if (!recipesContainer) {
                recipesContainer = document.createElement('div');
                recipesContainer.className = 'recipes-container';
                const modulesContainer = targetMeal.querySelector('.food-modules-container');
                targetMeal.insertBefore(recipesContainer, modulesContainer);
            }
            
            // Create recipe container
            const recipeContainer = document.createElement('div');
            recipeContainer.className = 'recipe-container';
            recipeContainer.innerHTML = `
                <div class="recipe-header">
                    <span class="recipe-title">${recipeData.title}</span>
                    <button class="recipe-remove" onclick="this.closest('.recipe-container').remove()">×</button>
                </div>
                <div class="recipe-items"></div>
            `;
            
            const recipeItemsContainer = recipeContainer.querySelector('.recipe-items');
            
            // Add each ingredient as a food module
            for (const item of recipeData.items) {
                const moduleData = await this.createRecipeItem(item);
                if (moduleData) {
                    const module = this.createFoodModule(moduleData);
                    recipeItemsContainer.appendChild(module);
                }
            }
            
            recipesContainer.appendChild(recipeContainer);
            
            // Update totals
            if (window.updateRecipeTotals) {
                window.updateRecipeTotals(recipeContainer);
            }
            if (window.updateMealTotals) {
                window.updateMealTotals(targetMeal);
            }
            if (window.updateDayTotals) {
                window.updateDayTotals(dayColumn);
            }
            
        } catch (error) {
            console.error('Error adding recipe to planner:', error);
        }
    }
    
    // Create a recipe item
    async createRecipeItem(item) {
        if (item.custom) {
            // Custom food item
            return {
                name: item.name,
                category: 'custom',
                calories: item.calories || 0,
                protein: item.protein || 0,
                carbs: item.carbs || 0,
                fat: item.fat || 0,
                emoji: '🍽️'
            };
        } else {
            // Look up in database
            const foodData = this.findFoodInDatabase(item.name);
            if (!foodData) {
                console.warn('Food not found in database:', item.name);
                return {
                    name: item.name,
                    category: 'custom',
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                    emoji: '🍽️'
                };
            }
            return foodData;
        }
    }
    
    // Find food in database (placeholder - should connect to actual database)
    findFoodInDatabase(foodName) {
        // This would normally query a real database
        // For now, return a simple lookup
        const foods = {
            'chicken breast': { name: 'Chicken Breast', category: 'protein', calories: 165, protein: 31, carbs: 0, fat: 3.6, emoji: '🍗' },
            'rice': { name: 'Rice', category: 'grains', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, emoji: '🍚' },
            'broccoli': { name: 'Broccoli', category: 'veg', calories: 34, protein: 2.8, carbs: 7, fat: 0.4, emoji: '🥦' }
        };
        
        const searchKey = foodName.toLowerCase();
        return foods[searchKey] || null;
    }
    
    // Create food module element
    createFoodModule(dragData) {
        const module = document.createElement('div');
        module.className = `food-module food-module-${dragData.category}`;
        module.draggable = true;
        
        // Store drag data
        module.dataset.dragData = JSON.stringify({
            type: 'food',
            name: dragData.name,
            calories: dragData.calories || 0,
            protein: dragData.protein || 0,
            carbs: dragData.carbs || 0,
            fat: dragData.fat || 0,
            category: dragData.category
        });
        
        const emoji = dragData.emoji || '🍽️';
        const quantity = dragData.quantity || 1;
        const unit = dragData.unit || 'serving';
        
        module.innerHTML = `
            <div class="module-content">
                <span class="module-emoji">${emoji}</span>
                <span class="module-name">${dragData.name}</span>
                <div class="module-portion">
                    <input type="number" class="module-portion-input" value="${quantity}" min="0.25" step="0.25">
                    <select class="module-unit-select">
                        <option value="g" ${unit === 'g' ? 'selected' : ''}>g</option>
                        <option value="oz" ${unit === 'oz' ? 'selected' : ''}>oz</option>
                        <option value="cup" ${unit === 'cup' ? 'selected' : ''}>cup</option>
                        <option value="serving" ${unit === 'serving' ? 'selected' : ''}>serving</option>
                    </select>
                </div>
                <button class="module-remove" onclick="this.closest('.food-module').remove()">×</button>
            </div>
            <div class="module-nutrition">
                <span class="nutrition-calories">${dragData.calories || 0} cal</span>
                <span class="nutrition-macros">${dragData.protein || 0}p ${dragData.carbs || 0}c ${dragData.fat || 0}f</span>
            </div>
        `;
        
        return module;
    }
}

export default RecipeProcessor;