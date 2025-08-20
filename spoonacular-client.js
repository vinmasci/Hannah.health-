// Spoonacular API Client
// Direct client-side integration with comprehensive food and recipe data

class SpoonacularClient {
    constructor() {
        // Get API key from config file - NEVER hardcode API keys!
        this.apiKey = window.CONFIG?.SPOONACULAR_API_KEY;
        
        if (!this.apiKey || this.apiKey === 'YOUR_API_KEY_HERE') {
            console.error('⚠️ Spoonacular API key not configured! Please add your API key to config.js');
            console.warn('Get your free API key at: https://spoonacular.com/food-api/console#Dashboard');
            this.apiKey = null;
        }
        
        this.baseUrl = 'https://api.spoonacular.com';
        this.cache = new Map();
        this.cacheTimeout = 10 * 60 * 1000; // 10 minutes
    }

    // Search for ingredients/foods with category filtering
    async searchIngredients(query, number = 10, category = null) {
        // Map our categories to Spoonacular ingredient types
        const categoryMapping = {
            'veg': 'vegetables',
            'fruit': 'fruits',
            'protein': 'proteins',
            'dairy': 'dairy',
            'grains': 'grains',
            'nuts': 'nuts',
            'drinks': 'beverages',
            'sweets': 'desserts',
            'carbs': 'starches',
            'extras': 'condiments'
        };
        
        const intolerances = category && categoryMapping[category] ? `&intolerances=${categoryMapping[category]}` : '';
        const cacheKey = `ingredients_${query}_${number}_${category}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            // Add metadata to get more detailed category info
            const response = await fetch(
                `${this.baseUrl}/food/ingredients/search?query=${encodeURIComponent(query)}&number=${number}&metaInformation=true&apiKey=${this.apiKey}`
            );
            const data = await response.json();
            
            if (data.results) {
                // Filter results by category if specified
                let filteredResults = data.results;
                if (category) {
                    filteredResults = this.filterByCategory(data.results, category);
                }
                
                const formattedResults = await this.getIngredientsInfo(filteredResults);
                
                // Cache the results
                this.cache.set(cacheKey, {
                    data: formattedResults,
                    timestamp: Date.now()
                });
                
                return formattedResults;
            }
            return [];
        } catch (error) {
            console.error('Error searching ingredients:', error);
            return this.searchLocalFallback(query);
        }
    }

    // Get detailed nutrition info for ingredients
    async getIngredientsInfo(ingredients) {
        const detailedIngredients = [];
        
        for (const ingredient of ingredients.slice(0, 5)) { // Limit to 5 to save API calls
            try {
                const response = await fetch(
                    `${this.baseUrl}/food/ingredients/${ingredient.id}/information?amount=100&unit=grams&apiKey=${this.apiKey}`
                );
                const data = await response.json();
                
                if (data.nutrition) {
                    const nutrients = data.nutrition.nutrients;
                    detailedIngredients.push({
                        name: data.name,
                        id: data.id,
                        baseQuantity: 100,
                        baseUnit: 'g',
                        kcal: Math.round(nutrients.find(n => n.name === 'Calories')?.amount || 0),
                        protein: Math.round(nutrients.find(n => n.name === 'Protein')?.amount || 0),
                        carbs: Math.round(nutrients.find(n => n.name === 'Carbohydrates')?.amount || 0),
                        fat: Math.round(nutrients.find(n => n.name === 'Fat')?.amount || 0),
                        cost: data.estimatedCost?.value / 100 || 2.00,
                        source: 'spoonacular'
                    });
                }
            } catch (error) {
                console.warn(`Failed to get info for ingredient ${ingredient.name}:`, error);
            }
        }
        
        return detailedIngredients;
    }

    // Search for recipes
    async searchRecipes(query, diet = '', maxCalories = null, number = 10) {
        const cacheKey = `recipes_${query}_${diet}_${maxCalories}_${number}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            let url = `${this.baseUrl}/recipes/complexSearch?query=${encodeURIComponent(query)}&number=${number}&addRecipeNutrition=true&apiKey=${this.apiKey}`;
            
            if (diet) url += `&diet=${diet}`;
            if (maxCalories) url += `&maxCalories=${maxCalories}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            if (data.results) {
                const formattedRecipes = data.results.map(recipe => ({
                    id: recipe.id,
                    name: recipe.title,
                    image: recipe.image,
                    readyInMinutes: recipe.readyInMinutes,
                    servings: recipe.servings,
                    kcal: Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0),
                    protein: Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0),
                    carbs: Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0),
                    fat: Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0),
                    source: 'spoonacular-recipe'
                }));
                
                // Cache the results
                this.cache.set(cacheKey, {
                    data: formattedRecipes,
                    timestamp: Date.now()
                });
                
                return formattedRecipes;
            }
            return [];
        } catch (error) {
            console.error('Error searching recipes:', error);
            return [];
        }
    }

    // Get recipe details including ingredients and instructions
    async getRecipeDetails(recipeId) {
        const cacheKey = `recipe_${recipeId}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(
                `${this.baseUrl}/recipes/${recipeId}/information?includeNutrition=true&apiKey=${this.apiKey}`
            );
            const recipe = await response.json();
            
            const formattedRecipe = {
                id: recipe.id,
                name: recipe.title,
                image: recipe.image,
                readyInMinutes: recipe.readyInMinutes,
                servings: recipe.servings,
                ingredients: recipe.extendedIngredients?.map(ing => ({
                    name: ing.name,
                    amount: ing.amount,
                    unit: ing.unit,
                    original: ing.original
                })) || [],
                instructions: recipe.instructions,
                nutrition: {
                    kcal: Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0),
                    protein: Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0),
                    carbs: Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0),
                    fat: Math.round(recipe.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0)
                },
                diets: recipe.diets || [],
                dishTypes: recipe.dishTypes || [],
                source: 'spoonacular-recipe'
            };
            
            // Cache the results
            this.cache.set(cacheKey, {
                data: formattedRecipe,
                timestamp: Date.now()
            });
            
            return formattedRecipe;
        } catch (error) {
            console.error('Error getting recipe details:', error);
            return null;
        }
    }

    // Generate meal plan
    async generateMealPlan(timeFrame = 'week', targetCalories = 2000, diet = '') {
        try {
            let url = `${this.baseUrl}/mealplanner/generate?timeFrame=${timeFrame}&targetCalories=${targetCalories}&apiKey=${this.apiKey}`;
            if (diet) url += `&diet=${diet}`;
            
            const response = await fetch(url);
            const data = await response.json();
            
            return data;
        } catch (error) {
            console.error('Error generating meal plan:', error);
            return null;
        }
    }

    // Search grocery products
    async searchGroceryProducts(query, number = 10) {
        try {
            const response = await fetch(
                `${this.baseUrl}/food/products/search?query=${encodeURIComponent(query)}&number=${number}&apiKey=${this.apiKey}`
            );
            const data = await response.json();
            
            if (data.products) {
                return data.products.map(product => ({
                    id: product.id,
                    name: product.title,
                    image: product.image,
                    brand: product.brand || '',
                    source: 'spoonacular-product'
                }));
            }
            return [];
        } catch (error) {
            console.error('Error searching grocery products:', error);
            return [];
        }
    }

    // Get product info by barcode
    async getProductByBarcode(upc) {
        try {
            const response = await fetch(
                `${this.baseUrl}/food/products/upc/${upc}?apiKey=${this.apiKey}`
            );
            const product = await response.json();
            
            if (product.id) {
                return {
                    id: product.id,
                    name: product.title,
                    brand: product.brand || '',
                    image: product.image,
                    kcal: Math.round(product.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0),
                    protein: Math.round(product.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0),
                    carbs: Math.round(product.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0),
                    fat: Math.round(product.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0),
                    servingSize: product.servingSize || '1 serving',
                    source: 'spoonacular-barcode'
                };
            }
            return null;
        } catch (error) {
            console.error('Error getting product by barcode:', error);
            return null;
        }
    }

    // Get random food trivia (fun feature!)
    async getFoodTrivia() {
        try {
            const response = await fetch(
                `${this.baseUrl}/food/trivia/random?apiKey=${this.apiKey}`
            );
            const data = await response.json();
            return data.text;
        } catch (error) {
            console.error('Error getting food trivia:', error);
            return null;
        }
    }

    // Filter ingredients by category based on their aisle/category
    filterByCategory(ingredients, category) {
        const categoryKeywords = {
            'veg': ['vegetable', 'produce', 'fresh', 'salad', 'greens'],
            'fruit': ['fruit', 'berry', 'berries', 'citrus', 'tropical'],
            'protein': ['meat', 'poultry', 'seafood', 'fish', 'protein', 'egg'],
            'dairy': ['dairy', 'milk', 'cheese', 'yogurt', 'cream'],
            'grains': ['grain', 'bread', 'pasta', 'rice', 'cereal', 'wheat'],
            'nuts': ['nut', 'seed', 'almond', 'peanut', 'cashew'],
            'drinks': ['beverage', 'drink', 'juice', 'tea', 'coffee'],
            'sweets': ['sweet', 'dessert', 'candy', 'chocolate', 'sugar'],
            'carbs': ['potato', 'starch', 'legume', 'bean', 'lentil'],
            'extras': ['oil', 'sauce', 'condiment', 'spice', 'seasoning']
        };
        
        const keywords = categoryKeywords[category] || [];
        if (keywords.length === 0) return ingredients;
        
        return ingredients.filter(ingredient => {
            const name = (ingredient.name || '').toLowerCase();
            const aisle = (ingredient.aisle || '').toLowerCase();
            return keywords.some(keyword => 
                name.includes(keyword) || aisle.includes(keyword)
            );
        });
    }
    
    // Fallback to local database
    searchLocalFallback(query) {
        const term = query.toLowerCase();
        const results = [];
        
        // Search through all categories in the local database
        Object.keys(window.foodDatabase || {}).forEach(category => {
            const foods = window.foodDatabase[category] || [];
            foods.forEach(food => {
                if (food.name.toLowerCase().includes(term)) {
                    results.push({
                        ...food,
                        category: category,
                        source: 'local'
                    });
                }
            });
        });
        
        return results;
    }
}

// Create global instance
window.spoonacularClient = new SpoonacularClient();

// Override the existing search functionality
window.searchWithSpoonacular = async function(category, searchText) {
    const column = document.querySelector(`.category-column[data-category="${category}"]`);
    const itemsContainer = column.querySelector('.category-items');
    
    // Remove any existing search results
    const existingResults = itemsContainer.querySelector('.spoonacular-results');
    if (existingResults) existingResults.remove();
    
    if (searchText.length >= 3) {
        // Add loading indicator
        if (!itemsContainer.querySelector('.search-loading')) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'search-loading';
            loadingDiv.innerHTML = `<div class="loading-spinner"></div> Searching ${category} items...`;
            itemsContainer.insertBefore(loadingDiv, itemsContainer.firstChild);
        }
        
        try {
            // Pass category to filter results
            const results = await window.spoonacularClient.searchIngredients(searchText, 10, category);
            
            // Remove loading indicator
            const loading = itemsContainer.querySelector('.search-loading');
            if (loading) loading.remove();
            
            // Add Spoonacular results if any
            if (results.length > 0) {
                const resultsSection = document.createElement('div');
                resultsSection.className = 'spoonacular-results';
                resultsSection.innerHTML = '<div class="results-header">🥄 Spoonacular Results:</div>';
                
                results.forEach(food => {
                    food.category = category;
                    const foodElement = window.createFoodItemElement ? 
                        window.createFoodItemElement(food, category) :
                        createFoodItemElement(food, category);
                    resultsSection.appendChild(foodElement);
                });
                
                itemsContainer.appendChild(resultsSection);
            }
        } catch (error) {
            console.error('Error searching Spoonacular:', error);
            const loading = itemsContainer.querySelector('.search-loading');
            if (loading) loading.remove();
        }
    }
};

console.log('Spoonacular client loaded! API features available:');
console.log('- Ingredient search with detailed nutrition');
console.log('- Recipe search and details');
console.log('- Meal plan generation');
console.log('- Barcode scanning');
console.log('- Grocery product search');