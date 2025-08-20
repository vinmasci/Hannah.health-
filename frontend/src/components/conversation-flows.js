// Conversation Flow Definitions
// Based on AI Onboarding V2 Strategy

const ConversationFlows = {
    // Initial greeting and opening
    opening: {
        message: "Hi! I can help you plan your meals. If you're happy to answer a few questions, I can fill out your first week's meal plan for you. Then you can make personal alterations, or we can keep chatting and I can adjust it further for you.",
        options: [
            { key: 'A', text: 'Yes, help me plan my week', next: 'mainGoal' },
            { key: 'B', text: 'I just need a few meal ideas', next: 'quickMeals' },
            { key: 'C', text: 'I prefer to browse myself', action: 'minimizeChat' }
        ],
        allowText: true
    },

    // Main goal question
    mainGoal: {
        message: "Perfect! What's your main goal with meal planning?",
        options: [
            { key: 'A', text: 'Eat healthier', next: 'healthyEating' },
            { key: 'B', text: 'Manage a health condition', next: 'healthCondition' },
            { key: 'C', text: 'Save time cooking', next: 'quickCooking' }
        ],
        allowText: true
    },

    // Path A: Healthy Eating (Wellness)
    healthyEating: {
        message: "Great! What kind of healthy eating appeals to you?",
        options: [
            { key: 'A', text: 'Balanced nutrition', next: 'householdSize' },
            { key: 'B', text: 'Plant-forward', next: 'householdSize' },
            { key: 'C', text: 'High protein', next: 'householdSize' }
        ],
        allowText: true,
        saveAs: 'eatingStyle'
    },

    householdSize: {
        message: "Got it! Are you planning meals for:",
        options: [
            { key: 'A', text: 'Just myself', next: 'startWellnessPlan' },
            { key: 'B', text: 'Me and my partner', next: 'startWellnessPlan' },
            { key: 'C', text: 'My family', next: 'startWellnessPlan' }
        ],
        allowText: false,
        saveAs: 'household'
    },

    startWellnessPlan: {
        message: "Perfect! Let me create a week of balanced meals for you...",
        action: 'generateWellnessPlan',
        showMeals: true
    },

    // Path B: Health Condition (Medical)
    healthCondition: {
        message: "I understand. Could you tell me a bit more about what you're managing? (This helps me suggest the right meals)",
        textOnly: true,
        next: 'processHealthCondition'
    },

    processHealthCondition: {
        // This will be processed by AI to determine condition
        dynamicResponse: true,
        next: 'healthGoal'
    },

    healthGoal: {
        message: "Thank you for sharing that. I'll focus on {condition}-friendly meals. To create the right plan for you, what's your specific goal?",
        options: [
            { key: 'A', text: 'Weight loss (gradual & healthy)', next: 'weightLossPace' },
            { key: 'B', text: 'Maintain current weight', next: 'activityLevel' },
            { key: 'C', text: 'Gain weight/muscle', next: 'activityLevel' }
        ],
        allowText: true,
        saveAs: 'weightGoal'
    },

    weightLossPace: {
        message: "For healthy weight loss, I recommend 0.5-0.75kg per week - this preserves muscle and helps keep weight off long-term. What pace feels right for you?",
        options: [
            { key: 'A', text: 'Yes, 0.5kg per week sounds perfect', next: 'activityLevel' },
            { key: 'B', text: '0.75kg per week would be good', next: 'activityLevel' },
            { key: 'C', text: "I'd still prefer 1kg per week", next: 'activityLevel' }
        ],
        allowText: false,
        saveAs: 'weeklyGoal'
    },

    activityLevel: {
        message: "Great! Now let's figure out your calorie needs. How active is your typical day?",
        options: [
            { key: 'A', text: 'Mostly sitting (office job)', next: 'dailySteps' },
            { key: 'B', text: 'On my feet often', next: 'dailySteps' },
            { key: 'C', text: 'Very active job/lifestyle', next: 'dailySteps' }
        ],
        allowText: false,
        saveAs: 'activity'
    },

    dailySteps: {
        message: "And how many steps do you typically get per day?",
        options: [
            { key: 'A', text: 'Under 5,000', next: 'exerciseAge' },
            { key: 'B', text: '5,000-10,000', next: 'exerciseAge' },
            { key: 'C', text: 'Over 10,000', next: 'exerciseAge' }
        ],
        allowText: true,
        saveAs: 'steps'
    },

    exerciseAge: {
        message: "Almost done! Do you exercise regularly, and what's your age range?",
        textOnly: true,
        placeholder: "e.g., 'I gym 3x week, 35 years old'",
        next: 'showScience'
    },

    showScience: {
        message: "Based on your goals ({condition} + {weightGoal}), here's how I'm structuring your nutrition:",
        showScience: true,
        next: 'confirmCalories'
    },

    confirmCalories: {
        message: "Sound good?",
        options: [
            { key: 'A', text: 'Perfect', next: 'startMedicalPlan' },
            { key: 'B', text: "I'd like fewer calories", action: 'adjustCalories', direction: 'down' },
            { key: 'C', text: "I'd like more calories", action: 'adjustCalories', direction: 'up' }
        ],
        allowText: false
    },

    startMedicalPlan: {
        message: "Perfect! I'll now fill your week with {condition}-friendly meals at {calories} cal/day. You can swap any meals you don't like, or we can adjust them together after.",
        action: 'generateMedicalPlan',
        showMeals: true,
        dayByDay: true
    },

    // Path C: ED Recovery
    edRecovery: {
        message: "Thank you for sharing that. How would you prefer to see your meals?",
        options: [
            { key: 'A', text: 'No numbers at all', next: 'startEDPlan' },
            { key: 'B', text: 'Just portion sizes', next: 'startEDPlan' },
            { key: 'C', text: 'Include nutrition info', next: 'healthyEating' }
        ],
        allowText: false,
        saveAs: 'displayMode'
    },

    startEDPlan: {
        message: "I'll create a colorful, varied week focusing on all food groups. No numbers, just nourishment.",
        action: 'generateEDSafePlan',
        showMeals: true,
        hideNumbers: true
    },

    // Quick Meals Path
    quickMeals: {
        message: "Sure, tell me what you're after and I'll whip it right up!",
        textOnly: true,
        next: 'processQuickRequest'
    },

    processQuickRequest: {
        // AI processes and clarifies
        dynamicResponse: true,
        action: 'generateQuickMeals'
    },

    // After Plan Generation
    afterPlanGeneration: {
        message: "Your week is ready! Any foods you particularly love or hate that I should know about? Or anything you'd like me to change?",
        textOnly: true,
        next: 'processPreferences'
    },

    processPreferences: {
        message: "Got it - no {dislikedFoods}. I'll update your plan now. This might adjust your macros slightly.",
        action: 'updateMeals',
        next: 'finalOptions'
    },

    finalOptions: {
        message: "All set! Quick tip: You can drag any meal to a different day, or click the swap icon to see alternatives. What would you like to do next?",
        options: [
            { key: 'A', text: 'Yes, quick tour', action: 'startTour' },
            { key: 'B', text: 'Generate shopping list', action: 'triggerPaywall' },
            { key: 'C', text: 'Email me my meal plan', action: 'triggerPaywall' }
        ],
        allowText: false
    },

    // Paywall
    triggerPaywall: {
        message: "Awesome! To save your plan and create your shopping list, let's set up your free account:",
        options: [
            { key: 'A', text: 'Sign up with email', action: 'emailSignup' },
            { key: 'B', text: 'Continue with Google', action: 'googleSignup' },
            { key: 'C', text: 'Continue with Apple', action: 'appleSignup' }
        ],
        allowText: false
    },

    afterSignup: {
        message: "Your first shopping list is ready! 🎉\n\nFYI: Unlimited lists, meal tracking, and progress stats are available with Hannah Plus ($14.99/mo)",
        action: 'showShoppingList'
    }
};

// User Profile Builder
class UserProfile {
    constructor() {
        this.data = {
            name: null,
            goal: null,
            condition: null,
            eatingStyle: null,
            household: 'single',
            weightGoal: null,
            activityLevel: null,
            dailySteps: null,
            age: null,
            exerciseFrequency: null,
            tdee: null,
            targetCalories: null,
            macroDistribution: null,
            dietaryRestrictions: [],
            preferences: [],
            displayMode: 'full', // full | noNumbers | portionsOnly
            conversationPath: null
        };
    }

    update(key, value) {
        this.data[key] = value;
        this.saveToLocalStorage();
    }

    calculateTDEE() {
        // Simplified TDEE calculation
        // This would be more complex in production
        let baseTDEE = 2000; // Base for average adult
        
        // Adjust for activity
        if (this.data.activityLevel === 'sedentary') baseTDEE *= 1.2;
        else if (this.data.activityLevel === 'moderate') baseTDEE *= 1.5;
        else if (this.data.activityLevel === 'active') baseTDEE *= 1.7;
        
        // Adjust for steps
        if (this.data.dailySteps > 10000) baseTDEE += 200;
        else if (this.data.dailySteps > 5000) baseTDEE += 100;
        
        this.data.tdee = Math.round(baseTDEE);
        
        // Calculate target calories based on goal and pace
        if (this.data.weightGoal === 'loss' || this.data.weightGoal === 'Weight loss (gradual & healthy)') {
            // Determine deficit based on weekly goal
            let deficit = 550; // Default 0.5kg/week (3,850 cal ÷ 7 days)
            
            if (this.data.weeklyGoal) {
                if (this.data.weeklyGoal.includes('0.75kg')) {
                    deficit = 825; // 0.75kg/week (5,775 cal ÷ 7 days)
                } else if (this.data.weeklyGoal.includes('1kg')) {
                    deficit = 1100; // 1kg/week (7,700 cal ÷ 7 days)
                    // But cap it to ensure minimum safe calories
                    const minCalories = this.data.gender === 'female' ? 1200 : 1500;
                    if (baseTDEE - deficit < minCalories) {
                        deficit = baseTDEE - minCalories;
                    }
                }
            }
            
            this.data.targetCalories = Math.round(baseTDEE - deficit);
            this.data.actualWeeklyLoss = (deficit * 7) / 7700; // 7700 cal = 1kg fat
            
        } else if (this.data.weightGoal === 'gain' || this.data.weightGoal === 'Gain weight/muscle') {
            this.data.targetCalories = Math.round(baseTDEE + 300); // 300 cal surplus
        } else {
            this.data.targetCalories = Math.round(baseTDEE);
        }
        
        // Set macro distribution based on condition
        if (this.data.condition?.includes('NAFLD') || this.data.condition?.includes('fatty liver')) {
            this.data.macroDistribution = {
                carbs: 40,
                protein: 30,
                fat: 30
            };
        } else {
            this.data.macroDistribution = {
                carbs: 45,
                protein: 25,
                fat: 30
            };
        }
    }

    saveToLocalStorage() {
        localStorage.setItem('hannahUserProfile', JSON.stringify(this.data));
    }

    loadFromLocalStorage() {
        const saved = localStorage.getItem('hannahUserProfile');
        if (saved) {
            this.data = JSON.parse(saved);
        }
    }
}