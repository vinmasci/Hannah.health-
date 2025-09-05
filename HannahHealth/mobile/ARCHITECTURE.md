# Hannah Health Mobile Architecture

## Overview
Hannah Health is an AI-powered nutrition tracking iOS application built with SwiftUI and integrated with multiple cloud services for comprehensive health management.

## Technology Stack

### Frontend
- **Language:** Swift 5.9
- **Framework:** SwiftUI
- **Minimum iOS:** 17.0
- **Architecture:** MVVM (Model-View-ViewModel)

### Backend Services
- **Database:** Supabase (PostgreSQL)
- **AI Services:** OpenAI GPT-4
- **Search:** Brave Search API
- **Health Data:** Apple HealthKit

## Project Structure

```
HannahHealth/
├── Core/                       # Core functionality
│   ├── Configuration/         # API keys and config
│   ├── Services/             # Service layer
│   │   ├── SupabaseService.swift
│   │   ├── OpenAIService.swift
│   │   ├── BraveSearchService.swift
│   │   ├── NetworkService.swift
│   │   └── HealthKit/
│   └── Models/               # Data models
│       ├── ChatMessage.swift
│       ├── FoodEntry.swift
│       ├── MealPlan.swift
│       └── ShoppingItem.swift
├── Features/                  # Feature modules
│   ├── Chat/                 # AI chat interface
│   │   ├── ChatViewModel.swift
│   │   └── WorkingChatView.swift
│   ├── Dashboard/            # Main dashboard with animations
│   │   ├── DashboardView.swift
│   │   ├── DashboardViewModel.swift
│   │   └── Modules/         # Dashboard components
│   │       ├── CaloriesView.swift    # Animated ring charts
│   │       ├── FoodActivityLogCard.swift
│   │       ├── DailySummaryCard.swift
│   │       └── QuickStatsGrid.swift
│   ├── Log/                  # Quick logging
│   │   └── LogView.swift    # Food/exercise quick entry
│   ├── MealPlan/            # Meal planning kanban
│   │   ├── MealPlanViewModel.swift
│   │   ├── MealPlanKanbanView.swift
│   │   └── MealPlanChatPanel.swift
│   ├── Shopping/            # Shopping list
│   │   ├── ShoppingListViewModel.swift
│   │   └── ShoppingListView.swift
│   └── Profile/             # User profile
│       └── UserProfileView.swift
├── Components/              # Reusable UI components
│   ├── Theme.swift         # Design system
│   ├── CustomTabBar.swift
│   └── DynamicTimeBackground.swift
└── Resources/              # Assets and resources
```

## Core Components

### 1. Service Layer
Handles all external API interactions and data persistence:
- **SupabaseService:** Authentication and database operations
- **OpenAIService:** Chat and vision API integration
- **BraveSearchService:** Real-time nutrition data retrieval
- **NetworkService:** Generic networking layer
- **HealthKitService:** iOS health data integration

### 2. View Models
Manage state and business logic:
- **ChatViewModel:** Handles AI conversations and food logging
- **MealPlanViewModel:** Manages weekly meal planning
- **ShoppingListViewModel:** Generates shopping lists from meal plans

### 3. Data Flow
```
User Input → View → ViewModel → Service → API
                ↓                    ↓
            Local State ← Response ←
```

## Key Features

### Natural Language Processing
- Chat-based food logging
- Photo recognition for meals
- Conversational meal planning

### Data Management
- Cross-platform sync via Supabase
- Local caching for offline access
- Real-time updates

### Health Tracking
- Active Energy integration from HealthKit (single source of truth for movement)
- Steps tracking for display (not used in calorie calculations)
- Automatic BMR from Apple Watch Resting Energy
- Weekly aggregation of Active Energy data
- Mock data generation for development (90 days historical)

### Health Integration
- HealthKit read/write
- Nutrition tracking
- Activity monitoring

### Dashboard Analytics
- **Multi-temporal views**: Day, Week, Month perspectives
- **Smart navigation**: Context-aware period switching
- **Data aggregation**: Automatic totals and averages
- **Weight tracking**: Progress monitoring over time
- **Mock data system**: Realistic patterns for testing

## Security Architecture
See [SECURITY-AUDIT.md](./SECURITY-AUDIT.md) for detailed security assessment and recommendations.

### Current Security Status
- ⚠️ **Critical Issues:** Hardcoded API keys need immediate attention
- 🔐 **Required:** Keychain implementation for secure storage
- 🛡️ **Planned:** Certificate pinning and biometric authentication

## Design System

### Visual Language
- **Dynamic Backgrounds:** Time-based gradients (sunrise, midday, sunset, midnight)
- **Glass Morphism:** 50% black transparency with blur
- **Color Scheme:**
  - Breakfast: Sky 400 (#38BDF8)
  - Lunch: Amber 400 (#F59E0B)
  - Dinner: Indigo 400 (#6366F1)
  - Snack: Emerald 400 (#10B981)

### UI Components
- Custom tab bar with glass effects
- Card-based layouts
- Consistent typography and spacing

## Key Features & Improvements (Sept 2025)

### 🎯 Dashboard Enhancements
- **Animated Ring Charts:** Beautiful spring animations for calorie tracking
- **Loading States:** Smooth skeleton loaders with rotating gradient rings
- **Date Persistence:** Navigate between dates without data loss
- **Smart Data Loading:** Single source of truth for food data via notifications
- **Meal Type Categorization:** Separate tracking for morning/afternoon/evening snacks

### 📊 Visual Features
- **Multi-Ring Visualization:**
  - Outer ring: TDEE components (BMR, Steps, Exercise, TEF)
  - Inner ring: Food consumption by meal type
  - Interactive segments with detailed breakdowns
- **Responsive Animations:**
  - 1.2s spring animation on data load
  - Scale and opacity transitions
  - No distracting shimmer effects

### 🔄 Data Flow Improvements
- **Optimized Loading:** Eliminated duplicate API calls
- **Real-time Updates:** Instant UI refresh on food logging
- **Historical Data:** Proper date-based queries for past entries
- **HealthKit Integration:** Automatic workout import from Apple Health

### 🐛 Bug Fixes
- Fixed ring chart reverting when viewing historical dates
- Resolved double-entry issue with meal+snack combinations
- Fixed FoodActivityLogCard not loading on app launch
- Corrected snack categorization in meal breakdowns
- Removed distracting shimmer effect from loading animation

### 💪 Activity Tracking Improvements (Session 23)
- **Distance-Based Recommendations:** Converted abstract steps/minutes to concrete km targets
- **Smart Offset Calculations:** Shows exact distance needed when over calorie target
- **Activity-Specific Suggestions:** Light running (100 cal/km) or walking (50 cal/km)
- **Accurate Progress Bars:** Visual gaps show percentage of additional activity needed
- **Real-Time Feedback:** Dynamic text updates based on current vs. target calories

## Database Schema
Detailed in [SUPABASE-SETUP.md](../SUPABASE-SETUP.md):
- User profiles with preferences
- Food entries with nutrition data
- Meal plans (weekly schedules)
- Shopping lists
- Health metrics
- Goals and achievements

## API Integration

### OpenAI
- **Model:** GPT-4o-mini (chat), GPT-4o (vision)
- **Functions:** Food analysis, meal planning, conversational AI

### Brave Search
- **Purpose:** Real-time nutrition data
- **Priority:** Official sources → Databases → AI estimates

### Supabase
- **Auth:** Email/password, OAuth providers
- **Database:** PostgreSQL with Row Level Security
- **Real-time:** Subscriptions for live updates

## Development Workflow

### Environment Setup
1. Clone repository
2. Install dependencies via Swift Package Manager
3. Configure API keys (see Security section)
4. Run on iOS 17+ device/simulator

### Build Configurations
- **Debug:** Local development with logging
- **Release:** Production build with optimizations
- **TestFlight:** Beta testing configuration

## Testing Strategy

### Unit Tests
- Service layer mocking
- ViewModel logic validation
- Model serialization

### UI Tests
- Critical user flows
- Accessibility compliance
- Performance benchmarks

## Performance Considerations

### Optimization Areas
- Image caching for meal photos
- Batch API requests
- Background task management
- Memory management for large datasets

### Monitoring
- Crash reporting (planned)
- Performance metrics
- API usage tracking

## Future Architecture Plans

### Planned Enhancements
1. **Android Support:** React Native or Flutter migration
2. **Web Dashboard:** Administrative interface
3. **Offline Mode:** Enhanced local storage
4. **ML on Device:** Core ML for food recognition

### Scalability Considerations
- Microservices architecture for backend
- CDN for static assets
- Database sharding for user data
- API rate limiting and caching

## Dependencies

### Swift Packages
- **Vortex:** Particle effects (v1.0.3)
- **Supabase Swift:** Database client (planned)

### System Frameworks
- SwiftUI
- Combine
- HealthKit
- Photos
- Security (Keychain)

## Documentation

### Related Documents
- [MEAL-PLANNING.md](../MEAL-PLANNING.md) - Meal planning and shopping features
- [SECURITY-AUDIT.md](./SECURITY-AUDIT.md) - Security assessment and fixes
- [SUPABASE-SETUP.md](../SUPABASE-SETUP.md) - Database configuration
- [AI-INTEGRATION.md](./AI-INTEGRATION.md) - AI services documentation
- [context.md](./context.md) - Project context and overview
- [development-diary.md](./development-diary.md) - Development history

## Contributing

### Code Standards
- SwiftLint for code style
- MVVM pattern adherence
- Comprehensive documentation
- Security-first development

### Review Process
1. Security audit for sensitive changes
2. UI/UX review for user-facing features
3. Performance testing for critical paths
4. Accessibility validation

## License
Proprietary - Hannah Health © 2025

## Architecture Review Status (January 30, 2025 - Session 19 Completed)

### Current Review Score: 6/10 ✅ IMPROVED

#### ✅ CRITICAL ISSUE RESOLVED - MealPlanKanbanView.swift Successfully Refactored

##### Session 19 Achievements

**1. MealPlanKanbanView.swift Refactoring - COMPLETE**
- **Before**: 1,056 lines (3x over limit) 🚨 COMPILER TIMEOUT RISK
- **After**: 113 lines ✅ (89.3% reduction)
- **Status**: Successfully split into 8 modular components

**2. InsightsPlaceholder.swift Refactoring - COMPLETE**
- **Before**: 694 lines (344 lines over limit) ⚠️
- **After**: 152 lines ✅ (78% reduction)
- **Status**: Successfully split into 7 modular components in Insights folder

**Files Created During Refactoring**:

**MealPlan Components (Session 19a):**
1. **MealPlanTypes.swift** (109 lines) - All data models and enums
2. **FoodSearchService.swift** (216 lines) - Nutrition API service
3. **MealPlanHelpers.swift** (73 lines) - Utility functions  
4. **TimePickerSheet.swift** (53 lines) - Time picker component
5. **MealSlotCard.swift** (333 lines) - Individual meal slot UI
6. **DayCard.swift** (190 lines) - Day container component
7. **MealPlanKanbanHeader.swift** (33 lines) - Header component

**Insights Components (Session 19b):**
1. **InsightsTypes.swift** (54 lines) - MetricType, TimeRange, ChartDataPoint
2. **InsightsDataService.swift** (154 lines) - Data generation service
3. **InsightsChartView.swift** (124 lines) - Chart visualization
4. **InsightsStatComponents.swift** (86 lines) - InsightsMetricTab, QuickStatCard
5. **InsightsNavigationBar.swift** (152 lines) - Time range navigation
6. **InsightsHelpers.swift** (107 lines) - Formatting utilities
7. **InsightsPlaceholder.swift** (152 lines) - Main orchestrator

**Technical Challenges Resolved**:
- Fixed FocusState binding issues in SwiftUI components
- Resolved Xcode project file integration problems
- Eliminated name conflicts (MealPlanHeader renamed to MealPlanKanbanHeader)
- Simplified folder structure for better visibility

#### 🚨 Remaining Critical Violations - URGENT

##### File Size Violations (Highest Priority)
1. **CaloriesView.swift: 1,144 lines** (794 lines over limit!) 
   - Status: CRITICAL - 3.3x over limit!
   - Risk: Compiler timeout imminent
   - Contains CombinedDonutChart component (added during session)
   
2. ~~**InsightsPlaceholder.swift: 694 lines**~~ ✅ FIXED in Session 19b
   - Refactored to 152 lines + 6 component files

3. **CaloriesView.swift: 627 lines** (277 lines over limit)
   - Status: HIGH PRIORITY
   
4. **TimeOfDayBackgrounds.swift: 586 lines** (236 lines over limit)
   - Status: HIGH PRIORITY

5. **MealPlanChatViewModel.swift: 540 lines** (340 lines over 200 limit)
   - Status: CRITICAL (ViewModel violation)

6. **AuthManager.swift: 459 lines** (259 lines over 200 limit)
   - Status: CRITICAL (Service violation + Security risk)

##### 🔒 Security Vulnerabilities - RESOLVED
- **Hardcoded Supabase credentials** in AuthManager.swift - ✅ FIXED
- API key: `[REDACTED]` - ✅ SECURED
- Debug logging throughout production code - ⚠️ IN PROGRESS
- Development skip buttons still present - ⚠️ IN PROGRESS

#### ✅ Architecture Strengths (Maintained)
- Excellent MVVM pattern implementation
- Clean dependency injection patterns
- Proper async/await usage
- Good service layer separation
- Successful modularization (proven with MealPlanKanbanView)

#### 🎯 Immediate Next Steps (Priority Order)

1. **UserProfileView.swift Refactoring (NEXT TARGET)**
   - [ ] Extract CountryPickerView.swift (~250 lines)
   - [ ] Create PhoneNumberFormatter.swift utility (~100 lines)
   - [ ] Move validation logic to UserProfileViewModel (~150 lines)
   - [ ] Extract form sections into components
   - Target: <300 lines for main view

2. **Security Fixes (CRITICAL)**
   - [ ] Move API keys to Config.plist
   - [ ] Implement Keychain storage
   - [ ] Remove all hardcoded credentials
   - [ ] Clean up debug logging

3. **InsightsPlaceholder.swift Refactoring**
   - [ ] Split into multiple feature components
   - [ ] Extract chart components
   - [ ] Separate data processing logic

#### 📊 Progress Metrics
- **Files Fixed**: 2/7 critical violations resolved ✅
- **Lines Reduced**: 1,485 lines eliminated through refactoring
- **Compiler Risk**: Eliminated for MealPlanKanbanView and InsightsPlaceholder
- **Test Coverage**: Still 0% (needs immediate attention)

#### 🏆 Session 19 Lessons Learned
1. **Xcode Integration**: Keep file structure simple, avoid deep nesting
2. **FocusState Bindings**: Use `FocusState<Bool>.Binding` type, not `@FocusState.Binding`
3. **Component Naming**: Check for conflicts across the entire project
4. **Incremental Testing**: Test after each extraction to catch issues early
5. **Backup Strategy**: Always create backups before major refactoring