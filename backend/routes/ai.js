const express = require('express');
const router = express.Router();

// Claude API endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context, conversationHistory } = req.body;
    
    console.log('Received conversation history:', JSON.stringify(conversationHistory, null, 2));
    console.log('Context received:', context?.systemPrompt ? 'Yes with system prompt' : 'No system prompt');
    
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('Claude API key not configured');
    }

    // Build messages array for Claude
    const messages = [];
    
    // Add conversation history if provided
    if (conversationHistory && Array.isArray(conversationHistory)) {
      console.log(`Processing ${conversationHistory.length} history items`);
      conversationHistory.forEach((exchange, idx) => {
        // Support both formats for backward compatibility
        if (exchange.role && exchange.content) {
          messages.push({ role: exchange.role, content: exchange.content });
          console.log(`Added history item ${idx}: ${exchange.role}`);
        } else if (exchange.user) {
          messages.push({ role: 'user', content: exchange.user });
        } else if (exchange.hannah || exchange.assistant) {
          messages.push({ role: 'assistant', content: exchange.hannah || exchange.assistant });
        }
      });
    }
    
    console.log(`Total messages before adding current: ${messages.length}`);
    
    // Add current user message
    messages.push({ role: 'user', content: message });
    
    console.log(`Final messages array (${messages.length} total):`, JSON.stringify(messages, null, 2));

    // Build request body with system as top-level parameter
    const requestBody = {
      model: 'claude-3-5-sonnet-20241022',  // Updated to current model
      messages: messages,
      max_tokens: 4000,  // Max tokens for complete meal plans with all meals
      temperature: 0.7
    };
    
    // Add system prompt as top-level parameter if provided
    if (context?.systemPrompt) {
      requestBody.system = context.systemPrompt;
    }

    // Call Claude API
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Claude API error:', error);
      throw new Error('AI service error');
    }

    const data = await response.json();
    
    // Extract text from Claude's response
    const responseText = data.content?.[0]?.text || 'I need a moment to think about that...';
    
    res.json({ 
      message: responseText,
      success: true
    });
    
  } catch (error) {
    console.error('AI route error:', error.message);
    
    // Return a helpful fallback response
    res.status(500).json({ 
      error: 'AI service temporarily unavailable',
      message: "I'm having trouble connecting right now. Could you tell me what you're looking for help with?",
      success: false
    });
  }
});

// AI-powered recipe search
router.post('/recipe-search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!process.env.CLAUDE_API_KEY) {
      throw new Error('Claude API key not configured');
    }
    
    if (!process.env.SPOONACULAR_API_KEY) {
      throw new Error('Spoonacular API key not configured');
    }
    
    // Step 1: Use Claude to understand the natural language query
    const claudeResponse = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307', // Fast and cheap for parsing
        messages: [{
          role: 'user',
          content: `Parse this recipe search query and extract structured search parameters. Return ONLY valid JSON with these fields:
- query: main search terms
- diet: vegetarian|vegan|glutenFree|ketogenic|paleo|null
- type: breakfast|lunch|dinner|snack|dessert|beverage|null  
- maxReadyTime: number in minutes or null
- maxCalories: number or null
- minProtein: number in grams or null
- cuisine: italian|mexican|chinese|indian|thai|greek|japanese|null
- includeIngredients: comma-separated ingredients or null
- excludeIngredients: comma-separated ingredients or null

Query: "${query}"

Example: "quick healthy breakfast under 300 calories" should return:
{"query":"healthy breakfast","type":"breakfast","maxReadyTime":30,"maxCalories":300,"diet":null,"cuisine":null,"includeIngredients":null,"excludeIngredients":null,"minProtein":null}`
        }],
        max_tokens: 200,
        temperature: 0.3
      })
    });
    
    if (!claudeResponse.ok) {
      throw new Error('Claude API error');
    }
    
    const claudeData = await claudeResponse.json();
    const aiResponse = claudeData.content?.[0]?.text || '{}';
    
    // Parse Claude's response
    let searchParams;
    try {
      searchParams = JSON.parse(aiResponse);
    } catch (e) {
      // Fallback to basic search if parsing fails
      searchParams = { query: query };
    }
    
    // Step 2: Search Spoonacular with the parsed parameters
    const spoonacularUrl = new URL('https://api.spoonacular.com/recipes/complexSearch');
    spoonacularUrl.searchParams.append('apiKey', process.env.SPOONACULAR_API_KEY);
    spoonacularUrl.searchParams.append('number', '12');
    spoonacularUrl.searchParams.append('addRecipeInformation', 'true');
    spoonacularUrl.searchParams.append('addRecipeNutrition', 'true');
    
    // Add parsed parameters
    if (searchParams.query) spoonacularUrl.searchParams.append('query', searchParams.query);
    if (searchParams.diet) spoonacularUrl.searchParams.append('diet', searchParams.diet);
    if (searchParams.type) spoonacularUrl.searchParams.append('type', searchParams.type);
    if (searchParams.maxReadyTime) spoonacularUrl.searchParams.append('maxReadyTime', searchParams.maxReadyTime);
    if (searchParams.maxCalories) spoonacularUrl.searchParams.append('maxCalories', searchParams.maxCalories);
    if (searchParams.minProtein) spoonacularUrl.searchParams.append('minProtein', searchParams.minProtein);
    if (searchParams.cuisine) spoonacularUrl.searchParams.append('cuisine', searchParams.cuisine);
    if (searchParams.includeIngredients) spoonacularUrl.searchParams.append('includeIngredients', searchParams.includeIngredients);
    if (searchParams.excludeIngredients) spoonacularUrl.searchParams.append('excludeIngredients', searchParams.excludeIngredients);
    
    const spoonacularResponse = await fetch(spoonacularUrl);
    
    if (!spoonacularResponse.ok) {
      throw new Error('Spoonacular API error');
    }
    
    const recipes = await spoonacularResponse.json();
    
    // Return both the AI interpretation and the recipes
    res.json({
      success: true,
      interpretation: searchParams,
      recipes: recipes.results || [],
      totalResults: recipes.totalResults || 0
    });
    
  } catch (error) {
    console.error('AI recipe search error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Recipe search failed',
      message: error.message
    });
  }
});

// Simple health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    hasApiKey: !!process.env.CLAUDE_API_KEY 
  });
});

module.exports = router;