// AI Chat Component Logic
// Main controller for Hannah chat interface

class HannahChat {
    constructor() {
        this.currentFlow = 'opening';
        this.userProfile = new UserProfile();
        this.conversationHistory = [];
        this.isMinimized = false;
        this.isTyping = false;
        
        // Initialize AI service
        this.aiService = new AIService(window.CLAUDE_API_KEY);
        
        // DOM elements
        this.container = document.getElementById('ai-chat-container');
        this.messagesArea = document.getElementById('chat-messages');
        this.abcOptions = document.getElementById('abc-options');
        this.textInput = document.getElementById('user-text-input');
        this.sendBtn = document.getElementById('send-btn');
        this.skipBtn = document.getElementById('skip-ai-btn');
        this.minimizedContainer = document.getElementById('chat-minimized');
        this.expandBtn = document.getElementById('expand-chat-btn');
        
        this.init();
    }
    
    init() {
        // Load any saved profile
        this.userProfile.loadFromLocalStorage();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Start conversation with typing animation
        setTimeout(() => {
            this.showTypingIndicator();
            setTimeout(() => {
                this.hideTypingIndicator();
                this.processFlow('opening');
            }, 2000);
        }, 500);
    }
    
    setupEventListeners() {
        // Skip AI button
        this.skipBtn.addEventListener('click', () => this.minimizeChat());
        
        // Expand chat button
        this.expandBtn.addEventListener('click', () => this.expandChat());
        
        // Send button
        this.sendBtn.addEventListener('click', () => this.handleTextSubmit());
        
        // Enter key in text input
        this.textInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !this.textInput.disabled) {
                this.handleTextSubmit();
            }
        });
    }
    
    processFlow(flowKey) {
        // Prevent duplicate flow processing
        if (this.currentFlow === flowKey && this.isProcessing) {
            console.log('Already processing this flow:', flowKey);
            return;
        }
        
        const flow = ConversationFlows[flowKey];
        if (!flow) {
            console.error('Flow not found:', flowKey);
            return;
        }
        
        this.currentFlow = flowKey;
        
        // Add Hannah's message
        this.addMessage(flow.message, 'hannah');
        
        // Show science if needed
        if (flow.showScience) {
            this.showScienceExplanation();
        }
        
        // Handle different flow types
        if (flow.action) {
            this.handleAction(flow.action);
        }
        
        if (flow.showMeals) {
            if (flow.dayByDay) {
                this.populateMealsDayByDay();
            } else {
                this.populateMealsInstant();
            }
        }
        
        // Set up input options
        if (flow.textOnly) {
            this.enableTextInput(flow.placeholder);
            this.hideABCOptions();
        } else if (flow.options) {
            this.showABCOptions(flow.options);
            if (flow.allowText) {
                this.enableTextInput();
            } else {
                this.disableTextInput();
            }
        }
        
        // Save conversation state
        this.saveConversation(flowKey, flow);
    }
    
    addMessage(text, sender = 'hannah') {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;
        
        if (sender === 'hannah') {
            messageDiv.innerHTML = `
                <div class="hannah-avatar">H</div>
                <div class="message-content">
                    <div class="message-bubble">${this.processMessageVariables(text)}</div>
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
        
        // Add to history
        this.conversationHistory.push({
            sender,
            text,
            timestamp: new Date().toISOString()
        });
    }
    
    processMessageVariables(text) {
        // Replace variables in message with actual values
        return text
            .replace('{condition}', this.userProfile.data.condition || 'your condition')
            .replace('{weightGoal}', this.userProfile.data.weightGoal || 'your goal')
            .replace('{calories}', this.userProfile.data.targetCalories || '1,800')
            .replace('{dislikedFoods}', this.userProfile.data.dietaryRestrictions.join(' or ') || 'those foods');
    }
    
    showABCOptions(options) {
        this.abcOptions.innerHTML = '';
        this.abcOptions.classList.remove('hidden');
        
        options.forEach(option => {
            const button = document.createElement('button');
            button.className = 'option-btn';
            button.innerHTML = `
                <span class="option-letter">${option.key}</span>
                ${option.text}
            `;
            button.addEventListener('click', () => this.handleOptionClick(option));
            this.abcOptions.appendChild(button);
        });
    }
    
    hideABCOptions() {
        this.abcOptions.classList.add('hidden');
    }
    
    handleOptionClick(option) {
        // Add user's choice as a message
        this.addMessage(option.text, 'user');
        
        // Hide options
        this.hideABCOptions();
        this.disableTextInput();
        
        // Process the choice
        if (option.action) {
            this.handleAction(option.action);
        }
        
        if (option.next) {
            // Show typing indicator before next message
            this.showTypingIndicator();
            setTimeout(() => {
                this.hideTypingIndicator();
                this.processFlow(option.next);
            }, 1500);
        }
    }
    
    handleTextSubmit() {
        const text = this.textInput.value.trim();
        if (!text) return;
        
        // Add user message
        this.addMessage(text, 'user');
        
        // Clear input
        this.textInput.value = '';
        this.disableTextInput();
        
        // Process based on current flow
        const flow = ConversationFlows[this.currentFlow];
        
        // Handle specific flows
        if (this.currentFlow === 'healthCondition') {
            this.processHealthCondition(text).catch(err => {
                console.error('Health condition processing failed:', err);
            });
            return; // Don't process twice
        } else if (this.currentFlow === 'dailySteps') {
            this.processDailySteps(text);
        } else if (this.currentFlow === 'exerciseAge') {
            this.processExerciseAge(text);
        } else if (this.currentFlow === 'quickMeals') {
            this.processQuickMealsRequest(text);
        } else if (this.currentFlow === 'afterPlanGeneration') {
            this.processPreferences(text);
        } else {
            // For any flow with allowText, process as custom answer
            this.processCustomAnswer(text);
        }
    }
    
    async processHealthCondition(text) {
        // Detect condition from text
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('fatty liver') || lowerText.includes('nafld')) {
            this.userProfile.update('condition', 'NAFLD');
        } else if (lowerText.includes('diabetes')) {
            this.userProfile.update('condition', 'diabetes');
        } else if (lowerText.includes('eating') || lowerText.includes('relationship with food')) {
            // Switch to ED recovery path
            this.showTypingIndicator();
            setTimeout(() => {
                this.hideTypingIndicator();
                this.processFlow('edRecovery');
            }, 1500);
            return;
        }
        
        // Use AI for response OR fallback
        try {
            await this.processWithAI(text);
            // AI will handle moving to next flow
        } catch (error) {
            // Fallback if AI fails
            this.showTypingIndicator();
            setTimeout(() => {
                this.hideTypingIndicator();
                this.addMessage("Thank you for sharing that. I'll focus on meals that support your health.", 'hannah');
                setTimeout(() => {
                    this.processFlow('healthGoal');
                }, 1500);
            }, 1000);
        }
    }
    
    async processDailySteps(text) {
        // Use AI for natural response
        await this.processWithAI(text);
    }
    
    processExerciseAge(text) {
        // Extract exercise frequency and age
        const ageMatch = text.match(/\d{2}/);
        if (ageMatch) {
            this.userProfile.update('age', parseInt(ageMatch[0]));
        }
        
        if (text.includes('gym') || text.includes('exercise')) {
            const freqMatch = text.match(/(\d)x|(\d) times/);
            if (freqMatch) {
                this.userProfile.update('exerciseFrequency', freqMatch[1] || freqMatch[2]);
            }
        }
        
        // Calculate TDEE
        this.userProfile.calculateTDEE();
        
        // Show science
        this.processFlow('showScience');
    }
    
    showScienceExplanation() {
        const profile = this.userProfile.data;
        
        // Determine actual weekly loss
        let weeklyLossText = '0.5kg/week';
        let deficitText = '550 cal deficit';
        if (profile.weeklyGoal && profile.weeklyGoal.includes('1kg')) {
            weeklyLossText = '1kg/week';
            deficitText = '1,100 cal deficit';
        }
        
        const scienceDiv = document.createElement('div');
        scienceDiv.className = 'science-display';
        scienceDiv.innerHTML = `
            <h4>Your Personalized Nutrition Plan</h4>
            <div class="metric">
                <span class="metric-label">Weight Loss Goal:</span>
                <span class="metric-value">${weeklyLossText}</span>
            </div>
            <div class="metric">
                <span class="metric-label">Calorie Target:</span>
                <span class="metric-value">${profile.targetCalories}/day (${deficitText})</span>
            </div>
            <div class="metric">
                <span class="metric-label">Your TDEE:</span>
                <span class="metric-value">~${profile.tdee} calories</span>
            </div>
            <h4>Macro Distribution${profile.condition ? ' for ' + profile.condition : ''}:</h4>
            <div class="metric">
                <span class="metric-label">• Carbs:</span>
                <span class="metric-value">${profile.macroDistribution.carbs}% (${Math.round(profile.targetCalories * profile.macroDistribution.carbs / 400)}g)</span>
            </div>
            <div class="metric">
                <span class="metric-label">• Protein:</span>
                <span class="metric-value">${profile.macroDistribution.protein}% (${Math.round(profile.targetCalories * profile.macroDistribution.protein / 400)}g)</span>
            </div>
            <div class="metric">
                <span class="metric-label">• Fat:</span>
                <span class="metric-value">${profile.macroDistribution.fat}% (${Math.round(profile.targetCalories * profile.macroDistribution.fat / 900)}g)</span>
            </div>
            <p style="margin-top: 12px; font-size: 13px; color: #636E72;">
                <strong>Why these ratios:</strong> Research shows this distribution ${profile.condition === 'NAFLD' ? 'helps reduce liver fat' : 'supports your goals'} while maintaining steady energy. 
                I'll prioritize ${profile.condition === 'NAFLD' ? 'Mediterranean-style foods rich in fiber and antioxidants' : 'balanced, nutritious meals'}.
            </p>
        `;
        
        this.messagesArea.appendChild(scienceDiv);
        this.scrollToBottom();
    }
    
    populateMealsDayByDay() {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        let dayIndex = 0;
        
        const populateDay = () => {
            if (dayIndex < days.length) {
                this.addMessage(`Adding ${days[dayIndex]} meals...`, 'hannah');
                
                // Add visual meals to board (mock for now)
                this.addMealsToDay(days[dayIndex].toLowerCase());
                
                dayIndex++;
                setTimeout(populateDay, 1000);
            } else {
                // All days done
                setTimeout(() => {
                    this.processFlow('afterPlanGeneration');
                }, 1500);
            }
        };
        
        setTimeout(populateDay, 1000);
    }
    
    addMealsToDay(day) {
        // This would actually add meal cards to the board
        // For now, just visual feedback
        const dayColumn = document.querySelector(`[data-day="${day}"]`);
        if (dayColumn) {
            const slots = dayColumn.querySelectorAll('.meal-slot');
            slots.forEach((slot, index) => {
                setTimeout(() => {
                    slot.classList.add('has-meal');
                    slot.textContent = this.getRandomMeal(slot.dataset.meal);
                }, index * 200);
            });
        }
    }
    
    getRandomMeal(mealType) {
        const meals = {
            breakfast: ['Oatmeal & Berries', 'Greek Yogurt Bowl', 'Veggie Scramble'],
            lunch: ['Grilled Chicken Salad', 'Quinoa Bowl', 'Turkey Wrap'],
            dinner: ['Salmon & Veggies', 'Chicken Stir-fry', 'Mediterranean Bowl'],
            snack: ['Apple & Almonds', 'Hummus & Veggies', 'Protein Smoothie']
        };
        
        const options = meals[mealType] || ['Healthy Option'];
        return options[Math.floor(Math.random() * options.length)];
    }
    
    handleAction(action) {
        switch(action) {
            case 'minimizeChat':
                this.minimizeChat();
                break;
            case 'startTour':
                this.startInteractiveTour();
                break;
            case 'triggerPaywall':
                this.processFlow('triggerPaywall');
                break;
            case 'generateWellnessPlan':
            case 'generateMedicalPlan':
            case 'generateEDSafePlan':
                // These would trigger actual meal generation
                console.log('Generating plan:', action);
                break;
        }
    }
    
    startInteractiveTour() {
        this.addMessage("Let me show you around! Watch as I demonstrate the key features...", 'hannah');
        
        // Create animated cursor
        const cursor = document.createElement('div');
        cursor.style.cssText = `
            position: fixed;
            width: 20px;
            height: 20px;
            background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20"><path d="M0,0 L0,15 L4,12 L7,17 L10,15 L7,10 L12,10 Z" fill="black"/></svg>') no-repeat;
            z-index: 10000;
            pointer-events: none;
            transition: all 0.5s ease;
        `;
        document.body.appendChild(cursor);
        
        // Animate cursor to show drag and drop
        setTimeout(() => {
            // Move to meal card
            cursor.style.left = '300px';
            cursor.style.top = '400px';
            
            setTimeout(() => {
                // Simulate drag
                cursor.style.left = '500px';
                this.addMessage("You can drag any meal to a different day...", 'hannah');
                
                setTimeout(() => {
                    // Click swap icon
                    cursor.style.left = '350px';
                    cursor.style.top = '420px';
                    this.addMessage("Click the swap icon for alternatives...", 'hannah');
                    
                    setTimeout(() => {
                        // Remove cursor
                        cursor.remove();
                        this.addMessage("That's it! You're ready to start planning.", 'hannah');
                    }, 2000);
                }, 2000);
            }, 1500);
        }, 1000);
    }
    
    minimizeChat() {
        this.container.classList.add('minimized');
        this.minimizedContainer.classList.remove('hidden');
        this.isMinimized = true;
    }
    
    expandChat() {
        this.container.classList.remove('minimized');
        this.minimizedContainer.classList.add('hidden');
        this.isMinimized = false;
        this.scrollToBottom();
    }
    
    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message hannah typing-message';
        typingDiv.innerHTML = `
            <div class="hannah-avatar">H</div>
            <div class="message-content">
                <div class="typing-indicator">
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                    <span class="typing-dot"></span>
                </div>
            </div>
        `;
        this.messagesArea.appendChild(typingDiv);
        this.scrollToBottom();
        this.isTyping = true;
    }
    
    hideTypingIndicator() {
        const typingMessage = this.messagesArea.querySelector('.typing-message');
        if (typingMessage) {
            typingMessage.remove();
        }
        this.isTyping = false;
    }
    
    enableTextInput(placeholder) {
        this.textInput.disabled = false;
        this.sendBtn.disabled = false;
        if (placeholder) {
            this.textInput.placeholder = placeholder;
        } else {
            this.textInput.placeholder = "Or type your answer...";
        }
        this.textInput.focus();
    }
    
    disableTextInput() {
        this.textInput.disabled = true;
        this.sendBtn.disabled = true;
    }
    
    scrollToBottom() {
        this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
    }
    
    saveConversation(flowKey, flow) {
        const conversationSummary = {
            currentFlow: flowKey,
            userProfile: this.userProfile.data,
            timestamp: new Date().toISOString()
        };
        
        localStorage.setItem('hannahConversation', JSON.stringify(conversationSummary));
    }
    
    processCustomAnswer(text) {
        // For any text input on flows with options
        // This handles free text when ABC options are also available
        const flow = ConversationFlows[this.currentFlow];
        
        if (flow && flow.options) {
            // Hide options since user typed custom answer
            this.hideABCOptions();
            
            // Check for weight loss intent at main goal stage
            if (this.currentFlow === 'mainGoal') {
                const lowerText = text.toLowerCase();
                if (lowerText.includes('weight') || lowerText.includes('lose') || lowerText.includes('diet')) {
                    // User wants weight loss, skip to that flow
                    this.userProfile.update('weightGoal', 'Weight loss (gradual & healthy)');
                    this.showTypingIndicator();
                    setTimeout(() => {
                        this.hideTypingIndicator();
                        this.processFlow('weightLossPace');
                    }, 1500);
                    return;
                }
            }
            
            // Try to match intent with AI or fallback
            this.processWithAI(text);
        }
    }
    
    async processWithAI(userInput) {
        // Avoid duplicate processing if already handled
        if (this.isProcessing) {
            console.log('Already processing, skipping duplicate');
            return;
        }
        this.isProcessing = true;
        
        // Use AI for natural conversation
        this.showTypingIndicator();
        
        try {
            const context = {
                currentFlow: this.currentFlow,
                userProfile: this.userProfile.data,
                conversationHistory: this.conversationHistory.slice(-5)
            };
            
            const aiResponse = await this.aiService.processUserInput(userInput, context);
            
            this.hideTypingIndicator();
            
            // Add AI's response ONLY - no duplicate scripted response
            this.addMessage(aiResponse.message, 'hannah');
            
            // Update profile based on current flow
            this.updateProfileFromInput(userInput);
            
            // Determine next flow based on user input and current flow
            let nextFlow = this.determineNextFlow(userInput);
            
            // Continue to next flow after a pause
            if (nextFlow && nextFlow !== this.currentFlow) {
                setTimeout(() => {
                    this.isProcessing = false;
                    this.processFlow(nextFlow);
                }, 1500);
            } else {
                // Re-enable input for continued conversation
                this.isProcessing = false;
                this.enableTextInput();
            }
            
        } catch (error) {
            console.error('AI processing error:', error);
            // Fallback to pattern matching
            this.hideTypingIndicator();
            this.isProcessing = false;
            // Don't call fallbackProcessing - it might duplicate
            throw error; // Let caller handle
        }
    }
    
    determineNextFlow(userInput) {
        const lowerInput = userInput.toLowerCase();
        const currentFlow = this.currentFlow;
        
        // For health condition, always go to health goal
        if (currentFlow === 'healthCondition') {
            return 'healthGoal';
        }
        
        // Smart flow determination based on content
        if (currentFlow === 'mainGoal') {
            if (lowerInput.includes('weight') || lowerInput.includes('lose') || lowerInput.includes('diet')) {
                return 'weightLossPace';
            } else if (lowerInput.includes('health') || lowerInput.includes('condition')) {
                return 'healthCondition';
            } else if (lowerInput.includes('eat') || lowerInput.includes('healthy')) {
                return 'healthyEating';
            }
        }
        
        // Default flow progression
        const flowMap = {
            'opening': 'mainGoal',
            'mainGoal': 'healthyEating',
            'healthCondition': 'healthGoal',
            'healthGoal': 'activityLevel',
            'weightLossPace': 'activityLevel',
            'activityLevel': 'dailySteps',
            'dailySteps': 'exerciseAge',
            'exerciseAge': 'showScience',
            'showScience': 'confirmCalories',
            'confirmCalories': 'startMedicalPlan'
        };
        
        return flowMap[currentFlow] || currentFlow;
    }
    
    updateProfileFromInput(userInput) {
        // Extract and save relevant data based on current flow
        switch(this.currentFlow) {
            case 'dailySteps':
                const steps = this.aiService.parseUserData(userInput, 'steps');
                this.userProfile.update('dailySteps', steps);
                break;
            case 'exerciseAge':
                const age = this.aiService.parseUserData(userInput, 'age');
                const exercise = this.aiService.parseUserData(userInput, 'exercise');
                this.userProfile.update('age', age);
                this.userProfile.update('exerciseFrequency', exercise);
                break;
            case 'healthCondition':
                const condition = this.aiService.parseUserData(userInput, 'condition');
                this.userProfile.update('condition', condition);
                break;
        }
    }
    
    fallbackProcessing(userInput) {
        // Original pattern matching as fallback
        const flow = ConversationFlows[this.currentFlow];
        const lowerInput = userInput.toLowerCase();
        
        // Try to match with existing options
        let matched = false;
        if (flow.options) {
            for (const option of flow.options) {
                const optionText = option.text.toLowerCase();
                // Check if user input is similar to any option
                if (this.fuzzyMatch(lowerInput, optionText)) {
                    this.handleOptionClick(option);
                    matched = true;
                    break;
                }
            }
        }
        
        if (!matched) {
            // Provide a natural response and guide back
            this.addMessage("I understand! Let me help you with that. Based on what you've told me...", 'hannah');
            
            // Continue with best guess of next flow
            if (flow.options && flow.options[0].next) {
                setTimeout(() => {
                    this.processFlow(flow.options[0].next);
                }, 1500);
            }
        }
    }
    
    fuzzyMatch(input, target) {
        // Simple fuzzy matching
        const inputWords = input.split(' ');
        const targetWords = target.split(' ');
        
        let matches = 0;
        for (const inputWord of inputWords) {
            for (const targetWord of targetWords) {
                if (inputWord.includes(targetWord) || targetWord.includes(inputWord)) {
                    matches++;
                }
            }
        }
        
        return matches >= Math.min(2, targetWords.length / 2);
    }
}

// Initialize the chat when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.hannahChat = new HannahChat();
});