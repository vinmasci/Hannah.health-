# Quick Chat Feature Specification

## Overview
Transform the "+" button into a context-aware "Quick Chat" that opens as a bottom drawer, allowing real-time edits without leaving the current screen.

## Core Concept
- **Current**: "+" button → Quick Add modal (log food, exercise, water, etc.)
- **New**: "+" button → Quick Chat drawer with Hannah who understands your current screen context

## Technical Implementation

### 1. Context Detection System
```swift
enum ChatContext: String {
    case dashboard = "User is viewing their daily dashboard. Help with logging food, checking calories, or reviewing today's progress."
    case mealPlan = "User is on the Meal Plan screen. Help edit meals, suggest recipes, swap foods, or plan upcoming days."
    case shopping = "User is viewing their shopping list. Help add items, check ingredients, or organize the list."
    
    var systemPrompt: String {
        return """
        You are Hannah, a nutrition assistant. 
        CONTEXT: \(self.rawValue)
        Keep responses brief and action-focused.
        Automatically perform actions when clear (don't ask for confirmation).
        """
    }
    
    var placeholder: String {
        switch self {
        case .dashboard: return "Quick log food or ask about today..."
        case .mealPlan: return "Edit meals or get recipe ideas..."
        case .shopping: return "Add items or check your list..."
        }
    }
}
```

### 2. QuickChatDrawer Component
**File**: `Features/Chat/QuickChatDrawer.swift`

**Key Features**:
- Height: 40% of screen (same as current modal)
- Simplified chat interface (no history)
- Auto-dismiss after successful action
- Keyboard-aware positioning
- Swipe down to dismiss

**UI Structure**:
```
┌─────────────────────────────┐
│  ━━━━  (drag handle)        │
│                             │
│  Quick Chat with Hannah     │
│  ─────────────────────      │
│                             │
│  [Hannah's response]        │
│                             │
│  [Hannah is typing...]      │
│                             │
│  ┌─────────────────────┐    │
│  │ 📷  Message Hannah.. │    │
│  └─────────────────────┘    │
└─────────────────────────────┘
```

### 3. Integration Points

**ContentView.swift** modifications:
- Add `@State private var showQuickChat = false`
- Add `@State private var chatContext: ChatContext`
- Pass context based on `selectedTab`

**CustomTabBar.swift** modifications:
- Change center button action from quick add to quick chat
- Pass binding for `showQuickChat`

**ChatViewModel.swift** extensions:
- Add `quickChatMode: Bool` property
- Add `context: ChatContext?` property
- Modify system prompt based on context
- Add auto-action detection

### 4. Smart Actions by Context

#### Dashboard Context
- "I ate a burger and fries" → Auto-logs ~850 calories
- "How many calories left?" → Shows remaining
- "Log my workout" → Opens exercise logger

#### Meal Plan Context  
- "Add salmon to Tuesday lunch" → Directly edits that meal
- "What goes with chicken?" → Suggests sides
- "Move Wednesday dinner to Thursday" → Drag-drop action
- "Make this week vegetarian" → Bulk meal updates

#### Shopping Context
- "Add milk and eggs" → Adds to list
- "Do I have chicken?" → Checks list
- "Ingredients for tacos" → Adds multiple items

### 5. Implementation Steps

1. **Create ChatContext enum** (15 min)
   - Define contexts and system prompts
   - Add placeholder text variants

2. **Build QuickChatDrawer.swift** (45 min)
   - Bottom sheet presentation
   - Simplified chat UI
   - Keyboard management
   - Swipe gestures

3. **Extend ChatViewModel** (30 min)
   - Add context awareness
   - Quick action detection
   - Auto-dismiss logic

4. **Update Navigation** (20 min)
   - Modify CustomTabBar
   - Add state to ContentView
   - Wire up presentations

5. **Test Each Context** (30 min)
   - Verify context detection
   - Test auto-actions
   - Ensure proper dismissal

## UI Specifications

### Colors & Styling
- Background: `Color.black.opacity(0.7)` with blur
- Drawer: Glass morphism matching existing cards
- Text: Standard chat styling from WorkingChatView

### Animations
- Slide up: `.spring(response: 0.5, dampingFraction: 0.8)`
- Dismiss: `.easeOut(duration: 0.3)`
- Keyboard: Match existing 0.25s easeOut

### Dimensions
- Height: `UIScreen.main.bounds.height * 0.4`
- Corner radius: 20 (top corners only)
- Padding: 20pt horizontal, 16pt vertical
- Input bar height: 52pt

## Benefits
1. **No Context Switching**: Stay on current screen while chatting
2. **Faster Actions**: Hannah knows what you're looking at
3. **Smart Suggestions**: Context-appropriate responses
4. **Reduced Friction**: Quick interactions without navigation

## Success Metrics
- Actions complete in <3 messages
- 80% of interactions don't require screen switch
- Auto-dismiss rate >60% (successful action detected)

## Future Enhancements
- Voice input for hands-free operation
- Predictive suggestions based on time of day
- Multi-action commands ("log lunch and add groceries")
- Visual feedback for completed actions

## Architecture Compliance
- QuickChatDrawer.swift: ~150 lines (within 350 limit)
- Reuses existing ChatViewModel (no duplication)
- Follows MVVM pattern strictly
- Protocol-based for testability