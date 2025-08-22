// AI Assistant Column for Meal Planner
// Beautiful purple gradient design matching ai-chat-simple

import AIService from '../services/ai-service.js';
import { OpenMojiService } from '../services/openmoji-service.js';

class AIAssistantColumn {
    constructor() {
        this.aiService = new AIService();
        this.openMojiService = new OpenMojiService();
        this.conversationHistory = [];
        this.aboutMeHistory = [];
        this.isProcessing = false;
        this.activeTab = 'meal-planner';
        this.isMinimized = false;
        this.userProfile = {
            age: null,
            weight: null,
            height: null,
            activityLevel: null,
            goals: null,
            restrictions: null,
            tdee: null
        };
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
                                <span class="ai-subtitle">Your Meal Assistant</span>
                            </div>
                        </div>
                        <button class="btn-minimize-ai" onclick="aiAssistant.toggleMinimize(event)" title="Minimize">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M19 12H5"/>
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="ai-tabs">
                    <button class="ai-tab active" data-tab="meal-planner" onclick="aiAssistant.switchTab('meal-planner')">
                        <img src="${this.openMojiService.getEmojiUrl('1F37D')}" width="20" height="20" class="openmoji-icon" alt="meal"> Meal Planner
                    </button>
                    <button class="ai-tab" data-tab="about-me" onclick="aiAssistant.switchTab('about-me')">
                        <img src="${this.openMojiService.getEmojiUrl('1F977')}" width="20" height="20" class="openmoji-icon" alt="ninja"> About Me
                    </button>
                </div>
            </div>
            
            <div class="ai-column-body">
                <div class="ai-tab-content" id="meal-planner-content">
                    <div class="ai-chat-messages" id="ai-chat-messages">
                        <div class="ai-welcome-message">
                            <div class="hannah-avatar">H</div>
                            <div class="message-bubble">
                                Hi! I'm Hannah, your meal planning assistant. How can I help you plan your meals today?
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="ai-tab-content" id="about-me-content" style="display: none;">
                    <div class="user-profile-form">
                        <div class="profile-section">
                            <h4>What's Your Goal?</h4>
                            <textarea id="user-goal" class="profile-textarea" placeholder="I want to lose 10kg for my wedding in 6 months..." onchange="aiAssistant.saveUserProfile()"></textarea>
                        </div>
                        
                        <div class="profile-section">
                            <h4>Physical Stats</h4>
                            <div class="profile-row-half">
                                <div class="profile-field">
                                    <label>Weight (kg)</label>
                                    <input type="number" id="user-weight" class="profile-input" placeholder="70" onchange="aiAssistant.saveUserProfile()">
                                </div>
                                <div class="profile-field">
                                    <label>Height (cm)</label>
                                    <input type="number" id="user-height" class="profile-input" placeholder="170" onchange="aiAssistant.saveUserProfile()">
                                </div>
                            </div>
                            <div class="profile-row-half">
                                <div class="profile-field">
                                    <label>Age</label>
                                    <input type="number" id="user-age" class="profile-input" placeholder="30" onchange="aiAssistant.saveUserProfile()">
                                </div>
                                <div class="profile-field">
                                    <label>Gender</label>
                                    <select id="user-gender" class="profile-input" onchange="aiAssistant.saveUserProfile()">
                                        <option value="">Select...</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="non-binary">Non-binary</option>
                                        <option value="other">Other</option>
                                        <option value="prefer-not-to-say">Prefer not to say</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        <div class="profile-section">
                            <h4>Describe Your Lifestyle</h4>
                            <textarea id="user-lifestyle" class="profile-textarea" placeholder="Office worker during the week, gym 3 times after work. Ride bikes on weekends with family. Usually walk the dog twice a day..." onchange="aiAssistant.saveUserProfile()"></textarea>
                        </div>
                        
                        <div class="profile-section">
                            <h4>Any Health Conditions or Dietary Restrictions?</h4>
                            <textarea id="user-health" class="profile-textarea" placeholder="Type 2 diabetes, lactose intolerant, trying to lower cholesterol..." onchange="aiAssistant.saveUserProfile()"></textarea>
                        </div>
                        
                        <div class="profile-section">
                            <h4>What Does a Typical Day of Eating Look Like?</h4>
                            <textarea id="user-typical-diet" class="profile-textarea" placeholder="Usually skip breakfast, coffee with milk. Sandwich for lunch. Dinner is usually meat and vegetables. Snack on chocolate in the afternoon..." onchange="aiAssistant.saveUserProfile()"></textarea>
                        </div>
                        
                        <div class="profile-section">
                            <h4>Biggest Challenges?</h4>
                            <textarea id="user-challenges" class="profile-textarea" placeholder="Late night snacking, weekend binge eating, no time for meal prep, hate vegetables..." onchange="aiAssistant.saveUserProfile()"></textarea>
                        </div>
                        
                        <div class="profile-section calculated-stats">
                            <h4>AI Analysis</h4>
                            <button class="analyze-profile-btn" onclick="aiAssistant.analyzeProfile()">
                                <span class="btn-icon">🤖</span>
                                Analyze My Profile
                            </button>
                            <div class="stats-display" id="ai-analysis" style="display: none;">
                                <div class="stat-card full-width">
                                    <span class="stat-label">Recommended Daily Calories</span>
                                    <span class="stat-value" id="calc-target">-</span>
                                </div>
                                <div class="stat-card">
                                    <span class="stat-label">BMI</span>
                                    <span class="stat-value" id="calc-bmi">-</span>
                                </div>
                                <div class="stat-card">
                                    <span class="stat-label">TDEE</span>
                                    <span class="stat-value" id="calc-tdee">-</span>
                                </div>
                                <div class="analysis-summary" id="analysis-summary">
                                    <!-- AI analysis will appear here -->
                                </div>
                            </div>
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
    
    switchTab(tabName) {
        // Update active tab
        this.activeTab = tabName;
        
        // Update tab buttons
        document.querySelectorAll('.ai-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });
        
        // Show/hide content
        document.getElementById('meal-planner-content').style.display = 
            tabName === 'meal-planner' ? 'flex' : 'none';
        document.getElementById('about-me-content').style.display = 
            tabName === 'about-me' ? 'flex' : 'none';
            
        // Update input area visibility
        const inputArea = document.querySelector('.ai-chat-input-area');
        if (tabName === 'about-me') {
            inputArea.style.display = 'none';
            this.loadUserProfile();
        } else {
            inputArea.style.display = 'flex';
            const input = document.getElementById('ai-text-input');
            input.placeholder = "Type a message...";
        }
    }
    
    async handleUserInput() {
        const input = document.getElementById('ai-text-input');
        const userText = input.value.trim();
        if (!userText || this.isProcessing) return;
        
        // Clear input
        input.value = '';
        
        // Determine which tab we're in
        const isAboutMe = this.activeTab === 'about-me';
        const messagesAreaId = isAboutMe ? 'about-me-messages' : 'ai-chat-messages';
        
        // Add user message to the appropriate chat
        this.addMessage(userText, 'user', messagesAreaId);
        
        // Process with AI
        this.isProcessing = true;
        this.showTypingIndicator(messagesAreaId);
        
        try {
            let context;
            
            if (isAboutMe) {
                // About Me context - for collecting user stats
                context = {
                    systemPrompt: `You are Hannah from Hannah.health. You're helping the user share their health information to create personalized meal plans.

Extract and remember these details when users share them:
- Age
- Weight (kg or lbs)
- Height (cm or ft/in)
- Activity level (sedentary, lightly active, moderately active, very active, extremely active)
- Goals (lose weight, gain muscle, maintain, etc.)
- Dietary restrictions (vegetarian, vegan, allergies, etc.)
- Daily steps or exercise routine

Calculate their TDEE when you have enough information.
Be conversational and encouraging. Ask follow-up questions to get complete information.
Store this information to use when creating meal plans.

Current user profile: ${JSON.stringify(this.userProfile)}`,
                    conversationHistory: this.aboutMeHistory.slice(-10)
                };
            } else {
                // Meal planner context - include user profile for personalization
                context = {
                systemPrompt: `You are Hannah from Hannah.health, a friendly and knowledgeable meal planning assistant.

IMPORTANT RULES:
1. You have full web search capabilities through Brave Search API
2. When users ask for recipes, you MUST search the web for real recipes with actual instructions and ingredients
3. NEVER make up or invent recipes - always search for and provide real recipes from actual websites
4. Include the source URL when sharing recipes so users can follow the full instructions
5. You CAN and DO search the web automatically for nutrition data, recipes, and food information

When adding meals to the planner, use this format:
**ACTION_START**
{
  "action": "add_meal",
  "items": [
    {"food": "Oatmeal", "day": "monday", "meal": "breakfast", "quantity": 60, "unit": "g"},
    {"food": "Banana", "day": "monday", "meal": "breakfast", "quantity": 1, "unit": "medium"},
    {"food": "Blueberries", "day": "monday", "meal": "breakfast", "quantity": 100, "unit": "g"},
    {"food": "Almond Butter", "day": "monday", "meal": "breakfast", "quantity": 15, "unit": "g"}
  ]
}
**ACTION_END**

Guidelines:
- Be conversational and friendly
- Create balanced, nutritious meals
- Include all components of a dish (protein, carbs, veggies, healthy fats)
- Use realistic portions: fruits/veg 1-2 pieces or 80-150g, proteins 100-200g, grains 50-100g
- Days: monday, tuesday, wednesday, thursday, friday, saturday, sunday
- Meals: breakfast, morning snack, lunch, afternoon snack, dinner, evening snack

When creating full day plans, add ALL meals in one response with multiple ACTION blocks if needed.`,
                    conversationHistory: this.conversationHistory.slice(-10)
                };
            }
            
            const response = await this.aiService.chat(userText, context);
            
            // Show search status if web search was performed
            if (response.searchStatus) {
                this.showSearchStatus(response.searchStatus, messagesAreaId);
                await this.delay(1500);
            }
            
            // Simulate typing delay
            await this.delay(1000);
            this.hideTypingIndicator(messagesAreaId);
            
            // Parse response for actions - can have multiple action blocks
            const actionMatches = response.message.matchAll(/\*\*ACTION_START\*\*([\s\S]*?)\*\*ACTION_END\*\*/g);
            let hasActions = false;
            
            for (const match of actionMatches) {
                hasActions = true;
                try {
                    const action = JSON.parse(match[1]);
                    
                    if (action.action === 'add_recipe') {
                        // Add a recipe with multiple items
                        await this.addRecipeToPlanner(action);
                    } else if (action.action === 'add_meal' && action.items) {
                        // Process each meal item
                        for (const item of action.items) {
                            await this.addFoodToPlanner(item);
                        }
                    } else if (action.action === 'clear_meal') {
                        // Clear a specific meal
                        await this.clearMeal(action.day, action.meal);
                    } else if (action.action === 'clear_day') {
                        // Clear an entire day
                        await this.clearDay(action.day);
                    }
                } catch (parseError) {
                    console.error('Failed to parse action:', parseError);
                }
            }
            
            // Show response without the action blocks
            const cleanMessage = response.message.replace(/\*\*ACTION_START\*\*[\s\S]*?\*\*ACTION_END\*\*/g, '').trim();
            if (cleanMessage) {
                this.addMessage(cleanMessage, 'hannah', messagesAreaId);
            } else if (!hasActions && response.message) {
                // Only show original message if no clean message and no actions
                this.addMessage(response.message, 'hannah', messagesAreaId);
            }
            
            // If in About Me tab, parse and store user stats
            if (isAboutMe) {
                this.parseUserStats(response.message);
                // Save to About Me history
                this.aboutMeHistory.push(
                    { role: 'user', content: userText },
                    { role: 'assistant', content: cleanMessage || response.message }
                );
            } else {
                // Save to conversation history with proper format for API
                this.conversationHistory.push(
                    { role: 'user', content: userText },
                    { role: 'assistant', content: cleanMessage || response.message }
                );
            }
            
        } catch (error) {
            console.error('AI error:', error);
            this.hideTypingIndicator(messagesAreaId);
            this.addMessage("I'm having trouble connecting right now. Please try again in a moment.", 'hannah', messagesAreaId);
        }
        
        this.isProcessing = false;
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
        const messagesArea = document.getElementById(messagesAreaId);
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${sender}`;
        
        // Convert URLs to clickable links
        let formattedText = text.replace(
            /(https?:\/\/[^\s<]+)/g,
            '<a href="$1" target="_blank" rel="noopener noreferrer" class="chat-link">$1</a>'
        );
        
        // Convert line breaks and format lists
        formattedText = formattedText
            .replace(/\n\n/g, '</p><p>')  // Double line breaks to paragraphs
            .replace(/\n/g, '<br>')        // Single line breaks to <br>
            .replace(/^- /gm, '• ')        // Convert dashes to bullets
            .replace(/^\d+\. /gm, match => `<strong>${match}</strong>`); // Bold numbered lists
        
        // Wrap in paragraph if not already
        if (!formattedText.includes('<p>')) {
            formattedText = `<p>${formattedText}</p>`;
        }
        
        if (sender === 'hannah') {
            messageDiv.innerHTML = `
                <div class="hannah-avatar">H</div>
                <div class="message-bubble">${formattedText}</div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-bubble">${formattedText}</div>
            `;
        }
        
        messagesArea.appendChild(messageDiv);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
    
    showTypingIndicator(messagesAreaId = 'ai-chat-messages') {
        const messagesArea = document.getElementById(messagesAreaId);
        const typing = document.createElement('div');
        typing.className = 'ai-typing-indicator';
        typing.id = `ai-typing-${messagesAreaId}`;
        typing.innerHTML = `
            <div class="hannah-avatar">H</div>
            <div class="typing-dots">
                <span></span><span></span><span></span>
            </div>
        `;
        messagesArea.appendChild(typing);
        messagesArea.scrollTop = messagesArea.scrollHeight;
    }
    
    hideTypingIndicator(messagesAreaId = 'ai-chat-messages') {
        const typing = document.getElementById(`ai-typing-${messagesAreaId}`);
        if (typing) typing.remove();
    }
    
    showSearchStatus(status, messagesAreaId = 'ai-chat-messages') {
        const messagesArea = document.getElementById(messagesAreaId);
        const searchStatus = document.createElement('div');
        searchStatus.className = 'ai-search-status';
        searchStatus.innerHTML = `
            <div class="search-status-content">
                <span class="search-icon">🔍</span>
                <span class="search-text">${status}</span>
            </div>
        `;
        messagesArea.appendChild(searchStatus);
        messagesArea.scrollTop = messagesArea.scrollHeight;
        
        // Auto-remove after a delay
        setTimeout(() => {
            searchStatus.style.animation = 'fadeOut 0.5s ease';
            setTimeout(() => searchStatus.remove(), 500);
        }, 2000);
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    parseUserStats(message) {
        // Try to extract user stats from AI response
        const lowerMessage = message.toLowerCase();
        
        // Parse age
        const ageMatch = lowerMessage.match(/(\d+)\s*(?:years?\s*old|yo)/);
        if (ageMatch) {
            this.userProfile.age = parseInt(ageMatch[1]);
        }
        
        // Parse weight
        const weightMatch = lowerMessage.match(/(\d+(?:\.\d+)?)\s*(?:kg|kilograms?|lbs?|pounds?)/);
        if (weightMatch) {
            this.userProfile.weight = parseFloat(weightMatch[1]);
            this.userProfile.weightUnit = lowerMessage.includes('kg') ? 'kg' : 'lbs';
        }
        
        // Parse height
        const heightMatch = lowerMessage.match(/(\d+(?:\.\d+)?)\s*(?:cm|centimeters?|ft|feet|')/);
        if (heightMatch) {
            this.userProfile.height = parseFloat(heightMatch[1]);
            this.userProfile.heightUnit = lowerMessage.includes('cm') ? 'cm' : 'ft';
        }
        
        // Parse activity level
        if (lowerMessage.includes('sedentary')) this.userProfile.activityLevel = 'sedentary';
        else if (lowerMessage.includes('lightly active')) this.userProfile.activityLevel = 'lightly active';
        else if (lowerMessage.includes('moderately active')) this.userProfile.activityLevel = 'moderately active';
        else if (lowerMessage.includes('very active')) this.userProfile.activityLevel = 'very active';
        else if (lowerMessage.includes('extremely active')) this.userProfile.activityLevel = 'extremely active';
        
        // Parse goals
        if (lowerMessage.includes('lose weight') || lowerMessage.includes('weight loss')) {
            this.userProfile.goals = 'weight loss';
        } else if (lowerMessage.includes('gain muscle') || lowerMessage.includes('bulk')) {
            this.userProfile.goals = 'muscle gain';
        } else if (lowerMessage.includes('maintain')) {
            this.userProfile.goals = 'maintain';
        }
        
        // Update display if we have stats
        this.updateStatsDisplay();
    }
    
    updateStatsDisplay() {
        const statsDiv = document.getElementById('user-stats');
        if (this.userProfile.age || this.userProfile.weight || this.userProfile.height) {
            statsDiv.style.display = 'block';
            
            document.getElementById('stat-age').textContent = this.userProfile.age || '-';
            document.getElementById('stat-weight').textContent = 
                this.userProfile.weight ? `${this.userProfile.weight} ${this.userProfile.weightUnit || 'kg'}` : '-';
            document.getElementById('stat-height').textContent = 
                this.userProfile.height ? `${this.userProfile.height} ${this.userProfile.heightUnit || 'cm'}` : '-';
            document.getElementById('stat-activity').textContent = this.userProfile.activityLevel || '-';
            document.getElementById('stat-goal').textContent = this.userProfile.goals || '-';
            document.getElementById('stat-tdee').textContent = 
                this.userProfile.tdee ? `${this.userProfile.tdee} kcal` : '-';
        }
    }
    
    async clearMeal(day, meal) {
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
        try {
            // Find the day column
            const dayColumn = document.querySelector(`.day-column[data-day="${recipeData.day}"]`);
            if (!dayColumn) {
                console.warn(`Day column not found: ${recipeData.day}`);
                return;
            }
            
            // Find the meal
            const mealName = recipeData.meal.toLowerCase().replace(/[-_]/g, ' ');
            const meals = dayColumn.querySelectorAll('.meal');
            let targetMeal = null;
            
            for (const meal of meals) {
                const mealNameEl = meal.querySelector('.meal-name');
                if (mealNameEl) {
                    const currentMealName = mealNameEl.textContent.toLowerCase();
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
                console.warn(`Meal not found: ${recipeData.meal} on ${recipeData.day}`);
                return;
            }
            
            // Get the recipes container
            const recipesContainer = targetMeal.querySelector('.recipes-container');
            if (!recipesContainer) {
                console.warn('Recipes container not found');
                return;
            }
            
            // Create the recipe container
            const recipeContainer = window.createRecipeContainer(recipeData.recipe_name);
            recipesContainer.appendChild(recipeContainer);
            
            // Add each ingredient to the recipe
            const recipeModulesContainer = recipeContainer.querySelector('.recipe-modules-container');
            for (const item of recipeData.items) {
                // Look up or create food data
                let foodData;
                if (item.custom) {
                    foodData = {
                        name: item.food,
                        category: this.categorizeFood(item.food, item.protein || 0, item.carbs || 0, item.fat || 0),
                        baseQuantity: item.quantity || 100,
                        baseUnit: item.unit || 'g',
                        kcal: item.kcal || 100,
                        protein: item.protein || 5,
                        carbs: item.carbs || 10,
                        fat: item.fat || 3,
                        cost: item.cost || 2.00,
                        custom: true
                    };
                } else {
                    foodData = this.findFoodInDatabase(item.food);
                    if (!foodData) {
                        // Create basic item if not found
                        foodData = {
                            name: item.food,
                            category: 'extras',
                            baseQuantity: 100,
                            baseUnit: 'g',
                            kcal: 100,
                            protein: 5,
                            carbs: 10,
                            fat: 3,
                            cost: 2.00,
                            custom: true
                        };
                    }
                }
                
                // Create the food module
                // Use the item's quantity if provided, otherwise use the food's base quantity
                const dragData = {
                    food: foodData,
                    quantity: item.quantity !== undefined ? item.quantity : foodData.baseQuantity,
                    unit: item.unit || foodData.baseUnit
                };
                
                const module = this.createFoodModule(dragData);
                recipeModulesContainer.appendChild(module);
            }
            
            // Update all totals
            if (window.updateRecipeTotals) {
                window.updateRecipeTotals(recipeContainer);
            }
            if (window.updateMealTotals) {
                window.updateMealTotals(targetMeal);
            }
            if (window.updateDayTotals) {
                window.updateDayTotals(dayColumn);
            }
            
            // Add animation
            recipeContainer.classList.add('animate-in');
            
        } catch (error) {
            console.error('Error adding recipe to planner:', error);
        }
    }
    
    async addFoodToPlanner(item) {
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
        // Access the global food database from app.js
        if (!window.foodDatabase) {
            console.warn('Food database not available');
            return null;
        }
        
        const searchName = foodName.toLowerCase();
        
        // Search through all categories
        for (const category in window.foodDatabase) {
            const foods = window.foodDatabase[category];
            if (Array.isArray(foods)) {
                const found = foods.find(food => 
                    food.name.toLowerCase() === searchName ||
                    food.name.toLowerCase().includes(searchName) ||
                    searchName.includes(food.name.toLowerCase())
                );
                if (found) {
                    return { ...found, category };
                }
            }
        }
        
        // If not found, create a basic food item
        return {
            name: foodName,
            category: 'extras',
            baseQuantity: 100,
            baseUnit: 'g',
            kcal: 100,
            protein: 5,
            carbs: 10,
            fat: 3,
            cost: 2.00
        };
    }
    
    createFoodModule(dragData) {
        // Use the global createFoodModule function if available
        if (window.createFoodModule) {
            return window.createFoodModule(dragData);
        }
        
        // Fallback: create a simple module
        const module = document.createElement('div');
        const category = dragData.food.category || 'default';
        module.className = `food-module food-module-${category} animate-in`;
        module.draggable = true;
        
        const moduleId = `module-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const food = dragData.food;
        const quantity = dragData.quantity;
        const unit = dragData.unit;
        
        // Calculate macros based on portion
        const ratio = quantity / food.baseQuantity;
        
        const moduleData = {
            id: moduleId,
            name: food.name,
            category: food.category,
            quantity: quantity,
            unit: unit,
            baseFood: food,
            kcal: Math.round(food.kcal * ratio),
            protein: food.protein * ratio,
            carbs: food.carbs * ratio,
            fat: food.fat * ratio,
            cost: food.cost * ratio
        };
        
        module.innerHTML = `
            <div class="module-header">
                <div class="module-name">${food.custom ? '✨ ' : ''}${food.name}</div>
                <div class="module-actions">
                    <button class="remove-module" onclick="removeModule('${moduleId}')">×</button>
                </div>
            </div>
            <div class="module-controls">
                <input type="number" class="module-portion-input" value="${quantity}" min="1" step="1" data-module-id="${moduleId}">
                <select class="module-unit-select" data-module-id="${moduleId}">
                    <option value="${unit}">${unit}</option>
                </select>
            </div>
            <div class="module-macros">
                <div class="macro-stats">
                    <span class="macro kcal">${moduleData.kcal} kcal</span>
                    <span class="macro">P: ${moduleData.protein.toFixed(1)}g</span>
                    <span class="macro">C: ${moduleData.carbs.toFixed(1)}g</span>
                    <span class="macro">F: ${moduleData.fat.toFixed(1)}g</span>
                </div>
            </div>
        `;
        
        module.dataset.moduleId = moduleId;
        module.dataset.module = JSON.stringify(moduleData);
        
        return module;
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
        // Load saved profile from localStorage
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        
        // Populate form fields
        if (profile.goal) document.getElementById('user-goal').value = profile.goal;
        if (profile.weight) document.getElementById('user-weight').value = profile.weight;
        if (profile.height) document.getElementById('user-height').value = profile.height;
        if (profile.age) document.getElementById('user-age').value = profile.age;
        if (profile.gender) document.getElementById('user-gender').value = profile.gender;
        if (profile.lifestyle) document.getElementById('user-lifestyle').value = profile.lifestyle;
        if (profile.health) document.getElementById('user-health').value = profile.health;
        if (profile.typicalDiet) document.getElementById('user-typical-diet').value = profile.typicalDiet;
        if (profile.challenges) document.getElementById('user-challenges').value = profile.challenges;
        
        // Calculate basic stats if we have the numbers
        if (profile.weight && profile.height) {
            this.calculateBasicStats();
        }
    }
    
    saveUserProfile() {
        // Gather all form data
        const profile = {
            goal: document.getElementById('user-goal').value,
            weight: parseFloat(document.getElementById('user-weight').value) || 0,
            height: parseFloat(document.getElementById('user-height').value) || 0,
            age: parseInt(document.getElementById('user-age').value) || 0,
            gender: document.getElementById('user-gender').value,
            lifestyle: document.getElementById('user-lifestyle').value,
            health: document.getElementById('user-health').value,
            typicalDiet: document.getElementById('user-typical-diet').value,
            challenges: document.getElementById('user-challenges').value
        };
        
        // Save to localStorage
        localStorage.setItem('userProfile', JSON.stringify(profile));
        
        // Recalculate basic stats if we have the numbers
        if (profile.weight && profile.height) {
            this.calculateBasicStats();
        }
    }
    
    calculateBasicStats() {
        const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        
        if (profile.weight && profile.height) {
            // Calculate BMI
            const heightInM = profile.height / 100;
            const bmi = profile.weight / (heightInM * heightInM);
            document.getElementById('calc-bmi').textContent = bmi.toFixed(1);
            
            // Store basic stats
            this.userStats = {
                bmi,
                profile
            };
        }
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