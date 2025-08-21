// Shopping List Component
// Real-time aggregation of ingredients from meal plan

export class ShoppingList {
    constructor() {
        this.items = new Map(); // Use Map for efficient lookups
        this.column = null;
        this.listContainer = null;
        this.updateDebounceTimer = null;
    }

    // Initialize shopping list column
    init() {
        console.log('🛒 Initializing shopping list...');
        this.createColumn();
        this.attachToBoard();
        this.startObserving();
        this.updateList();
        console.log('🛒 Shopping list initialized');
    }

    // Create the shopping list column HTML
    createColumn() {
        this.column = document.createElement('div');
        this.column.className = 'shopping-list-column';
        this.column.innerHTML = `
            <div class="shopping-list-header">
                <div class="shopping-list-title">
                    <span class="shopping-list-icon">🛒</span>
                    <span>Shopping List</span>
                </div>
                <div class="shopping-list-count">0 items</div>
            </div>
            
            <div class="shopping-list-container">
                <div class="shopping-list-loading">
                    Building your list...
                </div>
                
                <div class="shopping-list-items" style="display: none;">
                    <!-- Categories will be inserted here -->
                </div>
                
                <div class="shopping-list-empty" style="display: none;">
                    <p>Add meals to see your shopping list</p>
                </div>
            </div>
            
            <div class="shopping-list-footer">
                <div class="shopping-list-total">
                    <span class="total-label">Total items:</span>
                    <span class="total-count">0</span>
                </div>
                
                <div class="shopping-list-actions">
                    <button class="btn-copy-list" onclick="window.shoppingList.copyToClipboard()">
                        📋 Copy List
                    </button>
                    
                    <div class="shopping-list-cta" style="display: none;">
                        <p class="cta-text">Save this list?</p>
                        <button class="btn-email-list" onclick="window.shoppingList.emailList()">
                            ✉️ Email to me
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        this.listContainer = this.column.querySelector('.shopping-list-items');
    }

    // Attach column to the main board
    attachToBoard() {
        const mainBoard = document.querySelector('.main-board');
        console.log('🛒 Looking for .main-board:', mainBoard);
        if (mainBoard) {
            // Add after all day columns
            mainBoard.appendChild(this.column);
            console.log('🛒 Shopping list column attached to board');
        } else {
            console.error('🛒 Could not find .main-board element!');
        }
    }

    // Start observing changes to meal plan
    startObserving() {
        // Use MutationObserver to watch for changes
        const observer = new MutationObserver(() => {
            this.scheduleUpdate();
        });

        const mainBoard = document.querySelector('.main-board');
        if (mainBoard) {
            observer.observe(mainBoard, {
                childList: true,
                subtree: true,
                attributes: true,
                attributeFilter: ['data-quantity', 'data-unit']
            });
        }
    }

    // Debounce updates for performance
    scheduleUpdate() {
        clearTimeout(this.updateDebounceTimer);
        this.updateDebounceTimer = setTimeout(() => {
            this.updateList();
        }, 300); // Wait 300ms after last change
    }

    // Main update function - scan all meals and aggregate ingredients
    updateList() {
        this.items.clear();
        
        // Scan all meals and food modules
        const allMeals = document.querySelectorAll('.meal');
        const allRecipes = document.querySelectorAll('.recipe-container');
        
        // Process regular meals
        allMeals.forEach(meal => {
            const modules = meal.querySelectorAll('.food-module');
            modules.forEach(module => {
                this.addItemFromModule(module);
            });
        });
        
        // Process recipes
        allRecipes.forEach(recipe => {
            const modules = recipe.querySelectorAll('.food-module');
            modules.forEach(module => {
                this.addItemFromModule(module);
            });
        });
        
        // Render the aggregated list
        this.render();
    }

    // Extract item data from a food module
    addItemFromModule(module) {
        const name = module.querySelector('.module-name')?.textContent?.trim();
        if (!name) return;
        
        const quantityInput = module.querySelector('.module-portion-input');
        const unitSelect = module.querySelector('.module-unit-select');
        
        const quantity = parseFloat(quantityInput?.value || 1);
        const unit = unitSelect?.value || 'unit';
        const category = this.detectCategory(name, module);
        
        // Create unique key for aggregation
        const key = `${name.toLowerCase()}_${unit}`;
        
        if (this.items.has(key)) {
            // Aggregate quantities
            const existing = this.items.get(key);
            existing.quantity += quantity;
        } else {
            // Add new item
            this.items.set(key, {
                name: name,
                quantity: quantity,
                unit: unit,
                category: category
            });
        }
    }

    // Detect category based on name or module class
    detectCategory(name, module) {
        const nameLower = name.toLowerCase();
        
        // Check module classes first
        if (module.classList.contains('food-module-protein')) return 'Proteins';
        if (module.classList.contains('food-module-dairy')) return 'Dairy';
        if (module.classList.contains('food-module-veg')) return 'Produce';
        if (module.classList.contains('food-module-fruit')) return 'Produce';
        if (module.classList.contains('food-module-grains')) return 'Pantry';
        if (module.classList.contains('food-module-nuts')) return 'Pantry';
        
        // Fallback to name-based detection
        const categories = {
            'Proteins': ['chicken', 'beef', 'fish', 'salmon', 'tuna', 'turkey', 'pork', 'egg', 'tofu'],
            'Dairy': ['milk', 'yogurt', 'cheese', 'butter', 'cream'],
            'Produce': ['tomato', 'lettuce', 'onion', 'garlic', 'pepper', 'carrot', 'broccoli', 
                       'spinach', 'apple', 'banana', 'orange', 'berry'],
            'Pantry': ['rice', 'pasta', 'bread', 'flour', 'oil', 'sugar', 'salt', 'oats']
        };
        
        for (const [category, keywords] of Object.entries(categories)) {
            if (keywords.some(keyword => nameLower.includes(keyword))) {
                return category;
            }
        }
        
        return 'Other';
    }

    // Render the shopping list
    render() {
        if (this.items.size === 0) {
            this.showEmpty();
            return;
        }
        
        // Group items by category
        const grouped = this.groupByCategory();
        
        // Build HTML
        let html = '';
        for (const [category, items] of Object.entries(grouped)) {
            html += `
                <div class="shopping-category">
                    <h4 class="shopping-category-title">${category}</h4>
                    <div class="shopping-category-items">
            `;
            
            items.forEach(item => {
                const displayQuantity = this.formatQuantity(item.quantity, item.unit);
                html += `
                    <div class="shopping-item">
                        <span class="item-checkbox">☐</span>
                        <span class="item-name">${item.name}</span>
                        <span class="item-quantity">${displayQuantity}</span>
                    </div>
                `;
            });
            
            html += `
                    </div>
                </div>
            `;
        }
        
        // Update DOM
        this.listContainer.innerHTML = html;
        this.showList();
        
        // Update counts
        this.updateCounts();
        
        // Show CTA after 5+ items
        if (this.items.size >= 5) {
            this.showCTA();
        }
    }

    // Group items by category for display
    groupByCategory() {
        const grouped = {};
        
        for (const [key, item] of this.items) {
            if (!grouped[item.category]) {
                grouped[item.category] = [];
            }
            grouped[item.category].push(item);
        }
        
        // Sort categories in shopping order
        const categoryOrder = ['Produce', 'Proteins', 'Dairy', 'Pantry', 'Other'];
        const sorted = {};
        
        categoryOrder.forEach(cat => {
            if (grouped[cat]) {
                sorted[cat] = grouped[cat].sort((a, b) => a.name.localeCompare(b.name));
            }
        });
        
        return sorted;
    }

    // Format quantity for display
    formatQuantity(quantity, unit) {
        // Round to reasonable precision
        if (quantity % 1 === 0) {
            return `${quantity} ${unit}${quantity > 1 ? 's' : ''}`;
        } else {
            return `${quantity.toFixed(1)} ${unit}${quantity > 1 ? 's' : ''}`;
        }
    }

    // Update item counts
    updateCounts() {
        const count = this.items.size;
        
        this.column.querySelector('.shopping-list-count').textContent = 
            `${count} item${count !== 1 ? 's' : ''}`;
        
        this.column.querySelector('.total-count').textContent = count;
    }

    // Show/hide different states
    showLoading() {
        this.column.querySelector('.shopping-list-loading').style.display = 'block';
        this.column.querySelector('.shopping-list-items').style.display = 'none';
        this.column.querySelector('.shopping-list-empty').style.display = 'none';
    }

    showList() {
        this.column.querySelector('.shopping-list-loading').style.display = 'none';
        this.column.querySelector('.shopping-list-items').style.display = 'block';
        this.column.querySelector('.shopping-list-empty').style.display = 'none';
    }

    showEmpty() {
        this.column.querySelector('.shopping-list-loading').style.display = 'none';
        this.column.querySelector('.shopping-list-items').style.display = 'none';
        this.column.querySelector('.shopping-list-empty').style.display = 'block';
        this.updateCounts();
    }

    showCTA() {
        const cta = this.column.querySelector('.shopping-list-cta');
        if (cta) {
            cta.style.display = 'block';
        }
    }

    // Copy list to clipboard
    copyToClipboard() {
        let text = 'Shopping List\n\n';
        
        const grouped = this.groupByCategory();
        for (const [category, items] of Object.entries(grouped)) {
            text += `${category}:\n`;
            items.forEach(item => {
                const qty = this.formatQuantity(item.quantity, item.unit);
                text += `• ${item.name} - ${qty}\n`;
            });
            text += '\n';
        }
        
        navigator.clipboard.writeText(text).then(() => {
            // Show success feedback
            const btn = this.column.querySelector('.btn-copy-list');
            const originalText = btn.textContent;
            btn.textContent = '✅ Copied!';
            btn.classList.add('success');
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.classList.remove('success');
            }, 2000);
        });
    }

    // Email list (opens email client)
    emailList() {
        let body = 'My Shopping List from Hannah.health\n\n';
        
        const grouped = this.groupByCategory();
        for (const [category, items] of Object.entries(grouped)) {
            body += `${category}:\n`;
            items.forEach(item => {
                const qty = this.formatQuantity(item.quantity, item.unit);
                body += `• ${item.name} - ${qty}\n`;
            });
            body += '\n';
        }
        
        body += '\nView your meal plan at: hannah.health';
        
        const subject = 'My Shopping List - Hannah.health';
        const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
        
        window.location.href = mailto;
    }
}

// Initialize shopping list when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.shoppingList = new ShoppingList();
    // Wait a bit for meal planner to initialize first
    setTimeout(() => {
        window.shoppingList.init();
    }, 500);
});

// Export for use in other modules
export default ShoppingList;