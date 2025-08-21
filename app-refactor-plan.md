# App.js Refactoring Plan

## Overview
Refactor the monolithic `frontend/src/components/app.js` (1,618 lines) into modular, maintainable, and testable components.

## Current State Analysis

### File: `frontend/src/components/app.js`
- **Lines:** 1,618
- **Functions:** ~50+ functions
- **Global State:** DOM-based, window object dependencies
- **Main Responsibilities:**
  1. Food database management
  2. Drag-and-drop functionality
  3. UI component creation (food items, meals, recipes)
  4. Nutrition calculations
  5. Local storage operations
  6. Event handling
  7. DOM manipulation

## Target Architecture

```
frontend/src/
├── data/
│   └── foodDatabase.js          # Static food data
├── services/
│   ├── dragDropService.js       # Drag-drop logic
│   ├── nutritionCalculator.js   # Macro calculations
│   ├── storageService.js        # LocalStorage operations
│   └── unitConverter.js         # Unit conversion logic
├── components/
│   ├── FoodItem.js              # Food item creation/management
│   ├── FoodModule.js            # Food module in meals
│   ├── MealContainer.js         # Meal management
│   ├── RecipeContainer.js       # Recipe management
│   ├── DayColumn.js             # Day column logic
│   └── CategoryColumn.js        # Category column logic
├── utils/
│   ├── domHelpers.js            # DOM utility functions
│   └── idGenerator.js           # Unique ID generation
└── app.js                       # Main initialization (~200 lines)
```

## Refactoring Steps

### Phase 1: Extract Data (30 minutes)
**Priority: HIGH | Difficulty: EASY | Risk: LOW**

#### 1.1 Create `data/foodDatabase.js`
```javascript
// Extract food database object
export const foodDatabase = {
  protein: [...],
  dairy: [...],
  veg: [...],
  // ... all food categories
};

export const popularFoods = [...];
```

#### 1.2 Create `utils/constants.js`
```javascript
// Extract conversion factors and constants
export const conversionFactors = {
  tsp: { ml: 5, tbsp: 1/3, cup: 1/48 },
  // ... all conversions
};

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'];
export const DEFAULT_PORTIONS = { /* ... */ };
```

### Phase 2: Extract Pure Functions (1 hour)
**Priority: HIGH | Difficulty: EASY | Risk: LOW**

#### 2.1 Create `services/nutritionCalculator.js`
```javascript
export class NutritionCalculator {
  static calculateMacros(food, quantity, unit) { }
  static calculateTotals(foodItems) { }
  static getMacroPercentages(protein, carbs, fat) { }
  static formatCalories(kcal) { }
}
```

#### 2.2 Create `services/unitConverter.js`
```javascript
export class UnitConverter {
  static convert(value, fromUnit, toUnit) { }
  static getAvailableUnits(baseUnit) { }
  static getStepSize(unit) { }
  static getMinValue(unit) { }
}
```

### Phase 3: Extract UI Builders (2 hours)
**Priority: MEDIUM | Difficulty: MEDIUM | Risk: MEDIUM**

#### 3.1 Create `components/FoodItem.js`
```javascript
export class FoodItem {
  static create(food, category) { }
  static updatePortion(itemId, quantity, unit) { }
  static toggleExpand(itemId) { }
  static destroy(itemId) { }
}
```

#### 3.2 Create `components/FoodModule.js`
```javascript
export class FoodModule {
  static create(dragData, isPartOfRecipe = false) { }
  static update(moduleId, data) { }
  static remove(moduleId) { }
  static toggleExpand(moduleId) { }
  static toggleFavorite(moduleId) { }
}
```

#### 3.3 Create `components/MealContainer.js`
```javascript
export class MealContainer {
  static create(dayId, mealType) { }
  static addFood(mealId, foodData) { }
  static updateTotals(mealId) { }
  static toggleMinimize(mealId) { }
  static delete(mealId) { }
}
```

#### 3.4 Create `components/RecipeContainer.js`
```javascript
export class RecipeContainer {
  static create(name, recipeId) { }
  static addModule(recipeId, moduleData) { }
  static updateTotals(recipeId) { }
  static toggleCollapse(recipeId) { }
  static remove(recipeId) { }
}
```

### Phase 4: Extract Services (2 hours)
**Priority: HIGH | Difficulty: HARD | Risk: MEDIUM**

#### 4.1 Create `services/dragDropService.js`
```javascript
export class DragDropService {
  constructor() {
    this.draggedData = null;
    this.draggedElement = null;
  }
  
  initializeDragHandlers() { }
  handleDragStart(e, data) { }
  handleDragOver(e) { }
  handleDrop(e, targetType) { }
  handleDragEnd(e) { }
}
```

#### 4.2 Create `services/storageService.js`
```javascript
export class StorageService {
  static saveMealPlan(data) { }
  static loadMealPlan() { }
  static savePreferences(prefs) { }
  static loadPreferences() { }
  static clearAll() { }
}
```

### Phase 5: Create Main App Controller (1 hour)
**Priority: HIGH | Difficulty: MEDIUM | Risk: LOW**

#### 5.1 Refactor `app.js`
```javascript
import { foodDatabase } from './data/foodDatabase.js';
import { DragDropService } from './services/dragDropService.js';
import { NutritionCalculator } from './services/nutritionCalculator.js';
import { FoodItem } from './components/FoodItem.js';
import { MealContainer } from './components/MealContainer.js';
// ... other imports

class MealPlannerApp {
  constructor() {
    this.dragDropService = new DragDropService();
    this.initialize();
  }
  
  initialize() {
    this.loadSavedData();
    this.setupEventListeners();
    this.initializeDays();
    this.renderUI();
  }
  
  // Orchestration methods only
}

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  window.mealPlannerApp = new MealPlannerApp();
});
```

## Testing Strategy

### Unit Tests (for each module)
```javascript
// Example: nutritionCalculator.test.js
describe('NutritionCalculator', () => {
  test('calculates macros correctly', () => {
    const result = NutritionCalculator.calculateMacros(food, 100, 'g');
    expect(result.protein).toBe(31);
  });
});
```

### Integration Tests
- Test drag-drop flow
- Test meal plan save/load
- Test recipe creation

## Migration Checklist

- [ ] Create folder structure
- [ ] Extract foodDatabase.js
- [ ] Extract constants.js
- [ ] Create NutritionCalculator
- [ ] Create UnitConverter
- [ ] Create FoodItem component
- [ ] Create FoodModule component
- [ ] Create MealContainer component
- [ ] Create RecipeContainer component
- [ ] Create DragDropService
- [ ] Create StorageService
- [ ] Refactor main app.js
- [ ] Update index.html script imports
- [ ] Test all functionality
- [ ] Remove old app.js.OLD

## Success Criteria

1. **File Size:** No file over 300 lines
2. **Testability:** Each module independently testable
3. **Maintainability:** Clear separation of concerns
4. **Performance:** No regression in app performance
5. **Functionality:** All features working as before

## Risk Mitigation

1. **Keep backup:** app.js.OLD already created
2. **Test incrementally:** Test after each extraction
3. **Use git branches:** Create feature branch for refactor
4. **Maintain compatibility:** Keep window exports temporarily

## Time Estimate

- **Total Time:** 6-8 hours
- **Phases 1-2:** 1.5 hours (Easy wins)
- **Phases 3-4:** 4 hours (Core refactoring)
- **Phase 5:** 1 hour (Integration)
- **Testing:** 1-2 hours

## Next Steps After Refactor

1. Add TypeScript definitions
2. Implement proper state management (Zustand/Redux)
3. Convert to React components
4. Add comprehensive testing
5. Remove jQuery-style patterns

---

**Ready to start?** Begin with Phase 1 - extracting the food database for a quick win!