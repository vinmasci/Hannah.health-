// AIMealSuggestions.js - Step 3: AI-powered meal suggestions with feedback system
// Shows meal options based on calculated macros and user preferences

import eventBus from '../services/EventBus.js';
import { OpenMojiService } from '../services/openmoji-service.js';

class AIMealSuggestions {
    constructor() {
        this.openMojiService = new OpenMojiService();
        this.suggestions = {};
        this.approvedMeals = [];
        this.rejectedMeals = [];
        this.userData = null;
        this.calculations = null;
        this.isVisible = false;
    }
    
    /**
     * Create and insert the suggestions column
     */
    static create(mainBoard, insertBefore) {
        const instance = new AIMealSuggestions();
        const column = instance.createColumn();
        
        // Insert after the assessment column (to the right)
        const assessmentColumn = mainBoard.querySelector('.ai-assessment-column');
        if (assessmentColumn && assessmentColumn.nextSibling) {
            mainBoard.insertBefore(column, assessmentColumn.nextSibling);
        } else {
            mainBoard.insertBefore(column, insertBefore);
        }
        
        instance.setupEventListeners();
        return instance;
    }
    
    createColumn() {
        const column = document.createElement('div');
        column.className = 'ai-suggestions-column category-column';
        column.dataset.category = 'ai-suggestions';
        column.style.display = 'none'; // Hidden until assessment complete
        
        column.innerHTML = `
            <div class="column-header">
                <div class="column-header-content">
                    <h3>
                        <img src="https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F371.svg" 
                             width="20" height="20" class="openmoji-icon" alt="meal"> 
                        Step 3: Meal Suggestions
                    </h3>
                </div>
            </div>
            <div class="ai-suggestions-content">
                <div class="suggestions-info">
                    <p>Based on your profile and goals, here are personalized meal suggestions:</p>
                    <div class="daily-targets">
                        <span class="target-calories">Target: -- kcal</span>
                        <span class="target-macros">P: --g • C: --g • F: --g</span>
                    </div>
                </div>
                
                <div class="meal-suggestions-container">
                    ${this.createMealSection('Breakfast', 'breakfast', '1F373')}
                    ${this.createMealSection('Morning Snack', 'morning-snack', '1F34E')}
                    ${this.createMealSection('Lunch', 'lunch', '1F372')}
                    ${this.createMealSection('Afternoon Snack', 'afternoon-snack', '1F346')}
                    ${this.createMealSection('Dinner', 'dinner', '1F35D')}
                    ${this.createMealSection('Evening Snack', 'evening-snack', '1F36A')}
                </div>
                
                <div class="suggestions-actions">
                    <button class="btn-generate-more" onclick="window.mealSuggestions.generateMore()">
                        🔄 Generate More Options
                    </button>
                    <button class="btn-populate-board" onclick="window.mealSuggestions.populateBoard()" disabled>
                        ✅ Add to Meal Planner
                    </button>
                </div>
            </div>
        `;
        
        this.column = column;
        return column;
    }
    
    createMealSection(mealName, mealType, emojiCode) {
        return `
            <div class="meal-suggestion-section" data-meal-type="${mealType}">
                <h4 class="meal-section-title">
                    <img src="https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/${emojiCode}.svg" 
                         width="16" height="16" class="openmoji-icon" alt="${mealName}">
                    ${mealName}
                </h4>
                <div class="meal-options" id="options-${mealType}">
                    <div class="loading-placeholder">Waiting for assessment...</div>
                </div>
            </div>
        `;
    }
    
    setupEventListeners() {
        // Listen for assessment completion
        eventBus.on('assessment:complete', (data) => {
            this.handleAssessmentComplete(data);
        });
        
        // Listen for suggestions generation request
        eventBus.on('generate:suggestions', (data) => {
            this.generateSuggestions(data);
        });
    }
    
    handleAssessmentComplete(data) {
        console.log('[AIMealSuggestions] Assessment complete, preparing suggestions');
        this.userData = data.userData;
        this.calculations = {
            tdee: data.userData.tdee,
            targetCalories: data.userData.targetCalories,
            macros: data.userData.macros
        };
        
        // Update display
        this.updateTargetDisplay();
        
        // Show the column
        this.showColumn();
    }
    
    updateTargetDisplay() {
        if (!this.calculations) return;
        
        const caloriesEl = this.column.querySelector('.target-calories');
        const macrosEl = this.column.querySelector('.target-macros');
        
        caloriesEl.textContent = `Target: ${this.calculations.targetCalories} kcal`;
        macrosEl.textContent = `P: ${this.calculations.macros.protein}g • C: ${this.calculations.macros.carbs}g • F: ${this.calculations.macros.fat}g`;
    }
    
    showColumn() {
        this.column.style.display = 'flex';
        this.isVisible = true;
    }
    
    async generateSuggestions(data) {
        if (data) {
            this.userData = data.userData;
            this.calculations = data.calculations;
        }
        
        console.log('[AIMealSuggestions] Generating meal suggestions');
        
        // Show loading state
        this.showLoadingState();
        
        try {
            // Call AI to generate suggestions
            const suggestions = await this.fetchAISuggestions();
            this.displaySuggestions(suggestions);
        } catch (error) {
            console.error('Error generating suggestions:', error);
            this.showError();
        }
    }
    
    showLoadingState() {
        const mealTypes = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];
        mealTypes.forEach(type => {
            const container = document.getElementById(`options-${type}`);
            if (container) {
                container.innerHTML = '<div class="loading-placeholder">Generating personalized options...</div>';
            }
        });
    }
    
    async fetchAISuggestions() {
        // For now, return mock data. In production, this would call the AI API
        const mockSuggestions = {
            breakfast: [
                { name: 'Protein Oatmeal Bowl', kcal: 420, protein: 22, carbs: 58, fat: 12, portion: '350g' },
                { name: 'Greek Yogurt Parfait', kcal: 380, protein: 28, carbs: 45, fat: 10, portion: '300g' },
                { name: 'Scrambled Eggs & Toast', kcal: 450, protein: 25, carbs: 35, fat: 20, portion: '250g' },
                { name: 'Protein Smoothie Bowl', kcal: 390, protein: 30, carbs: 48, fat: 8, portion: '400ml' },
                { name: 'Avocado Toast with Eggs', kcal: 480, protein: 20, carbs: 40, fat: 25, portion: '200g' }
            ],
            'morning-snack': [
                { name: 'Apple with Almond Butter', kcal: 180, protein: 5, carbs: 22, fat: 10, portion: '150g' },
                { name: 'Protein Bar', kcal: 200, protein: 20, carbs: 18, fat: 8, portion: '60g' },
                { name: 'Mixed Nuts', kcal: 170, protein: 6, carbs: 8, fat: 15, portion: '30g' }
            ],
            lunch: [
                { name: 'Grilled Chicken Salad', kcal: 480, protein: 38, carbs: 32, fat: 18, portion: '350g' },
                { name: 'Quinoa Buddha Bowl', kcal: 520, protein: 22, carbs: 65, fat: 20, portion: '400g' },
                { name: 'Turkey Wrap', kcal: 450, protein: 32, carbs: 45, fat: 15, portion: '300g' },
                { name: 'Salmon & Rice', kcal: 550, protein: 35, carbs: 50, fat: 22, portion: '380g' },
                { name: 'Lentil Soup & Bread', kcal: 420, protein: 18, carbs: 60, fat: 12, portion: '450g' }
            ],
            'afternoon-snack': [
                { name: 'Hummus & Veggies', kcal: 150, protein: 8, carbs: 18, fat: 6, portion: '200g' },
                { name: 'Rice Cakes & PB', kcal: 180, protein: 7, carbs: 20, fat: 9, portion: '50g' },
                { name: 'Cottage Cheese & Fruit', kcal: 160, protein: 15, carbs: 20, fat: 3, portion: '180g' }
            ],
            dinner: [
                { name: 'Beef Stir-Fry', kcal: 580, protein: 35, carbs: 45, fat: 25, portion: '400g' },
                { name: 'Baked Cod & Vegetables', kcal: 420, protein: 38, carbs: 35, fat: 12, portion: '380g' },
                { name: 'Chicken Pasta', kcal: 620, protein: 32, carbs: 68, fat: 22, portion: '350g' },
                { name: 'Tofu Curry & Rice', kcal: 480, protein: 20, carbs: 62, fat: 18, portion: '420g' },
                { name: 'Turkey Meatballs', kcal: 520, protein: 40, carbs: 38, fat: 20, portion: '360g' }
            ],
            'evening-snack': [
                { name: 'Greek Yogurt', kcal: 120, protein: 15, carbs: 12, fat: 2, portion: '150g' },
                { name: 'Dark Chocolate', kcal: 140, protein: 2, carbs: 14, fat: 9, portion: '25g' },
                { name: 'Casein Protein Shake', kcal: 130, protein: 25, carbs: 5, fat: 2, portion: '300ml' }
            ]
        };
        
        // Filter based on dietary preferences if available
        if (this.userData?.dietType === 'vegetarian' || this.userData?.dietType === 'vegan') {
            // Filter out meat options
            Object.keys(mockSuggestions).forEach(mealType => {
                mockSuggestions[mealType] = mockSuggestions[mealType].filter(item => 
                    !item.name.toLowerCase().match(/chicken|beef|turkey|salmon|cod|meat/)
                );
            });
        }
        
        return mockSuggestions;
    }
    
    displaySuggestions(suggestions) {
        this.suggestions = suggestions;
        
        Object.entries(suggestions).forEach(([mealType, options]) => {
            const container = document.getElementById(`options-${mealType}`);
            if (!container) return;
            
            container.innerHTML = '';
            
            options.forEach((option, index) => {
                const optionEl = this.createOptionElement(option, mealType, index);
                container.appendChild(optionEl);
            });
        });
        
        // Enable populate button
        this.updatePopulateButton();
    }
    
    createOptionElement(option, mealType, index) {
        const div = document.createElement('div');
        div.className = 'meal-option';
        div.dataset.mealType = mealType;
        div.dataset.index = index;
        
        div.innerHTML = `
            <div class="option-content">
                <div class="option-name">${option.name}</div>
                <div class="option-details">
                    <span class="option-portion">${option.portion}</span>
                    <span class="option-calories">${option.kcal} kcal</span>
                </div>
                <div class="option-macros">
                    P: ${option.protein}g • C: ${option.carbs}g • F: ${option.fat}g
                </div>
            </div>
            <div class="option-actions">
                <button class="btn-feedback btn-approve" onclick="window.mealSuggestions.approveMeal('${mealType}', ${index})" title="Good option">
                    👍
                </button>
                <button class="btn-feedback btn-reject" onclick="window.mealSuggestions.rejectMeal('${mealType}', ${index})" title="Not for me">
                    👎
                </button>
            </div>
        `;
        
        return div;
    }
    
    approveMeal(mealType, index) {
        const option = this.suggestions[mealType][index];
        const meal = {
            type: mealType,
            ...option,
            approved: true
        };
        
        // Add to approved list
        this.approvedMeals.push(meal);
        
        // Update UI
        const optionEl = document.querySelector(`.meal-option[data-meal-type="${mealType}"][data-index="${index}"]`);
        if (optionEl) {
            optionEl.classList.add('approved');
            optionEl.classList.remove('rejected');
        }
        
        // Emit event
        eventBus.emit('meal:approved', { meal });
        
        // Update populate button
        this.updatePopulateButton();
    }
    
    rejectMeal(mealType, index) {
        const option = this.suggestions[mealType][index];
        const meal = {
            type: mealType,
            ...option,
            approved: false
        };
        
        // Add to rejected list
        this.rejectedMeals.push(meal);
        
        // Update UI
        const optionEl = document.querySelector(`.meal-option[data-meal-type="${mealType}"][data-index="${index}"]`);
        if (optionEl) {
            optionEl.classList.add('rejected');
            optionEl.classList.remove('approved');
        }
        
        // Emit event
        eventBus.emit('meal:rejected', { meal });
        
        // Request new suggestion
        this.requestAlternative(mealType, meal);
    }
    
    async requestAlternative(mealType, rejectedMeal) {
        console.log(`[AIMealSuggestions] Requesting alternative for ${mealType}`);
        // In production, this would call AI for a new suggestion
        // For now, just log the rejection
    }
    
    updatePopulateButton() {
        const button = this.column.querySelector('.btn-populate-board');
        if (!button) return;
        
        // Enable if we have at least one approved meal for main meals
        const hasBreakfast = this.approvedMeals.some(m => m.type === 'breakfast');
        const hasLunch = this.approvedMeals.some(m => m.type === 'lunch');
        const hasDinner = this.approvedMeals.some(m => m.type === 'dinner');
        
        button.disabled = !(hasBreakfast && hasLunch && hasDinner);
    }
    
    async generateMore() {
        console.log('[AIMealSuggestions] Generating more options');
        await this.generateSuggestions();
    }
    
    populateBoard() {
        if (this.approvedMeals.length === 0) {
            alert('Please approve some meals first!');
            return;
        }
        
        console.log('[AIMealSuggestions] Populating board with approved meals');
        
        // Emit event to populate the kanban board
        eventBus.emit('populate:board', {
            meals: this.approvedMeals,
            userData: this.userData
        });
    }
    
    showError() {
        const mealTypes = ['breakfast', 'morning-snack', 'lunch', 'afternoon-snack', 'dinner', 'evening-snack'];
        mealTypes.forEach(type => {
            const container = document.getElementById(`options-${type}`);
            if (container) {
                container.innerHTML = '<div class="error-message">Failed to generate suggestions. Please try again.</div>';
            }
        });
    }
    
    reset() {
        this.suggestions = {};
        this.approvedMeals = [];
        this.rejectedMeals = [];
        this.userData = null;
        this.calculations = null;
        
        // Reset UI
        if (this.column) {
            this.column.style.display = 'none';
            const containers = this.column.querySelectorAll('.meal-options');
            containers.forEach(container => {
                container.innerHTML = '<div class="loading-placeholder">Waiting for assessment...</div>';
            });
        }
    }
}

// Create global reference
window.mealSuggestions = null;

export default AIMealSuggestions;