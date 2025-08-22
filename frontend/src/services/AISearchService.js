// AI Search Service - All AI food search and creation functionality
import AIService from './ai-service.js';

class AISearchService {
    constructor() {
        this.aiService = new AIService();
        this.aiSearchConversationHistory = [];
        this.currentAICategory = null;
    }

    // ============= AI SEARCH COLUMN =============
    
    createAISearchColumn(insertBefore = null) {
        const column = document.createElement('div');
        column.className = 'ai-search-column';
        column.innerHTML = `
            <div class="ai-search-header">
                <div class="ai-header-gradient">
                    <div class="ai-header-top">
                        <span class="ai-icon">✨</span>
                        <div class="ai-text-content">
                            <h3>AI Food Search</h3>
                            <span class="ai-subtitle">Powered by Hannah AI</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="ai-search-section">
                <div class="search-with-suggestions">
                    <input type="text" 
                           id="aiSearchInput" 
                           class="ai-search-input" 
                           placeholder="Search any food item..."
                           onkeypress="if(event.key==='Enter') window.aiSearchService.sendAISearchRequest()">
                    <button class="ai-search-btn" onclick="window.aiSearchService.sendAISearchRequest()">
                        Search AI
                    </button>
                </div>
                
                <div class="ai-suggestions">
                    <button class="suggestion-chip" onclick="window.aiSearchService.searchAIFoods('high protein breakfast')">
                        🥚 High Protein Breakfast
                    </button>
                    <button class="suggestion-chip" onclick="window.aiSearchService.searchAIFoods('low calorie snacks')">
                        🥬 Low Calorie Snacks
                    </button>
                    <button class="suggestion-chip" onclick="window.aiSearchService.searchAIFoods('meal prep ideas')">
                        🍱 Meal Prep Ideas
                    </button>
                </div>
            </div>
            
            <div class="ai-search-results" id="aiSearchResults"></div>
        `;
        
        const mainBoard = document.querySelector('.main-board');
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
        
        return column;
    }

    async sendAISearchRequest() {
        const input = document.getElementById('aiSearchInput');
        const query = input?.value?.trim();
        
        if (!query) {
            this.showNoQueryMessage();
            return;
        }

        const resultsContainer = document.getElementById('aiSearchResults');
        if (!resultsContainer) return;

        // Show loading state
        resultsContainer.innerHTML = `
            <div class="ai-loading">
                <div class="loading-spinner"></div>
                <div class="loading-text">Hannah is thinking...</div>
            </div>
        `;

        try {
            // Add user message to history
            this.aiSearchConversationHistory.push({
                role: 'user',
                content: query
            });

            // Call AI service
            const response = await this.aiService.chat(query, {
                type: 'food_search',
                conversationHistory: this.aiSearchConversationHistory,
                context: 'searching for food items to add to meal plan'
            });

            // The response is just { message: "..." }, not { success: true, message: "..." }
            if (!response || !response.message) {
                throw new Error('Failed to get AI response');
            }

            // Add assistant response to history
            this.aiSearchConversationHistory.push({
                role: 'assistant',
                content: response.message
            });

            // Keep history limited to last 10 messages
            if (this.aiSearchConversationHistory.length > 10) {
                this.aiSearchConversationHistory = this.aiSearchConversationHistory.slice(-10);
            }

            // Format and display AI response
            const formattedMessage = this.formatAIMessage(response.message);
            
            // Extract food items from response
            const foodItems = this.extractFoodFromAIResponse(query, response.message);
            
            // Display results
            resultsContainer.innerHTML = `
                <div class="ai-response">
                    <div class="ai-message-bubble">
                        ${formattedMessage}
                    </div>
                    ${foodItems.length > 0 ? `
                        <div class="ai-foods-grid">
                            ${foodItems.map(food => this.createAIFoodCard(food)).join('')}
                        </div>
                    ` : ''}
                </div>
            `;

            // Clear input
            if (input) input.value = '';

        } catch (error) {
            console.error('AI search error:', error);
            resultsContainer.innerHTML = `
                <div class="ai-error">
                    <div class="error-icon">⚠️</div>
                    <div class="error-message">
                        Sorry, I couldn't search for that right now. Please try again.
                    </div>
                    <div class="error-details">${error.message}</div>
                </div>
            `;
        }
    }

    formatAIMessage(message) {
        // Convert markdown-style formatting to HTML
        let formatted = message
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n\n/g, '</p><p>')
            .replace(/\n/g, '<br>');
        
        // Wrap in paragraphs
        formatted = `<p>${formatted}</p>`;
        
        // Add special formatting for food items or lists
        formatted = formatted.replace(/(\d+\.|\-)\s+/g, '<br>$1 ');
        
        return formatted;
    }

    extractFoodFromAIResponse(query, aiMessage) {
        const foods = [];
        
        // Look for patterns like "Food Name: X calories, Xg protein, Xg carbs, Xg fat"
        const foodPattern = /([^:]+):\s*(\d+)\s*(?:calories|kcal|cal),?\s*(\d+)g?\s*protein,?\s*(\d+)g?\s*carbs?,?\s*(\d+)g?\s*fat/gi;
        let match;
        
        while ((match = foodPattern.exec(aiMessage)) !== null) {
            foods.push({
                name: match[1].trim(),
                kcal: parseInt(match[2]),
                protein: parseInt(match[3]),
                carbs: parseInt(match[4]),
                fat: parseInt(match[5]),
                baseQuantity: 100,
                baseUnit: 'g',
                cost: 5.00
            });
        }
        
        // If no structured data found, create items based on common food keywords
        if (foods.length === 0 && aiMessage.toLowerCase().includes('protein')) {
            // Extract food names mentioned
            const commonFoods = [
                'chicken breast', 'eggs', 'greek yogurt', 'protein shake', 
                'tuna', 'salmon', 'turkey', 'cottage cheese', 'protein bar'
            ];
            
            commonFoods.forEach(food => {
                if (aiMessage.toLowerCase().includes(food)) {
                    foods.push(this.createEstimatedFood(food));
                }
            });
        }
        
        // If still no foods found but query seems food-related, create a custom item
        if (foods.length === 0 && query) {
            foods.push(this.createEstimatedFood(query));
        }
        
        return foods;
    }

    createEstimatedFood(name) {
        const estimates = this.estimateNutrition(name);
        return {
            name: name.charAt(0).toUpperCase() + name.slice(1),
            kcal: estimates.kcal,
            protein: estimates.protein,
            carbs: estimates.carbs,
            fat: estimates.fat,
            baseQuantity: estimates.quantity,
            baseUnit: estimates.unit,
            cost: estimates.cost
        };
    }

    createAIFoodCard(food) {
        const foodId = `ai-food-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        return `
            <div class="ai-food-card" id="${foodId}">
                <div class="ai-food-header">
                    <span class="ai-food-name">${food.name}</span>
                </div>
                <div class="ai-food-macros">
                    <span class="macro-badge kcal">🔥 ${food.kcal} kcal</span>
                    <span class="macro-badge protein">💪 ${food.protein}g</span>
                    <span class="macro-badge carbs">🌾 ${food.carbs}g</span>
                    <span class="macro-badge fat">🥑 ${food.fat}g</span>
                </div>
                <div class="ai-food-actions">
                    <select class="ai-category-select" id="select-${foodId}">
                        <option value="">Add to...</option>
                        <option value="protein">🥩 Proteins</option>
                        <option value="dairy">🥛 Dairy</option>
                        <option value="veg">🥬 Vegetables</option>
                        <option value="fruit">🍎 Fruits</option>
                        <option value="grains">🌾 Grains</option>
                        <option value="nuts">🥜 Nuts & Seeds</option>
                        <option value="carbs">🍞 Carbs</option>
                        <option value="drinks">🥤 Drinks</option>
                        <option value="sweets">🍰 Sweets</option>
                        <option value="extras">➕ Extras</option>
                    </select>
                    <button class="ai-add-btn" onclick="window.aiSearchService.addAISearchFood('${foodId}', ${JSON.stringify(food).replace(/"/g, '&quot;')})">
                        Add
                    </button>
                </div>
            </div>
        `;
    }

    addAISearchFood(foodId, food) {
        const selectElement = document.getElementById(`select-${foodId}`);
        const category = selectElement?.value;
        
        if (!category) {
            alert('Please select a category first');
            return;
        }
        
        // Check if column exists, create if not
        let column = document.querySelector(`.category-column[data-category="${category}"]`);
        if (!column) {
            // Import createCategoryColumn from app.js
            if (window.createCategoryColumn) {
                window.createCategoryColumn(category);
                column = document.querySelector(`.category-column[data-category="${category}"]`);
            }
        }
        
        if (column) {
            this.addFoodToColumn(column, food, category);
            
            // Visual feedback
            const card = document.getElementById(foodId);
            if (card) {
                card.style.animation = 'fadeOutScale 0.3s ease';
                setTimeout(() => card.remove(), 300);
            }
        }
    }

    addFoodToColumn(column, food, category) {
        const itemsContainer = column.querySelector('.category-items');
        if (!itemsContainer) return;
        
        // Use createFoodItemHTML from app.js
        if (window.createFoodItemHTML) {
            const foodHTML = window.createFoodItemHTML(food, category);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = foodHTML;
            const newElement = tempDiv.firstElementChild;
            
            if (newElement) {
                newElement.classList.add('ai-added');
                itemsContainer.insertBefore(newElement, itemsContainer.firstChild);
                
                // Setup event handlers using window functions
                if (window.handleFoodDragStart) {
                    newElement.addEventListener('dragstart', window.handleFoodDragStart);
                    newElement.addEventListener('dragend', window.handleFoodDragEnd);
                }
                
                if (window.handlePortionChange) {
                    newElement.querySelector('.portion-input')?.addEventListener('change', window.handlePortionChange);
                    newElement.querySelector('.unit-select')?.addEventListener('change', window.handleUnitChange);
                }
            }
        }
    }

    showNoQueryMessage() {
        const resultsContainer = document.getElementById('aiSearchResults');
        if (resultsContainer) {
            resultsContainer.innerHTML = `
                <div class="ai-info">
                    <div class="info-icon">💡</div>
                    <div class="info-message">
                        Type something to search! Try "high protein snacks" or "low calorie breakfast"
                    </div>
                </div>
            `;
        }
    }

    focusAIInput() {
        const input = document.getElementById('aiSearchInput');
        if (input) {
            input.focus();
        }
    }

    // ============= AI FOOD CHAT MODAL =============

    openAIFoodChat(category) {
        this.currentAICategory = category;
        
        // Create modal overlay
        const modal = document.createElement('div');
        modal.className = 'ai-chat-modal';
        modal.innerHTML = `
            <div class="ai-chat-container">
                <div class="ai-chat-header">
                    <h3>✨ AI Food Creator - ${category.charAt(0).toUpperCase() + category.slice(1)}</h3>
                    <button class="close-chat" onclick="window.aiSearchService.closeAIFoodChat()">×</button>
                </div>
                <div class="ai-chat-messages" id="aiChatMessages">
                    <div class="ai-message">
                        <div class="message-content">
                            Hi! I can help you add any food item to your ${category} list. 
                            Just tell me what you're looking for - it can be a specific brand, 
                            a restaurant item, or any food you can think of!
                        </div>
                    </div>
                    <div class="ai-message">
                        <div class="message-content">
                            For example: "McDonald's Big Mac", "Woolworths organic eggs", 
                            "homemade lasagna", or "protein smoothie with banana and peanut butter"
                        </div>
                    </div>
                </div>
                <div class="ai-chat-input">
                    <input type="text" id="aiFoodInput" placeholder="Type any food item..." 
                           onkeypress="if(event.key==='Enter') window.aiSearchService.sendAIFoodRequest('${category}')">
                    <button onclick="window.aiSearchService.sendAIFoodRequest('${category}')">Send</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // Focus on input
        setTimeout(() => {
            document.getElementById('aiFoodInput').focus();
        }, 100);
    }

    closeAIFoodChat() {
        const modal = document.querySelector('.ai-chat-modal');
        if (modal) {
            modal.remove();
        }
    }

    sendAIFoodRequest(category) {
        const input = document.getElementById('aiFoodInput');
        const foodRequest = input.value.trim();
        
        if (!foodRequest) return;
        
        const messagesContainer = document.getElementById('aiChatMessages');
        
        // Add user message
        messagesContainer.innerHTML += `
            <div class="user-message">
                <div class="message-content">${foodRequest}</div>
            </div>
        `;
        
        // Clear input
        input.value = '';
        
        // Simulate AI processing (in real app, this would call an API)
        setTimeout(() => {
            const foodItem = this.createAIFood(foodRequest, category);
            
            // Add AI response
            messagesContainer.innerHTML += `
                <div class="ai-message">
                    <div class="message-content">
                        I've created "${foodItem.name}" for you! Here are the estimated nutritional values:
                    </div>
                </div>
                <div class="ai-food-preview">
                    <div class="ai-food-name">${foodItem.name}</div>
                    <div class="ai-food-macros">
                        <span>🔥 ${foodItem.kcal} kcal</span>
                        <span>💪 ${foodItem.protein}g protein</span>
                        <span>🌾 ${foodItem.carbs}g carbs</span>
                        <span>🥑 ${foodItem.fat}g fat</span>
                    </div>
                    <button class="add-ai-food" onclick="window.aiSearchService.addAIFoodToCategory('${category}', ${JSON.stringify(foodItem).replace(/"/g, '&quot;')})">
                        Add to ${category}
                    </button>
                </div>
            `;
            
            // Scroll to bottom
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 500);
    }

    createAIFood(foodName, category) {
        // This is where AI would analyze the food and create nutritional values
        // For now, we'll use smart estimates based on the food name
        
        const estimates = this.estimateNutrition(foodName, category);
        
        return {
            name: foodName,
            baseQuantity: estimates.quantity,
            baseUnit: estimates.unit,
            kcal: estimates.kcal,
            protein: estimates.protein,
            carbs: estimates.carbs,
            fat: estimates.fat,
            cost: estimates.cost
        };
    }

    estimateNutrition(foodName, category = null) {
        const nameLower = foodName.toLowerCase();
        
        // Default values
        let nutrition = {
            quantity: 100,
            unit: 'g',
            kcal: 200,
            protein: 10,
            carbs: 20,
            fat: 8,
            cost: 3.00
        };
        
        // Adjust based on keywords in the food name
        if (nameLower.includes('big mac') || nameLower.includes('burger')) {
            nutrition = { quantity: 1, unit: 'unit', kcal: 563, protein: 26, carbs: 45, fat: 33, cost: 7.50 };
        } else if (nameLower.includes('mcnuggets') || nameLower.includes('nuggets')) {
            nutrition = { quantity: 6, unit: 'pieces', kcal: 250, protein: 13, carbs: 15, fat: 15, cost: 5.00 };
        } else if (nameLower.includes('pizza')) {
            nutrition = { quantity: 1, unit: 'slice', kcal: 285, protein: 12, carbs: 36, fat: 10, cost: 4.00 };
        } else if (nameLower.includes('smoothie')) {
            nutrition = { quantity: 250, unit: 'ml', kcal: 180, protein: 8, carbs: 32, fat: 3, cost: 6.00 };
        } else if (nameLower.includes('salad')) {
            nutrition = { quantity: 1, unit: 'bowl', kcal: 150, protein: 5, carbs: 15, fat: 8, cost: 8.00 };
        } else if (nameLower.includes('pasta') || nameLower.includes('lasagna')) {
            nutrition = { quantity: 1, unit: 'serving', kcal: 420, protein: 18, carbs: 55, fat: 14, cost: 12.00 };
        } else if (nameLower.includes('sandwich')) {
            nutrition = { quantity: 1, unit: 'unit', kcal: 350, protein: 20, carbs: 40, fat: 12, cost: 8.00 };
        } else if (nameLower.includes('protein bar')) {
            nutrition = { quantity: 1, unit: 'bar', kcal: 230, protein: 20, carbs: 25, fat: 8, cost: 3.50 };
        } else if (nameLower.includes('eggs')) {
            nutrition = { quantity: 2, unit: 'large', kcal: 156, protein: 13, carbs: 1.2, fat: 11, cost: 1.20 };
        } else if (nameLower.includes('steak')) {
            nutrition = { quantity: 200, unit: 'g', kcal: 434, protein: 52, carbs: 0, fat: 24, cost: 15.00 };
        }
        
        // Adjust for category if provided
        if (category === 'protein') {
            nutrition.protein *= 1.5;
            nutrition.carbs *= 0.5;
        } else if (category === 'carbs') {
            nutrition.carbs *= 1.5;
            nutrition.protein *= 0.7;
        } else if (category === 'sweets') {
            nutrition.carbs *= 2;
            nutrition.kcal *= 1.3;
        }
        
        return nutrition;
    }

    addAIFoodToCategory(category, foodItem) {
        const column = document.querySelector(`.category-column[data-category="${category}"]`);
        if (!column) {
            console.error('Column not found for category:', category);
            return;
        }
        
        const itemsContainer = column.querySelector('.category-items');
        if (!itemsContainer) {
            console.error('Items container not found in column');
            return;
        }
        
        // Create new food item element using window function
        if (window.createFoodItemHTML) {
            const newFoodHTML = window.createFoodItemHTML(foodItem, category);
            
            // Add to the top of the list with animation
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = newFoodHTML;
            const newElement = tempDiv.firstElementChild;
            
            if (newElement) {
                newElement.classList.add('ai-added');
                itemsContainer.insertBefore(newElement, itemsContainer.firstChild);
                
                // Setup drag handlers for the new item
                if (window.handleFoodDragStart) {
                    newElement.addEventListener('dragstart', window.handleFoodDragStart);
                    newElement.addEventListener('dragend', window.handleFoodDragEnd);
                }
                
                // Setup portion and unit change handlers
                if (window.handlePortionChange) {
                    newElement.querySelector('.portion-input')?.addEventListener('change', window.handlePortionChange);
                    newElement.querySelector('.unit-select')?.addEventListener('change', window.handleUnitChange);
                }
            }
        }
        
        // Close the chat modal
        this.closeAIFoodChat();
    }

    // ============= SEARCH FUNCTIONS =============

    searchAIFoodsWithWebData(query) {
        // Implement web data search if needed
        this.searchAIFoods(query);
    }

    searchAIFoods(query) {
        const input = document.getElementById('aiSearchInput');
        if (input) {
            input.value = query;
        }
        this.sendAISearchRequest();
    }
}

// Create and export singleton instance
const aiSearchService = new AISearchService();

// Expose to window for onclick handlers
window.aiSearchService = aiSearchService;

export default aiSearchService;