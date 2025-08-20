// Simple proxy server to handle API requests securely
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for local development
app.use(cors());
app.use(express.json());

// Serve static files
app.use(express.static(__dirname));

// Proxy endpoint for Spoonacular API
app.get('/api/recipes/search', async (req, res) => {
    try {
        const fetch = (await import('node-fetch')).default;
        const params = new URLSearchParams(req.query);
        params.append('apiKey', process.env.SPOONACULAR_API_KEY);
        
        const response = await fetch(
            `https://api.spoonacular.com/recipes/complexSearch?${params}`
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Recipe search error:', error);
        res.status(500).json({ error: 'Failed to search recipes' });
    }
});

// Proxy endpoint for Spoonacular ingredients
app.get('/api/ingredients/search', async (req, res) => {
    try {
        const fetch = (await import('node-fetch')).default;
        const params = new URLSearchParams(req.query);
        params.append('apiKey', process.env.SPOONACULAR_API_KEY);
        
        const response = await fetch(
            `https://api.spoonacular.com/food/ingredients/search?${params}`
        );
        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error('Ingredient search error:', error);
        res.status(500).json({ error: 'Failed to search ingredients' });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
    console.log('API Keys loaded from .env file securely');
});