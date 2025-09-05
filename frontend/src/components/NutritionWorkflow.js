// NutritionWorkflow.js - Orchestrates the 4-step nutrition planning workflow
// This is the main controller that manages all workflow components

import AIUserAssessment from './AIUserAssessment.js';
import AIDisplayColumn from './AIDisplayColumn.js';
// AIMealPlan is loaded via script tag in index.html
import eventBus from '../services/EventBus.js';

export class NutritionWorkflow {
    constructor() {
        this.components = {
            assessment: null,
            display: null,
            suggestions: null // Will be added later
        };
        
        this.isInitialized = false;
        this.workflowData = {
            userData: null,
            calculations: null,
            suggestions: null,
            approvedMeals: []
        };
    }
    
    /**
     * Initialize the complete nutrition workflow
     * @param {HTMLElement} mainBoard - The main board container
     */
    init(mainBoard) {
        if (this.isInitialized) {
            console.log('[NutritionWorkflow] Already initialized');
            return;
        }
        
        console.log('[NutritionWorkflow] Initializing workflow...');
        
        // Clear any existing columns (except day columns)
        this.clearExistingColumns(mainBoard);
        
        // Create workflow columns in order
        this.createWorkflowColumns(mainBoard);
        
        // Set up event listeners for inter-component communication
        this.setupEventListeners();
        
        this.isInitialized = true;
        console.log('[NutritionWorkflow] Workflow initialized successfully');
    }
    
    /**
     * Clear existing category/AI columns
     */
    clearExistingColumns(mainBoard) {
        // Remove old AI columns and category columns
        const columnsToRemove = mainBoard.querySelectorAll(
            '.ai-assistant-column, .ai-search-column, .category-column'
        );
        
        columnsToRemove.forEach(col => {
            if (!col.classList.contains('ai-assessment-column') && 
                !col.classList.contains('ai-display-column')) {
                col.remove();
            }
        });
    }
    
    /**
     * Create all workflow columns
     */
    createWorkflowColumns(mainBoard) {
        // Get first day column as reference point
        const firstDayColumn = mainBoard.querySelector('.day-column');
        
        // Create columns in this order: Display (left), Assessment (middle), Suggestions (later)
        
        // Step 2: Display Column (left) - for results confirmation
        const displayColumn = this.createEnhancedDisplayColumn(firstDayColumn);
        displayColumn.style.display = 'none'; // Hidden until assessment completes
        mainBoard.insertBefore(displayColumn, firstDayColumn);
        
        // Step 1: Assessment Column (middle)
        const assessmentColumn = AIUserAssessment.create(mainBoard, firstDayColumn);
        this.components.assessment = AIUserAssessment;
        
        // Step 3: Meal Plan Column - AIMealPlan is initialized globally via script tag
        // It creates its own column and listens to events
        console.log('[NutritionWorkflow] Step 3 (AIMealPlan) initialized via global script');
    }
    
    /**
     * Create enhanced display column for calculations
     */
    createEnhancedDisplayColumn(insertBefore) {
        const column = document.createElement('div');
        column.className = 'ai-display-column category-column';
        column.dataset.category = 'ai-display';
        
        column.innerHTML = `
            <div class="assessment-header">
                <h3 style="display: flex; justify-content: space-between; align-items: center;">
                    <span>
                        <img src="https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F4CA.svg" 
                             width="20" height="20" class="openmoji-icon" alt="chart"> 
                        Your Results
                    </span>
                    <button onclick="window.nutritionWorkflow.showEditMode()" 
                            style="background: rgba(255, 255, 255, 0.2); 
                                   color: white; 
                                   border: 1px solid rgba(255, 255, 255, 0.3); 
                                   border-radius: 4px; 
                                   padding: 4px 12px; 
                                   font-size: 12px; 
                                   cursor: pointer;
                                   transition: background 0.2s;">
                        ✏️ Edit
                    </button>
                </h3>
            </div>
            <div class="display-content" style="padding-top: 10px; overflow-y: auto;">
                <!-- The detailed calculations section will be added here dynamically -->
                <!-- It includes all the BMI, TDEE, Macros, Energy breakdown, etc. -->
                
                <!-- User Confirmation Section -->
                <div class="ai-display-section" id="confirmation-section" style="display:none;">
                    <h4 class="section-title">Let's confirm your information</h4>
                    <div id="user-confirmation" class="profile-details">
                        <div class="detail-row" id="confirm-conditions" style="display:none;">
                            <span class="detail-label">Health Conditions:</span>
                            <span class="detail-value" id="value-conditions">--</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Age:</span>
                            <span class="detail-value" id="value-age">--</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Gender:</span>
                            <span class="detail-value" id="value-gender">--</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Height:</span>
                            <span class="detail-value" id="value-height">--</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Weight:</span>
                            <span class="detail-value" id="value-weight">--</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Daily Steps:</span>
                            <span class="detail-value" id="value-steps">--</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Exercise:</span>
                            <span class="detail-value" id="value-exercise">--</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Goal:</span>
                            <span class="detail-value" id="value-goal">--</span>
                        </div>
                        <div class="detail-row">
                            <span class="detail-label">Diet Preferences:</span>
                            <span class="detail-value" id="value-diet">--</span>
                        </div>
                    </div>
                    <div class="confirmation-actions" style="margin-top: 15px; text-align: center;">
                        <button class="confirm-button" onclick="window.nutritionWorkflow.confirmUserData()" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer; margin-right: 10px;">✓ Correct</button>
                        <button class="edit-button" onclick="window.nutritionWorkflow.editUserData()" style="background: #6c757d; color: white; border: none; padding: 10px 20px; border-radius: 6px; cursor: pointer;">Edit</button>
                    </div>
                </div>
                
            </div>
        `;
        
        this.components.display = column;
        return column;
    }
    
    /**
     * Set up event listeners for workflow communication
     */
    setupEventListeners() {
        // Listen for assessment updates
        eventBus.on('assessment:update', (data) => {
            this.handleAssessmentUpdate(data);
        });
        
        // Listen for assessment completion
        eventBus.on('assessment:complete', (data) => {
            this.handleAssessmentComplete(data);
        });
        
        // Listen for meal suggestions
        eventBus.on('suggestions:ready', (data) => {
            this.handleSuggestionsReady(data);
        });
        
        // Listen for meal approvals
        eventBus.on('meal:approved', (data) => {
            this.handleMealApproved(data);
        });
    }
    
    /**
     * Handle partial assessment updates
     */
    handleAssessmentUpdate(data) {
        console.log('[NutritionWorkflow] Assessment update:', data);
        this.workflowData.userData = data.userData;
        
        // Profile summary removed - no longer needed
    }
    
    /**
     * Handle assessment completion
     */
    handleAssessmentComplete(data) {
        console.log('[NutritionWorkflow] Assessment complete:', data);
        this.workflowData.userData = data.userData;
        this.workflowData.isTestMode = data.isTestMode || false;
        this.workflowData.calculations = {
            bmi: data.userData.bmi,
            tdee: data.userData.tdee,
            targetCalories: data.userData.targetCalories,
            macros: data.userData.macros
        };
        
        // Show display column now that assessment is complete
        if (this.components.display) {
            this.components.display.style.display = 'flex';
        }
        
        // Skip confirmation - go straight to calculations and discussion
        this.showDetailedCalculations(data.userData);
        
        // Update all displays
        this.updateBMIDisplay(data.userData.bmi);
        this.updateTDEEDisplay(data.userData.tdee);
        this.updateTargetDisplay(data.userData.targetCalories, data.userData.primaryGoal);
        this.updateMacrosDisplay(data.userData.macros, data.userData.targetCalories);
        // Profile summary removed - no longer needed
        
        // Show all sections except confirmation
        document.querySelectorAll('.ai-display-section:not(#confirmation-section)').forEach(section => {
            section.style.display = 'block';
        });
        
        // Start discussion immediately
        this.transformToDiscussionMode();
        
        // Trigger meal suggestions generation
        this.generateMealSuggestions();
    }
    
    /**
     * Update BMI display
     */
    updateBMIDisplay(bmi) {
        const display = document.getElementById('bmi-display');
        if (!display) return;
        
        const valueEl = display.querySelector('.metric-value');
        const labelEl = display.querySelector('.metric-label');
        
        valueEl.textContent = bmi.toFixed(1);
        labelEl.textContent = 'Body Mass Index';
    }
    
    /**
     * Update TDEE display
     */
    updateTDEEDisplay(tdee) {
        const display = document.getElementById('tdee-display');
        if (!display) return;
        
        const valueEl = display.querySelector('.metric-value');
        valueEl.textContent = `${tdee} kcal`;
    }
    
    /**
     * Update target calories display
     */
    updateTargetDisplay(calories, goal) {
        const display = document.getElementById('target-display');
        if (!display) return;
        
        const valueEl = display.querySelector('.metric-value');
        const goalEl = display.querySelector('.metric-goal');
        
        valueEl.textContent = `${calories} kcal`;
        
        const goalTexts = {
            'lose_weight': '📉 For weight loss (-500 kcal/day)',
            'maintain': '⚖️ For maintenance',
            'gain_muscle': '💪 For muscle gain (+300 kcal/day)',
            'gain_weight': '📈 For weight gain (+500 kcal/day)',
            'health': '❤️ For general health'
        };
        
        goalEl.textContent = goalTexts[goal] || 'Based on your goal';
    }
    
    /**
     * Update macros display
     */
    updateMacrosDisplay(macros, totalCalories) {
        // Protein
        const proteinEl = document.querySelector('.macro-item.protein');
        if (proteinEl) {
            proteinEl.querySelector('.macro-value').textContent = `${macros.protein}g`;
            const proteinPercent = Math.round((macros.protein * 4 / totalCalories) * 100);
            proteinEl.querySelector('.macro-percent').textContent = `${proteinPercent}%`;
        }
        
        // Carbs
        const carbsEl = document.querySelector('.macro-item.carbs');
        if (carbsEl) {
            carbsEl.querySelector('.macro-value').textContent = `${macros.carbs}g`;
            const carbsPercent = Math.round((macros.carbs * 4 / totalCalories) * 100);
            carbsEl.querySelector('.macro-percent').textContent = `${carbsPercent}%`;
        }
        
        // Fat
        const fatEl = document.querySelector('.macro-item.fat');
        if (fatEl) {
            fatEl.querySelector('.macro-value').textContent = `${macros.fat}g`;
            const fatPercent = Math.round((macros.fat * 9 / totalCalories) * 100);
            fatEl.querySelector('.macro-percent').textContent = `${fatPercent}%`;
        }
    }
    
    /**
     * Show user confirmation section with all their inputs
     */
    showUserConfirmation(userData) {
        console.log('[NutritionWorkflow] Showing confirmation with userData:', userData);
        const confirmSection = document.getElementById('confirmation-section');
        if (!confirmSection) return;
        
        // Show confirmation section, hide others initially
        confirmSection.style.display = 'block';
        document.querySelectorAll('.ai-display-section:not(#confirmation-section)').forEach(section => {
            section.style.display = 'none';
        });
        
        // Fill in user data for confirmation - prefer raw responses over processed
        const healthConditions = userData.healthConditions_raw || userData.healthConditions;
        if (healthConditions && healthConditions !== 'none' && healthConditions.toLowerCase() !== 'move on') {
            document.getElementById('confirm-conditions').style.display = 'flex';
            // Handle both string and array cases
            const conditionsText = Array.isArray(healthConditions) 
                ? healthConditions.join(', ')
                : healthConditions;
            document.getElementById('value-conditions').textContent = conditionsText;
        }
        if (userData.age) {
            const ageEl = document.getElementById('value-age');
            if (ageEl) ageEl.textContent = `${userData.age} years`;
        }
        if (userData.gender) {
            const genderEl = document.getElementById('value-gender');
            if (genderEl) genderEl.textContent = 
                userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1);
        }
        if (userData.height) {
            const heightEl = document.getElementById('value-height');
            if (heightEl) {
                const heightInCm = userData.heightUnit === 'ft' ? 
                    Math.round(userData.height * 30.48) : userData.height;
                const feet = Math.floor(heightInCm / 30.48);
                const inches = Math.round((heightInCm / 2.54) - (feet * 12));
                heightEl.textContent = `${feet}'${inches}" (${heightInCm}cm)`;
            }
        }
        if (userData.weight && userData.weight !== 'rather_not_say') {
            const weightEl = document.getElementById('value-weight');
            if (weightEl) {
                const weightInKg = userData.weightUnit === 'lbs' ? 
                    Math.round(userData.weight * 0.453592) : userData.weight;
                const weightInLbs = Math.round(weightInKg * 2.20462);
                weightEl.textContent = `${weightInKg}kg (${weightInLbs}lbs)`;
            }
        } else if (userData.weight === 'rather_not_say') {
            const weightEl = document.getElementById('value-weight');
            if (weightEl) weightEl.textContent = 'Rather not say';
        }
        // Display steps - prefer raw response or context
        const stepsEl = document.getElementById('value-steps');
        if (stepsEl) {
            if (userData.steps_raw) {
                // Show exactly what user typed
                stepsEl.textContent = userData.steps_raw;
            } else if (userData.stepsContext) {
                stepsEl.textContent = userData.stepsContext;
            } else if (userData.dailySteps) {
                stepsEl.textContent = userData.dailySteps.toLocaleString();
            } else {
                stepsEl.textContent = '--';
            }
        }
        // Display comprehensive exercise information - prefer raw response
        const exerciseEl = document.getElementById('value-exercise');
        if (exerciseEl) {
            // Always prefer the raw response
            if (userData.exercise_raw) {
                exerciseEl.textContent = userData.exercise_raw;
            } else if (userData.exerciseDetails) {
                // Show the full details they provided
                let exerciseText = userData.exerciseDetails;
                
                // Add calculated weekly energy burn if we have enough data
                if (userData.exerciseFrequency && userData.exerciseFrequency !== 'never') {
                    const frequencyMap = {
                        'daily': 7,
                        '5-6': 5.5,
                        '3-4': 3.5,
                        '1-2': 1.5
                    };
                    const sessions = frequencyMap[userData.exerciseFrequency] || 3.5;
                    const duration = userData.exerciseDuration || 45; // Default 45 mins if not specified
                    const weeklyMinutes = sessions * duration;
                    
                    // Estimate calories burned per week based on intensity
                    const intensityMultiplier = {
                        'high': 8,      // ~8 cals/minute for high intensity
                        'moderate': 6,  // ~6 cals/minute for moderate
                        'light': 4      // ~4 cals/minute for light
                    };
                    const calPerMin = intensityMultiplier[userData.exerciseIntensity || 'moderate'];
                    const weeklyCalories = Math.round(weeklyMinutes * calPerMin);
                    
                    exerciseText += ` (≈${weeklyMinutes} mins/week, ~${weeklyCalories.toLocaleString()} cal burned)`;
                }
                
                exerciseEl.textContent = exerciseText;
            } else if (userData.exerciseFrequency) {
                const exerciseLabels = {
                    'never': 'No regular exercise',
                    '1-2': '1-2 times per week',
                    '3-4': '3-4 times per week',
                    '5-6': '5-6 times per week',
                    'daily': 'Daily exercise'
                };
                exerciseEl.textContent = exerciseLabels[userData.exerciseFrequency] || userData.exerciseFrequency;
            } else {
                exerciseEl.textContent = 'Not specified';
            }
        }
        // Display goal - prefer raw response
        const goalEl = document.getElementById('value-goal');
        if (goalEl) {
            if (userData.goal_raw) {
                // Show exactly what user typed
                goalEl.textContent = userData.goal_raw;
            } else if (userData.goalDetails) {
                goalEl.textContent = userData.goalDetails;
            } else if (userData.primaryGoal) {
                const goalLabels = {
                    'lose_weight': 'Weight Loss',
                    'maintain': 'Maintenance',
                    'gain_muscle': 'Muscle Gain',
                    'gain_weight': 'Weight Gain',
                    'health': 'General Health'
                };
                goalEl.textContent = goalLabels[userData.primaryGoal] || userData.primaryGoal;
            } else {
                goalEl.textContent = '--';
            }
        }
        // Display diet preferences - prefer raw response
        const dietEl = document.getElementById('value-diet');
        if (dietEl) {
            if (userData.dietary_raw) {
                // Show exactly what user typed
                dietEl.textContent = userData.dietary_raw;
            } else if (userData.dietaryDetails) {
                dietEl.textContent = userData.dietaryDetails;
            } else if (userData.dietPreferences) {
                dietEl.textContent = userData.dietPreferences;
            } else if (userData.dietType) {
                const dietLabels = {
                    'regular': 'No Restrictions',
                    'vegetarian': 'Vegetarian',
                    'vegan': 'Vegan',
                    'pescatarian': 'Pescatarian',
                    'keto': 'Keto',
                    'paleo': 'Paleo',
                    'mediterranean': 'Mediterranean'
                };
                dietEl.textContent = dietLabels[userData.dietType] || userData.dietType;
            } else {
                dietEl.textContent = '--';
            }
        }
    }
    
    /**
     * User confirmed their data is correct
     */
    confirmUserData() {
        // Hide confirmation section, show calculation sections
        document.getElementById('confirmation-section').style.display = 'none';
        
        // Show detailed calculations section
        this.showDetailedCalculations(this.workflowData.userData);
        
        // Then show other sections
        document.querySelectorAll('.ai-display-section:not(#confirmation-section):not(#calculations-section)').forEach(section => {
            section.style.display = 'block';
        });
        
        // Transform assessment column to Step 2: Discussing Your Plan
        this.transformToDiscussionMode();
    }
    
    /**
     * Transform assessment column to discussion mode
     */
    async transformToDiscussionMode() {
        // Update header
        const assessmentHeader = document.querySelector('.ai-assessment-column .assessment-header h3');
        if (assessmentHeader) {
            assessmentHeader.innerHTML = `
                <img src="https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F4AC.svg" 
                     width="20" height="20" class="openmoji-icon" alt="discussion"> 
                Step 2: Discussing Your Plan
            `;
        }
        
        // Hide intro if still visible
        const intro = document.querySelector('.welcome-intro');
        if (intro) {
            intro.style.display = 'none';
        }
        
        // Hide any existing chat input from assessment
        const existingInput = document.querySelector('.ai-assessment-column .chat-input-area');
        if (existingInput && !existingInput.classList.contains('discussion-chat-input-area')) {
            existingInput.style.display = 'none';
        }
        
        // Make sure the questions container is visible and set to flex
        const questionsContainer = document.querySelector('.assessment-questions');
        if (questionsContainer) {
            questionsContainer.style.display = 'flex';
        }
        
        // Clear messages and start discussion
        const messagesContainer = document.getElementById('assessment-messages');
        if (messagesContainer) {
            messagesContainer.innerHTML = '';
            
            // Add a loading message while waiting for AI
            const loadingDiv = document.createElement('div');
            loadingDiv.className = 'hannah-message';
            loadingDiv.innerHTML = `
                <div class="hannah-avatar">H</div>
                <div class="message-bubble"><p>Let me review your results...</p></div>
            `;
            messagesContainer.appendChild(loadingDiv);
            
            // Start the discussion about results
            await this.startResultsDiscussion();
            
            // Remove loading message after discussion starts
            if (loadingDiv.parentNode) {
                loadingDiv.remove();
            }
        }
    }
    
    /**
     * Start AI discussion about the results
     */
    async startResultsDiscussion() {
        const userData = this.workflowData.userData;
        const messagesContainer = document.getElementById('assessment-messages');
        
        console.log('[NutritionWorkflow] Starting results discussion with userData:', userData);
        console.log('[NutritionWorkflow] Messages container found:', !!messagesContainer);
        
        if (!messagesContainer) {
            console.error('[NutritionWorkflow] Messages container not found!');
            return;
        }
        
        // Calculate key metrics for discussion
        // Use the already calculated values from assessment
        const bmr = userData.bmr || this.calculateBMR(userData);
        const tdee = userData.tdee; // Already calculated in assessment
        const targetCalories = userData.targetCalories; // Already calculated based on goal
        
        // These are just for display/context
        const stepCalories = this.calculateStepCalories(userData.dailySteps || 0);
        const exerciseCalories = this.calculateExerciseCalories(userData);
        
        // Prepare context for AI
        const context = {
            bmr: bmr,
            tdee: tdee,
            targetCalories: targetCalories,
            dailySteps: userData.dailySteps,
            exerciseCalories: exerciseCalories,
            bmi: userData.bmi,
            goal: userData.primaryGoal,
            healthConditions: userData.healthConditions,
            macros: userData.macros,
            age: userData.age,
            gender: userData.gender,
            height: userData.height,
            weight: userData.weight
        };
        
        console.log('[NutritionWorkflow] Sending discussion context:', context);
        
        // Send to AI for natural discussion
        try {
            const response = await fetch('/api/ai/discuss-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userData: context,
                    messageType: 'initial_discussion',
                    conversationHistory: context.conversationHistory || [],
                    userContext: context.userContext || {}
                })
            });
            
            console.log('[NutritionWorkflow] Discussion response status:', response.status);
            
            if (response.ok) {
                const data = await response.json();
                console.log('[NutritionWorkflow] AI discussion message:', data.message);
                await this.addDiscussionMessage(data.message, 'hannah');
            } else {
                console.error('[NutritionWorkflow] AI discussion failed with status:', response.status);
                // Fallback message if AI fails
                await this.addFallbackDiscussion(context);
            }
        } catch (error) {
            console.error('[NutritionWorkflow] Error getting AI discussion:', error);
            await this.addFallbackDiscussion(context);
        }
        
        // Show input area for user to respond
        this.showDiscussionInput();
    }
    
    /**
     * Add fallback discussion if AI fails
     */
    async addFallbackDiscussion(context) {
        const message = `Based on your results, I can see that your body burns about ${context.bmr.toLocaleString()} calories just for existing - that's your baseline. 
        
With your ${context.dailySteps?.toLocaleString() || '0'} daily steps and exercise routine, you're burning an additional ${context.exerciseCalories} calories from activity.

Given your goal to ${context.goal === 'lose_weight' ? 'lose weight' : context.goal}, I'm suggesting ${context.targetCalories.toLocaleString()} calories per day. This creates a sustainable deficit without risking burnout or energy loss.

Your BMI of ${context.bmi?.toFixed(1) || '--'} gives us a healthy weight range to work with. Where you fall in that range depends on factors like muscle mass - you get to decide what feels right for you.

I'm thinking 3 meals with healthy snacks will keep you satisfied throughout the day, but we can adjust that if you prefer. What do you think about this approach?`;
        
        await this.addDiscussionMessage(message, 'hannah');
    }
    
    /**
     * Add a discussion message
     */
    async addDiscussionMessage(text, sender = 'hannah', useConversationalMode = true) {
        const messagesContainer = document.getElementById('assessment-messages');
        console.log('[NutritionWorkflow] Adding discussion message:', { text: text.substring(0, 50), sender, containerFound: !!messagesContainer });
        
        if (!messagesContainer) {
            console.error('[NutritionWorkflow] Cannot add message - container not found!');
            return;
        }
        
        // Split text into paragraphs for conversational mode
        const paragraphs = text.split('\n\n').filter(p => p.trim());
        
        if (sender === 'hannah' && useConversationalMode && paragraphs.length > 1) {
            // Add each paragraph as a separate message with delay
            for (let i = 0; i < paragraphs.length; i++) {
                const paragraph = paragraphs[i].trim();
                if (!paragraph) continue;
                
                // Add typing indicator
                if (i > 0) {
                    const typingDiv = document.createElement('div');
                    typingDiv.className = 'hannah-message typing-indicator';
                    typingDiv.innerHTML = `
                        <div class="hannah-avatar">H</div>
                        <div class="message-bubble">
                            <div class="typing-dots">
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    `;
                    messagesContainer.appendChild(typingDiv);
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    
                    // Wait a bit then remove typing indicator
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    typingDiv.remove();
                }
                
                // Add the actual message
                const messageDiv = document.createElement('div');
                messageDiv.className = 'hannah-message';
                messageDiv.style.opacity = '0';
                messageDiv.innerHTML = `
                    <div class="hannah-avatar">H</div>
                    <div class="message-bubble"><p>${paragraph}</p></div>
                `;
                
                messagesContainer.appendChild(messageDiv);
                messagesContainer.scrollTop = messagesContainer.scrollHeight;
                
                // Fade in animation
                setTimeout(() => {
                    messageDiv.style.transition = 'opacity 0.3s ease';
                    messageDiv.style.opacity = '1';
                }, 50);
                
                // Wait before next message (shorter for better UX)
                if (i < paragraphs.length - 1) {
                    await new Promise(resolve => setTimeout(resolve, 1500));
                }
            }
        } else {
            // Single message or user message
            const formattedText = paragraphs.map(p => `<p>${p}</p>`).join('');
            
            const messageDiv = document.createElement('div');
            messageDiv.className = sender === 'hannah' ? 'hannah-message' : 'user-message';
            
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
            
            messagesContainer.appendChild(messageDiv);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
        
        console.log('[NutritionWorkflow] Message added successfully');
    }
    
    /**
     * Show discussion input area
     */
    showDiscussionInput() {
        let inputArea = document.querySelector('.chat-input-area');
        if (!inputArea) {
            const assessmentColumn = document.querySelector('.ai-assessment-column');
            if (!assessmentColumn) return;
            
            inputArea = document.createElement('div');
            inputArea.className = 'chat-input-area';
            inputArea.innerHTML = `
                <input type="text" 
                       id="discussion-input" 
                       class="chat-input" 
                       placeholder="Ask about your plan or request changes..."
                       onkeypress="if(event.key==='Enter') window.nutritionWorkflow.handleDiscussionInput()">
                <button class="chat-send-btn" onclick="window.nutritionWorkflow.handleDiscussionInput()">
                    Send
                </button>
            `;
            
            // Append at the bottom of the assessment column
            assessmentColumn.appendChild(inputArea);
        }
        
        inputArea.style.display = 'flex';
    }
    
    /**
     * Handle user input in discussion mode
     */
    async handleDiscussionInput() {
        const input = document.getElementById('discussion-input');
        if (!input || !input.value.trim()) return;
        
        const userMessage = input.value.trim();
        input.value = '';
        
        // Add user message to chat
        this.addDiscussionMessage(userMessage, 'user');
        
        // Send to AI for response
        try {
            const response = await fetch('/api/ai/discuss-results', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    userData: this.workflowData.userData,
                    userMessage: userMessage,
                    messageType: 'discussion'
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                this.addDiscussionMessage(data.message, 'hannah');
                
                // Check if user requested changes
                if (data.requestedChanges) {
                    this.applyRequestedChanges(data.requestedChanges);
                }
            }
        } catch (error) {
            console.error('Error in discussion:', error);
            this.addDiscussionMessage("I'm having trouble processing that. Could you rephrase your question?", 'hannah');
        }
    }
    
    /**
     * Apply changes requested during discussion
     */
    applyRequestedChanges(changes) {
        // Handle various change requests
        if (changes.mealsPerDay) {
            this.workflowData.userData.mealsPerDay = changes.mealsPerDay;
            // Recalculate per-meal macros
            this.showDetailedCalculations(this.workflowData.userData);
        }
        
        if (changes.targetCalories) {
            this.workflowData.userData.targetCalories = changes.targetCalories;
            // Update displays
            this.updateTargetDisplay(changes.targetCalories, this.workflowData.userData.primaryGoal);
        }
        
        // Emit event for other components to update
        eventBus.emit('plan:updated', this.workflowData.userData);
    }
    
    /**
     * Show detailed calculations breakdown
     */
    showDetailedCalculations(userData) {
        // Create or update calculations section
        let calcSection = document.getElementById('calculations-section');
        if (!calcSection) {
            // Create the section if it doesn't exist - make sure we get the right display column
            const displayColumn = document.querySelector('.ai-display-column:not(.ai-meal-plan-column)');
            const displayContent = displayColumn ? displayColumn.querySelector('.display-content') : null;
            if (!displayContent) return;
            
            calcSection = document.createElement('div');
            calcSection.className = 'ai-display-section';
            calcSection.id = 'calculations-section';
            
            // Insert after confirmation section
            const confirmSection = document.getElementById('confirmation-section');
            if (confirmSection && confirmSection.nextSibling) {
                displayContent.insertBefore(calcSection, confirmSection.nextSibling);
            } else {
                displayContent.appendChild(calcSection);
            }
        }
        
        // Check if eating disorder recovery mode
        const isEDRecovery = userData.primaryGoal === 'ed_recovery' || 
                            (userData.healthConditions && userData.healthConditions.toString().toLowerCase().includes('eating disorder'));
        
        // Calculate energy expenditure breakdown
        const bmr = this.calculateBMR(userData);
        const stepCalories = this.calculateStepCalories(userData.dailySteps || 0);
        const exerciseCalories = this.calculateExerciseCalories(userData);
        const neat = Math.round(bmr * 0.15); // Non-exercise activity thermogenesis (~15% of BMR)
        const tef = Math.round(bmr * 0.10); // Thermic effect of food (~10% of BMR)
        
        const dailyTotal = bmr + neat + tef + stepCalories + exerciseCalories;
        const weeklyTotal = dailyTotal * 7;
        
        // Use userData.tdee if available, otherwise use calculated dailyTotal
        const tdee = userData.tdee || dailyTotal;
        
        // Calculate meals per day and distribution
        const mealsPerDay = userData.mealsPerDay || 3;
        const targetCalories = userData.targetCalories || tdee - 500; // Default to 500 cal deficit for weight loss
        const caloriesPerMeal = Math.round(targetCalories / mealsPerDay);
        
        // Calculate macros per meal
        const macros = userData.macros || this.calculateMacros(userData, targetCalories);
        const proteinPerMeal = Math.round(macros.protein / mealsPerDay);
        const carbsPerMeal = Math.round(macros.carbs / mealsPerDay);
        const fatPerMeal = Math.round(macros.fat / mealsPerDay);
        
        // Build the HTML content with ALL information
        let content = `
            <!-- USER'S INPUT DATA FROM STEP 1 -->
            <div class="ai-display-section">
                <h4 class="section-title">Your Information</h4>
                <div class="profile-details">
                    ${userData.healthConditions && userData.healthConditions !== 'none' ? `
                    <div class="detail-row">
                        <span class="detail-label">Health Conditions:</span>
                        <span class="detail-value">${Array.isArray(userData.healthConditions) ? userData.healthConditions.join(', ') : userData.healthConditions}</span>
                    </div>` : ''}
                    <div class="detail-row">
                        <span class="detail-label">Age:</span>
                        <span class="detail-value">${userData.age || '--'} years</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Gender:</span>
                        <span class="detail-value">${userData.gender ? userData.gender.charAt(0).toUpperCase() + userData.gender.slice(1) : '--'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Height:</span>
                        <span class="detail-value">${(() => {
                            if (!userData.height) return '--';
                            const heightInCm = userData.heightUnit === 'ft' ? 
                                Math.round(userData.height * 30.48) : userData.height;
                            const feet = Math.floor(heightInCm / 30.48);
                            const inches = Math.round((heightInCm / 2.54) - (feet * 12));
                            return `${feet}'${inches}" (${heightInCm}cm)`;
                        })()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Weight:</span>
                        <span class="detail-value">${(() => {
                            if (!userData.weight || userData.weight === 'rather_not_say') return userData.weight === 'rather_not_say' ? 'Rather not say' : '--';
                            const weightInKg = userData.weightUnit === 'lbs' ? 
                                Math.round(userData.weight * 0.453592) : userData.weight;
                            const weightInLbs = Math.round(weightInKg * 2.20462);
                            return `${weightInKg}kg (${weightInLbs}lbs)`;
                        })()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Daily Steps:</span>
                        <span class="detail-value">${userData.dailySteps ? userData.dailySteps.toLocaleString() : '--'}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Exercise:</span>
                        <span class="detail-value">${(() => {
                            if (userData.exerciseDetails) {
                                let exerciseText = userData.exerciseDetails;
                                if (userData.exerciseFrequency && userData.exerciseFrequency !== 'never') {
                                    const frequencyMap = {
                                        'daily': 7,
                                        '5-6': 5.5,
                                        '3-4': 3.5,
                                        '1-2': 1.5
                                    };
                                    const sessions = frequencyMap[userData.exerciseFrequency] || 3.5;
                                    const duration = userData.exerciseDuration || 45;
                                    const weeklyMinutes = sessions * duration;
                                    const intensityMultiplier = {
                                        'high': 8,
                                        'moderate': 6,
                                        'light': 4
                                    };
                                    const calPerMin = intensityMultiplier[userData.exerciseIntensity || 'moderate'];
                                    const weeklyCalories = Math.round(weeklyMinutes * calPerMin);
                                    exerciseText += ` (≈${weeklyMinutes} mins/week, ~${weeklyCalories.toLocaleString()} cal burned)`;
                                }
                                return exerciseText;
                            }
                            return '--';
                        })()}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Goal:</span>
                        <span class="detail-value">${this.getGoalLabel(userData.primaryGoal)}</span>
                    </div>
                    <div class="detail-row">
                        <span class="detail-label">Diet Preferences:</span>
                        <span class="detail-value">${userData.dietPreferences || userData.dietType || 'No restrictions'}</span>
                    </div>
                </div>
            </div>
            
            <h4 class="section-title" style="margin-top: 20px;">Your Personalized Calculations</h4>
            
            <!-- Body Composition & Calorie Targets -->
            <div class="calc-subsection">
                <h5 class="calc-subtitle">Key Metrics</h5>
                <div class="calc-item">
                    <span class="calc-label">BMI:</span>
                    <span class="calc-value">${userData.bmi ? userData.bmi.toFixed(1) : '--'}</span>
                </div>
                <div class="calc-item">
                    <span class="calc-label">Daily Calorie Needs (TDEE):</span>
                    <span class="calc-value">${tdee.toLocaleString()} kcal</span>
                </div>
                <div class="calc-item">
                    <span class="calc-label">Your Target:</span>
                    <span class="calc-value">${targetCalories.toLocaleString()} kcal ${userData.primaryGoal === 'lose_weight' ? '(-500/day)' : ''}</span>
                </div>
            </div>
            
            <!-- Energy Expenditure Breakdown -->
            <div class="calc-subsection">
                <h5 class="calc-subtitle">Daily Energy Expenditure</h5>
                <div class="energy-breakdown">
                    <div class="energy-item">
                        <span class="energy-label">Resting (BMR):</span>
                        <span class="energy-value">${isEDRecovery ? '✓' : `${bmr.toLocaleString()} cal`}</span>
                    </div>
                    <div class="energy-item">
                        <span class="energy-label">Daily Activities:</span>
                        <span class="energy-value">${isEDRecovery ? '✓' : `${neat.toLocaleString()} cal`}</span>
                    </div>
                    <div class="energy-item">
                        <span class="energy-label">From Steps:</span>
                        <span class="energy-value">${isEDRecovery ? '✓' : `${stepCalories.toLocaleString()} cal`}</span>
                    </div>
                    <div class="energy-item">
                        <span class="energy-label">From Exercise:</span>
                        <span class="energy-value">${isEDRecovery ? '✓' : `${exerciseCalories.toLocaleString()} cal`}</span>
                    </div>
                    <div class="energy-item">
                        <span class="energy-label">Digestion (TEF):</span>
                        <span class="energy-value">${isEDRecovery ? '✓' : `${tef.toLocaleString()} cal`}</span>
                    </div>
                    <div class="energy-total">
                        <span class="energy-label"><strong>Total Daily:</strong></span>
                        <span class="energy-value"><strong>${isEDRecovery ? 'Balanced' : `${dailyTotal.toLocaleString()} cal`}</strong></span>
                    </div>
                    <div class="energy-item">
                        <span class="energy-label">Weekly Total:</span>
                        <span class="energy-value">${isEDRecovery ? 'Nourishing' : `${weeklyTotal.toLocaleString()} cal`}</span>
                    </div>
                </div>
            </div>
            
            <!-- Daily Macros -->
            <div class="calc-subsection">
                <h5 class="calc-subtitle">Macro Targets Per Day</h5>
                <div class="macro-recommendation">
                    <div class="macro-rec-item">
                        <span class="macro-rec-label">Protein:</span>
                        <span class="macro-rec-value">${isEDRecovery ? 'Adequate' : `${macros.protein}g (${Math.round((macros.protein * 4 / targetCalories) * 100)}%)`}</span>
                    </div>
                    <div class="macro-rec-item">
                        <span class="macro-rec-label">Carbs:</span>
                        <span class="macro-rec-value">${isEDRecovery ? 'Energizing' : `${macros.carbs}g (${Math.round((macros.carbs * 4 / targetCalories) * 100)}%)`}</span>
                    </div>
                    <div class="macro-rec-item">
                        <span class="macro-rec-label">Fats:</span>
                        <span class="macro-rec-value">${isEDRecovery ? 'Satisfying' : `${macros.fat}g (${Math.round((macros.fat * 9 / targetCalories) * 100)}%)`}</span>
                    </div>
                </div>
            </div>
            
            <!-- Per Meal Macros -->
            <div class="calc-subsection">
                <h5 class="calc-subtitle">Macro Targets Per Meal</h5>
                <div class="macro-recommendation">
                    <div class="macro-rec-item">
                        <span class="macro-rec-label">Protein:</span>
                        <span class="macro-rec-value">${isEDRecovery ? 'Adequate' : `${proteinPerMeal}g`}</span>
                    </div>
                    <div class="macro-rec-item">
                        <span class="macro-rec-label">Carbs:</span>
                        <span class="macro-rec-value">${isEDRecovery ? 'Energizing' : `${carbsPerMeal}g`}</span>
                    </div>
                    <div class="macro-rec-item">
                        <span class="macro-rec-label">Fats:</span>
                        <span class="macro-rec-value">${isEDRecovery ? 'Satisfying' : `${fatPerMeal}g`}</span>
                    </div>
                </div>
            </div>
            
        `;
        
        calcSection.innerHTML = content;
        calcSection.style.display = 'block';
        
        // Add styles if not already added
        this.addCalculationStyles();
    }
    
    /**
     * Calculate BMR (Basal Metabolic Rate)
     */
    calculateBMR(userData) {
        if (!userData.weight || userData.weight === 'rather_not_say' || !userData.height || !userData.age) {
            return 1500; // Default estimate
        }
        
        const weightKg = userData.weightUnit === 'lbs' ? 
            userData.weight * 0.453592 : userData.weight;
        const heightCm = userData.heightUnit === 'ft' ? 
            userData.height * 30.48 : userData.height;
        const age = userData.age;
        
        // Mifflin-St Jeor equation
        if (userData.gender === 'male') {
            return Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) + 5);
        } else {
            return Math.round((10 * weightKg) + (6.25 * heightCm) - (5 * age) - 161);
        }
    }
    
    /**
     * Calculate calories from steps
     */
    calculateStepCalories(steps) {
        // Roughly 0.04 calories per step for average person
        return Math.round(steps * 0.04);
    }
    
    /**
     * Calculate calories from exercise
     */
    calculateExerciseCalories(userData) {
        if (!userData.exerciseFrequency || userData.exerciseFrequency === 'never') {
            return 0;
        }
        
        const frequencyMap = {
            'daily': 7,
            '5-6': 5.5,
            '3-4': 3.5,
            '1-2': 1.5
        };
        
        const sessions = frequencyMap[userData.exerciseFrequency] || 3.5;
        const duration = userData.exerciseDuration || 45;
        
        const intensityMultiplier = {
            'high': 8,
            'moderate': 6,
            'light': 4
        };
        
        const calPerMin = intensityMultiplier[userData.exerciseIntensity || 'moderate'];
        const weeklyCalories = sessions * duration * calPerMin;
        
        return Math.round(weeklyCalories / 7); // Daily average
    }
    
    /**
     * Get activity label
     */
    getActivityLabel(frequency) {
        const labels = {
            'never': 'Sedentary',
            '1-2': 'Lightly Active',
            '3-4': 'Moderately Active',
            '5-6': 'Very Active',
            'daily': 'Extra Active'
        };
        return labels[frequency] || 'Moderately Active';
    }
    
    /**
     * Get goal label
     */
    getGoalLabel(goal) {
        const labels = {
            'lose_weight': 'Weight Loss',
            'maintain': 'Maintenance',
            'gain_muscle': 'Muscle Gain',
            'gain_weight': 'Weight Gain',
            'health': 'General Health'
        };
        return labels[goal] || 'General Health';
    }
    
    /**
     * Calculate macros based on goal
     */
    calculateMacros(userData, calories) {
        let proteinRatio, carbRatio, fatRatio;
        
        // Adjust macros based on goal
        switch (userData.primaryGoal) {
            case 'lose_weight':
                proteinRatio = 0.30; // Higher protein for satiety
                carbRatio = 0.40;
                fatRatio = 0.30;
                break;
            case 'gain_muscle':
                proteinRatio = 0.25;
                carbRatio = 0.45; // More carbs for energy
                fatRatio = 0.30;
                break;
            case 'gain_weight':
                proteinRatio = 0.20;
                carbRatio = 0.50;
                fatRatio = 0.30;
                break;
            default: // maintain, health
                proteinRatio = 0.25;
                carbRatio = 0.45;
                fatRatio = 0.30;
        }
        
        return {
            protein: Math.round((calories * proteinRatio) / 4),
            carbs: Math.round((calories * carbRatio) / 4),
            fat: Math.round((calories * fatRatio) / 9)
        };
    }
    
    /**
     * Add calculation styles
     */
    addCalculationStyles() {
        if (document.getElementById('calc-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'calc-styles';
        style.textContent = `
            .calc-subsection {
                margin-bottom: 20px;
                padding: 12px;
                background: white;
                border-radius: 6px;
            }
            
            .calc-subtitle {
                font-size: 13px;
                font-weight: 600;
                color: #495057;
                margin: 0 0 12px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .calc-item, .energy-item, .meal-item, .macro-rec-item {
                display: flex;
                justify-content: space-between;
                padding: 6px 0;
                border-bottom: 1px solid #f1f3f5;
            }
            
            .calc-item:last-child, .energy-item:last-child, 
            .meal-item:last-child, .macro-rec-item:last-child {
                border-bottom: none;
            }
            
            .energy-total {
                display: flex;
                justify-content: space-between;
                padding: 8px 0;
                margin-top: 8px;
                border-top: 2px solid #667eea;
                border-bottom: 1px solid #f1f3f5;
            }
            
            .calc-label, .energy-label, .meal-label, .macro-rec-label {
                font-size: 12px;
                color: #6c757d;
            }
            
            .calc-value, .energy-value, .meal-value, .macro-rec-value {
                font-size: 12px;
                font-weight: 600;
                color: #212529;
            }
            
            .energy-breakdown {
                background: #f8f9fa;
                padding: 10px;
                border-radius: 4px;
            }
            
            .macro-recommendation {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                gap: 10px;
            }
            
            .macro-rec-item {
                flex-direction: column;
                text-align: center;
                padding: 10px;
                background: #f8f9fa;
                border-radius: 4px;
                border-bottom: none;
            }
            
            .macro-rec-label {
                margin-bottom: 4px;
            }
            
            .macro-rec-value {
                font-size: 16px;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Show edit mode from header button
     */
    showEditMode() {
        console.log('[NutritionWorkflow] Showing edit mode');
        
        // Hide all calculation sections
        document.querySelectorAll('.ai-display-section, .calc-subsection').forEach(section => {
            section.style.display = 'none';
        });
        
        // Show edit form
        this.showEditForm(this.workflowData.userData);
    }
    
    /**
     * User wants to edit their data (legacy method for compatibility)
     */
    editUserData() {
        this.showEditMode();
    }
    
    /**
     * Show editable form for user data
     */
    showEditForm(userData) {
        // Create or get edit section
        let editSection = document.getElementById('edit-section');
        if (!editSection) {
            const displayContent = document.querySelector('.display-content');
            if (!displayContent) return;
            
            editSection = document.createElement('div');
            editSection.className = 'ai-display-section';
            editSection.id = 'edit-section';
            
            // Insert at the beginning of display content
            displayContent.insertBefore(editSection, displayContent.firstChild);
        }
        
        // Build the edit form
        editSection.innerHTML = `
            <h4 class="section-title">Edit Your Information</h4>
            <div class="edit-form">
                <div class="form-group">
                    <label>Health Conditions:</label>
                    <input type="text" id="edit-conditions" value="${userData.healthConditions || ''}" 
                           placeholder="e.g., NAFLD, diabetes, none">
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Age:</label>
                        <input type="number" id="edit-age" value="${userData.age || ''}" 
                               placeholder="35">
                    </div>
                    <div class="form-group">
                        <label>Gender:</label>
                        <select id="edit-gender">
                            <option value="male" ${userData.gender === 'male' ? 'selected' : ''}>Male</option>
                            <option value="female" ${userData.gender === 'female' ? 'selected' : ''}>Female</option>
                            <option value="prefer_not_to_say" ${userData.gender === 'prefer_not_to_say' ? 'selected' : ''}>Prefer not to say</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label>Height:</label>
                        <input type="number" id="edit-height" value="${userData.height || ''}" 
                               placeholder="178">
                        <select id="edit-height-unit">
                            <option value="cm" ${userData.heightUnit === 'cm' ? 'selected' : ''}>cm</option>
                            <option value="ft" ${userData.heightUnit === 'ft' ? 'selected' : ''}>ft/in</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>Weight:</label>
                        <input type="number" id="edit-weight" value="${userData.weight || ''}" 
                               placeholder="85">
                        <select id="edit-weight-unit">
                            <option value="kg" ${userData.weightUnit === 'kg' ? 'selected' : ''}>kg</option>
                            <option value="lbs" ${userData.weightUnit === 'lbs' ? 'selected' : ''}>lbs</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-group">
                    <label>Daily Steps:</label>
                    <input type="number" id="edit-steps" value="${userData.dailySteps || ''}" 
                           placeholder="7500">
                </div>
                
                <div class="form-group">
                    <label>Exercise:</label>
                    <textarea id="edit-exercise" rows="2" 
                              placeholder="e.g., 3x week gym, 45 mins each">${userData.exerciseDetails || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label>Goal:</label>
                    <select id="edit-goal">
                        <option value="lose_weight" ${userData.primaryGoal === 'lose_weight' ? 'selected' : ''}>Weight Loss</option>
                        <option value="maintain" ${userData.primaryGoal === 'maintain' ? 'selected' : ''}>Maintain Weight</option>
                        <option value="gain_muscle" ${userData.primaryGoal === 'gain_muscle' ? 'selected' : ''}>Build Muscle</option>
                        <option value="gain_weight" ${userData.primaryGoal === 'gain_weight' ? 'selected' : ''}>Gain Weight</option>
                        <option value="health" ${userData.primaryGoal === 'health' ? 'selected' : ''}>General Health</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label>Dietary Preferences:</label>
                    <input type="text" id="edit-diet" value="${userData.dietPreferences || ''}" 
                           placeholder="e.g., Mediterranean, vegetarian, no restrictions">
                </div>
                
                <div class="form-actions">
                    <button class="save-btn" onclick="window.nutritionWorkflow.saveEditedData()">
                        Save Changes
                    </button>
                    <button class="cancel-btn" onclick="window.nutritionWorkflow.cancelEdit()">
                        Cancel
                    </button>
                </div>
            </div>
        `;
        
        // Show the edit section
        editSection.style.display = 'block';
        
        // Hide other sections
        document.querySelectorAll('.ai-display-section:not(#edit-section)').forEach(section => {
            section.style.display = 'none';
        });
        
        // Add styles for the form
        this.addEditFormStyles();
    }
    
    /**
     * Save edited data
     */
    saveEditedData() {
        const userData = this.workflowData.userData;
        
        // Get all edited values
        userData.healthConditions = document.getElementById('edit-conditions').value;
        userData.age = parseInt(document.getElementById('edit-age').value);
        userData.gender = document.getElementById('edit-gender').value;
        userData.height = parseFloat(document.getElementById('edit-height').value);
        userData.heightUnit = document.getElementById('edit-height-unit').value;
        userData.weight = parseFloat(document.getElementById('edit-weight').value);
        userData.weightUnit = document.getElementById('edit-weight-unit').value;
        userData.dailySteps = parseInt(document.getElementById('edit-steps').value);
        userData.exerciseDetails = document.getElementById('edit-exercise').value;
        userData.primaryGoal = document.getElementById('edit-goal').value;
        userData.dietPreferences = document.getElementById('edit-diet').value;
        
        // Parse exercise details
        const exerciseText = userData.exerciseDetails.toLowerCase();
        if (exerciseText.includes('3') || exerciseText.includes('three')) {
            userData.exerciseFrequency = '3-4';
        } else if (exerciseText.includes('5') || exerciseText.includes('five')) {
            userData.exerciseFrequency = '5-6';
        }
        
        // Recalculate BMI, TDEE, etc.
        this.workflowData.userData = userData;
        if (window.aiAssessment) {
            window.aiAssessment.userData = userData;
            window.aiAssessment.calculateResults();
        }
        
        // Hide edit form
        const editSection = document.getElementById('edit-section');
        if (editSection) {
            editSection.style.display = 'none';
        }
        
        // Recalculate and show updated calculations
        this.showDetailedCalculations(userData);
        
        // Show all sections again
        document.querySelectorAll('.ai-display-section:not(#edit-section):not(#confirmation-section)').forEach(section => {
            section.style.display = 'block';
        });
        
        // Update displays
        this.updateBMIDisplay(userData.bmi);
        this.updateTDEEDisplay(userData.tdee);
        this.updateTargetDisplay(userData.targetCalories, userData.primaryGoal);
        this.updateMacrosDisplay(userData.macros, userData.targetCalories);
        // Profile summary removed - no longer needed
    }
    
    /**
     * Cancel editing
     */
    cancelEdit() {
        // Hide edit section
        const editSection = document.getElementById('edit-section');
        if (editSection) {
            editSection.style.display = 'none';
        }
        
        // Show all calculation sections again
        document.querySelectorAll('.ai-display-section:not(#edit-section):not(#confirmation-section)').forEach(section => {
            section.style.display = 'block';
        });
        
        // Also show calc subsections
        document.querySelectorAll('.calc-subsection').forEach(section => {
            section.style.display = 'block';
        });
    }
    
    /**
     * Add edit form styles
     */
    addEditFormStyles() {
        if (document.getElementById('edit-form-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'edit-form-styles';
        style.textContent = `
            .edit-form {
                padding: 10px;
            }
            
            .form-group {
                margin-bottom: 15px;
            }
            
            .form-group label {
                display: block;
                font-size: 12px;
                font-weight: 600;
                color: #495057;
                margin-bottom: 5px;
            }
            
            .form-group input,
            .form-group select,
            .form-group textarea {
                width: 100%;
                padding: 8px;
                border: 1px solid #dee2e6;
                border-radius: 4px;
                font-size: 13px;
            }
            
            .form-group select {
                width: auto;
                margin-left: 5px;
            }
            
            .form-row {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
            }
            
            .form-actions {
                display: flex;
                gap: 10px;
                margin-top: 20px;
            }
            
            .save-btn, .cancel-btn {
                padding: 10px 20px;
                border: none;
                border-radius: 6px;
                cursor: pointer;
                font-size: 13px;
                font-weight: 600;
            }
            
            .save-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            
            .cancel-btn {
                background: #6c757d;
                color: white;
            }
            
            .save-btn:hover, .cancel-btn:hover {
                opacity: 0.9;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Update profile summary
     */
    updateProfileSummary(userData) {
        // Profile summary section has been removed from the UI
        // This method is no longer needed but kept as empty stub to prevent errors
        return;
    }
    
    /**
     * Generate meal suggestions
     */
    generateMealSuggestions() {
        console.log('[NutritionWorkflow] Generating meal suggestions...');
        // Trigger Step 3: AI Meal Plan via event
        console.log('[NutritionWorkflow] Emitting event for Step 3: AI Meal Plan');
        eventBus.emit('generate:suggestions', {
            userData: this.workflowData.userData,
            calculations: this.workflowData.calculations,
            isTestMode: window.location.hash === '#test' || this.workflowData.isTestMode
        });
    }
    
    /**
     * Handle meal suggestions ready
     */
    handleSuggestionsReady(data) {
        console.log('[NutritionWorkflow] Suggestions ready:', data);
        this.workflowData.suggestions = data.suggestions;
    }
    
    /**
     * Handle meal approval
     */
    handleMealApproved(data) {
        console.log('[NutritionWorkflow] Meal approved:', data);
        this.workflowData.approvedMeals.push(data.meal);
        
        // Check if we have enough approved meals to populate the board
        if (this.shouldPopulateBoard()) {
            this.populateKanbanBoard();
        }
    }
    
    /**
     * Check if we have enough meals to populate the board
     */
    shouldPopulateBoard() {
        // Need at least one meal for each type
        const mealTypes = ['breakfast', 'lunch', 'dinner'];
        return mealTypes.every(type => 
            this.workflowData.approvedMeals.some(meal => 
                meal.type.toLowerCase() === type
            )
        );
    }
    
    /**
     * Populate the kanban board with approved meals
     */
    populateKanbanBoard() {
        console.log('[NutritionWorkflow] Populating kanban board...');
        eventBus.emit('populate:board', {
            meals: this.workflowData.approvedMeals,
            userData: this.workflowData.userData
        });
    }
    
    /**
     * Reset the entire workflow
     */
    reset() {
        this.workflowData = {
            userData: null,
            calculations: null,
            suggestions: null,
            approvedMeals: []
        };
        
        // Reset components
        if (this.components.assessment) {
            this.components.assessment.reset();
        }
        
        // Clear displays
        this.clearDisplays();
    }
    
    /**
     * Clear all display values
     */
    clearDisplays() {
        // Reset all display values to defaults
        const defaults = {
            '.metric-value': '--',
            '.metric-label': 'Waiting for assessment...',
            '.detail-value': '--',
            '.macro-value': '--g',
            '.macro-percent': '--%'
        };
        
        Object.entries(defaults).forEach(([selector, value]) => {
            document.querySelectorAll(selector).forEach(el => {
                el.textContent = value;
            });
        });
    }
}

// Create singleton instance
const nutritionWorkflow = new NutritionWorkflow();

// Make it globally accessible
window.nutritionWorkflow = nutritionWorkflow;

// Export for use in other modules
export default nutritionWorkflow;