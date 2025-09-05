# Hannah Health - Insights Feature

## Overview
The Insights view provides users with visual health tracking and progress monitoring through interactive charts and metric cards. It replaces the "+" quick-add button in the navigation with a dedicated analytics dashboard.

## Features

### 1. Interactive Metric Tracking
- **Three Core Metrics**:
  - **Steps** (Green - Theme.emerald): Daily step count tracking
  - **Exercise** (Red - Theme.coral): Calories burned through exercise
  - **Weight** (Purple - Theme.lavender): Weight tracking with automatic unit conversion

### 2. Time Range Selection
- **Today**: Hourly breakdown of activity (steps and exercise by hour)
- **Week** (default): Daily data for current/selected week
- **Month**: Weekly aggregates for the month
- **3 Months**: Monthly comparison view
- **Year**: Full year monthly breakdown

#### Date Navigation Features
- Left/right arrow buttons for navigating through time periods
- Smart navigation that prevents moving to future dates
- Contextual date display showing:
  - "Today" or "Yesterday" for daily view
  - "This Week (dates)" for current week
  - "This Month (name)" for current month
  - Date ranges for historical periods
- Automatic reset to current date when switching to "Today" view

### 3. Visual Components

#### Main Chart
- Interactive bar chart that switches between metrics
- Animated transitions when changing metrics
- Color-coded bars matching each metric's theme color
- Dynamic data based on selected time range:
  - Today: Up to 7 hourly data points
  - Week: 7 daily data points
  - Month: 4 weekly aggregates
  - 3 Months: 3 monthly data points
  - Year: 12 monthly data points
- Responsive bar sizing that adjusts to data point count

#### Statistics Display
- **Average**: Shows average value for selected time period
- **Change**: Displays change from start to end of period
- **Today**: Current day's value

#### Quick Stats Grid
Four informational cards displaying:
1. **Current Weight**: User's latest weight from profile (auto-converts kg/lbs)
2. **Average Steps**: Daily step average
3. **Calories Burned**: Average exercise calories per day
4. **On Track**: Days meeting goals (Sky blue - Theme.sky)

### 4. User Profile Integration
- Reads weight data from `AuthManager.userProfile`
- Respects user's metric preference (kg vs lbs)
- Automatically converts units based on user settings
- Falls back to sensible defaults when profile data unavailable

## Technical Implementation

### File Location
`HannahHealth/Features/InsightsPlaceholder.swift`

### Key Components
```swift
struct InsightsView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var selectedMetric: MetricType = .steps
    @State private var selectedTimeRange: TimeRange = .week
}
```

### Color Scheme
- Weight: `Theme.lavender` (Purple - #C06FFF)
- Steps: `Theme.emerald` (Green - #10B981)  
- Exercise: `Theme.coral` (Red - #FF6B6B)
- On Track: `Theme.sky` (Sky Blue - #38BDF8)

### Data Flow
1. User profile data accessed via `authManager.userProfile`
2. Weight preference checked: `authManager.userProfile?.activityLevel == "prefer_metric"`
3. Weight conversion: `weightKg * 2.20462` for pounds display
4. Real-time updates when user changes metrics or time ranges

## Navigation Changes

### Bottom Tab Bar Updates
- Removed the center "+" quick-add button
- Added "Insights" tab with chart icon (`chart.line.uptrend.xyaxis`)
- New tab order: Dashboard, Chat, Insights, Meal Plan, Shopping

### Tab Configuration
```swift
enum Tab: String, CaseIterable {
    case dashboard = "dashboard"
    case chat = "chat" 
    case insights = "insights"
    case mealPlan = "mealPlan"
    case shopping = "shopping"
}
```

## User Experience

### For Medical Mode Users
- Full access to all metrics and numbers
- Detailed calorie and weight tracking
- Progress indicators with specific values

### For ED-Safe Mode (Future)
- Insights tab will be hidden completely
- No weight or calorie metrics shown
- Focus shifts to mood and energy tracking only

## Design Principles
- **Glassmorphic UI**: Consistent with app's design language
- **Dynamic Background**: Uses `DynamicTimeBackground()` that changes with time of day
- **Smooth Animations**: Spring animations for metric switches
- **Responsive Layout**: Adapts to different screen sizes
- **Accessibility**: Clear contrast ratios and readable fonts

## Future Enhancements
- [ ] Connect to real HealthKit data for steps
- [ ] Integrate with food logging for actual calorie data
- [ ] Add trend lines and predictions
- [ ] Weekly/monthly goal setting
- [ ] Export data functionality
- [ ] Comparative analysis (this week vs last week)
- [ ] Achievement badges and milestones

## Dependencies
- SwiftUI
- AuthManager for user profile data
- Theme configuration for consistent styling
- Color extensions for hex color support

---

*Last Updated: January 2025*
*Version: 1.0.0*