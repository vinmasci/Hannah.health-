// DayMealManager - Manages day columns and meal creation/editing
// Extracted from app.js to organize day and meal management
// Refactored to extract modal and color picker into separate modules

import { MealContainer } from './MealContainer.js';
import DragDropManager from '../services/DragDropManager.js';
import UIStateManager from '../services/UIStateManager.js';
import { NutritionCalculator } from '../services/nutritionCalculator.js';
import DaySelectionModal from './DaySelectionModal.js';
import DayColorPicker from './DayColorPicker.js';

export class DayMealManager {
    
    // Create initial day columns on app load
    static createInitialDayColumns() {
        const today = new Date();
        const todayIndex = today.getDay(); // 0 = Sunday, 1 = Monday, etc.
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayName = days[todayIndex];
        
        // Calculate the date for Monday of this week
        const mondayDate = new Date(today);
        const daysSinceMonday = todayIndex === 0 ? 6 : todayIndex - 1; // Sunday = 0, so it's 6 days after Monday
        mondayDate.setDate(today.getDate() - daysSinceMonday);
        
        // Create week starting from Monday
        const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        // Create all 7 days with dates
        weekDays.forEach((dayName, index) => {
            const dayDate = new Date(mondayDate);
            dayDate.setDate(mondayDate.getDate() + index);
            
            // Only today should be maximized, all others minimized
            const isToday = dayName === todayName;
            this.createDayColumn(dayName, !isToday, dayDate); // Pass date as well
        });
        
        // Add the "Add Day" placeholder column at the end
        this.createAddDayPlaceholder();
    }
    
    // Create a new day column
    static createDayColumn(dayName, forceMinimized = null, date = null) {
        const mainBoard = document.querySelector('.main-board');
        const existingDay = document.querySelector(`[data-day="${dayName}"]`);
        if (existingDay) return;
        
        const column = document.createElement('div');
        column.className = 'day-column animate-in';
        column.dataset.day = dayName;
        
        // Format the date if provided (e.g., "23 AUG")
        let dateDisplay = '';
        if (date) {
            const day = date.getDate();
            const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
            const month = months[date.getMonth()];
            dateDisplay = `${day} ${month}`;
        }
        
        // Determine if minimized: use forceMinimized if provided, otherwise check localStorage
        let isMinimized;
        if (forceMinimized !== null) {
            isMinimized = forceMinimized;
        } else {
            // Check if this day should be minimized (from localStorage)
            const minimizedDays = JSON.parse(localStorage.getItem('minimizedDays') || '[]');
            isMinimized = minimizedDays.includes(dayName);
        }
        
        if (isMinimized) {
            column.classList.add('minimized');
        }
        
        column.innerHTML = `
            <div class="day-header">
                <div class="day-header-main">
                    <div class="day-info">
                        <span class="day-name">${dayName} <span class="date-part">${dateDisplay || ''}</span></span>
                    </div>
                    <div class="day-controls">
                        <button class="btn-minimize-day" onclick="toggleDayMinimize(event)" title="${isMinimized ? 'Expand' : 'Minimize'}">
                            ${isMinimized ? '+' : '−'}
                        </button>
                        <button class="color-picker-btn" onclick="DayColorPicker.show('${dayName}')" title="Change color">
                            <span class="color-circle"></span>
                        </button>
                        <button class="add-meal-btn" onclick="window.dayMealManager.addMeal('${dayName}')" title="Add meal">
                            + Meal
                        </button>
                    </div>
                </div>
            </div>
            <div class="day-content" ${isMinimized ? 'style="display: none;"' : ''}>
                <div class="meals-container">
                    ${this.createMealHTML(dayName, 'Breakfast', '8:00 AM')}
                    ${this.createMealHTML(dayName, 'Morning Snack', '10:00 AM')}
                    ${this.createMealHTML(dayName, 'Lunch', '12:00 PM')}
                    ${this.createMealHTML(dayName, 'Afternoon Snack', '3:00 PM')}
                    ${this.createMealHTML(dayName, 'Dinner', '6:00 PM')}
                    ${this.createMealHTML(dayName, 'Evening Snack', '8:00 PM')}
                </div>
            </div>
            <div class="day-totals" ${isMinimized ? 'style="display: none;"' : ''}>
                <div class="day-totals-card empty-totals">
                    <div class="day-totals-header">
                        <span class="day-totals-title">Day Total</span>
                        <div class="day-totals-quick-stats">
                            <span class="quick-stat empty">Empty</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        mainBoard.appendChild(column);
        
        // Load saved color for this day
        DayColorPicker.loadColor(dayName);
        
        // Setup drag handlers for meals
        column.querySelectorAll('.meal').forEach(meal => {
            DragDropManager.attachHandlers(meal, 'meal');
        });
        
        // Update last active day
        if (window.lastActiveDay === undefined) {
            window.lastActiveDay = column;
        }
        
        return column;
    }
    
    // Create meal HTML
    static createMealHTML(day, mealName, time) {
        return MealContainer.create(day, mealName, time);
    }
    
    // Add a new meal to a day
    static addMeal(day) {
        const dayColumn = document.querySelector(`[data-day="${day}"]`);
        if (!dayColumn) return;
        
        const mealsContainer = dayColumn.querySelector('.meals-container');
        const mealName = prompt('Enter meal name:', 'Snack');
        if (!mealName) return;
        
        const time = prompt('Enter meal time:', '3:00 PM');
        if (!time) return;
        
        const mealHtml = this.createMealHTML(day, mealName, time);
        const mealDiv = document.createElement('div');
        mealDiv.innerHTML = mealHtml;
        const meal = mealDiv.firstElementChild;
        
        mealsContainer.appendChild(meal);
        
        // Setup drag handlers
        DragDropManager.attachHandlers(meal, 'meal');
    }
    
    // Handle meal name editing
    static handleMealNameClick(event) {
        const nameElement = event.target;
        const mealId = nameElement.closest('.meal').dataset.mealId;
        
        // Create an input field
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'meal-name-input';
        input.value = nameElement.textContent;
        input.dataset.mealId = mealId;
        
        // Replace the span with input
        nameElement.replaceWith(input);
        input.focus();
        input.select();
        
        // Handle blur and enter key
        input.addEventListener('blur', (e) => this.handleMealNameBlur(e, mealId));
        input.addEventListener('keydown', this.handleMealNameKeydown);
    }
    
    static handleMealNameBlur(event, mealId) {
        const input = event.target;
        const newName = input.value.trim() || 'Untitled Meal';
        
        // Create a new span
        const span = document.createElement('span');
        span.className = 'meal-name';
        span.textContent = newName;
        span.onclick = this.handleMealNameClick;
        
        // Replace input with span
        input.replaceWith(span);
        
        // Update data in MealContainer if needed
        const meal = document.querySelector(`[data-meal-id="${mealId}"]`);
        if (meal) {
            // Store the name in a data attribute
            meal.dataset.mealName = newName;
        }
    }
    
    static handleMealNameKeydown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.target.blur();
        }
    }
    
    // Handle meal time editing
    static handleMealTimeClick(event) {
        const timeElement = event.target;
        const mealId = timeElement.closest('.meal').dataset.mealId;
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'meal-time-input';
        input.value = timeElement.textContent;
        input.dataset.mealId = mealId;
        
        timeElement.replaceWith(input);
        input.focus();
        input.select();
        
        input.addEventListener('blur', (e) => this.handleMealTimeBlur(e, mealId));
        input.addEventListener('keydown', this.handleMealTimeKeydown);
    }
    
    static handleMealTimeBlur(event, mealId) {
        const input = event.target;
        const newTime = input.value.trim() || '12:00 PM';
        
        const span = document.createElement('span');
        span.className = 'meal-time';
        span.textContent = newTime;
        span.onclick = this.handleMealTimeClick;
        
        input.replaceWith(span);
        
        const meal = document.querySelector(`[data-meal-id="${mealId}"]`);
        if (meal) {
            meal.dataset.mealTime = newTime;
        }
    }
    
    static handleMealTimeKeydown(event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.target.blur();
        }
    }
    
    // Delete a meal
    static deleteMeal(mealId) {
        const meal = document.querySelector(`[data-meal-id="${mealId}"]`);
        if (!meal) return;
        
        if (confirm('Are you sure you want to delete this meal?')) {
            const dayColumn = meal.closest('.day-column');
            meal.style.animation = 'fadeOutScale 0.3s ease';
            setTimeout(() => {
                meal.remove();
                UIStateManager.updateDayTotals(dayColumn);
            }, 300);
        }
    }
    
    // Create the "Add Day" placeholder column
    static createAddDayPlaceholder() {
        const mainBoard = document.querySelector('.main-board');
        
        // Remove existing placeholder if any
        const existingPlaceholder = document.querySelector('.add-day-placeholder');
        if (existingPlaceholder) {
            existingPlaceholder.remove();
        }
        
        const placeholder = document.createElement('div');
        placeholder.className = 'day-column add-day-placeholder minimized';
        placeholder.innerHTML = `
            <div class="day-header">
                <div class="day-header-main">
                    <div class="day-info">
                        <span class="day-name">+ Days</span>
                    </div>
                    <div class="day-controls">
                        <button class="btn-minimize-day" onclick="window.expandToAddDay()" title="Add new days">
                            +
                        </button>
                    </div>
                </div>
            </div>
            <div class="day-content" style="display: none;"></div>
        `;
        
        mainBoard.appendChild(placeholder);
    }
    
    // Expand placeholder to add a new day
    static expandToAddDay() {
        // Show the day selection modal
        DaySelectionModal.show();
    }
    
    
    // Modal methods have been moved to DaySelectionModal.js
    // Forwarding methods for backward compatibility with onclick handlers
    static toggleDaySelection(dayName, dateStr) {
        DaySelectionModal.toggleDaySelection(dayName, dateStr);
    }
    
    static selectAllDays() {
        DaySelectionModal.selectAllDays();
    }
    
    static clearAllDays() {
        DaySelectionModal.clearAllDays();
    }
    
    static addSelectedDays() {
        DaySelectionModal.addSelectedDays();
    }
    
    static closeDayModal() {
        DaySelectionModal.close();
    }
    
    
    // Legacy methods that need to be removed eventually
    // These duplicate the forwarding methods above but kept getting re-added
    
    // Select a day and create the column (legacy, for single select)
    static selectDay(dayName, dateStr) {
        // Close modal
        this.closeDayModal();
        
        // Create the new day column before the placeholder
        const placeholder = document.querySelector('.add-day-placeholder');
        const mainBoard = document.querySelector('.main-board');
        
        // Create new day column with date
        const column = document.createElement('div');
        column.className = 'day-column animate-in';
        column.dataset.day = dayName;
        
        column.innerHTML = `
            <div class="day-header">
                <div class="day-header-main">
                    <div class="day-info">
                        <span class="day-name">${dayName} <span class="date-part">${dateStr}</span></span>
                    </div>
                    <div class="day-controls">
                        <button class="add-meal-btn" onclick="window.dayMealManager.addMeal('${dayName}')" title="Add meal">
                            + Meal
                        </button>
                        <button class="btn-minimize-day" onclick="toggleDayMinimize(event)" title="Minimize">
                            −
                        </button>
                    </div>
                </div>
            </div>
            <div class="day-content">
                <div class="meals-container">
                    ${this.createMealHTML(dayName, 'Breakfast', '8:00 AM')}
                    ${this.createMealHTML(dayName, 'Lunch', '12:00 PM')}
                    ${this.createMealHTML(dayName, 'Dinner', '6:00 PM')}
                </div>
                <div class="day-totals">
                    <div class="day-totals-card empty-totals">
                        <div class="day-totals-header">
                            <span class="day-totals-title">Day Total</span>
                            <div class="day-totals-quick-stats">
                                <span class="quick-stat empty">Empty</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert before placeholder
        mainBoard.insertBefore(column, placeholder);
        
        // Setup drag handlers for meals
        column.querySelectorAll('.meal').forEach(meal => {
            const mealDropZone = meal.querySelector('.meal-drop-zone');
            if (mealDropZone) {
                DragDropManager.attachHandlers(mealDropZone, 'meal');
            }
        });
        
        // Make sure placeholder stays at the end
        mainBoard.appendChild(placeholder);
    }
    
    // Get suggestion for next day name
    static getNextDaySuggestion(existingDays) {
        const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        // Check for missing standard weekdays
        for (const day of weekDays) {
            if (!existingDays.some(d => d === day || d.startsWith(day))) {
                return day;
            }
        }
        
        // If all weekdays exist, suggest duplicates
        for (const day of weekDays) {
            let counter = 2;
            while (existingDays.includes(`${day} ${counter}`)) {
                counter++;
            }
            return `${day} ${counter}`;
        }
        
        return 'Monday 2';
    }
    
    // Add a new day column (legacy method for compatibility)
    static addNewDay() {
        this.expandToAddDay();
    }
    
    // Color picker methods have been moved to DayColorPicker.js
    // Forwarding methods for backward compatibility with onclick handlers
    static showColorPicker(dayName) {
        DayColorPicker.show(dayName);
    }
    
    static applyColor(dayName, bgColor, headerColor) {
        DayColorPicker.applyColor(dayName, bgColor, headerColor);
    }
    
    static closeColorPicker() {
        DayColorPicker.close();
    }
    
    static loadDayColor(dayName) {
        DayColorPicker.loadColor(dayName);
    }
    
    static closeColorPickerOnClickOutside(e) {
        DayColorPicker.closeOnClickOutside(e);
    }
    
    // Create AI Assistant Column (placeholder for future)
    static createAIAssistantColumn() {
        // This is a placeholder that was in the original code
        // It creates an AI assistant column similar to AI search
        // but with different functionality
        console.log('AI Assistant column not yet implemented');
    }
}

// Export the class directly - these are static methods
// Expose methods for onclick handlers
window.DayMealManager = DayMealManager;
export default DayMealManager;
