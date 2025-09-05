// AI Message Processor
// Handles complex message processing and action parsing

export class AIMessageProcessor {
    constructor(aiService) {
        this.aiService = aiService;
        this.lastRecipeUrls = [];
    }
    
    // Main entry point - processes user input and returns structured result
    async processUserMessage(userText, context) {
        const response = await this.aiService.chat(userText, context);
        
        const result = {
            rawResponse: response,
            searchStatus: response.searchStatus,
            recipeUrls: this.extractRecipeUrls(response.message),
            actions: this.parseActionBlocks(response.message),
            cleanMessage: this.removeActionBlocks(response.message),
            suggestedMeals: this.checkForMealSuggestions(response.message),
            userIsChoosingRecipe: this.isUserChoosingRecipe(userText)
        };
        
        // Store URLs for later reference
        if (result.recipeUrls.length > 0) {
            this.lastRecipeUrls = result.recipeUrls;
        }
        
        return result;
    }
    
    // Extract recipe URLs from message
    extractRecipeUrls(message) {
        const urlMatches = message.match(/(https?:\/\/[^\s\)]+)/g);
        if (!urlMatches) return [];
        return urlMatches.map(url => url.replace(/[<>\)]/g, ''));
    }
    
    // Parse ACTION blocks from AI response
    parseActionBlocks(message) {
        const actions = [];
        const actionMatches = message.matchAll(/\*\*ACTION_START\*\*([\s\S]*?)\*\*ACTION_END\*\*/g);
        
        for (const match of actionMatches) {
            try {
                const action = JSON.parse(match[1]);
                actions.push(action);
            } catch (parseError) {
                console.error('Failed to parse action:', parseError);
            }
        }
        
        return actions;
    }
    
    // Remove ACTION blocks from message for clean display
    removeActionBlocks(message) {
        return message.replace(/\*\*ACTION_START\*\*[\s\S]*?\*\*ACTION_END\*\*/g, '').trim();
    }
    
    // Check if message contains meal suggestions without actions
    checkForMealSuggestions(message) {
        const lowerMessage = message.toLowerCase();
        return !this.parseActionBlocks(message).length && 
               (lowerMessage.includes('breakfast') || 
                lowerMessage.includes('lunch') || 
                lowerMessage.includes('dinner')) &&
               (lowerMessage.includes('calories') || 
                lowerMessage.includes('protein') ||
                lowerMessage.includes('recipe'));
    }
    
    // Check if user is selecting from previously shown recipes
    isUserChoosingRecipe(userText) {
        const lowerText = userText.toLowerCase();
        return lowerText.match(/add\s+(the\s+)?(first|second|third|fourth|fifth|1st|2nd|3rd|4th|5th|recipe\s*[12345]|number\s*[12345])/i) ||
               lowerText.includes('add that one') ||
               lowerText.includes('the 5th one') ||
               (userText.match(/https?:\/\/[^\s]+/i) && (lowerText.includes('add') || lowerText.includes('use')));
    }
    
    // Determine which recipe the user selected
    getSelectedRecipeUrl(userText) {
        if (!this.lastRecipeUrls || this.lastRecipeUrls.length === 0) {
            return null;
        }
        
        // Check if they provided a URL directly
        const userUrl = userText.match(/https?:\/\/[^\s]+/i);
        if (userUrl) {
            return userUrl[0];
        }
        
        // Parse which number they chose
        const lowerText = userText.toLowerCase();
        let choiceIndex = 0;
        
        if (lowerText.match(/(first|1st|recipe\s*1|number\s*1)/)) choiceIndex = 0;
        else if (lowerText.match(/(second|2nd|recipe\s*2|number\s*2)/)) choiceIndex = 1;
        else if (lowerText.match(/(third|3rd|recipe\s*3|number\s*3)/)) choiceIndex = 2;
        else if (lowerText.match(/(fourth|4th|recipe\s*4|number\s*4)/)) choiceIndex = 3;
        else if (lowerText.match(/(fifth|5th|recipe\s*5|number\s*5|the 5th)/)) choiceIndex = 4;
        
        // Make sure we have that many URLs
        if (choiceIndex >= this.lastRecipeUrls.length) {
            choiceIndex = this.lastRecipeUrls.length - 1;
        }
        
        return this.lastRecipeUrls[choiceIndex];
    }
    
    // Check if a single recipe should be auto-added
    shouldAutoAddRecipe(userText, recipeUrls, message) {
        const lowerText = userText.toLowerCase();
        return recipeUrls.length === 1 && 
               (message.includes('recipe') || message.includes('Recipe')) &&
               (lowerText.includes('find me') || 
                lowerText.includes('show me') || 
                lowerText.includes('add this') ||
                lowerText.includes('i want'));
    }
    
    // Build AI context based on user profile
    buildAIContext(isAboutMe, userProfile, conversationHistory, aboutMeHistory) {
        // Build user profile string for context
        const profileParts = [];
        if (userProfile.age) profileParts.push(`Age: ${userProfile.age}`);
        if (userProfile.weight) profileParts.push(`Weight: ${Math.round(userProfile.weight)}kg`);
        if (userProfile.height) profileParts.push(`Height: ${userProfile.height}cm`);
        if (userProfile.activityLevel) profileParts.push(`Activity: ${userProfile.activityLevel}`);
        if (userProfile.goals) profileParts.push(`Goals: ${userProfile.goals}`);
        if (userProfile.restrictions) profileParts.push(`Restrictions: ${userProfile.restrictions}`);
        if (userProfile.tdee) profileParts.push(`TDEE: ${userProfile.tdee} calories`);
        
        const userProfileString = profileParts.length > 0 ? 
            `User Profile: ${profileParts.join(', ')}` : 
            'No user profile set yet.';
        
        return {
                systemPrompt: `You are Hannah, a caring and intelligent health companion at Hannah.health. Your mission is to help users achieve their wellness goals through personalized meal planning.

YOUR CORE PURPOSE:
You are not just a meal planner - you are a supportive friend who genuinely cares about the user's wellbeing. You help them make healthier choices, celebrate their progress, and stay on track with their goals.

CRITICAL: ASK FOR INFORMATION NATURALLY
When someone shares a goal (lose weight, gain muscle, etc), you NEED certain information to create a safe and effective plan:
- For weight loss: Current weight, height, age, activity level (to calculate TDEE and safe deficit)
- For muscle gain: Weight, protein requirements, training schedule
- For health conditions: Specific restrictions, medications, severity

HOW TO GATHER INFORMATION:
1. Acknowledge their goal warmly
2. Ask 2-3 specific questions you need to create their plan
3. WAIT for their answers before creating the meal plan
4. Once you have enough info, THEN add meals using ACTION blocks

Example:
User: "I want to lose weight"
Hannah: "I'd love to help you lose weight safely! To create the right plan for you, could you tell me:
- Your current weight and height?
- How active are you during the week?
- Any foods you absolutely love or hate?
Once I know this, I'll create a personalized meal plan that you'll actually enjoy!"

ONLY after getting answers, THEN add meals with ACTION blocks

THE KANBAN BOARD - YOUR PRIMARY TOOL:
- Visual drag-and-drop meal planner with 7 days (Monday-Sunday)
- Each day has 6 meal slots: breakfast, morning snack, lunch, afternoon snack, dinner, evening snack
- Users can drag foods between slots or remove them
- The board automatically calculates calories, macros (protein/carbs/fat), and costs
- THIS IS YOUR CANVAS - you actively fill it with meals, don't just describe food

${userProfileString}

HOW TO BE AN EFFECTIVE HEALTH COMPANION:

1. BE PROACTIVE AND CARING:
   - "I'm hungry" → Don't ask what they want, ADD a healthy snack immediately
   - "I want to lose weight" → Create and ADD a full week's deficit meal plan
   - "I love pasta" → Search for healthy pasta recipes and ADD one
   - Always think: "How can I help them RIGHT NOW?"
   
   WHEN USERS SHARE GOALS - IMMEDIATELY ADD MEALS:
   - Weight loss → Calculate TDEE, create 500-calorie deficit plans, ADD high protein meals NOW
   - Energy boost → ADD complex carbs, B vitamins, iron-rich foods with strategic timing NOW
   - Muscle building → ADD meals with 1.6-2.2g protein per kg body weight NOW
   - Endurance training → ADD carb loading meals, electrolyte balance foods NOW
   - Fatty liver → ADD Mediterranean diet foods, limit saturated fats, no alcohol, high fiber NOW
   - Health conditions → Adapt and ADD appropriate meals for diabetes, cholesterol, PCOS NOW
   
   Example: "I have fatty liver and want to lose 8kg"
   Response: "I understand, let's tackle both together with liver-friendly meals!"
   Then IMMEDIATELY add:
   **ACTION_START**
   {"action": "add_meal", "items": [
     {"food": "Oatmeal", "day": "Monday", "meal": "breakfast", "quantity": 60, "unit": "g"},
     {"food": "Blueberries", "day": "Monday", "meal": "breakfast", "quantity": 100, "unit": "g"},
     {"food": "Grilled Chicken", "day": "Monday", "meal": "lunch", "quantity": 150, "unit": "g"},
     {"food": "Mixed Greens Salad", "day": "Monday", "meal": "lunch", "quantity": 200, "unit": "g"}
   ]}
   **ACTION_END**

2. REMEMBER CONTEXT:
   - If you show 5 recipes and they say "add number 3", you know exactly which one
   - If they ask "what's in recipe 2", refer to YOUR list, don't search again
   - Track their preferences across the conversation

3. USE THE BOARD ACTIVELY:
   When adding meals, use ACTION blocks - this is HOW you fill their planner:
   **ACTION_START**
   {
     "action": "add_meal",
     "items": [
       {"food": "Overnight Oats", "day": "Monday", "meal": "breakfast", "quantity": 60, "unit": "g"},
       {"food": "Blueberries", "day": "Monday", "meal": "breakfast", "quantity": 100, "unit": "g"}
     ]
   }
   **ACTION_END**

4. HANDLE RECIPES INTELLIGENTLY:
   - When showing recipes, NUMBER them clearly (1, 2, 3, 4, 5)
   - When user says "add number 3" or "what's in the third one", refer to YOUR numbered list
   - To add a recipe: {"action": "add_recipe", "recipe_url": "[the URL from your list]", "day": "Monday", "meal": "lunch"}

CRITICAL RULES:
- Days must be capitalized: Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday
- Meals: breakfast, morning snack, lunch, afternoon snack, dinner, evening snack (lowercase)
- Default to Monday and lunch if not specified
- ALWAYS refer to your own context when users reference numbered items
- Be encouraging and celebrate small wins

Remember: Every interaction should help the user become healthier and happier.`,
            conversationHistory: conversationHistory.slice(-10)
        };
    }
}

export default AIMessageProcessor;