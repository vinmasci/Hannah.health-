// AI-Powered Recipe Search
const RecipeAI = {
    // API configuration - get from config file
    apiKey: window.CONFIG?.SPOONACULAR_API_KEY || null,
    baseUrl: 'https://api.spoonacular.com',
    
    // Search for recipes using REAL AI (Claude)
    search: async function(query) {
        if (!query || query.trim().length < 3) {
            this.showError('Please enter at least 3 characters to search');
            return;
        }
        
        // Clear the search input
        const searchInput = document.querySelector('.ai-recipe-search-input');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Create a loading column immediately
        this.createAISearchColumn('loading', query);
        
        try {
            // Call our backend AI endpoint (proxied through Vite)
            const response = await fetch('/api/ai/recipe-search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ query })
            });
            
            const data = await response.json();
            
            if (data.success && data.recipes && data.recipes.length > 0) {
                // Show AI interpretation
                console.log('🤖 AI understood:', data.interpretation);
                this.displayResults(data.recipes, query, data.interpretation);
            } else {
                // Create empty column with no results message
                this.createAISearchColumn([], query);
            }
        } catch (error) {
            console.error('Recipe search error:', error);
            this.showError('Failed to search recipes. Please try again.');
        }
    },
    
    // Parse natural language query into API parameters
    parseNaturalQuery: function(query) {
        const params = {};
        const queryLower = query.toLowerCase();
        
        // Extract main ingredients
        const ingredients = [];
        if (queryLower.includes('chicken')) ingredients.push('chicken');
        if (queryLower.includes('beef')) ingredients.push('beef');
        if (queryLower.includes('salmon')) ingredients.push('salmon');
        if (queryLower.includes('tofu')) ingredients.push('tofu');
        if (queryLower.includes('pasta')) ingredients.push('pasta');
        if (queryLower.includes('rice')) ingredients.push('rice');
        
        if (ingredients.length > 0) {
            params.includeIngredients = ingredients.join(',');
        }
        
        // Extract meal type
        if (queryLower.includes('breakfast')) params.type = 'breakfast';
        else if (queryLower.includes('lunch')) params.type = 'main course';
        else if (queryLower.includes('dinner')) params.type = 'main course';
        else if (queryLower.includes('dessert')) params.type = 'dessert';
        else if (queryLower.includes('snack')) params.type = 'snack';
        else if (queryLower.includes('smoothie') || queryLower.includes('drink')) params.type = 'beverage';
        
        // Extract time constraints
        if (queryLower.includes('quick') || queryLower.includes('fast') || queryLower.includes('15 minute')) {
            params.maxReadyTime = 15;
        } else if (queryLower.includes('20 minute')) {
            params.maxReadyTime = 20;
        } else if (queryLower.includes('30 minute')) {
            params.maxReadyTime = 30;
        } else if (queryLower.includes('under an hour') || queryLower.includes('less than an hour')) {
            params.maxReadyTime = 60;
        }
        
        // Extract dietary preferences
        if (queryLower.includes('vegetarian')) params.diet = 'vegetarian';
        else if (queryLower.includes('vegan')) params.diet = 'vegan';
        else if (queryLower.includes('gluten free') || queryLower.includes('gluten-free')) params.diet = 'gluten free';
        else if (queryLower.includes('keto') || queryLower.includes('ketogenic')) params.diet = 'ketogenic';
        else if (queryLower.includes('paleo')) params.diet = 'paleo';
        
        // Extract nutritional constraints
        if (queryLower.includes('high protein')) params.minProtein = 20;
        if (queryLower.includes('low calorie') || queryLower.includes('under 300 calories')) {
            params.maxCalories = 300;
        } else if (queryLower.includes('under 400 calories')) {
            params.maxCalories = 400;
        } else if (queryLower.includes('under 500 calories')) {
            params.maxCalories = 500;
        }
        
        // Extract cuisine
        if (queryLower.includes('italian')) params.cuisine = 'italian';
        else if (queryLower.includes('mexican')) params.cuisine = 'mexican';
        else if (queryLower.includes('chinese')) params.cuisine = 'chinese';
        else if (queryLower.includes('indian')) params.cuisine = 'indian';
        else if (queryLower.includes('thai')) params.cuisine = 'thai';
        else if (queryLower.includes('greek')) params.cuisine = 'greek';
        else if (queryLower.includes('japanese')) params.cuisine = 'japanese';
        
        // Extract specific keywords for general search
        const keywords = [];
        if (queryLower.includes('healthy')) keywords.push('healthy');
        if (queryLower.includes('easy')) keywords.push('easy');
        if (queryLower.includes('meal prep')) keywords.push('meal prep');
        if (queryLower.includes('comfort food')) keywords.push('comfort food');
        if (queryLower.includes('salad')) keywords.push('salad');
        if (queryLower.includes('soup')) keywords.push('soup');
        if (queryLower.includes('sandwich')) keywords.push('sandwich');
        if (queryLower.includes('stir fry')) keywords.push('stir fry');
        
        // If no specific parameters were extracted, use the full query
        if (Object.keys(params).length === 0 || keywords.length > 0) {
            params.query = keywords.length > 0 ? keywords.join(' ') : query;
        }
        
        return params;
    },
    
    // Display search results in a column
    displayResults: function(recipes, query, interpretation) {
        // Hide the dropdown results area
        const dropdownResults = document.querySelector('.ai-search-results');
        if (dropdownResults) {
            dropdownResults.style.display = 'none';
        }
        
        // Create or update the AI search results column with AI interpretation
        this.createAISearchColumn(recipes, query, interpretation);
    },
    
    // Create AI search results column
    createAISearchColumn: function(recipes, query, interpretation) {
        const columnId = `ai-search-${Date.now()}`;
        
        // Handle loading state
        if (recipes === 'loading') {
            let column = document.querySelector('.ai-search-column');
            if (!column) {
                column = document.createElement('div');
                column.className = 'category-column ai-search-column animate-in';
                const mainBoard = document.querySelector('.main-board');
                const lastActiveDay = window.lastActiveDay || document.querySelector('.day-column');
                if (lastActiveDay) {
                    mainBoard.insertBefore(column, lastActiveDay.nextSibling);
                } else {
                    mainBoard.appendChild(column);
                }
            }
            column.innerHTML = `
                <div class="category-header" style="background: linear-gradient(135deg, #667eea, #764ba2);">
                    <h3 style="color: white;">🤖 AI Searching...</h3>
                </div>
                <div class="category-items recipe-results">
                    <div class="search-loading">🤖 Using AI to understand: "${query}"...</div>
                </div>
            `;
            return;
        }
        
        // Check if an AI search column already exists
        let column = document.querySelector('.ai-search-column');
        
        if (!column) {
            // Create new column
            column = document.createElement('div');
            column.className = 'category-column ai-search-column animate-in';
            column.dataset.columnId = columnId;
            column.draggable = true;
            
            // Add drag handlers for column reordering
            column.addEventListener('dragstart', window.handleColumnDragStart);
            column.addEventListener('dragend', window.handleColumnDragEnd);
            column.addEventListener('dragover', window.handleColumnDragOver);
            column.addEventListener('drop', window.handleColumnDrop);
            
            // Find position to insert (next to active day or at end)
            const mainBoard = document.querySelector('.main-board');
            const lastActiveDay = window.lastActiveDay || document.querySelector('.day-column');
            
            if (lastActiveDay) {
                mainBoard.insertBefore(column, lastActiveDay.nextSibling);
            } else {
                mainBoard.appendChild(column);
            }
        }
        
        // Build interpretation display
        let interpretationHtml = '';
        if (interpretation) {
            const filters = [];
            if (interpretation.type) filters.push(`🍽️ ${interpretation.type}`);
            if (interpretation.diet) filters.push(`🥗 ${interpretation.diet}`);
            if (interpretation.maxReadyTime) filters.push(`⏱️ ${interpretation.maxReadyTime}min`);
            if (interpretation.maxCalories) filters.push(`🔥 <${interpretation.maxCalories}cal`);
            if (interpretation.cuisine) filters.push(`🌍 ${interpretation.cuisine}`);
            
            if (filters.length > 0) {
                interpretationHtml = `
                    <div style="padding: 8px 12px; background: rgba(102, 126, 234, 0.1); border-bottom: 1px solid #e9ecef; font-size: 12px; color: #667eea;">
                        🤖 AI filters: ${filters.join(' • ')}
                    </div>
                `;
            }
        }
        
        // Update column content
        column.innerHTML = `
            <div class="category-header" style="background: linear-gradient(135deg, #667eea, #764ba2);">
                <h3 style="color: white;">🤖 "${query.substring(0, 25)}${query.length > 25 ? '...' : ''}"</h3>
                <button class="close-column" onclick="this.closest('.ai-search-column').remove()">×</button>
            </div>
            ${interpretationHtml}
            <div class="category-items recipe-results">
                ${recipes.length === 0 ? '<div class="search-placeholder">No recipes found</div>' : ''}
            </div>
        `;
        
        // Add recipe items to the column
        if (recipes.length > 0) {
            const itemsContainer = column.querySelector('.category-items');
            itemsContainer.innerHTML = '';
            
            recipes.forEach(recipe => {
                const recipeElement = this.createRecipeElement(recipe);
                itemsContainer.appendChild(recipeElement);
            });
        }
        
        // Animate in
        setTimeout(() => column.classList.add('active'), 10);
    },
    
    // Create draggable recipe element
    createRecipeElement: function(recipe) {
        const div = document.createElement('div');
        div.className = 'recipe-item';
        div.draggable = true;
        
        const simplifiedRecipe = this.simplifyRecipeData(recipe);
        
        // Format for the existing recipe system
        const recipeData = {
            id: simplifiedRecipe.id,
            name: simplifiedRecipe.title,
            readyInMinutes: simplifiedRecipe.readyInMinutes,
            servings: simplifiedRecipe.servings,
            kcal: simplifiedRecipe.calories,
            protein: simplifiedRecipe.protein,
            carbs: simplifiedRecipe.carbs,
            fat: simplifiedRecipe.fat
        };
        
        div.dataset.recipe = JSON.stringify(recipeData);
        
        const tags = [];
        if (recipe.vegetarian) tags.push('🥗');
        if (recipe.vegan) tags.push('🌱');
        if (recipe.glutenFree) tags.push('🌾');
        if (recipe.veryHealthy) tags.push('💚');
        
        div.innerHTML = `
            <div class="recipe-item-header">
                <div class="recipe-item-name">${recipe.title}</div>
                <div class="recipe-item-time">⏱️ ${recipe.readyInMinutes || '?'} min</div>
            </div>
            <div class="recipe-item-stats">
                <span class="recipe-stat">🔥 ${simplifiedRecipe.calories} kcal</span>
                <span class="recipe-stat">👥 ${recipe.servings || '?'} servings</span>
                ${tags.length > 0 ? `<span class="recipe-stat">${tags.join(' ')}</span>` : ''}
            </div>
        `;
        
        // Use existing recipe drag handlers
        div.addEventListener('dragstart', window.handleRecipeDragStart);
        div.addEventListener('dragend', window.handleRecipeDragEnd);
        
        return div;
    },
    
    // Simplify recipe data for storage
    simplifyRecipeData: function(recipe) {
        const calories = recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0;
        const protein = recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0;
        const carbs = recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0;
        const fat = recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0;
        
        return {
            id: recipe.id,
            title: recipe.title,
            image: recipe.image,
            readyInMinutes: recipe.readyInMinutes,
            servings: recipe.servings,
            sourceUrl: recipe.sourceUrl,
            calories: Math.round(calories),
            protein: Math.round(protein),
            carbs: Math.round(carbs),
            fat: Math.round(fat),
            ingredients: recipe.extendedIngredients?.map(ing => ({
                name: ing.name,
                amount: ing.amount,
                unit: ing.unit
            })) || []
        };
    },
    
    // Handle recipe drag start
    handleDragStart: function(e) {
        const recipeCard = e.target.closest('.ai-recipe-card');
        if (!recipeCard) return;
        
        const recipeData = JSON.parse(recipeCard.dataset.recipe);
        e.dataTransfer.effectAllowed = 'copy';
        e.dataTransfer.setData('application/json', JSON.stringify({
            type: 'recipe',
            data: recipeData
        }));
        
        recipeCard.classList.add('dragging');
    },
    
    // Show error message
    showError: function(message) {
        const resultsDiv = document.querySelector('.ai-search-results');
        resultsDiv.style.display = 'block';
        resultsDiv.innerHTML = `
            <div style="text-align: center; padding: 20px; color: #dc3545;">
                ⚠️ ${message}
            </div>
        `;
    },
    
    // Initialize
    init: function() {
        // Check if API key is set
        if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
            console.error('⚠️ Spoonacular API key not configured!');
            console.warn('Please add your API key to config.js');
            console.warn('Get your free API key at: https://spoonacular.com/food-api/console#Dashboard');
            
            // Disable search functionality
            const searchBtn = document.querySelector('.ai-search-btn');
            const searchInput = document.querySelector('.ai-recipe-search-input');
            if (searchBtn) searchBtn.disabled = true;
            if (searchInput) {
                searchInput.disabled = true;
                searchInput.placeholder = 'API key not configured - please add to config.js';
            }
        }
        
        // Add drag end listener to clean up
        document.addEventListener('dragend', (e) => {
            if (e.target.classList.contains('ai-recipe-card')) {
                e.target.classList.remove('dragging');
            }
        });
    }
};

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => RecipeAI.init());
} else {
    RecipeAI.init();
}

// Export for global use
window.RecipeAI = RecipeAI;