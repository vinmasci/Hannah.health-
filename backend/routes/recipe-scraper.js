const express = require('express');
const router = express.Router();

// Helper function to extract recipe data from search results
async function scrapeRecipe(url) {
  try {
    console.log('🍳 Scraping recipe from:', url);
    
    // Search for the recipe page content
    const searchQuery = `${url} recipe ingredients instructions`;
    
    const response = await fetch(`https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(searchQuery)}&country=AU&count=10`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-Subscription-Token': process.env.BRAVE_API_KEY
      }
    });

    if (!response.ok) {
      throw new Error('Brave search failed');
    }

    const data = await response.json();
    
    // Try to find the actual recipe page in results
    const recipeResult = data.web?.results?.find(r => r.url === url || r.url.includes(url));
    
    if (!recipeResult) {
      console.log('⚠️ Recipe URL not found in search results, using general results');
    }
    
    // Compile all relevant content
    const content = data.web?.results?.map(r => 
      `${r.title}\n${r.description}\n${r.extra_snippets?.join('\n') || ''}`
    ).join('\n\n') || '';
    
    return { content, url };
  } catch (error) {
    console.error('Recipe scrape error:', error);
    return null;
  }
}

// Parse ingredients from recipe content
function parseIngredients(content) {
  const ingredients = [];
  
  // Common ingredient patterns
  const patterns = [
    /(\d+(?:\/\d+)?(?:\s*-\s*\d+(?:\/\d+)?)?)\s*(cups?|tbsp?|tsp?|oz|lbs?|g|kg|ml|l|cloves?|pieces?|slices?|medium|large|small)?\s+(.+)/gi,
    /•\s*(.+)/g,
    /[-*]\s*(.+)/g,
    /\d+\.\s+(.+)/g
  ];
  
  // Split content into lines
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim().toLowerCase();
    
    // Skip non-ingredient lines
    if (trimmed.length < 3 || 
        trimmed.includes('instructions') || 
        trimmed.includes('directions') ||
        trimmed.includes('method') ||
        trimmed.includes('preparation') ||
        trimmed.includes('nutrition') ||
        trimmed.includes('serves') ||
        trimmed.includes('prep time') ||
        trimmed.includes('cook time')) {
      continue;
    }
    
    // Check if line looks like an ingredient
    for (const pattern of patterns) {
      const match = line.match(pattern);
      if (match) {
        let ingredient = match[0];
        
        // Clean up the ingredient
        ingredient = ingredient
          .replace(/^[-*•]\s*/, '')
          .replace(/^\d+\.\s*/, '')
          .trim();
        
        if (ingredient.length > 2 && ingredient.length < 100) {
          // Extract the main ingredient name (remove quantities and descriptors)
          const mainIngredient = extractMainIngredient(ingredient);
          if (mainIngredient && !ingredients.some(i => i.name === mainIngredient.name)) {
            ingredients.push(mainIngredient);
          }
        }
        break;
      }
    }
  }
  
  return ingredients;
}

// Extract the main ingredient from a full ingredient line
function extractMainIngredient(ingredientLine) {
  // Remove common measurements and quantities
  let cleaned = ingredientLine
    .replace(/^\d+(?:\/\d+)?(?:\s*-\s*\d+(?:\/\d+)?)?/, '') // Remove leading numbers
    .replace(/\s*(cups?|tbsp?|tsp?|oz|lbs?|g|kg|ml|l|cloves?|pieces?|slices?)\s*/gi, '') // Remove units
    .replace(/\s*(medium|large|small|fresh|dried|chopped|diced|minced|sliced|grated|ground)\s*/gi, '') // Remove descriptors
    .replace(/\s*\([^)]*\)/g, '') // Remove parenthetical notes
    .replace(/,.*$/, '') // Remove everything after comma
    .trim();
  
  if (cleaned.length < 2) return null;
  
  // Map to common food items
  const foodMappings = {
    'chicken': { name: 'Chicken Breast', category: 'protein', amount: '150g' },
    'beef': { name: 'Beef Mince', category: 'protein', amount: '150g' },
    'salmon': { name: 'Salmon Fillet', category: 'protein', amount: '150g' },
    'tuna': { name: 'Tuna', category: 'protein', amount: '100g' },
    'eggs': { name: 'Eggs', category: 'protein', amount: '2 eggs' },
    'egg': { name: 'Egg', category: 'protein', amount: '1 egg' },
    'rice': { name: 'White Rice', category: 'carbs', amount: '75g dry' },
    'pasta': { name: 'Pasta', category: 'carbs', amount: '75g dry' },
    'potato': { name: 'Potato', category: 'carbs', amount: '200g' },
    'bread': { name: 'Bread', category: 'grains', amount: '2 slices' },
    'milk': { name: 'Milk', category: 'dairy', amount: '250ml' },
    'cheese': { name: 'Cheddar Cheese', category: 'dairy', amount: '30g' },
    'yogurt': { name: 'Greek Yogurt', category: 'dairy', amount: '150g' },
    'butter': { name: 'Butter', category: 'dairy', amount: '10g' },
    'oil': { name: 'Olive Oil', category: 'extras', amount: '1 tbsp' },
    'olive oil': { name: 'Olive Oil', category: 'extras', amount: '1 tbsp' },
    'onion': { name: 'Onion', category: 'veg', amount: '100g' },
    'garlic': { name: 'Garlic', category: 'veg', amount: '2 cloves' },
    'tomato': { name: 'Tomato', category: 'veg', amount: '100g' },
    'lettuce': { name: 'Lettuce', category: 'veg', amount: '50g' },
    'spinach': { name: 'Spinach', category: 'veg', amount: '50g' },
    'broccoli': { name: 'Broccoli', category: 'veg', amount: '100g' },
    'carrot': { name: 'Carrot', category: 'veg', amount: '100g' },
    'capsicum': { name: 'Capsicum', category: 'veg', amount: '100g' },
    'bell pepper': { name: 'Capsicum', category: 'veg', amount: '100g' },
    'apple': { name: 'Apple', category: 'fruit', amount: '1 medium' },
    'banana': { name: 'Banana', category: 'fruit', amount: '1 medium' },
    'orange': { name: 'Orange', category: 'fruit', amount: '1 medium' },
    'berries': { name: 'Mixed Berries', category: 'fruit', amount: '100g' },
    'salt': { name: 'Salt', category: 'extras', amount: 'pinch' },
    'pepper': { name: 'Black Pepper', category: 'extras', amount: 'pinch' },
    'sugar': { name: 'Sugar', category: 'extras', amount: '1 tsp' },
    'flour': { name: 'Plain Flour', category: 'grains', amount: '30g' },
    'oats': { name: 'Rolled Oats', category: 'grains', amount: '40g' }
  };
  
  // Find matching food item
  const cleanedLower = cleaned.toLowerCase();
  for (const [key, value] of Object.entries(foodMappings)) {
    if (cleanedLower.includes(key)) {
      return value;
    }
  }
  
  // If no mapping found, return generic item
  return {
    name: cleaned.charAt(0).toUpperCase() + cleaned.slice(1),
    category: 'extras',
    amount: '100g'
  };
}

// Recipe scraper endpoint
router.post('/scrape', async (req, res) => {
  try {
    const { url } = req.body;
    
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    console.log('📍 Recipe scrape request for:', url);
    
    // Scrape the recipe
    const scrapedData = await scrapeRecipe(url);
    
    if (!scrapedData) {
      return res.status(404).json({ error: 'Could not fetch recipe' });
    }
    
    // Parse ingredients from the content
    const ingredients = parseIngredients(scrapedData.content);
    
    console.log(`✅ Found ${ingredients.length} ingredients`);
    
    res.json({
      success: true,
      url: scrapedData.url,
      ingredients: ingredients,
      count: ingredients.length
    });
    
  } catch (error) {
    console.error('Recipe scraper error:', error);
    res.status(500).json({ 
      error: 'Failed to scrape recipe',
      message: error.message 
    });
  }
});

// Extract ingredients from AI response
router.post('/extract-ingredients', async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    
    // Parse ingredients from the text
    const ingredients = parseIngredients(text);
    
    res.json({
      success: true,
      ingredients: ingredients,
      count: ingredients.length
    });
    
  } catch (error) {
    console.error('Ingredient extraction error:', error);
    res.status(500).json({ 
      error: 'Failed to extract ingredients',
      message: error.message 
    });
  }
});

module.exports = router;