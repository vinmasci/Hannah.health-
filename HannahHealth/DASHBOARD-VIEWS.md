# Hannah Health Dashboard Views System

## Overview
Transform the dashboard from a single daily view into a multi-temporal analytics system with day, week, and month views. Each view provides different insights and visualizations while maintaining the app's consistent glass morphism design.

## Navigation Design

### Control Layout
Position: Top of dashboard, below header
Format: `<` `Day` `Week` `Month` `>`
Style: Pill-style buttons matching meal plan day selector (solid emerald for selected)

### Navigation Behavior
- **Day View**: Arrows move ±1 day
- **Week View**: Arrows move ±1 week  
- **Month View**: Arrows move ±1 month
- Selected period highlighted with emerald background
- Smooth transitions between views

## View Specifications

### Day View (Current Default)
**Purpose**: Detailed daily tracking and real-time monitoring

**Components**:
1. **Daily Summary Card**
   - Current day's calories (consumed/remaining)
   - Macro breakdown (protein, carbs, fat)
   - Circular progress indicators

2. **Quick Stats Grid**
   - Water intake
   - Steps
   - Sleep hours
   - Workout minutes

3. **Food & Activity Log**
   - Individual meal entries
   - Exercise activities
   - Timestamps and details

4. **Hannah's Advice**
   - Daily tips and motivation

### Week View
**Purpose**: Weekly trends and pattern recognition

**Components**:
1. **Week Summary Card**
   - Week dates (Mon-Sun format)
   - Total calories for week
   - Daily average calories
   - Average macros per day
   - Total macros for week

2. **Charts Section** (replaces Food Log)
   - **Line Graph**: Daily calories across 7 days
   - **Bar Charts**: Daily macros (stacked or grouped)
   - **Progress Rings**: Weekly goal completion
   - **Weight Tracker**: Optional weekly weight with trend arrow

3. **Stats Grid**
   - Weekly averages for water, steps, sleep
   - Weekly totals where relevant
   - Best/worst day indicators

4. **Weekly Insights**
   - AI-generated weekly patterns
   - Suggestions for next week

### Month View  
**Purpose**: Long-term progress and monthly goals

**Components**:
1. **Month Summary Card**
   - Month name (Jan, Feb, etc.)
   - Monthly totals and averages
   - Days tracked vs. goal
   - Monthly deficit/surplus

2. **Visualizations** (replaces Food Log)
   - **Calendar Heatmap**: Daily calorie intake intensity
   - **Trend Lines**: 30-day moving averages
   - **Monthly Comparison**: Bar chart vs. previous months
   - **Weight Progress**: Month-over-month if enabled

3. **Monthly Stats**
   - Best week / worst week
   - Consistency score
   - Monthly records (highest steps, best sleep, etc.)

4. **Monthly Report**
   - AI-generated monthly analysis
   - Achievement highlights
   - Recommendations

## Data Architecture

### Mock Data Structure
```swift
struct DayData {
    let date: Date
    let calories: Int
    let protein: Double
    let carbs: Double
    let fat: Double
    let water: Int // ml
    let steps: Int
    let sleep: Double // hours
    let workoutMinutes: Int
    let weight: Double? // optional, kg
    let meals: [FoodEntry]
}

struct WeekData {
    let startDate: Date
    let endDate: Date
    let days: [DayData]
    // Computed properties for totals and averages
}

struct MonthData {
    let month: Int
    let year: Int
    let weeks: [WeekData]
    // Computed properties for monthly analytics
}
```

### Mock Data Generation
- Generate 90 days of historical data
- Realistic patterns (weekday vs weekend)
- Gradual weight loss trend if weight tracking enabled
- Variable but realistic meal patterns

## UI Components

### ViewPeriodSelector
- Horizontal stack of pills
- Smooth selection animation
- Period-appropriate arrow functions

### ChartComponents
- **LineChartView**: For trend lines
- **BarChartView**: For daily/weekly comparisons
- **HeatmapCalendar**: For monthly overview
- **ProgressRing**: Reusable circular progress

### StatCard Variants
- **DayStatCard**: Single value with icon
- **WeekStatCard**: Average + total + trend
- **MonthStatCard**: Multiple metrics with spark lines

## Implementation Status ✅ COMPLETED

### Phase 1: Navigation Structure ✅
1. ✅ Created `ViewPeriod` enum (day, week, month)
2. ✅ Built `ViewPeriodSelector` component with pill-style buttons
3. ✅ Added to `DashboardView` with emerald highlighting
4. ✅ Implemented view switching logic with smooth transitions

### Phase 2: Mock Data ✅
1. ✅ Created comprehensive data models (DayData, WeekData, MonthData)
2. ✅ Built `MockDataGenerator` with realistic patterns
3. ✅ Generated 90 days of sample data with meals, weight tracking
4. ✅ Integrated into `DashboardViewModel` with reactive updates

### Phase 3: Day View ✅
1. ✅ Preserved original dashboard layout in day view
2. ✅ Connected to navigation system
3. ✅ Implemented day-by-day navigation with arrow buttons

### Phase 4: Week View ✅
1. ✅ Created week view with summary cards
2. ✅ Displays weekly totals and daily averages
3. ✅ Shows weight change tracking
4. ✅ Implemented week-by-week navigation
5. ⏳ Chart components (placeholders ready for implementation)

### Phase 5: Month View ✅
1. ✅ Created month view with summary cards
2. ✅ Displays monthly statistics
3. ✅ Shows total days tracked and averages
4. ✅ Implemented month-by-month navigation
5. ⏳ Calendar heatmap (placeholder ready for implementation)

### Phase 6: Polish ✅
1. ✅ Smooth view transitions
2. ✅ Glass morphism consistency
3. ✅ Period display text (dates/ranges)
4. ✅ Maintained dynamic backgrounds

## Design Principles

### Visual Consistency
- Maintain glass morphism throughout
- Use existing color scheme (emerald, sky, amber, etc.)
- Consistent spacing and padding
- Dynamic time-based backgrounds

### User Experience
- Instant view switching
- Clear temporal context
- Swipe gestures for navigation (optional)
- Loading states for data fetching

### Data Visualization
- Charts use theme colors
- High contrast for readability
- Smooth animations
- Interactive tooltips (future)

## Future Enhancements

### Phase 2 Features
- Real data integration with Supabase
- Export reports (PDF/Email)
- Comparative analytics (vs. previous period)
- Goal setting and tracking
- Social sharing of achievements

### Advanced Analytics
- Predictive trends
- Pattern recognition
- Meal timing analysis
- Correlation insights (sleep vs. calories)
- Custom date ranges

### Customization
- User-selectable metrics
- Custom chart types
- Personalized insights
- Widget configurations

## Technical Considerations

### Performance
- Lazy loading of views
- Data caching strategy
- Efficient chart rendering
- Memory management for large datasets

### State Management
- Single source of truth in `DashboardViewModel`
- Computed properties for derived data
- Reactive updates with `@Published`

### Testing
- Unit tests for calculations
- Mock data consistency
- View model logic
- Chart rendering performance

## Success Metrics
- View switching < 100ms
- Smooth 60fps animations
- Clear data insights
- Intuitive navigation
- Consistent design language