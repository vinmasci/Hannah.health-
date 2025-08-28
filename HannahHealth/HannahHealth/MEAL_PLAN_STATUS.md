# Meal Plan Feature Status

## Current State
The meal plan feature has been refactored to support dynamic snacks but has several incomplete implementations.

## What's Working
✅ UI displays correctly with glass morphic styling
✅ Multi-selection of meal slots
✅ Chat panel with Hannah interface
✅ Add/remove snack buttons
✅ String literal compilation errors fixed

## What's Broken/Incomplete

### 1. Data Storage (Critical)
**Location**: `MealPlanChatViewModel.swift` lines 216-253
- All meal management methods are stubs returning nil or doing nothing
- `setMeal()`, `clearMeal()`, `getMeal()` have no implementation
- `getSnack()`, `setSnack()`, `removeSnack()` have no implementation
- No actual data model or storage mechanism

### 2. Snack Count Management
**Location**: `MealPlanViewModel.swift` line 232-236
- `getSnackCount()` always returns 1
- No persistence of snack counts per day
- No state management for tracking snacks

### 3. Chat Actions Don't Update UI
**Location**: `MealPlanChatViewModel.swift` lines 76-170
- Chat processes commands but doesn't actually update meal data
- Mock meals are created but not stored
- UI won't reflect changes made through chat

### 4. Drag and Drop
**Location**: `MealPlanKanbanView.swift` lines 144-148
- `.onDrag` implemented but no `.onDrop` handler
- No reordering logic implemented
- NSItemProvider created but not consumed

### 5. Week Navigation
**Location**: `MealPlanKanbanView.swift` lines 78-81
- Calendar button exists but has empty action
- No week selector implementation
- Always shows current week

## Required Fixes

### Priority 1: Implement MealPlanViewModel
Create actual data storage in `MealPlanViewModel.swift`:
```swift
@Published private var meals: [DayOfWeek: [MealType: Meal]] = [:]
@Published private var snacks: [DayOfWeek: [Meal]] = [:]
```

### Priority 2: Connect Chat to Data
Update `MealPlanChatViewModel` extension methods to:
- Actually store meals in the view model
- Update published properties to trigger UI updates
- Return real data from getter methods

### Priority 3: Persist Data
Add Core Data or UserDefaults persistence:
- Save meal plans between app launches
- Track historical meal data
- Enable meal plan templates

### Priority 4: Complete Drag/Drop
Add drop handlers for:
- Reordering meals within a day
- Moving meals between days
- Swapping meal positions

### Priority 5: Week Navigation
Implement calendar functionality:
- Week picker modal
- Date range calculations
- Historical week viewing

## Testing Needed
1. Add a meal through chat and verify it appears
2. Remove a snack and verify count updates
3. Multi-select and batch update meals
4. Restart app and check persistence
5. Drag meals to reorder