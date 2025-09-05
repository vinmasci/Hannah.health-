// AI Assistant Column for Meal Planner
// Beautiful purple gradient design matching ai-chat-simple

import AIService from '../services/ai-service.js';
import { OpenMojiService } from '../services/openmoji-service.js';
import { UserProfileManager } from './UserProfileManager.js';
import { RecipeProcessor } from './RecipeProcessor.js';
import { ChatUIManager } from './ChatUIManager.js';
import { AIMessageProcessor } from './AIMessageProcessor.js';
import { ActionExecutor } from './ActionExecutor.js';

class AIAssistantColumn {
    constructor() {
        this.aiService = new AIService();
        this.openMojiService = new OpenMojiService();
        this.conversationHistory = [];
        this.isProcessing = false;
        this.isMinimized = false;
        
        // Use extracted managers
        this.profileManager = new UserProfileManager();
        this.recipeProcessor = new RecipeProcessor();
        this.chatUI = new ChatUIManager();
        this.messageProcessor = new AIMessageProcessor(this.aiService);
        this.actionExecutor = new ActionExecutor();
        
        // Set dependencies
        this.actionExecutor.setDependencies(this.recipeProcessor);
        
        // Alias for backward compatibility
        this.userProfile = this.profileManager.userProfile;
    }
    
    createColumn() {
        const column = document.createElement('div');
        column.className = 'ai-assistant-column';
        column.innerHTML = `
            <div class="ai-column-header" onclick="aiAssistant.handleHeaderClick(event)">
                <div class="ai-header-gradient">
                    <div class="ai-header-top">
                        <div class="ai-header-content">
                            <span class="ai-icon">💬</span>
                            <div class="ai-text-content">
                                <h3>Hannah AI</h3>
                                <span class="ai-subtitle">Your Nutrition Coach</span>
                            </div>
                        </div>
                        <button class="btn-minimize-ai" onclick="aiAssistant.toggleMinimize(event)" title="Minimize">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 12H5"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
            
            <div class="ai-column-body">
                <div class="ai-chat-messages" id="ai-chat-messages">
                    <div class="ai-welcome-message">
                        <div class="hannah-avatar">H</div>
                        <div class="message-bubble">
                            <p><strong>Hi! I'm Hannah, your personal nutrition coach 👋</strong></p>
                            <p>I'm here to create a personalized meal plan that works for YOUR body and YOUR goals.</p>
                            <p>Whether you want to:</p>
                            <p style="margin-left: 20px;">
                            • Lose weight safely<br>
                            • Build muscle<br>
                            • Boost your energy<br>
                            • Manage a health condition<br>
                            • Or just eat healthier
                            </p>
                            <p>I'll ask you a few questions to understand your needs, then fill your meal planner with foods tailored specifically for you.</p>
                            <p><strong>Let's start simple - what's your main health goal right now?</strong></p>
                        </div>
                    </div>
                </div>
                
                <div class="ai-chat-input-area">
                    <input 
                        type="text" 
                        class="ai-text-input" 
                        id="ai-text-input"
                        placeholder="Type a message..."
                        onkeypress="if(event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); aiAssistant.handleUserInput(); }"
                    >
                    <button class="ai-send-btn" onclick="aiAssistant.handleUserInput()">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
        
        return column;
    }
    
    
    async handleUserInput() {
        // Step 1: Get and validate input
        const userText = this.getUserInput();
        if (!userText) return;
        
        // Step 2: Setup UI for processing
        const messagesAreaId = this.setupUIForProcessing(userText);
        
        try {
            // Step 3: Build context and process message
            const context = this.buildContext();
            const result = await this.messageProcessor.processUserMessage(userText, context);
            
            // Step 4: Handle the response
            await this.handleAIResponse(result, userText, messagesAreaId);
            
            // Step 5: Update conversation history
            this.updateConversationHistory(userText, result.cleanMessage || result.rawResponse.message);
            
        } catch (error) {
            this.handleError(error, messagesAreaId);
        }
        
        this.isProcessing = false;
    }
    
    // Get user input and clear the field
    getUserInput() {
        const input = document.getElementById('ai-text-input');
        const userText = input.value.trim();
        if (!userText || this.isProcessing) return null;
        input.value = '';
        return userText;
    }
    
    // Setup UI for message processing
    setupUIForProcessing(userText) {
        const messagesAreaId = 'ai-chat-messages';
        
        this.addMessage(userText, 'user', messagesAreaId);
        this.isProcessing = true;
        this.showTypingIndicator(messagesAreaId);
        
        return messagesAreaId;
    }
    
    // Build AI context
    buildContext() {
        return this.messageProcessor.buildAIContext(
            false,
            this.userProfile,
            this.conversationHistory,
            []
        );
    }
    
    // Handle the AI response
    async handleAIResponse(result, userText, messagesAreaId) {
        // Show search status if needed
        if (result.searchStatus) {
            this.showSearchStatus(result.searchStatus, messagesAreaId);
            await this.delay(1500);
        }
        
        // Simulate typing delay
        await this.delay(1000);
        this.hideTypingIndicator(messagesAreaId);
        
        // Handle recipe selection
        if (result.userIsChoosingRecipe) {
            const selectedUrl = this.messageProcessor.getSelectedRecipeUrl(userText);
            if (selectedUrl) {
                await this.processRecipeUrl(selectedUrl, userText, messagesAreaId);
            }
        }
        
        // Handle multiple recipes
        else if (result.recipeUrls.length > 1 && result.rawResponse.message.includes('recipe')) {
            this.addMessage("I found multiple recipes! Please tell me which one you'd like to add by saying something like 'add the first one' or 'add recipe 2' or just paste the URL of the one you want.", 'hannah', messagesAreaId);
        }
        
        // Handle single recipe auto-add
        else if (this.messageProcessor.shouldAutoAddRecipe(userText, result.recipeUrls, result.rawResponse.message)) {
            await this.processRecipeUrl(result.recipeUrls[0], userText, messagesAreaId);
        }
        
        // Execute actions
        if (result.actions.length > 0) {
            await this.actionExecutor.executeActions(result.actions);
        }
        
        // Show clean message
        if (result.cleanMessage) {
            this.addMessage(result.cleanMessage, 'hannah', messagesAreaId);
        } else if (result.actions.length === 0 && result.rawResponse.message) {
            this.addMessage(result.rawResponse.message, 'hannah', messagesAreaId);
        }
        
        // Check if meals were described but not added
        if (result.suggestedMeals && result.actions.length === 0) {
            this.addMessage("I've described some meals for you. Would you like me to actually add them to your planner? Just say 'yes' or 'add them'!", 'hannah', messagesAreaId);
        }
        
        // Always parse user stats from conversation
        this.parseUserStats(result.rawResponse.message);
    }
    
    // Update conversation history
    updateConversationHistory(userText, responseText) {
        this.conversationHistory.push(
            { role: 'user', content: userText },
            { role: 'assistant', content: responseText }
        );
    }
    
    // Handle errors
    handleError(error, messagesAreaId) {
        console.error('AI error:', error);
        this.hideTypingIndicator(messagesAreaId);
        this.addMessage("The meal planner service is currently unavailable. Please check your internet connection and try again later.", 'hannah', messagesAreaId);
    }
    
    
    async quickPlan() {
        this.addMessage("Quick meal plan!", 'user');
        
        // Show typing indicator
        this.showTypingIndicator();
        await this.delay(500);
        this.hideTypingIndicator();
        
        // Add message
        this.addMessage("BAM! Full day of balanced meals coming right up! 🎯", 'hannah');
        
        // Add comprehensive meals for the whole day
        const meals = [
            // Breakfast
            { food: "Protein Oatmeal Bowl", day: "monday", meal: "breakfast", quantity: 350, unit: "g", custom: true, kcal: 420, protein: 22, carbs: 58, fat: 12, cost: 3.50 },
            // Morning Snack
            { food: "Greek Yogurt Parfait", day: "monday", meal: "morning snack", quantity: 200, unit: "g", custom: true, kcal: 180, protein: 15, carbs: 24, fat: 4, cost: 2.50 },
            // Lunch
            { food: "Grilled Chicken Caesar Wrap", day: "monday", meal: "lunch", quantity: 300, unit: "g", custom: true, kcal: 480, protein: 38, carbs: 42, fat: 18, cost: 6.50 },
            // Afternoon Snack
            { food: "Apple", day: "monday", meal: "afternoon snack", quantity: 1, unit: "medium" },
            { food: "Almond Butter", day: "monday", meal: "afternoon snack", quantity: 1, unit: "tbsp" },
            // Dinner
            { food: "Teriyaki Salmon", day: "monday", meal: "dinner", quantity: 180, unit: "g", custom: true, kcal: 380, protein: 32, carbs: 18, fat: 20, cost: 8.50 },
            { food: "Quinoa", day: "monday", meal: "dinner", quantity: 100, unit: "g" },
            { food: "Roasted Vegetables", day: "monday", meal: "dinner", quantity: 150, unit: "g", custom: true, kcal: 80, protein: 3, carbs: 16, fat: 2, cost: 2.00 },
            // Evening Snack
            { food: "Dark Chocolate Protein Bites", day: "monday", meal: "evening snack", quantity: 40, unit: "g", custom: true, kcal: 140, protein: 8, carbs: 14, fat: 6, cost: 2.00 }
        ];
        
        for (const meal of meals) {
            await this.addFoodToPlanner(meal);
            await this.delay(150); // Faster adds for immediate gratification
        }
    }
    
    async askForHelp() {
        this.addMessage("I need meal ideas", 'user');
        
        // Show typing indicator
        this.showTypingIndicator();
        await this.delay(1000);
        this.hideTypingIndicator();
        
        // Add creative meal suggestions
        this.addMessage("Here are some creative meal ideas I can add for you! 🌟", 'hannah');
        
        // Create custom meal cards
        const ideasHTML = `
            <div class="meal-ideas-grid">
                <div class="meal-idea-card" onclick="aiAssistant.addCustomMeal('power-bowl')">
                    <div class="meal-idea-name">🥗 Power Buddha Bowl</div>
                    <div class="meal-idea-macros">520 kcal • 22g P • 58g C • 24g F</div>
                </div>
                <div class="meal-idea-card" onclick="aiAssistant.addCustomMeal('protein-pancakes')">
                    <div class="meal-idea-name">🥞 Protein Pancakes</div>
                    <div class="meal-idea-macros">380 kcal • 32g P • 42g C • 8g F</div>
                </div>
                <div class="meal-idea-card" onclick="aiAssistant.addCustomMeal('energy-smoothie')">
                    <div class="meal-idea-name">🥤 Energy Boost Smoothie</div>
                    <div class="meal-idea-macros">320 kcal • 25g P • 38g C • 10g F</div>
                </div>
                <div class="meal-idea-card" onclick="aiAssistant.addCustomMeal('mediterranean-wrap')">
                    <div class="meal-idea-name">🌯 Mediterranean Wrap</div>
                    <div class="meal-idea-macros">450 kcal • 28g P • 45g C • 18g F</div>
                </div>
            </div>
        `;
        
        const messagesArea = document.getElementById('ai-chat-messages');
        const ideaDiv = document.createElement('div');
        ideaDiv.className = 'ai-message hannah';
        ideaDiv.innerHTML = `
            <div class="hannah-avatar">H</div>
            <div class="message-bubble">${ideasHTML}</div>
        `;
        messagesArea.appendChild(ideaDiv);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
    
    async addCustomMeal(mealType) {
        const customMeals = {
            'power-bowl': {
                name: "Power Buddha Bowl",
                items: [
                    { food: "Rainbow Buddha Bowl", day: "monday", meal: "lunch", quantity: 400, unit: "g", custom: true, kcal: 520, protein: 22, carbs: 58, fat: 24, cost: 6.50 }
                ]
            },
            'protein-pancakes': {
                name: "Protein Pancakes",
                items: [
                    { food: "Protein Pancakes with Berries", day: "monday", meal: "breakfast", quantity: 200, unit: "g", custom: true, kcal: 380, protein: 32, carbs: 42, fat: 8, cost: 4.00 }
                ]
            },
            'energy-smoothie': {
                name: "Energy Boost Smoothie",
                items: [
                    { food: "Green Energy Smoothie", day: "monday", meal: "morning snack", quantity: 400, unit: "ml", custom: true, kcal: 320, protein: 25, carbs: 38, fat: 10, cost: 5.50 }
                ]
            },
            'mediterranean-wrap': {
                name: "Mediterranean Wrap",
                items: [
                    { food: "Mediterranean Chicken Wrap", day: "monday", meal: "lunch", quantity: 250, unit: "g", custom: true, kcal: 450, protein: 28, carbs: 45, fat: 18, cost: 5.00 }
                ]
            }
        };
        
        const meal = customMeals[mealType];
        if (!meal) return;
        
        this.addMessage(`Adding ${meal.name} to your planner! ✨`, 'hannah');
        
        for (const item of meal.items) {
            await this.addFoodToPlanner(item);
            await this.delay(200);
        }
    }
    
    addMessage(text, sender, messagesAreaId = 'ai-chat-messages') {
        return this.chatUI.addMessage(text, sender, messagesAreaId);
    }
    showTypingIndicator(messagesAreaId = 'ai-chat-messages') {
        return this.chatUI.showTypingIndicator(messagesAreaId);
    }
    hideTypingIndicator(messagesAreaId = 'ai-chat-messages') {
        return this.chatUI.hideTypingIndicator(messagesAreaId);
    }
    showSearchStatus(status, messagesAreaId = 'ai-chat-messages') {
        return this.chatUI.showSearchStatus(status, messagesAreaId);
    }
    delay(ms) {
        return this.chatUI.delay(ms);
    }
    async processRecipeUrl(recipeUrl, userText, messagesAreaId) {
        return this.recipeProcessor.processRecipeUrl(
            recipeUrl, 
            userText,
            (text, sender) => this.addMessage(text, sender, messagesAreaId),
            (status) => this.showSearchStatus(status, messagesAreaId)
        );
    }
    parseUserStats(message) {
        const profile = this.profileManager.parseUserStats(message);
        this.userProfile = profile; // Keep in sync
        return profile;
    }
    updateStatsDisplay() {
        return this.profileManager.updateStatsDisplay();
    }
    async clearMeal(day, meal) {
        return this.actionExecutor.clearMeal(day, meal);
    }
    
    async _clearMealOld(day, meal) {
        try {
            // Find the day column
            const dayColumn = document.querySelector(`.day-column[data-day="${day}"]`);
            if (!dayColumn) {
                console.warn(`Day column not found: ${day}`);
                return;
            }
            
            // Find the meal
            const mealName = meal.toLowerCase().replace(/[-_]/g, ' ');
            const meals = dayColumn.querySelectorAll('.meal');
            
            for (const mealEl of meals) {
                const mealNameEl = mealEl.querySelector('.meal-name');
                if (mealNameEl) {
                    const currentMealName = mealNameEl.textContent.toLowerCase();
                    if (currentMealName.includes(mealName) || 
                        (mealName === 'morning snack' && currentMealName.includes('morning') && currentMealName.includes('snack')) ||
                        (mealName === 'afternoon snack' && currentMealName.includes('afternoon') && currentMealName.includes('snack')) ||
                        (mealName === 'evening snack' && currentMealName.includes('evening') && currentMealName.includes('snack'))) {
                        
                        // Clear all food modules from this meal
                        const modules = mealEl.querySelectorAll('.food-module');
                        modules.forEach(module => {
                            module.style.animation = 'fadeOutScale 0.3s ease';
                            setTimeout(() => module.remove(), 300);
                        });
                        
                        // Update totals after a delay
                        setTimeout(() => {
                            if (window.updateMealTotals) {
                                window.updateMealTotals(mealEl);
                            }
                            if (window.updateDayTotals) {
                                window.updateDayTotals(dayColumn);
                            }
                        }, 350);
                        
                        break;
                    }
                }
            }
        } catch (error) {
            console.error('Error clearing meal:', error);
        }
    }
    
    async clearDay(day) {
        return this.actionExecutor.clearDay(day);
    }
    
    async _clearDayOld(day) {
        try {
            // Find the day column
            const dayColumn = document.querySelector(`.day-column[data-day="${day}"]`);
            if (!dayColumn) {
                console.warn(`Day column not found: ${day}`);
                return;
            }
            
            // Clear all food modules from all meals
            const modules = dayColumn.querySelectorAll('.food-module');
            modules.forEach(module => {
                module.style.animation = 'fadeOutScale 0.3s ease';
                setTimeout(() => module.remove(), 300);
            });
            
            // Update totals after a delay
            setTimeout(() => {
                const meals = dayColumn.querySelectorAll('.meal');
                meals.forEach(meal => {
                    if (window.updateMealTotals) {
                        window.updateMealTotals(meal);
                    }
                });
                if (window.updateDayTotals) {
                    window.updateDayTotals(dayColumn);
                }
            }, 350);
            
        } catch (error) {
            console.error('Error clearing day:', error);
        }
    }
    
    async addRecipeToPlanner(recipeData) {
        return this.recipeProcessor.addRecipeToPlanner(recipeData);
    }
    
    
    async addFoodToPlanner(item) {
        return this.actionExecutor.addFoodToPlanner(item);
    }
    
    async _addFoodToPlannerOld(item) {
        try {
            // Find the day column
            const dayColumn = document.querySelector(`.day-column[data-day="${item.day}"]`);
            if (!dayColumn) {
                console.warn(`Day column not found: ${item.day}`);
                return;
            }
            
            // Find the meal by matching meal name
            const mealName = item.meal.toLowerCase().replace(/[-_]/g, ' ');
            const meals = dayColumn.querySelectorAll('.meal');
            let targetMeal = null;
            
            for (const meal of meals) {
                const mealNameEl = meal.querySelector('.meal-name');
                if (mealNameEl) {
                    const currentMealName = mealNameEl.textContent.toLowerCase();
                    // Check if the meal name contains our target meal
                    if (currentMealName.includes(mealName) || 
                        (mealName === 'morning snack' && currentMealName.includes('morning') && currentMealName.includes('snack')) ||
                        (mealName === 'afternoon snack' && currentMealName.includes('afternoon') && currentMealName.includes('snack')) ||
                        (mealName === 'evening snack' && currentMealName.includes('evening') && currentMealName.includes('snack'))) {
                        targetMeal = meal;
                        break;
                    }
                }
            }
            
            if (!targetMeal) {
                console.warn(`Meal not found: ${item.meal} on ${item.day}`);
                return;
            }
            
            // Check if this is a custom item
            let foodData;
            if (item.custom) {
                // Create custom food item with AI-provided nutrition
                foodData = {
                    name: item.food,
                    category: this.categorizeFood(item.food, item.protein, item.carbs, item.fat),
                    baseQuantity: item.quantity || 100,
                    baseUnit: item.unit || 'g',
                    kcal: item.kcal || 200,
                    protein: item.protein || 10,
                    carbs: item.carbs || 20,
                    fat: item.fat || 5,
                    cost: item.cost || 3.00,
                    custom: true
                };
            } else {
                // Look up the food in our database
                foodData = this.findFoodInDatabase(item.food);
                if (!foodData) {
                    // If not found, create a basic custom item
                    foodData = {
                        name: item.food,
                        category: 'extras',
                        baseQuantity: item.quantity || 100,
                        baseUnit: item.unit || 'g',
                        kcal: 200,
                        protein: 10,
                        carbs: 20,
                        fat: 5,
                        cost: 3.00,
                        custom: true
                    };
                }
            }
            
            // Create the food module data
            // Use the item's quantity if provided, otherwise use the food's base quantity
            const dragData = {
                food: foodData,
                quantity: item.quantity !== undefined ? item.quantity : foodData.baseQuantity,
                unit: item.unit || foodData.baseUnit
            };
            
            // Get the modules container
            const modulesContainer = targetMeal.querySelector('.food-modules-container');
            if (!modulesContainer) {
                console.warn('Modules container not found');
                return;
            }
            
            // Create and add the food module
            const module = this.createFoodModule(dragData);
            modulesContainer.appendChild(module);
            
            // Update meal and day totals
            if (window.updateMealTotals) {
                window.updateMealTotals(targetMeal);
            }
            if (window.updateDayTotals) {
                window.updateDayTotals(dayColumn);
            }
            
            // Add a little animation
            module.classList.add('animate-in');
            
        } catch (error) {
            console.error('Error adding food to planner:', error);
        }
    }
    
    categorizeFood(foodName, protein, carbs, fat) {
        // Smart categorization based on name and macros
        const name = foodName.toLowerCase();
        
        // Check by name patterns
        if (name.includes('smoothie') || name.includes('shake') || name.includes('juice')) return 'drinks';
        if (name.includes('chicken') || name.includes('beef') || name.includes('fish') || name.includes('turkey') || name.includes('salmon')) return 'protein';
        if (name.includes('salad') || name.includes('veggie') || name.includes('vegetable')) return 'veg';
        if (name.includes('fruit') || name.includes('berry') || name.includes('apple') || name.includes('banana')) return 'fruit';
        if (name.includes('rice') || name.includes('pasta') || name.includes('bread') || name.includes('oat')) return 'grains';
        if (name.includes('yogurt') || name.includes('cheese') || name.includes('milk')) return 'dairy';
        if (name.includes('cookie') || name.includes('cake') || name.includes('dessert') || name.includes('chocolate')) return 'sweets';
        
        // Check by macro distribution
        const total = protein + carbs + fat;
        if (total > 0) {
            const proteinPercent = (protein * 4) / (protein * 4 + carbs * 4 + fat * 9);
            const carbPercent = (carbs * 4) / (protein * 4 + carbs * 4 + fat * 9);
            const fatPercent = (fat * 9) / (protein * 4 + carbs * 4 + fat * 9);
            
            if (proteinPercent > 0.4) return 'protein';
            if (carbPercent > 0.6) return 'carbs';
            if (fatPercent > 0.5) return 'nuts';
        }
        
        return 'extras';
    }
    
    findFoodInDatabase(foodName) {
        return this.recipeProcessor.findFoodInDatabase(foodName);
    }
    
    
    createFoodModule(dragData) {
        return this.recipeProcessor.createFoodModule(dragData);
    }
    
    // Toggle minimize/maximize
    toggleMinimize(event) {
        if (event) {
            event.stopPropagation();
        }
        
        this.isMinimized = !this.isMinimized;
        const column = document.querySelector('.ai-assistant-column');
        
        if (this.isMinimized) {
            column.classList.add('minimized');
        } else {
            column.classList.remove('minimized');
        }
    }
    
    // Handle header click
    handleHeaderClick(event) {
        // Only expand if minimized
        if (this.isMinimized) {
            this.toggleMinimize();
        }
    }
    
    loadUserProfile() {
        this.profileManager.loadProfile();
        this.userProfile = this.profileManager.userProfile; // Keep in sync
    }
    saveUserProfile() {
        this.profileManager.saveProfile();
        this.userProfile = this.profileManager.userProfile; // Keep in sync
    }
    calculateBasicStats() {
        this.profileManager.calculateBasicStats();
        this.userProfile = this.profileManager.userProfile; // Keep in sync
    }
    async analyzeProfile() {
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        
        // Show the analysis section
        document.getElementById('ai-analysis').style.display = 'grid';
        
        // Show loading state
        const summaryEl = document.getElementById('analysis-summary');
        summaryEl.innerHTML = '<div style="text-align: center;">🤖 Analyzing your profile...</div>';
        
        // Build a comprehensive prompt for AI analysis
        const prompt = `Analyze this user profile and calculate their ideal daily calories and macros:
        
        Goal: ${profile.goal || 'Not specified'}
        Physical Stats: ${profile.weight}kg, ${profile.height}cm, Age ${profile.age}, ${profile.gender}
        Lifestyle: ${profile.lifestyle || 'Not specified'}
        Health Conditions: ${profile.health || 'None specified'}
        Typical Diet: ${profile.typicalDiet || 'Not specified'}
        Challenges: ${profile.challenges || 'Not specified'}
        
        Based on this information:
        1. Calculate their TDEE considering their described activity level
        2. Recommend daily calories based on their goal
        3. Suggest macro split (protein/carbs/fat)
        4. Provide 2-3 specific recommendations for their situation
        
        Format the response clearly with numbers and bullet points.`;
        
        try {
            // Call the AI API
            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: prompt,
                    context: {
                        systemPrompt: 'You are a professional nutritionist analyzing a client profile. Provide specific, actionable advice based on their goals and lifestyle.'
                    }
                })
            });
            
            if (!response.ok) throw new Error('AI analysis failed');
            
            const data = await response.json();
            
            // Parse the AI response to extract numbers
            const aiText = data.message;
            
            // Try to extract TDEE and target calories from the response
            const tdeeMatch = aiText.match(/TDEE[:\s]+(\d+)/i);
            const targetMatch = aiText.match(/(?:recommend|target|daily calories)[:\s]+(\d+)/i);
            
            if (tdeeMatch) {
                document.getElementById('calc-tdee').textContent = tdeeMatch[1] + ' kcal';
            }
            
            if (targetMatch) {
                document.getElementById('calc-target').textContent = targetMatch[1] + ' kcal';
            }
            
            // Display the full analysis
            summaryEl.innerHTML = `
                <h5 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">Personalized Analysis</h5>
                <div style="white-space: pre-line;">${aiText}</div>
            `;
            
        } catch (error) {
            console.error('Profile analysis error:', error);
            summaryEl.innerHTML = '<div style="color: rgba(255,255,255,0.8);">Unable to analyze profile. Please try again.</div>';
        }
    }
}

// Create global instance
window.aiAssistant = new AIAssistantColumn();

// Export for module use
export default AIAssistantColumn;