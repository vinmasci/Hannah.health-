// MealContainer component - represents a meal within a day column
import { NutritionCalculator } from '../services/nutritionCalculator.js';

export class MealContainer {
    /**
     * Create a meal container HTML
     * @param {string} day - Day name
     * @param {string} mealName - Meal name (Breakfast, Lunch, etc.)
     * @param {string} time - Meal time (e.g., "07:00")
     * @returns {string} HTML string for the meal
     */
    static create(day, mealName, time = '12:00') {
        const mealId = `${day}-${mealName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
        const emoji = this.getMealEmoji(mealName);
        
        return `
            <div class="meal" data-meal-id="${mealId}">
                <div class="meal-header">
                    <div class="meal-header-top">
                        <div class="meal-name" contenteditable="true" 
                             onclick="MealContainer.handleNameClick(event)" 
                             onblur="MealContainer.handleNameBlur(event, '${mealId}')" 
                             onkeydown="MealContainer.handleNameKeydown(event)">
                            ${emoji} ${mealName}
                        </div>
                        <div class="meal-header-actions">
                            <div class="meal-time" contenteditable="true" 
                                 onclick="MealContainer.handleTimeClick(event)" 
                                 onblur="MealContainer.handleTimeBlur(event, '${mealId}')" 
                                 onkeydown="MealContainer.handleTimeKeydown(event)">
                                ⏰ ${time}
                            </div>
                            <div class="meal-controls">
                                <button class="meal-control-btn minimize-btn" 
                                        onclick="MealContainer.toggleMinimize('${mealId}')" 
                                        title="Minimize">
                                    <span class="chevron">▼</span>
                                </button>
                                <button class="meal-control-btn" onclick="MealContainer.delete('${mealId}')">🗑️</button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="meal-drop-zone" data-meal-id="${mealId}">
                    <div class="recipes-container">
                        <!-- Recipe containers will be added here -->
                    </div>
                    <div class="food-modules-container" 
                         ondragover="handleMealDragOver(event)" 
                         ondrop="handleMealDrop(event)" 
                         ondragleave="handleMealDragLeave(event)">
                        <!-- Standalone food modules (not in recipes) will be added here -->
                    </div>
                    <div class="add-food-zone" 
                         ondragover="handleMealDragOver(event)" 
                         ondrop="handleMealDrop(event)" 
                         ondragleave="handleMealDragLeave(event)">
                        <span class="add-food-text">+ Add food or recipe</span>
                    </div>
                </div>
                <div class="meal-totals" style="display: none;">
                    <div class="meal-total">
                        <span class="meal-total-label">Total:</span>
                        <span class="meal-total-value">0 kcal</span>
                    </div>
                    <div class="meal-total">
                        <span class="meal-total-value">0g P</span>
                    </div>
                    <div class="meal-total">
                        <span class="meal-total-value">0g C</span>
                    </div>
                    <div class="meal-total">
                        <span class="meal-total-value">0g F</span>
                    </div>
                </div>
            </div>
        `;
    }
    
    /**
     * Get emoji for meal based on name
     * @param {string} name - Meal name
     * @returns {string} Emoji
     */
    static getMealEmoji(name) {
        const mealLower = name.toLowerCase();
        if (mealLower.includes('breakfast')) return '🍳';
        if (mealLower.includes('lunch')) return '☀️';
        if (mealLower.includes('dinner')) return '🌙';
        if (mealLower.includes('morning') && mealLower.includes('snack')) return '🥐';
        if (mealLower.includes('afternoon') && mealLower.includes('snack')) return '🍎';
        if (mealLower.includes('evening') && mealLower.includes('snack')) return '🍪';
        if (mealLower.includes('snack')) return '🥨';
        return '🍽️'; // default meal emoji
    }
    
    /**
     * Add food to meal
     * @param {string} mealId - Meal ID
     * @param {Object} foodData - Food data to add
     */
    static addFood(mealId, foodData) {
        const meal = document.querySelector(`[data-meal-id="${mealId}"]`);
        if (!meal) return;
        
        const modulesContainer = meal.querySelector('.food-modules-container');
        const module = window.FoodModule ? 
            window.FoodModule.create(foodData) : 
            window.createFoodModule(foodData);
        
        modulesContainer.appendChild(module);
        this.updateTotals(meal);
        
        // Update day totals
        const dayColumn = meal.closest('.day-column');
        if (window.updateDayTotals) window.updateDayTotals(dayColumn);
    }
    
    /**
     * Update meal totals
     * @param {HTMLElement|string} mealOrId - Meal element or ID
     */
    static updateTotals(mealOrId) {
        const meal = typeof mealOrId === 'string' ? 
            document.querySelector(`[data-meal-id="${mealOrId}"]`) : 
            mealOrId;
        
        if (!meal) return;
        
        // Get all modules - both in recipes and standalone
        const modules = meal.querySelectorAll('.food-module');
        const totalsDiv = meal.querySelector('.meal-totals');
        
        if (modules.length === 0) {
            totalsDiv.style.display = 'none';
            return;
        }
        
        let totals = {
            kcal: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            cost: 0
        };
        
        modules.forEach(module => {
            const moduleData = JSON.parse(module.dataset.module);
            totals.kcal += moduleData.kcal;
            totals.protein += moduleData.protein;
            totals.carbs += moduleData.carbs;
            totals.fat += moduleData.fat;
            totals.cost += moduleData.cost;
        });
        
        totalsDiv.style.display = 'block';
        const mealId = meal.dataset.mealId;
        
        // Set minimized by default if not already set
        if (!totalsDiv.classList.contains('minimized') && !totalsDiv.classList.contains('expanded')) {
            totalsDiv.classList.add('minimized');
        }
        const isMinimized = totalsDiv.classList.contains('minimized');
        
        totalsDiv.innerHTML = `
            <div class="meal-total-header">
                <span>Nutrition</span>
                <button class="meal-total-toggle" onclick="MealContainer.toggleTotalsMinimize('${mealId}')">
                    <span class="chevron">▼</span>
                </button>
            </div>
            <div class="meal-total-content" ${isMinimized ? 'style="display: none;"' : ''}>
                <div class="macro-bar-container">
                    <div class="macro-bar">
                        ${NutritionCalculator.createMacroBarHTML(totals.protein, totals.carbs, totals.fat)}
                    </div>
                    <div class="macro-labels">
                        ${NutritionCalculator.createMacroLabelsHTML(totals.protein, totals.carbs, totals.fat)}
                    </div>
                </div>
                <div class="meal-total-stats">
                    <span class="meal-total-stat">${totals.kcal} kcal</span>
                    <span class="meal-total-stat">$${totals.cost.toFixed(2)}</span>
                </div>
            </div>
        `;
    }
    
    /**
     * Toggle meal totals minimize state
     * @param {string} mealId - Meal ID
     */
    static toggleTotalsMinimize(mealId) {
        const meal = document.querySelector(`[data-meal-id="${mealId}"]`);
        if (!meal) return;
        
        const totalsDiv = meal.querySelector('.meal-totals');
        const content = totalsDiv.querySelector('.meal-total-content');
        
        if (totalsDiv.classList.contains('minimized')) {
            // Expand
            totalsDiv.classList.remove('minimized');
            content.style.display = 'block';
        } else {
            // Minimize
            totalsDiv.classList.add('minimized');
            content.style.display = 'none';
        }
    }
    
    /**
     * Toggle meal minimize state
     * @param {string} mealId - Meal ID
     */
    static toggleMinimize(mealId) {
        const meal = document.querySelector(`[data-meal-id="${mealId}"]`);
        if (!meal) return;
        
        const dropZone = meal.querySelector('.meal-drop-zone');
        const totals = meal.querySelector('.meal-totals');
        const minimizeBtn = meal.querySelector('.minimize-btn');
        
        if (meal.classList.contains('minimized')) {
            // Expand the meal
            meal.classList.remove('minimized');
            dropZone.style.display = 'block';
            if (totals) totals.style.display = 'block';
            minimizeBtn.title = 'Minimize';
        } else {
            // Minimize the meal
            meal.classList.add('minimized');
            dropZone.style.display = 'none';
            if (totals) totals.style.display = 'none';
            minimizeBtn.title = 'Expand';
        }
    }
    
    /**
     * Delete meal
     * @param {string} mealId - Meal ID
     */
    static delete(mealId) {
        const meal = document.querySelector(`[data-meal-id="${mealId}"]`);
        if (!meal) return;
        
        if (confirm('Are you sure you want to delete this meal?')) {
            const dayColumn = meal.closest('.day-column');
            meal.style.animation = 'fadeOutScale 0.3s ease';
            setTimeout(() => {
                meal.remove();
                if (window.updateDayTotals) window.updateDayTotals(dayColumn);
            }, 300);
        }
    }
    
    // Edit handlers for meal name
    static handleNameClick(event) {
        const element = event.target;
        element.dataset.originalText = element.textContent;
        // Select only the text, not the emoji
        const text = element.textContent;
        const emojiMatch = text.match(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}]/u);
        if (emojiMatch) {
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(element.childNodes[0], emojiMatch[0].length + 1);
            range.setEnd(element.childNodes[0], text.length);
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
    
    static handleNameBlur(event, mealId) {
        const element = event.target;
        const text = element.textContent.trim();
        // Extract emoji and name
        const emojiMatch = text.match(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}]/u);
        const emoji = emojiMatch ? emojiMatch[0] : '';
        const mealName = text.replace(emoji, '').trim();
        
        if (!mealName) {
            element.textContent = element.dataset.originalText;
            return;
        }
        
        element.textContent = `${this.getMealEmoji(mealName)} ${mealName}`;
    }
    
    static handleNameKeydown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.target.blur();
        }
    }
    
    // Edit handlers for meal time
    static handleTimeClick(event) {
        const element = event.target;
        element.dataset.originalText = element.textContent;
        // Select only the time, not the emoji
        const text = element.textContent;
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(element.childNodes[0], 2); // Skip "⏰ "
        range.setEnd(element.childNodes[0], text.length);
        sel.removeAllRanges();
        sel.addRange(range);
    }
    
    static handleTimeBlur(event, mealId) {
        const element = event.target;
        const text = element.textContent.trim();
        const time = text.replace('⏰', '').trim();
        
        if (!time) {
            element.textContent = element.dataset.originalText;
            return;
        }
        
        element.textContent = `⏰ ${time}`;
    }
    
    static handleTimeKeydown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.target.blur();
        }
    }
}

// Make MealContainer available globally for onclick handlers
window.MealContainer = MealContainer;