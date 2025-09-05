//
//  MealPlanView.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct MealPlanView: View {
    var body: some View {
        MealPlanKanbanView()
    }
}

// Original MealPlanView kept as backup
struct MealPlanViewOriginal: View {
    @StateObject private var viewModel = MealPlanViewModel()
    @State private var showingEditSheet = false
    @State private var selectedMeal: PlannedMeal?
    
    var body: some View {
        ZStack {
            // Dynamic time-based background like dashboard
            DynamicTimeBackground()
                .ignoresSafeArea()
            
            ScrollView(showsIndicators: false) {
                VStack(spacing: 18) {
                    // Dashboard-style header
                    MealPlanHeader()
                        .padding(.top, 5)
                        .padding(.horizontal)
                    
                    if viewModel.isUnlocked {
                        unlockedContent
                    } else {
                        lockedContent
                    }
                }
                .padding(.top, 5)
            }
        }
    }
    
    private var lockedContent: some View {
        VStack(spacing: 24) {
            // Lock icon
            Image(systemName: "lock.circle.fill")
                .font(.system(size: 80))
                .foregroundColor(Theme.emerald)
                .padding(.top, 60)
            
            VStack(spacing: 12) {
                Text("Week 1 Magic")
                    .font(.system(size: 28, weight: .bold))
                    .foregroundColor(.white)
                
                Text("Your personalized meal plan unlocks after 7 days of tracking")
                    .font(.system(size: 16))
                    .foregroundColor(.white.opacity(0.7))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal)
            }
            
            // Progress indicator
            VStack(spacing: 16) {
                HStack {
                    ForEach(0..<7) { day in
                        Circle()
                            .fill(day < viewModel.daysTracked ? Theme.emerald : Theme.cardBorder)
                            .frame(width: 12, height: 12)
                    }
                }
                
                Text("\(viewModel.daysTracked) of 7 days tracked")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
                
                if viewModel.daysUntilUnlock > 0 {
                    Text("\(viewModel.daysUntilUnlock) more days to go!")
                        .font(.system(size: 16, weight: .semibold))
                        .foregroundColor(Theme.emerald)
                }
            }
            .padding(24)
            .background(Theme.glassMorphism)
            .cornerRadius(16)
            .overlay(
                RoundedRectangle(cornerRadius: 16)
                    .stroke(Theme.cardBorder)
            )
            .padding(.horizontal)
            
            Spacer()
        }
    }
    
    private var unlockedContent: some View {
        VStack(spacing: 20) {
            // Week selector (chat bubble style)
            weekSelector
                .padding(.horizontal)
            
            // Day tabs
            if let plan = viewModel.currentMealPlan {
                dayTabs(for: plan.planData.days)
                    .padding(.horizontal)
            }
            
            // Selected day meals
            if let selectedDay = viewModel.selectedDay {
                dayMealsContent(for: selectedDay)
                    .padding(.horizontal)
            }
            
            // Weekly goals card
            if let plan = viewModel.currentMealPlan {
                weeklyGoalsCard(plan.planData.weeklyGoals)
                    .padding(.horizontal)
            }
            
            // Bottom padding for tab bar
            Color.clear.frame(height: 140)
        }
    }
    
    private var weekSelector: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("This Week")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
                
                if let plan = viewModel.currentMealPlan {
                    Text(formatWeekDate(plan.weekStartDate))
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.white)
                }
            }
            
            Spacer()
            
            Button(action: {
                // Generate new meal plan
            }) {
                Image(systemName: "arrow.clockwise.circle.fill")
                    .font(.system(size: 28))
                    .foregroundColor(Theme.sky)
            }
        }
        .padding(16)
        .background(Theme.glassMorphism)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Theme.cardBorder)
        )
    }
    
    private func dayTabs(for days: [DayPlan]) -> some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                ForEach(days) { day in
                    dayTab(for: day)
                }
            }
        }
    }
    
    private func dayTab(for day: DayPlan) -> some View {
        let isSelected = viewModel.selectedDay?.id == day.id
        let isToday = Calendar.current.isDateInToday(day.date)
        
        return Button(action: {
            withAnimation(.easeInOut(duration: 0.2)) {
                viewModel.selectedDay = day
            }
        }) {
            VStack(spacing: 4) {
                Text(String(day.day.prefix(3)).uppercased())
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(isSelected ? .white : .white.opacity(0.7))
                
                Text("\(Calendar.current.component(.day, from: day.date))")
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(isSelected ? .white : .white.opacity(0.9))
                
                if isToday {
                    Circle()
                        .fill(isSelected ? Color.white : Theme.emerald)
                        .frame(width: 6, height: 6)
                }
            }
            .frame(width: 60, height: 70)
            .background(isSelected ? Theme.emerald : Theme.glassMorphism)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Theme.emerald.opacity(0.5) : Theme.cardBorder)
            )
        }
    }
    
    private func dayMealsContent(for day: DayPlan) -> some View {
        VStack(spacing: 12) {
            // Day header
            HStack {
                Text(day.day)
                    .font(.system(size: 20, weight: .semibold))
                    .foregroundColor(.white)
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 2) {
                    Text("\(day.totalCalories) cal")
                        .font(.system(size: 14, weight: .medium))
                        .foregroundColor(.white)
                    Text("P: \(Int(day.totalProtein))g • C: \(Int(day.totalCarbs))g • F: \(Int(day.totalFat))g")
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.7))
                }
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(Theme.glassMorphism)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Theme.cardBorder)
            )
            
            // Meals list (chat bubble style)
            ForEach(day.meals) { meal in
                mealCard(meal, for: day)
            }
        }
    }
    
    private func mealCard(_ meal: PlannedMeal, for day: DayPlan) -> some View {
        HStack(alignment: .top, spacing: 12) {
            // Meal type icon (similar to Hannah avatar in chat)
            Circle()
                .fill(mealTypeColor(meal.mealType))
                .frame(width: 36, height: 36)
                .overlay(
                    Image(systemName: mealTypeIcon(meal.mealType))
                        .font(.system(size: 16))
                        .foregroundColor(.white)
                )
            
            VStack(alignment: .leading, spacing: 4) {
                // Meal type and time
                HStack {
                    Text(meal.mealType.capitalized)
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.7))
                    
                    if let time = meal.time {
                        Text("• \(time)")
                            .font(.system(size: 12))
                            .foregroundColor(.white.opacity(0.7))
                    }
                }
                
                // Meal name
                Text(meal.name)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(.white)
                
                // Nutrition info
                HStack(spacing: 12) {
                    Text("\(meal.calories) cal")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(Theme.emerald)
                    
                    if let protein = meal.protein {
                        Text("P: \(Int(protein))g")
                            .font(.system(size: 12))
                            .foregroundColor(.white.opacity(0.7))
                    }
                    if let carbs = meal.carbs {
                        Text("C: \(Int(carbs))g")
                            .font(.system(size: 12))
                            .foregroundColor(.white.opacity(0.7))
                    }
                    if let fat = meal.fat {
                        Text("F: \(Int(fat))g")
                            .font(.system(size: 12))
                            .foregroundColor(.white.opacity(0.7))
                    }
                }
                
                // Notes if present
                if let notes = meal.notes {
                    Text(notes)
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.6))
                        .italic()
                }
            }
            
            Spacer()
            
            // Completion checkbox
            Button(action: {
                viewModel.toggleMealCompletion(meal, for: day)
            }) {
                Image(systemName: meal.isCompleted ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 24))
                    .foregroundColor(meal.isCompleted ? Theme.emerald : Theme.cardBorder)
            }
        }
        .padding(12)
        .background(Theme.glassMorphism)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Theme.cardBorder)
        )
    }
    
    private func weeklyGoalsCard(_ goals: WeeklyGoals) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Weekly Goals")
                .font(.system(size: 16, weight: .semibold))
                .foregroundColor(.white)
            
            HStack(spacing: 16) {
                goalItem("Calories", value: "\(goals.targetCalories)", unit: "per day")
                goalItem("Deficit", value: "\(goals.deficitGoal)", unit: "cal/day")
            }
            
            HStack(spacing: 16) {
                goalItem("Protein", value: "\(Int(goals.targetProtein))", unit: "g/day")
                goalItem("Carbs", value: "\(Int(goals.targetCarbs))", unit: "g/day")
                goalItem("Fat", value: "\(Int(goals.targetFat))", unit: "g/day")
            }
        }
        .padding(16)
        .background(Theme.glassMorphism)
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Theme.cardBorder)
        )
    }
    
    private func goalItem(_ label: String, value: String, unit: String) -> some View {
        VStack(alignment: .leading, spacing: 2) {
            Text(label)
                .font(.system(size: 12))
                .foregroundColor(.white.opacity(0.7))
            HStack(spacing: 2) {
                Text(value)
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundColor(.white)
                Text(unit)
                    .font(.system(size: 12))
                    .foregroundColor(.white.opacity(0.7))
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
    
    // Helper functions
    private func mealTypeColor(_ type: String) -> Color {
        switch type.lowercased() {
        case "breakfast": return Color(hex: "FDA4AF")  // Rose 300
        case "lunch": return Color(hex: "F59E0B")      // Amber 400  
        case "dinner": return Color(hex: "6366F1")      // Indigo 400
        case "snack": return Color(hex: "10B981")       // Emerald 400
        default: return Theme.cardBorder
        }
    }
    
    private func mealTypeIcon(_ type: String) -> String {
        switch type.lowercased() {
        case "breakfast": return "sun.and.horizon.fill"
        case "lunch": return "sun.max.fill"
        case "dinner": return "moon.fill"
        case "snack": return "leaf.fill"
        default: return "fork.knife"
        }
    }
    
    private func formatWeekDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d - "
        let start = formatter.string(from: date)
        
        let endDate = Calendar.current.date(byAdding: .day, value: 6, to: date) ?? date
        formatter.dateFormat = "MMM d"
        let end = formatter.string(from: endDate)
        
        return start + end
    }
}

// Dashboard-style header component
struct MealPlanHeader: View {
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Your weekly")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
                
                Text("Meal Plan")
                    .font(Theme.title)
                    .foregroundColor(.white)
                    .fontWeight(.bold)
            }
            
            Spacer()
            
            Button {
                // Settings action
            } label: {
                Circle()
                    .fill(Theme.glassMorphism)
                    .frame(width: 44, height: 44)
                    .overlay(
                        Image(systemName: "slider.horizontal.3")
                            .font(.title2)
                            .foregroundColor(.white)
                    )
            }
        }
        .padding(.top, 8)
    }
}