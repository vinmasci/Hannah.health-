// StorageService - Centralized localStorage management
import { STORAGE_KEYS } from '../utils/constants.js';

export class StorageService {
    /**
     * Save meal plan data
     * @param {Object} data - Meal plan data to save
     */
    static saveMealPlan(data) {
        try {
            const mealPlan = {
                version: '2.0',
                savedAt: new Date().toISOString(),
                days: data.days || this.extractDaysData(),
                activeColumns: data.activeColumns || [],
                lastActiveDay: data.lastActiveDay || null
            };
            
            localStorage.setItem(STORAGE_KEYS.mealPlan, JSON.stringify(mealPlan));
            console.log('Meal plan saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save meal plan:', error);
            return false;
        }
    }
    
    /**
     * Load meal plan data
     * @returns {Object|null} Saved meal plan data
     */
    static loadMealPlan() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.mealPlan);
            if (!saved) return null;
            
            const mealPlan = JSON.parse(saved);
            
            // Migrate old format if needed
            if (!mealPlan.version) {
                return this.migrateLegacyData(mealPlan);
            }
            
            return mealPlan;
        } catch (error) {
            console.error('Failed to load meal plan:', error);
            return null;
        }
    }
    
    /**
     * Save user preferences
     * @param {Object} prefs - Preferences to save
     */
    static savePreferences(prefs) {
        try {
            const existing = this.loadPreferences() || {};
            const updated = { ...existing, ...prefs, updatedAt: new Date().toISOString() };
            localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(updated));
            return true;
        } catch (error) {
            console.error('Failed to save preferences:', error);
            return false;
        }
    }
    
    /**
     * Load user preferences
     * @returns {Object|null} Saved preferences
     */
    static loadPreferences() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.preferences);
            return saved ? JSON.parse(saved) : null;
        } catch (error) {
            console.error('Failed to load preferences:', error);
            return null;
        }
    }
    
    /**
     * Save recipes
     * @param {Array} recipes - Recipes to save
     */
    static saveRecipes(recipes) {
        try {
            localStorage.setItem(STORAGE_KEYS.recipes, JSON.stringify(recipes));
            return true;
        } catch (error) {
            console.error('Failed to save recipes:', error);
            return false;
        }
    }
    
    /**
     * Load saved recipes
     * @returns {Array} Saved recipes
     */
    static loadRecipes() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.recipes);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load recipes:', error);
            return [];
        }
    }
    
    /**
     * Save favorites
     * @param {Array} favorites - Favorites to save
     */
    static saveFavorites(favorites) {
        try {
            localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(favorites));
            return true;
        } catch (error) {
            console.error('Failed to save favorites:', error);
            return false;
        }
    }
    
    /**
     * Load favorites
     * @returns {Array} Saved favorites
     */
    static loadFavorites() {
        try {
            const saved = localStorage.getItem(STORAGE_KEYS.favorites);
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load favorites:', error);
            return [];
        }
    }
    
    /**
     * Extract current days data from DOM
     * @returns {Object} Days data
     */
    static extractDaysData() {
        const daysData = {};
        
        document.querySelectorAll('.day-column').forEach(dayColumn => {
            const dayName = dayColumn.dataset.day;
            const meals = [];
            
            dayColumn.querySelectorAll('.meal').forEach(meal => {
                const mealData = {
                    id: meal.dataset.mealId,
                    name: meal.querySelector('.meal-name')?.textContent || '',
                    time: meal.querySelector('.meal-time')?.textContent || '',
                    isMinimized: meal.classList.contains('minimized'),
                    modules: [],
                    recipes: []
                };
                
                // Extract standalone modules
                meal.querySelectorAll('.food-modules-container .food-module').forEach(module => {
                    const moduleData = JSON.parse(module.dataset.module || '{}');
                    mealData.modules.push(moduleData);
                });
                
                // Extract recipes
                meal.querySelectorAll('.recipe-container').forEach(recipe => {
                    const recipeData = {
                        id: recipe.dataset.recipeId,
                        name: recipe.querySelector('.recipe-title')?.textContent || '',
                        isCollapsed: recipe.classList.contains('collapsed'),
                        modules: []
                    };
                    
                    recipe.querySelectorAll('.food-module').forEach(module => {
                        const moduleData = JSON.parse(module.dataset.module || '{}');
                        recipeData.modules.push(moduleData);
                    });
                    
                    mealData.recipes.push(recipeData);
                });
                
                meals.push(mealData);
            });
            
            daysData[dayName] = meals;
        });
        
        return daysData;
    }
    
    /**
     * Restore days data to DOM
     * @param {Object} daysData - Days data to restore
     */
    static restoreDaysData(daysData) {
        // This would rebuild the DOM from saved data
        // Implementation depends on how the app creates elements
        console.log('Restoring days data:', daysData);
        
        Object.entries(daysData).forEach(([dayName, meals]) => {
            const dayColumn = document.querySelector(`[data-day="${dayName}"]`);
            if (!dayColumn) return;
            
            const mealsContainer = dayColumn.querySelector('.meals-container');
            if (!mealsContainer) return;
            
            // Clear existing meals
            mealsContainer.innerHTML = '';
            
            // Recreate meals
            meals.forEach(mealData => {
                // This would use MealContainer.create() to rebuild
                console.log('Restoring meal:', mealData.name);
            });
        });
    }
    
    /**
     * Clear all stored data
     */
    static clearAll() {
        try {
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            console.log('All stored data cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear storage:', error);
            return false;
        }
    }
    
    /**
     * Clear specific storage key
     * @param {string} key - Storage key to clear
     */
    static clear(key) {
        try {
            if (STORAGE_KEYS[key]) {
                localStorage.removeItem(STORAGE_KEYS[key]);
                return true;
            }
            return false;
        } catch (error) {
            console.error(`Failed to clear ${key}:`, error);
            return false;
        }
    }
    
    /**
     * Get storage size info
     * @returns {Object} Storage size information
     */
    static getStorageInfo() {
        const info = {
            totalSize: 0,
            items: {}
        };
        
        Object.entries(STORAGE_KEYS).forEach(([name, key]) => {
            const item = localStorage.getItem(key);
            if (item) {
                const size = new Blob([item]).size;
                info.items[name] = {
                    size: size,
                    sizeKB: (size / 1024).toFixed(2),
                    exists: true
                };
                info.totalSize += size;
            } else {
                info.items[name] = {
                    size: 0,
                    sizeKB: '0.00',
                    exists: false
                };
            }
        });
        
        info.totalSizeKB = (info.totalSize / 1024).toFixed(2);
        info.totalSizeMB = (info.totalSize / 1024 / 1024).toFixed(2);
        
        return info;
    }
    
    /**
     * Migrate legacy data format
     * @param {Object} legacyData - Old format data
     * @returns {Object} New format data
     */
    static migrateLegacyData(legacyData) {
        console.log('Migrating legacy meal plan data...');
        
        return {
            version: '2.0',
            savedAt: new Date().toISOString(),
            days: legacyData.days || {},
            activeColumns: legacyData.activeColumns || [],
            lastActiveDay: null,
            migrated: true,
            originalFormat: 'legacy'
        };
    }
    
    /**
     * Export all data as JSON
     * @returns {Object} All stored data
     */
    static exportAllData() {
        const data = {
            exportedAt: new Date().toISOString(),
            version: '2.0',
            mealPlan: this.loadMealPlan(),
            preferences: this.loadPreferences(),
            recipes: this.loadRecipes(),
            favorites: this.loadFavorites()
        };
        
        return data;
    }
    
    /**
     * Import data from JSON
     * @param {Object} data - Data to import
     * @returns {boolean} Success status
     */
    static importData(data) {
        try {
            if (data.mealPlan) {
                localStorage.setItem(STORAGE_KEYS.mealPlan, JSON.stringify(data.mealPlan));
            }
            if (data.preferences) {
                localStorage.setItem(STORAGE_KEYS.preferences, JSON.stringify(data.preferences));
            }
            if (data.recipes) {
                localStorage.setItem(STORAGE_KEYS.recipes, JSON.stringify(data.recipes));
            }
            if (data.favorites) {
                localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(data.favorites));
            }
            
            console.log('Data imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import data:', error);
            return false;
        }
    }
}

// Export as default
export default StorageService;