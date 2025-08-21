// Food database with base nutritional values and costs
export const foodDatabase = {
    protein: [
        { name: 'Chicken Breast', baseQuantity: 100, baseUnit: 'g', kcal: 165, protein: 31, carbs: 0, fat: 3.6, cost: 3.50 },
        { name: 'Salmon', baseQuantity: 100, baseUnit: 'g', kcal: 206, protein: 22, carbs: 0, fat: 13, cost: 5.75 },
        { name: 'Tuna', baseQuantity: 100, baseUnit: 'g', kcal: 130, protein: 29, carbs: 0, fat: 1, cost: 3.00 },
        { name: 'Lean Beef', baseQuantity: 100, baseUnit: 'g', kcal: 217, protein: 26, carbs: 0, fat: 12, cost: 4.50 },
        { name: 'Turkey', baseQuantity: 100, baseUnit: 'g', kcal: 135, protein: 30, carbs: 0, fat: 1, cost: 3.25 },
        { name: 'Tofu', baseQuantity: 100, baseUnit: 'g', kcal: 96, protein: 10, carbs: 2.3, fat: 5.8, cost: 1.50 },
        { name: 'Eggs', baseQuantity: 1, baseUnit: 'large', kcal: 78, protein: 6.5, carbs: 0.6, fat: 5.5, cost: 0.60 },
        { name: 'Shrimp', baseQuantity: 100, baseUnit: 'g', kcal: 99, protein: 24, carbs: 0.2, fat: 0.3, cost: 6.00 }
    ],
    dairy: [
        { name: 'Greek Yogurt', baseQuantity: 100, baseUnit: 'g', kcal: 97, protein: 9, carbs: 4, fat: 5, cost: 2.00 },
        { name: 'Milk', baseQuantity: 250, baseUnit: 'ml', kcal: 103, protein: 8, carbs: 12, fat: 2.4, cost: 1.00 },
        { name: 'Cottage Cheese', baseQuantity: 100, baseUnit: 'g', kcal: 98, protein: 11, carbs: 3.4, fat: 4.3, cost: 2.50 },
        { name: 'Cheddar Cheese', baseQuantity: 28, baseUnit: 'g', kcal: 113, protein: 7, carbs: 0.4, fat: 9, cost: 1.00 },
        { name: 'Mozzarella', baseQuantity: 28, baseUnit: 'g', kcal: 85, protein: 6, carbs: 1, fat: 6, cost: 1.25 },
        { name: 'Butter', baseQuantity: 1, baseUnit: 'tbsp', kcal: 102, protein: 0.1, carbs: 0, fat: 11.5, cost: 0.30 }
    ],
    veg: [
        { name: 'Broccoli', baseQuantity: 100, baseUnit: 'g', kcal: 34, protein: 2.8, carbs: 6.6, fat: 0.4, cost: 1.25 },
        { name: 'Spinach', baseQuantity: 100, baseUnit: 'g', kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, cost: 1.00 },
        { name: 'Kale', baseQuantity: 100, baseUnit: 'g', kcal: 35, protein: 2.9, carbs: 4.4, fat: 1.5, cost: 1.50 },
        { name: 'Bell Pepper', baseQuantity: 1, baseUnit: 'unit', kcal: 24, protein: 1, carbs: 6, fat: 0, cost: 1.50 },
        { name: 'Carrots', baseQuantity: 100, baseUnit: 'g', kcal: 41, protein: 0.9, carbs: 10, fat: 0.2, cost: 0.75 },
        { name: 'Tomatoes', baseQuantity: 100, baseUnit: 'g', kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, cost: 1.00 },
        { name: 'Cucumber', baseQuantity: 100, baseUnit: 'g', kcal: 16, protein: 0.7, carbs: 3.6, fat: 0.1, cost: 0.75 },
        { name: 'Mushrooms', baseQuantity: 100, baseUnit: 'g', kcal: 22, protein: 3.1, carbs: 3.3, fat: 0.3, cost: 1.75 }
    ],
    fruit: [
        { name: 'Apple', baseQuantity: 1, baseUnit: 'medium', kcal: 95, protein: 0.5, carbs: 25, fat: 0.3, cost: 0.50 },
        { name: 'Banana', baseQuantity: 1, baseUnit: 'medium', kcal: 105, protein: 1.3, carbs: 27, fat: 0.4, cost: 0.35 },
        { name: 'Orange', baseQuantity: 1, baseUnit: 'medium', kcal: 62, protein: 1.2, carbs: 15.4, fat: 0.2, cost: 0.75 },
        { name: 'Berries', baseQuantity: 100, baseUnit: 'g', kcal: 57, protein: 0.7, carbs: 14.5, fat: 0.3, cost: 3.00 },
        { name: 'Strawberries', baseQuantity: 100, baseUnit: 'g', kcal: 32, protein: 0.7, carbs: 7.7, fat: 0.3, cost: 2.50 },
        { name: 'Blueberries', baseQuantity: 100, baseUnit: 'g', kcal: 57, protein: 0.7, carbs: 14.5, fat: 0.3, cost: 4.00 },
        { name: 'Mango', baseQuantity: 100, baseUnit: 'g', kcal: 60, protein: 0.8, carbs: 15, fat: 0.4, cost: 2.00 },
        { name: 'Pineapple', baseQuantity: 100, baseUnit: 'g', kcal: 50, protein: 0.5, carbs: 13, fat: 0.1, cost: 1.50 }
    ],
    grains: [
        { name: 'Brown Rice', baseQuantity: 100, baseUnit: 'g', kcal: 111, protein: 2.6, carbs: 23, fat: 0.9, cost: 1.00 },
        { name: 'White Rice', baseQuantity: 100, baseUnit: 'g', kcal: 130, protein: 2.7, carbs: 28, fat: 0.3, cost: 0.75 },
        { name: 'Quinoa', baseQuantity: 100, baseUnit: 'g', kcal: 120, protein: 4.1, carbs: 21.3, fat: 1.9, cost: 2.00 },
        { name: 'Oats', baseQuantity: 100, baseUnit: 'g', kcal: 379, protein: 13.2, carbs: 67.7, fat: 6.5, cost: 1.50 },
        { name: 'Whole Wheat Bread', baseQuantity: 1, baseUnit: 'slice', kcal: 81, protein: 4, carbs: 13.8, fat: 1.1, cost: 0.30 },
        { name: 'Pasta', baseQuantity: 100, baseUnit: 'g', kcal: 131, protein: 5, carbs: 25, fat: 1.1, cost: 1.00 },
        { name: 'Barley', baseQuantity: 100, baseUnit: 'g', kcal: 123, protein: 2.3, carbs: 28.2, fat: 0.4, cost: 1.25 }
    ],
    nuts: [
        { name: 'Almonds', baseQuantity: 28, baseUnit: 'g', kcal: 164, protein: 6, carbs: 6, fat: 14, cost: 1.50 },
        { name: 'Walnuts', baseQuantity: 28, baseUnit: 'g', kcal: 185, protein: 4.3, carbs: 3.9, fat: 18.5, cost: 1.75 },
        { name: 'Cashews', baseQuantity: 28, baseUnit: 'g', kcal: 157, protein: 5.2, carbs: 8.6, fat: 12.4, cost: 2.00 },
        { name: 'Peanuts', baseQuantity: 28, baseUnit: 'g', kcal: 161, protein: 7.3, carbs: 4.6, fat: 14, cost: 0.75 },
        { name: 'Chia Seeds', baseQuantity: 28, baseUnit: 'g', kcal: 138, protein: 4.7, carbs: 12, fat: 8.7, cost: 2.50 },
        { name: 'Flax Seeds', baseQuantity: 28, baseUnit: 'g', kcal: 150, protein: 5.2, carbs: 8.2, fat: 12, cost: 1.50 },
        { name: 'Pumpkin Seeds', baseQuantity: 28, baseUnit: 'g', kcal: 151, protein: 7, carbs: 5, fat: 13, cost: 2.00 }
    ],
    carbs: [
        { name: 'Sweet Potato', baseQuantity: 100, baseUnit: 'g', kcal: 86, protein: 1.6, carbs: 20, fat: 0.1, cost: 0.75 },
        { name: 'Potato', baseQuantity: 100, baseUnit: 'g', kcal: 77, protein: 2, carbs: 17, fat: 0.1, cost: 0.50 },
        { name: 'Corn', baseQuantity: 100, baseUnit: 'g', kcal: 86, protein: 3.3, carbs: 19, fat: 1.4, cost: 0.75 },
        { name: 'Beans', baseQuantity: 100, baseUnit: 'g', kcal: 127, protein: 8.7, carbs: 22.8, fat: 0.5, cost: 1.00 },
        { name: 'Lentils', baseQuantity: 100, baseUnit: 'g', kcal: 116, protein: 9, carbs: 20, fat: 0.4, cost: 1.25 },
        { name: 'Chickpeas', baseQuantity: 100, baseUnit: 'g', kcal: 164, protein: 8.9, carbs: 27.4, fat: 2.6, cost: 1.00 }
    ],
    drinks: [
        { name: 'Water', baseQuantity: 250, baseUnit: 'ml', kcal: 0, protein: 0, carbs: 0, fat: 0, cost: 0.00 },
        { name: 'Coffee', baseQuantity: 250, baseUnit: 'ml', kcal: 2, protein: 0.3, carbs: 0, fat: 0, cost: 0.50 },
        { name: 'Green Tea', baseQuantity: 250, baseUnit: 'ml', kcal: 2, protein: 0, carbs: 0, fat: 0, cost: 0.25 },
        { name: 'Orange Juice', baseQuantity: 250, baseUnit: 'ml', kcal: 112, protein: 1.7, carbs: 26, fat: 0.5, cost: 1.50 },
        { name: 'Smoothie', baseQuantity: 250, baseUnit: 'ml', kcal: 150, protein: 3, carbs: 35, fat: 1, cost: 3.00 },
        { name: 'Protein Shake', baseQuantity: 250, baseUnit: 'ml', kcal: 160, protein: 25, carbs: 8, fat: 3, cost: 2.50 },
        { name: 'Coconut Water', baseQuantity: 250, baseUnit: 'ml', kcal: 45, protein: 2, carbs: 9, fat: 0.5, cost: 2.00 },
        { name: 'Almond Milk', baseQuantity: 250, baseUnit: 'ml', kcal: 40, protein: 1, carbs: 3, fat: 3, cost: 1.00 }
    ],
    sweets: [
        { name: 'Dark Chocolate', baseQuantity: 28, baseUnit: 'g', kcal: 155, protein: 1.4, carbs: 17, fat: 9, cost: 1.25 },
        { name: 'Cookies', baseQuantity: 2, baseUnit: 'pieces', kcal: 140, protein: 2, carbs: 20, fat: 6, cost: 0.75 },
        { name: 'Ice Cream', baseQuantity: 100, baseUnit: 'g', kcal: 207, protein: 3.5, carbs: 24, fat: 11, cost: 1.50 },
        { name: 'Brownies', baseQuantity: 1, baseUnit: 'piece', kcal: 240, protein: 3, carbs: 35, fat: 10, cost: 1.00 },
        { name: 'Fruit Sorbet', baseQuantity: 100, baseUnit: 'g', kcal: 120, protein: 0.5, carbs: 30, fat: 0, cost: 2.00 },
        { name: 'Muffin', baseQuantity: 1, baseUnit: 'piece', kcal: 180, protein: 3, carbs: 25, fat: 7, cost: 1.50 },
        { name: 'Granola Bar', baseQuantity: 1, baseUnit: 'bar', kcal: 120, protein: 2, carbs: 18, fat: 5, cost: 0.75 },
        { name: 'Yogurt Parfait', baseQuantity: 150, baseUnit: 'g', kcal: 140, protein: 6, carbs: 22, fat: 3, cost: 2.50 }
    ],
    extras: [
        { name: 'Olive Oil', baseQuantity: 1, baseUnit: 'tbsp', kcal: 119, protein: 0, carbs: 0, fat: 14, cost: 0.25 },
        { name: 'Coconut Oil', baseQuantity: 1, baseUnit: 'tbsp', kcal: 117, protein: 0, carbs: 0, fat: 14, cost: 0.30 },
        { name: 'Avocado', baseQuantity: 100, baseUnit: 'g', kcal: 160, protein: 2, carbs: 8.5, fat: 14.7, cost: 2.00 },
        { name: 'Peanut Butter', baseQuantity: 2, baseUnit: 'tbsp', kcal: 191, protein: 7, carbs: 8, fat: 16, cost: 0.50 },
        { name: 'Almond Butter', baseQuantity: 2, baseUnit: 'tbsp', kcal: 196, protein: 7, carbs: 6, fat: 18, cost: 1.00 },
        { name: 'Honey', baseQuantity: 1, baseUnit: 'tbsp', kcal: 64, protein: 0.1, carbs: 17.3, fat: 0, cost: 0.50 },
        { name: 'Maple Syrup', baseQuantity: 1, baseUnit: 'tbsp', kcal: 52, protein: 0, carbs: 13.4, fat: 0, cost: 0.75 }
    ]
};

// Category metadata
export const categoryMetadata = {
    protein: { emoji: '🥩', color: '#FF6B6B' },
    dairy: { emoji: '🥛', color: '#4ECDC4' },
    veg: { emoji: '🥬', color: '#95E77E' },
    fruit: { emoji: '🍎', color: '#FFD93D' },
    grains: { emoji: '🌾', color: '#B8860B' },
    nuts: { emoji: '🥜', color: '#8B4513' },
    carbs: { emoji: '🍠', color: '#FFA500' },
    drinks: { emoji: '☕', color: '#6FAADB' },
    sweets: { emoji: '🍫', color: '#FF69B4' },
    extras: { emoji: '🥑', color: '#98D8C8' }
};

// Helper functions for food database
export function getFoodByName(name) {
    for (const category in foodDatabase) {
        const food = foodDatabase[category].find(f => f.name === name);
        if (food) {
            return { ...food, category };
        }
    }
    return null;
}

export function getAllFoods() {
    const allFoods = [];
    for (const category in foodDatabase) {
        foodDatabase[category].forEach(food => {
            allFoods.push({ ...food, category });
        });
    }
    return allFoods;
}

export function getFoodsByCategory(category) {
    return foodDatabase[category] || [];
}