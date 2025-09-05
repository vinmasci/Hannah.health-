//
//  MealPlanViewModel.swift
//  HannahHealth
//
//  Created on 27/8/2025.
//

import Foundation
import SwiftUI

@MainActor
class MealPlanViewModel: ObservableObject {
    @Published var currentMealPlan: MealPlan?
    @Published var selectedDay: DayPlan?
    @Published var isLoading = false
    @Published var errorMessage: String?
    @Published var daysTracked = 7 // Unlocked for testing
    @Published var daySlots: [DayOfWeek: [DayMealSlot]] = [:]
    @Published var collapsedDays: Set<DayOfWeek> = []
    
    private let supabaseService = SupabaseService.shared
    private let openAIService = OpenAIService()
    
    var daysUntilUnlock: Int {
        max(0, 7 - daysTracked)
    }
    
    var isUnlocked: Bool {
        daysTracked >= 7
    }
    
    init() {
        // Load mock data for testing
        loadMockMealPlan()
        initializeDaySlots()
    }
    
    private func initializeDaySlots() {
        // Initialize each day with breakfast, snacks, lunch, dinner
        for day in DayOfWeek.allCases {
            daySlots[day] = [
                DayMealSlot(slotType: .meal(.breakfast), time: "8:00 AM"),
                DayMealSlot(slotType: .snacks, time: "10:00 AM"),
                DayMealSlot(slotType: .meal(.lunch), time: "12:30 PM"),
                DayMealSlot(slotType: .snacks, time: "3:00 PM"),
                DayMealSlot(slotType: .meal(.dinner), time: "7:00 PM"),
                DayMealSlot(slotType: .snacks, time: "9:00 PM")
            ]
        }
    }
    
    func loadMockMealPlan() {
        // Create sample meal plan for testing UI
        let meals = [
            PlannedMeal(
                mealType: "breakfast",
                name: "Greek Yogurt with Berries",
                calories: 320,
                protein: 18,
                carbs: 42,
                fat: 8,
                time: "8:00 AM",
                notes: "High protein start",
                isCompleted: false
            ),
            PlannedMeal(
                mealType: "lunch",
                name: "Grilled Chicken Salad",
                calories: 450,
                protein: 35,
                carbs: 25,
                fat: 22,
                time: "12:30 PM",
                notes: "Extra veggies",
                isCompleted: false
            ),
            PlannedMeal(
                mealType: "snack",
                name: "Apple with Almond Butter",
                calories: 180,
                protein: 4,
                carbs: 25,
                fat: 9,
                time: "3:30 PM",
                notes: nil,
                isCompleted: false
            ),
            PlannedMeal(
                mealType: "dinner",
                name: "Salmon with Quinoa",
                calories: 520,
                protein: 38,
                carbs: 45,
                fat: 18,
                time: "7:00 PM",
                notes: "Omega-3 rich",
                isCompleted: false
            )
        ]
        
        var days: [DayPlan] = []
        let calendar = Calendar.current
        let today = Date()
        
        for i in 0..<7 {
            let date = calendar.date(byAdding: .day, value: i, to: today)!
            let dayName = calendar.weekdaySymbols[calendar.component(.weekday, from: date) - 1]
            
            days.append(DayPlan(
                day: dayName,
                date: date,
                meals: meals,
                totalCalories: meals.reduce(0) { $0 + $1.calories },
                totalProtein: meals.reduce(0) { $0 + ($1.protein ?? 0) },
                totalCarbs: meals.reduce(0) { $0 + ($1.carbs ?? 0) },
                totalFat: meals.reduce(0) { $0 + ($1.fat ?? 0) }
            ))
        }
        
        let planData = MealPlanData(
            days: days,
            weeklyGoals: WeeklyGoals(
                targetCalories: 1800,
                targetProtein: 120,
                targetCarbs: 180,
                targetFat: 60,
                deficitGoal: 500
            ),
            suggestions: [
                "Try meal prepping on Sundays",
                "Keep healthy snacks ready",
                "Drink water before each meal"
            ]
        )
        
        currentMealPlan = MealPlan(
            id: UUID().uuidString,
            userId: "mock-user",
            weekStartDate: today,
            planData: planData,
            isActive: true,
            createdAt: Date()
        )
        
        // Select today by default
        selectedDay = days.first
    }
    
    func generateMealPlan(from userMessage: String) async {
        // Commented out until we set up environment variables
        /*
        isLoading = true
        errorMessage = nil
        
        do {
            // Build prompt for meal plan generation
            let systemPrompt = """
            You are a nutrition expert creating personalized meal plans. 
            Generate a 7-day meal plan based on the user's request.
            Include breakfast, lunch, dinner, and one snack per day.
            Provide realistic calorie counts and macros.
            Keep meals simple and practical.
            Return in a structured format.
            """
            
            let messages = [
                OpenAIMessage(role: "system", content: systemPrompt),
                OpenAIMessage(role: "user", content: userMessage)
            ]
            
            let response = try await openAIService.sendMessage(messages, searchContext: nil)
            
            // Parse response and update meal plan
            // For now, just log the response
            print("📱 Meal plan generation response: \(response)")
            
            // In real implementation, we would:
            // 1. Parse the AI response into MealPlan structure
            // 2. Save to Supabase
            // 3. Update currentMealPlan
            
        } catch {
            errorMessage = "Failed to generate meal plan: \(error.localizedDescription)"
        }
        
        isLoading = false
        */
    }
    
    func updateMeal(_ meal: PlannedMeal, for day: DayPlan) {
        // Update meal in the plan
        // This would save to Supabase in real implementation
    }
    
    func toggleMealCompletion(_ meal: PlannedMeal, for day: DayPlan) {
        // Toggle meal completion status
        // This would save to Supabase in real implementation
    }
    
    // MARK: - Slot Management
    func addSnackSlot(for day: DayOfWeek) {
        guard var slots = daySlots[day] else { return }
        
        // Determine time based on existing slots
        let time = determineSnackTime(for: slots)
        let newSnackSlot = DayMealSlot(slotType: .snacks, time: time)
        
        // Insert snack slot at appropriate position
        // For now, append at the end
        slots.append(newSnackSlot)
        daySlots[day] = slots
    }
    
    private func determineSnackTime(for slots: [DayMealSlot]) -> String {
        let snackCount = slots.filter { $0.slotType == .snacks }.count
        switch snackCount {
        case 0: return "10:00 AM"  // Morning snack
        case 1: return "3:00 PM"   // Afternoon snack
        case 2: return "8:30 PM"   // Evening snack
        default: return "Snack"     // Generic
        }
    }
    
    func removeSlot(for day: DayOfWeek, slotId: UUID) {
        daySlots[day]?.removeAll { $0.id == slotId }
    }
    
    func getSlots(for day: DayOfWeek) -> [DayMealSlot] {
        return daySlots[day] ?? []
    }
    
    func updateSlotTime(for day: DayOfWeek, slotId: String, newTime: String) {
        guard var slots = daySlots[day],
              let index = slots.firstIndex(where: { $0.id.uuidString == slotId }) else { return }
        
        slots[index].time = newTime
        daySlots[day] = slots
    }
    
    func updateMealName(for day: DayOfWeek, slotId: String, newName: String) {
        guard var slots = daySlots[day],
              let index = slots.firstIndex(where: { $0.id.uuidString == slotId }) else { return }
        
        // Update the first meal's name if it exists, otherwise add a new meal
        if !slots[index].meals.isEmpty {
            slots[index].meals[0].name = newName
        } else {
            slots[index].meals = [Meal(name: newName, calories: 0, protein: nil, carbs: nil, fat: nil, confidence: nil)]
        }
        daySlots[day] = slots
    }
    
    func updateSlotType(for day: DayOfWeek, slotId: String, newType: String) {
        guard var slots = daySlots[day],
              let index = slots.firstIndex(where: { $0.id.uuidString == slotId }) else { return }
        
        // Update the slot type based on the new type string
        let lowercased = newType.lowercased()
        if lowercased.contains("snack") {
            slots[index].slotType = .snacks
        } else if lowercased.contains("breakfast") {
            slots[index].slotType = .meal(.breakfast)
        } else if lowercased.contains("lunch") {
            slots[index].slotType = .meal(.lunch)
        } else if lowercased.contains("dinner") {
            slots[index].slotType = .meal(.dinner)
        }
        // If no match, keep the existing type
        
        daySlots[day] = slots
    }
    
    func setMealForSlot(for day: DayOfWeek, slotId: UUID, meal: Meal?) {
        guard var slots = daySlots[day],
              let index = slots.firstIndex(where: { $0.id == slotId }) else { return }
        
        // Replace all meals with single meal, or clear if nil
        slots[index].meals = meal != nil ? [meal!] : []
        daySlots[day] = slots
    }
    
    func addMealToSlot(for day: DayOfWeek, slotId: UUID, meal: Meal) {
        guard var slots = daySlots[day],
              let index = slots.firstIndex(where: { $0.id == slotId }) else { return }
        
        slots[index].meals.append(meal)
        daySlots[day] = slots
    }
    
    func updateMealAtIndex(for day: DayOfWeek, slotId: String, index: Int, meal: Meal) {
        guard var slots = daySlots[day],
              let slotIndex = slots.firstIndex(where: { $0.id.uuidString == slotId }),
              index < slots[slotIndex].meals.count else { return }
        
        slots[slotIndex].meals[index] = meal
        daySlots[day] = slots
    }
    
    func removeMealAtIndex(for day: DayOfWeek, slotId: String, index: Int) {
        guard var slots = daySlots[day],
              let slotIndex = slots.firstIndex(where: { $0.id.uuidString == slotId }),
              index < slots[slotIndex].meals.count else { return }
        
        slots[slotIndex].meals.remove(at: index)
        daySlots[day] = slots
    }
    
    func clearMealsInSlot(for day: DayOfWeek, slotId: UUID) {
        guard var slots = daySlots[day],
              let index = slots.firstIndex(where: { $0.id == slotId }) else { return }
        
        slots[index].meals = []
        daySlots[day] = slots
    }
    
    func updateMealWithNutrition(for day: DayOfWeek, slotId: String, name: String, calories: Int, confidence: Double) {
        guard var slots = daySlots[day],
              let index = slots.firstIndex(where: { $0.id.uuidString == slotId }) else { return }
        
        // Add as new meal to the array
        let newMeal = Meal(name: name, calories: calories, protein: nil, carbs: nil, fat: nil, confidence: confidence)
        slots[index].meals.append(newMeal)
        daySlots[day] = slots
    }
    
    func toggleDayCollapsed(_ day: DayOfWeek) {
        if collapsedDays.contains(day) {
            collapsedDays.remove(day)
        } else {
            collapsedDays.insert(day)
        }
    }
    
    func isDayCollapsed(_ day: DayOfWeek) -> Bool {
        return collapsedDays.contains(day)
    }
}