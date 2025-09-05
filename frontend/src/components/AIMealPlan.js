// Step 3: AI Meal Plan Display Component

// Import the global eventBus that's used by the rest of the app
import eventBus from '../services/EventBus.js';

class AIMealPlan {
    constructor() {
        this.container = null;
        this.userData = {};
        this.mealPlan = null;
        this.feedbackData = {
            proteins: null,
            fruits: null,
            vegetables: null,
            carbs: null,
            snacks: null
        };
    }
    
    init() {
        console.log('[AIMealPlan] Initializing Step 3 event listeners');
        // Don't create container yet - wait for the event
        this.setupEventListeners();
    }
    
    createContainer() {
        // Remove existing if present
        const existing = document.getElementById('ai-meal-plan-column');
        if (existing) existing.remove();
        
        // Create the Step 3 container with same styling as Step 2
        this.container = document.createElement('div');
        this.container.id = 'ai-meal-plan-column';
        this.container.className = 'ai-column ai-meal-plan-column ai-display-column category-column';
        this.container.style.display = 'none'; // Hidden initially
        this.container.dataset.category = 'ai-meal-plan';
        
        this.container.innerHTML = `
            <div class="assessment-header">
                <h3>Step 3: Food Preferences</h3>
            </div>
            
            <div class="meal-plan-content display-content">
                <!-- Loading state -->
                <div class="loading-message">
                    <div class="typing-indicator">
                        <span></span><span></span><span></span>
                    </div>
                    <p>Preparing your preferences...</p>
                </div>
                
                <!-- Food preferences content (no tabs, no heading) -->
                <div class="food-preferences-content" style="display: none;">
                    <div class="food-categories"></div>
                </div>
            </div>
        `;
        
        // Find the main board and insert the column
        const mainBoard = document.querySelector('.main-board');
        if (mainBoard) {
            // Step 3 should go AFTER the assessment column (Step 1), which puts it on the RIGHT
            const assessmentColumn = mainBoard.querySelector('.ai-assessment-column');
            
            if (assessmentColumn) {
                // Insert RIGHT AFTER the assessment column
                assessmentColumn.insertAdjacentElement('afterend', this.container);
                console.log('[AIMealPlan] Step 3 inserted to the RIGHT of Assessment (Step 1)');
            } else {
                // Fallback: insert before first day column
                const firstDayColumn = mainBoard.querySelector('.day-column');
                if (firstDayColumn) {
                    mainBoard.insertBefore(this.container, firstDayColumn);
                    console.log('[AIMealPlan] Step 3 inserted before day columns (fallback)');
                } else {
                    mainBoard.appendChild(this.container);
                    console.log('[AIMealPlan] Step 3 appended to end (fallback)');
                }
            }
        } else {
            console.error('[AIMealPlan] Main board not found!');
        }
    }
    
    setupEventListeners() {
        // Listen for assessment completion to generate meal plan
        eventBus.on('assessment:complete', (data) => {
            console.log('[AIMealPlan] Assessment complete, storing user data');
            this.userData = data.userData;
        });
        
        // Listen for both events to trigger meal plan
        eventBus.on('generate:suggestions', (data) => {
            console.log('[AIMealPlan] Generating meal plan from suggestions event');
            this.userData = data.userData;
            // Use targetCalories from calculations, NOT tdee!
            this.targetCalories = data.calculations?.targetCalories || data.userData?.targetCalories || 2000;
            this.showMealPlan();
            
            // Auto-fill preferences in test mode
            if (window.location.hash === '#test' || data.isTestMode) {
                // Wait for the preferences to be displayed
                setTimeout(() => {
                    if (this.container && this.container.querySelector('.food-categories')) {
                        this.autoFillPreferences();
                    }
                }, 3000);  // Wait longer for everything to load
            }
        });
        
        eventBus.on('generate:mealplan', (data) => {
            console.log('[AIMealPlan] Generating meal plan from mealplan event');
            this.userData = data.userData;
            // Use targetCalories, not TDEE!
            this.targetCalories = data.calculations?.targetCalories || data.userData?.targetCalories || 2000;
            this.showMealPlan();
        });
    }
    
    async showMealPlan() {
        // Create container if it doesn't exist yet
        if (!this.container) {
            this.createContainer();
        }
        
        // Show the container
        this.container.style.display = 'flex';
        
        // Generate meal plan based on user data
        setTimeout(() => {
            this.generateMealPlan();
        }, 2000); // Simulate loading time
    }
    
    generateMealPlan() {
        const targetCalories = this.targetCalories || this.userData.targetCalories || 2000;
        const hasNAFLD = this.userData.healthConditions?.toLowerCase().includes('nafld');
        const isDiabetic = this.userData.healthConditions?.toLowerCase().includes('diabet');
        
        // Calculate meal distribution for 3 meals + 3 snacks
        // Meals: 25% breakfast, 30% lunch, 30% dinner = 85%
        // Snacks: 3 x 5% = 15%
        // Fix rounding errors by adjusting last item
        const breakfastCal = Math.round(targetCalories * 0.25);
        const lunchCal = Math.round(targetCalories * 0.30);
        const dinnerCal = Math.round(targetCalories * 0.30);
        const snack1Cal = Math.round(targetCalories * 0.05);
        const snack2Cal = Math.round(targetCalories * 0.05);
        
        // Calculate snack3 as remainder to ensure total equals target
        const allocatedCals = breakfastCal + lunchCal + dinnerCal + snack1Cal + snack2Cal;
        const snack3Cal = targetCalories - allocatedCals; // This absorbs any rounding error
        
        // Create meal plan with raw ingredients
        this.mealPlan = this.createMealPlanForCalories(breakfastCal, lunchCal, dinnerCal, snack1Cal, snack2Cal, snack3Cal, hasNAFLD, isDiabetic);
        
        // Hide loading, show food preferences
        this.container.querySelector('.loading-message').style.display = 'none';
        this.container.querySelector('.food-preferences-content').style.display = 'block';
        
        // Display food preferences
        this.displayFoodPreferences();
    }
    
    createMealPlanForCalories(breakfastCal, lunchCal, dinnerCal, snack1Cal, snack2Cal, snack3Cal, hasNAFLD, isDiabetic) {
        // Create realistic meal plans with raw ingredients
        const mealPlan = {
            breakfast: this.generateBreakfast(breakfastCal, hasNAFLD, isDiabetic),
            lunch: this.generateLunch(lunchCal, hasNAFLD, isDiabetic),
            dinner: this.generateDinner(dinnerCal, hasNAFLD, isDiabetic),
            morningSnack: this.generateSnack(snack1Cal, 'morning', hasNAFLD, isDiabetic),
            afternoonSnack: this.generateSnack(snack2Cal, 'afternoon', hasNAFLD, isDiabetic),
            eveningSnack: this.generateSnack(snack3Cal, 'evening', hasNAFLD, isDiabetic),
            totalCalories: breakfastCal + lunchCal + dinnerCal + snack1Cal + snack2Cal + snack3Cal
        };
        
        return mealPlan;
    }
    
    generateBreakfast(calories, hasNAFLD, isDiabetic) {
        // Generate breakfast based on calorie target
        const items = [];
        let remainingCal = calories;
        
        if (calories >= 400) {
            items.push({ name: "2 large eggs", calories: 140, protein: 12 });
            items.push({ name: "2 slices whole wheat toast", calories: 160, carbs: 30 });
            items.push({ name: "1 tbsp almond butter", calories: 95, fat: 8 });
            items.push({ name: "1 medium banana", calories: 105, carbs: 27 });
        } else if (calories >= 300) {
            items.push({ name: "1 cup oatmeal", calories: 150, carbs: 27 });
            items.push({ name: "1/2 cup blueberries", calories: 42, carbs: 11 });
            items.push({ name: "1 tbsp honey", calories: 64, carbs: 17 });
            items.push({ name: "2 tbsp chopped walnuts", calories: 82, fat: 8 });
        } else {
            items.push({ name: "1 cup Greek yogurt", calories: 100, protein: 17 });
            items.push({ name: "1/4 cup granola", calories: 120, carbs: 24 });
            items.push({ name: "1/2 cup strawberries", calories: 25, carbs: 6 });
        }
        
        return {
            items: items,
            totalCalories: items.reduce((sum, item) => sum + item.calories, 0)
        };
    }
    
    generateLunch(calories, hasNAFLD, isDiabetic) {
        const items = [];
        
        if (calories >= 600) {
            items.push({ name: "6 oz grilled chicken breast", calories: 280, protein: 53 });
            items.push({ name: "1 cup brown rice", calories: 220, carbs: 45 });
            items.push({ name: "2 cups mixed salad", calories: 20, fiber: 2 });
            items.push({ name: "2 tbsp olive oil dressing", calories: 120, fat: 14 });
            items.push({ name: "1 medium apple", calories: 95, carbs: 25 });
        } else if (calories >= 500) {
            items.push({ name: "5 oz salmon fillet", calories: 280, protein: 39, omega3: true });
            items.push({ name: "1 cup quinoa", calories: 220, carbs: 39, protein: 8 });
            items.push({ name: "1 cup steamed broccoli", calories: 30, fiber: 3 });
            items.push({ name: "1 tsp olive oil", calories: 40, fat: 5 });
        } else {
            items.push({ name: "4 oz turkey breast", calories: 180, protein: 34 });
            items.push({ name: "2 cups spinach salad", calories: 14, fiber: 2 });
            items.push({ name: "1/2 avocado", calories: 120, fat: 11 });
            items.push({ name: "1/2 cup chickpeas", calories: 135, protein: 7, carbs: 22 });
            items.push({ name: "1 tbsp balsamic vinegar", calories: 10 });
        }
        
        return {
            items: items,
            totalCalories: items.reduce((sum, item) => sum + item.calories, 0)
        };
    }
    
    generateDinner(calories, hasNAFLD, isDiabetic) {
        const items = [];
        
        if (calories >= 700) {
            items.push({ name: "6 oz lean beef sirloin", calories: 320, protein: 48 });
            items.push({ name: "1 large sweet potato", calories: 160, carbs: 37 });
            items.push({ name: "1.5 cups roasted vegetables", calories: 60, fiber: 4 });
            items.push({ name: "1 tbsp olive oil", calories: 120, fat: 14 });
            items.push({ name: "Small side salad", calories: 40 });
        } else if (calories >= 500) {
            items.push({ name: "5 oz grilled tilapia", calories: 180, protein: 37 });
            items.push({ name: "1 cup wild rice", calories: 165, carbs: 35 });
            items.push({ name: "1 cup asparagus", calories: 40, fiber: 3 });
            items.push({ name: "2 tsp butter", calories: 70, fat: 8 });
            items.push({ name: "1/2 cup berries", calories: 40, carbs: 10 });
        } else {
            items.push({ name: "4 oz baked cod", calories: 120, protein: 26 });
            items.push({ name: "1.5 cups cauliflower rice", calories: 40, carbs: 8 });
            items.push({ name: "1 cup green beans", calories: 35, fiber: 3 });
            items.push({ name: "2 tbsp almonds", calories: 100, fat: 9 });
            items.push({ name: "Small orange", calories: 60, carbs: 15 });
        }
        
        return {
            items: items,
            totalCalories: items.reduce((sum, item) => sum + item.calories, 0)
        };
    }
    
    generateSnack(calories, timeOfDay, hasNAFLD, isDiabetic) {
        const items = [];
        
        // Different snacks for different times of day
        if (timeOfDay === 'morning') {
            if (calories >= 100) {
                items.push({ name: "1 medium apple", calories: 95 });
            } else {
                items.push({ name: "1/2 cup berries", calories: calories });
            }
        } else if (timeOfDay === 'afternoon') {
            if (calories >= 100) {
                items.push({ name: "Greek yogurt (1/2 cup)", calories: 80 });
            } else {
                items.push({ name: "Baby carrots (1 cup)", calories: calories });
            }
        } else { // evening
            if (calories >= 100) {
                items.push({ name: "1 oz almonds", calories: 85 });
            } else {
                items.push({ name: "Celery sticks with 1 tbsp almond butter", calories: calories });
            }
        }
        
        return {
            items: items,
            totalCalories: calories // Use the allocated calories exactly
        };
    }
    
    
    displayFoodPreferences() {
        const categoriesContainer = document.querySelector('.food-categories');
        
        // Calculate protein per meal (assuming protein in lunch and dinner mainly)
        const targetCalories = this.targetCalories || 1752;
        const proteinGrams = Math.round(targetCalories * 0.3 / 4); // 30% protein, 4 cal/g
        const proteinPerMeal = Math.round(proteinGrams / 2); // Split between lunch and dinner
        
        const foodOptions = {
            proteins: [
                { name: 'Chicken Breast', id: 'chicken' },
                { name: 'Turkey Breast', id: 'turkey' },
                { name: 'Lean Beef / Steak', id: 'beef' },
                { name: 'Salmon', id: 'salmon' },
                { name: 'Tofu', id: 'tofu' },
                { name: 'Eggs', id: 'eggs' },
                { name: 'Tuna', id: 'tuna' },
                { name: 'White Fish (Cod / Barramundi)', id: 'cod' },
                { name: 'Prawns / Shrimp', id: 'shrimp' },
                { name: 'Pork Tenderloin', id: 'pork' }
            ],
            fruits: [
                { name: 'Apple', id: 'apple' },
                { name: 'Banana', id: 'banana' },
                { name: 'Berries', id: 'berries' },
                { name: 'Orange', id: 'orange' },
                { name: 'Grapes', id: 'grapes' },
                { name: 'Pear', id: 'pear' },
                { name: 'Mango', id: 'mango' },
                { name: 'Pineapple', id: 'pineapple' },
                { name: 'Watermelon', id: 'watermelon' },
                { name: 'Peach / Nectarine', id: 'peach' }
            ],
            vegetables: [
                { name: 'Broccoli', id: 'broccoli' },
                { name: 'Spinach', id: 'spinach' },
                { name: 'Carrots', id: 'carrots' },
                { name: 'Mixed Greens / Salad', id: 'greens' },
                { name: 'Capsicum / Bell Peppers', id: 'peppers' },
                { name: 'Asparagus', id: 'asparagus' },
                { name: 'Green Beans', id: 'greenbeans' },
                { name: 'Cauliflower', id: 'cauliflower' },
                { name: 'Zucchini / Courgette', id: 'zucchini' },
                { name: 'Brussels Sprouts', id: 'brussels' }
            ],
            carbs: [
                { name: 'Brown Rice', id: 'brownrice' },
                { name: 'Quinoa', id: 'quinoa' },
                { name: 'Whole Wheat / Wholemeal Pasta', id: 'pasta' },
                { name: 'Sweet Potato / Kumara', id: 'sweetpotato' },
                { name: 'Whole Grain / Wholemeal Bread', id: 'bread' },
                { name: 'Oats / Porridge', id: 'oatmeal' },
                { name: 'White Rice / Jasmine Rice', id: 'whiterice' },
                { name: 'Couscous', id: 'couscous' },
                { name: 'Barley', id: 'barley' },
                { name: 'Buckwheat', id: 'buckwheat' }
            ],
            snacks: [
                { name: 'Greek Yoghurt', id: 'yogurt' },
                { name: 'Mixed Nuts', id: 'nuts' },
                { name: 'Hummus & Veggies', id: 'hummus' },
                { name: 'Protein Bar', id: 'proteinbar' },
                { name: 'Cottage Cheese', id: 'cottage' },
                { name: 'Rice Cakes / Crackers', id: 'ricecakes' },
                { name: 'Dark Chocolate', id: 'chocolate' },
                { name: 'Trail Mix / Scroggin', id: 'trailmix' },
                { name: 'Popcorn', id: 'popcorn' },
                { name: 'String Cheese', id: 'cheese' }
            ]
        };
        
        const categoryInfo = {
            proteins: { emoji: '🍗', title: 'Proteins' },
            fruits: { emoji: '🍎', title: 'Fruits' },
            vegetables: { emoji: '🥦', title: 'Vegetables' },
            carbs: { emoji: '🍞', title: 'Carbohydrates' },
            snacks: { emoji: '🥜', title: 'Snacks' }
        };
        
        categoriesContainer.innerHTML = Object.entries(foodOptions).map(([category, foods]) => `
            <div class="food-category-section">
                <h5 class="category-title">
                    <span>${categoryInfo[category].emoji}</span>
                    ${categoryInfo[category].title}
                </h5>
                <div class="food-items-grid">
                    ${foods.map(food => `
                        <div class="food-item" data-category="${category}" data-food="${food.id}">
                            <span class="food-name">${food.name}</span>
                            <div class="food-buttons">
                                <button class="food-btn like" data-category="${category}" data-food="${food.id}" title="I like this">
                                    👍
                                </button>
                                <button class="food-btn dislike" data-category="${category}" data-food="${food.id}" title="Not for me">
                                    👎
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');
        
        // Add event listeners
        categoriesContainer.querySelectorAll('.food-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const foodItem = e.target.closest('.food-item');
                const isLike = e.target.classList.contains('like');
                
                // Remove existing selection
                foodItem.querySelectorAll('.food-btn').forEach(b => b.classList.remove('selected'));
                
                // Add selection
                e.target.classList.add('selected');
                foodItem.classList.remove('liked', 'disliked');
                foodItem.classList.add(isLike ? 'liked' : 'disliked');
                
                // Record preference
                this.recordFoodPreference(e.target.dataset.category, e.target.dataset.food, isLike);
            });
        });
    }
    
    recordFoodPreference(category, food, isLike) {
        // Initialize category if not exists
        if (!this.feedbackData[category]) {
            this.feedbackData[category] = {};
        }
        
        // Store the preference
        this.feedbackData[category][food] = isLike ? 'like' : 'dislike';
        
        // Check if user has made enough selections to continue
        const totalSelections = Object.values(this.feedbackData).reduce((sum, cat) => {
            return sum + (typeof cat === 'object' && cat !== null ? Object.keys(cat).length : 0);
        }, 0);
        
        // If user has made at least 10 selections, show continue button
        if (totalSelections >= 10) {
            this.showContinueOption();
        }
    }
    
    recordPreference(category, preference, button) {
        // Store preference (old method for backward compatibility)
        this.feedbackData[category] = preference;
        
        // Update UI
        const card = button.closest('.preference-card');
        card.classList.add('preference-set');
        card.classList.add(`preference-${preference}`);
        
        // Disable both buttons in this card
        card.querySelectorAll('.pref-btn').forEach(btn => {
            btn.disabled = true;
        });
        
        // Add selected state to clicked button
        button.classList.add('selected');
        
        // Check if all preferences are set
        const allSet = Object.values(this.feedbackData).filter(v => v !== null).length === 5;
        if (allSet) {
            this.onPreferencesComplete();
        }
    }
    
    autoFillPreferences() {
        console.log('[AIMealPlan] Auto-filling ALL preferences for test mode');
        
        // Get all food items
        const foodItems = this.container.querySelectorAll('.food-item');
        
        foodItems.forEach((item, index) => {
            // For EVERY item, randomly choose like or dislike (70% like, 30% dislike)
            const shouldLike = Math.random() > 0.3;
            
            setTimeout(() => {
                // Find the like or dislike button within this food item
                const likeBtn = item.querySelector('.food-btn.like');
                const dislikeBtn = item.querySelector('.food-btn.dislike');
                
                if (shouldLike && likeBtn) {
                    likeBtn.click();
                } else if (!shouldLike && dislikeBtn) {
                    dislikeBtn.click();
                }
            }, index * 30); // Stagger clicks for visual effect (30ms between each)
        });
        
        // Auto-click continue button after all selections (50 items * 30ms = 1500ms, plus buffer)
        setTimeout(() => {
            const continueBtn = this.container.querySelector('.continue-to-board');
            if (continueBtn) {
                console.log('[AIMealPlan] Auto-clicking Create meal plan button');
                continueBtn.click();
            }
        }, (foodItems.length * 30) + 500);
    }
    
    showContinueOption() {
        // Check if continue button already exists
        if (this.container.querySelector('.continue-to-board')) return;
        
        const prefsContent = this.container.querySelector('.food-preferences-content');
        const continueSection = document.createElement('div');
        continueSection.className = 'continue-section';
        continueSection.innerHTML = `
            <button class="continue-to-board">Create meal plan →</button>
        `;
        prefsContent.appendChild(continueSection);
        
        continueSection.querySelector('.continue-to-board').addEventListener('click', () => {
            this.onPreferencesComplete();
        });
    }
    
    onPreferencesComplete() {
        console.log('[AIMealPlan] All preferences collected:', this.feedbackData);
        
        // Show loading state while generating meal plan
        const prefsContent = this.container.querySelector('.food-preferences-content');
        prefsContent.innerHTML = `
            <div class="generating-plan">
                <div class="typing-indicator">
                    <span></span><span></span><span></span>
                </div>
                <p>Creating your personalized meal plan...</p>
            </div>
        `;
        
        // Generate and populate meal plan
        setTimeout(() => {
            this.generatePersonalizedMealPlan();
        }, 2000);
    }
    
    generatePersonalizedMealPlan() {
        console.log('[AIMealPlan] Generating personalized meal plan with preferences');
        
        // Get liked and disliked foods
        const likedFoods = this.getLikedFoods();
        const dislikedFoods = this.getDislikedFoods();
        
        // Generate 7 days of meals based on preferences and context
        const weekPlan = this.generateWeekOfMeals(likedFoods, dislikedFoods);
        
        // Emit event to populate the Kanban board
        eventBus.emit('populate:kanban', {
            weekPlan: weekPlan,
            userData: this.userData,
            preferences: this.feedbackData,
            targetCalories: this.targetCalories
        });
        
        // Show success message
        const prefsContent = this.container.querySelector('.food-preferences-content');
        prefsContent.innerHTML = `
            <div class="plan-complete">
                <h3>✅ Meal Plan Created!</h3>
                <p>Your personalized meal plan has been added to the board.</p>
                <p class="plan-summary">
                    <strong>${weekPlan.length} days</strong> of meals based on your preferences<br>
                    <strong>${this.targetCalories} calories</strong> per day<br>
                    <strong>${Object.keys(likedFoods).reduce((sum, cat) => sum + likedFoods[cat].length, 0)} liked foods</strong> included
                </p>
                <button class="view-board-btn">View Meal Board</button>
            </div>
        `;
        
        // Add event listener to scroll to day columns
        prefsContent.querySelector('.view-board-btn').addEventListener('click', () => {
            const firstDayColumn = document.querySelector('.day-column');
            if (firstDayColumn) {
                firstDayColumn.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        });
    }
    
    getLikedFoods() {
        const liked = {};
        Object.entries(this.feedbackData).forEach(([category, items]) => {
            if (typeof items === 'object') {
                liked[category] = Object.entries(items)
                    .filter(([food, pref]) => pref === 'like')
                    .map(([food]) => food);
            }
        });
        return liked;
    }
    
    getDislikedFoods() {
        const disliked = {};
        Object.entries(this.feedbackData).forEach(([category, items]) => {
            if (typeof items === 'object') {
                disliked[category] = Object.entries(items)
                    .filter(([food, pref]) => pref === 'dislike')
                    .map(([food]) => food);
            }
        });
        return disliked;
    }
    
    generateWeekOfMeals(likedFoods, dislikedFoods) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const weekPlan = [];
        
        days.forEach(day => {
            const dayMeals = this.generateDayMeals(day, likedFoods, dislikedFoods);
            weekPlan.push({
                day: day,
                meals: dayMeals
            });
        });
        
        return weekPlan;
    }
    
    generateDayMeals(day, likedFoods, dislikedFoods) {
        const meals = [];
        const targetCalories = this.targetCalories || 1752;
        
        // Generate meals using liked foods and avoiding disliked ones
        meals.push(this.createMeal('Breakfast', targetCalories * 0.25, likedFoods, dislikedFoods));
        meals.push(this.createMeal('Morning Snack', targetCalories * 0.05, likedFoods, dislikedFoods));
        meals.push(this.createMeal('Lunch', targetCalories * 0.30, likedFoods, dislikedFoods));
        meals.push(this.createMeal('Afternoon Snack', targetCalories * 0.05, likedFoods, dislikedFoods));
        meals.push(this.createMeal('Dinner', targetCalories * 0.30, likedFoods, dislikedFoods));
        meals.push(this.createMeal('Evening Snack', targetCalories * 0.05, likedFoods, dislikedFoods));
        
        return meals;
    }
    
    createMeal(mealType, calories, likedFoods, dislikedFoods) {
        // Smart meal creation based on meal type and preferences
        const meal = {
            type: mealType,
            calories: Math.round(calories),
            items: []
        };
        
        // Select appropriate foods based on meal type and preferences
        if (mealType === 'Breakfast') {
            meal.items = this.selectBreakfastItems(calories, likedFoods, dislikedFoods);
        } else if (mealType.includes('Snack')) {
            meal.items = this.selectSnackItems(calories, likedFoods, dislikedFoods);
        } else if (mealType === 'Lunch' || mealType === 'Dinner') {
            meal.items = this.selectMainMealItems(mealType, calories, likedFoods, dislikedFoods);
        }
        
        return meal;
    }
    
    selectBreakfastItems(calories, likedFoods, dislikedFoods) {
        const items = [];
        const foodDB = window.foodDatabase;
        const likedCarbs = likedFoods.carbs || [];
        const likedFruits = likedFoods.fruits || [];
        const likedProteins = likedFoods.proteins || [];
        
        // Add carb if liked (oatmeal or bread)
        if (likedCarbs.includes('oatmeal')) {
            const oats = foodDB.grains.find(f => f.name === 'Oats');
            if (oats) {
                items.push({
                    name: 'Oatmeal',
                    dragData: {
                        food: { ...oats, category: 'grains' },
                        quantity: 50,
                        unit: 'g'
                    }
                });
            }
        } else if (likedCarbs.includes('bread')) {
            const bread = foodDB.grains.find(f => f.name === 'Whole Wheat Bread');
            if (bread) {
                items.push({
                    name: 'Whole Wheat Toast',
                    dragData: {
                        food: { ...bread, category: 'grains' },
                        quantity: 2,
                        unit: 'slice'
                    }
                });
            }
        }
        
        // Add protein if liked (eggs or yogurt)
        if (likedProteins.includes('eggs')) {
            const eggs = foodDB.protein.find(f => f.name === 'Eggs');
            if (eggs) {
                items.push({
                    name: 'Scrambled Eggs',
                    dragData: {
                        food: { ...eggs, category: 'protein' },
                        quantity: 2,
                        unit: 'large'
                    }
                });
            }
        }
        
        // Add dairy/yogurt
        const yogurt = foodDB.dairy.find(f => f.name === 'Greek Yogurt');
        if (yogurt && !likedProteins.includes('eggs')) {
            items.push({
                name: 'Greek Yogurt',
                dragData: {
                    food: { ...yogurt, category: 'dairy' },
                    quantity: 150,
                    unit: 'g'
                }
            });
        }
        
        // Add fruit if liked
        if (likedFruits.length > 0) {
            const randomFruit = likedFruits[Math.floor(Math.random() * likedFruits.length)];
            const fruitMap = {
                'apple': 'Apple',
                'banana': 'Banana',
                'berries': 'Blueberries',
                'orange': 'Orange',
                'grapes': 'Grapes',
                'pear': 'Pear',
                'mango': 'Mango',
                'pineapple': 'Pineapple',
                'watermelon': 'Watermelon',
                'peach': 'Peach'
            };
            
            const fruitName = fruitMap[randomFruit];
            const fruitItem = foodDB.fruit.find(f => f.name.includes(fruitName));
            
            if (fruitItem) {
                items.push({
                    name: fruitItem.name,
                    dragData: {
                        food: { ...fruitItem, category: 'fruit' },
                        quantity: fruitItem.baseQuantity,
                        unit: fruitItem.baseUnit
                    }
                });
            }
        }
        
        return items;
    }
    
    selectSnackItems(calories, likedFoods, dislikedFoods) {
        const items = [];
        const foodDB = window.foodDatabase;
        const likedSnacks = likedFoods.snacks || [];
        const likedFruits = likedFoods.fruits || [];
        
        if (likedSnacks.length > 0) {
            const randomSnack = likedSnacks[Math.floor(Math.random() * likedSnacks.length)];
            const snackMap = {
                'yogurt': 'Greek Yogurt',
                'nuts': 'Mixed Nuts',
                'hummus': 'Hummus',
                'proteinbar': 'Protein Bar',
                'cottage': 'Cottage Cheese',
                'ricecakes': 'Rice Cakes',
                'chocolate': 'Dark Chocolate',
                'trailmix': 'Trail Mix',
                'popcorn': 'Popcorn',
                'cheese': 'Cheddar Cheese'
            };
            
            const snackName = snackMap[randomSnack];
            
            // Try to find in different categories
            let snackItem = foodDB.dairy?.find(f => f.name === snackName) ||
                           foodDB.nuts?.find(f => f.name === snackName) ||
                           foodDB.snacks?.find(f => f.name === snackName);
            
            // For items not in main database, use nuts as proxy for snacks
            if (!snackItem && randomSnack === 'nuts') {
                snackItem = foodDB.nuts.find(f => f.name === 'Mixed Nuts');
            }
            if (!snackItem && randomSnack === 'yogurt') {
                snackItem = foodDB.dairy.find(f => f.name === 'Greek Yogurt');
            }
            if (!snackItem && randomSnack === 'cottage') {
                snackItem = foodDB.dairy.find(f => f.name === 'Cottage Cheese');
            }
            if (!snackItem && randomSnack === 'cheese') {
                snackItem = foodDB.dairy.find(f => f.name === 'Cheddar Cheese');
            }
            
            if (snackItem) {
                const category = foodDB.dairy?.includes(snackItem) ? 'dairy' : 'nuts';
                items.push({
                    name: snackItem.name,
                    dragData: {
                        food: { ...snackItem, category },
                        quantity: snackItem.baseQuantity,
                        unit: snackItem.baseUnit
                    }
                });
            }
        } else if (likedFruits.length > 0) {
            const randomFruit = likedFruits[Math.floor(Math.random() * likedFruits.length)];
            const fruitMap = {
                'apple': 'Apple',
                'banana': 'Banana',
                'berries': 'Blueberries',
                'orange': 'Orange'
            };
            
            const fruitName = fruitMap[randomFruit];
            const fruitItem = foodDB.fruit.find(f => f.name.includes(fruitName));
            
            if (fruitItem) {
                items.push({
                    name: fruitItem.name,
                    dragData: {
                        food: { ...fruitItem, category: 'fruit' },
                        quantity: fruitItem.baseQuantity,
                        unit: fruitItem.baseUnit
                    }
                });
            }
        }
        
        // Fallback to mixed nuts if nothing selected
        if (items.length === 0) {
            const nuts = foodDB.nuts.find(f => f.name === 'Mixed Nuts');
            if (nuts) {
                items.push({
                    name: 'Mixed Nuts',
                    dragData: {
                        food: { ...nuts, category: 'nuts' },
                        quantity: 28,
                        unit: 'g'
                    }
                });
            }
        }
        
        return items;
    }
    
    selectMainMealItems(mealType, calories, likedFoods, dislikedFoods) {
        const items = [];
        const foodDB = window.foodDatabase;
        const likedProteins = likedFoods.proteins || [];
        const likedCarbs = likedFoods.carbs || [];
        const likedVegetables = likedFoods.vegetables || [];
        
        // Add protein
        if (likedProteins.length > 0) {
            const randomProtein = likedProteins[Math.floor(Math.random() * likedProteins.length)];
            const proteinMap = {
                'chicken': 'Chicken Breast',
                'turkey': 'Turkey',
                'beef': 'Lean Beef',
                'salmon': 'Salmon',
                'tofu': 'Tofu',
                'eggs': 'Eggs',
                'tuna': 'Tuna',
                'cod': 'Cod',
                'shrimp': 'Shrimp',
                'pork': 'Pork Chop'
            };
            
            const proteinName = proteinMap[randomProtein];
            const proteinItem = foodDB.protein.find(f => f.name === proteinName);
            
            if (proteinItem) {
                // Adjust portion for main meals (150g for lunch/dinner)
                const portion = mealType === 'Lunch' ? 150 : 180;
                items.push({
                    name: proteinItem.name,
                    dragData: {
                        food: { ...proteinItem, category: 'protein' },
                        quantity: portion,
                        unit: 'g'
                    }
                });
            }
        } else {
            // Default to chicken if no preference
            const chicken = foodDB.protein.find(f => f.name === 'Chicken Breast');
            if (chicken) {
                items.push({
                    name: 'Chicken Breast',
                    dragData: {
                        food: { ...chicken, category: 'protein' },
                        quantity: 150,
                        unit: 'g'
                    }
                });
            }
        }
        
        // Add carb
        if (likedCarbs.length > 0) {
            const randomCarb = likedCarbs[Math.floor(Math.random() * likedCarbs.length)];
            const carbMap = {
                'brownrice': 'Brown Rice',
                'quinoa': 'Quinoa',
                'pasta': 'Whole Wheat Pasta',
                'sweetpotato': 'Sweet Potato',
                'bread': 'Whole Wheat Bread',
                'oatmeal': 'Oats',
                'whiterice': 'White Rice',
                'couscous': 'Couscous',
                'barley': 'Barley',
                'buckwheat': 'Buckwheat'
            };
            
            const carbName = carbMap[randomCarb];
            let carbItem = foodDB.grains.find(f => f.name === carbName) ||
                          foodDB.carbs?.find(f => f.name === carbName);
            
            // Sweet potato is in carbs, not grains
            if (randomCarb === 'sweetpotato') {
                carbItem = foodDB.carbs?.find(f => f.name === 'Sweet Potato');
            }
            
            if (carbItem) {
                const category = randomCarb === 'sweetpotato' ? 'carbs' : 'grains';
                const portion = randomCarb === 'sweetpotato' ? 150 : 75; // Cooked portion
                items.push({
                    name: carbItem.name,
                    dragData: {
                        food: { ...carbItem, category },
                        quantity: portion,
                        unit: 'g'
                    }
                });
            }
        }
        
        // Add vegetables
        if (likedVegetables.length > 0) {
            const randomVeg = likedVegetables[Math.floor(Math.random() * likedVegetables.length)];
            const vegMap = {
                'broccoli': 'Broccoli',
                'spinach': 'Spinach',
                'carrots': 'Carrots',
                'greens': 'Lettuce',
                'peppers': 'Bell Pepper',
                'asparagus': 'Asparagus',
                'greenbeans': 'Green Beans',
                'cauliflower': 'Cauliflower',
                'zucchini': 'Zucchini',
                'brussels': 'Brussels Sprouts'
            };
            
            const vegName = vegMap[randomVeg];
            const vegItem = foodDB.veg.find(f => f.name === vegName);
            
            if (vegItem) {
                items.push({
                    name: vegItem.name,
                    dragData: {
                        food: { ...vegItem, category: 'veg' },
                        quantity: randomVeg === 'peppers' ? 1 : 100,
                        unit: randomVeg === 'peppers' ? 'unit' : 'g'
                    }
                });
            }
        } else {
            // Default to mixed vegetables
            const broccoli = foodDB.veg.find(f => f.name === 'Broccoli');
            if (broccoli) {
                items.push({
                    name: 'Mixed Vegetables',
                    dragData: {
                        food: { ...broccoli, category: 'veg' },
                        quantity: 100,
                        unit: 'g'
                    }
                });
            }
        }
        
        return items;
    }
    
    // Helper methods to convert IDs to readable names
    getFruitName(id) {
        const fruits = {
            apple: 'Apple',
            banana: 'Banana',
            berries: 'Mixed berries',
            orange: 'Orange',
            grapes: 'Grapes',
            pear: 'Pear',
            mango: 'Mango',
            pineapple: 'Pineapple',
            watermelon: 'Watermelon',
            peach: 'Peach'
        };
        return fruits[id] || 'Fresh fruit';
    }
    
    getSnackName(id) {
        const snacks = {
            yogurt: 'Greek yogurt',
            nuts: 'Mixed nuts',
            hummus: 'Hummus with veggies',
            proteinbar: 'Protein bar',
            cottage: 'Cottage cheese',
            ricecakes: 'Rice cakes',
            chocolate: 'Dark chocolate',
            trailmix: 'Trail mix',
            popcorn: 'Air-popped popcorn',
            cheese: 'String cheese'
        };
        return snacks[id] || 'Healthy snack';
    }
    
    getProteinName(id) {
        const proteins = {
            chicken: 'Grilled chicken breast',
            turkey: 'Turkey breast',
            beef: 'Lean beef',
            salmon: 'Baked salmon',
            tofu: 'Marinated tofu',
            eggs: 'Eggs',
            tuna: 'Tuna steak',
            cod: 'Baked white fish',
            shrimp: 'Grilled prawns',
            pork: 'Pork tenderloin'
        };
        return proteins[id] || 'Lean protein';
    }
    
    getCarbName(id) {
        const carbs = {
            brownrice: 'Brown rice',
            quinoa: 'Quinoa',
            pasta: 'Whole wheat pasta',
            sweetpotato: 'Sweet potato',
            bread: 'Whole grain bread',
            oatmeal: 'Steel-cut oats',
            whiterice: 'Jasmine rice',
            couscous: 'Couscous',
            barley: 'Pearl barley',
            buckwheat: 'Buckwheat'
        };
        return carbs[id] || 'Whole grains';
    }
    
    getVegetableName(id) {
        const vegetables = {
            broccoli: 'Steamed broccoli',
            spinach: 'Sautéed spinach',
            carrots: 'Roasted carrots',
            greens: 'Mixed green salad',
            peppers: 'Bell peppers',
            asparagus: 'Grilled asparagus',
            greenbeans: 'Green beans',
            cauliflower: 'Roasted cauliflower',
            zucchini: 'Grilled zucchini',
            brussels: 'Brussels sprouts'
        };
        return vegetables[id] || 'Seasonal vegetables';
    }
}

// Export for module use
export default AIMealPlan;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.aiMealPlan = new AIMealPlan();
        window.aiMealPlan.init();
    });
} else {
    window.aiMealPlan = new AIMealPlan();
    window.aiMealPlan.init();
}