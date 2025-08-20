// Simplified AI-First Chat System for Hannah
// Natural conversation with gentle persistence for key data

class SimpleHannahChat {
    constructor() {
        this.userProfile = {
            goal: null,
            condition: null,
            weightPace: null,
            activityLevel: null,
            dailySteps: null,
            age: null,
            exercise: null,
            restrictions: [],
            preferences: []
        };
        
        this.conversationHistory = [];
        this.messageCount = 0;
        
        // Initialize AI with Hannah's personality and goals
        this.aiService = new AIService(window.CLAUDE_API_KEY);
        
        // Track what we still need to learn
        this.dataNeeded = {
            goal: true,
            activity: true,
            demographics: true
        };
        
        // DOM elements
        this.setupDOM();
        this.init();
    }
    
    setupDOM() {
        this.messagesArea = document.getElementById('chat-messages');
        this.abcOptions = document.getElementById('abc-options');
        this.textInput = document.getElementById('user-text-input');
        this.sendBtn = document.getElementById('send-btn');
        this.skipBtn = document.getElementById('skip-ai-btn');
    }
    
    init() {
        // Set up event listeners
        this.sendBtn.addEventListener('click', () => this.handleUserInput());
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.handleUserInput();
        });
        this.skipBtn.addEventListener('click', () => this.skipToManual());
        
        // Start conversation
        setTimeout(() => {
            this.startConversation();
        }, 1000);
    }
    
    async startConversation() {
        // Simple opening - let AI take it from here
        const opening = "Hi! I'm Hannah. I can help you plan your meals for the week. What brings you here today?";
        
        this.showTypingIndicator();
        await this.delay(1500);
        this.hideTypingIndicator();
        
        this.addMessage(opening, 'hannah');
        
        // Show some helpful prompts but don't force them
        this.showSuggestions([
            "I want to lose some weight",
            "I have a health condition",
            "Just want to eat healthier"
        ]);
        
        this.enableInput();
    }
    
    async handleUserInput() {
        const userText = this.textInput.value.trim();
        if (!userText) return;
        
        // Add user message
        this.addMessage(userText, 'user');
        this.textInput.value = '';
        this.messageCount++;
        
        // Hide suggestions
        this.hideSuggestions();
        
        // Process with AI
        await this.processWithAI(userText);
    }
    
    async processWithAI(userInput) {
        this.showTypingIndicator();
        
        try {
            // Build context for AI
            const context = this.buildAIContext();
            
            // Get AI response
            const response = await this.aiService.chat(userInput, context);
            
            await this.delay(1000);
            this.hideTypingIndicator();
            
            // Add Hannah's response
            this.addMessage(response.message, 'hannah');
            
            // Extract any data from the conversation
            this.extractDataFromConversation(userInput, response);
            
            // Check if we have enough info to start building meals
            if (this.hasEnoughInfo()) {
                // After 6-7 messages, start building the plan
                if (this.messageCount > 5) {
                    await this.delay(1500);
                    this.startBuildingMealPlan();
                }
            } else if (this.messageCount > 8) {
                // Gently wrap up and work with what we have
                await this.delay(1500);
                this.addMessage("I think I have enough to get started! Let me create your meal plan...", 'hannah');
                this.startBuildingMealPlan();
            }
            
            // Show relevant suggestions based on context
            this.showContextualSuggestions();
            
        } catch (error) {
            console.error('AI error:', error);
            this.hideTypingIndicator();
            this.handleAIError();
        }
        
        this.enableInput();
    }
    
    buildAIContext() {
        return {
            systemPrompt: `You are Hannah from Hannah.health, a warm and understanding AI nutritionist.
            
Your backstory: Created by someone with NAFLD (fatty liver) and their partner recovering from an eating disorder. You understand health struggles personally.

Your personality:
- Warm, caring, conversational
- Never preachy or judgmental  
- Focus on sustainable changes
- You understand that perfect is the enemy of good
- Back up recommendations with science when relevant (briefly)

Current conversation goal:
Naturally learn about the user through friendly conversation. You'd like to understand:
- Their health goals or conditions (especially if weight loss, eating disorder, or medical)
- If weight loss: Gently suggest 0.5-0.75kg/week as sustainable (1kg absolute max)
- How many steps they get daily (this matters most for calorie calculations)
- Rough age if it comes up naturally (helps with calorie math)
- Any foods they avoid or love

IMPORTANT: If someone mentions a "health condition" or "medical condition", ALWAYS ask what condition specifically before moving on. This is critical for proper meal planning.

Don't interrogate! Just have a natural conversation. After 5-7 exchanges, you'll have enough to help them.

IMPORTANT RULES:
- If someone mentions eating disorder/recovery: Switch to supportive mode, NO numbers ever
- If someone wants >1kg/week loss: Explain that 0.5-0.75kg/week is safest, 1kg absolute maximum
- For NAFLD: Focus on omega-3s, fiber, limiting saturated fat (not "Mediterranean" as a vague term)
- Keep responses to 2-3 sentences max, but include brief science when it helps
- Be encouraging and positive
- If they seem reluctant to share details, that's okay - work with what you have

What you know so far about this user:
${JSON.stringify(this.userProfile, null, 2)}

Conversation so far: ${this.messageCount} messages exchanged`,
            
            userProfile: this.userProfile,
            conversationHistory: this.conversationHistory.slice(-5)
        };
    }
    
    extractDataFromConversation(userInput, aiResponse) {
        const combined = (userInput + ' ' + aiResponse.message).toLowerCase();
        
        // Extract weight loss goals
        if (combined.includes('0.5kg') || combined.includes('half kg')) {
            this.userProfile.weightPace = '0.5kg';
            this.dataNeeded.goal = false;
        } else if (combined.includes('0.75kg') || combined.includes('three quarters')) {
            this.userProfile.weightPace = '0.75kg';
            this.dataNeeded.goal = false;
        } else if (combined.includes('1kg') || combined.includes('one kg')) {
            this.userProfile.weightPace = '1kg';
            this.dataNeeded.goal = false;
        }
        
        // Extract activity level
        if (combined.includes('desk') || combined.includes('office') || combined.includes('sitting')) {
            this.userProfile.activityLevel = 'sedentary';
            this.dataNeeded.activity = false;
        } else if (combined.includes('active') || combined.includes('feet') || combined.includes('walking')) {
            this.userProfile.activityLevel = 'active';
            this.dataNeeded.activity = false;
        }
        
        // Extract steps if mentioned
        const stepsMatch = combined.match(/(\d{1,2})[,.]?(\d{3})\s*steps/);
        if (stepsMatch) {
            this.userProfile.dailySteps = parseInt(stepsMatch[0].replace(/\D/g, ''));
        }
        
        // Extract age if mentioned
        const ageMatch = combined.match(/\b([2-6]\d)\s*(years?|yo|yr)/);
        if (ageMatch) {
            this.userProfile.age = parseInt(ageMatch[1]);
            this.dataNeeded.demographics = false;
        }
        
        // Detect medical conditions
        if (combined.includes('fatty liver') || combined.includes('nafld')) {
            this.userProfile.condition = 'NAFLD';
        } else if (combined.includes('diabetes')) {
            this.userProfile.condition = 'diabetes';
        } else if (combined.includes('eating') && combined.includes('disorder')) {
            this.userProfile.condition = 'ED_recovery';
            // Immediately set safe mode
            this.userProfile.hideNumbers = true;
        }
        
        // Save conversation
        this.conversationHistory.push({
            user: userInput,
            hannah: aiResponse.message,
            timestamp: new Date().toISOString()
        });
    }
    
    hasEnoughInfo() {
        // We have enough if we know their main goal and activity
        return this.userProfile.goal || this.userProfile.condition || this.userProfile.weightPace;
    }
    
    showContextualSuggestions() {
        // Show suggestions based on what we still need and last message
        const suggestions = [];
        const lastMessage = this.conversationHistory[this.conversationHistory.length - 1];
        const lastUserInput = lastMessage?.user?.toLowerCase() || '';
        const lastHannahMessage = lastMessage?.hannah?.toLowerCase() || '';
        
        // MOST SPECIFIC FIRST - check what Hannah just asked about
        
        // If Hannah asked about weight goals
        if (lastHannahMessage.includes('lose weight') || lastHannahMessage.includes('maintain') || 
            lastHannahMessage.includes('weight loss') || lastHannahMessage.includes('your weight')) {
            suggestions.push("Yes, lose some weight", "Maintain my weight", "Not sure yet");
        }
        // If Hannah asked about activity/steps
        else if (lastHannahMessage.includes('typical day') || lastHannahMessage.includes('steps') || 
                 lastHannahMessage.includes('active') || lastHannahMessage.includes('walk')) {
            suggestions.push("About 5,000 steps", "8,000-10,000 steps", "Over 12,000 steps");
        }
        // If Hannah asked about specific condition
        else if (lastHannahMessage.includes('what condition') || lastHannahMessage.includes('what you\'re managing') ||
                 lastHannahMessage.includes('tell me') && lastHannahMessage.includes('managing')) {
            suggestions.push("Fatty liver disease", "Type 2 diabetes", "High cholesterol");
        }
        // If user just mentioned health condition, suggest common ones
        else if (lastUserInput.includes('health condition') || lastUserInput.includes('medical')) {
            suggestions.push("Fatty liver (NAFLD)", "Type 2 diabetes", "Just want to eat healthier");
        }
        // If Hannah asked about pace
        else if (lastHannahMessage.includes('0.5') || lastHannahMessage.includes('0.75') || 
                 lastHannahMessage.includes('per week') || lastHannahMessage.includes('sound reasonable')) {
            suggestions.push("Yes, 0.5kg per week", "Maybe 0.75kg per week", "I'd still prefer 1kg per week");
        }
        // If Hannah asked about age
        else if (lastHannahMessage.includes('age') || lastHannahMessage.includes('how old')) {
            suggestions.push("I'm in my 30s", "I'm 45", "I'd rather not say");
        }
        // If Hannah asked about foods
        else if (lastHannahMessage.includes('foods') || lastHannahMessage.includes('avoid') || 
                 lastHannahMessage.includes('allergies')) {
            suggestions.push("No restrictions", "I'm vegetarian", "I avoid gluten");
        }
        // Generic fallbacks based on what we still need
        else if (!this.userProfile.dailySteps && this.messageCount > 2) {
            suggestions.push("About 5,000 steps daily", "Around 10,000 steps", "I don't track steps");
        } 
        else if (this.messageCount > 5) {
            suggestions.push("Let's start planning", "That's enough about me", "What's next?");
        }
        
        if (suggestions.length > 0) {
            this.showSuggestions(suggestions);
        }
    }
    
    showSuggestions(suggestions) {
        this.abcOptions.innerHTML = '';
        this.abcOptions.classList.remove('hidden');
        
        suggestions.forEach((text, i) => {
            const btn = document.createElement('button');
            btn.className = 'suggestion-btn';
            btn.textContent = text;
            btn.onclick = () => {
                this.textInput.value = text;
                this.handleUserInput();
            };
            this.abcOptions.appendChild(btn);
        });
    }
    
    hideSuggestions() {
        this.abcOptions.classList.add('hidden');
    }
    
    async startBuildingMealPlan() {
        // Calculate needs based on what we know
        this.calculateNutritionNeeds();
        
        // Show the science if we have enough data
        if (this.userProfile.weightPace) {
            await this.delay(1000);
            this.showNutritionScience();
        }
        
        // Start adding meals
        await this.delay(1500);
        this.addMessage("Let me start adding meals to your plan...", 'hannah');
        
        // Animate meals appearing
        this.startMealAnimation();
    }
    
    calculateNutritionNeeds() {
        // TDEE calculation based primarily on steps
        let tdee = 1800; // Base for sedentary
        
        // Add calories based on step count (roughly 0.04 cal per step)
        if (this.userProfile.dailySteps) {
            if (this.userProfile.dailySteps < 5000) {
                tdee = 1800; // Sedentary
            } else if (this.userProfile.dailySteps < 7500) {
                tdee = 1950; // Lightly active
            } else if (this.userProfile.dailySteps < 10000) {
                tdee = 2100; // Moderately active
            } else if (this.userProfile.dailySteps < 12500) {
                tdee = 2250; // Active
            } else {
                tdee = 2400; // Very active
            }
        } else {
            tdee = 2000; // Default if no step data
        }
        
        // Set calorie target based on goal
        if (this.userProfile.weightPace === '0.5kg') {
            this.userProfile.targetCalories = tdee - 550;
        } else if (this.userProfile.weightPace === '0.75kg') {
            this.userProfile.targetCalories = tdee - 825;
        } else if (this.userProfile.weightPace === '1kg') {
            this.userProfile.targetCalories = Math.max(1200, tdee - 1100); // Safety minimum
        } else {
            this.userProfile.targetCalories = tdee;
        }
        
        // Set macros based on condition
        if (this.userProfile.condition === 'NAFLD') {
            this.userProfile.macros = { carbs: 40, protein: 30, fat: 30 };
        } else {
            this.userProfile.macros = { carbs: 45, protein: 25, fat: 30 };
        }
    }
    
    showNutritionScience() {
        if (this.userProfile.hideNumbers) return; // Skip for ED recovery
        
        const scienceHtml = `
            <div class="science-box">
                <h4>Your Personalized Plan</h4>
                ${this.userProfile.weightPace ? `<p>Weight goal: ${this.userProfile.weightPace}/week</p>` : ''}
                ${this.userProfile.targetCalories ? `<p>Daily calories: ~${Math.round(this.userProfile.targetCalories)}</p>` : ''}
                ${this.userProfile.condition === 'NAFLD' ? '<p>Mediterranean-style, liver-friendly meals</p>' : ''}
            </div>
        `;
        
        const div = document.createElement('div');
        div.innerHTML = scienceHtml;
        this.messagesArea.appendChild(div);
        this.scrollToBottom();
    }
    
    startMealAnimation() {
        // Add meals to the board day by day
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
        let dayIndex = 0;
        
        const addNextDay = () => {
            if (dayIndex < days.length) {
                this.addMealsToDay(days[dayIndex]);
                dayIndex++;
                setTimeout(addNextDay, 1000);
            } else {
                this.finishMealPlan();
            }
        };
        
        setTimeout(addNextDay, 1000);
    }
    
    addMealsToDay(day) {
        // Visual feedback of meals being added
        const dayElement = document.querySelector(`[data-day="${day}"]`);
        if (dayElement) {
            const slots = dayElement.querySelectorAll('.meal-slot');
            slots.forEach(slot => {
                slot.classList.add('has-meal');
                slot.textContent = '✓ Meal added';
            });
        }
    }
    
    finishMealPlan() {
        this.addMessage("Your week is ready! Feel free to swap any meals you don't like, or we can adjust them together.", 'hannah');
        
        // Show final options
        this.showSuggestions([
            "Looks great!",
            "Can we change some meals?",
            "Generate shopping list"
        ]);
    }
    
    // Helper methods
    addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        if (sender === 'hannah') {
            messageDiv.innerHTML = `
                <div class="hannah-avatar">H</div>
                <div class="message-content">
                    <div class="message-bubble">${text}</div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble">${text}</div>
                </div>
            `;
        }
        
        this.messagesArea.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    showTypingIndicator() {
        const typing = document.createElement('div');
        typing.className = 'typing-indicator-wrapper';
        typing.id = 'typing';
        typing.innerHTML = `
            <div class="hannah-avatar">H</div>
            <div class="typing-indicator">
                <span></span><span></span><span></span>
            </div>
        `;
        this.messagesArea.appendChild(typing);
        this.scrollToBottom();
    }
    
    hideTypingIndicator() {
        const typing = document.getElementById('typing');
        if (typing) typing.remove();
    }
    
    enableInput() {
        this.textInput.disabled = false;
        this.sendBtn.disabled = false;
        this.textInput.focus();
    }
    
    scrollToBottom() {
        this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    skipToManual() {
        this.addMessage("No problem! Feel free to drag meals from the categories above to build your plan. I'm here if you need me!", 'hannah');
        document.getElementById('ai-chat-container').style.display = 'none';
    }
    
    handleAIError() {
        this.addMessage("Let me think about that differently... What's your main goal with meal planning?", 'hannah');
        this.enableInput();
    }
}

// Enhanced AI Service for simpler integration
class AIService {
    constructor(apiKey) {
        this.apiKey = apiKey;
    }
    
    async chat(userInput, context) {
        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: 'claude-3-sonnet-20240229',
                    messages: [
                        {
                            role: 'system',
                            content: context.systemPrompt
                        },
                        ...this.buildMessageHistory(context.conversationHistory),
                        {
                            role: 'user',
                            content: userInput
                        }
                    ],
                    max_tokens: 150,
                    temperature: 0.7
                })
            });
            
            if (!response.ok) throw new Error('AI API error');
            
            const data = await response.json();
            return {
                message: data.content[0].text
            };
            
        } catch (error) {
            console.error('AI Service error:', error);
            // Fallback responses
            return this.getFallbackResponse(userInput, context);
        }
    }
    
    buildMessageHistory(history) {
        const messages = [];
        history.forEach(exchange => {
            if (exchange.hannah) {
                messages.push({ role: 'assistant', content: exchange.hannah });
            }
            if (exchange.user) {
                messages.push({ role: 'user', content: exchange.user });
            }
        });
        return messages;
    }
    
    getFallbackResponse(userInput, context) {
        // Smart fallbacks based on context
        const lower = userInput.toLowerCase();
        
        // CRITICAL: If they mention health condition, ask about it!
        if (lower.includes('health') && lower.includes('condition')) {
            return { message: "I understand. Could you tell me a bit more about what you're managing? This helps me suggest the right meals for you." };
        }
        
        if (lower.includes('medical') || lower.includes('doctor')) {
            return { message: "I see. What condition are you working with? I'll make sure to create meals that support your health." };
        }
        
        if (lower.includes('weight') || lower.includes('lose')) {
            return { message: "I can help with that! A pace of 0.5-0.75kg per week preserves muscle and keeps weight off long-term. Faster loss often backfires - your metabolism slows and the weight returns. Does that sound reasonable?" };
        }
        
        if (lower.includes('fatty liver') || lower.includes('nafld')) {
            return { message: "Thank you for sharing that. For NAFLD, we'll focus on meals rich in omega-3s, fiber, and antioxidants while limiting saturated fats - this helps promote fat reduction in the liver. Are you also looking to lose weight, or maintain where you are?" };
        }
        
        if (lower.includes('diabetes')) {
            return { message: "Got it - I'll focus on meals that help keep blood sugar stable. Are you looking to lose weight as well, or maintain your current weight?" };
        }
        
        if (lower.includes('meal') || lower.includes('food')) {
            return { message: "Let's create a meal plan that works for you. Are there any foods you particularly love or want to avoid?" };
        }
        
        if (context.messageCount > 5) {
            return { message: "I think I have enough to get started with your meal plan. Let me put something together for you!" };
        }
        
        return { message: "That's helpful to know! Do you happen to track your daily steps? Even a rough estimate helps me calculate your needs better." };
    }
}

// Initialize when ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.hannahChat = new SimpleHannahChat();
    });
} else {
    window.hannahChat = new SimpleHannahChat();
}