// Ultra-simplified AI Chat for Hannah
// Just one text box and two quick options

import AIService from '../services/ai-service.js';

class UltraSimpleHannahChat {
    constructor() {
        this.aiService = new AIService();
        this.setupDOM();
        this.init();
    }
    
    setupDOM() {
        this.messagesArea = document.getElementById('chat-messages');
        this.textInput = document.getElementById('user-text-input');
        this.sendBtn = document.getElementById('send-btn');
        this.quickPlanBtn = document.getElementById('quick-plan-btn');
        this.manualPlanBtn = document.getElementById('manual-plan-btn');
    }
    
    init() {
        // Event listeners
        this.sendBtn.addEventListener('click', () => this.handleUserInput());
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleUserInput();
            }
        });
        
        this.quickPlanBtn.addEventListener('click', () => this.quickPlan());
        this.manualPlanBtn.addEventListener('click', () => this.manualPlan());
        
        // Start with simple greeting
        setTimeout(() => {
            this.showGreeting();
        }, 500);
    }
    
    showGreeting() {
        const greeting = "Tell me in a sentence what you're looking for in a meal plan - your goals, any health conditions, dietary preferences, whatever matters to you.";
        this.addMessage(greeting, 'hannah');
        this.enableInput();
    }
    
    async handleUserInput() {
        const userText = this.textInput.value.trim();
        if (!userText) return;
        
        // Add user message
        this.addMessage(userText, 'user');
        this.textInput.value = '';
        this.disableInput();
        
        // Show typing
        this.showTypingIndicator();
        
        try {
            // Send to AI with context about creating a meal plan
            const context = {
                systemPrompt: `You are Hannah from Hannah.health, an AI nutritionist who creates personalized meal plans.

The user just told you what they're looking for in a meal plan. Your job:
1. Acknowledge what they said
2. Extract key info: goals, health conditions, dietary needs
3. Create a brief meal plan outline
4. Be warm but concise (max 3-4 sentences)

If they mention weight loss, recommend 0.5-0.75kg/week max.
For health conditions like NAFLD, focus on appropriate nutrition.
Keep it simple and actionable.`,
                conversationHistory: []
            };
            
            const response = await this.aiService.chat(userText, context);
            
            await this.delay(1000);
            this.hideTypingIndicator();
            
            // Add AI response
            this.addMessage(response.message, 'hannah');
            
            // After first exchange, show option to generate full plan
            await this.delay(1500);
            this.addMessage("I can now create your full weekly meal plan with specific meals, or you can tell me more about what you need.", 'hannah');
            
            // Show action button
            this.showGenerateButton();
            
        } catch (error) {
            console.error('AI error:', error);
            this.hideTypingIndicator();
            this.addMessage("Let me try again - what are your main goals with meal planning?", 'hannah');
        }
        
        this.enableInput();
    }
    
    quickPlan() {
        this.addMessage("Just shut up and make me a plan!", 'user');
        this.disableInput();
        
        setTimeout(() => {
            this.addMessage("No problem! Creating a balanced, healthy weekly meal plan for you...", 'hannah');
            this.generateGenericPlan();
        }, 500);
    }
    
    manualPlan() {
        this.addMessage("I'll make my own damn plan!", 'user');
        
        setTimeout(() => {
            this.addMessage("Perfect! Head back to the meal planner and drag whatever you want onto your board. I'll be here if you need me.", 'hannah');
            
            // Redirect to meal planner
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        }, 500);
    }
    
    generateGenericPlan() {
        // Simple animation of adding meals
        setTimeout(() => {
            this.addMessage("✅ Monday: Overnight oats, Chicken salad, Salmon with veggies", 'hannah');
        }, 1000);
        
        setTimeout(() => {
            this.addMessage("✅ Tuesday: Greek yogurt parfait, Turkey wrap, Stir-fry tofu", 'hannah');
        }, 2000);
        
        setTimeout(() => {
            this.addMessage("✅ Wednesday: Scrambled eggs, Quinoa bowl, Grilled chicken", 'hannah');
        }, 3000);
        
        setTimeout(() => {
            this.addMessage("✅ Thursday: Smoothie bowl, Tuna sandwich, Beef tacos", 'hannah');
        }, 4000);
        
        setTimeout(() => {
            this.addMessage("✅ Friday: Avocado toast, Caesar salad, Pizza night!", 'hannah');
        }, 5000);
        
        setTimeout(() => {
            this.addMessage("Your week is ready! Want to customize anything?", 'hannah');
            this.enableInput();
        }, 6000);
    }
    
    showGenerateButton() {
        const btn = document.createElement('button');
        btn.className = 'generate-plan-btn';
        btn.textContent = '🍱 Generate My Full Meal Plan';
        btn.onclick = () => {
            btn.remove();
            this.generatePersonalizedPlan();
        };
        this.messagesArea.appendChild(btn);
        this.scrollToBottom();
    }
    
    generatePersonalizedPlan() {
        this.addMessage("Creating your personalized meal plan...", 'hannah');
        // Would generate based on what user said
        this.generateGenericPlan();
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
    
    disableInput() {
        this.textInput.disabled = true;
        this.sendBtn.disabled = true;
    }
    
    scrollToBottom() {
        this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

export default UltraSimpleHannahChat;