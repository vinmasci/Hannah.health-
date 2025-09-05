// AIUserAssessment - Step 1: Collect user data for nutrition planning
import eventBus from '../services/EventBus.js';

export class AIUserAssessment {
    constructor() {
        this.currentStep = 0;
        this.userData = {
            // Personal Info
            age: null,
            gender: null,
            height: null,
            weight: null,
            heightUnit: 'cm',
            weightUnit: 'kg',
            
            // Activity Level
            jobType: null, // sedentary, standing, physical
            exerciseFrequency: null, // never, 1-2, 3-4, 5-6, daily
            exerciseType: [], // cardio, strength, sports, yoga
            activityLevel: null, // calculated from job + exercise
            
            // Goals
            primaryGoal: null, // lose_weight, maintain, gain_muscle, gain_weight
            targetWeightLoss: null, // kg per week
            timeframe: null, // weeks
            
            // Dietary Preferences
            dietType: null, // regular, vegetarian, vegan, pescatarian, keto, paleo
            allergies: [],
            dislikes: [],
            
            // Calculated Values (for display)
            bmi: null,
            tdee: null,
            targetCalories: null,
            macros: {
                protein: null,
                carbs: null,
                fat: null
            }
        };
        
        this.questions = this.getQuestions();
    }
    
    getQuestions() {
        return [
            // Personal Info
            {
                id: 'age',
                text: "How old are you?",
                type: 'number',
                validation: (val) => val > 0 && val < 120,
                unit: 'years',
                placeholder: 'Enter age (this helps with accurate calorie calculations)'
            },
            {
                id: 'gender',
                text: "Biological gender:",
                type: 'choice',
                options: [
                    { value: 'male', label: 'A. Male' },
                    { value: 'female', label: 'B. Female' },
                    { value: 'not_specified', label: 'C. Rather not say' }
                ]
            },
            {
                id: 'height',
                text: "Height range:",
                type: 'choice',
                options: [
                    { value: '150', label: 'A. Under 5\'0" (150cm)' },
                    { value: '160', label: 'B. 5\'0" - 5\'4" (150-163cm)' },
                    { value: '170', label: 'C. 5\'5" - 5\'9" (164-175cm)' },
                    { value: '180', label: 'D. 5\'10" - 6\'1" (176-185cm)' },
                    { value: '190', label: 'E. Over 6\'1" (185cm+)' },
                    { value: 'not_specified', label: 'F. Rather not say' }
                ]
            },
            {
                id: 'weight',
                text: "Current weight range:",
                type: 'choice',
                options: [
                    { value: '55', label: 'A. Under 120 lbs (55kg)' },
                    { value: '65', label: 'B. 120-145 lbs (55-65kg)' },
                    { value: '75', label: 'C. 145-165 lbs (66-75kg)' },
                    { value: '85', label: 'D. 165-185 lbs (76-85kg)' },
                    { value: '95', label: 'E. 185-210 lbs (86-95kg)' },
                    { value: '110', label: 'F. Over 210 lbs (95kg+)' },
                    { value: 'not_specified', label: 'G. Rather not say' }
                ]
            },
            
            // Activity Level
            {
                id: 'jobType',
                text: "What type of work do you do?",
                type: 'choice',
                options: [
                    { value: 'sedentary', label: '💻 Desk job (mostly sitting)' },
                    { value: 'light', label: '🚶 Light activity (teacher, salesperson)' },
                    { value: 'moderate', label: '📦 Moderate activity (nurse, server)' },
                    { value: 'physical', label: '🏗️ Physical labor (construction, farming)' }
                ]
            },
            {
                id: 'exerciseFrequency',
                text: "How often do you exercise per week?",
                type: 'choice',
                options: [
                    { value: 'never', label: 'Never' },
                    { value: '1-2', label: '1-2 times' },
                    { value: '3-4', label: '3-4 times' },
                    { value: '5-6', label: '5-6 times' },
                    { value: 'daily', label: 'Every day' }
                ]
            },
            {
                id: 'exerciseType',
                text: "What types of exercise do you do? (Select all that apply)",
                type: 'multi_choice',
                options: [
                    { value: 'cardio', label: '🏃 Cardio (running, cycling)' },
                    { value: 'strength', label: '💪 Strength training' },
                    { value: 'sports', label: '⚽ Sports' },
                    { value: 'yoga', label: '🧘 Yoga/Pilates' },
                    { value: 'walking', label: '🚶 Walking' }
                ]
            },
            
            // Goals
            {
                id: 'primaryGoal',
                text: "What's your primary health goal?",
                type: 'choice',
                options: [
                    { value: 'lose_weight', label: '📉 Lose weight' },
                    { value: 'maintain', label: '⚖️ Maintain current weight' },
                    { value: 'gain_muscle', label: '💪 Build muscle' },
                    { value: 'gain_weight', label: '📈 Gain weight' },
                    { value: 'health', label: '❤️ General health improvement' }
                ]
            },
            
            // Dietary Preferences
            {
                id: 'dietType',
                text: "Do you follow any specific diet?",
                type: 'choice',
                options: [
                    { value: 'regular', label: '🍽️ No restrictions' },
                    { value: 'vegetarian', label: '🥗 Vegetarian' },
                    { value: 'vegan', label: '🌱 Vegan' },
                    { value: 'pescatarian', label: '🐟 Pescatarian' },
                    { value: 'keto', label: '🥑 Keto' },
                    { value: 'paleo', label: '🍖 Paleo' },
                    { value: 'mediterranean', label: '🫒 Mediterranean' }
                ]
            },
            {
                id: 'allergies',
                text: "Do you have any food allergies or intolerances? (Select all that apply)",
                type: 'multi_choice',
                options: [
                    { value: 'none', label: '✓ None' },
                    { value: 'dairy', label: '🥛 Dairy' },
                    { value: 'gluten', label: '🌾 Gluten' },
                    { value: 'nuts', label: '🥜 Nuts' },
                    { value: 'shellfish', label: '🦐 Shellfish' },
                    { value: 'eggs', label: '🥚 Eggs' },
                    { value: 'soy', label: '🫘 Soy' }
                ]
            }
        ];
    }
    
    create(mainBoard, insertBefore = null) {
        const column = document.createElement('div');
        column.className = 'ai-assessment-column category-column animate-in';
        column.dataset.category = 'ai-assessment';
        
        column.innerHTML = `
            <div class="assessment-header">
                <h3>
                    <img src="https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F44B.svg" 
                         width="20" height="20" class="openmoji-icon" alt="wave"> 
                    Welcome to Hannah.PT
                </h3>
                <button class="reset-btn" onclick="window.aiAssessment.reset()" title="Start Over" style="display: none;">↺</button>
            </div>
            <div class="assessment-content">
                <!-- Welcome Introduction (shown initially) -->
                <div class="welcome-intro">
                    <div class="conversation-messages" id="intro-messages">
                        <!-- Messages will be added dynamically via JavaScript -->
                    </div>
                </div>
                
                <!-- Assessment Questions (hidden initially) -->
                <div class="assessment-questions" style="display: none;">
                    <div class="conversation-messages" id="assessment-messages">
                        <!-- Questions will be added here in chat format -->
                    </div>
                    <div class="chat-input-area">
                        <input type="text" 
                               id="assessment-input" 
                               class="chat-input" 
                               placeholder="Type your answer..."
                               onkeypress="if(event.key === 'Enter') window.aiAssessment.handleUserResponse().catch(console.error)">
                        <button class="send-btn" onclick="window.aiAssessment.handleUserResponse().catch(console.error)">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/>
                            </svg>
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Insert at specified position
        if (insertBefore) {
            mainBoard.insertBefore(column, insertBefore);
        } else {
            mainBoard.appendChild(column);
        }
        
        // Don't add inline styles - using CSS file instead
        // this.addStyles();
        
        // Start the intro sequence
        this.startIntroSequence();
        
        // Add keyboard shortcut for test mode (Ctrl/Cmd + T)
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                console.log('🧪 Test mode activated via keyboard shortcut');
                this.useTestData();
            }
        });
        
        // Also add a small test mode indicator in console
        console.log('💡 Tip: Press Ctrl+T (or Cmd+T on Mac) to use test data');
        console.log('💡 Or add #test to URL to auto-start with test data');
        
        return column;
    }
    
    startIntroSequence() {
        const container = document.getElementById('intro-messages');
        if (!container) return;
        
        // First message
        this.addIntroMessage(container, 
            "<strong>Hey there, I'm Hannah</strong><br>" +
            "I'm your personal AI nutrition assistant and I'm here to help you plan your perfect nutrition & wellness profile.",
            0);
        
        // Second message - appears after 2 seconds
        setTimeout(() => {
            this.addIntroMessage(container,
                "First, I just need to ask you a few questions about your current lifestyle, fitness and desired outcomes (should take about 2 mins), then we'll:<br><br>" +
                "• Crunch the numbers and calculate your daily macro needs<br>" +
                "• Work out some meal plans with the basic building blocks and structure<br>" +
                "• Refine the building blocks with some flavours so this is sustainable",
                0);
        }, 2000);
        
        // Third message - appears after 4 seconds
        setTimeout(() => {
            this.addIntroMessage(container,
                "You don't need to answer anything you don't feel comfortable with.",
                0);
        }, 4000);
        
        // Add the Let's Go button - appears after 5 seconds
        setTimeout(() => {
            const buttonMessage = document.createElement('div');
            buttonMessage.className = 'button-container';
            buttonMessage.innerHTML = `
                <button class="btn-start" onclick="window.aiAssessment.startAssessment()">
                    Let's Go! →
                </button>
            `;
            container.appendChild(buttonMessage);
        }, 5000);
    }
    
    addIntroMessage(container, text, delay = 0) {
        const message = document.createElement('div');
        message.className = 'hannah-message';
        message.innerHTML = `
            <div class="hannah-avatar">H</div>
            <div class="message-bubble">
                <p>${text}</p>
            </div>
        `;
        
        if (delay > 0) {
            setTimeout(() => container.appendChild(message), delay);
        } else {
            container.appendChild(message);
        }
    }
    
    startAssessment() {
        // Check for test mode flag FIRST
        if (window.location.hash === '#test' || localStorage.getItem('testMode') === 'true') {
            this.useTestData();
            return;
        }
        
        // Hide intro, show questions
        const intro = document.querySelector('.welcome-intro');
        const questions = document.querySelector('.assessment-questions');
        const resetBtn = document.querySelector('.reset-btn');
        
        if (intro) intro.style.display = 'none';
        if (questions) questions.style.display = 'flex';
        if (resetBtn) resetBtn.style.display = 'block';
        
        // Update header for assessment column only
        const assessmentHeader = document.querySelector('.ai-assessment-column .assessment-header h3');
        if (assessmentHeader) {
            assessmentHeader.innerHTML = `
                <img src="https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F4CB.svg" 
                     width="20" height="20" class="openmoji-icon" alt="clipboard"> 
                Step 1: Quick Chat
            `;
        }
        
        // Don't show display column yet - wait until assessment is complete
        
        // Emit event that assessment has started
        eventBus.emit('assessment:started');
        
        // Initialize conversation
        this.currentQuestionIndex = 0;
        this.healthConditionFollowUpAdded = false;
        this.sessionId = Date.now().toString();
        this.conversationHistory = [];
        this.conversationFlow = this.getConversationFlow();
        
        // Start the conversation
        this.askNextQuestion();
    }
    
    showQuestionGroup(groupIndex) {
        const container = document.getElementById('assessment-messages');
        if (!container) return;
        
        // Clear previous questions
        container.innerHTML = '';
        
        // Define question groups
        const questionGroups = [
            // Group 1: Basic Info
            ['age', 'gender', 'height', 'weight'],
            // Group 2: Activity
            ['jobType', 'exerciseFrequency', 'exerciseType'],
            // Group 3: Goals
            ['primaryGoal', 'targetWeightLoss', 'timeframe'],
            // Group 4: Preferences
            ['dietType', 'allergies', 'dislikes']
        ];
        
        if (groupIndex >= questionGroups.length) {
            this.completeAssessment();
            return;
        }
        
        const currentGroup = questionGroups[groupIndex];
        
        // Add Hannah's message introducing this section
        const introMessages = [
            "Great! Let's start with some basic information about you:",
            "Now, tell me about your activity level:",
            "What are your health and fitness goals?",
            "Finally, let's talk about your dietary preferences:"
        ];
        
        this.addQuestionMessage(container, introMessages[groupIndex]);
        
        // Add questions for this group
        currentGroup.forEach(questionId => {
            const question = this.questions.find(q => q.id === questionId);
            if (question) {
                this.addQuestionInput(container, question);
            }
        });
        
        // Show continue button
        const continueBtn = document.querySelector('.btn-continue');
        if (continueBtn) {
            continueBtn.style.display = 'block';
            continueBtn.onclick = () => {
                // Validate inputs before continuing
                if (this.validateCurrentGroup(currentGroup)) {
                    this.showQuestionGroup(groupIndex + 1);
                }
            };
        }
        
        // Update progress
        const progress = ((groupIndex + 1) / questionGroups.length) * 100;
        this.updateProgress(progress);
    }
    
    addQuestionMessage(container, text) {
        const message = document.createElement('div');
        message.className = 'hannah-message';
        message.innerHTML = `
            <div class="hannah-avatar">H</div>
            <div class="message-bubble">
                <p>${text}</p>
            </div>
        `;
        container.appendChild(message);
    }
    
    addQuestionInput(container, question) {
        const inputDiv = document.createElement('div');
        inputDiv.className = 'question-input-group';
        
        let inputHTML = '';
        
        switch (question.type) {
            case 'number':
                inputHTML = `
                    <label>${question.text}</label>
                    <input type="number" 
                           id="input-${question.id}" 
                           class="question-input"
                           placeholder="Enter ${question.unit || 'value'}"
                           onchange="window.aiAssessment.saveAnswer('${question.id}', this.value)">
                `;
                break;
                
            case 'choice':
                inputHTML = `
                    <label>${question.text}</label>
                    <div class="choice-buttons-inline">
                        ${question.options.map(opt => `
                            <button class="choice-btn-inline" 
                                    data-question="${question.id}"
                                    data-value="${opt.value}"
                                    onclick="window.aiAssessment.selectChoice('${question.id}', '${opt.value}', this)">
                                ${opt.label}
                            </button>
                        `).join('')}
                    </div>
                `;
                break;
                
            case 'multi':
                inputHTML = `
                    <label>${question.text}</label>
                    <div class="checkbox-group">
                        ${question.options.map(opt => `
                            <label class="checkbox-label">
                                <input type="checkbox" 
                                       value="${opt.value}"
                                       onchange="window.aiAssessment.updateMultiChoice('${question.id}', this)">
                                <span>${opt.label}</span>
                            </label>
                        `).join('')}
                    </div>
                `;
                break;
        }
        
        inputDiv.innerHTML = inputHTML;
        container.appendChild(inputDiv);
    }
    
    validateCurrentGroup(groupIds) {
        // Check if all required fields in the group are filled
        for (const id of groupIds) {
            const value = this.userData[id];
            if (!value && value !== 0) {
                alert('Please fill in all fields before continuing');
                return false;
            }
        }
        return true;
    }
    
    updateProgress(percent) {
        // You can add a progress indicator if needed
        console.log(`Progress: ${percent}%`);
    }
    
    showQuestion(index) {
        if (index < 0 || index >= this.questions.length) return;
        
        this.currentStep = index;
        const question = this.questions[index];
        const progress = ((index + 1) / this.questions.length) * 100;
        
        // Update progress bar
        const progressBar = document.querySelector('.progress-fill');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
        
        // Update question text
        const questionText = document.querySelector('.question-text');
        if (questionText) {
            questionText.innerHTML = `<h4>Question ${index + 1} of ${this.questions.length}</h4><p>${question.text}</p>`;
        }
        
        // Generate answer input based on type
        const answerArea = document.querySelector('.answer-area');
        if (answerArea) {
            answerArea.innerHTML = this.generateAnswerInput(question);
        }
        
        // Update navigation buttons
        const prevBtn = document.querySelector('.btn-prev');
        const nextBtn = document.querySelector('.btn-next');
        
        if (prevBtn) {
            prevBtn.style.display = index > 0 ? 'block' : 'none';
        }
        
        if (nextBtn) {
            nextBtn.style.display = 'block';
            nextBtn.textContent = index === this.questions.length - 1 ? 'Calculate Results' : 'Next →';
        }
    }
    
    generateAnswerInput(question) {
        switch (question.type) {
            case 'number':
                return `
                    <input type="number" 
                           id="answer-${question.id}" 
                           class="answer-input"
                           value="${this.userData[question.id] || ''}"
                           onchange="window.aiAssessment.saveAnswer('${question.id}', this.value)">
                    ${question.unit ? `<span class="unit-label">${question.unit}</span>` : ''}
                `;
                
            case 'number_with_unit':
                const currentUnit = this.userData[question.id + 'Unit'] || question.units[0].value;
                return `
                    <div class="input-with-unit">
                        <input type="number" 
                               id="answer-${question.id}" 
                               class="answer-input"
                               value="${this.userData[question.id] || ''}"
                               onchange="window.aiAssessment.saveAnswer('${question.id}', this.value)">
                        <select class="unit-select" 
                                onchange="window.aiAssessment.saveAnswer('${question.id}Unit', this.value)">
                            ${question.units.map(unit => 
                                `<option value="${unit.value}" ${currentUnit === unit.value ? 'selected' : ''}>${unit.label}</option>`
                            ).join('')}
                        </select>
                    </div>
                `;
                
            case 'choice':
                return `
                    <div class="choice-buttons">
                        ${question.options.map(opt => `
                            <button class="choice-btn ${this.userData[question.id] === opt.value ? 'selected' : ''}"
                                    onclick="window.aiAssessment.selectChoice('${question.id}', '${opt.value}')">
                                ${opt.label}
                            </button>
                        `).join('')}
                    </div>
                `;
                
            case 'multi_choice':
                const selected = this.userData[question.id] || [];
                return `
                    <div class="multi-choice-buttons">
                        ${question.options.map(opt => `
                            <button class="multi-choice-btn ${selected.includes(opt.value) ? 'selected' : ''}"
                                    onclick="window.aiAssessment.toggleMultiChoice('${question.id}', '${opt.value}')">
                                ${opt.label}
                            </button>
                        `).join('')}
                    </div>
                `;
                
            default:
                return '';
        }
    }
    
    saveAnswer(key, value) {
        this.userData[key] = value;
        this.emitUpdate();
    }
    
    selectChoice(key, value, button) {
        this.userData[key] = value;
        
        // Update UI - handle both old and new button styles
        if (button) {
            // New style with button reference
            const buttons = document.querySelectorAll(`[data-question="${key}"]`);
            buttons.forEach(btn => {
                btn.classList.remove('selected');
            });
            button.classList.add('selected');
        } else if (event && event.target) {
            // Old style with event.target
            document.querySelectorAll(`.choice-btn`).forEach(btn => {
                btn.classList.remove('selected');
            });
            event.target.classList.add('selected');
        }
        
        this.emitUpdate();
    }
    
    updateMultiChoice(questionId, checkbox) {
        if (!this.userData[questionId]) {
            this.userData[questionId] = [];
        }
        
        if (checkbox.checked) {
            this.userData[questionId].push(checkbox.value);
        } else {
            const index = this.userData[questionId].indexOf(checkbox.value);
            if (index > -1) {
                this.userData[questionId].splice(index, 1);
            }
        }
        
        this.emitUpdate();
    }
    
    getConversationFlow() {
        return [
            {
                id: 'healthConditions',
                question: "Perfect! Let's start with an important question. Do you have any health conditions that significantly influence your meal planning?",
                hint: "(Like diabetes, heart disease, allergies, etc. This helps me create a safe plan for you)",
                type: 'text',
                validation: (val) => true
            },
            {
                id: 'age',
                question: "How old are you?",
                hint: "(Age affects metabolism and calorie needs. You can give an exact age like '35' or an age range like 'mid 30s' if you prefer)",
                type: 'text',
                validation: (val) => true,
                errorMessage: "Please enter a valid age or age range"
            },
            {
                id: 'gender',
                question: "What's your biological gender?",
                hint: "(This affects your metabolic rate)",
                type: 'choice',
                options: ['male', 'female', 'prefer not to say'],
                validation: (val) => true
            },
            {
                id: 'height',
                question: "How tall are you?",
                hint: "(You can say something like '5 feet 8 inches' or '173 cm')",
                type: 'text',
                validation: (val) => true
            },
            {
                id: 'weight', 
                question: "What's your approximate current weight?",
                hint: "(You can use lbs or kg - like '165 lbs' or '75 kg', or say 'rather not say')",
                type: 'text',
                validation: (val) => true
            },
            {
                id: 'steps',
                question: "How many steps do you take on average per day, including work hours?",
                hint: "(You can estimate - like '3000 steps', '8000 steps', or 'I sit most of the day')",
                type: 'text',
                validation: (val) => true
            },
            {
                id: 'exercise',
                question: "Do you exercise during the week? If so, what types and how often?",
                hint: "(Be specific - like '3x week gym strength training', 'daily yoga 30 mins', or 'no formal exercise')",
                type: 'text',
                validation: (val) => true
            },
            {
                id: 'goal',
                question: "What's your main health goal right now?",
                hint: "(Lose weight, gain muscle, maintain, improve energy, etc.)",
                type: 'text',
                validation: (val) => true
            },
            {
                id: 'dietary',
                question: "Do you have any dietary preferences or restrictions?",
                hint: "(Vegetarian, vegan, allergies, or just say 'none')",
                type: 'text',
                validation: (val) => true
            }
        ];
    }
    
    askNextQuestion() {
        const container = document.getElementById('assessment-messages');
        if (!container) return;
        
        if (this.currentQuestionIndex >= this.conversationFlow.length) {
            this.completeAssessment();
            return;
        }
        
        const currentQ = this.conversationFlow[this.currentQuestionIndex];
        const questionNumber = this.currentQuestionIndex + 1;
        const totalQuestions = this.conversationFlow.length;
        
        // Add Hannah's question with numbering
        const questionDiv = document.createElement('div');
        questionDiv.className = 'hannah-message';
        questionDiv.innerHTML = `
            <div class="hannah-avatar">H</div>
            <div class="message-bubble">
                <p><strong>Question ${questionNumber} of ${totalQuestions}:</strong> ${currentQ.question}</p>
                ${currentQ.hint ? `<p class="hint-text">${currentQ.hint}</p>` : ''}
            </div>
        `;
        container.appendChild(questionDiv);
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
        
        // Focus input
        const input = document.getElementById('assessment-input');
        if (input) {
            input.focus();
            input.placeholder = currentQ.type === 'choice' ? 
                `Type one: ${currentQ.options.join(', ')}` : 
                'Type your answer...';
        }
    }
    
    async handleUserResponse() {
        const input = document.getElementById('assessment-input');
        const container = document.getElementById('assessment-messages');
        
        if (!input || !input.value.trim()) return;
        
        const userResponse = input.value.trim();
        const currentQ = this.conversationFlow[this.currentQuestionIndex];
        
        // Add user's message
        const userDiv = document.createElement('div');
        userDiv.className = 'user-message';
        userDiv.innerHTML = `
            <div class="message-bubble user-bubble">
                <p>${userResponse}</p>
            </div>
        `;
        container.appendChild(userDiv);
        
        // Clear input
        input.value = '';
        
        // Store conversation history
        if (!this.conversationHistory) {
            this.conversationHistory = [];
        }
        this.conversationHistory.push({
            role: 'user',
            content: userResponse
        });
        
        // Send to AI for intelligent processing
        try {
            const response = await fetch('/api/ai/assessment-response', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionId: this.sessionId || Date.now().toString(),
                    currentQuestion: currentQ,
                    userResponse: userResponse,
                    userData: this.userData,
                    conversationHistory: this.conversationHistory
                })
            });
            
            if (!response.ok) throw new Error('Failed to get AI response');
            
            const aiData = await response.json();
            
            // Show AI's response
            setTimeout(() => {
                const aiDiv = document.createElement('div');
                aiDiv.className = 'hannah-message';
                // Check if AI response mentions "move on" to add a pill button
                const shouldAddPill = aiData.aiResponse.toLowerCase().includes('move on') || 
                                     aiData.aiResponse.toLowerCase().includes('next question');
                
                aiDiv.innerHTML = `
                    <div class="hannah-avatar">H</div>
                    <div class="message-bubble">
                        <p>${aiData.aiResponse}</p>
                        ${shouldAddPill ? `
                        <div class="quick-action-pills" style="margin-top: 10px;">
                            <button class="pill-button next-question-pill" style="
                                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                                color: white;
                                border: none;
                                padding: 8px 16px;
                                border-radius: 20px;
                                cursor: pointer;
                                font-size: 14px;
                                transition: transform 0.2s;
                            ">Next Question →</button>
                        </div>
                        ` : ''}
                    </div>
                `;
                container.appendChild(aiDiv);
                container.scrollTop = container.scrollHeight;
                
                // Add click handler for the pill button if it exists
                if (shouldAddPill) {
                    const pillButton = aiDiv.querySelector('.next-question-pill');
                    if (pillButton) {
                        pillButton.addEventListener('click', () => {
                            // Send "move on" as the response
                            input.value = 'move on';
                            this.handleUserResponse();
                        });
                        
                        // Add hover effect
                        pillButton.addEventListener('mouseenter', () => {
                            pillButton.style.transform = 'scale(1.05)';
                        });
                        pillButton.addEventListener('mouseleave', () => {
                            pillButton.style.transform = 'scale(1)';
                        });
                    }
                }
                
                // Store AI response in history
                this.conversationHistory.push({
                    role: 'assistant',
                    content: aiData.aiResponse
                });
                
                // Store parsed data AND raw responses
                if (aiData.parsedData) {
                    Object.assign(this.userData, aiData.parsedData);
                }
                
                // ALWAYS store the raw user response for the current question
                // This preserves exactly what the user said
                this.userData[`${currentQ.id}_raw`] = userResponse;
                this.userData[currentQ.id] = userResponse; // Keep the actual user input
                
                // If AI needs follow-up, wait for user response
                if (aiData.needsFollowUp) {
                    // Stay on current question for follow-up
                    input.focus();
                } else {
                    // Process the response normally and move to next question
                    const parsedValue = this.parseResponse(currentQ, userResponse);
                    this.userData[currentQ.id] = parsedValue;
                    
                    // For goal question, make sure primaryGoal is set
                    if (currentQ.id === 'goal') {
                        this.userData.primaryGoal = parsedValue;
                    }
                    
                    this.emitUpdate();
                    
                    // Move to next question
                    this.currentQuestionIndex++;
                    
                    // Ask next question after a delay
                    setTimeout(() => {
                        this.askNextQuestion();
                    }, 1200);
                }
            }, 500);
            
        } catch (error) {
            console.error('AI response error:', error);
            // Fallback to original validation logic
            if (currentQ.validation && !currentQ.validation(userResponse)) {
                // Show error message
                setTimeout(() => {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'hannah-message';
                    errorDiv.innerHTML = `
                        <div class="hannah-avatar">H</div>
                        <div class="message-bubble">
                            <p>${currentQ.errorMessage || "I didn't quite get that. Could you try again?"}</p>
                        </div>
                    `;
                    container.appendChild(errorDiv);
                    container.scrollTop = container.scrollHeight;
                }, 500);
                return;
            }
            
            // Store the response
            this.userData[currentQ.id] = this.parseResponse(currentQ, userResponse);
            this.emitUpdate();
            
            // Move to next question
            this.currentQuestionIndex++;
            
            // Add a small delay before next question for natural flow
            setTimeout(() => {
                this.askNextQuestion();
            }, 800);
        }
    }
    
    parseResponse(question, response) {
        const lower = response.toLowerCase();
        
        // Parse specific types
        switch(question.id) {
            case 'healthConditions':
                // Check if they have health conditions
                if (lower.includes('yes') || lower.includes('diabetes') || lower.includes('heart') || 
                    lower.includes('allerg') || lower.includes('hypertension') || lower.includes('cholesterol') ||
                    lower.includes('celiac') || lower.includes('ibs') || lower.includes('crohn')) {
                    this.userData.hasHealthConditions = true;
                    this.userData.healthConditions = response;
                    
                    // Add follow-up question if they said yes
                    if (!this.healthConditionFollowUpAdded && (lower.includes('yes') || lower.length < 10)) {
                        this.healthConditionFollowUpAdded = true;
                        // Insert follow-up question after current one
                        this.conversationFlow.splice(this.currentQuestionIndex + 1, 0, {
                            id: 'healthConditionDetails',
                            question: "Could you share more about your health condition? This will help me tailor your meal plan appropriately.",
                            hint: "(You can be as specific as you're comfortable with, or say 'prefer not to specify')",
                            type: 'text',
                            validation: (val) => true
                        });
                    }
                } else if (lower.includes('no') || lower.includes('none')) {
                    this.userData.hasHealthConditions = false;
                    this.userData.healthConditions = 'none';
                } else {
                    this.userData.hasHealthConditions = false;
                    this.userData.healthConditions = response;
                }
                return response;
                
            case 'healthConditionDetails':
                // Store the detailed health condition information
                if (lower.includes('prefer not') || lower.includes('rather not')) {
                    this.userData.healthConditionDetails = 'not specified';
                } else {
                    this.userData.healthConditionDetails = response;
                }
                return response;
                
            case 'age':
                // Handle age ranges
                const ageNum = parseInt(response);
                if (!isNaN(ageNum)) {
                    return ageNum;
                }
                // Parse age ranges like "mid 30s", "late 40s", etc.
                if (lower.includes('early')) {
                    if (lower.includes('20')) return 22;
                    if (lower.includes('30')) return 32;
                    if (lower.includes('40')) return 42;
                    if (lower.includes('50')) return 52;
                    if (lower.includes('60')) return 62;
                }
                if (lower.includes('mid')) {
                    if (lower.includes('20')) return 25;
                    if (lower.includes('30')) return 35;
                    if (lower.includes('40')) return 45;
                    if (lower.includes('50')) return 55;
                    if (lower.includes('60')) return 65;
                }
                if (lower.includes('late')) {
                    if (lower.includes('20')) return 28;
                    if (lower.includes('30')) return 38;
                    if (lower.includes('40')) return 48;
                    if (lower.includes('50')) return 58;
                    if (lower.includes('60')) return 68;
                }
                // Default age if couldn't parse
                return 35;
                
            case 'gender':
                if (lower.includes('male') && !lower.includes('female')) return 'male';
                if (lower.includes('female')) return 'female';
                return 'not_specified';
                
            case 'height':
                // Parse height - handle various formats
                if (lower.includes('cm')) {
                    this.userData.heightUnit = 'cm';
                    return parseInt(response);
                } else if (lower.includes('feet') || lower.includes('ft') || lower.includes("'")) {
                    // Convert feet/inches to cm
                    const matches = response.match(/(\d+).*?(\d+)/);
                    if (matches) {
                        const feet = parseInt(matches[1]);
                        const inches = parseInt(matches[2] || 0);
                        this.userData.heightUnit = 'cm';
                        return Math.round((feet * 30.48) + (inches * 2.54));
                    }
                }
                this.userData.heightUnit = 'cm';
                return parseInt(response) || 170; // default
                
            case 'weight':
                // Handle "rather not say"
                if (lower.includes('rather not') || lower.includes('prefer not')) {
                    this.userData.weightUnit = 'kg';
                    // Use average weight estimate based on height if available
                    const heightCm = this.userData.height || 170;
                    // BMI 22.5 (middle of normal range) as estimate
                    return Math.round((22.5 * (heightCm / 100) * (heightCm / 100)));
                }
                // Parse weight
                const weightNum = parseInt(response);
                if (lower.includes('kg')) {
                    this.userData.weightUnit = 'kg';
                    return weightNum;
                } else if (lower.includes('lb') || lower.includes('pound')) {
                    this.userData.weightUnit = 'kg';
                    return Math.round(weightNum * 0.453592); // convert to kg
                }
                this.userData.weightUnit = 'kg';
                return weightNum;
                
            case 'steps':
                // Parse daily steps to determine base activity level
                const steps = parseInt(response.replace(/[^0-9]/g, ''));
                
                // Store full context about their activity
                this.userData.stepsContext = response;
                this.userData.dailySteps = steps || 0;  // Store for display
                
                // Map steps to activity level
                if (steps < 3000 || lower.includes('sit')) {
                    this.userData.baseActivity = 'sedentary';
                } else if (steps < 5000) {
                    this.userData.baseActivity = 'light';
                } else if (steps < 8000) {
                    this.userData.baseActivity = 'moderate';
                } else if (steps < 12000) {
                    this.userData.baseActivity = 'active';
                } else {
                    this.userData.baseActivity = 'very_active';
                }
                
                // Return the parsed value
                return steps || 0;
                
            case 'exercise':
                // Store the full exercise details for display
                this.userData.exerciseDetails = response;
                
                // Parse exercise frequency and type
                if (lower.includes('no') || lower.includes('none')) {
                    this.userData.exerciseFrequency = 'never';
                    this.userData.exerciseType = 'none';
                } else if (lower.includes('daily') || lower.includes('every day') || lower.includes('7')) {
                    this.userData.exerciseFrequency = 'daily';
                } else if (lower.includes('5') || lower.includes('6')) {
                    this.userData.exerciseFrequency = '5-6';
                } else if (lower.includes('3') || lower.includes('4')) {
                    this.userData.exerciseFrequency = '3-4';
                } else if (lower.includes('1') || lower.includes('2') || lower.includes('twice')) {
                    this.userData.exerciseFrequency = '1-2';
                } else {
                    this.userData.exerciseFrequency = '3-4';
                }
                
                // Store exercise types
                if (lower.includes('strength') || lower.includes('weight') || lower.includes('gym')) {
                    this.userData.exerciseType = 'strength';
                } else if (lower.includes('cardio') || lower.includes('run') || lower.includes('bike')) {
                    this.userData.exerciseType = 'cardio';
                } else if (lower.includes('yoga') || lower.includes('pilates')) {
                    this.userData.exerciseType = 'flexibility';
                } else if (lower.includes('mix') || lower.includes('both')) {
                    this.userData.exerciseType = 'mixed';
                } else {
                    this.userData.exerciseType = 'general';
                }
                
                // Parse duration if mentioned (e.g., "30 mins", "1 hour", "45 minutes")
                const durationMatch = response.match(/(\d+)\s*(min|minute|hour|hr)/i);
                if (durationMatch) {
                    const amount = parseInt(durationMatch[1]);
                    const unit = durationMatch[2].toLowerCase();
                    if (unit.startsWith('h')) {
                        this.userData.exerciseDuration = amount * 60; // Convert hours to minutes
                    } else {
                        this.userData.exerciseDuration = amount;
                    }
                }
                
                // Parse intensity if mentioned
                if (lower.includes('intense') || lower.includes('high intensity') || lower.includes('hiit')) {
                    this.userData.exerciseIntensity = 'high';
                } else if (lower.includes('moderate') || lower.includes('medium')) {
                    this.userData.exerciseIntensity = 'moderate';
                } else if (lower.includes('light') || lower.includes('easy') || lower.includes('gentle')) {
                    this.userData.exerciseIntensity = 'light';
                } else {
                    this.userData.exerciseIntensity = 'moderate'; // Default
                }
                
                // Calculate overall activity multiplier combining steps and exercise
                this.calculateActivityMultiplier();
                return response;
                
            case 'goal':
                // Store full goal context
                this.userData.goalDetails = response;
                
                // Check for weight loss (including NAFLD improvement)
                if (lower.includes('lose') || lower.includes('weight loss') || 
                    lower.includes('nafld') || lower.includes('fatty liver')) {
                    this.userData.primaryGoal = 'lose_weight';
                    return 'lose_weight';
                }
                if (lower.includes('gain muscle') || lower.includes('build')) {
                    this.userData.primaryGoal = 'gain_muscle';
                    return 'gain_muscle';
                }
                if (lower.includes('maintain')) {
                    this.userData.primaryGoal = 'maintain';
                    return 'maintain';
                }
                // Default to lose_weight if NAFLD was mentioned earlier
                if (this.userData.healthConditions && this.userData.healthConditions.toString().toLowerCase().includes('nafld')) {
                    this.userData.primaryGoal = 'lose_weight';
                    return 'lose_weight';
                }
                this.userData.primaryGoal = 'maintain';
                return 'maintain';
                
            case 'dietary':
                // Store full dietary context
                this.userData.dietaryDetails = response;
                
                // Parse dietary preferences
                if (lower.includes('vegan')) {
                    this.userData.dietType = 'vegan';
                } else if (lower.includes('vegetarian')) {
                    this.userData.dietType = 'vegetarian';
                } else if (lower.includes('pescatarian')) {
                    this.userData.dietType = 'pescatarian';
                } else if (lower.includes('keto')) {
                    this.userData.dietType = 'keto';
                } else if (lower.includes('paleo')) {
                    this.userData.dietType = 'paleo';
                } else if (lower.includes('mediterranean')) {
                    this.userData.dietType = 'mediterranean';
                } else if (lower.includes('none') || lower.includes('no') || lower.includes('regular')) {
                    this.userData.dietType = 'regular';
                } else {
                    // Don't default - keep what user said
                    this.userData.dietType = 'not specified';
                }
                return response;
                
            default:
                return response;
        }
    }
    
    completeAssessment() {
        const container = document.getElementById('assessment-messages');
        
        // Hide input area
        const inputArea = document.querySelector('.chat-input-area');
        if (inputArea) inputArea.style.display = 'none';
        
        // Add completion message
        const completeDiv = document.createElement('div');
        completeDiv.className = 'hannah-message';
        completeDiv.innerHTML = `
            <div class="hannah-avatar">H</div>
            <div class="message-bubble">
                <p><strong>Perfect! I've got everything I need! 🎉</strong></p>
                <p>Check out the panel on the left - I've calculated your personalized nutrition targets.</p>
                <p>In a moment, I'll show you some meal suggestions that fit these targets perfectly!</p>
            </div>
        `;
        container.appendChild(completeDiv);
        
        // Calculate and emit results
        this.calculateResults();
    }
    
    toggleMultiChoice(key, value) {
        if (!this.userData[key]) {
            this.userData[key] = [];
        }
        
        // Handle "none" option
        if (value === 'none') {
            this.userData[key] = ['none'];
        } else {
            // Remove "none" if selecting other options
            const noneIndex = this.userData[key].indexOf('none');
            if (noneIndex > -1) {
                this.userData[key].splice(noneIndex, 1);
            }
            
            const index = this.userData[key].indexOf(value);
            if (index > -1) {
                this.userData[key].splice(index, 1);
            } else {
                this.userData[key].push(value);
            }
        }
        
        // Update UI
        event.target.classList.toggle('selected');
        this.emitUpdate();
    }
    
    nextQuestion() {
        if (this.currentStep === this.questions.length - 1) {
            // Calculate results and emit
            this.calculateResults();
        } else {
            this.showQuestion(this.currentStep + 1);
        }
    }
    
    previousQuestion() {
        if (this.currentStep > 0) {
            this.showQuestion(this.currentStep - 1);
        }
    }
    
    calculateActivityMultiplier() {
        // Combine daily steps and exercise to determine overall activity multiplier
        const baseMultipliers = {
            'sedentary': 1.2,
            'light': 1.3,
            'moderate': 1.4,
            'active': 1.5,
            'very_active': 1.6
        };
        
        const exerciseBonus = {
            'never': 0,
            '1-2': 0.075,
            '3-4': 0.15,
            '5-6': 0.225,
            'daily': 0.3
        };
        
        const base = baseMultipliers[this.userData.baseActivity] || 1.3;
        const bonus = exerciseBonus[this.userData.exerciseFrequency] || 0;
        
        // Activity multiplier for TDEE calculation
        this.userData.activityMultiplier = Math.min(base + bonus, 1.9);
    }
    
    calculateResults() {
        // Calculate BMI
        const heightInM = this.userData.heightUnit === 'cm' ? 
            this.userData.height / 100 : 
            this.userData.height * 0.3048; // feet to meters
            
        const weightInKg = this.userData.weightUnit === 'kg' ? 
            this.userData.weight : 
            this.userData.weight * 0.453592; // lbs to kg
            
        this.userData.bmi = weightInKg / (heightInM * heightInM);
        
        // Calculate BMR using Mifflin-St Jeor Equation
        let bmr;
        if (this.userData.gender === 'male') {
            bmr = (10 * weightInKg) + (6.25 * (heightInM * 100)) - (5 * this.userData.age) + 5;
        } else {
            bmr = (10 * weightInKg) + (6.25 * (heightInM * 100)) - (5 * this.userData.age) - 161;
        }
        
        // Store BMR for consistency across components
        this.userData.bmr = Math.round(bmr);
        
        // Calculate TDEE with consistent formula
        // Base activity level (sedentary = 1.2)
        let activityMultiplier = 1.2;
        
        // Add calories from daily steps (0.04 cal per step)
        const stepCalories = (this.userData.dailySteps || 0) * 0.04;
        
        // Add activity multiplier based on exercise
        if (this.userData.exerciseFrequency) {
            const exerciseMultipliers = {
                'daily': 0.55,      // 1.75 total
                '5-6': 0.45,        // 1.65 total
                '3-4': 0.35,        // 1.55 total
                '1-2': 0.2,         // 1.4 total
                'never': 0          // 1.2 total
            };
            activityMultiplier += exerciseMultipliers[this.userData.exerciseFrequency] || 0;
        }
        
        // Calculate TDEE = BMR * activity factor + step calories
        this.userData.tdee = Math.round(bmr * activityMultiplier + stepCalories);
        this.userData.activityMultiplier = activityMultiplier; // Store for reference
        
        // Calculate target calories based on goal
        switch (this.userData.primaryGoal) {
            case 'lose_weight':
                this.userData.targetCalories = this.userData.tdee - 500; // 1 lb/week loss
                break;
            case 'gain_muscle':
                this.userData.targetCalories = this.userData.tdee + 300; // Lean bulk
                break;
            case 'gain_weight':
                this.userData.targetCalories = this.userData.tdee + 500;
                break;
            default:
                this.userData.targetCalories = this.userData.tdee;
        }
        
        // Calculate macros
        this.calculateMacros();
        
        // Emit all data to display column
        this.emitResults();
    }
    
    calculateMacros() {
        const calories = this.userData.targetCalories;
        
        // Macro split based on goal
        let proteinRatio, carbRatio, fatRatio;
        
        switch (this.userData.primaryGoal) {
            case 'lose_weight':
                proteinRatio = 0.30; // Higher protein for satiety
                carbRatio = 0.35;
                fatRatio = 0.35;
                break;
            case 'gain_muscle':
                proteinRatio = 0.30;
                carbRatio = 0.45; // More carbs for energy
                fatRatio = 0.25;
                break;
            case 'gain_weight':
                proteinRatio = 0.25;
                carbRatio = 0.45;
                fatRatio = 0.30;
                break;
            default:
                proteinRatio = 0.25;
                carbRatio = 0.45;
                fatRatio = 0.30;
        }
        
        // Calculate grams (4 cal/g for protein and carbs, 9 cal/g for fat)
        this.userData.macros = {
            protein: Math.round((calories * proteinRatio) / 4),
            carbs: Math.round((calories * carbRatio) / 4),
            fat: Math.round((calories * fatRatio) / 9)
        };
    }
    
    emitUpdate() {
        // Emit partial updates as user answers questions
        eventBus.emit('assessment:update', { userData: this.userData });
    }
    
    emitResults() {
        // Store the complete conversation history for future AI context
        this.userData.conversationHistory = this.conversationHistory;
        this.userData.sessionId = this.sessionId;
        
        // Store a summary of key information for quick AI reference
        this.userData.userContext = {
            hasHealthConditions: this.userData.healthConditions && this.userData.healthConditions !== 'none',
            healthConditionDetails: this.userData.healthConditions_raw || this.userData.healthConditions,
            activityLevel: this.userData.baseActivity,
            exerciseRoutine: this.userData.exercise_raw || this.userData.exerciseDetails,
            primaryGoal: this.userData.goal_raw || this.userData.goalDetails,
            dietaryPreferences: this.userData.dietary_raw || this.userData.dietaryDetails,
            assessmentDate: new Date().toISOString()
        };
        
        // Emit final calculated results with test mode flag
        eventBus.emit('assessment:complete', { 
            userData: this.userData,
            isTestMode: this.isTestMode || false
        });
        
        // Show completion message
        const questionArea = document.querySelector('.question-area');
        if (questionArea) {
            questionArea.innerHTML = `
                <div class="completion-message">
                    <h3>✅ Assessment Complete!</h3>
                    <p>Your personalized nutrition plan has been calculated.</p>
                    <p>Check Step 2 to see your results and Step 3 for meal suggestions.</p>
                </div>
            `;
        }
    }
    
    reset() {
        this.currentStep = 0;
        this.userData = {};
        this.showQuestion(0);
    }
    
    /**
     * Use test data for quick testing
     */
    useTestData() {
        console.log('🧪 Using test data for quick testing');
        this.isTestMode = true;  // Set test mode flag
        
        // Populate with test data based on real conversation example
        this.userData = {
            // Raw responses (exactly what user typed)
            healthConditions_raw: 'NAFLD',
            age_raw: '39',
            gender_raw: 'male',
            height_raw: "5'10\"",
            weight_raw: '81kg',
            steps_raw: 'about 10000',
            exercise_raw: 'run and gym 3x each week',
            goal_raw: 'lose weight and reduce liver inflammation',
            dietary_raw: 'no specific preferences',
            
            // Health conditions
            healthConditions: 'NAFLD',
            hasHealthConditions: true,
            healthConditionDetails: 'mild, recently diagnosed',
            
            // Personal info
            age: 39,
            gender: 'male',
            height: 178,  // cm
            heightUnit: 'cm',
            weight: 81,   // kg
            weightUnit: 'kg',
            
            // Activity
            dailySteps: 10000,  // "about 10000"
            stepsContext: 'about 10000, at work as a concrete labourer, so fairly moderate',
            baseActivity: 'moderately_active',
            occupation: 'concrete labourer',
            exerciseDetails: '2x gym for 45 mins moderate, 3x run for 45mins, moderate to intense',
            exerciseFrequency: '5',  // 2+3 = 5 times per week
            exerciseType: ['strength', 'cardio'],
            exerciseDuration: 45,
            exerciseIntensity: 'moderate to intense',
            
            // Goals
            primaryGoal: 'lose_weight',
            goalDetails: 'to lose weight and improve NAFLD',
            
            // Diet preferences
            dietPreferences: 'No specific restrictions, prefer Mediterranean style',
            dietType: 'mediterranean',
            
            // Calculated values will be computed
            bmi: null,
            tdee: null,
            targetCalories: null,
            macros: {
                protein: null,
                carbs: null,
                fat: null
            }
        };
        
        // Hide intro sections
        const intro = document.querySelector('.welcome-intro');
        const questions = document.querySelector('.assessment-questions');
        if (intro) intro.style.display = 'none';
        if (questions) questions.style.display = 'none';
        
        // Show completion message
        const messagesContainer = document.getElementById('assessment-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = `
                <div class="hannah-message">
                    <div class="message-avatar">H</div>
                    <div class="message-content">
                        <strong>Test Mode Active!</strong><br>
                        Using pre-filled data for testing.<br>
                        Age: 35, Male, 178cm, 85kg<br>
                        Condition: NAFLD<br>
                        Goal: Weight Loss<br>
                        Activity: 7500 steps + 3x gym/week
                    </div>
                </div>
            `;
        }
        
        // Calculate results immediately
        setTimeout(() => {
            this.calculateResults();
        }, 1000);
    }
    
    addStyles() {
        // All styles have been moved to ai-assessment-column.css
        // This method is kept empty to prevent breaking existing calls
        return;
    }
}

// Create singleton instance and expose to window
const aiAssessment = new AIUserAssessment();
window.aiAssessment = aiAssessment;

export default aiAssessment;