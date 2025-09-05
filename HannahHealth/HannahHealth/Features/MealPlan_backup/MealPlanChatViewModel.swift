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
        let request = text.lowercased()
        
        // If no slots selected, try to parse the request for natural language updates
        if slots.isEmpty {
            return await processNaturalLanguageRequest(text)
        }
        
        // Parse common requests
        if request.contains("clear") || request.contains("remove") || request.contains("delete") {
            var clearedMeals: [String] = []
            for slot in slots {
                // Get the actual slot data from the view model
                let daySlots = mealPlanViewModel?.getSlots(for: slot.day) ?? []
                if let actualSlot = daySlots.first(where: { $0.id == slot.slotId }) {
                    // Clear all meals in the slot
                    mealPlanViewModel?.clearMealsInSlot(for: slot.day, slotId: slot.slotId)
                    clearedMeals.append("\(slot.day.name) \(actualSlot.slotType.displayName)")
                }
            }
            if clearedMeals.count == 1 {
                return "Cleared \(clearedMeals[0]) ✓"
            } else {
                return "Cleared \(clearedMeals.count) meal slots ✓"
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
                        meal = Meal(name: "Mixed Nuts & Fruit", calories: 180, protein: 6, carbs: 15, fat: 12, confidence: nil)
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
                   !actualSlot.meals.isEmpty {
                    let totalCal = actualSlot.meals.reduce(0) { $0 + $1.calories }
                    mealInfo.append("\(slot.day.name) \(actualSlot.slotType.displayName): \(totalCal) cal")
                }
            }
            if mealInfo.isEmpty {
                return "No meals set for the selected slots yet"
            } else {
                return mealInfo.joined(separator: "\n")
            }
        }
        
        // Default: Clean the food name and search for nutrition info
        let cleanedFoodName = cleanFoodName(text)
        return await searchAndAddFood(cleanedFoodName, for: slots)
    }
    
    private func getVegetarianMeal(for mealType: MealType) -> Meal {
        switch mealType {
        case .breakfast:
            return Meal(name: "Avocado Toast with Eggs", calories: 380, protein: 18, carbs: 32, fat: 22, confidence: nil)
        case .lunch:
            return Meal(name: "Quinoa Buddha Bowl", calories: 450, protein: 15, carbs: 65, fat: 18, confidence: nil)
        case .dinner:
            return Meal(name: "Vegetable Stir Fry", calories: 520, protein: 12, carbs: 78, fat: 20, confidence: nil)
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
        return Meal(name: text.capitalized, calories: calories, protein: nil, carbs: nil, fat: nil, confidence: nil)
    }
    
    private func parseMealFromText(_ text: String, isSnack: Bool) -> Meal {
        // Parse for snacks
        let calories = isSnack ? 180 : 400
        return Meal(name: text.capitalized, calories: calories, protein: nil, carbs: nil, fat: nil, confidence: nil)
    }
    
    // MARK: - Helper Functions
    private func cleanFoodName(_ text: String) -> String {
        var foodName = text
        
        print("🧹 Cleaning food name: '\(text)'")
        
        // Remove common command phrases
        let phrasesToRemove = [
            "can you add", "can u add", "could you add", "please add",
            "add a", "add some", "add", "i want", "i need",
            "set", "make", "put", "give me", "update with"
        ]
        
        for phrase in phrasesToRemove {
            let pattern = "(?i)^" + NSRegularExpression.escapedPattern(for: phrase) + "\\s+"
            foodName = foodName.replacingOccurrences(
                of: pattern,
                with: "",
                options: .regularExpression
            )
        }
        
        // Remove trailing phrases
        let trailingPhrases = [
            "to all breakfasts", "to all lunches", "to all dinners", "to all snacks",
            "to every breakfast", "to every lunch", "to every dinner", "to every snack",
            "to breakfasts", "to lunches", "to dinners", "to snacks",
            "to breakfast", "to lunch", "to dinner", "to snack",
            "for breakfast", "for lunch", "for dinner", "for snack"
        ]
        
        for phrase in trailingPhrases {
            let pattern = "\\s+" + NSRegularExpression.escapedPattern(for: phrase) + "(?i)$"
            foodName = foodName.replacingOccurrences(
                of: pattern,
                with: "",
                options: .regularExpression
            )
        }
        
        // Clean up articles and extra words
        foodName = foodName.replacingOccurrences(of: "\\bwith a cup of\\b", with: "with", options: [.regularExpression, .caseInsensitive])
        
        // Remove multiple spaces and trim
        foodName = foodName.replacingOccurrences(of: "\\s+", with: " ", options: .regularExpression)
        foodName = foodName.trimmingCharacters(in: .whitespacesAndNewlines)
        
        // Remove trailing "too" or "as well"
        foodName = foodName.replacingOccurrences(of: "\\s+too$", with: "", options: [.regularExpression, .caseInsensitive])
        foodName = foodName.replacingOccurrences(of: "\\s+as well$", with: "", options: [.regularExpression, .caseInsensitive])
        
        // Handle common corrections
        if foodName.lowercased().contains("three egg") || foodName.lowercased().contains("3 egg") {
            if foodName.lowercased().contains("mushroom") {
                return "3 egg omelette with mushrooms"
            } else {
                return "3 egg omelette"
            }
        }
        
        // Clean up "cup of" measurements
        foodName = foodName.replacingOccurrences(of: "cup of", with: "", options: .caseInsensitive)
        foodName = foodName.replacingOccurrences(of: "\\s+", with: " ", options: .regularExpression)
        foodName = foodName.trimmingCharacters(in: .whitespacesAndNewlines)
        
        print("🧹 Cleaned food name: '\(foodName)'")
        
        return foodName
    }
    
    // MARK: - AI-Powered Food Search
    private func searchAndAddFood(_ foodName: String, for slots: Set<MealSlot>) async -> String {
        // Split food name by comma or "and" to handle multiple items
        let separators = [",", " and "]
        var foodItems = [foodName]
        
        for separator in separators {
            if foodName.contains(separator) {
                foodItems = foodName.components(separatedBy: separator)
                    .map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
                    .filter { !$0.isEmpty }
                break
            }
        }
        
        var allAddedFoods: [String] = []
        
        // Process each food item separately
        for singleFood in foodItems {
            do {
                let openAIService = OpenAIService()
                let braveService = BraveSearchService()
                let confidenceService = NutritionConfidenceService()
            
                // Search for nutrition info
                let searchContext = try await braveService.searchNutritionData(query: singleFood)
            
                // Build context for AI
                let prompt = """
                Based on this search data about "\(singleFood)":
                \(searchContext.context)
                
                Provide the nutrition information in this exact format:
                Calories: [number]
                Protein: [number]g
                Carbs: [number]g
                Fat: [number]g
                
                If you can't find exact data, provide your best estimate.
                """
            
                let messages = [OpenAIMessage(role: "user", content: prompt)]
                let response = try await openAIService.sendMessage(messages, searchContext: nil)
                
                // Parse nutrition from response
                var calories = 0
                var protein: Int? = nil
                var carbs: Int? = nil
                var fat: Int? = nil
                
                if let calorieRange = response.range(of: #"Calories:\s*(\d+)"#, options: .regularExpression) {
                    let calorieString = String(response[calorieRange])
                    let numbers = calorieString.filter { $0.isNumber }
                    calories = Int(numbers) ?? 0
                }
                
                if let proteinRange = response.range(of: #"Protein:\s*(\d+)"#, options: .regularExpression) {
                    let proteinString = String(response[proteinRange])
                    let numbers = proteinString.filter { $0.isNumber }
                    protein = Int(numbers)
                }
                
                if let carbsRange = response.range(of: #"Carbs:\s*(\d+)"#, options: .regularExpression) {
                    let carbsString = String(response[carbsRange])
                    let numbers = carbsString.filter { $0.isNumber }
                    carbs = Int(numbers)
                }
                
                if let fatRange = response.range(of: #"Fat:\s*(\d+)"#, options: .regularExpression) {
                    let fatString = String(response[fatRange])
                    let numbers = fatString.filter { $0.isNumber }
                    fat = Int(numbers)
                }
            
                // Calculate confidence
                let foodConfidence = confidenceService.calculateConfidence(
                    for: singleFood,
                    searchDomains: searchContext.domains
                )
                
                // Create meal with nutrition and confidence
                let meal = Meal(
                    name: singleFood,
                    calories: calories,
                    protein: protein,
                    carbs: carbs,
                    fat: fat,
                    confidence: foodConfidence.confidence
                )
            
                // Add meal to all selected slots
                for slot in slots {
                    let daySlots = mealPlanViewModel?.getSlots(for: slot.day) ?? []
                    if let actualSlot = daySlots.first(where: { $0.id == slot.slotId }) {
                        mealPlanViewModel?.addMealToSlot(for: slot.day, slotId: slot.slotId, meal: meal)
                    }
                }
                
                allAddedFoods.append("\(singleFood) (\(calories) cal)")
            
            } catch {
                print("❌ Error searching for food \(singleFood): \(error)")
                // Fallback to simple parsing without nutrition search
                let meal = Meal(name: singleFood, calories: 0, protein: nil, carbs: nil, fat: nil, confidence: nil)
                for slot in slots {
                    mealPlanViewModel?.addMealToSlot(for: slot.day, slotId: slot.slotId, meal: meal)
                }
                allAddedFoods.append(singleFood)
            }
        }
        
        // Build response message
        if allAddedFoods.count == 1 {
            return "Added \(allAddedFoods[0]) ✓"
        } else {
            return "Added \(allAddedFoods.count) items: \(allAddedFoods.joined(separator: ", ")) ✓"
        }
    }
    
    // MARK: - Natural Language Processing
    private func processNaturalLanguageRequest(_ text: String) async -> String {
        let request = text.lowercased()
        
        // Parse day and meal type from the request
        var targetDay: DayOfWeek?
        var targetMealType: MealSlotType?
        var foodName: String = text
        
        // Check for day mentions
        for day in DayOfWeek.allCases {
            if request.contains(day.name.lowercased()) {
                targetDay = day
                foodName = foodName.replacingOccurrences(of: day.name.lowercased(), with: "", options: .caseInsensitive)
                break
            }
        }
        
        // Check for "all" modifier
        let updateAll = request.contains("all breakfast") || request.contains("all lunch") || 
                       request.contains("all dinner") || request.contains("all snack") ||
                       request.contains("every breakfast") || request.contains("every lunch") ||
                       request.contains("every dinner") || request.contains("every snack")
        
        // Check for meal type mentions
        if request.contains("breakfast") {
            targetMealType = .meal(.breakfast)
            foodName = foodName.replacingOccurrences(of: "breakfasts", with: "", options: .caseInsensitive)
            foodName = foodName.replacingOccurrences(of: "breakfast", with: "", options: .caseInsensitive)
        } else if request.contains("lunch") {
            targetMealType = .meal(.lunch)
            foodName = foodName.replacingOccurrences(of: "lunches", with: "", options: .caseInsensitive)
            foodName = foodName.replacingOccurrences(of: "lunch", with: "", options: .caseInsensitive)
        } else if request.contains("dinner") {
            targetMealType = .meal(.dinner)
            foodName = foodName.replacingOccurrences(of: "dinners", with: "", options: .caseInsensitive)
            foodName = foodName.replacingOccurrences(of: "dinner", with: "", options: .caseInsensitive)
        } else if request.contains("snack") {
            targetMealType = .snacks
            foodName = foodName.replacingOccurrences(of: "snacks", with: "", options: .caseInsensitive)
            foodName = foodName.replacingOccurrences(of: "snack", with: "", options: .caseInsensitive)
        }
        
        // Clean up common words and phrases - order matters!
        let phrasesToRemove = [
            "can you add", "can u add", "could you add", "please add",
            "add a", "add some", "add", 
            "set", "make", "put", "for", "to all", "to every", "to my", 
            "my", "all", "every", "on", "with a cup of", "with some"
        ]
        
        // Remove phrases first
        for phrase in phrasesToRemove {
            let pattern = "\\b\(phrase)\\b"
            foodName = foodName.replacingOccurrences(
                of: pattern, 
                with: " ", 
                options: [.regularExpression, .caseInsensitive]
            )
        }
        
        // Clean up articles
        foodName = foodName.replacingOccurrences(of: "\\ba\\b", with: "", options: [.regularExpression, .caseInsensitive])
        foodName = foodName.replacingOccurrences(of: "\\ban\\b", with: "", options: [.regularExpression, .caseInsensitive])
        foodName = foodName.replacingOccurrences(of: "\\bthe\\b", with: "", options: [.regularExpression, .caseInsensitive])
        
        // Remove multiple spaces and trim
        foodName = foodName.replacingOccurrences(of: "\\s+", with: " ", options: .regularExpression)
        foodName = foodName.trimmingCharacters(in: .whitespacesAndNewlines)
        
        // Parse common food corrections
        if foodName.contains("three egg") || foodName.contains("3 egg") {
            if foodName.contains("mushroom") {
                foodName = "3 egg omelette with mushrooms"
            } else {
                foodName = "3 egg omelette"
            }
        }
        
        // If "all" is specified, update all instances of that meal type
        if updateAll && targetMealType != nil {
            var slotsToUpdate: Set<MealSlot> = []
            for day in DayOfWeek.allCases {
                let slots = mealPlanViewModel?.getSlots(for: day) ?? []
                if let slot = slots.first(where: { $0.slotType == targetMealType }) {
                    slotsToUpdate.insert(MealSlot(day: day, slotId: slot.id))
                }
            }
            if !slotsToUpdate.isEmpty {
                return await searchAndAddFood(foodName, for: slotsToUpdate)
            }
        }
        
        // If we identified a specific day and meal type, update it
        if let day = targetDay, let mealType = targetMealType {
            let slots = mealPlanViewModel?.getSlots(for: day) ?? []
            if let slot = slots.first(where: { $0.slotType == mealType }) {
                let mealSlot = MealSlot(day: day, slotId: slot.id)
                return await searchAndAddFood(foodName, for: [mealSlot])
            }
        }
        
        // If we only have day, ask for meal type
        if targetDay != nil && targetMealType == nil {
            return "Which meal would you like to update for \(targetDay!.name)? (breakfast, lunch, dinner, or snack)"
        }
        
        // If we only have meal type, ask for day
        if targetDay == nil && targetMealType != nil {
            return "Which day would you like to update \(targetMealType!.displayName) for?"
        }
        
        // Check if it's a general command
        if request.contains("help") {
            return """
            I can help you plan meals! Try:
            • "Add chicken salad to Monday lunch"
            • "Set Tuesday breakfast to oatmeal"
            • "Make Wednesday dinner vegetarian"
            • Tap meal slots and say what you want
            """
        }
        
        return "I can help you plan meals! Try selecting meal slots or saying something like 'Add salmon to Monday dinner'"
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