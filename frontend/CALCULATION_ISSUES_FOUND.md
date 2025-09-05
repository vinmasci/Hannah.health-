# Calculation Issues Found in Workflow

## 1. TDEE Calculation Inconsistencies

### Issue in AIUserAssessment.js (line 1292-1294):
```javascript
// Current problematic code:
const multiplier = this.userData.activityMultiplier || 1.3;
this.userData.tdee = Math.round(bmr * multiplier);
```

**Problem:** The activity multiplier is not being calculated consistently. It defaults to 1.3 but should be based on steps and exercise.

### Issue in NutritionWorkflow.js (line 590):
```javascript
const tdee = userData.tdee || (bmr * 1.5);
```

**Problem:** Different default multiplier (1.5 vs 1.3) causing inconsistency.

## 2. Steps Calories Not Being Added to TDEE

### Issue in AIUserAssessment.js:
The steps are being counted but not properly added to TDEE calculation.

**Should be:**
```javascript
const stepCalories = (this.userData.dailySteps || 0) * 0.04;
const baseActivityFactor = 1.2; // Sedentary baseline
const exerciseFactor = this.getExerciseFactor(); // 0 to 0.7
const tdee = bmr * baseActivityFactor + stepCalories + (bmr * exerciseFactor);
```

## 3. Macro Calculations Rounding Errors

### Issue in both files:
Macros are calculated but don't always add up to target calories due to rounding.

**Example:**
- Target: 1752 calories
- Protein: 30% = 525.6 cal → 131g × 4 = 524 cal
- Carbs: 35% = 613.2 cal → 153g × 4 = 612 cal
- Fat: 35% = 613.2 cal → 68g × 9 = 612 cal
- Total: 1748 cal (4 cal off)

## 4. Meal Distribution Errors

### Issue in AIMealPlan.js (lines 142-149):
```javascript
const breakfastCal = Math.round(targetCalories * 0.25);
const lunchCal = Math.round(targetCalories * 0.30);
const dinnerCal = Math.round(targetCalories * 0.30);
const snack1Cal = Math.round(targetCalories * 0.05);
const snack2Cal = Math.round(targetCalories * 0.05);
const snack3Cal = Math.round(targetCalories * 0.05);
```

**Problem:** Individual rounding causes total to not equal target.
- Each meal is rounded independently
- Sum of rounded values ≠ target calories

## 5. Food Module Calories Don't Match Meal Targets

### Issue in AIMealPlan.js (selectBreakfastItems, etc.):
Food items are selected but their calories don't add up to the meal's target calories.

**Example:**
- Breakfast target: 438 cal
- Actual items: Oatmeal (190) + Eggs (156) + Yogurt (97) = 443 cal

## 6. Data Transfer Between Steps

### Issue: Data is being recalculated at each step instead of passed through consistently:

1. **Step 1 → Step 2:** TDEE calculated differently in NutritionWorkflow
2. **Step 2 → Step 3:** targetCalories sometimes recalculated
3. **Step 3 → Step 4:** Meal calories don't match distribution

## Recommended Fixes:

### 1. Centralize Calculations
Create a single calculation service that all components use:

```javascript
class NutritionCalculator {
    static calculateBMR(weight, height, age, gender) {
        // Single source of truth
    }
    
    static calculateTDEE(bmr, steps, exercise) {
        // Consistent formula
    }
    
    static distributeMealCalories(targetCalories) {
        // Ensure sum equals target
    }
}
```

### 2. Fix Meal Distribution
```javascript
// Better approach - adjust last item for rounding
const meals = {
    breakfast: Math.round(targetCalories * 0.25),
    morningSnack: Math.round(targetCalories * 0.05),
    lunch: Math.round(targetCalories * 0.30),
    afternoonSnack: Math.round(targetCalories * 0.05),
    dinner: Math.round(targetCalories * 0.30)
};
const sum = Object.values(meals).reduce((a, b) => a + b, 0);
const eveningSnack = targetCalories - sum; // Absorbs rounding error
meals.eveningSnack = eveningSnack;
```

### 3. Match Food Items to Targets
```javascript
// Adjust portion sizes to hit calorie targets
function adjustPortionToTarget(foodItem, targetCalories) {
    const baseCalories = foodItem.kcal;
    const ratio = targetCalories / baseCalories;
    const adjustedQuantity = foodItem.baseQuantity * ratio;
    return {
        ...foodItem,
        quantity: Math.round(adjustedQuantity),
        actualCalories: Math.round(baseCalories * ratio)
    };
}
```

### 4. Pass Data Through EventBus Consistently
```javascript
// Single data structure passed through all steps
const workflowData = {
    assessment: { /* Step 1 data */ },
    calculations: {
        bmr: 1733,
        tdee: 2252,
        targetCalories: 1752,
        macros: { protein: 131, carbs: 153, fat: 68 }
    },
    preferences: { /* Step 3 data */ },
    mealPlan: { /* Step 4 data */ }
};
```

## Summary of Errors:
1. **TDEE multiplier inconsistency:** 1.3 vs 1.5
2. **Steps not added to TDEE:** Missing ~400 calories from 10k steps
3. **Macro rounding:** Up to 50 cal discrepancy
4. **Meal distribution rounding:** Up to 10 cal discrepancy
5. **Food portions not adjusted:** Meals off by 50-100 calories
6. **Data recalculated at each step:** Compounds errors

## Impact:
- Target calories can be off by 100-500 calories
- Meal plans don't match user's actual needs
- Day totals don't match targets
- User confusion about conflicting numbers