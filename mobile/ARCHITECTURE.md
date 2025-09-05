# Hannah Health iOS Architecture Guidelines

> **UI UPDATE**: The app has transitioned from a kanban board to a modular dashboard design.  
> See **[HannahHealth/UI-DESIGN.md](../HannahHealth/UI-DESIGN.md)** for complete UI specifications.

## Core Principles
1. **Small & Modular**: 
   - Views: Max 350 lines (SwiftUI can be verbose)
   - ViewModels: Max 200 lines (should be focused)
   - Services: Max 200 lines (single responsibility)
   - If bigger, split it immediately
2. **Single Responsibility**: Each component does ONE thing well.
3. **Testable**: Business logic separated from UI.
4. **No Shortcuts**: Better to refactor now than fix later.

## Project Structure

```
HannahHealth/
├── App/
│   ├── HannahHealthApp.swift       # App entry point only
│   └── Configuration/               # App-wide config
│       ├── Constants.swift         # API keys, URLs
│       └── AppEnvironment.swift    # Dev/Prod settings
│
├── Core/                           # Business Logic (No SwiftUI)
│   ├── Models/
│   │   ├── User.swift             # Data models
│   │   ├── FoodItem.swift
│   │   ├── FoodLog.swift
│   │   └── NutritionData.swift
│   │
│   ├── Services/
│   │   ├── HannahAI/
│   │   │   ├── OpenAIService.swift         # GPT-4/GPT-4 Vision integration
│   │   │   ├── BraveSearchService.swift   # Web search for nutrition data
│   │   │   ├── NutritionConfidenceService.swift # Confidence scoring
│   │   │   └── FoodParser.swift           # Text → Food data
│   │   │
│   │   ├── Nutrition/
│   │   │   ├── CalorieCalculator.swift    # BMR/TDEE
│   │   │   ├── MacroCalculator.swift      # Protein/Carbs/Fat
│   │   │   └── DeficitTracker.swift       # Running totals
│   │   │
│   │   └── Persistence/
│   │       ├── CoreDataStack.swift        # Core Data setup
│   │       └── UserDefaults+Ext.swift     # Simple storage
│
├── Features/                       # Feature Modules (SwiftUI)
│   ├── Dashboard/                  # NEW: Modular dashboard
│   │   ├── DashboardView.swift          # Main dashboard
│   │   ├── DashboardViewModel.swift     # Dashboard state
│   │   └── Modules/
│   │       ├── DailySummaryCard.swift
│   │       ├── QuickStatsGrid.swift
│   │       └── HannahAdviceCarousel.swift
│   │
│   ├── Chat/
│   │   ├── WorkingChatView.swift         # Main chat UI (ChatGPT-style)
│   │   ├── ChatViewModel.swift           # Chat logic & state
│   │   ├── CameraView.swift              # Camera capture wrapper
│   │   ├── ChatBubble.swift              # Legacy message component
│   │   └── ChatInputBar.swift            # Legacy input component
│   │
│   ├── Today/
│   │   ├── TodayView.swift               # Today's stats
│   │   ├── TodayViewModel.swift          # Calculations
│   │   ├── DeficitCard.swift             # Deficit display
│   │   └── MacroProgressView.swift       # Macro bars
│   │
│   ├── Onboarding/
│   │   ├── OnboardingFlow.swift          # Coordinator
│   │   ├── BiometricsView.swift          # Age/weight/height
│   │   └── GoalSelectionView.swift       # User goals
│   │
│   └── Shared/
│       ├── Components/                    # Reusable UI
│       │   ├── RoundedCard.swift
│       │   ├── ProgressRing.swift
│       │   ├── MidnightWaveBackground.swift      # Original OG background
│       │   ├── TimeOfDayBackgrounds.swift        # Dynamic time-based gradients
│       │   ├── SimpleMovingParticles.swift       # Animated firefly particles
│       │   ├── VortexTimeBackground.swift        # Vortex library integration (future)
│       │   └── VortexSimpleBackground.swift      # Vortex fallback
│       └── Modifiers/                     # SwiftUI modifiers
│           └── CardStyle.swift
│
├── Resources/
│   └── Assets.xcassets
│
└── Tests/
    ├── UnitTests/
    │   ├── CalorieCalculatorTests.swift
    │   └── ConfidenceCalculatorTests.swift
    └── UITests/
        └── OnboardingFlowTests.swift
```

## Key Component Implementations

### Chat System (WorkingChatView.swift)
The chat implementation uses several architectural patterns to handle complex UI requirements:

1. **Keyboard Management**:
   - Uses `Publishers.keyboardHeight` to observe keyboard state
   - Dynamic padding: `keyboardHeight > 0 ? keyboardHeight + 20 : 100`
   - Animation: `.easeOut(duration: 0.25)`

2. **View Decomposition** (prevents compiler timeout):
   - `chatHeader` - Navigation bar as computed property
   - `messagesScrollView` - Message list with scroll management
   - `inputBar` - Text input with camera button
   - `messageRow(for:)` - Individual message rendering

3. **Gesture Handling**:
   - `.scrollDismissesKeyboard(.interactively)` for swipe down
   - `DragGesture` on entire view for enhanced dismissal
   - Multiple gesture recognizers for better UX

4. **Photo Integration**:
   - `CameraView` wraps UIImagePickerController
   - Uses PhotosPicker for library access (iOS 16+)
   - GPT-4 Vision for food identification
   - Automatic calorie logging from photos

### AI Integration Architecture

1. **OpenAI Service**:
   - GPT-4o-mini for text conversations
   - GPT-4o for image analysis (Vision API)
   - Structured message format with content items
   - System prompts for Hannah personality

2. **Brave Search Integration**:
   - Real-time nutrition data search
   - Restaurant menu lookups
   - Smart query enhancement based on context
   - Domain-based confidence scoring

3. **Confidence System**:
   - 95%: Official restaurant sites with specific items
   - 90%: Nutrition databases (USDA, MyFitnessPal)
   - 85%: Common foods with known values
   - 65-80%: Estimated based on search quality
   - 50%: No search data available

## Architecture Rules

### 1. MVVM Pattern (Strict)
```swift
// ❌ BAD - Logic in View
struct ChatView: View {
    var body: some View {
        Button("Send") {
            // Don't calculate calories here!
            let calories = parseFood(text) * 4.2
        }
    }
}

// ✅ GOOD - Logic in ViewModel
struct ChatView: View {
    @StateObject var viewModel = ChatViewModel()
    
    var body: some View {
        Button("Send") {
            viewModel.sendMessage(text)
        }
    }
}
```

### 2. Dependency Injection
```swift
// ❌ BAD - Hard dependencies
class ChatViewModel {
    let service = HannahService() // Hard coded!
}

// ✅ GOOD - Injected dependencies
class ChatViewModel {
    let service: HannahServiceProtocol
    
    init(service: HannahServiceProtocol = HannahService()) {
        self.service = service
    }
}
```

### 3. Protocol-Oriented Design
```swift
// Every service has a protocol
protocol HannahServiceProtocol {
    func analyzeFood(_ text: String) async -> FoodAnalysis
}

// Makes testing easy
class MockHannahService: HannahServiceProtocol {
    func analyzeFood(_ text: String) async -> FoodAnalysis {
        // Return test data
    }
}
```

### 4. No Business Logic in Views
```swift
// ❌ BAD
struct TodayView: View {
    var body: some View {
        Text("\(calories * 4.184) kJ") // Don't convert here!
    }
}

// ✅ GOOD
struct TodayView: View {
    @StateObject var viewModel: TodayViewModel
    
    var body: some View {
        Text(viewModel.kilojoulesText) // Formatted in VM
    }
}
```

### 5. Async/Await for All Network Calls
```swift
// ✅ Modern Swift concurrency
func fetchFoodData() async throws -> [FoodItem] {
    // No completion handlers!
}
```

### 6. Error Handling
```swift
enum HannahError: LocalizedError {
    case networkError
    case invalidFood
    case confidenceTooLow
    
    var errorDescription: String? {
        switch self {
        case .networkError: return "Connection issue"
        case .invalidFood: return "Couldn't recognize that food"
        case .confidenceTooLow: return "Need more details"
        }
    }
}
```

## File Templates

### ViewModel Template
```swift
// ChatViewModel.swift
import Foundation
import Combine

@MainActor
final class ChatViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var messages: [ChatMessage] = []
    @Published var isLoading = false
    @Published var error: HannahError?
    
    // MARK: - Dependencies
    private let hannahService: HannahServiceProtocol
    private let nutritionService: NutritionServiceProtocol
    
    // MARK: - Init
    init(
        hannahService: HannahServiceProtocol = HannahService(),
        nutritionService: NutritionServiceProtocol = NutritionService()
    ) {
        self.hannahService = hannahService
        self.nutritionService = nutritionService
    }
    
    // MARK: - Public Methods
    func sendMessage(_ text: String) {
        Task {
            await processMessage(text)
        }
    }
    
    // MARK: - Private Methods
    private func processMessage(_ text: String) async {
        // Implementation
    }
}
```

### View Template
```swift
// ChatView.swift
import SwiftUI

struct ChatView: View {
    @StateObject private var viewModel = ChatViewModel()
    
    var body: some View {
        VStack {
            // UI here
        }
        .task {
            await viewModel.loadInitialData()
        }
        .alert(
            "Error",
            isPresented: $viewModel.showError,
            presenting: viewModel.error
        ) { _ in
            Button("OK") {}
        } message: { error in
            Text(error.localizedDescription)
        }
    }
}
```

## Code Review Checklist

Before ANY commit, check:
- [ ] No View exceeds 350 lines
- [ ] No ViewModel/Service exceeds 200 lines
- [ ] Each class/struct has single responsibility  
- [ ] ViewModels contain zero SwiftUI imports
- [ ] All services have protocol definitions
- [ ] Dependencies are injected, not hardcoded
- [ ] Async/await used for all async operations
- [ ] Error cases are handled
- [ ] No business logic in Views
- [ ] Complex views are broken into components
- [ ] All magic numbers are constants

## Performance Rules

1. **@StateObject** for ViewModels (created once)
2. **@ObservedObject** for passed ViewModels
3. **LazyVStack/LazyHStack** for lists
4. **Task.detached** for heavy computations
5. **@ViewBuilder** for conditional views
6. **.task** modifier for async lifecycle

## Testing Requirements

- Every Calculator/Service must have unit tests
- ViewModels must be testable with mock services
- Critical flows need UI tests
- Minimum 70% code coverage for Core/

## Git Commit Standards

```bash
# Format: <type>: <description>

feat: Add confidence scoring to food parser
fix: Correct calorie calculation for exercise
refactor: Split ChatView into smaller components
test: Add unit tests for MacroCalculator
docs: Update architecture guidelines
```

## When to Refactor

Refactor IMMEDIATELY when:
- View exceeds 350 lines
- ViewModel/Service exceeds 200 lines
- Function exceeds 20 lines
- Class has more than one responsibility
- You copy/paste code (make it reusable)
- View has calculation logic
- You see // TODO: fix later

## Architecture Review Status (January 30, 2025 - Updated)

### Current Review Score: 6/10 ⚠️ IMPROVING

#### ✅ Critical Issues Resolved (Session 19)

##### MealPlanKanbanView.swift Refactored Successfully
**Before**: 1,056 lines (3x over limit) 🚨
**After**: 113 lines ✅

**Refactoring Breakdown**:
- Extracted 8 new components/services
- Created clean separation of concerns
- Eliminated compiler timeout risk
- Improved maintainability and testability

**New Files Created**:
1. **MealPlanTypes.swift** (109 lines) - All data models
2. **FoodSearchService.swift** (216 lines) - Nutrition API logic
3. **MealPlanHelpers.swift** (73 lines) - Utility functions
4. **TimePickerSheet.swift** (53 lines) - Time picker component
5. **MealSlotCard.swift** (333 lines) - Meal slot component
6. **DayCard.swift** (190 lines) - Day view component
7. **MealPlanKanbanHeader.swift** (33 lines) - Header component

#### 🚨 Remaining Critical Violations

##### File Size Violations - ACTION REQUIRED
**Severely Oversized Files (2.5x+ over limit):**
1. **UserProfileView 2.swift: 907 lines** (557 lines over limit!)
   - Risk: High maintenance complexity
   - Contains: 195+ hardcoded countries, phone formatting, form validation
   
2. **InsightsPlaceholder.swift: 694 lines** (344 lines over limit!)
   - Risk: Performance degradation
   - Contains: Multiple unrelated features

**Moderately Oversized Files (1.5-2x over limit):**
3. **CaloriesView.swift: 627 lines** (277 lines over limit)
4. **TimeOfDayBackgrounds.swift: 586 lines** (236 lines over limit)
5. **MealPlanChatViewModel.swift: 540 lines** (340 lines over 200 limit for ViewModels)
6. **AuthManager.swift: 459 lines** (259 lines over 200 limit for Services)

##### 🔒 Security Vulnerabilities - CRITICAL
- **Hardcoded API keys** in AuthManager.swift
- Supabase credentials exposed: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
- Debug logging throughout production code
- Development skip buttons still present

##### 📊 Technical Debt Status
- **Test Coverage: 0%** - No unit tests implemented
- **Country Data**: 195+ countries hardcoded in UserProfileView
- **Debug Code**: Extensive print() statements in production
- **Magic Numbers**: Still present despite Constants.swift creation

#### ✅ Architecture Strengths (Maintained)
- Good MVVM pattern implementation
- Proper use of @MainActor and ObservableObject
- Well-structured service layer
- Clean dependency injection in most areas
- Good async/await patterns

#### 🎯 Immediate Action Items (Week 1 Priority)

1. **Split UserProfileView.swift (907 lines)**
   - [ ] Extract CountryPickerView.swift (~250 lines)
   - [ ] Create PhoneNumberFormatter.swift utility (~100 lines)
   - [ ] Move validation to UserProfileViewModel.swift (~150 lines)
   - [ ] Target: Reduce main view to <300 lines

2. **Split MealPlanKanbanView.swift (1,056 lines)**
   - [ ] Extract MealSlotView.swift (~200 lines)
   - [ ] Create MealEditingView.swift (~250 lines)
   - [ ] Separate DragDropHandler.swift (~200 lines)
   - [ ] Target: Reduce main view to <350 lines

3. **Security Fixes**
   - [ ] Move API keys to Config.plist (excluded from git)
   - [ ] Implement Keychain storage for sensitive data
   - [ ] Remove all hardcoded credentials

4. **Remove Debug Code**
   - [ ] Clean up all print() statements
   - [ ] Remove development skip buttons
   - [ ] Configure proper logging system

#### 📝 High Priority Tasks (Week 2)

5. **Split CaloriesView.swift (627 lines)**
   - [ ] Extract circular progress components
   - [ ] Separate TDEE explanation view
   - [ ] Create CalorieCalculations utility

6. **Implement Unit Testing**
   - [ ] DashboardViewModelTests
   - [ ] AuthManagerTests
   - [ ] TDEE calculation tests
   - [ ] Target: 30% coverage minimum

7. **Extract Data Files**
   - [ ] Move country data to Countries.json
   - [ ] Create proper resource loading
   - [ ] Reduce memory footprint

#### 📈 Success Metrics
- All view files <350 lines within 2 weeks
- All ViewModel/Service files <200 lines within 3 weeks
- Security audit passing within 1 week
- 30% test coverage within 2 weeks
- Compiler timeout risk eliminated

## AI Assistant Instructions

When reviewing code changes:
1. Check against ALL rules above
2. Suggest refactoring if rules are broken
3. Provide the correct pattern if rule is violated
4. Never allow "temporary" solutions
5. Flag any file exceeding line limits immediately

## Example: Adding a New Feature

When adding mood tracking:
1. Create `Core/Models/MoodEntry.swift`
2. Create `Core/Services/MoodService.swift` + Protocol
3. Create `Features/Mood/` folder
4. Add `MoodView.swift` and `MoodViewModel.swift`
5. Write tests for MoodService
6. Small commits for each component

---

**Remember**: It's easier to maintain 50 small files than 10 large ones. When in doubt, split it out!