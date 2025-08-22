const express = require('express');
const router = express.Router();

// Claude API endpoint
router.post('/chat', async (req, res) => {
  try {
    const { message, context, conversationHistory } = req.body;
    
    console.log('Received conversation history:', JSON.stringify(conversationHistory, null, 2));
    console.log('Context received:', context?.systemPrompt ? 'Yes with system prompt' : 'No system prompt');
    
    if (!process.env.PERPLEXITY_API_KEY) {
      throw new Error('Perplexity API key not configured');
    }

    // Build messages array from conversation history
    const messages = [];
    
    // The conversation history already includes all messages INCLUDING the current one
    // So we just need to use the history as-is
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
    
    // If no history, just add the current message
    if (messages.length === 0) {
      messages.push({ role: 'user', content: message });
    }
    
    console.log(`Final messages array (${messages.length} total):`, JSON.stringify(messages, null, 2));

    // Call Perplexity API with CORRECT model name
    const response = await fetch('https://api.perplexity.ai/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
      },
      body: JSON.stringify({
        model: 'sonar-pro',  // Pro model with web search!
        messages: [
          ...(context?.systemPrompt ? [{ role: 'system', content: context.systemPrompt + '\n\nIMPORTANT: Search the web for current McDonald\'s Australia nutrition data.' }] : []),
          ...messages
        ],
        temperature: 0.3,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Perplexity API error:', error);
      throw new Error('AI service error');
    }

    const data = await response.json();
    
    // Extract text from Perplexity's response  
    const responseText = data.choices?.[0]?.message?.content || 'I need a moment to think about that...';
    
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


// Simple health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    hasApiKey: !!process.env.CLAUDE_API_KEY 
  });
});

module.exports = router;