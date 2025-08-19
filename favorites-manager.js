// Food Favorites and History Manager
// Manages favorite foods and recently used items for Hannah Health Meal Planner

class FavoritesManager {
    constructor() {
        this.STORAGE_KEYS = {
            FAVORITES: 'hannahHealthFavorites',
            HISTORY: 'hannahHealthHistory'
        };
        this.MAX_HISTORY = 20;
        this.init();
    }

    init() {
        // Ensure storage exists
        if (!localStorage.getItem(this.STORAGE_KEYS.FAVORITES)) {
            localStorage.setItem(this.STORAGE_KEYS.FAVORITES, JSON.stringify([]));
        }
        if (!localStorage.getItem(this.STORAGE_KEYS.HISTORY)) {
            localStorage.setItem(this.STORAGE_KEYS.HISTORY, JSON.stringify([]));
        }
    }

    // === FAVORITES MANAGEMENT ===

    /**
     * Add a food item to favorites
     * @param {Object} foodItem - The food item to add
     */
    addToFavorites(foodItem) {
        const favorites = this.getFavorites();
        const favoriteItem = {
            id: this.generateItemId(foodItem),
            name: foodItem.name,
            category: foodItem.category,
            baseQuantity: foodItem.baseQuantity,
            baseUnit: foodItem.baseUnit,
            kcal: foodItem.kcal,
            protein: foodItem.protein,
            carbs: foodItem.carbs,
            fat: foodItem.fat,
            cost: foodItem.cost,
            source: foodItem.source || 'local',
            brand: foodItem.brand || '',
            dateAdded: new Date().toISOString(),
            timesUsed: 0
        };

        // Check if already in favorites
        const existingIndex = favorites.findIndex(fav => fav.id === favoriteItem.id);
        if (existingIndex === -1) {
            favorites.push(favoriteItem);
            localStorage.setItem(this.STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
            this.showNotification(`❤️ ${foodItem.name} added to favorites!`, 'success');
            return true;
        }
        return false; // Already exists
    }

    /**
     * Remove a food item from favorites
     * @param {string} itemId - The ID of the item to remove
     */
    removeFromFavorites(itemId) {
        const favorites = this.getFavorites();
        const filteredFavorites = favorites.filter(fav => fav.id !== itemId);
        
        if (filteredFavorites.length !== favorites.length) {
            localStorage.setItem(this.STORAGE_KEYS.FAVORITES, JSON.stringify(filteredFavorites));
            this.showNotification('🗑️ Removed from favorites', 'info');
            return true;
        }
        return false;
    }

    /**
     * Check if a food item is in favorites
     * @param {Object} foodItem - The food item to check
     */
    isFavorite(foodItem) {
        const favorites = this.getFavorites();
        const itemId = this.generateItemId(foodItem);
        return favorites.some(fav => fav.id === itemId);
    }

    /**
     * Get all favorite items
     * @returns {Array} Array of favorite food items
     */
    getFavorites() {
        try {
            return JSON.parse(localStorage.getItem(this.STORAGE_KEYS.FAVORITES)) || [];
        } catch (error) {
            console.error('Error loading favorites:', error);
            return [];
        }
    }

    /**
     * Get favorites organized by category
     * @returns {Object} Favorites organized by category
     */
    getFavoritesByCategory() {
        const favorites = this.getFavorites();
        const categorized = {
            protein: [],
            veg: [],
            fruit: [],
            carbs: [],
            extras: [],
            other: []
        };

        favorites.forEach(item => {
            const category = item.category || 'other';
            if (categorized[category]) {
                categorized[category].push(item);
            } else {
                categorized.other.push(item);
            }
        });

        return categorized;
    }

    // === HISTORY MANAGEMENT ===

    /**
     * Add a food item to history
     * @param {Object} foodItem - The food item to add to history
     */
    addToHistory(foodItem) {
        const history = this.getHistory();
        const historyItem = {
            id: this.generateItemId(foodItem),
            name: foodItem.name,
            category: foodItem.category,
            baseQuantity: foodItem.baseQuantity,
            baseUnit: foodItem.baseUnit,
            kcal: foodItem.kcal,
            protein: foodItem.protein,
            carbs: foodItem.carbs,
            fat: foodItem.fat,
            cost: foodItem.cost,
            source: foodItem.source || 'local',
            brand: foodItem.brand || '',
            lastUsed: new Date().toISOString(),
            quantity: foodItem.quantity || foodItem.baseQuantity,
            unit: foodItem.unit || foodItem.baseUnit
        };

        // Remove if already exists
        const filteredHistory = history.filter(item => item.id !== historyItem.id);
        
        // Add to beginning
        filteredHistory.unshift(historyItem);
        
        // Keep only MAX_HISTORY items
        const trimmedHistory = filteredHistory.slice(0, this.MAX_HISTORY);
        
        localStorage.setItem(this.STORAGE_KEYS.HISTORY, JSON.stringify(trimmedHistory));

        // Update times used for favorites
        this.updateFavoriteUsage(historyItem.id);
    }

    /**
     * Get recent history items
     * @param {number} limit - Number of items to return
     * @returns {Array} Array of recent food items
     */
    getHistory(limit = this.MAX_HISTORY) {
        try {
            const history = JSON.parse(localStorage.getItem(this.STORAGE_KEYS.HISTORY)) || [];
            return history.slice(0, limit);
        } catch (error) {
            console.error('Error loading history:', error);
            return [];
        }
    }

    /**
     * Clear all history
     */
    clearHistory() {
        localStorage.setItem(this.STORAGE_KEYS.HISTORY, JSON.stringify([]));
        this.showNotification('🗑️ History cleared', 'info');
    }

    // === UTILITY METHODS ===

    /**
     * Generate a unique ID for a food item
     * @param {Object} foodItem - The food item
     * @returns {string} Unique identifier
     */
    generateItemId(foodItem) {
        const name = foodItem.name.toLowerCase().replace(/\s+/g, '-');
        const brand = foodItem.brand ? foodItem.brand.toLowerCase().replace(/\s+/g, '-') : '';
        const source = foodItem.source || 'local';
        return `${source}-${name}${brand ? `-${brand}` : ''}`;
    }

    /**
     * Update usage count for favorite item
     * @param {string} itemId - The item ID
     */
    updateFavoriteUsage(itemId) {
        const favorites = this.getFavorites();
        const favorite = favorites.find(fav => fav.id === itemId);
        
        if (favorite) {
            favorite.timesUsed = (favorite.timesUsed || 0) + 1;
            favorite.lastUsed = new Date().toISOString();
            localStorage.setItem(this.STORAGE_KEYS.FAVORITES, JSON.stringify(favorites));
        }
    }

    /**
     * Search favorites
     * @param {string} query - Search query
     * @returns {Array} Filtered favorites
     */
    searchFavorites(query) {
        const favorites = this.getFavorites();
        const searchTerm = query.toLowerCase();
        
        return favorites.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            (item.brand && item.brand.toLowerCase().includes(searchTerm)) ||
            item.category.toLowerCase().includes(searchTerm)
        );
    }

    /**
     * Filter favorites by category
     * @param {string} category - Category to filter by
     * @returns {Array} Filtered favorites
     */
    filterFavoritesByCategory(category) {
        const favorites = this.getFavorites();
        return favorites.filter(item => item.category === category);
    }

    /**
     * Get favorite items sorted by usage
     * @param {number} limit - Number of items to return
     * @returns {Array} Most used favorites
     */
    getMostUsedFavorites(limit = 10) {
        const favorites = this.getFavorites();
        return favorites
            .sort((a, b) => (b.timesUsed || 0) - (a.timesUsed || 0))
            .slice(0, limit);
    }

    /**
     * Export favorites data
     * @returns {Object} Exportable favorites data
     */
    exportFavorites() {
        return {
            favorites: this.getFavorites(),
            history: this.getHistory(),
            exportDate: new Date().toISOString()
        };
    }

    /**
     * Import favorites data
     * @param {Object} data - Import data
     */
    importFavorites(data) {
        try {
            if (data.favorites) {
                localStorage.setItem(this.STORAGE_KEYS.FAVORITES, JSON.stringify(data.favorites));
            }
            if (data.history) {
                localStorage.setItem(this.STORAGE_KEYS.HISTORY, JSON.stringify(data.history));
            }
            this.showNotification('✅ Favorites imported successfully!', 'success');
        } catch (error) {
            console.error('Error importing favorites:', error);
            this.showNotification('❌ Error importing favorites', 'error');
        }
    }

    /**
     * Get statistics about favorites usage
     * @returns {Object} Statistics object
     */
    getStatistics() {
        const favorites = this.getFavorites();
        const history = this.getHistory();
        const categorized = this.getFavoritesByCategory();
        
        return {
            totalFavorites: favorites.length,
            totalHistoryItems: history.length,
            favoritesByCategory: Object.keys(categorized).reduce((acc, cat) => {
                acc[cat] = categorized[cat].length;
                return acc;
            }, {}),
            mostUsedFavorite: favorites.reduce((max, fav) => 
                (fav.timesUsed || 0) > (max.timesUsed || 0) ? fav : max, favorites[0] || null),
            totalUsageCount: favorites.reduce((sum, fav) => sum + (fav.timesUsed || 0), 0)
        };
    }

    // === UI HELPER METHODS ===

    /**
     * Show notification to user
     * @param {string} message - Notification message
     * @param {string} type - Notification type
     */
    showNotification(message, type = 'info') {
        // Use existing notification system from MealStorage
        if (window.MealStorage && window.MealStorage.showNotification) {
            window.MealStorage.showNotification(message, type);
        } else {
            console.log(`[${type.toUpperCase()}] ${message}`);
        }
    }

    /**
     * Create star icon for favorite button
     * @param {boolean} isFavorited - Whether item is favorited
     * @returns {string} HTML string for star icon
     */
    createStarIcon(isFavorited = false) {
        return `<button class="favorite-btn ${isFavorited ? 'favorited' : ''}" 
                        onclick="event.stopPropagation(); favoritesManager.toggleFavorite(this)" 
                        title="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}">
                    ${isFavorited ? '❤️' : '🤍'}
                </button>`;
    }

    /**
     * Toggle favorite status from UI button
     * @param {HTMLElement} buttonElement - The star button clicked
     */
    toggleFavorite(buttonElement) {
        const foodItem = buttonElement.closest('.food-item');
        if (!foodItem) return;

        const foodData = JSON.parse(foodItem.dataset.food);
        const itemId = this.generateItemId(foodData);
        
        if (this.isFavorite(foodData)) {
            // Remove from favorites
            this.removeFromFavorites(itemId);
            buttonElement.innerHTML = '🤍';
            buttonElement.classList.remove('favorited');
            buttonElement.title = 'Add to favorites';
        } else {
            // Add to favorites
            this.addToFavorites(foodData);
            buttonElement.innerHTML = '❤️';
            buttonElement.classList.add('favorited');
            buttonElement.title = 'Remove from favorites';
        }

        // Update any open favorites modal
        if (document.getElementById('favoritesModal')) {
            this.refreshFavoritesModal();
        }
    }

    /**
     * Refresh the favorites modal if it's open
     */
    refreshFavoritesModal() {
        const modal = document.getElementById('favoritesModal');
        if (modal && modal.style.display !== 'none') {
            this.closeFavoritesModal();
            setTimeout(() => this.showFavoritesModal(), 100);
        }
    }

    /**
     * Show the favorites modal
     */
    showFavoritesModal() {
        // Remove existing modal if any
        const existingModal = document.getElementById('favoritesModal');
        if (existingModal) {
            existingModal.remove();
        }

        // Create modal
        const modal = document.createElement('div');
        modal.id = 'favoritesModal';
        modal.className = 'favorites-modal';
        modal.innerHTML = this.createFavoritesModalHTML();

        document.body.appendChild(modal);
        modal.style.display = 'flex';

        // Setup event listeners
        this.setupFavoritesModalEvents();
        
        // Initial load of favorites
        this.loadFavoritesContent();
    }

    /**
     * Close the favorites modal
     */
    closeFavoritesModal() {
        const modal = document.getElementById('favoritesModal');
        if (modal) {
            modal.remove();
        }
    }

    /**
     * Create the HTML structure for the favorites modal
     */
    createFavoritesModalHTML() {
        const stats = this.getStatistics();
        
        return `
            <div class="favorites-modal-content">
                <div class="favorites-header">
                    <h2>❤️ Food Favorites & History</h2>
                    <button class="favorites-close" onclick="favoritesManager.closeFavoritesModal()">&times;</button>
                </div>
                
                <div class="favorites-stats">
                    <div class="stat-card">
                        <div class="stat-number">${stats.totalFavorites}</div>
                        <div class="stat-label">Favorites</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.totalHistoryItems}</div>
                        <div class="stat-label">Recent Items</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-number">${stats.totalUsageCount}</div>
                        <div class="stat-label">Total Uses</div>
                    </div>
                </div>
                
                <div class="favorites-controls">
                    <div class="favorites-tabs">
                        <button class="favorites-tab active" data-tab="favorites">❤️ Favorites</button>
                        <button class="favorites-tab" data-tab="history">🕒 Recent</button>
                        <button class="favorites-tab" data-tab="most-used">📊 Most Used</button>
                    </div>
                    
                    <div class="favorites-search">
                        <input type="text" id="favoritesSearchInput" placeholder="Search favorites..." />
                        <select id="categoryFilter">
                            <option value="">All Categories</option>
                            <option value="protein">🥩 Proteins</option>
                            <option value="veg">🥦 Veggies</option>
                            <option value="fruit">🍎 Fruits</option>
                            <option value="carbs">🍞 Carbs</option>
                            <option value="extras">✨ Extras</option>
                        </select>
                    </div>
                </div>
                
                <div class="favorites-content-area">
                    <div id="favoritesContent" class="favorites-list"></div>
                </div>
                
                <div class="favorites-actions">
                    <button class="favorites-action-btn" onclick="favoritesManager.exportData()">
                        📤 Export
                    </button>
                    <button class="favorites-action-btn" onclick="favoritesManager.importData()">
                        📥 Import
                    </button>
                    <button class="favorites-action-btn danger" onclick="favoritesManager.clearAllFavorites()">
                        🗑️ Clear All
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Setup event listeners for the favorites modal
     */
    setupFavoritesModalEvents() {
        const modal = document.getElementById('favoritesModal');
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeFavoritesModal();
            }
        });

        // Tab switching
        modal.querySelectorAll('.favorites-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                // Remove active class from all tabs
                modal.querySelectorAll('.favorites-tab').forEach(t => t.classList.remove('active'));
                // Add active class to clicked tab
                e.target.classList.add('active');
                // Load content for selected tab
                this.loadTabContent(e.target.dataset.tab);
            });
        });

        // Search functionality
        const searchInput = modal.querySelector('#favoritesSearchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });
        }

        // Category filter
        const categoryFilter = modal.querySelector('#categoryFilter');
        if (categoryFilter) {
            categoryFilter.addEventListener('change', (e) => {
                this.handleCategoryFilter(e.target.value);
            });
        }
    }

    /**
     * Load content for the currently active tab
     */
    loadFavoritesContent() {
        const activeTab = document.querySelector('.favorites-tab.active');
        if (activeTab) {
            this.loadTabContent(activeTab.dataset.tab);
        }
    }

    /**
     * Load content for specific tab
     */
    loadTabContent(tabName) {
        const contentArea = document.getElementById('favoritesContent');
        if (!contentArea) return;

        let items = [];
        let title = '';

        switch (tabName) {
            case 'favorites':
                items = this.getFavorites();
                title = items.length > 0 ? 'Your Favorite Foods' : 'No favorites yet';
                break;
            case 'history':
                items = this.getHistory();
                title = items.length > 0 ? 'Recently Used Foods' : 'No recent items';
                break;
            case 'most-used':
                items = this.getMostUsedFavorites();
                title = items.length > 0 ? 'Most Used Favorites' : 'No usage data yet';
                break;
        }

        contentArea.innerHTML = this.createItemsListHTML(items, title, tabName);
        this.setupItemEventListeners();
    }

    /**
     * Create HTML for items list
     */
    createItemsListHTML(items, title, tabType) {
        if (items.length === 0) {
            return `
                <div class="favorites-empty">
                    <div class="empty-icon">😋</div>
                    <h3>${title}</h3>
                    <p>Start adding foods to your favorites by clicking the ❤️ icon on any food item!</p>
                </div>
            `;
        }

        const groupedItems = this.groupItemsByCategory(items);
        let html = `<div class="favorites-items-container">`;
        
        Object.keys(groupedItems).forEach(category => {
            if (groupedItems[category].length > 0) {
                const categoryIcon = this.getCategoryIcon(category);
                html += `
                    <div class="favorites-category-group">
                        <h4 class="favorites-category-title">${categoryIcon} ${category.charAt(0).toUpperCase() + category.slice(1)}</h4>
                        <div class="favorites-category-items">
                            ${groupedItems[category].map(item => this.createFavoriteItemHTML(item, tabType)).join('')}
                        </div>
                    </div>
                `;
            }
        });
        
        html += `</div>`;
        return html;
    }

    /**
     * Create HTML for individual favorite item
     */
    createFavoriteItemHTML(item, tabType) {
        const lastUsedText = tabType === 'history' && item.lastUsed 
            ? `<div class="item-last-used">Used: ${this.formatDate(item.lastUsed)}</div>`
            : '';
            
        const usageText = tabType === 'most-used' && item.timesUsed 
            ? `<div class="item-usage">Used ${item.timesUsed} times</div>`
            : '';

        return `
            <div class="favorite-item" data-item='${JSON.stringify(item)}' data-category="${item.category || 'other'}">
                <div class="favorite-item-header">
                    <div class="favorite-item-name">${item.name}${item.brand ? ` (${item.brand})` : ''}</div>
                    <div class="favorite-item-actions">
                        <button class="favorite-quick-add" onclick="favoritesManager.quickAddToMeal(this)" title="Quick add to meal">
                            ➕
                        </button>
                        ${tabType === 'favorites' ? `
                            <button class="favorite-remove" onclick="favoritesManager.removeFromFavoritesModal(this)" title="Remove from favorites">
                                🗑️
                            </button>
                        ` : ''}
                    </div>
                </div>
                
                <div class="favorite-item-details">
                    <div class="favorite-item-macros">
                        <span class="macro-detail">🔥 ${item.kcal} kcal</span>
                        <span class="macro-detail">💪 ${item.protein.toFixed(1)}g P</span>
                        <span class="macro-detail">🌾 ${item.carbs.toFixed(1)}g C</span>
                        <span class="macro-detail">🧈 ${item.fat.toFixed(1)}g F</span>
                        <span class="macro-detail">💵 $${item.cost.toFixed(2)}</span>
                    </div>
                    
                    <div class="favorite-item-portion">
                        <input type="number" class="favorite-quantity" value="${item.baseQuantity}" min="1" step="1">
                        <select class="favorite-unit">
                            <option value="${item.baseUnit}">${item.baseUnit}</option>
                        </select>
                    </div>
                </div>
                
                ${lastUsedText}
                ${usageText}
            </div>
        `;
    }

    /**
     * Setup event listeners for favorite items
     */
    setupItemEventListeners() {
        // Make favorite items draggable
        document.querySelectorAll('.favorite-item').forEach(item => {
            item.draggable = true;
            item.addEventListener('dragstart', (e) => {
                const itemData = JSON.parse(item.dataset.item);
                const quantity = item.querySelector('.favorite-quantity').value;
                const unit = item.querySelector('.favorite-unit').value;
                
                window.draggedData = {
                    type: 'food',
                    food: itemData,
                    quantity: parseFloat(quantity),
                    unit: unit
                };
                
                e.dataTransfer.effectAllowed = 'copy';
                item.classList.add('dragging');
            });
            
            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
                window.draggedData = null;
            });
        });
    }

    /**
     * Handle search functionality
     */
    handleSearch(searchTerm) {
        const items = document.querySelectorAll('.favorite-item');
        items.forEach(item => {
            const itemData = JSON.parse(item.dataset.item);
            const searchText = `${itemData.name} ${itemData.brand || ''}`.toLowerCase();
            
            if (searchText.includes(searchTerm.toLowerCase())) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    /**
     * Handle category filter
     */
    handleCategoryFilter(category) {
        const items = document.querySelectorAll('.favorite-item');
        items.forEach(item => {
            const itemData = JSON.parse(item.dataset.item);
            
            if (!category || itemData.category === category) {
                item.style.display = 'block';
            } else {
                item.style.display = 'none';
            }
        });
    }

    /**
     * Quick add item to meal
     */
    quickAddToMeal(buttonElement) {
        const favoriteItem = buttonElement.closest('.favorite-item');
        const itemData = JSON.parse(favoriteItem.dataset.item);
        const quantity = favoriteItem.querySelector('.favorite-quantity').value;
        const unit = favoriteItem.querySelector('.favorite-unit').value;
        
        // Add to history
        this.addToHistory({
            ...itemData,
            quantity: parseFloat(quantity),
            unit: unit
        });
        
        // Find the most recently active day column or default to first one
        let targetDay = window.lastActiveDay || document.querySelector('.day-column');
        
        if (targetDay) {
            // Find the first meal with space or create a new one
            const meals = targetDay.querySelectorAll('.meal');
            let targetMeal = null;
            
            // Look for a meal that's not minimized and has space
            for (let meal of meals) {
                if (!meal.classList.contains('minimized')) {
                    targetMeal = meal;
                    break;
                }
            }
            
            if (targetMeal) {
                // Create food module and add to meal
                const dragData = {
                    type: 'food',
                    food: itemData,
                    quantity: parseFloat(quantity),
                    unit: unit
                };
                
                if (window.createFoodModule) {
                    const module = window.createFoodModule(dragData);
                    const modulesContainer = targetMeal.querySelector('.food-modules-container');
                    modulesContainer.appendChild(module);
                    
                    // Update totals
                    if (window.updateMealTotals) window.updateMealTotals(targetMeal);
                    if (window.updateDayTotals) window.updateDayTotals(targetDay);
                    
                    this.showNotification(`➕ ${itemData.name} added to ${targetDay.querySelector('.day-name').textContent}!`, 'success');
                }
            } else {
                this.showNotification('No available meals found. Try expanding a meal first.', 'info');
            }
        } else {
            this.showNotification('No day columns found. Add a day first.', 'info');
        }
    }

    /**
     * Remove item from favorites via modal
     */
    removeFromFavoritesModal(buttonElement) {
        const favoriteItem = buttonElement.closest('.favorite-item');
        const itemData = JSON.parse(favoriteItem.dataset.item);
        
        if (this.removeFromFavorites(itemData.id)) {
            favoriteItem.remove();
            
            // Update stats
            const modal = document.getElementById('favoritesModal');
            const statsCards = modal.querySelectorAll('.stat-number');
            if (statsCards[0]) {
                statsCards[0].textContent = this.getFavorites().length;
            }
        }
    }

    // === UTILITY HELPER METHODS ===

    /**
     * Group items by category
     */
    groupItemsByCategory(items) {
        const groups = {
            protein: [],
            veg: [],
            fruit: [],
            carbs: [],
            extras: [],
            other: []
        };
        
        items.forEach(item => {
            const category = item.category || 'other';
            if (groups[category]) {
                groups[category].push(item);
            } else {
                groups.other.push(item);
            }
        });
        
        return groups;
    }

    /**
     * Get category icon
     */
    getCategoryIcon(category) {
        const icons = {
            protein: '🥩',
            veg: '🥦',
            fruit: '🍎',
            carbs: '🍞',
            extras: '✨',
            other: '🍽️'
        };
        return icons[category] || icons.other;
    }

    /**
     * Format date for display
     */
    formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now - date;
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffHours < 1) return 'Just now';
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays === 1) return 'Yesterday';
        if (diffDays < 7) return `${diffDays} days ago`;
        
        return date.toLocaleDateString();
    }

    /**
     * Export favorites data
     */
    exportData() {
        const data = this.exportFavorites();
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `hannah-health-favorites-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('📤 Favorites exported!', 'success');
    }

    /**
     * Import favorites data
     */
    importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    this.importFavorites(data);
                    this.refreshFavoritesModal();
                } catch (error) {
                    this.showNotification('❌ Invalid file format', 'error');
                }
            };
            reader.readAsText(file);
        };
        
        input.click();
    }

    /**
     * Clear all favorites
     */
    clearAllFavorites() {
        if (confirm('Are you sure you want to clear all favorites? This cannot be undone.')) {
            localStorage.setItem(this.STORAGE_KEYS.FAVORITES, JSON.stringify([]));
            this.refreshFavoritesModal();
            this.showNotification('🗑️ All favorites cleared', 'info');
        }
    }
}

// Create global instance
const favoritesManager = new FavoritesManager();
window.favoritesManager = favoritesManager;

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FavoritesManager;
}