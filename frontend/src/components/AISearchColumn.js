// AISearchColumn - AI-powered food search using OpenAI GPT-4o-mini and Brave Search
// Extracted from app.js to reduce file size and improve organization

import AIService from '../services/ai-service.js';
import DragDropManager from '../services/DragDropManager.js';
import { NutritionCalculator } from '../services/nutritionCalculator.js';

export class AISearchColumn {
    constructor() {
        this.aiService = new AIService();
        this.conversationHistory = [];
    }
    
    create(mainBoard, activeColumns, insertBefore = null) {
        if (activeColumns.includes('ai-search')) return;
        
        const column = document.createElement('div');
        column.className = 'category-column ai-search-column animate-in';
        column.dataset.category = 'ai-search';
        column.draggable = true;
        
        column.innerHTML = `
            <div class="category-header ai-search-header">
                <span>🤖 AI Item Search</span>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <select id="locationSelect" style="background: rgba(255,255,255,0.2); color: white; border: 1px solid rgba(255,255,255,0.3); border-radius: 4px; padding: 4px 8px; font-size: 12px;" onchange="window.aiSearchColumn.updateUserLocation(this.value)">
                        <option value="Australia" ${localStorage.getItem('userLocation') === 'Australia' ? 'selected' : ''}>🇦🇺 AU</option>
                        <option value="USA" ${localStorage.getItem('userLocation') === 'USA' ? 'selected' : ''}>🇺🇸 US</option>
                        <option value="UK" ${localStorage.getItem('userLocation') === 'UK' ? 'selected' : ''}>🇬🇧 UK</option>
                        <option value="Canada" ${localStorage.getItem('userLocation') === 'Canada' ? 'selected' : ''}>🇨🇦 CA</option>
                    </select>
                    <button class="close-column" onclick="window.removeCategoryColumn('ai-search')">×</button>
                </div>
            </div>
            <div class="ai-column-content">
                <div class="ai-welcome">
                    <h3>Welcome to AI Item Search!</h3>
                    <p>I can help you find or create any food item. Just tell me what you're looking for:</p>
                    <ul>
                        <li>🍔 Restaurant items: "Big Mac", "Subway Italian BMT"</li>
                        <li>🛒 Brand products: "Woolworths organic eggs", "Kellogg's Corn Flakes"</li>
                        <li>🥘 Homemade dishes: "Mom's lasagna", "Protein smoothie"</li>
                        <li>☕ Beverages: "Starbucks Venti Latte", "Green smoothie"</li>
                    </ul>
                </div>
                <div class="ai-chat-area" id="aiChatArea">
                    <!-- Messages will appear here -->
                </div>
                <div class="ai-input-area">
                    <input type="text" id="aiSearchInput" placeholder="Type any food item..." 
                           onkeypress="if(event.key==='Enter') window.aiSearchColumn.sendRequest()">
                    <button onclick="window.aiSearchColumn.sendRequest()">Search</button>
                </div>
                <div class="ai-results-area" id="aiResultsArea">
                    <!-- Results will appear here -->
                </div>
            </div>
        `;
        
        // Insert at specified position
        if (insertBefore) {
            mainBoard.insertBefore(column, insertBefore);
        } else {
            const firstDayColumn = mainBoard.querySelector('.day-column');
            if (firstDayColumn) {
                mainBoard.insertBefore(column, firstDayColumn);
            } else {
                mainBoard.appendChild(column);
            }
        }
        
        activeColumns.push('ai-search');
        
        // Setup drag handlers for the column
        DragDropManager.attachHandlers(column, 'column');
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('aiSearchInput')?.focus();
        }, 100);
        
        return column;
    }
    
    async sendRequest() {
        const input = document.getElementById('aiSearchInput');
        const foodRequest = input.value.trim();
        
        if (!foodRequest) return;
        
        const chatArea = document.getElementById('aiChatArea');
        const resultsArea = document.getElementById('aiResultsArea');
        
        // Debug: Log conversation history
        console.log('Current conversation history:', this.conversationHistory);
        
        // Hide welcome message if it's still showing
        const welcome = document.querySelector('.ai-welcome');
        if (welcome) {
            welcome.style.display = 'none';
            chatArea.style.display = 'block';
        }
        
        // Add user message to display
        chatArea.innerHTML += `
            <div class="ai-message user">
                <div class="message-bubble">${foodRequest}</div>
            </div>
        `;
        
        // Add to conversation history with proper structure
        this.conversationHistory.push({ 
            role: 'user', 
            content: foodRequest 
        });
        
        // Clear input
        input.value = '';
        
        // Show thinking message with spinner
        const thinkingMessageId = 'thinking-' + Date.now();
        chatArea.innerHTML += `
            <div class="ai-message assistant thinking" id="${thinkingMessageId}">
                <div class="message-bubble">
                    <div class="thinking-spinner"></div>
                    <span>Searching for information...</span>
                </div>
            </div>
        `;
        
        // Scroll to bottom
        chatArea.scrollTop = chatArea.scrollHeight;
        
        try {
            // Get user location
            const location = localStorage.getItem('userLocation') || 'Australia';
            
            // Call AI service with conversation history
            const context = {
                location: location,
                type: 'food_search',
                conversationHistory: this.conversationHistory
            };
            
            const aiResponse = await this.aiService.chat(foodRequest, context);
            
            // Update thinking message with actual search status if available
            const thinkingMessage = document.getElementById(thinkingMessageId);
            if (thinkingMessage && aiResponse.searchStatus) {
                thinkingMessage.querySelector('.message-bubble').innerHTML = `
                    <div class="thinking-spinner"></div>
                    <span>${aiResponse.searchStatus}</span>
                `;
            }
            
            // Process the response
            setTimeout(() => {
                // Remove thinking message
                const thinkingMsg = document.getElementById(thinkingMessageId);
                if (thinkingMsg) {
                    thinkingMsg.remove();
                }
                
                // Add to conversation history BEFORE displaying
                this.conversationHistory.push({ 
                    role: 'assistant', 
                    content: aiResponse.message 
                });
                
                // Add AI response to chat
                chatArea.innerHTML += `
                    <div class="ai-message assistant">
                        <div class="message-bubble">${this.formatMessage(aiResponse.message)}</div>
                    </div>
                `;
                
                // Check if the response contains a nutrition block
                const hasNutritionBlock = aiResponse.message.includes('[NUTRITION]');
                
                // Extract and display food data if nutrition block exists
                const foodData = hasNutritionBlock ? this.extractFoodFromResponse(foodRequest, aiResponse.message) : null;
                
                if (foodData && foodData.length > 0) {
                    resultsArea.innerHTML = '';
                    
                    foodData.forEach(food => {
                        const foodElement = document.createElement('div');
                        foodElement.className = 'food-item';
                        foodElement.draggable = true;
                        foodElement.dataset.food = JSON.stringify(food);
                        foodElement.dataset.category = 'ai-search';
                        
                        // Calculate macros for display
                        const protein = food.protein || 0;
                        const carbs = food.carbs || 0;
                        const fat = food.fat || 0;
                        
                        foodElement.innerHTML = `
                            <div class="food-header">
                                <span class="food-name">${food.name}</span>
                                <span class="food-calories">${food.kcal || 0} kcal</span>
                            </div>
                            <div class="food-controls">
                                <input type="number" class="portion-input" value="${food.baseQuantity}" min="0.1" step="0.1">
                                <select class="unit-select">
                                    <option value="${food.baseUnit}">${food.baseUnit}</option>
                                </select>
                            </div>
                            <div class="macro-bar">
                                ${NutritionCalculator.createMacroBarHTML(protein, carbs, fat)}
                            </div>
                            <div class="macro-labels">
                                ${NutritionCalculator.createMacroLabelsHTML(protein, carbs, fat)}
                            </div>
                        `;
                        
                        resultsArea.appendChild(foodElement);
                    });
                    
                    // Attach drag handlers to new items
                    resultsArea.querySelectorAll('.food-item').forEach(item => {
                        DragDropManager.attachHandlers(item, 'food');
                        
                        // Update UI when portion changes
                        const portionInput = item.querySelector('.portion-input');
                        const unitSelect = item.querySelector('.unit-select');
                        
                        portionInput.addEventListener('change', (e) => {
                            const foodData = JSON.parse(item.dataset.food);
                            const newQuantity = parseFloat(e.target.value);
                            const ratio = newQuantity / foodData.baseQuantity;
                            
                            // Update the dataset with new quantity
                            foodData.quantity = newQuantity;
                            item.dataset.food = JSON.stringify(foodData);
                        });
                    });
                    
                    resultsArea.style.display = 'block';
                }
                
                // Scroll to bottom
                chatArea.scrollTop = chatArea.scrollHeight;
            }, 1000);
            
        } catch (error) {
            console.error('AI search error:', error);
            
            // Remove thinking message
            const thinkingMsg = document.getElementById(thinkingMessageId);
            if (thinkingMsg) {
                thinkingMsg.remove();
            }
            
            // Search local database as fallback
            const searchResults = this.searchLocalFoods(foodRequest);
            
            if (searchResults.length > 0) {
                chatArea.innerHTML += `
                    <div class="ai-message assistant">
                        <div class="message-bubble">
                            I couldn't connect to the AI service, but I found these items in the local database:
                        </div>
                    </div>
                `;
                
                // Display local results
                resultsArea.innerHTML = '';
                searchResults.forEach(food => {
                    // Create food item display (same as above)
                    // ... [similar code to display food items]
                });
                
                resultsArea.style.display = 'block';
            }
        }
    }
    
    formatMessage(message) {
        // Format the AI message for display
        // Remove nutrition blocks and other formatting
        let formatted = message.replace(/\[NUTRITION\][\s\S]*?\[\/NUTRITION\]/g, '');
        
        // Convert markdown-style formatting
        formatted = formatted
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        // Wrap in paragraph if not already
        if (!formatted.startsWith('<p>')) {
            formatted = '<p>' + formatted + '</p>';
        }
        
        return formatted;
    }
    
    extractFoodFromResponse(query, aiMessage) {
        const foods = [];
        
        // Extract nutrition block
        const nutritionMatch = aiMessage.match(/\[NUTRITION\]([\s\S]*?)\[\/NUTRITION\]/);
        if (!nutritionMatch) return foods;
        
        const nutritionBlock = nutritionMatch[1];
        
        // Parse each line in the nutrition block
        const lines = nutritionBlock.split('\n').filter(line => line.trim());
        
        for (const line of lines) {
            // Extract nutrition values
            const calorieMatch = line.match(/(\d+)\s*(?:kcal|cal|calories)/i);
            const proteinMatch = line.match(/(?:protein|p):\s*([\d.]+)\s*g/i);
            const carbMatch = line.match(/(?:carbs?|c):\s*([\d.]+)\s*g/i);
            const fatMatch = line.match(/(?:fat|f):\s*([\d.]+)\s*g/i);
            
            if (calorieMatch) {
                // Try to extract product name
                let productName = query;
                
                // Look for specific product names in the response
                const namePatterns = [
                    /(?:^|\n)([^:]+?)(?:\s*[-–]\s*\d+\s*(?:kcal|cal))/i,
                    /(?:^|\n)([^:]+?):\s*\d+\s*(?:kcal|cal)/i,
                    /(?:^|\n)"([^"]+)"/,
                    /(?:^|\n)'([^']+)'/
                ];
                
                for (const pattern of namePatterns) {
                    const nameMatch = aiMessage.match(pattern);
                    if (nameMatch && nameMatch[1]) {
                        productName = nameMatch[1].trim();
                        break;
                    }
                }
                
                // Determine base unit and quantity
                let baseQuantity = 1;
                let baseUnit = 'serving';
                
                // Check for serving size in the message
                const servingMatch = line.match(/(\d+)\s*(g|ml|oz|cup|tbsp|piece|unit)/i);
                if (servingMatch) {
                    baseQuantity = parseInt(servingMatch[1]);
                    baseUnit = servingMatch[2].toLowerCase();
                }
                
                const food = {
                    name: productName,
                    baseQuantity: baseQuantity,
                    baseUnit: baseUnit,
                    kcal: parseInt(calorieMatch[1]),
                    protein: proteinMatch ? parseFloat(proteinMatch[1]) : 0,
                    carbs: carbMatch ? parseFloat(carbMatch[1]) : 0,
                    fat: fatMatch ? parseFloat(fatMatch[1]) : 0,
                    cost: 0,
                    suggestedCategory: 'extras'
                };
                foods.push(food);
            }
        }
        
        return foods;
    }
    
    analyzeUserQuery(query) {
        const analysis = {
            needsWebSearch: false,
            searchType: null,
            confirmationMessage: null,
            clarificationNeeded: false,
            clarificationOptions: []
        };
        
        const lower = query.toLowerCase();
        
        // Check for restaurant items
        if (lower.includes('mcdonald') || lower.includes('burger king') || lower.includes('subway') || 
            lower.includes('starbucks') || lower.includes('kfc')) {
            analysis.needsWebSearch = true;
            analysis.searchType = 'restaurant';
        }
        
        // Check for brand products
        if (lower.includes('woolworths') || lower.includes('coles') || lower.includes('aldi') ||
            lower.includes('kellogg') || lower.includes('nestle')) {
            analysis.needsWebSearch = true;
            analysis.searchType = 'brand';
        }
        
        // Check for specific product requests
        if (lower.includes('calories in') || lower.includes('nutrition for') || lower.includes('macros for')) {
            analysis.needsWebSearch = true;
            analysis.searchType = 'nutrition';
        }
        
        return analysis;
    }
    
    selectClarificationOption(query, display) {
        // Clear results area first
        const resultsArea = document.getElementById('aiResultsArea');
        resultsArea.innerHTML = '';
        
        // Trigger a new search with the clarified query
        const input = document.getElementById('aiSearchInput');
        input.value = query;
        
        // Show searching state
        const chatArea = document.getElementById('aiChatArea');
        chatArea.innerHTML += `
            <div class="ai-message user">
                <div class="message-bubble">Searching for: ${display}</div>
            </div>
        `;
        
        this.performWebSearch(query, { confirmationMessage: null });
    }
    
    focusAIInput() {
        const input = document.getElementById('aiSearchInput');
        if (input) {
            input.focus();
            input.select();
        }
    }
    
    updateUserLocation(location) {
        localStorage.setItem('userLocation', location);
        console.log('User location updated to:', location);
    }
    
    async performWebSearch(query, analysis) {
        const chatArea = document.getElementById('aiChatArea');
        const resultsArea = document.getElementById('aiResultsArea');
        
        // Show confirmation if needed
        if (analysis.confirmationMessage) {
            chatArea.innerHTML += `
                <div class="ai-message assistant">
                    <div class="message-bubble">${analysis.confirmationMessage}</div>
                </div>
            `;
        }
        
        // Show searching state
        const searchingId = 'searching-' + Date.now();
        chatArea.innerHTML += `
            <div class="ai-message assistant thinking" id="${searchingId}">
                <div class="message-bubble">
                    <div class="thinking-spinner"></div>
                    <span>Searching the web for nutrition information...</span>
                </div>
            </div>
        `;
        
        try {
            // Make API call to backend which will use Brave Search
            const response = await fetch('/api/ai/search', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    location: localStorage.getItem('userLocation') || 'Australia'
                })
            });
            
            const data = await response.json();
            
            // Remove searching message
            document.getElementById(searchingId)?.remove();
            
            if (data.results && data.results.length > 0) {
                // Display results
                this.displayWebSearchResults(data.results, query);
            } else {
                chatArea.innerHTML += `
                    <div class="ai-message assistant">
                        <div class="message-bubble">
                            I couldn't find specific nutrition information for "${query}". 
                            Try being more specific or check if the product name is correct.
                        </div>
                    </div>
                `;
            }
            
        } catch (error) {
            console.error('Web search error:', error);
            document.getElementById(searchingId)?.remove();
            
            chatArea.innerHTML += `
                <div class="ai-message assistant">
                    <div class="message-bubble">
                        I encountered an error while searching. Please try again or search for a different item.
                    </div>
                </div>
            `;
        }
    }
    
    displayWebSearchResults(results, originalQuery) {
        const resultsArea = document.getElementById('aiResultsArea');
        const chatArea = document.getElementById('aiChatArea');
        
        // Show found message
        chatArea.innerHTML += `
            <div class="ai-message assistant">
                <div class="message-bubble">
                    Found nutrition information for "${originalQuery}":
                </div>
            </div>
        `;
        
        // Display each result as a draggable food item
        resultsArea.innerHTML = '';
        results.forEach(food => {
            // Create food item element (similar to above)
            const foodElement = document.createElement('div');
            foodElement.className = 'food-item';
            foodElement.draggable = true;
            foodElement.dataset.food = JSON.stringify(food);
            foodElement.dataset.category = 'ai-search';
            
            foodElement.innerHTML = `
                <div class="food-header">
                    <span class="food-name">${food.name}</span>
                    <span class="food-calories">${food.kcal} kcal</span>
                </div>
                <div class="food-controls">
                    <input type="number" class="portion-input" value="${food.baseQuantity}" min="0.1" step="0.1">
                    <select class="unit-select">
                        <option value="${food.baseUnit}">${food.baseUnit}</option>
                    </select>
                </div>
                <div class="macro-bar">
                    ${NutritionCalculator.createMacroBarHTML(food.protein, food.carbs, food.fat)}
                </div>
                <div class="macro-labels">
                    ${NutritionCalculator.createMacroLabelsHTML(food.protein, food.carbs, food.fat)}
                </div>
            `;
            
            resultsArea.appendChild(foodElement);
            DragDropManager.attachHandlers(foodElement, 'food');
        });
        
        resultsArea.style.display = 'block';
    }
    
    searchLocalFoods(query) {
        // This would search the local food database
        // For now, return empty array
        return [];
    }
}

// Create singleton instance
const aiSearchColumn = new AISearchColumn();

// Export for use in app.js
export default aiSearchColumn;