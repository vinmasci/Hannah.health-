const express = require('express');
const router = express.Router();

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
    
    // Check if this is a nutrition or recipe query - be VERY broad
    const lastMessage = messages[messages.length - 1].content.toLowerCase();
    console.log('📝 Checking message for food/recipe keywords:', lastMessage.substring(0, 100));
    let searchStatus = null;
    let searchContext = '';
    
    // ALWAYS search for food-related queries - be extremely broad
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
    
    // ALWAYS SEARCH FOR ANY MESSAGE - TEMPORARY FIX
    // if (shouldSearch || forceSearch) {
    if (true) {  // ALWAYS SEARCH
      
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
      searchStatus = "Thinking...";
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
**ACTION_END**`;
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
    
    res.json({ 
      message: responseText,
      searchStatus: searchStatus,
      success: true
    });
    
  } catch (error) {
    console.error('AI route error:', error.message);
    
    res.status(500).json({ 
      error: 'AI service temporarily unavailable',
      message: "I'm having trouble connecting right now. Could you tell me what you're looking for help with?",
      success: false
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

module.exports = router;