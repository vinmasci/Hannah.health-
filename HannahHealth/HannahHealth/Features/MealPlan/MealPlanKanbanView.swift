//
//  MealPlanKanbanView.swift
//  HannahHealth
//
//  Kanban-style meal plan with integrated chat panel
//

import SwiftUI

struct MealPlanKanbanView: View {
    @StateObject private var viewModel = MealPlanViewModel()
    @StateObject private var chatViewModel = MealPlanChatViewModel()
    @State private var scrollOffset: CGFloat = 0
    @State private var selectedMealSlots: Set<MealSlot> = []
    
    // Get date for each day of the current week
    private func dateForDay(_ day: DayOfWeek) -> Date {
        let calendar = Calendar.current
        let today = Date()
        let weekday = calendar.component(.weekday, from: today)
        let daysFromMonday = (weekday == 1 ? 6 : weekday - 2) // Sunday = 1, Monday = 2
        let monday = calendar.date(byAdding: .day, value: -daysFromMonday, to: today)!
        
        let dayOffset: Int
        switch day {
        case .monday: dayOffset = 0
        case .tuesday: dayOffset = 1
        case .wednesday: dayOffset = 2
        case .thursday: dayOffset = 3
        case .friday: dayOffset = 4
        case .saturday: dayOffset = 5
        case .sunday: dayOffset = 6
        }
        
        return calendar.date(byAdding: .day, value: dayOffset, to: monday)!
    }
    
    var body: some View {
        GeometryReader { geometry in
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 20) {
                    // Column 1: Meal Plan
                    mealPlanColumn
                        .frame(width: geometry.size.width - 40)
                    
                    // Column 2: Chat Panel
                    VStack {
                        Spacer().frame(height: 5)  // Very minimal top spacing
                        
                        chatPanel
                            .frame(width: geometry.size.width - 40)
                            .frame(maxHeight: .infinity)
                        
                        Spacer().frame(height: 80) // Further reduced bottom spacing
                    }
                }
                .padding(.horizontal, 20)
            }
            .scrollDisabled(false)
            .onAppear {
                chatViewModel.setMealPlanViewModel(viewModel)
            }
        }
        .padding(.vertical, 20)
    }
    
    private var mealPlanColumn: some View {
        ScrollView {
            VStack(spacing: 16) {
                // Week header
                HStack {
                    Text("This Week")
                        .font(.system(size: 28, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Button(action: { /* Week selector */ }) {
                        Image(systemName: "calendar")
                            .foregroundColor(.white.opacity(0.7))
                    }
                }
                .padding(.horizontal, 4)
                
                // Instructions
                Text("Tap meals to select, then swipe left to discuss with Hannah what you would like to add to your meal plan")
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.5))
                    .padding(.horizontal, 4)
                    .padding(.bottom, 8)
                
                // Days of the week
                ForEach(DayOfWeek.allCases, id: \.self) { day in
                    dayCard(for: day)
                }
            }
            .padding(.vertical, 20)
        }
    }
    
    private func dayCard(for day: DayOfWeek) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text(day.name)
                    .font(.system(size: 20, weight: .semibold, design: .rounded))
                    .foregroundColor(.white)
                
                Spacer()
                
                // Display date
                Text(dateForDay(day), style: .date)
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.6))
            }
            
            // Display all meal/snack slots for this day
            ForEach(viewModel.getSlots(for: day)) { slot in
                mealSlotCard(day: day, slot: slot)
            }
            
            // Add snack slot button
            Button(action: {
                withAnimation(.spring(duration: 0.3)) {
                    viewModel.addSnackSlot(for: day)
                }
            }) {
                HStack {
                    Image(systemName: "plus.circle.fill")
                        .font(.system(size: 16))
                        .foregroundColor(Color(hex: "10A37F"))
                    
                    Text("Add Snack Time")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(Color(hex: "10A37F"))
                    
                    Spacer()
                }
                .padding(12)
                .background(Color(hex: "10A37F").opacity(0.1))
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color(hex: "10A37F").opacity(0.3), lineWidth: 1)
                )
            }
        }
        .padding(16)
        .background(Color.black.opacity(0.5))
        .cornerRadius(20)
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.white.opacity(0.05))
        )
    }
    
    private func mealSlotCard(day: DayOfWeek, slot: DayMealSlot) -> some View {
        let mealSlot = MealSlot(day: day, slotId: slot.id)
        let isSelected = selectedMealSlots.contains(mealSlot)
        
        return VStack(alignment: .leading, spacing: 8) {
            HStack {
                // Icon based on meal type
                Image(systemName: getIcon(for: slot.slotType))
                    .font(.system(size: 16))
                    .foregroundColor(getIconColor(for: slot.slotType))
                
                Text(slot.slotType.displayName)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
                
                Spacer()
                
                // Editable time
                Text(slot.time)
                    .font(.system(size: 12))
                    .foregroundColor(.white.opacity(0.5))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(6)
                    .onTapGesture {
                        // TODO: Show time picker
                    }
                
                // Delete button for snack slots only
                if slot.slotType == .snacks {
                    Button(action: {
                        withAnimation(.spring(duration: 0.3)) {
                            viewModel.removeSlot(for: day, slotId: slot.id)
                        }
                    }) {
                        Image(systemName: "minus.circle")
                            .font(.system(size: 14))
                            .foregroundColor(.white.opacity(0.3))
                    }
                }
            }
            
            // Meal content
            if let meal = slot.meal {
                HStack {
                    Text(meal.name)
                        .font(.system(size: 16))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Text("\(meal.calories) cal")
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.5))
                }
            } else {
                Text("Tap to add")
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.3))
            }
        }
        .padding(12)
        .background(Color.white.opacity(isSelected ? 0.15 : 0.05))
        .cornerRadius(8)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(isSelected ? Color(hex: "10A37F") : Color.clear, lineWidth: 2)
        )
        .onTapGesture {
            withAnimation(.spring(duration: 0.3)) {
                if isSelected {
                    selectedMealSlots.remove(mealSlot)
                } else {
                    selectedMealSlots.insert(mealSlot)
                }
                chatViewModel.setSelectedSlots(selectedMealSlots)
            }
        }
    }
    
    private func getIcon(for slotType: MealSlotType) -> String {
        switch slotType {
        case .meal(let mealType):
            switch mealType {
            case .breakfast: return "sun.max.fill"
            case .lunch: return "sun.and.horizon.fill"
            case .dinner: return "moon.stars.fill"
            }
        case .snacks:
            return "leaf.fill"
        }
    }
    
    private func getIconColor(for slotType: MealSlotType) -> Color {
        switch slotType {
        case .meal(let mealType):
            switch mealType {
            case .breakfast: return Color(hex: "FFB84D") // Warm orange
            case .lunch: return Color(hex: "4ECDC4")     // Mint
            case .dinner: return Color(hex: "C06FFF")    // Lavender
            }
        case .snacks:
            return Color(hex: "10A37F") // Green
        }
    }
    
    
    private var chatPanel: some View {
        MealPlanChatPanel(
            viewModel: chatViewModel,
            selectedSlots: $selectedMealSlots
        )
    }
}

// MARK: - Supporting Types
enum DayOfWeek: String, CaseIterable {
    case monday, tuesday, wednesday, thursday, friday, saturday, sunday
    
    var name: String {
        switch self {
        case .monday: return "Monday"
        case .tuesday: return "Tuesday"
        case .wednesday: return "Wednesday"
        case .thursday: return "Thursday"
        case .friday: return "Friday"
        case .saturday: return "Saturday"
        case .sunday: return "Sunday"
        }
    }
}

enum MealType: String, CaseIterable {
    case breakfast, lunch, dinner
    
    var displayName: String {
        switch self {
        case .breakfast: return "Breakfast"
        case .lunch: return "Lunch"  
        case .dinner: return "Dinner"
        }
    }
}

// Meal struct needs to be defined first
struct Meal: Equatable, Hashable {
    let name: String
    let calories: Int
    let id = UUID()
    
    static func == (lhs: Meal, rhs: Meal) -> Bool {
        lhs.id == rhs.id
    }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}

// Represents any meal/snack slot in the day
enum MealSlotType: Equatable, Hashable {
    case meal(MealType)
    case snacks
    
    var displayName: String {
        switch self {
        case .meal(let type):
            return type.displayName
        case .snacks:
            return "Snacks"
        }
    }
}

struct DayMealSlot: Identifiable, Equatable, Hashable {
    let id = UUID()
    let slotType: MealSlotType
    var time: String
    var meal: Meal?
    
    init(slotType: MealSlotType, time: String, meal: Meal? = nil) {
        self.slotType = slotType
        self.time = time
        self.meal = meal
    }
    
    static func == (lhs: DayMealSlot, rhs: DayMealSlot) -> Bool {
        lhs.id == rhs.id && 
        lhs.slotType == rhs.slotType && 
        lhs.time == rhs.time && 
        lhs.meal?.id == rhs.meal?.id
    }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
        hasher.combine(slotType)
        hasher.combine(time)
        hasher.combine(meal?.id)
    }
}

struct MealSlot: Equatable, Hashable {
    let day: DayOfWeek
    let slotId: UUID
}