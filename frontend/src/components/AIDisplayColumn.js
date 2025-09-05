// AIDisplayColumn - Displays calculations and insights from the AI Gatherer column
import eventBus from '../services/EventBus.js';

export class AIDisplayColumn {
    static create() {
        const column = document.createElement('div');
        column.className = 'ai-display-column category-column';
        column.dataset.category = 'ai-display';
        
        column.innerHTML = `
            <div class="column-header">
                <div class="column-header-content">
                    <h3>
                        <img src="https://cdn.jsdelivr.net/npm/openmoji@14.0.0/color/svg/1F4CA.svg" 
                             width="20" height="20" class="openmoji-icon" alt="chart"> 
                        AI Insights
                    </h3>
                    <button class="remove-column-btn" onclick="removeColumn('ai-display')">×</button>
                </div>
            </div>
            <div class="ai-display-content">
                <div class="ai-display-section">
                    <h4 class="section-title">Nutritional Analysis</h4>
                    <div id="nutrition-insights" class="insights-container">
                        <p class="empty-state">Waiting for AI to analyze your meals...</p>
                    </div>
                </div>
                
                <div class="ai-display-section">
                    <h4 class="section-title">Daily Totals</h4>
                    <div id="daily-totals-display" class="totals-display">
                        <div class="total-row">
                            <span class="total-label">Calories:</span>
                            <span class="total-value" id="ai-total-calories">0 kcal</span>
                        </div>
                        <div class="total-row">
                            <span class="total-label">Protein:</span>
                            <span class="total-value" id="ai-total-protein">0g</span>
                        </div>
                        <div class="total-row">
                            <span class="total-label">Carbs:</span>
                            <span class="total-value" id="ai-total-carbs">0g</span>
                        </div>
                        <div class="total-row">
                            <span class="total-label">Fat:</span>
                            <span class="total-value" id="ai-total-fat">0g</span>
                        </div>
                    </div>
                </div>
                
                <div class="ai-display-section">
                    <h4 class="section-title">Recommendations</h4>
                    <div id="ai-recommendations" class="recommendations-container">
                        <p class="empty-state">No recommendations yet</p>
                    </div>
                </div>
                
                <div class="ai-display-section">
                    <h4 class="section-title">Shopping List</h4>
                    <div id="ai-shopping-list" class="shopping-list-container">
                        <p class="empty-state">No items yet</p>
                    </div>
                </div>
            </div>
        `;
        
        // Add styles
        this.addStyles();
        
        // Set up event listeners
        this.setupEventListeners();
        
        return column;
    }
    
    static addStyles() {
        if (document.getElementById('ai-display-styles')) return;
        
        const styles = document.createElement('style');
        styles.id = 'ai-display-styles';
        styles.textContent = `
            .ai-display-column {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-width: 320px;
                max-width: 320px;
            }
            
            .ai-display-column .column-header {
                background: rgba(255, 255, 255, 0.15);
                backdrop-filter: blur(10px);
                border-bottom: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .ai-display-column h3 {
                color: white;
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 14px;
            }
            
            .ai-display-content {
                padding: 12px;
                height: calc(100% - 48px);
                overflow-y: auto;
            }
            
            .ai-display-section {
                background: white;
                border-radius: 8px;
                padding: 12px;
                margin-bottom: 12px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            }
            
            .section-title {
                font-size: 12px;
                font-weight: 600;
                color: #4a5568;
                margin: 0 0 10px 0;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }
            
            .insights-container, .recommendations-container, .shopping-list-container {
                font-size: 12px;
                color: #2d3748;
                line-height: 1.5;
            }
            
            .empty-state {
                color: #a0aec0;
                font-style: italic;
                font-size: 11px;
                margin: 0;
            }
            
            .totals-display {
                display: flex;
                flex-direction: column;
                gap: 6px;
            }
            
            .total-row {
                display: flex;
                justify-content: space-between;
                font-size: 12px;
            }
            
            .total-label {
                color: #718096;
                font-weight: 500;
            }
            
            .total-value {
                color: #2d3748;
                font-weight: 600;
            }
            
            .insight-item {
                padding: 8px;
                background: #f7fafc;
                border-left: 3px solid #667eea;
                margin-bottom: 8px;
                border-radius: 4px;
                font-size: 12px;
            }
            
            .recommendation-item {
                padding: 8px;
                background: #fef5e7;
                border-left: 3px solid #f39c12;
                margin-bottom: 8px;
                border-radius: 4px;
                font-size: 12px;
            }
            
            .shopping-item {
                padding: 4px 8px;
                background: #e6fffa;
                border-radius: 4px;
                margin-bottom: 4px;
                font-size: 12px;
                display: flex;
                justify-content: space-between;
            }
            
            .shopping-item-name {
                font-weight: 500;
            }
            
            .shopping-item-quantity {
                color: #718096;
            }
        `;
        document.head.appendChild(styles);
    }
    
    static setupEventListeners() {
        // Listen for data from the AI Gatherer column
        eventBus.on('ai:data-gathered', (data) => {
            this.updateDisplay(data);
        });
        
        // Listen for nutritional calculations
        eventBus.on('ai:nutrition-calculated', (data) => {
            this.updateNutrition(data);
        });
        
        // Listen for recommendations
        eventBus.on('ai:recommendations', (data) => {
            this.updateRecommendations(data);
        });
        
        // Listen for shopping list updates
        eventBus.on('ai:shopping-list', (data) => {
            this.updateShoppingList(data);
        });
    }
    
    static updateDisplay(data) {
        // Update the display with gathered data
        const nutritionInsights = document.getElementById('nutrition-insights');
        if (nutritionInsights && data.insights) {
            nutritionInsights.innerHTML = data.insights.map(insight => 
                `<div class="insight-item">${insight}</div>`
            ).join('');
        }
    }
    
    static updateNutrition(data) {
        // Update nutritional totals
        if (data.calories !== undefined) {
            document.getElementById('ai-total-calories').textContent = `${data.calories} kcal`;
        }
        if (data.protein !== undefined) {
            document.getElementById('ai-total-protein').textContent = `${data.protein}g`;
        }
        if (data.carbs !== undefined) {
            document.getElementById('ai-total-carbs').textContent = `${data.carbs}g`;
        }
        if (data.fat !== undefined) {
            document.getElementById('ai-total-fat').textContent = `${data.fat}g`;
        }
    }
    
    static updateRecommendations(data) {
        const container = document.getElementById('ai-recommendations');
        if (container && data.recommendations) {
            container.innerHTML = data.recommendations.map(rec => 
                `<div class="recommendation-item">${rec}</div>`
            ).join('');
        }
    }
    
    static updateShoppingList(data) {
        const container = document.getElementById('ai-shopping-list');
        if (container && data.items) {
            container.innerHTML = data.items.map(item => 
                `<div class="shopping-item">
                    <span class="shopping-item-name">${item.name}</span>
                    <span class="shopping-item-quantity">${item.quantity}</span>
                </div>`
            ).join('');
        }
    }
}

// Expose to window for global access
window.AIDisplayColumn = AIDisplayColumn;
export default AIDisplayColumn;