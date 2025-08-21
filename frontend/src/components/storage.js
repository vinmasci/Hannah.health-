// Storage and Data Persistence for Meal Planner

const MealStorage = {
    // Save meal plan to localStorage
    saveMealPlan: function() {
        const mealPlan = {
            days: [],
            lastUpdated: new Date().toISOString()
        };
        
        // Get all day columns
        const dayColumns = document.querySelectorAll('.day-column');
        dayColumns.forEach(dayCol => {
            const dayData = {
                name: dayCol.querySelector('.day-name').textContent,
                meals: []
            };
            
            // Get all meals in this day
            const meals = dayCol.querySelectorAll('.meal');
            meals.forEach(meal => {
                const mealData = {
                    id: meal.dataset.mealId,
                    name: meal.querySelector('.meal-name').textContent.replace(/[🍳☀️🌙🥐🍎🍪🥨🍽️]/g, '').trim(),
                    time: meal.querySelector('.meal-time').textContent.replace('⏰ ', ''),
                    foods: []
                };
                
                // Get all food modules in this meal
                const modules = meal.querySelectorAll('.food-module');
                modules.forEach(module => {
                    const moduleData = JSON.parse(module.dataset.module);
                    mealData.foods.push({
                        name: moduleData.name,
                        quantity: moduleData.quantity,
                        unit: moduleData.unit,
                        kcal: moduleData.kcal,
                        protein: moduleData.protein,
                        carbs: moduleData.carbs,
                        fat: moduleData.fat,
                        cost: moduleData.cost
                    });
                });
                
                dayData.meals.push(mealData);
            });
            
            mealPlan.days.push(dayData);
        });
        
        localStorage.setItem('hannahMealPlan', JSON.stringify(mealPlan));
        this.showSaveNotification();
    },
    
    // Load meal plan from localStorage
    loadMealPlan: function() {
        const saved = localStorage.getItem('hannahMealPlan');
        if (!saved) return null;
        
        try {
            return JSON.parse(saved);
        } catch (e) {
            console.error('Error loading meal plan:', e);
            return null;
        }
    },
    
    // Clear saved meal plan
    clearMealPlan: function() {
        localStorage.removeItem('hannahMealPlan');
        this.showClearNotification();
    },
    
    // Show save notification
    showSaveNotification: function() {
        this.showNotification('✅ Meal plan saved!', 'success');
    },
    
    // Show clear notification
    showClearNotification: function() {
        this.showNotification('🗑️ Meal plan cleared!', 'info');
    },
    
    // Generic notification function - Modern snackbar style
    showNotification: function(message, type = 'success') {
        // Remove any existing notifications first
        const existing = document.querySelector('.snackbar-notification');
        if (existing) {
            existing.remove();
        }
        
        const notification = document.createElement('div');
        notification.className = `snackbar-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            bottom: 24px;
            right: 24px;
            background: ${type === 'success' ? 'linear-gradient(135deg, #48bb78 0%, #38a169 100%)' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'};
            color: white;
            padding: 16px 24px;
            border-radius: 12px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            animation: slideUpIn 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            font-weight: 600;
            font-size: 14px;
            display: flex;
            align-items: center;
            gap: 12px;
            min-width: 280px;
            max-width: 400px;
            line-height: 1.4;
        `;
        
        // Add icon and text
        const icon = document.createElement('span');
        icon.style.cssText = `
            font-size: 20px;
            display: flex;
            align-items: center;
            animation: bounceIn 0.6s ease;
        `;
        icon.textContent = message.match(/^[✅🗑️📋🖨️]/) ? message.substring(0, 2) : (type === 'success' ? '✅' : 'ℹ️');
        
        const text = document.createElement('span');
        text.style.cssText = `
            flex: 1;
            font-size: 14px;
        `;
        text.textContent = message.replace(/^[✅🗑️📋🖨️]\s*/, '');
        
        // Progress bar for auto-dismiss
        const progressBar = document.createElement('div');
        progressBar.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            right: 0;
            height: 3px;
            background: rgba(255, 255, 255, 0.3);
            border-radius: 0 0 12px 12px;
            overflow: hidden;
        `;
        
        const progressFill = document.createElement('div');
        progressFill.style.cssText = `
            height: 100%;
            background: rgba(255, 255, 255, 0.7);
            width: 100%;
            animation: progressShrink 3s linear;
        `;
        progressBar.appendChild(progressFill);
        
        notification.appendChild(icon);
        notification.appendChild(text);
        notification.appendChild(progressBar);
        
        document.body.appendChild(notification);
        
        // Auto dismiss after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideDownOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
};

// Shopping List Generator
const ShoppingListGenerator = {
    // Generate shopping list from current meal plan
    generateList: function() {
        const ingredients = {};
        const mealsByDay = {};
        
        // Collect all ingredients from all meals
        const dayColumns = document.querySelectorAll('.day-column');
        dayColumns.forEach(dayCol => {
            const dayName = dayCol.querySelector('.day-name').textContent;
            mealsByDay[dayName] = [];
            
            const meals = dayCol.querySelectorAll('.meal');
            meals.forEach(meal => {
                const mealName = meal.querySelector('.meal-name').textContent.replace(/[🍳☀️🌙🥐🍎🍪🥨🍽️]/g, '').trim();
                const modules = meal.querySelectorAll('.food-module');
                
                modules.forEach(module => {
                    const moduleData = JSON.parse(module.dataset.module);
                    const key = `${moduleData.name}-${moduleData.unit}`;
                    
                    if (!ingredients[key]) {
                        ingredients[key] = {
                            name: moduleData.name,
                            quantity: 0,
                            unit: moduleData.unit,
                            cost: 0,
                            usedIn: []
                        };
                    }
                    
                    ingredients[key].quantity += moduleData.quantity;
                    ingredients[key].cost += moduleData.cost;
                    ingredients[key].usedIn.push(`${dayName} - ${mealName}`);
                    
                    mealsByDay[dayName].push({
                        meal: mealName,
                        item: `${moduleData.name} (${moduleData.quantity} ${moduleData.unit})`
                    });
                });
            });
        });
        
        return {
            ingredients: Object.values(ingredients),
            totalCost: Object.values(ingredients).reduce((sum, item) => sum + item.cost, 0),
            mealsByDay: mealsByDay
        };
    },
    
    // Display shopping list in a modal
    showShoppingList: function() {
        const list = this.generateList();
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'shopping-list-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
        `;
        
        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 24px;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 10px 40px rgba(0,0,0,0.2);
        `;
        
        // Group ingredients by first letter of name for better organization
        const grouped = {};
        list.ingredients.forEach(item => {
            const firstLetter = item.name[0].toUpperCase();
            if (!grouped[firstLetter]) grouped[firstLetter] = [];
            grouped[firstLetter].push(item);
        });
        
        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <h2 style="margin: 0; color: #2d3748; font-size: 24px;">🛒 Shopping List</h2>
                <button onclick="this.closest('.shopping-list-modal').remove()" 
                        style="background: none; border: none; font-size: 24px; cursor: pointer;">×</button>
            </div>
            
            <div style="background: #f7fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <span style="font-size: 14px; color: #718096;">Total Items: ${list.ingredients.length}</span>
                    <span style="font-size: 18px; font-weight: 700; color: #48bb78;">Total Cost: $${list.totalCost.toFixed(2)}</span>
                </div>
            </div>
            
            <div style="margin-bottom: 20px;">
                ${Object.keys(grouped).sort().map(letter => `
                    <div style="margin-bottom: 16px;">
                        <h3 style="color: #667eea; font-size: 14px; font-weight: 600; margin-bottom: 8px;">${letter}</h3>
                        ${grouped[letter].map(item => `
                            <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; background: #f7fafc; border-radius: 6px; margin-bottom: 8px;">
                                <div style="display: flex; align-items: center; gap: 12px;">
                                    <input type="checkbox" style="width: 20px; height: 20px; cursor: pointer;">
                                    <div>
                                        <div style="font-weight: 600; color: #2d3748;">${item.name}</div>
                                        <div style="font-size: 12px; color: #718096;">${item.quantity.toFixed(1)} ${item.unit}</div>
                                    </div>
                                </div>
                                <div style="text-align: right;">
                                    <div style="font-weight: 600; color: #48bb78;">$${item.cost.toFixed(2)}</div>
                                    <div style="font-size: 10px; color: #a0aec0;" title="${item.usedIn.join(', ')}">${item.usedIn.length} meals</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                `).join('')}
            </div>
            
            <div style="display: flex; gap: 12px;">
                <button onclick="ShoppingListGenerator.exportList()" 
                        style="flex: 1; padding: 12px; background: #667eea; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    📋 Copy List
                </button>
                <button onclick="ShoppingListGenerator.printList()" 
                        style="flex: 1; padding: 12px; background: #48bb78; color: white; border: none; border-radius: 8px; font-weight: 600; cursor: pointer;">
                    🖨️ Print
                </button>
            </div>
        `;
        
        modal.appendChild(modalContent);
        document.body.appendChild(modal);
        
        // Close on background click
        modal.addEventListener('click', (e) => {
            if (e.target === modal) modal.remove();
        });
    },
    
    // Export list to clipboard
    exportList: function() {
        const list = this.generateList();
        let text = '🛒 Shopping List\n';
        text += '═══════════════\n\n';
        
        list.ingredients.forEach(item => {
            text += `☐ ${item.name} - ${item.quantity.toFixed(1)} ${item.unit} ($${item.cost.toFixed(2)})\n`;
        });
        
        text += `\n═══════════════\n`;
        text += `Total Cost: $${list.totalCost.toFixed(2)}\n`;
        
        navigator.clipboard.writeText(text).then(() => {
            MealStorage.showNotification('📋 List copied to clipboard!', 'success');
        });
    },
    
    // Print shopping list
    printList: function() {
        const list = this.generateList();
        const printWindow = window.open('', '_blank');
        
        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>Shopping List - Hannah Health</title>
                <style>
                    body { font-family: -apple-system, sans-serif; padding: 20px; }
                    h1 { color: #2d3748; }
                    .item { padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
                    .total { margin-top: 20px; font-size: 18px; font-weight: bold; }
                    @media print { body { padding: 0; } }
                </style>
            </head>
            <body>
                <h1>🛒 Shopping List</h1>
                ${list.ingredients.map(item => 
                    `<div class="item">☐ ${item.name} - ${item.quantity.toFixed(1)} ${item.unit} ($${item.cost.toFixed(2)})</div>`
                ).join('')}
                <div class="total">Total Cost: $${list.totalCost.toFixed(2)}</div>
            </body>
            </html>
        `;
        
        printWindow.document.write(html);
        printWindow.document.close();
        printWindow.print();
    }
};

// Auto-save every 30 seconds
setInterval(() => {
    if (document.querySelector('.day-column')) {
        MealStorage.saveMealPlan();
    }
}, 30000);

// Add styles for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideUpIn {
        from { 
            transform: translateY(100%) translateX(0) scale(0.8); 
            opacity: 0; 
        }
        to { 
            transform: translateY(0) translateX(0) scale(1); 
            opacity: 1; 
        }
    }
    
    @keyframes slideDownOut {
        from { 
            transform: translateY(0) translateX(0); 
            opacity: 1; 
        }
        to { 
            transform: translateY(100%) translateX(0); 
            opacity: 0; 
        }
    }
    
    @keyframes bounceIn {
        0% { transform: scale(0); }
        50% { transform: scale(1.2); }
        100% { transform: scale(1); }
    }
    
    @keyframes progressShrink {
        from { width: 100%; }
        to { width: 0%; }
    }
    
    /* Old animations kept for compatibility */
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

// Export for use in app.js
window.MealStorage = MealStorage;
window.ShoppingListGenerator = ShoppingListGenerator;