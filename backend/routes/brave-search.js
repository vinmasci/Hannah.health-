const express = require('express');
const router = express.Router();

// Brave Search endpoint for nutrition data
router.post('/search', async (req, res) => {
  try {
    const { query, country = 'AU' } = req.body;
    
    if (!process.env.BRAVE_API_KEY) {
      throw new Error('Brave API key not configured');
    }

    // Search specifically for nutrition data
    const searchQuery = `${query} nutrition facts calories protein carbs fat Australia site:mcdonalds.com.au OR site:nutritionix.com OR site:myfitnesspal.com`;
    
    console.log('Brave search query:', searchQuery);

    // Call Brave Search API
    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(searchQuery)}&country=${country}&count=5`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': process.env.BRAVE_API_KEY
      }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Brave API error:', error);
      throw new Error('Search service error');
    }

    const data = await response.json();
    
    // Extract relevant results
    const results = data.web?.results?.map(result => ({
      title: result.title,
      url: result.url,
      description: result.description,
      snippet: result.extra_snippets?.[0] || result.description
    })) || [];
    
    res.json({ 
      results,
      success: true
    });
    
  } catch (error) {
    console.error('Brave search error:', error.message);
    res.status(500).json({ 
      error: 'Search service unavailable',
      success: false
    });
  }
});

module.exports = router;