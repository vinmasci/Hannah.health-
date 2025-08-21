// FatSecret Client-Side Integration
// Uses the proxy server for API calls

class FatSecretClient {
    constructor() {
        this.proxyUrl = 'http://localhost:3003';
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    }

    // Search for foods with caching
    async searchFoods(query, maxResults = 20) {
        const cacheKey = `search_${query}_${maxResults}`;
        
        // Check cache
        if (this.cache.has(cacheKey)) {
            const cached = this.cache.get(cacheKey);
            if (Date.now() - cached.timestamp < this.cacheTimeout) {
                return cached.data;
            }
        }

        try {
            const response = await fetch(`${this.proxyUrl}/api/search?q=${encodeURIComponent(query)}&max=${maxResults}`);
            const data = await response.json();
            
            // Check for API errors
            if (data.error) {
                console.warn('FatSecret API error:', data.error.message);
                return this.searchLocalFallback(query);
            }

            const foods = this.formatSearchResults(data);
            
            // Cache the results
            this.cache.set(cacheKey, {
                data: foods,
                timestamp: Date.now()
            });
            
            return foods;
        } catch (error) {
            console.error('Error searching foods:', error);
            return this.searchLocalFallback(query);
        }
    }

    // Format search results from FatSecret API
    formatSearchResults(data) {
        if (!data.foods || !data.foods.food) {
            return [];
        }

        let foods = data.foods.food;
        if (!Array.isArray(foods)) {
            foods = [foods];
        }

        return foods.map(food => {
            // Parse nutrition from description
            const desc = food.food_description || '';
            // Updated regex to handle the actual format from FatSecret
            const matches = desc.match(/Calories:\s*([\d.]+)kcal.*?Fat:\s*([\d.]+)g.*?Carbs:\s*([\d.]+)g.*?Protein:\s*([\d.]+)g/i);
            
            if (matches) {
                return {
                    name: food.food_name,
                    brand: food.brand_name || '',
                    baseQuantity: 100,
                    baseUnit: 'g',
                    kcal: Math.round(parseFloat(matches[1])),  // calories
                    fat: parseFloat(matches[2]),                // fat
                    carbs: parseFloat(matches[3]),              // carbs
                    protein: parseFloat(matches[4]),            // protein
                    cost: 2.00, // Default cost
                    source: 'fatsecret',
                    id: food.food_id
                };
            }
            
            return null;
        }).filter(Boolean);
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

    // Add search UI to category column
    async enhanceSearchInput(category, searchTerm) {
        const results = await this.searchFoods(searchTerm, 10);
        return results;
    }
}

// Create global instance
window.fatSecretClient = new FatSecretClient();

// Pre-populate popular foods for each category on page load
window.addEventListener('DOMContentLoaded', async () => {
    const popularSearches = {
        'protein': ['chicken breast', 'salmon', 'eggs', 'beef', 'turkey'],
        'veg': ['broccoli', 'spinach', 'carrots', 'tomatoes', 'lettuce'],
        'fruit': ['apple', 'banana', 'orange', 'strawberry', 'blueberry'],
        'carbs': ['rice', 'pasta', 'bread', 'potato', 'oatmeal'],
        'extras': ['olive oil', 'butter', 'cheese', 'yogurt', 'milk']
    };
    
    // Pre-fetch popular items for each category
    for (const [category, searches] of Object.entries(popularSearches)) {
        const column = document.querySelector(`.category-column[data-category="${category}"]`);
        if (column) {
            // Cache the first search term for the category
            const firstSearch = searches[0];
            try {
                await window.fatSecretClient.searchFoods(firstSearch, 10);
            } catch (error) {
                console.warn(`Failed to pre-fetch ${firstSearch}:`, error);
            }
        }
    }
});

// Enhance the existing search functionality
const originalFilterFoodItems = window.filterFoodItems;

window.filterFoodItems = async function(category, searchText) {
    // First do the local filter
    if (originalFilterFoodItems) {
        originalFilterFoodItems(category, searchText);
    }
    
    // If search text is long enough, also search FatSecret
    if (searchText.length >= 3) {
        const column = document.querySelector(`.category-column[data-category="${category}"]`);
        const itemsContainer = column.querySelector('.category-items');
        
        // Add loading indicator
        if (!itemsContainer.querySelector('.search-loading')) {
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'search-loading';
            loadingDiv.innerHTML = '<div class="loading-spinner"></div> Searching online database...';
            itemsContainer.insertBefore(loadingDiv, itemsContainer.firstChild);
        }
        
        try {
            const results = await window.fatSecretClient.searchFoods(searchText);
            
            // Remove loading indicator
            const loading = itemsContainer.querySelector('.search-loading');
            if (loading) loading.remove();
            
            // Add FatSecret results if any
            if (results.length > 0) {
                // Check if we already have a results section
                let resultsSection = itemsContainer.querySelector('.fatsecret-results');
                if (!resultsSection) {
                    resultsSection = document.createElement('div');
                    resultsSection.className = 'fatsecret-results';
                    resultsSection.innerHTML = '<div class="results-header">Online Database Results:</div>';
                    itemsContainer.appendChild(resultsSection);
                }
                
                // Clear previous results
                const existingItems = resultsSection.querySelectorAll('.food-item');
                existingItems.forEach(item => item.remove());
                
                // Add new results
                results.slice(0, 5).forEach(food => {
                    // Assign to appropriate category based on macros
                    food.category = category;
                    const foodElement = window.createFoodItemElement ? 
                        window.createFoodItemElement(food, category) :
                        createFoodItemElement(food, category);
                    resultsSection.appendChild(foodElement);
                });
            }
        } catch (error) {
            console.error('Error searching FatSecret:', error);
            const loading = itemsContainer.querySelector('.search-loading');
            if (loading) loading.remove();
        }
    } else {
        // Clear FatSecret results if search is too short
        const column = document.querySelector(`.category-column[data-category="${category}"]`);
        const resultsSection = column.querySelector('.fatsecret-results');
        if (resultsSection) resultsSection.remove();
    }
};

// Helper function to create food item element
function createFoodItemElement(food, category) {
    const div = document.createElement('div');
    div.className = 'food-item';
    div.draggable = true;
    
    const foodData = {
        ...food,
        category: category,
        currentQuantity: food.baseQuantity,
        currentUnit: food.baseUnit
    };
    
    div.dataset.food = JSON.stringify(foodData);
    
    const isFavorited = window.favoritesManager ? window.favoritesManager.isFavorite(foodData) : false;
    
    div.innerHTML = `
        <div class="food-item-header">
            <div class="food-name">${food.name}${food.brand ? ` (${food.brand})` : ''}</div>
            <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" 
                    onclick="event.stopPropagation(); window.favoritesManager.toggleFavorite(this)" 
                    title="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}">
                ${isFavorited ? '❤️' : '🤍'}
            </button>
        </div>
        <div class="food-portion">
            <input type="number" class="portion-input" value="${food.baseQuantity}" min="1" step="1">
            <select class="unit-select">
                <option value="${food.baseUnit}">${food.baseUnit}</option>
            </select>
        </div>
        <div class="food-macros">
            <div class="macro-bar-container">
                <div class="macro-bar">
                    ${window.createMacroBar(food.protein, food.carbs, food.fat)}
                </div>
                <div class="macro-labels">
                    ${window.createMacroLabels(food.protein, food.carbs, food.fat)}
                </div>
            </div>
            <div class="macro-stats">
                <span class="macro kcal">${food.kcal} kcal</span>
                <span class="macro cost">$${food.cost.toFixed(2)}</span>
            </div>
        </div>
        ${food.source === 'fatsecret' ? '<div class="food-source">🌐 Online</div>' : ''}
    `;
    
    // Add event listeners
    div.addEventListener('dragstart', window.handleFoodDragStart);
    div.addEventListener('dragend', window.handleFoodDragEnd);
    
    const portionInput = div.querySelector('.portion-input');
    const unitSelect = div.querySelector('.unit-select');
    
    portionInput.addEventListener('change', window.handlePortionChange);
    unitSelect.addEventListener('change', window.handleUnitChange);
    
    return div;
}