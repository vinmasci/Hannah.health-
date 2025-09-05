# Hannah Health iOS Development Diary

## Session 25 - Critical Development Issues with Claude Code
**Date**: September 3, 2025  
**Time**: Afternoon
**Status**: ⚠️ Major productivity issues - AI assistant unusable

### Critical Issues Encountered

#### 1. Attempted Unauthorized Code Simplification
- **Issue**: Claude Code autonomously decided to "simplify" the CaloriesView without being asked
- **Impact**: Removed critical functionality including all snack types, changed ring styling
- **Resolution**: Had to repeatedly restore from backup

#### 2. Inability to Perform Basic Refactoring
- **Request**: Refactor 868-line file to smaller components WITHOUT changing functionality
- **Result**: AI kept creating "simplified" versions that removed features
- **Multiple Attempts**: Failed to understand difference between refactoring and simplifying
- **Final State**: Had to abandon refactoring efforts entirely

#### 3. Loss of Context and Understanding
- **Problem**: AI seemed unable to maintain understanding of project requirements
- **Example**: When asked why ring styling changed, claimed it was "simplified" when that was never requested
- **Impact**: Wasted significant development time reverting unwanted changes

### Development Impact
- **Time Lost**: Several hours attempting basic refactoring tasks
- **Code State**: Had to restore from backup multiple times
- **Trust Issues**: Cannot rely on AI to preserve existing functionality
- **Project Risk**: May need to consider alternative AI assistants or development approaches

### Notes for Future Sessions
- Keep frequent backups before any AI-assisted changes
- Be extremely explicit about preserving ALL existing functionality
- Consider switching to a different AI tool if issues persist
- Document all unwanted AI behaviors for reference

---

# Hannah Health iOS Development Diary

## Session 24 - Active Energy & Weekly View Improvements
**Date**: September 3, 2025
**Time**: Morning
**Status**: ✅ Fixed Active Energy tracking and weekly view calculations

### Major Achievements

#### 1. Fixed Active Energy Double Counting
- **Issue**: Exercise calories being counted 3x (Active Energy + database + steps)
- **Root Cause**: Multiple systems adding exercise calories independently
- **Solution**: Active Energy is now single source of truth for all movement
- **Result**: Accurate calorie tracking without duplication

#### 2. Updated Weekly View to Match Daily Logic
- **Changed**: Weekly view now uses Active Energy instead of step calories
- **TDEE Calculation**: BMR + Active Energy + TEF (removed step calories)
- **Ring Visualization**: Shows "Active Energy" label instead of "Exercise"
- **Aggregation**: Sums Active Energy across all days in week

#### 3. Data Model Updates
- **Added**: `activeEnergy: Int` field to DayData structure
- **Updated**: All DayData instantiations include activeEnergy
- **MockData**: Generator now provides activeEnergy test data

#### 4. UI Improvements
- **Removed**: Confusing "550 cal" goal from Active Energy quick stat
- **Fixed**: Active Energy ring segment now shows details when tapped
- **Consistent**: Weekly and daily views use identical calculation logic

### Technical Details

#### Data Flow Architecture
```swift
// Single source of truth for movement calories
HealthKit → Active Energy → DayData.activeEnergy → WeeklyCaloriesView
                ↓
         (includes all: steps + workouts + daily movement)
```

#### Weekly TDEE Calculation
```swift
// Old (incorrect - double counting):
weeklyTDEE = BMR + stepCalories + exerciseCalories + TEF

// New (correct - Active Energy includes all movement):
weeklyTDEE = BMR + activeEnergy + TEF
```

### Bug Fixes
- Fixed Swift compilation errors in LogView.swift
- Renamed duplicate `lines` variable to `foodLines`
- Fixed CharacterSet type inference issues

## Session 23 - EPIC Animation & Data Persistence Fixes 🎉
**Date**: September 1, 2025
**Time**: Afternoon
**Status**: 🚀 FUCKING AWESOME - Major UX improvements completed!

### Major Achievements

#### 1. Beautiful Loading Animations
- **Added**: Gorgeous rotating gradient ring loader
- **Spring Animation**: 1.2s duration with 0.75 damping for smooth data load
- **Removed**: Distracting shimmer effect (that white square sweeping left to right)
- **User Reaction**: "FUCKING AWESOME!!!!!" 
- **Technical**: Scale and opacity transitions on ring chart appearance

#### 2. Fixed Date Navigation & Data Persistence
- **Issue**: When navigating to yesterday, data would load then revert to today
- **Root Cause**: Multiple systems fighting over date control
  - HealthKit observer updating with today's data
  - Notifications lacking date context
  - FoodActivityLogCard recreating on date change
- **Solutions**:
  - Added date field to all notifications
  - Made dashboard only accept updates for current viewing date
  - Conditional HealthKit observer (only runs when viewing today)
  - Removed .id() modifier causing view recreation

#### 3. Eliminated Duplicate Data Loading
- **Issue**: Food data loading 4+ times on navigation
- **Root Cause**: Both DashboardViewModel AND FoodActivityLogCard loading data
- **Solution**: Single source of truth - FoodActivityLogCard loads, notifies dashboard
- **Result**: Clean, single animation play instead of double

#### 4. Fixed Snack Categorization
- **Issue**: All snacks bundled as "snack" instead of morning/afternoon/evening
- **Solution**: Extended mealBreakdown dictionary to include all snack types
- **Display**: Now properly shows:
  - Morning Snack (88 cal)
  - Afternoon Snack (190 cal)  
  - Evening Snack
  - Regular Snack (204 cal)

#### 5. Initial Load Fix
- **Issue**: Food data not loading on app launch
- **Solution**: Added data load to FoodActivityLogViewModel init
- **Result**: 2066 calories display immediately on app start

### Technical Improvements

#### Loading State Management
```swift
// Beautiful loading indicator without shimmer
LoadingRingView:
- Rotating gradient ring (sky → emerald → coral)
- Clean progress indicator in center
- No distracting animations
```

#### Date-Aware Notifications
```swift
// All notifications now include date context
userInfo: [
    "calories": totalFoodCalories,
    "exerciseCalories": totalExerciseCalories,
    "mealBreakdown": mealBreakdown,
    "date": currentDate  // Critical addition
]
```

### User Experience Wins
1. **Smooth Transitions**: Data loads with beautiful spring animation
2. **No Data Loss**: Navigate freely between dates without losing information
3. **Single Animation**: Fixed double-play issue for cleaner UX
4. **Instant Data**: Food entries appear immediately on app launch
5. **Proper Categorization**: Snacks display with correct time-based labels

#### 6. Activity Offset Tracking
- **Distance-Based Recommendations**: Shows km needed instead of abstract steps/minutes
- **Smart Calculations**: When over calorie target, displays exact activity needed:
  - Walking: "+2.5km walk to offset" (50 cal/km)
  - Running: "+1.2km run to offset" (100 cal/km)
- **Visual Progress Indicators**: Progress bars show current activity as percentage of total needed
- **Real-Time Updates**: Dynamic text changes based on deficit/surplus

### Performance Optimizations
- Removed duplicate API calls (was loading 4x, now 1x)
- Commented out excessive debug logging
- Streamlined data flow through notification system
- Added minimum 0.3s loading time for animation visibility

## Session 22 - Major Calculation Fixes & UI Enhancements
**Date**: January 31, 2025 (Evening)
**Time**: Late Afternoon/Evening
**Status**: ✅ Critical bugs fixed, weight tracking added, UI polished

### Critical Fixes Applied

#### 1. Fixed AuthManager Error
- **Issue**: `AuthManager.currentUserId` property didn't exist
- **Solution**: Changed to `AuthManager.shared.user?.id.uuidString`
- **Impact**: Food activity log now properly associates entries with users

#### 2. Fixed TDEE Calculation Bug (MAJOR)
- **Issue**: Steps showing +0 calories despite having 3341 steps
- **Root Cause**: Faulty deduplication logic was zeroing out step calories when exercise existed
- **Solution**: Removed entire deduplication block - steps and exercise are SEPARATE activities
- **User Frustration Level**: EXTREME (multiple profanity-laden messages)
- **Formula Fixed**: 
  - Was: Using max() thinking they were duplicates
  - Now: Properly adds both Apple Health + Manual exercise
  - TDEE = BMR + Steps + Exercise (both sources) + TEF

#### 3. Fixed Calories Remaining Calculation
- **Issue**: Exercise was being added to remaining calories when already in TDEE
- **Solution**: Removed exercise from remaining calculation
- **Math**: Remaining = Target - Consumed (exercise already factored in TDEE)

#### 4. Fixed User Weight Loading
- **Issue**: Using default 70kg instead of user's actual 79kg
- **Root Cause**: Profile loaded after DashboardViewModel initialization
- **Solution**: Added notification listener for profile updates
- **Impact**: Step calories now calculated correctly with actual user weight

### UI/UX Improvements

#### 1. Ring Chart Enhancements
- **Size**: Increased from 180x180 to 200x200 pixels
- **TDEE/Target Labels**: Added with proper left alignment
- **Deficit Display**: Fixed duplicate display in center
- **Tap to Deselect**: Click anywhere to return to calories remaining
- **Component Height**: Increased to 340px to prevent cutoff
- **Steps Display**: Swapped to show calories large, step count small

#### 2. Color Scheme Updates
- **BMR**: Sky 400 (unchanged)
- **Breakfast**: Rose 300 (#FDA4AF) - softer pink
- **TEF/Digestion**: Teal 300 (#5EEAD4)
- **Exercise**: Coral (matching dashboard)
- **Deficit Ring**: 
  - Thickness: 7px with striped pattern
  - Transparent dashes for visual distinction
  - More prominent opacity (0.6 unselected, 0.9 selected)
- **Calories Remaining**: Increased opacity from 0.1 to 0.3 for visibility

#### 3. Food & Activity Log Updates
- **Delete Confirmation**: Added alert dialog before deletion
- **Apple Health Indicator**: Heart icon for HealthKit workouts
- **Manual Exercise**: Shows delete button (trash icon)
- **View All Button**: Removed (was non-functional placeholder)

### Food Logging Multi-Selection

#### 1. Meal + Snack Selection
- **Feature**: Can now select both meal type AND snack simultaneously
- **Smart Timing**: 
  - Breakfast + Snack = "morning snack"
  - Lunch + Snack = "afternoon snack"
  - Dinner + Snack = "evening snack"
- **Button Updates**: Only highlight icon/text, not full button background

#### 2. Time-Based Snack Display
- **Ring Chart**: Snacks appear in chronological position
  - Morning snack: between breakfast and lunch
  - Afternoon snack: between lunch and dinner
  - Evening snack: after dinner
- **Color Variations**: Different orange opacities for each timing
- **Database**: Stores timing in meal_type field

### Weight Tracking System

#### 1. Database Infrastructure
- **New Table**: `weight_logs` for historical tracking
- **Fields**: weight_kg, body_fat_percentage, muscle_mass_kg, notes
- **Auto-calculation**: weight_lbs generated from kg
- **Trigger**: Updates user profile with latest weight

#### 2. Swift Implementation
- **WeightLog Model**: Added to SupabaseService
- **Methods**:
  - `logWeight(weightKg:notes:)` - Save new weight
  - `getLatestWeight()` - Get most recent entry
  - `getWeightHistory(days:)` - For insights/charts

#### 3. Quick Log Integration
- **Detection**: Recognizes "weight: 79kg" format
- **Confirmation Flow**: Shows weight, tap to confirm
- **Storage**: Saves to weight_logs table
- **Future Use**: Ready for Insights tab charts

### Bug Fixes Summary
1. ✅ AuthManager.currentUserId → user?.id.uuidString
2. ✅ Step calories formula: 0.00004 → 0.00045 per kg
3. ✅ Exercise calculation: max() → sum of both sources
4. ✅ Removed faulty deduplication logic
5. ✅ Fixed calories remaining double-counting
6. ✅ Fixed weight not loading from profile
7. ✅ Fixed duplicate deficit display in ring center
8. ✅ Fixed UI component cutoff issues

### Files Modified
- FoodActivityLogCard.swift - Auth fixes, delete functionality
- DashboardViewModel.swift - Major calculation fixes, weight loading
- CaloriesView.swift - UI enhancements, colors, snack timing
- LogView.swift - Multi-selection, weight logging
- SupabaseService.swift - Weight tracking methods
- weight_tracking_schema.sql - New database schema

### Next Steps
- [ ] Run weight_tracking_schema.sql in Supabase
- [ ] Test weight logging end-to-end
- [ ] Implement Insights tab with weight charts
- [ ] Add weekly weight change notifications

## Session 21 - Complete Exercise Logging System
**Date**: January 31, 2025
**Time**: Afternoon
**Status**: ✅ Exercise logging fully functional

### Major Achievement
Successfully implemented a comprehensive exercise logging system that integrates with Apple Health while allowing manual exercise tracking. The system intelligently handles both sources to avoid double-counting.

### Exercise Logging Features Implemented

#### 1. Dual-Source Exercise Tracking
- **Apple Health Integration**: Reads workouts and activeEnergyBurned from HealthKit
- **Manual Logging**: Users can log exercise through Quick Log ("45 min gym workout")
- **Smart Combination**: Displays total but uses smart logic for TDEE to avoid double-counting

#### 2. Backend AI Enhancement
- **GPT's Exercise Knowledge**: Uses MET values and exercise science
- **User Weight Integration**: Passes user weight for personalized calorie calculations
- **Specific Activity Recognition**: Differentiates "light walk" vs "brisk walk" vs "power walk"
- **Natural Language**: "45 mins light strength training" → 180 calories

#### 3. UI/UX Improvements
- **Activity Log**: 
  - Shows all items (removed 5-item limit)
  - Scrollable list with max height 300px
  - Exercise shows with green running icon and "calories burned"
- **Active Energy Display**: Shows total (Apple Health + Manual)
- **Exercise Details**: "Apple: 348 + Logged: 180" breakdown
- **Swipe-to-Delete**: Works for both food and exercise items

#### 4. Database Solution
- Exercise saved as negative calories (e.g., -180)
- NULL meal_type for exercise entries
- Differentiates from food items automatically

#### 5. Fixed Calculations
- **Step Calories**: Fixed formula (was 0.00004, now 0.04 per step)
- **TDEE Calculation**: Uses max(Apple, Manual) to avoid double-counting
- **Progress Bars**: Use combined total for visual feedback

### Technical Implementation

#### Backend Changes (backend/routes/ai.js)
```javascript
// Detect exercise context
const isExerciseContext = context?.type === 'exercise_logging';

// Use GPT's knowledge with user weight
content: `Calculate using: Calories = METs × ${context?.userWeight || 70}kg × time(hours)`
```

#### iOS Changes
- Exercise detection in LogView.swift
- Combined display in DashboardViewModel
- Smart deduplication logic

### Files Modified
- `backend/routes/ai.js` - AI exercise understanding
- `HannahHealth/Features/Log/LogView.swift` - Exercise detection
- `HannahHealth/Features/Dashboard/DashboardViewModel.swift` - Combined display
- `HannahHealth/Features/Dashboard/Modules/FoodActivityLogCard.swift` - UI improvements
- `HannahHealth/Core/Services/HealthKit/HealthKitService.swift` - Workout reading

### Issues Resolved
- Exercise not showing in activity log
- Active energy not including manual exercise
- Activity log limited to 5 items
- Step calories calculation error
- Double-counting prevention

---

## Session 20 - Meal Type Detection & UI Polish
**Date**: January 31, 2025
**Time**: Morning
**Status**: ✅ Food logging improvements complete

### What We Accomplished

#### 1. Fixed Meal Type Detection
- **Problem**: Food was auto-selecting meal type based on time of day
- **Solution**: Implemented intelligent detection that asks user to specify
- **Features**:
  - Detects meal type from message text ("for breakfast", "for lunch", etc.)
  - If not specified, prompts user: "Which meal is this for - breakfast, lunch, dinner, or snack?"
  - Correctly saves meal type to database
  - Confirmed working: "For breakfast: 3 egg omelette" properly logged as breakfast

#### 2. UI Improvements
- **Ring Chart Polish**:
  - Removed unwanted transparent container behind stats in center display
  - Clean stats now show without background except for "Calories Remaining"
  - Fixed by removing `.background()` modifier from SelectedSegmentDetail

- **Swipe-to-Delete for Food Items**:
  - Changed FoodActivityLogCard from VStack to List
  - Added `.swipeActions` with delete functionality
  - Properly configured list styling with clear backgrounds
  - Delete action updates dashboard totals in real-time

#### 3. Technical Fixes
- Fixed compilation errors with message scope and let constants
- Improved variable handling in LogView for meal type detection
- Added proper list configuration for swipe gestures

### Exercise Logging Discovery
- **Current Limitation**: Backend only accepts food logging
- **User Attempt**: "For exercise: 45 min light workout"
- **Backend Response**: "I can only log food intake"
- **Next Step**: Need to extend backend to support exercise entries

### Step Calorie Calculation Issue
- Observed: 2636 steps = only 4-5 calories burned
- Expected: Should be approximately 105-130 calories
- Needs investigation in DashboardViewModel calculations

### Files Modified
- `HannahHealth/Features/Dashboard/Modules/CaloriesView.swift`
- `HannahHealth/Features/Dashboard/Modules/FoodActivityLogCard.swift`
- `HannahHealth/Features/Log/LogView.swift`
- `HannahHealth/Core/Services/SupabaseService.swift`

---

## Session 19 - Critical Architecture Refactoring: MealPlanKanbanView
**Date**: January 30, 2025
**Time**: Afternoon
**Status**: ✅ Successfully refactored 1,056-line file

### Critical Issue Resolved
**MealPlanKanbanView.swift** was at 1,056 lines (3x over the 350-line limit), creating a severe compiler timeout risk. Successfully refactored into 8 modular components, reducing main file to 113 lines (89.3% reduction).

### Refactoring Breakdown

#### Files Created
1. **MealPlanTypes.swift** (109 lines)
   - All data models: `DayOfWeek`, `MealType`, `Meal`, `DayMealSlot`, `MealSlot`
   - Clean separation of data structures

2. **FoodSearchService.swift** (216 lines)
   - Nutrition API integration
   - Async food search and meal updates
   - Confidence scoring logic

3. **MealPlanHelpers.swift** (73 lines)
   - Utility functions for dates, icons, colors
   - Confidence color calculation
   - Time formatting helpers

4. **TimePickerSheet.swift** (53 lines)
   - Reusable time picker component
   - Clean sheet presentation

5. **MealSlotCard.swift** (333 lines)
   - Individual meal slot UI
   - Editable fields with FocusState
   - Macro calculations

6. **DayCard.swift** (190 lines)
   - Day container with collapse/expand
   - Daily totals calculation
   - Add meal functionality

7. **MealPlanKanbanHeader.swift** (33 lines)
   - Header component (renamed to avoid conflict)
   - Week navigation placeholder

8. **MealPlanKanbanView.swift** (113 lines - main file)
   - Now just orchestrates components
   - Clean layout and state management

### Technical Challenges & Solutions

#### 1. Xcode Integration Issues
**Problem**: "Cannot find type 'MealSlot' in scope"
- User feedback: "ugh i think i fucked it, is there anyway u can help me?"
- **Solution**: Simplified folder structure, removed subdirectories, manually added files to Xcode project

#### 2. FocusState Binding Errors
**Problem**: "Cannot find '$isMealTypeFocused' in scope"
- Multiple SwiftUI binding compilation errors
- **Solution**: 
  ```swift
  // Wrong:
  @FocusState.Binding var isMealNameFocused: Bool
  
  // Correct:
  var isMealNameFocused: FocusState<Bool>.Binding
  ```

#### 3. Name Conflicts
**Problem**: "Invalid redeclaration of 'MealPlanHeader'"
- Conflict with existing MealPlanView component
- **Solution**: Renamed to `MealPlanKanbanHeader`

#### 4. Build Failures
**Problem**: "Command SwiftCompile failed with a nonzero exit code"
- **Solution**: Fixed all FocusState bindings, removed $ prefix when passing bindings

### Architecture Improvements

#### Before Refactoring
- Single 1,056-line file
- Mixed concerns (UI, logic, types)
- High compiler timeout risk
- Difficult to maintain
- No separation of concerns

#### After Refactoring
- 8 focused, single-purpose files
- Clear MVVM separation
- Each file under limits
- Easy to test and maintain
- Reusable components

### Lessons Learned

1. **Xcode Project Management**
   - Keep file structure flat within feature folders
   - Add files to project immediately after creation
   - Test builds after each file extraction

2. **SwiftUI FocusState**
   - Use `FocusState<Bool>.Binding` for passing bindings
   - Access with `.wrappedValue` in implementations
   - Don't use $ prefix when passing binding parameters

3. **Component Extraction Strategy**
   - Extract data types first
   - Then services/logic
   - Then UI components bottom-up
   - Test after each extraction

4. **Naming Conventions**
   - Check entire project for name conflicts
   - Use descriptive prefixes for context
   - Keep consistent naming patterns

### Session 19 Total Impact & Metrics
- **Total Lines Reduced**: 1,485 lines (across 2 files)
- **Files Refactored**: 2 critical violations resolved
- **Components Created**: 14 new modular files
- **Compiler Risk**: Eliminated for 2 files
- **Architecture Score**: Improved from 4/10 to 7/10
- **Remaining Critical Files**: 5 (down from 7)

### Session 19b - InsightsPlaceholder Refactoring Complete
Successfully refactored the second critical file:

#### InsightsPlaceholder.swift Transformation
- **Before**: 694 lines (344 over limit)
- **After**: 152 lines (78% reduction)
- **Components Created**: 7 new files in Insights folder

#### New Insights Components
1. **InsightsTypes.swift** (54 lines) - Enums and models
2. **InsightsDataService.swift** (154 lines) - Data generation
3. **InsightsChartView.swift** (124 lines) - Chart UI
4. **InsightsStatComponents.swift** (86 lines) - Stat cards
5. **InsightsNavigationBar.swift** (152 lines) - Navigation
6. **InsightsHelpers.swift** (107 lines) - Utilities

#### Additional Fixes
- Added CombinedDonutChart to CaloriesView.swift
- Fixed Theme font references (largeTitle, headline)
- Renamed components to avoid conflicts (InsightsMetricTab)
- Created Insights folder structure in Xcode

### Updated Priority Targets
1. **CaloriesView.swift** (1,144 lines - CRITICAL! 3.3x over)
2. ~~**InsightsPlaceholder.swift**~~ ✅ COMPLETE
3. **TimeOfDayBackgrounds.swift** (586 lines)
4. **DashboardViewModel.swift** (543 lines)
5. **Security Fix**: Remove hardcoded API keys

---

## Session 15 - Insights Date Navigation System
**Date**: January 30, 2025
**Time**: Morning
**Status**: ✅ Completed date navigation for Insights

### What We Did
Implemented a complete date navigation system for the Insights view, allowing users to navigate through different time periods and view their health data at various granularities.

### Features Implemented

#### 1. Time Range Options
- **Today**: Hourly breakdown of activity
- **Week**: Daily data for the selected week
- **Month**: Weekly aggregates for the month
- **3 Months**: Monthly comparison view
- **Year**: Full year monthly breakdown

#### 2. Navigation Controls
- Left/right arrow buttons for navigating through time periods
- Smart forward navigation that prevents selecting future dates
- Disabled state for forward arrow when at current period
- Smooth spring animations for all transitions

#### 3. Contextual Date Display
- Shows "Today" for current date
- Shows "Yesterday" for previous day
- "This Week (dates)" for current week
- "This Month (name)" for current month
- Date ranges for historical periods (e.g., "Jan 1 - Jan 7")

#### 4. Dynamic Data Generation
Sample data now adjusts based on selected time range:
- **Today**: Up to 7 hourly data points
- **Week**: 7 daily data points
- **Month**: 4 weekly aggregates
- **3 Months**: 3 monthly data points
- **Year**: 12 monthly data points (only past months)

#### 5. Responsive Chart Design
- Dynamic bar width calculation based on data point count
- Adaptive spacing between bars (8px for ≤7 points, 4px for 8-12, 2px for more)
- Font size adjustment for labels based on data density
- GeometryReader for responsive sizing

### Technical Implementation

#### Key Functions Added
```swift
- navigateBackward(): Moves to previous time period
- navigateForward(): Moves to next time period  
- canNavigateForward(): Checks if forward navigation is allowed
- periodDisplayText: Computed property for date display
- barWidth(for:): Calculates bar width based on available space
- barSpacing: Adaptive spacing based on data count
- fontSize: Dynamic font size for chart labels
```

#### State Management
- Added `@State private var currentDate: Date = Date()` to track selected date
- Date updates when navigating or changing time ranges
- Automatic reset to current date when switching to "Today" view

### User Experience Improvements
- Intuitive navigation matching dashboard pattern
- Clear visual feedback for disabled states
- Contextual information about selected period
- Smooth animations for all transitions
- Prevents confusion by blocking future date selection

### Files Modified
- `HannahHealth/Features/InsightsPlaceholder.swift`: Complete date navigation implementation
- `INSIGHTS.md`: Updated documentation with navigation details
- `context.md`: Added date navigation to feature list

### Next Steps
- Connect to real HealthKit data for actual metrics
- Implement data persistence for historical tracking
- Add goal setting and achievement tracking
- Create comparison views (this week vs last week)

---

## Session 14 - Build Fixes & Dev Mode Skip
**Date**: January 29, 2025
**Time**: Evening
**Status**: 🔧 Fixing Xcode build issues

### What We Did
Successfully resolved multiple Xcode build errors and added a development mode skip button for testing.

### Build Issues Fixed

#### 1. Path Configuration Problem
- **Issue**: Xcode looking for files at duplicated path (`/HannahHealth/HannahHealth/HannahHealth/`)
- **Solution**: Files were actually at correct location, issue was with DerivedData
- **Action**: Cleared DerivedData folder

#### 2. Missing Vortex Package
- **Issue**: Project required Vortex package for particle effects
- **Solution**: Replaced VortexTimeBackground and VortexSimpleBackground with native SwiftUI implementations
- **Result**: Removed dependency on external package

#### 3. Syntax Error in HannahHealthApp.swift
- **Issue**: Extra closing braces at lines 41-42
- **Solution**: Removed duplicate braces
- **Result**: Fixed compilation error

#### 4. Test Files in Main Target
- **Issue**: XCTest framework not available in main app target
- **Solution**: Created placeholder test files without XCTest imports
- **Files affected**:
  - HannahHealthTests.swift
  - HannahHealthUITests.swift
  - HannahHealthUITestsLaunchTests.swift

### Dev Mode Skip Button Added

#### Implementation
Added temporary skip button to bypass authentication during development:

**OnboardingView.swift**:
- Added "Skip (Dev Mode)" button below "Get Started"
- Sets UserDefaults flag and auth state to authenticated
- Subtle gray text to indicate it's temporary

**AuthManager.swift**:
- Checks for "skipAuth" UserDefaults flag on init
- If present, sets authState to .authenticated
- Bypasses all Supabase authentication

### How to Use
1. Launch app
2. Tap "Skip (Dev Mode)" on onboarding screen
3. Goes directly to main app interface
4. Persists across app launches until cleared

### Files Modified
- `Core/Auth/AuthManager.swift`
- `Features/Onboarding/OnboardingView.swift`

### Next Steps
- Test all app features without authentication
- Ensure skip mode doesn't affect production builds
- Add toggle to clear skip mode from settings

---

## Session 13 - Profile Integration & User Data Flow
**Date**: January 29, 2025
**Time**: Afternoon
**Status**: ✅ Profile integration complete

### What We Did
Connected the Profile view to AuthManager and implemented proper data flow for user information throughout the app.

### Profile Features Implemented

#### 1. Profile View UI
- Clean card-based layout with user information
- Profile picture placeholder with camera icon
- Editable fields for name, email, phone
- Height, weight, and age display
- Activity level and dietary preferences
- Edit mode toggle with save functionality

#### 2. Data Integration
- Connected to `AuthManager.userProfile`
- Two-way binding for all editable fields
- Proper state management with `@Published` properties
- Mock data for development/testing

#### 3. Navigation Flow
- Profile accessible from dashboard header
- Sheet presentation with proper dismissal
- Smooth transitions and animations

### Technical Details

#### AuthManager Updates
```swift
@Published var userProfile: UserProfile?
```
- Added mock profile data for testing
- Proper initialization in auth flow
- Profile updates trigger UI refresh

#### Profile View Structure
- Main info card with avatar
- Personal details section
- Health metrics section
- Preferences section
- Save/Cancel in edit mode

### Files Modified
- `Core/Auth/AuthManager.swift`
- `Features/Profile/ProfileView.swift`
- `Features/Dashboard/DashboardView.swift`
- `Features/Dashboard/Modules/DashboardHeader.swift`

### UI/UX Improvements
- Consistent glassmorphic styling
- Proper text field styling in edit mode
- Disabled appearance for non-edit mode
- Color-coded sections for clarity

---

## Session 12 - Chat Interface Implementation
**Date**: January 29, 2025
**Time**: Morning
**Status**: ✅ Chat UI complete

### What We Did
Implemented a fully functional chat interface with Hannah AI, including message history, typing indicators, and quick action buttons.

### Features Added

#### 1. Chat UI Components
- Message bubbles with proper alignment (user right, AI left)
- Scrollable message history
- Auto-scroll to bottom on new messages
- Time stamps for messages
- Typing indicator animation

#### 2. Input Interface
- Clean text input field with send button
- Quick action buttons for common requests
- Placeholder text for guidance
- Keyboard handling

#### 3. Message Types
- Text messages with markdown support
- System messages for context
- Loading states during AI response
- Error handling for failed messages

### Technical Implementation

#### ChatViewModel
- Message history management
- Send/receive message logic
- Typing indicator state
- Quick action handling

#### ChatView Structure
```swift
ScrollView {
    LazyVStack {
        ForEach(messages) { message in
            MessageBubble(message)
        }
    }
}
```

### UI Polish
- Smooth animations for message appearance
- Glassmorphic styling consistent with app
- Proper padding and spacing
- Dark mode optimized colors

### Files Created/Modified
- `Features/Chat/ChatView.swift`
- `Features/Chat/ChatViewModel.swift`
- `Features/Chat/Components/MessageBubble.swift`
- `Features/Chat/Components/ChatInputView.swift`

---

## Session 11 - Dashboard Modules & HealthKit
**Date**: January 28, 2025
**Time**: Evening
**Status**: ✅ Dashboard modules complete

### What We Did
Created modular dashboard components and integrated HealthKit for real device data.

### Dashboard Modules Created

#### 1. CaloriesView
- Daily calorie tracking card
- Progress ring visualization
- Intake vs burned comparison
- Meal breakdown by category

#### 2. StepsView
- Real-time step count from HealthKit
- Daily goal progress
- Hourly activity graph
- Distance calculation

#### 3. WaterIntakeView
- Hydration tracking
- Glass count with visual indicators
- Quick add buttons
- Daily goal percentage

#### 4. QuickActionCards
- Log meal shortcut
- Track symptom button
- Add water quick action
- View insights link

### HealthKit Integration

#### Permissions Setup
```swift
let healthTypes: Set = [
    HKQuantityType.quantityType(forIdentifier: .stepCount)!,
    HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned)!,
    HKQuantityType.quantityType(forIdentifier: .dietaryEnergyConsumed)!
]
```

#### Real-time Updates
- Background health data refresh
- Automatic UI updates on data change
- Proper error handling for permissions

### Files Created
- `Features/Dashboard/Modules/CaloriesView.swift`
- `Features/Dashboard/Modules/StepsView.swift`
- `Features/Dashboard/Modules/WaterIntakeView.swift`
- `Features/Dashboard/Modules/QuickActionCards.swift`
- `Core/Health/HealthKitManager.swift`

---

## Session 10 - Tab Navigation & Architecture
**Date**: January 28, 2025
**Time**: Afternoon
**Status**: ✅ Navigation complete

### What We Did
Implemented the main tab navigation system and established the app's navigation architecture.

### Tab Structure

#### Five Main Tabs
1. **Dashboard** - Home screen with health metrics
2. **Chat** - AI conversation with Hannah
3. **Insights** - Health tracking charts and analytics
4. **Meal Plan** - Weekly meal planning board
5. **Shopping** - Grocery list management

#### Navigation Implementation
- Custom tab bar with glassmorphic styling
- Smooth animations between tabs
- Badge support for notifications
- Proper state management

### Technical Details

#### TabNavigation.swift
```swift
enum Tab: String, CaseIterable {
    case dashboard, chat, insights, mealPlan, shopping
}
```

#### ContentView Updates
- Tab selection state
- View routing based on selected tab
- Proper view lifecycle management

### Files Modified
- `ContentView.swift`
- `Core/Navigation/TabNavigation.swift`
- Various view files for tab content

---

## Session 11 - Food Logging & Dashboard Integration
**Date**: August 30, 2025
**Time**: Evening
**Status**: ✅ Food logging functional

### What We Accomplished

#### 1. Fixed Food Logging System
- **Backend Server Issue**: Discovered server was running old code from morning (8:55 AM) while changes were made at night
- **Text Replacement**: Finally removed all "Please confirm with Y" messages after restarting server
- **Supabase Query Fix**: Fixed HTTP 400 errors by using correct PostgREST query format
- **Food Name Extraction**: Fixed regex to extract just food name instead of entire response

#### 2. Dashboard Improvements
- **Food Activity Log**: 
  - Reversed order to show earliest meals first
  - Added meal-specific icons with colors (breakfast: sunrise/sky, lunch: sun/yellow, dinner: sunset/purple, snack: carrot/orange)
- **Calorie Ring Chart**:
  - Fixed to show only logged meals instead of mock data
  - Connected to real meal breakdown from database
  - Each meal segment now shows actual calories consumed

#### 3. Authentication & Data Flow
- Fixed SupabaseService to use auth tokens from AuthManager's Supabase client
- Implemented proper notification system for updating dashboard when food is logged
- Added meal breakdown tracking to DashboardViewModel

### Technical Issues Resolved

#### Backend Issues
- GPT-4o-mini ignoring instructions about Y confirmation
- Added aggressive text replacement in backend post-processing
- Server not restarting to pick up code changes

#### iOS Issues  
- Supabase query using invalid `and=()` syntax
- Food name extraction capturing entire AI response
- Dashboard using mock meal percentages instead of real data

### Files Modified
- `backend/routes/ai.js` - Fixed text replacement, updated instructions
- `HannahHealth/Core/Services/SupabaseService.swift` - Fixed auth and queries
- `HannahHealth/Features/Log/LogView.swift` - Improved food extraction
- `HannahHealth/Features/Dashboard/Modules/FoodActivityLogCard.swift` - Added meal breakdown
- `HannahHealth/Features/Dashboard/Modules/CaloriesView.swift` - Real meal data
- `HannahHealth/Features/Dashboard/DashboardViewModel.swift` - Added meal tracking

### Next Steps
- Add delete functionality for food items
- Ensure all nutrition stats are captured (protein, carbs, fat)
- Add tap interactions to meal segments in ring chart
- Fix any remaining UI polish items

---

## Session 22 (Part 2): Database Constraints & UI Enhancements
**Date**: December 31, 2024 (Evening)
**Duration**: ~2 hours
**Focus**: Fixing meal type constraints, decimal calories, and ring chart improvements

### Major Fixes

#### 1. Database Constraint Issues
- **Problem**: "morning snack", "afternoon snack", "evening snack" violated database constraint
- **Initial Error**: `new row for relation "food_entries" violates check constraint "food_entries_meal_type_check"`
- **Solution**: Updated database constraint to accept all snack variants
- **Implementation**: When user selects meal + snack, split into two separate database entries

#### 2. Decimal Calorie Support
- **Problem**: Food items with decimal calories (e.g., "1 grape = 0.67 calories") failed to extract
- **Root Cause**: Regex patterns only matched whole numbers (`\\d+`)
- **Fix**: Updated all patterns to match decimals (`[\\d.]+`) and round to nearest integer

#### 3. Ring Chart Visual Improvements
- **Snack Colors**: Made all snack variants 100% orange (removed opacity variations)
- **Snack Icons**: Fixed FoodItem component to recognize all snack variants for carrot icon
- **White Separators**: Added 0.5-degree gaps between segments in both rings for clarity
- **Correct Order**: Ensured chronological order: Breakfast → Morning Snack → Lunch → Afternoon Snack → Dinner → Evening Snack

### Technical Implementation

#### Database Schema Update
```sql
ALTER TABLE public.food_entries 
ADD CONSTRAINT food_entries_meal_type_check 
CHECK (meal_type = ANY (ARRAY[
    'breakfast', 'lunch', 'dinner', 'snack',
    'morning snack', 'afternoon snack', 'evening snack'
]));
```

#### Multi-Entry Saving
- When meal type contains " and " (e.g., "dinner and evening snack")
- Split into separate entries with proportional calories/macros
- Each entry saved with its specific meal type

### Files Modified
- `LogView.swift` - Fixed decimal extraction, multi-entry saving
- `FoodItem.swift` - Updated icon logic for snack variants
- `CaloriesView.swift` - Visual improvements (colors, separators)
- `SupabaseService.swift` - Added debug logging for JSON payload
- Database migration scripts created

### Edge Cases Handled
- Decimal calorie values (0.67 calories)
- Combined meal + snack selections
- Time-based snack categorization
- Visual distinction with separators
- Consistent orange color for all snacks

---

## Session 22 (Part 3): Edge Case Handling & Robustness
**Date**: December 31, 2024 (Late Evening)
**Duration**: ~1 hour
**Focus**: Improving food extraction patterns and error handling

### Testing & Edge Cases Identified

Tested 40 different log entry scenarios and identified critical failures:
- Multiple food items in one message
- Word numbers not parsing
- Missing equals sign patterns
- Non-standard meal types
- Mixed exercise/food messages
- Special characters and emojis
- Very small decimal values

### Fixes Implemented

#### 1. Enhanced Food Extraction Patterns
- Added support for dash separator: `"2 eggs - 140 calories"`
- Added support for no separator: `"eggs 140 calories"`
- Existing patterns for equals and colon still work
- All patterns now support decimal values

#### 2. Minimum Calorie Logic
- Ensures all foods have at least 1 calorie
- Prevents items from disappearing: `max(1, Int(round(calories)))`
- Handles edge cases like "0.1 calorie mint"

#### 3. Expanded Exercise Detection
- Original keywords: workout, walk, run, exercise, gym, min
- Added: burned, bike, swim, yoga, cardio, lifting, training
- Better differentiation between exercise and food entries

#### 4. Meal Type Mapping
Implemented automatic mapping for non-standard meal types:
```swift
"brunch" → "lunch"
"dessert" → "evening snack"
"midnight snack" → "evening snack"
"appetizer" → "snack"
"pre-workout" → "snack"
"post-workout" → "snack"
"tea time" → "afternoon snack"
```

### Still Needs Implementation
1. Date selector UI for logging to past dates
2. Word number parsing ("two eggs", "one hundred calories")
3. Weight unit conversion based on user preference
4. Multiple food item parsing in single message
5. Mixed content handling (exercise + food together)

### Files Modified
- `LogView.swift` - All extraction and mapping improvements

---

## Session 11: Dashboard Ring Rendering Issues (Aug 31, 2025)

### Problems Encountered

#### 1. Rings Not Rendering Until Scroll
- **Issue**: Inner and outer rings in CaloriesView wouldn't appear until user scrolled
- **Cause**: TabView with PageTabViewStyle causes lazy rendering
- **Attempted Fixes**:
  - Removed `.filter { $0.value > 0 }` to ensure segments always exist
  - Added minimum value of 1 to BMR to prevent empty arrays
  - Added `.id()` modifier to TabView to force updates
  - Tried `.drawingGroup()` but it caused layout issues
  - Attempted delayed rendering with `hasAppeared` state
- **Result**: Issue remains unresolved - SwiftUI TabView lazy loading prevents initial render

#### 2. Previous Fixes Applied
- Fixed step calorie calculation (was dividing by 1000 incorrectly)
- Fixed donut chart only showing 75% (removed -90 degree offset)
- Redesigned CaloriesView to be interactive with tap-to-select segments
- Added meal type breakdown with colors in inner ring
- Added deficit segment for weight loss visualization
- Updated various UI components for consistency

### Technical Notes
- Data loads correctly (BMR: 1712, calories: 1614) but view doesn't render
- ForEach with empty arrays = no render in SwiftUI
- TabView PageTabViewStyle has known lazy rendering issues
- `.drawingGroup()` modifier causes excessive padding/layout problems

### Files Modified
- `CaloriesView.swift` - Multiple attempts to fix ring rendering
- `DailySummaryCard.swift` - Added .id() modifier to TabView
- `DashboardHeader.swift` - Personalized greeting with user name
- `DailyGoalSelector.swift` - Removed "View All", added directional icons

---

## Previous Sessions Archive
For sessions 1-9, see `development-diary-archive.md`