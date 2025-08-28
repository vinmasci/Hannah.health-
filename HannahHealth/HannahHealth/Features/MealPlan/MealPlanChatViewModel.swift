//
//  MealPlanChatViewModel.swift
//  HannahHealth
//
//  View model for meal plan chat interactions
//

import Foundation
import SwiftUI

// MARK: - Message Model
struct MealPlanMessage: Identifiable {
    let id = UUID()
    let content: String
    let isUser: Bool
    let timestamp = Date()
}

@MainActor
final class MealPlanChatViewModel: ObservableObject {
    @Published var messages: [MealPlanMessage] = []
    @Published var isTyping = false
    
    private var selectedSlots: Set<MealSlot> = []
    private weak var mealPlanViewModel: MealPlanViewModel?
    private let hannahService = HannahService.shared
    
    init() {
        // Welcome message
        messages = [
            MealPlanMessage(
                content: "Hi! I'm here to help you plan your meals. Tap one or more meal slots and tell me what you'd like!",
                isUser: false
            )
        ]
    }
    
    func setMealPlanViewModel(_ viewModel: MealPlanViewModel) {
        self.mealPlanViewModel = viewModel
    }
    
    func setSelectedSlots(_ slots: Set<MealSlot>) {
        self.selectedSlots = slots
    }
    
    func sendMessage(_ text: String, for slots: Set<MealSlot>) async {
        // Add user message
        messages.append(MealPlanMessage(content: text, isUser: true))
        
        // Start typing
        isTyping = true
        
        // Process the message
        let response = await processUserRequest(text, for: slots)
        
        // Stop typing
        isTyping = false
        
        // Add Hannah's response
        messages.append(MealPlanMessage(content: response, isUser: false))
    }
    
    private func processUserRequest(_ text: String, for slots: Set<MealSlot>) async -> String {
        // Simulate processing delay
        try? await Task.sleep(nanoseconds: 1_000_000_000)
        
        let request = text.lowercased()
        
        // If no slots selected
        guard !slots.isEmpty else {
            return "Please tap one or more meal slots first so I know which meals to update!"
        }
        
        // Parse common requests
        if request.contains("clear") || request.contains("remove") || request.contains("delete") {
            var clearedMeals: [String] = []
            for slot in slots {
                // Get the actual slot data from the view model
                let daySlots = mealPlanViewModel?.getSlots(for: slot.day) ?? []
                if let actualSlot = daySlots.first(where: { $0.id == slot.slotId }) {
                    mealPlanViewModel?.setMealForSlot(for: slot.day, slotId: slot.slotId, meal: nil)
                    clearedMeals.append("\(slot.day.name) \(actualSlot.slotType.displayName)")
                }
            }
            if clearedMeals.count == 1 {
                return "Cleared \(clearedMeals[0]) ✓"
            } else {
                return "Cleared \(clearedMeals.count) meals ✓"
            }
        }
        
        if request.contains("vegetarian") {
            var updatedMeals: [String] = []
            for slot in slots {
                let daySlots = mealPlanViewModel?.getSlots(for: slot.day) ?? []
                if let actualSlot = daySlots.first(where: { $0.id == slot.slotId }) {
                    let meal: Meal
                    switch actualSlot.slotType {
                    case .meal(let mealType):
                        meal = getVegetarianMeal(for: mealType)
                    case .snacks:
                        meal = Meal(name: "Mixed Nuts & Fruit", calories: 180)
                    }
                    mealPlanViewModel?.setMealForSlot(for: slot.day, slotId: slot.slotId, meal: meal)
                    updatedMeals.append("\(slot.day.name) \(actualSlot.slotType.displayName): \(meal.name)")
                }
            }
            if updatedMeals.count == 1 {
                return "Added vegetarian option to \(updatedMeals[0]) 🥗"
            } else {
                return "Added vegetarian options to \(updatedMeals.count) meals 🥗"
            }
        }
        
        if request.contains("suggest") || request.contains("idea") {
            if slots.count == 1, let slot = slots.first {
                let daySlots = mealPlanViewModel?.getSlots(for: slot.day) ?? []
                if let actualSlot = daySlots.first(where: { $0.id == slot.slotId }) {
                    switch actualSlot.slotType {
                    case .meal(let mealType):
                        let suggestions = getSuggestions(for: mealType)
                        return "Here are some ideas for \(mealType.displayName):\n\(suggestions)"
                    case .snacks:
                        return "Snack ideas:\n• Apple with almond butter (180 cal)\n• Greek yogurt (150 cal)\n• Protein bar (200 cal)"
                    }
                }
            }
            return "I can suggest ideas! Please select just one meal slot at a time for suggestions."
        }
        
        if request.contains("calories") || request.contains("cal") {
            var mealInfo: [String] = []
            for slot in slots {
                let daySlots = mealPlanViewModel?.getSlots(for: slot.day) ?? []
                if let actualSlot = daySlots.first(where: { $0.id == slot.slotId }),
                   let meal = actualSlot.meal {
                    mealInfo.append("\(slot.day.name) \(actualSlot.slotType.displayName): \(meal.calories) cal")
                }
            }
            if mealInfo.isEmpty {
                return "No meals set for the selected slots yet"
            } else {
                return mealInfo.joined(separator: "\n")
            }
        }
        
        // Default: Try to parse as a food item and apply to all selected slots
        var updatedMeals: [String] = []
        for slot in slots {
            let daySlots = mealPlanViewModel?.getSlots(for: slot.day) ?? []
            if let actualSlot = daySlots.first(where: { $0.id == slot.slotId }) {
                let meal: Meal
                switch actualSlot.slotType {
                case .meal(let mealType):
                    meal = parseMealFromText(text, for: mealType)
                case .snacks:
                    meal = parseMealFromText(text, isSnack: true)
                }
                mealPlanViewModel?.setMealForSlot(for: slot.day, slotId: slot.slotId, meal: meal)
                updatedMeals.append("\(slot.day.name) \(actualSlot.slotType.displayName)")
            }
        }
        
        if updatedMeals.isEmpty {
            return "No valid slots selected"
        }
        
        let meal = parseMealFromText(text, for: .lunch) // Get one instance for the name
        if updatedMeals.count == 1 {
            return "Added \(meal.name) to \(updatedMeals[0]) ✓"
        } else {
            return "Added \(meal.name) to \(updatedMeals.count) meals ✓"
        }
    }
    
    private func getVegetarianMeal(for mealType: MealType) -> Meal {
        switch mealType {
        case .breakfast:
            return Meal(name: "Avocado Toast with Eggs", calories: 380)
        case .lunch:
            return Meal(name: "Quinoa Buddha Bowl", calories: 450)
        case .dinner:
            return Meal(name: "Vegetable Stir Fry", calories: 520)
        }
    }
    
    private func getSuggestions(for mealType: MealType) -> String {
        switch mealType {
        case .breakfast:
            return "• Oatmeal with berries (320 cal)\n• Scrambled eggs & toast (380 cal)\n• Protein smoothie (280 cal)"
        case .lunch:
            return "• Grilled chicken salad (420 cal)\n• Turkey sandwich (450 cal)\n• Sushi bowl (480 cal)"
        case .dinner:
            return "• Salmon with veggies (520 cal)\n• Chicken stir-fry (480 cal)\n• Pasta primavera (450 cal)"
        }
    }
    
    private func parseMealFromText(_ text: String, for mealType: MealType) -> Meal {
        // Simple parsing - in real app would use AI
        let calories = mealType == .breakfast ? 400 : (mealType == .lunch ? 450 : 500)
        return Meal(name: text.capitalized, calories: calories)
    }
    
    private func parseMealFromText(_ text: String, isSnack: Bool) -> Meal {
        // Parse for snacks
        let calories = isSnack ? 180 : 400
        return Meal(name: text.capitalized, calories: calories)
    }
}

// Extension for MealPlanViewModel integration
extension MealPlanViewModel {
    func setMeal(_ meal: Meal, for day: DayOfWeek, mealType: MealType) {
        // This would update the actual meal plan data
        // For now, just storing in memory
    }
    
    func clearMeal(for day: DayOfWeek, mealType: MealType) {
        // This would clear the meal from the plan
    }
    
    func getMeal(for day: DayOfWeek, mealType: MealType) -> Meal? {
        // This would fetch the meal from storage
        // Returning mock data for now
        return nil
    }
    
    // Snack management methods
    func getSnackCount(for day: DayOfWeek) -> Int {
        // Return number of snacks for the day
        // Starting with 1 by default
        return 1
    }
    
    func getSnack(for day: DayOfWeek, index: Int) -> Meal? {
        // Return snack at index
        return nil
    }
    
    func addSnack(for day: DayOfWeek) {
        // Add a new snack slot
    }
    
    func removeSnack(for day: DayOfWeek, at index: Int) {
        // Remove snack at index
    }
    
    func setSnack(_ snack: Meal, for day: DayOfWeek, at index: Int) {
        // Set snack at specific index
    }
}