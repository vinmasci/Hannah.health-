// AIConversationalAssessment.js - Step 1: Natural AI conversation to gather user data
// Uses ChatGPT for unscripted, intelligent conversation

import AIService from '../services/ai-service.js';
import eventBus from '../services/EventBus.js';

export class AIConversationalAssessment {
    constructor() {
        this.aiService = new AIService();
        this.conversationHistory = [];
        this.extractedData = {
            // Will be extracted from conversation
            age: null,
            gender: null,
            height: null,
            weight: null,
            activityLevel: null,
            exerciseFrequency: null,
            primaryGoal: null,
            dietType: null,
            allergies: [],
            preferences: []
        };
        
        this.systemPrompt = `You are Hannah, a friendly and professional nutrition coach. Your job is to have a natural conversation with the user to gather information needed for creating a personalized meal plan.

You need to collect (but do it naturally, not like a form):
- Age and gender
- Height and weight (for BMI calculation)
- Activity level (job type, exercise frequency)
- Primary health/fitness goal (lose weight, gain muscle, maintain, etc.)
- Dietary restrictions (vegetarian, vegan, allergies, etc.)
- Food preferences and dislikes

Be conversational and empathetic. Ask follow-up questions. Make it feel like a consultation, not an interrogation. When you have enough information, let them know you're ready to calculate their personalized plan.

IMPORTANT: When you have gathered sufficient information, end your message with: [ASSESSMENT_COMPLETE]

Format extracted data as JSON at the end of your responses like this:
[DATA]
{
  "age": 30,
  "gender": "male",
  "height": 180,
  "heightUnit": "cm",
  "weight": 75,
  "weightUnit": "kg",
  ...
}
[/DATA]`;
    }
    
    create(mainBoard, insertBefore = null) {
        const column = document.createElement('div');
        column.className = 'ai-conversation-column animate-in';
        column.dataset.category = 'ai-conversation';
        
        column.innerHTML = `
            <div class="conversation-header">
                <div class="header-content">
                    <img src="https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F916.svg" 
                         width="24" height="24" class="openmoji-icon" alt="robot">
                    <div class="header-text">
                        <h3>Hannah AI</h3>
                        <span class="subtitle">Your Nutrition Coach</span>
                    </div>
                </div>
                <button class="reset-btn" onclick="window.aiConversation.reset()" title="Start Over">
                    <img src="https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F504.svg" 
                         width="16" height="16" alt="reset">
                </button>
            </div>
            
            <div class="conversation-container">
                <div class="chat-messages" id="chatMessages">
                    <!-- Initial greeting -->
                    <div class="message ai-message">
                        <div class="message-avatar">
                            <img src="https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F469-200D-2695-FE0F.svg" 
                                 width="32" height="32" alt="Hannah">
                        </div>
                        <div class="message-content">
                            <div class="message-bubble">
                                Hi! I'm Hannah, your personal nutrition coach. 👋
                                
                                I'm here to help create a meal plan that's perfect for you. To get started, I'll need to learn a bit about you, your lifestyle, and your goals.
                                
                                What's your name, and what brings you here today? Are you looking to lose weight, build muscle, or just eat healthier?
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="chat-input-container">
                    <input type="text" 
                           id="userInput" 
                           class="chat-input" 
                           placeholder="Type your message..."
                           onkeypress="if(event.key==='Enter' && !event.shiftKey) window.aiConversation.sendMessage()">
                    <button class="send-btn" onclick="window.aiConversation.sendMessage()">
                        <img src="https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F4E8.svg" 
                             width="20" height="20" alt="send">
                    </button>
                </div>
            </div>
        `;
        
        // Add styles
        this.addStyles();
        
        // Insert column in the center position
        if (insertBefore) {
            mainBoard.insertBefore(column, insertBefore);
        } else {
            const firstDayColumn = mainBoard.querySelector('.day-column');
            if (firstDayColumn) {
                mainBoard.insertBefore(column, firstDayColumn);
            } else {
                mainBoard.appendChild(column);
            }
        }
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('userInput')?.focus();
        }, 100);
        
        return column;
    }
    
    async sendMessage() {
        const input = document.getElementById('userInput');
        const message = input.value.trim();
        if (!message) return;
        
        // Clear input
        input.value = '';
        
        // Add user message to chat
        this.addMessage(message, 'user');
        
        // Add to conversation history
        this.conversationHistory.push({ role: 'user', content: message });
        
        // Show typing indicator
        this.showTypingIndicator();
        
        try {
            // Send to AI with system prompt
            const response = await this.aiService.sendMessage(
                message,
                this.conversationHistory,
                this.systemPrompt
            );
            
            // Remove typing indicator
            this.hideTypingIndicator();
            
            // Add AI response
            this.addMessage(response.message, 'ai');
            
            // Add to history
            this.conversationHistory.push({ role: 'assistant', content: response.message });
            
            // Extract data from response
            this.extractDataFromResponse(response.message);
            
            // Check if assessment is complete
            if (response.message.includes('[ASSESSMENT_COMPLETE]')) {
                this.completeAssessment();
            }
            
        } catch (error) {
            console.error('AI conversation error:', error);
            this.hideTypingIndicator();
            this.addMessage('Sorry, I had trouble processing that. Could you try again?', 'ai');
        }
    }
    
    addMessage(content, sender) {
        const messagesContainer = document.getElementById('chatMessages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        
        // Clean up any data tags from display
        const displayContent = content
            .replace(/\[ASSESSMENT_COMPLETE\]/g, '')
            .replace(/\[DATA\][\s\S]*?\[\/DATA\]/g, '');
        
        if (sender === 'user') {
            messageDiv.innerHTML = `
                <div class="message-content">
                    <div class="message-bubble user-bubble">
                        ${this.formatMessage(displayContent)}
                    </div>
                </div>
            `;
        } else {
            messageDiv.innerHTML = `
                <div class="message-avatar">
                    <img src="https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F469-200D-2695-FE0F.svg" 
                         width="32" height="32" alt="Hannah">
                </div>
                <div class="message-content">
                    <div class="message-bubble">
                        ${this.formatMessage(displayContent)}
                    </div>
                </div>
            `;
        }
        
        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    formatMessage(message) {
        // Convert line breaks to <br> and format
        return message
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>')
            .replace(/^(?!<p>)/, '<p>')
            .replace(/(?!<\/p>)$/, '</p>');
    }
    
    showTypingIndicator() {
        const messagesContainer = document.getElementById('chatMessages');
        const indicator = document.createElement('div');
        indicator.id = 'typingIndicator';
        indicator.className = 'message ai-message typing-indicator';
        indicator.innerHTML = `
            <div class="message-avatar">
                <img src="https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F469-200D-2695-FE0F.svg" 
                     width="32" height="32" alt="Hannah">
            </div>
            <div class="message-content">
                <div class="message-bubble">
                    <div class="typing-dots">
                        <span></span><span></span><span></span>
                    </div>
                </div>
            </div>
        `;
        messagesContainer.appendChild(indicator);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    hideTypingIndicator() {
        const indicator = document.getElementById('typingIndicator');
        if (indicator) indicator.remove();
    }
    
    extractDataFromResponse(response) {
        // Look for JSON data in the response
        const dataMatch = response.match(/\[DATA\]([\s\S]*?)\[\/DATA\]/);
        if (dataMatch) {
            try {
                const data = JSON.parse(dataMatch[1]);
                // Merge with existing data
                this.extractedData = { ...this.extractedData, ...data };
                
                // Emit update for display column
                eventBus.emit('assessment:update', { 
                    userData: this.extractedData,
                    partial: true 
                });
                
            } catch (error) {
                console.error('Failed to parse extracted data:', error);
            }
        }
    }
    
    completeAssessment() {
        // Calculate BMI, TDEE, and macros
        const calculations = this.performCalculations();
        
        // Merge calculations with extracted data
        const completeData = {
            ...this.extractedData,
            ...calculations
        };
        
        // Emit completion event
        eventBus.emit('assessment:complete', { 
            userData: completeData 
        });
        
        // Show completion message
        this.addMessage(
            "Perfect! I have all the information I need. Check the Results column on the left to see your personalized calculations, and the Suggestions column on the right for meal ideas tailored just for you! 🎯",
            'ai'
        );
        
        // Disable input
        const input = document.getElementById('userInput');
        if (input) {
            input.placeholder = 'Assessment complete! Click reset to start over.';
            input.disabled = true;
        }
    }
    
    performCalculations() {
        const data = this.extractedData;
        
        // Convert height to meters
        const heightInM = data.heightUnit === 'cm' ? 
            data.height / 100 : 
            data.height * 0.3048;
            
        // Convert weight to kg
        const weightInKg = data.weightUnit === 'kg' ? 
            data.weight : 
            data.weight * 0.453592;
            
        // Calculate BMI
        const bmi = weightInKg / (heightInM * heightInM);
        
        // Calculate BMR (Basal Metabolic Rate)
        let bmr;
        if (data.gender === 'male') {
            bmr = (10 * weightInKg) + (6.25 * (data.height)) - (5 * data.age) + 5;
        } else {
            bmr = (10 * weightInKg) + (6.25 * (data.height)) - (5 * data.age) - 161;
        }
        
        // Determine activity multiplier
        const activityMultipliers = {
            'sedentary': 1.2,
            'light': 1.375,
            'moderate': 1.55,
            'active': 1.725,
            'very active': 1.9
        };
        
        const multiplier = activityMultipliers[data.activityLevel] || 1.2;
        const tdee = Math.round(bmr * multiplier);
        
        // Calculate target calories
        let targetCalories = tdee;
        if (data.primaryGoal?.includes('lose')) {
            targetCalories = tdee - 500;
        } else if (data.primaryGoal?.includes('gain muscle')) {
            targetCalories = tdee + 300;
        } else if (data.primaryGoal?.includes('gain weight')) {
            targetCalories = tdee + 500;
        }
        
        // Calculate macros
        const macros = this.calculateMacros(targetCalories, data.primaryGoal);
        
        return {
            bmi,
            bmr,
            tdee,
            targetCalories,
            macros
        };
    }
    
    calculateMacros(calories, goal) {
        let proteinRatio = 0.25;
        let carbRatio = 0.45;
        let fatRatio = 0.30;
        
        if (goal?.includes('lose')) {
            proteinRatio = 0.30;
            carbRatio = 0.35;
            fatRatio = 0.35;
        } else if (goal?.includes('muscle')) {
            proteinRatio = 0.30;
            carbRatio = 0.45;
            fatRatio = 0.25;
        }
        
        return {
            protein: Math.round((calories * proteinRatio) / 4),
            carbs: Math.round((calories * carbRatio) / 4),
            fat: Math.round((calories * fatRatio) / 9)
        };
    }
    
    reset() {
        // Clear conversation
        this.conversationHistory = [];
        this.extractedData = {};
        
        // Reset UI
        const messagesContainer = document.getElementById('chatMessages');
        messagesContainer.innerHTML = `
            <div class="message ai-message">
                <div class="message-avatar">
                    <img src="https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F469-200D-2695-FE0F.svg" 
                         width="32" height="32" alt="Hannah">
                </div>
                <div class="message-content">
                    <div class="message-bubble">
                        Hi! I'm Hannah, your personal nutrition coach. 👋
                        
                        I'm here to help create a meal plan that's perfect for you. To get started, I'll need to learn a bit about you, your lifestyle, and your goals.
                        
                        What's your name, and what brings you here today? Are you looking to lose weight, build muscle, or just eat healthier?
                    </div>
                </div>
            </div>
        `;
        
        // Re-enable input
        const input = document.getElementById('userInput');
        if (input) {
            input.placeholder = 'Type your message...';
            input.disabled = false;
            input.focus();
        }
        
        // Emit reset event
        eventBus.emit('assessment:reset');
    }
    
    addStyles() {
        if (document.getElementById('conversation-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'conversation-styles';
        styles.textContent = `
            .ai-conversation-column {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-width: 400px;
                max-width: 400px;
                height: calc(100vh - 160px);
                display: flex;
                flex-direction: column;
                border-radius: 8px;
                overflow: hidden;
            }
            
            .conversation-header {
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(10px);
                padding: 12px 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .header-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            
            .header-text h3 {
                color: white;
                font-size: 16px;
                margin: 0;
                font-weight: 600;
            }
            
            .header-text .subtitle {
                color: rgba(255, 255, 255, 0.8);
                font-size: 12px;
            }
            
            .reset-btn {
                background: rgba(255, 255, 255, 0.2);
                border: 1px solid rgba(255, 255, 255, 0.3);
                padding: 6px;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.2s;
            }
            
            .reset-btn:hover {
                background: rgba(255, 255, 255, 0.3);
                transform: scale(1.1);
            }
            
            .conversation-container {
                flex: 1;
                display: flex;
                flex-direction: column;
                background: white;
            }
            
            .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                display: flex;
                flex-direction: column;
                gap: 16px;
            }
            
            .message {
                display: flex;
                gap: 12px;
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .user-message {
                justify-content: flex-end;
            }
            
            .message-avatar {
                flex-shrink: 0;
            }
            
            .message-content {
                max-width: 70%;
            }
            
            .message-bubble {
                background: #f3f4f6;
                padding: 12px 16px;
                border-radius: 12px;
                font-size: 14px;
                line-height: 1.5;
                color: #1f2937;
            }
            
            .user-bubble {
                background: #667eea;
                color: white;
            }
            
            .typing-dots {
                display: flex;
                gap: 4px;
                padding: 8px 0;
            }
            
            .typing-dots span {
                width: 8px;
                height: 8px;
                background: #9ca3af;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }
            
            .typing-dots span:nth-child(2) {
                animation-delay: 0.2s;
            }
            
            .typing-dots span:nth-child(3) {
                animation-delay: 0.4s;
            }
            
            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-10px); }
            }
            
            .chat-input-container {
                border-top: 1px solid #e5e7eb;
                padding: 16px;
                display: flex;
                gap: 12px;
            }
            
            .chat-input {
                flex: 1;
                padding: 10px 16px;
                border: 1px solid #d1d5db;
                border-radius: 24px;
                font-size: 14px;
                outline: none;
            }
            
            .chat-input:focus {
                border-color: #667eea;
                box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
            }
            
            .send-btn {
                background: #667eea;
                border: none;
                width: 40px;
                height: 40px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .send-btn:hover {
                background: #5a67d8;
                transform: scale(1.1);
            }
            
            .send-btn:active {
                transform: scale(0.95);
            }
        `;
        document.head.appendChild(styles);
    }
}

// Create singleton and expose to window
const aiConversation = new AIConversationalAssessment();
window.aiConversation = aiConversation;

export default aiConversation;