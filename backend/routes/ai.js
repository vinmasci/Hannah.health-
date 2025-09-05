const express = require('express');
const router = express.Router();

// Store conversation context for each user session
const assessmentSessions = new Map();

// Helper function to search for nutrition data using Brave
async function searchNutritionData(query) {
  try {
    console.log('🔍 Starting Brave search for:', query);
    
    // Adjust search query based on type
    let searchQuery;
    if (query.toLowerCase().includes('recipe') || query.toLowerCase().includes('chicken') || query.toLowerCase().includes('garlic')) {
      searchQuery = `${query} recipe ingredients instructions cooking`;
    } else {
      searchQuery = `${query} recipe ingredients instructions`;  // ALWAYS search for recipes for now
    }
    
    console.log('📡 Calling Brave API with query:', searchQuery);
    console.log('🔑 Using API key:', process.env.BRAVE_API_KEY ? 'Yes (length: ' + process.env.BRAVE_API_KEY.length + ')' : 'No');
    
    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(searchQuery)}&country=AU&count=5`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': process.env.BRAVE_API_KEY
      }
    });

    console.log('📨 Brave API response status:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Brave API error:', errorText);
      throw new Error('Brave search failed');
    }

    const data = await response.json();
    console.log('✅ Brave search returned', data.web?.results?.length || 0, 'results');
    
    // Compile search results into context with clear URL marking
    const searchContext = data.web?.results?.map(r => {
      console.log('Found URL:', r.url);
      return `[REAL URL: ${r.url}]\nTitle: ${r.title}\n${r.description}\n${r.extra_snippets?.[0] || ''}`;
    }).join('\n\n---\n\n') || '';
    
    // Extract domain names for status message
    const domains = data.web?.results?.map(r => {
      try {
        const url = new URL(r.url);
        return url.hostname.replace('www.', '');
      } catch {
        return null;
      }
    }).filter(Boolean) || [];
    
    return { context: searchContext, domains };
  } catch (error) {
    console.error('❌ Brave search error:', error.message);
    console.error('Full error:', error);
    return { context: null, domains: [] };
  }
}

// Main AI chat endpoint - now uses Brave + GPT-4o-mini
router.post('/chat', async (req, res) => {
  console.log('🎯 Chat endpoint hit with message:', req.body.message);
  try {
    const { message, context, conversationHistory } = req.body;
    
    console.log('Received conversation history:', JSON.stringify(conversationHistory, null, 2));
    console.log('Received context:', JSON.stringify(context, null, 2));
    
    if (!process.env.OPENAI_API_KEY || !process.env.BRAVE_API_KEY) {
      throw new Error('API keys not configured');
    }

    // Build messages array from conversation history
    const messages = [];
    
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.forEach((exchange) => {
        if (exchange.role && exchange.content) {
          messages.push({ role: exchange.role, content: exchange.content });
        }
      });
    }
    
    // Always add the current message at the end
    messages.push({ role: 'user', content: message });
    
    // Check if this is a food logging context, exercise logging, or recipe query
    const isLoggingContext = context?.instruction?.toLowerCase().includes('log') || 
                            context?.instruction?.toLowerCase().includes('calorie');
    const isExerciseContext = context?.type === 'exercise_logging';
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    console.log('📝 Context type:', isExerciseContext ? 'Exercise Logging' : (isLoggingContext ? 'Food Logging' : 'General Chat'));
    console.log('📝 Checking message for food/recipe keywords:', lastMessage.substring(0, 100));
    let searchStatus = null;
    let searchContext = '';
    
    // Only search for recipes if NOT in logging context
    const foodKeywords = ['recipe', 'how to make', 'how to cook', 'cook', 'bake', 'prepare',
                         'frittata', 'pasta', 'salad', 'soup', 'sandwich', 'smoothie', 'bowl',
                         'breakfast', 'lunch', 'dinner', 'snack', 'meal', 'dish', 'food',
                         'mcdonald', 'mcdonalds', 'big mac', 'nugget', 'fries', 'burger',
                         'coles', 'woolworths', 'kfc', 'subway', 'hungry jack',
                         'calories', 'nutrition', 'protein', 'carbs', 'fat',
                         'chicken', 'beef', 'fish', 'salmon', 'tuna', 'eggs', 'rice',
                         'vegetables', 'fruit', 'bread', 'cheese', 'yogurt', 'oats',
                         'garlic', 'butter', 'steak', 'pork', 'turkey', 'bacon',
                         'pizza', 'tacos', 'curry', 'stir fry', 'roast', 'grilled'];
    
    // Check if asking for ANY food item or recipe
    const shouldSearch = foodKeywords.some(keyword => lastMessage.includes(keyword)) || 
                        lastMessage.includes('give me') || 
                        lastMessage.includes('find me') ||
                        lastMessage.includes('show me') ||
                        lastMessage.includes('I want') ||
                        lastMessage.includes('I need');
    
    // Handle exercise logging separately (no search needed)
    if (isExerciseContext) {
      console.log('💪 Exercise logging context - no search needed');
      searchStatus = 'Calculating calories burned...';
      
      // Add exercise-specific system prompt - let GPT use its knowledge
      messages.splice(messages.length - 1, 0, {
        role: 'system',
        content: `You are a fitness expert. Calculate calories burned based on the exercise described.

Use your knowledge of:
- MET (Metabolic Equivalent of Task) values for specific activities
- Exercise intensity levels and their impact
- Duration and type of activity
- Standard calorie burn rates from exercise science

For context: User weighs approximately ${context?.userWeight || 70}kg

Be specific and accurate based on the actual activity described. For example:
- "Leisurely walk" burns differently than "brisk walk" or "power walk"
- "Yoga" varies greatly (gentle/hatha ~2.5 METs, power/vinyasa ~4 METs, hot yoga ~5 METs)
- Swimming laps burns more than treading water
- Cycling at 10mph is different from cycling at 20mph

Calculate using: Calories = METs × weight(kg) × time(hours)
Or use your training data for common activities.

Format your response EXACTLY as:
"[exercise description] = [calories] calories burned"
Example: "45 min moderate cycling = 320 calories burned"
Then say: "Tap confirm to log this exercise."

Be accurate but concise. 2 lines maximum.`
      });
      
    // Handle food logging vs recipe search differently
    } else if (isLoggingContext && lastMessage) {
      // Check if this is a confirmation response
      if (lastMessage === 'y' || lastMessage === 'yes' || lastMessage === 'confirm') {
        console.log('✅ Confirmation received for food logging');
        searchStatus = 'Confirmed';
        
        // Add confirmation response
        messages.splice(messages.length - 1, 0, {
          role: 'system',
          content: `The user has confirmed the food logging. Respond with a brief acknowledgment like "Great! I've logged that for you. 🎯"`
        });
      } else {
        console.log('✅ Logging context detected - searching for nutrition data');
        searchStatus = 'Looking up info...';
        
        // Check if this is exercise or food (fallback check)
        const exerciseKeywords = ['exercise', 'workout', 'run', 'walk', 'gym', 'yoga', 
                                 'swim', 'bike', 'cardio', 'strength', 'training', 'jog'];
        const isExercise = exerciseKeywords.some(kw => lastMessage.includes(kw));
        
        // Use Brave search to get REAL data - adjust query based on type
        const nutritionSearchQuery = isExercise 
          ? `${lastMessage} calories burned per minute MET value`
          : `${lastMessage} calories nutrition facts per serving`;
        console.log('🔍 Searching for data:', nutritionSearchQuery);
      
      const searchResult = await searchNutritionData(nutritionSearchQuery);
      searchContext = searchResult.context;
      
      if (searchContext) {
        // Add search results to help AI calculate accurate calories AND macros
        const nutritionSystemPrompt = `You are helping the user log their intake. Use these web search results to determine accurate information:

${searchContext}

CONTEXT VALUES:
- needs_meal_type: ${context?.needs_meal_type || false}

IMPORTANT: Check conversation history for corrections:
- If the user is correcting a previous food item (e.g., "it was actually olive oil spray" or "no oil" or "just 1 tsp"), UPDATE the original breakdown
- Recalculate the total with the corrected ingredient
- Show the CORRECTED full breakdown, not just the correction

Example correction flow:
User: "3 egg omelette with peas"
Assistant: Shows breakdown with 1 tbsp oil (120 cal)
User: "It was actually olive oil spray"
Assistant: Shows UPDATED full breakdown with spray (10 cal) instead, new total

FOR FOOD ITEMS:
1. Identify the food item(s) and quantity from the user's message
2. For COMPOSITE DISHES (like omelettes, sandwiches, salads), intelligently break down into components:
   - Main ingredients with stated quantities (e.g., "3 eggs")
   - Secondary ingredients with reasonable portions when not specified:
     * Vegetables in omelette: ~1/4 cup (30g) per vegetable type
     * Cheese in omelette: ~1 oz (28g) if mentioned
     * Cooking oil/butter: 1 tbsp (120 cal) for pan-fried dishes
     * Milk in scrambled eggs/omelette: 2 tbsp
     * Common seasonings: negligible calories
   - Be smart about context:
     * "omelette with peas" → 3 eggs (210 cal) + 1/4 cup peas (30 cal) + 1 tbsp oil (120 cal)
     * "cheese omelette" → eggs + 1 oz cheese (110 cal) + 1 tbsp oil
     * "veggie omelette" → eggs + ~1/2 cup mixed veggies + 1 tbsp oil

3. Extract ACCURATE nutrition data from search results OR use knowledge:
   - Total calories (sum of all components)
   - Protein (in grams)
   - Carbohydrates (in grams)  
   - Fat (in grams)
   - Fiber (in grams) - if available
   - Sugar (in grams) - if available
   - Sodium (in mg) - if available
   - Portion size (e.g., "1 cup", "100g", "1 medium")

4. Provide a clear breakdown in this format:
   "3 egg omelette with peas
   3 eggs: 210 cal
   1/4 cup peas: 30 cal
   1 tbsp cooking oil: 120 cal
   360 calories | P: 20g | C: 8g | F: 27g"
   
   NO bullet points (•), NO "Total:" label, just clean lines.
   Each ingredient on its own line, then the final line with total calories and macros.
   IMPORTANT: Keep the display simple. Do NOT show fiber/sugar/sodium to the user.
   
   For CORRECTIONS, show the UPDATED full breakdown:
   "3 egg omelette with peas (updated)
   3 eggs: 210 cal
   1/4 cup peas: 30 cal
   Olive oil spray: 10 cal
   250 calories | P: 19g | C: 8g | F: 16g"
   
5. CRITICAL - Check if meal type is needed:
   - If the user's message doesn't contain "breakfast", "lunch", "dinner", "snack" (check case-insensitively, including "for breakfast:", "for lunch:", etc.) AND context.needs_meal_type is true:
     End with: "Which meal is this for? (breakfast/lunch/dinner/snack)"
   - Otherwise, end with: "Tap confirm to log this food."
   
   IMPORTANT: Always check context.needs_meal_type and ask for meal type if it's true!

FOR EXERCISE:
1. Identify the exercise type and duration
2. Calculate calories burned based on:
   - Light intensity: ~3-4 calories/minute
   - Moderate intensity: ~5-7 calories/minute  
   - Vigorous intensity: ~8-12 calories/minute
3. Provide confirmation in this format:
   "[exercise] for [duration] = [calories] calories burned"
   Example: "45 min light workout = 150 calories burned"
4. Then say "Tap confirm to log this exercise."

CRITICAL RULES - VIOLATING THESE WILL CAUSE ERRORS:
- NEVER EVER write "Please confirm with 'Y'" or ANY variation
- NEVER mention typing Y or replying with Y
- NEVER ask for confirmation with Y
- NEVER use the letter Y in any confirmation context
- ONLY say "Tap confirm to log this [food/exercise]" - NOTHING ELSE
- Keep response to 2 lines maximum
- DO NOT provide additional details or sources unless specifically asked`;
        
        messages.splice(messages.length - 1, 0, {
          role: 'system',
          content: nutritionSystemPrompt
        });
      } else {
        // Search failed, but still try to help
        messages.splice(messages.length - 1, 0, {
          role: 'system',
          content: `You are helping the user log their intake. Use your knowledge to provide accurate estimates.

FOR FOOD ITEMS - Break down composite dishes intelligently:
- Main ingredients with stated quantities (e.g., "3 eggs" = 210 cal)
- Estimate reasonable portions for unstated ingredients:
  * Vegetables: ~1/4 cup (30g) each
  * Cheese: ~1 oz (28g) = 110 cal
  * Cooking oil/butter: 1 tbsp = 120 cal for fried dishes
  * Milk in eggs: 2 tbsp = 20 cal
  
Example breakdown for "3 egg omelette with peas":
"3 egg omelette with peas
3 eggs: 210 cal
1/4 cup peas: 30 cal  
1 tbsp cooking oil: 120 cal
360 calories | P: 20g | C: 8g | F: 27g"

FOR EXERCISE: Calculate based on METs and duration

Then check context for meal type:
- If context.needs_meal_type is true, add: "Which meal is this for? (breakfast/lunch/dinner/snack)"
- Otherwise say: "Tap confirm to log this [food/exercise]."
Note: Using standard estimates.`
        });
      }
      }
      
    } else if (shouldSearch && !isLoggingContext) {
      
      console.log('✅ FORCING SEARCH for message:', lastMessage);
      
      // Determine what we're searching
      let searchTarget = 'the web';
      if (lastMessage.includes('recipe')) searchTarget = "recipe websites";
      else if (lastMessage.includes('mcdonald')) searchTarget = "McDonald's website";
      else if (lastMessage.includes('coles')) searchTarget = "Coles website";
      else if (lastMessage.includes('woolworth')) searchTarget = "Woolworths website";
      else if (lastMessage.includes('kfc')) searchTarget = "KFC website";
      else if (lastMessage.includes('subway')) searchTarget = "Subway website";
      else if (lastMessage.includes('hungry jack')) searchTarget = "Hungry Jack's website";
      
      const searchType = lastMessage.includes('recipe') ? 'recipes' : 'nutritional info';
      searchStatus = `Searching ${searchTarget} for ${searchType}...`;
      
      const searchResult = await searchNutritionData(lastMessage);
      searchContext = searchResult.context;
      
      if (!searchContext) {
        console.log('⚠️ Search returned no context - search may have failed');
      }
      
      // Update status based on what was actually searched
      if (searchResult.domains.length > 0) {
        const uniqueDomains = [...new Set(searchResult.domains)];
        if (uniqueDomains.includes('mcdonalds.com.au')) {
          searchStatus = "Scanned McDonald's Australia website";
        } else if (uniqueDomains.includes('coles.com.au')) {
          searchStatus = "Scanned Coles website";  
        } else if (uniqueDomains.includes('woolworths.com.au')) {
          searchStatus = "Scanned Woolworths website";
        } else if (uniqueDomains.length === 1) {
          searchStatus = `Scanned ${uniqueDomains[0]}`;
        } else {
          searchStatus = `Searched ${uniqueDomains.length} nutrition databases`;
        }
      }
      
      if (searchContext) {
        // Add search results to the system prompt
        const searchSystemPrompt = `Here are web search results. The URLs marked as [REAL URL: ...] are the ONLY URLs you should use:

${searchContext}

CRITICAL RULES:
1. You MUST ONLY use URLs that appear above marked as [REAL URL: ...]
2. If you want to share a recipe link, it MUST be one of the [REAL URL: ...] links above
3. If none of the search results have the exact recipe requested, describe recipes from the results you DO have
4. NEVER create, guess, or make up any URLs - only use the exact [REAL URL: ...] links provided above
5. When sharing a URL, copy it EXACTLY as shown after [REAL URL: ]`;
        
        // Insert search context before the last user message
        messages.splice(messages.length - 1, 0, {
          role: 'system',
          content: searchSystemPrompt
        });
      }
    } else {
      // Not a food query - AI is just thinking
      console.log('❌ No food/recipe keywords detected, skipping web search');
      searchStatus = isLoggingContext ? "Processing..." : "Thinking...";
    }
    
    console.log(`Final messages array (${messages.length} total)`);

    // Enhance system prompt to indicate web search capability when used
    let enhancedSystemPrompt = context?.systemPrompt || '';
    if (searchContext) {
      const isRecipeSearch = lastMessage.includes('recipe');
      if (isRecipeSearch) {
        enhancedSystemPrompt = `${enhancedSystemPrompt}\n\nYou have performed a web search and found real recipes. When sharing URLs:
- ONLY share URLs that were marked as [REAL URL: ...] in the search results
- Copy the URL exactly as it appeared after [REAL URL: ]
- Use markdown format for links: [Recipe Name](url) - do NOT also include the plain URL
- If you can't find a specific recipe in the search results, suggest similar ones from what you found
- NEVER make up or guess URLs - only use the exact URLs from search results

CRITICAL REMINDER: To actually ADD items to the meal planner (not just describe them), you MUST use ACTION blocks:
**ACTION_START**
{"action": "add_meal", "items": [{"food": "Food Name", "day": "monday", "meal": "breakfast", "quantity": 100, "unit": "g"}]}
**ACTION_END**

IMPORTANT: When you show numbered recipe links and the user says something like "add number 5" or "add the 5th one":
1. IMMEDIATELY identify which URL they're referring to (the 5th link you showed)
2. Use ACTION blocks to add a placeholder: {"action": "add_recipe", "recipe_url": "[the actual URL from position 5]", "day": "Monday", "meal": "lunch"}
3. The system will automatically fetch and add all ingredients from that recipe`;
      } else {
        enhancedSystemPrompt = `${enhancedSystemPrompt}\n\nYou have searched the web for current information. Only share URLs that were marked as [REAL URL: ...] in the search results.`;
      }
    }
    
    // Call OpenAI API with GPT-4o-mini
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          ...(enhancedSystemPrompt ? [{ role: 'system', content: enhancedSystemPrompt }] : []),
          ...messages
        ],
        temperature: 0.3,
        max_tokens: 5000  // Increased to allow full responses with URLs
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error('AI service error');
    }

    const data = await response.json();
    
    // Extract text from OpenAI's response  
    let responseText = data.choices?.[0]?.message?.content || 'I need a moment to think about that...';
    
    // Clean up the [REAL URL: ...] markers from the response
    responseText = responseText.replace(/\[REAL URL: ([^\]]+)\]/g, '$1');
    
    // ALWAYS clean up Y confirmation text - regardless of context
    // This is CRITICAL - the AI keeps ignoring instructions
    responseText = responseText
      .replace(/Please confirm with ['"]?Y['"]? or provide more details if needed\.?/gi, 'Tap confirm to log this food.')
      .replace(/Reply Y to confirm\.?/gi, 'Tap confirm to log this food.')
      .replace(/Please confirm with 'Y' or provide more details if needed\./gi, 'Tap confirm to log this food.')
      .replace(/Please confirm with 'Y' or provide more details if needed/gi, 'Tap confirm to log this food.')
      .replace(/Confirm with Y\b/gi, 'Tap confirm to log')
      .replace(/Reply with Y\b/gi, 'Tap confirm to log')
      .replace(/Type Y to confirm/gi, 'Tap confirm to log')
      .replace(/Reply 'Y' to confirm/gi, 'Tap confirm to log')
      .replace(/Reply 'Y'/gi, 'Tap confirm')
      .replace(/confirm with 'Y'/gi, 'tap confirm')
      .replace(/with 'Y' or/gi, 'or')
      .replace(/with 'Y'/gi, '')
      .replace(/Please confirm with Y/gi, 'Tap confirm to log this food')
      .replace(/confirm with Y/gi, 'tap confirm');
    
    res.json({ 
      message: responseText,
      searchStatus: searchStatus,
      success: true
    });
    
  } catch (error) {
    console.error('AI route error:', error.message);
    
    res.status(500).json({ 
      error: 'Service unavailable',
      message: "The meal planner service is currently unavailable. Please check your internet connection and try again later.",
      success: false
    });
  }
});

// Discuss results with user
router.post('/discuss-results', async (req, res) => {
  try {
    const { userData, userMessage, messageType } = req.body;
    
    let systemPrompt = `You are Hannah, a friendly AI nutrition assistant discussing a user's personalized nutrition plan. 
    Be conversational, supportive, and educational. Explain complex concepts simply.
    
    User's Data:
    - BMR: ${userData.bmr} calories (baseline metabolism)
    - TDEE: ${userData.tdee} calories (total daily expenditure)
    - Target: ${userData.targetCalories} calories
    - Goal: ${userData.goal}
    - BMI: ${userData.bmi}
    - Health Conditions: ${userData.healthConditions || 'None'}
    - Exercise: ${userData.exerciseCalories} calories burned daily from activity
    - Daily Steps: ${userData.dailySteps}
    - Macros: Protein ${userData.macros?.protein}g, Carbs ${userData.macros?.carbs}g, Fat ${userData.macros?.fat}g
    `;
    
    let userPrompt;
    
    if (messageType === 'initial_discussion') {
      systemPrompt += `
      Explain their results in a natural, encouraging way. Cover:
      1. Their baseline energy expenditure (BMR) and what it means
      2. How their activity (steps + exercise) adds to their burn
      3. Why the suggested calorie target makes sense for their goal
      4. Brief mention of their BMI and healthy weight range
      5. Suggest meal frequency (3 meals + snacks is good default)
      6. Mention that meal suggestions will appear soon
      
      IMPORTANT: Do NOT start with "Absolutely!", "Sure!", "Of course!", "I'd be happy to", or any similar exclamations or pleasantries. 
      Start DIRECTLY with the explanation like: "Let's break down your results..." or "Your Basal Metabolic Rate..."
      
      Be specific with their numbers but explain what they mean in simple terms.
      Keep it conversational and supportive. About 3-4 paragraphs.
      End with a question to engage them.`;
      
      userPrompt = "Please explain my results to me.";
    } else {
      systemPrompt += `
      The user is asking about their plan or requesting changes.
      Be helpful and accommodating. If they want to change meal frequency,
      calorie targets, or have questions, respond naturally.
      
      If they request specific changes, acknowledge them positively.
      Keep responses concise unless they ask for more detail.`;
      
      userPrompt = userMessage;
    }
    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ];
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: messages,
        temperature: 0.8,
        max_tokens: 500
      })
    });
    
    if (!openAIResponse.ok) {
      throw new Error('OpenAI API error');
    }
    
    const aiData = await openAIResponse.json();
    const aiMessage = aiData.choices[0].message.content;
    
    // Check if user requested changes
    let requestedChanges = null;
    if (userMessage) {
      const lower = userMessage.toLowerCase();
      if (lower.includes('6 meals') || lower.includes('six meals')) {
        requestedChanges = { mealsPerDay: 6 };
      } else if (lower.includes('4 meals') || lower.includes('four meals')) {
        requestedChanges = { mealsPerDay: 4 };
      } else if (lower.includes('5 meals') || lower.includes('five meals')) {
        requestedChanges = { mealsPerDay: 5 };
      }
    }
    
    res.json({ 
      message: aiMessage,
      requestedChanges: requestedChanges 
    });
    
  } catch (error) {
    console.error('Discussion error:', error);
    res.status(500).json({ 
      error: 'Failed to process discussion',
      message: "I'm having trouble right now. Please try again." 
    });
  }
});

// Simple health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    hasOpenAIKey: !!process.env.OPENAI_API_KEY,
    hasBraveKey: !!process.env.BRAVE_API_KEY
  });
});

// Test Brave search endpoint
router.get('/test-search', async (req, res) => {
  try {
    console.log('🧪 Testing Brave search...');
    const result = await searchNutritionData('frittata recipe');
    res.json({ 
      success: true,
      hasResults: !!result.context,
      domains: result.domains,
      contextLength: result.context?.length || 0
    });
  } catch (error) {
    res.json({ 
      success: false,
      error: error.message 
    });
  }
});

// AI-driven assessment conversation endpoint
router.post('/assessment-response', async (req, res) => {
  try {
    const { sessionId, currentQuestion, userResponse, userData, conversationHistory } = req.body;
    
    console.log('🤖 Processing assessment response for question:', currentQuestion.id);
    console.log('👤 User response:', userResponse);
    
    // Build context for Claude
    const systemPrompt = `You are Hannah, a friendly AI nutrition assistant helping a user with their nutrition assessment. 
    You need to understand their response and determine:
    1. If you need clarification (e.g., for misspellings or unclear conditions)
    2. If you need more specific information about their condition
    3. If you should acknowledge and move on
    
    Current question topic: ${currentQuestion.id}
    User's response: "${userResponse}"
    Previous conversation: ${conversationHistory ? conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n') : 'None'}
    
    IMPORTANT: 
    - Only reference things the user has explicitly mentioned in THIS conversation
    - Don't say "you've already mentioned" unless they actually have
    - If the user gives a clear dismissive response like "no", "that's it", "nothing else" to a direct follow-up question, acknowledge and indicate we'll move to the next question.
    
    For health conditions:
    - Recognize common conditions even if misspelled (NAFLD = Non-alcoholic fatty liver disease, etc.)
    - Ask for clarification ONLY if truly unclear
    - If they mention an actual health condition (not "none" or "no"), ask for more information ONLY ONCE
    - First time: Ask "Do you mind sharing a little more information about your [condition] to help create a healthy plan for you? Specifically, what's the severity (mild, moderate, or severe) and when were you diagnosed? Or would you like to move on?"
    - If they provide ANY details about severity OR timing, that's ENOUGH - don't ask again
    - Examples of sufficient details: "mild", "severe", "recently diagnosed", "last year", "managed with medication", "under control", etc.
    - If they say "move on", "no", or similar, acknowledge briefly and indicate we'll move to the next question
    - DON'T keep asking for more information after they've provided some details
    - When they provide details, acknowledge with: "Thanks, that helps me understand better. Let's move to the next question."
    
    For steps questions (question about daily steps):
    - After they provide their step count, ALWAYS follow up with: "How do you accumulate those steps? Through work? If so, what type of work and what level of intensity - low, moderate, or intense?"
    - If they say they don't track steps or don't know, that's fine - move on
    - This helps us understand if their steps are from active work vs casual walking
    
    For exercise/activity questions (question 7):
    - If they mention specific activities, ask about duration and intensity ONCE
    - Ask: "Great routine! Let's get specific so I can calculate accurately. For your [activity], how long do you typically spend and what's the intensity - light, moderate, or intense?"
    - If they have multiple activities, ask about all in one question: "For your gym sessions - how long and what intensity? And same for your runs?"
    - Once they provide ANY duration and intensity info (even if approximate), that's ENOUGH - acknowledge and move on
    - Examples of sufficient answers: "45 mins moderate", "1 hour intense", "30-45 minutes light", etc.
    - Don't ask for more clarification after getting time and intensity
    - If they say "no exercise" or "none", just acknowledge with "Got it"
    - When they provide details, respond with: "Thanks for the details! That helps me understand your exercise routine better. Let's move to the next question."
    
    For goal questions:
    - Consider the full context of the conversation
    - If they've mentioned NAFLD earlier and now mention it again, understand they want to address it
    - "Get rid of NAFLD" implies weight loss and dietary changes
    - Multiple goals are fine - acknowledge all of them
    
    For gender questions specifically:
    - Just acknowledge with "Got it" or "Understood" 
    - NEVER say "Got it, you're male" or "Got it, you're female"
    - Be neutral and respectful
    
    For other questions:
    - Parse the response intelligently
    - Ask for clarification only if genuinely needed
    - Acknowledge their answer and move on
    
    Be conversational but concise. If unsure whether to ask a follow-up, prefer moving forward.
    When user says "no" to a follow-up question, acknowledge briefly.
    
    IMPORTANT RULES:
    1. Do NOT introduce the next question yourself. The system will handle that.
    2. Don't thank the user for every response - only when truly appropriate (sharing sensitive info, etc.)
    3. If you offer a choice ("feel free to share" or "we can move on"), DO NOT say anything that implies moving to the next question yet - wait for their response first.
    4. Keep acknowledgments brief and avoid repeating back sensitive information
    5. For gender responses, just say "Got it" or "Understood" - never repeat back "you're male/female"
    6. For age, you can say "Got it, you're 39" but for gender/sex, be more neutral
    7. When user provides health condition details (severity, timing, etc.), acknowledge and say "Thanks, that helps me understand better. Let's move to the next question."
    8. Don't ask for more information if you already have severity (mild/moderate/severe) or timing (recently diagnosed, etc.)`;
    
    const messages = [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Question asked: "${currentQuestion.question}"\nUser answered: "${userResponse}"\n\nHow should I respond?` }
    ];
    
    // Add conversation history for context
    if (conversationHistory && conversationHistory.length > 0) {
      messages.splice(1, 0, ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content
      })));
    }
    
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 500,
        messages: messages,
        temperature: 0.7
      })
    });
    
    if (!openAIResponse.ok) {
      const errorBody = await openAIResponse.text();
      console.error('OpenAI API error:', openAIResponse.status, errorBody);
      throw new Error('Failed to get AI response');
    }
    
    const aiData = await openAIResponse.json();
    const aiResponse = aiData.choices[0].message.content;
    
    // Determine if we need a follow-up question or can proceed
    const lowerResponse = userResponse.toLowerCase();
    const dismissiveResponses = ['no', 'nope', 'that\'s it', 'thats it', 'nothing', 'none', 'no thanks', 'move on'];
    const isDismissive = dismissiveResponses.some(r => lowerResponse === r || lowerResponse === `${r}.`);
    
    // Check if user provided sufficient details about health condition
    const hasSufficientHealthDetails = currentQuestion.id === 'healthConditions' && (
      lowerResponse.includes('mild') ||
      lowerResponse.includes('moderate') ||
      lowerResponse.includes('severe') ||
      lowerResponse.includes('recently diagnosed') ||
      lowerResponse.includes('long-term') ||
      lowerResponse.includes('managed') ||
      lowerResponse.includes('under control') ||
      lowerResponse.includes('medication') ||
      lowerResponse.includes('years') ||
      lowerResponse.includes('months')
    );
    
    // Check if user provided sufficient exercise details (duration and intensity)
    const hasSufficientExerciseDetails = currentQuestion.id === 'exercise' && (
      (lowerResponse.includes('min') || lowerResponse.includes('minute') || 
       lowerResponse.includes('hour') || lowerResponse.includes('hrs')) &&
      (lowerResponse.includes('light') || lowerResponse.includes('moderate') || 
       lowerResponse.includes('intense') || lowerResponse.includes('high') ||
       lowerResponse.includes('low') || lowerResponse.includes('vigorous'))
    );
    
    // Check if user provided sufficient step details  
    const hasSufficientStepDetails = currentQuestion.id === 'steps' && (
      (lowerResponse.includes('work') || lowerResponse.includes('job') || 
       lowerResponse.includes('walking') || lowerResponse.includes('casual')) &&
      (lowerResponse.includes('light') || lowerResponse.includes('moderate') || 
       lowerResponse.includes('intense') || lowerResponse.includes('low') ||
       lowerResponse.includes('high'))
    );
    
    // Check if AI is offering a choice to continue or share more
    const offeringChoice = aiResponse.toLowerCase().includes('feel free to share') ||
                          aiResponse.toLowerCase().includes('you can share') ||
                          aiResponse.toLowerCase().includes('would you like to') ||
                          aiResponse.toLowerCase().includes('if you have any') ||
                          aiResponse.toLowerCase().includes('otherwise');
    
    // Don't ask for follow-up if we have sufficient details for the specific question type
    const hasSufficientDetails = hasSufficientHealthDetails || 
                                 hasSufficientExerciseDetails || 
                                 hasSufficientStepDetails;
    
    // If user provided sufficient details, don't ask for follow-up
    // If offering a choice and user hasn't dismissed, wait for response
    // Otherwise, only wait if there's a direct question and user wasn't dismissive
    const needsFollowUp = hasSufficientDetails ? false :
                          (offeringChoice ? !isDismissive : 
                          (!isDismissive && 
                           aiResponse.toLowerCase().includes('?') && 
                           !aiResponse.toLowerCase().includes('let me know if')));
    
    // Parse the response to extract key information
    let parsedData = {};
    const lowerUserResponse = userResponse.toLowerCase();
    
    if (currentQuestion.id === 'healthConditions') {
      // Check for specific conditions mentioned
      const conditions = ['diabetes', 'nafld', 'fatty liver', 'heart', 'hypertension', 
                         'celiac', 'ibs', 'crohn', 'allerg'];
      const hasCondition = conditions.some(c => lowerUserResponse.includes(c));
      parsedData = {
        hasHealthConditions: hasCondition || lowerUserResponse.includes('yes'),
        condition: userResponse,
        aiUnderstanding: aiResponse
      };
    } else if (currentQuestion.id === 'goal') {
      // Parse goals intelligently
      parsedData = {
        primaryGoal: null,
        additionalGoals: []
      };
      
      // Weight-related goals
      if (lowerUserResponse.includes('lose') || lowerUserResponse.includes('weight loss') || 
          lowerUserResponse.includes('get rid of nafld') || lowerUserResponse.includes('fatty liver')) {
        parsedData.primaryGoal = 'lose_weight';
      } else if (lowerUserResponse.includes('gain muscle') || lowerUserResponse.includes('build')) {
        parsedData.primaryGoal = 'gain_muscle';
      } else if (lowerUserResponse.includes('gain weight')) {
        parsedData.primaryGoal = 'gain_weight';
      } else if (lowerUserResponse.includes('maintain')) {
        parsedData.primaryGoal = 'maintain';
      } else {
        parsedData.primaryGoal = 'maintain'; // default
      }
      
      // Track NAFLD-specific goals
      if (lowerUserResponse.includes('nafld') || lowerUserResponse.includes('fatty liver')) {
        parsedData.hasNAFLDGoal = true;
        parsedData.additionalGoals.push('address_nafld');
      }
    }
    
    res.json({
      success: true,
      aiResponse: aiResponse,
      needsFollowUp: needsFollowUp,
      parsedData: parsedData,
      shouldProceed: !needsFollowUp,
      acknowledgment: aiResponse
    });
    
  } catch (error) {
    console.error('❌ Assessment AI error:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to process assessment response',
      details: error.message 
    });
  }
});

module.exports = router;