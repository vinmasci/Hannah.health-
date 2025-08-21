// Unit conversion factors for recipe calculations
export const unitConversions = {
    'g': { 'oz': 0.035274, 'lb': 0.00220462, 'kg': 0.001, 'cup': 0.00423, 'tbsp': 0.0667, 'tsp': 0.2 },
    'oz': { 'g': 28.3495, 'lb': 0.0625, 'kg': 0.0283495, 'cup': 0.12, 'tbsp': 1.89, 'tsp': 5.67 },
    'lb': { 'g': 453.592, 'oz': 16, 'kg': 0.453592, 'cup': 1.92, 'tbsp': 30.24, 'tsp': 90.72 },
    'kg': { 'g': 1000, 'oz': 35.274, 'lb': 2.20462, 'cup': 4.23, 'tbsp': 66.7, 'tsp': 200 },
    'cup': { 'g': 236.588, 'oz': 8.33, 'lb': 0.521, 'kg': 0.237, 'tbsp': 16, 'tsp': 48, 'ml': 236.588 },
    'tbsp': { 'g': 14.787, 'oz': 0.529, 'lb': 0.0326, 'kg': 0.0148, 'cup': 0.0625, 'tsp': 3, 'ml': 14.787 },
    'tsp': { 'g': 4.929, 'oz': 0.176, 'lb': 0.0109, 'kg': 0.00493, 'cup': 0.0208, 'tbsp': 0.333, 'ml': 4.929 },
    'ml': { 'cup': 0.00423, 'tbsp': 0.0676, 'tsp': 0.203, 'fl oz': 0.0338 },
    'fl oz': { 'ml': 29.574, 'cup': 0.125, 'tbsp': 2, 'tsp': 6 },
    'unit': { 'unit': 1 },
    'medium': { 'small': 1.5, 'large': 0.75, 'medium': 1 },
    'large': { 'small': 2, 'medium': 1.33, 'large': 1 },
    'small': { 'medium': 0.67, 'large': 0.5, 'small': 1 },
    'slice': { 'slice': 1 },
    'piece': { 'piece': 1 }
};

// Meal types
export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];

// Day names
export const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

// Default portion sizes for quick adding
export const DEFAULT_PORTIONS = {
    protein: { quantity: 100, unit: 'g' },
    dairy: { quantity: 100, unit: 'g' },
    veg: { quantity: 100, unit: 'g' },
    fruit: { quantity: 1, unit: 'medium' },
    grains: { quantity: 100, unit: 'g' },
    nuts: { quantity: 28, unit: 'g' },
    carbs: { quantity: 100, unit: 'g' },
    drinks: { quantity: 250, unit: 'ml' },
    sweets: { quantity: 1, unit: 'piece' },
    extras: { quantity: 1, unit: 'tbsp' }
};

// Macro colors for visual display
export const MACRO_COLORS = {
    protein: '#48bb78',
    carbs: '#ecc94b',
    fat: '#9f7aea',
    kcal: '#718096'
};

// Input constraints
export const INPUT_CONSTRAINTS = {
    minQuantity: 0.1,
    maxQuantity: 9999,
    stepSizes: {
        'g': 1,
        'oz': 0.1,
        'lb': 0.01,
        'kg': 0.001,
        'cup': 0.25,
        'tbsp': 0.5,
        'tsp': 0.25,
        'ml': 1,
        'fl oz': 0.1,
        'unit': 1,
        'slice': 1,
        'piece': 1,
        'small': 1,
        'medium': 1,
        'large': 1,
        'bar': 1
    }
};

// Local storage keys
export const STORAGE_KEYS = {
    mealPlan: 'hannah-meal-plan',
    favorites: 'hannah-favorites',
    preferences: 'hannah-preferences',
    recipes: 'hannah-recipes'
};