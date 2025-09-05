# Add Missing Component Files to Xcode

The following files need to be added to your Xcode project:

## Files to Add

Navigate to the project navigator in Xcode and add these files to the **Dashboard** group:

### In Features/Dashboard/Components folder:
1. `CaloriesProgressCalculator.swift`
2. `CaloriesSegmentDetails.swift` 
3. `CaloriesDisplayComponents.swift`

## Steps:
1. Open HannahHealth.xcodeproj in Xcode
2. Right-click on the "Dashboard" folder under Features
3. Select "Add Files to HannahHealth..."
4. Navigate to `HannahHealth/Features/Dashboard/Components/`
5. Select all 3 files listed above
6. Make sure "Copy items if needed" is UNCHECKED (files already exist)
7. Make sure "HannahHealth" target is checked
8. Click "Add"

## Alternative: Drag and Drop
1. Open Finder to `HannahHealth/Features/Dashboard/Components/`
2. Select the 3 files
3. Drag them into Xcode's Dashboard group
4. Make sure the HannahHealth target is selected

After adding these files, the build errors should be resolved.