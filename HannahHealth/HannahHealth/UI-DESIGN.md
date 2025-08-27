# Hannah Health UI Design System

## Design Direction
Moving from kanban board to a modern, modular dashboard with bottom navigation inspired by leading health apps.

## Core Design Principles
1. **Dark Mode First** - Deep navy/purple gradient background with glassmorphic elements
2. **Modular Cards** - Draggable, customizable dashboard modules
3. **Bottom Navigation** - Primary navigation with 5 key areas
4. **Full-Screen Chat** - ChatGPT-style interface for Hannah conversations
5. **Confidence Transparency** - Show AI confidence scores on food logging

## Color Palette
```swift
// Primary Colors
let backgroundGradient = LinearGradient(
    colors: [
        Color(hex: "0A0E27"), // Deep navy
        Color(hex: "1B1464")  // Deep purple
    ]
)

// Accent Colors
let oceanBlue = Color(hex: "4361EE")
let coral = Color(hex: "FF6B6B")
let mint = Color(hex: "4ECDC4")
let lavender = Color(hex: "C06FFF")
let emerald = Color(hex: "10B981")
let sky = Color(hex: "38BDF8")

// Glass Effects
let cardBackground = Color.black.opacity(0.3)
let cardBorder = Color.white.opacity(0.1)
```

## Typography
- **Font**: SF Rounded for friendliness
- **Heading**: 24pt bold
- **Body**: 17pt regular
- **Caption**: 14pt regular
- **Confidence**: 12pt medium

## Navigation Structure

### Bottom Tab Bar
```
[Dashboard] [Chat] [+] [Meal Plan] [Shopping]
```
- **Dashboard**: Modular home screen
- **Chat**: Full-screen Hannah conversation
- **+**: Quick add food/photo
- **Meal Plan**: Weekly meal planning
- **Shopping**: Smart grocery list

## Screen Designs

### 1. Dashboard Screen
**Layout**: Scrollable grid of modules (inspired by MyFitnessPal)

**Modules**:
- **Daily Summary Card**
  - Circular progress ring
  - Calories remaining
  - Macro breakdown
  - Confidence indicator

- **Quick Stats Grid** (2x2)
  - Steps with progress bar
  - Water intake
  - Exercise minutes
  - Weight trend

- **Hannah's Daily Advice**
  - Horizontal scroll of tip cards
  - Personalized recommendations
  - Recipe suggestions

- **Recent Foods**
  - List of today's logged items
  - Confidence scores visible
  - Tap to edit

**Interaction**:
- Long press to enter edit mode
- Drag to reorder modules
- Pinch to resize (future)

### 2. Chat Screen (Full Screen) - IMPLEMENTED ✅
**Layout**: ChatGPT-style interface

**Implementation**: `WorkingChatView.swift`

**Components**:
- **Header Bar**
  - "Hannah" title center
  - Sidebar icon left (sidebar.left)
  - New chat icon right (square.and.pencil)
  - Dark background (#202123) with subtle divider

- **Message List**
  - User messages: Right aligned with person avatar
  - Hannah messages: Left aligned with green "H" avatar
  - Clean typography (16pt) with no bubble styling
  - Confidence scores: Subtle gray text (12pt) below food logging messages
  - Avatar colors: Hannah (#10A37F), User (#8E8EA0)
  - Background: Dark (#202123)
  - Typing indicator: Three animated dots with Hannah avatar

- **Input Bar**
  - Dark gray background (#40414F) with border (#565869)
  - Camera button on left for photo/image capture
  - Text field with "Message Hannah..." placeholder
  - Send button: Gray when empty, white when text entered
  - Disclaimer text: "Hannah can make mistakes. Check important info."
  - Keyboard-aware: Moves up with keyboard using Publishers.keyboardHeight

**Features Implemented**:
- ✅ Swipe down to dismiss keyboard (.scrollDismissesKeyboard)
- ✅ Enhanced swipe gesture for easier keyboard dismissal
- ✅ Camera integration with photo library picker
- ✅ Keyboard height animation (0.25s easeOut)
- ✅ Auto-scroll to latest message
- ✅ Photo capture and library selection via PhotosPicker
- ✅ Confidence scoring display with smart calculations
- ✅ Dynamic padding: 100pt without keyboard, keyboard height + 20pt with keyboard
- ✅ GPT-4 Vision integration for food photo analysis
- ✅ Brave Search for real-time nutrition data
- ✅ Restaurant menu lookups and healthy alternatives
- ✅ Image display in chat messages
- ✅ Automatic food logging with calorie counts

### 3. Quick Add (+) Modal
**Layout**: Bottom sheet modal

**Options**:
- 📸 Take Photo
- 🍽️ Log Food
- 💪 Log Exercise
- 💧 Log Water
- ⚖️ Log Weight

### 4. Meal Plan Screen
**Layout**: Week view with day columns

**Components**:
- Week selector at top
- Daily meal cards (Breakfast, Lunch, Dinner, Snacks)
- Drag & drop between days
- AI suggestions panel

### 5. Shopping List Screen
**Layout**: Grouped list by category

**Components**:
- Smart categorization
- Check off items
- Add custom items
- Share list feature

## Component Library

### Glass Card
```swift
struct GlassCard: View {
    var body: some View {
        RoundedRectangle(cornerRadius: 20)
            .fill(Color.black.opacity(0.3))
            .background(.ultraThinMaterial)
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(Color.white.opacity(0.1))
            )
    }
}
```

### Confidence Badge
```swift
struct ConfidenceBadge: View {
    let confidence: Double
    
    var color: Color {
        switch confidence {
        case 0.9...1.0: return .green
        case 0.7..<0.9: return .yellow
        default: return .orange
        }
    }
    
    var body: some View {
        Text("\(Int(confidence * 100))% confident")
            .font(.caption2)
            .foregroundColor(color)
    }
}
```

### Bottom Tab Bar
```swift
struct CustomTabBar: View {
    @Binding var selectedTab: Tab
    
    var body: some View {
        HStack {
            TabButton(icon: "rectangle.3.group.fill", tab: .dashboard)
            TabButton(icon: "message", tab: .chat)
            AddButton() // Green gradient, 56pt diameter
            TabButton(icon: "calendar", tab: .mealPlan)
            TabButton(icon: "cart", tab: .shopping)
        }
        .padding()
        .background(.ultraThinMaterial)
        .background(Color.black.opacity(0.3))
        // Note: Simplified design - removed curve after implementation challenges
        // Tab bar is now a clean rectangle with floating + button
    }
}
```

## Background & Particle System

### Dynamic Time-Based Backgrounds
The app features a sophisticated background system that transitions through different times of day:

**Time Periods & Color Schemes**:
- **Early Morning (5am-7am)**: Deep dawn blues transitioning to pink horizons
- **Morning (7am-10am)**: Bright sky blues with golden yellows  
- **Midday (10am-3pm)**: Vibrant blue sky with turquoise accents
- **Afternoon (3pm-5pm)**: Warm teal fading to gold
- **Sunset (5pm-7pm)**: Dramatic coral, orange, and pink gradients
- **Evening (7pm-9pm)**: Dark blue-gray with dusty purple tones
- **Night (9pm-11pm)**: Deep blues and charcoal
- **Midnight (11pm-5am)**: **OG COLORS PRESERVED** - Deep midnight blue (#0D1B2A) to deep purple (#2C2348)

### Animated Particle System
**SimpleMovingParticles.swift** provides magical floating firefly effects:

**Particle Characteristics**:
- **Count**: 15 particles per screen (optimized for performance)
- **Size**: 2-5 pixel circles with soft edges
- **Movement**: Linear paths between random positions (8-15 second duration)
- **Pulsing**: Scale effect (0.8x-1.3x) with opacity changes (40%-90%)
- **Colors**: Time-appropriate (white at midnight, golden at sunrise, etc.)

**Performance Optimizations**:
- Simple linear animations (no complex physics)
- Independent movement and pulsing animations
- Geometry validation to prevent crashes
- Reduced from initial 30 particles to 15

### Wave Layers
Organic wave animations provide depth:
- 4 wave layers with different frequencies
- Subtle movement creating living background
- Colors adapt to time of day

## Animations
- **Tab Switch**: Spring animation (0.3s)
- **Module Reorder**: Smooth drag with haptic feedback
- **Chat Messages**: Slide in from bottom
- **Confidence Score**: Fade in after message
- **Loading States**: Shimmer effect on cards
- **Particle Movement**: Linear 8-15s with auto-reverse
- **Particle Pulsing**: 1.5-3s breathing effect
- **Background Transitions**: 2s smooth fade between time periods

## Accessibility
- VoiceOver support for all interactive elements
- Dynamic Type support
- High contrast mode compatible
- Haptic feedback for key actions
- Voice input for chat

## Implementation Plan

### Phase 1: Navigation Restructure (Day 1)
1. Remove kanban board completely
2. Implement tab bar navigation
3. Create navigation coordinator
4. Set up screen containers

### Phase 2: Dashboard (Day 2-3)
1. Build modular card system
2. Implement daily summary card
3. Add quick stats grid
4. Create Hannah's advice carousel
5. Add drag-to-reorder functionality

### Phase 3: Chat Redesign (Day 4-5)
1. Create full-screen chat view
2. Update message bubble design
3. Add confidence badges
4. Implement input bar with camera
5. Add typing indicators

### Phase 4: Secondary Screens (Day 6-7)
1. Build quick add modal
2. Create meal plan screen
3. Implement shopping list
4. Add settings/profile

### Phase 5: Polish (Day 8)
1. Animations and transitions
2. Haptic feedback
3. Error states
4. Loading states
5. Empty states

## Technical Requirements
- iOS 15.0+
- SwiftUI 3.0
- Core Data for persistence
- CloudKit sync (future)
- HealthKit integration

## Performance Targets
- App launch: < 1 second
- Screen transition: < 300ms
- Chat response: < 2 seconds
- Module reorder: 60 fps
- Memory usage: < 100MB

## Files to Update
1. `ContentView.swift` - Replace with TabView
2. `KanbanBoardView.swift` - Delete
3. `DashboardView.swift` - New main screen
4. `ChatView.swift` - Redesign for full screen
5. `TabBar.swift` - New component
6. `ModuleCard.swift` - New component system