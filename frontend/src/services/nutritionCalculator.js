// Nutrition calculation service for macro calculations and formatting

export class NutritionCalculator {
    /**
     * Calculate macros for a food item based on quantity and unit
     * @param {Object} food - Food object with base nutritional values
     * @param {number} quantity - Amount of food
     * @param {string} unit - Unit of measurement
     * @returns {Object} Calculated macros (kcal, protein, carbs, fat, cost)
     */
    static calculateMacros(food, quantity, unit) {
        // Get the ratio based on quantity and unit conversion
        const ratio = this.calculateRatio(food, quantity, unit);
        
        return {
            kcal: Math.round(food.kcal * ratio),
            protein: food.protein * ratio,
            carbs: food.carbs * ratio,
            fat: food.fat * ratio,
            cost: food.cost * ratio
        };
    }
    
    /**
     * Calculate the ratio for scaling nutritional values
     * @param {Object} food - Food object with baseQuantity and baseUnit
     * @param {number} quantity - New quantity
     * @param {string} unit - New unit
     * @returns {number} Scaling ratio
     */
    static calculateRatio(food, quantity, unit) {
        // Import unit converter - using dynamic import to avoid circular dependency
        // This will be resolved when we update app.js to use ES6 modules properly
        if (food.baseUnit === unit) {
            return quantity / food.baseQuantity;
        }
        
        // For now, use the global unitConversions directly
        // This will be refactored when we complete the module system
        if (typeof window !== 'undefined' && window.convertUnit) {
            const quantityInBaseUnit = window.convertUnit(quantity, unit, food.baseUnit);
            return quantityInBaseUnit / food.baseQuantity;
        }
        
        // Fallback: assume no conversion needed
        return quantity / food.baseQuantity;
    }
    
    /**
     * Calculate totals for multiple food items
     * @param {Array} foodItems - Array of food items with macros
     * @returns {Object} Total macros
     */
    static calculateTotals(foodItems) {
        const totals = {
            kcal: 0,
            protein: 0,
            carbs: 0,
            fat: 0,
            cost: 0
        };
        
        foodItems.forEach(item => {
            totals.kcal += item.kcal || 0;
            totals.protein += item.protein || 0;
            totals.carbs += item.carbs || 0;
            totals.fat += item.fat || 0;
            totals.cost += item.cost || 0;
        });
        
        return totals;
    }
    
    /**
     * Get macro percentages based on gram weights
     * @param {number} protein - Protein in grams
     * @param {number} carbs - Carbs in grams
     * @param {number} fat - Fat in grams
     * @returns {Object} Percentages for each macro
     */
    static getMacroPercentages(protein, carbs, fat) {
        const total = protein + carbs + fat;
        if (total === 0) {
            return { protein: 0, carbs: 0, fat: 0 };
        }
        
        // Calculate percentages without rounding first
        const proteinPct = (protein / total) * 100;
        const carbsPct = (carbs / total) * 100;
        const fatPct = (fat / total) * 100;
        
        // Round first two, calculate last to ensure total is 100%
        const proteinRounded = Math.round(proteinPct);
        const carbsRounded = Math.round(carbsPct);
        const fatRounded = 100 - proteinRounded - carbsRounded;
        
        return {
            protein: proteinRounded,
            carbs: carbsRounded,
            fat: Math.max(0, fatRounded) // Ensure non-negative
        };
    }
    
    /**
     * Get macro calorie percentages (accounting for different calorie densities)
     * @param {number} protein - Protein in grams
     * @param {number} carbs - Carbs in grams
     * @param {number} fat - Fat in grams
     * @returns {Object} Calorie percentages for each macro
     */
    static getMacroCaloriePercentages(protein, carbs, fat) {
        const proteinCals = protein * 4;
        const carbsCals = carbs * 4;
        const fatCals = fat * 9;
        const totalCals = proteinCals + carbsCals + fatCals;
        
        if (totalCals === 0) {
            return { protein: 0, carbs: 0, fat: 0 };
        }
        
        return {
            protein: Math.round((proteinCals / totalCals) * 100),
            carbs: Math.round((carbsCals / totalCals) * 100),
            fat: Math.round((fatCals / totalCals) * 100)
        };
    }
    
    /**
     * Format calories for display
     * @param {number} kcal - Calories to format
     * @returns {string} Formatted string
     */
    static formatCalories(kcal) {
        if (kcal >= 1000) {
            return `${(kcal / 1000).toFixed(1)}k`;
        }
        return `${Math.round(kcal)}`;
    }
    
    /**
     * Format macros for compact display
     * @param {Object} macros - Object with protein, carbs, fat
     * @returns {string} Formatted string like "31g P • 0g C • 4g F"
     */
    static formatMacros(macros) {
        return `${macros.protein.toFixed(1)}g P • ${macros.carbs.toFixed(1)}g C • ${macros.fat.toFixed(1)}g F`;
    }
    
    /**
     * Check if food meets macro criteria
     * @param {Object} food - Food object with macros
     * @param {string} criteria - Criteria like 'high-protein', 'low-carb', 'low-fat'
     * @returns {boolean} Whether food meets criteria
     */
    static meetsMacroCriteria(food, criteria) {
        const proteinCals = food.protein * 4;
        const carbsCals = food.carbs * 4;
        const fatCals = food.fat * 9;
        const totalCals = food.kcal || (proteinCals + carbsCals + fatCals);
        
        switch(criteria) {
            case 'high-protein':
                return (proteinCals / totalCals) > 0.2; // >20% calories from protein
            case 'low-carb':
                return (carbsCals / totalCals) < 0.3; // <30% calories from carbs
            case 'low-fat':
                return (fatCals / totalCals) < 0.3; // <30% calories from fat
            case 'balanced':
                const proteinPct = proteinCals / totalCals;
                const carbsPct = carbsCals / totalCals;
                const fatPct = fatCals / totalCals;
                // Balanced if all macros are between 20-40%
                return proteinPct >= 0.2 && proteinPct <= 0.4 &&
                       carbsPct >= 0.2 && carbsPct <= 0.4 &&
                       fatPct >= 0.2 && fatPct <= 0.4;
            default:
                return true;
        }
    }
    
    /**
     * Create macro bar HTML visualization
     * @param {number} protein - Protein in grams
     * @param {number} carbs - Carbs in grams
     * @param {number} fat - Fat in grams
     * @returns {string} HTML string for macro bar
     */
    static createMacroBarHTML(protein, carbs, fat) {
        const total = protein + carbs + fat;
        if (total === 0) {
            return '<div class="macro-bar-empty">No macros</div>';
        }
        
        const percentages = this.getMacroPercentages(protein, carbs, fat);
        
        return `
            <div class="macro-bar-segment protein" style="width: ${percentages.protein}%" title="Protein: ${protein.toFixed(1)}g (${percentages.protein}%)"></div>
            <div class="macro-bar-segment carbs" style="width: ${percentages.carbs}%" title="Carbs: ${carbs.toFixed(1)}g (${percentages.carbs}%)"></div>
            <div class="macro-bar-segment fat" style="width: ${percentages.fat}%" title="Fat: ${fat.toFixed(1)}g (${percentages.fat}%)"></div>
        `;
    }
    
    /**
     * Create macro labels HTML
     * @param {number} protein - Protein in grams
     * @param {number} carbs - Carbs in grams
     * @param {number} fat - Fat in grams
     * @returns {string} HTML string for macro labels
     */
    static createMacroLabelsHTML(protein, carbs, fat) {
        const total = protein + carbs + fat;
        if (total === 0) return '';
        
        const percentages = this.getMacroPercentages(protein, carbs, fat);
        
        return `
            <span class="macro-label protein">Protein: ${protein.toFixed(1)}g (${percentages.protein}%)</span>
            <span class="macro-label carbs">Carbs: ${carbs.toFixed(1)}g (${percentages.carbs}%)</span>
            <span class="macro-label fat">Fat: ${fat.toFixed(1)}g (${percentages.fat}%)</span>
        `;
    }
}