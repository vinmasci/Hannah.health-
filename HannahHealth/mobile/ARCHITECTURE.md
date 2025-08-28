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
│   ├── Dashboard/            # Main dashboard
│   │   └── DashboardView.swift
│   ├── MealPlan/            # Meal planning
│   │   ├── MealPlanViewModel.swift
│   │   └── MealPlanView.swift
│   ├── Shopping/            # Shopping list
│   │   ├── ShoppingListViewModel.swift
│   │   └── ShoppingListView.swift
│   └── Today/               # Daily tracking
│       └── TodayView.swift
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