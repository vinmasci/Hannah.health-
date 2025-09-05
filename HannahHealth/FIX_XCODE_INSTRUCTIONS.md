# How to Fix Xcode Project

## Current Status
All the refactored files are now in ONE location:
`/HannahHealth/Features/MealPlan/`

## Files You Need to Add to Xcode:

### These are the NEW files (not in Xcode yet):
1. **DayCard.swift** - Component for each day's meals
2. **MealPlanHeader.swift** - Header component  
3. **MealPlanHelpers.swift** - Helper functions
4. **MealSlotCard.swift** - Individual meal slot component
5. **TimePickerSheet.swift** - Time picker component

### These files already exist (should already be in Xcode):
- MealPlanKanbanView.swift (updated)
- MealPlanTypes.swift (new)
- FoodSearchService.swift (new)
- MealPlanChatPanel.swift (existing)
- MealPlanChatViewModel.swift (existing)
- MealPlanView.swift (existing)
- MealPlanViewModel.swift (existing)

## Steps to Fix in Xcode:

1. **Open Xcode** with your HannahHealth project

2. **Remove any broken references** (red files):
   - If you see any red files in the MealPlan folder, right-click and "Delete" them (choose "Remove Reference")

3. **Add the new files**:
   - Right-click on the "MealPlan" folder in Xcode
   - Choose "Add Files to HannahHealth..."
   - Navigate to: `/Users/vincentmasci/Desktop/Kanban/HannahHealth/HannahHealth/Features/MealPlan/`
   - Select these 5 NEW files:
     - DayCard.swift
     - MealPlanHeader.swift
     - MealPlanHelpers.swift
     - MealSlotCard.swift
     - TimePickerSheet.swift
   - Make sure "Copy items if needed" is UNCHECKED (files are already there)
   - Make sure "Add to targets: HannahHealth" is CHECKED
   - Click "Add"

4. **If MealPlanTypes.swift and FoodSearchService.swift aren't in Xcode**:
   - Add them the same way as above

5. **Clean and Build**:
   - Menu: Product → Clean Build Folder (Cmd+Shift+K)
   - Menu: Product → Build (Cmd+B)

## What We Did:
- Broke up the 1,057-line MealPlanKanbanView.swift into smaller components
- Main file is now only 113 lines
- Created reusable components for better organization

## If You Still Have Issues:
The backup of your original files is at:
`/HannahHealth/Features/MealPlan_backup/`