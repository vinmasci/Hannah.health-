//
//  FoodSearchService.swift
//  HannahHealth
//
//  Service for searching food and fetching nutrition information
//

import Foundation
import SwiftUI

@MainActor
class FoodSearchService: ObservableObject {
    private let openAIService = OpenAIService()
    private let braveService = BraveSearchService()
    private let confidenceService = NutritionConfidenceService()
    
    // MARK: - Public Methods
    
    func updateMealAtIndex(
        day: DayOfWeek,
        slotId: String,
        index: Int,
        foodName: String,
        viewModel: MealPlanViewModel
    ) async {
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
        
        // If we have multiple items, remove the current one and add all new ones
        if foodItems.count > 1 {
            // Remove the current item being edited
            viewModel.removeMealAtIndex(for: day, slotId: slotId, index: index)
            
            // Add each food item as a separate meal
            for singleFood in foodItems {
                let cleanedFoodName = cleanFoodName(singleFood)
                await searchForFoodAndAdd(day: day, slotId: slotId, foodName: cleanedFoodName, viewModel: viewModel)
            }
            return
        }
        
        // Single item - process as before
        let cleanedFoodName = cleanFoodName(foodName)
        
        print("🔍 Updating meal at index \(index): '\(cleanedFoodName)'")
        
        do {
            let nutritionInfo = try await fetchNutritionInfo(for: cleanedFoodName)
            
            // Update the specific meal at index
            viewModel.updateMealAtIndex(
                for: day,
                slotId: slotId,
                index: index,
                meal: Meal(
                    name: cleanedFoodName,
                    calories: nutritionInfo.calories,
                    protein: nutritionInfo.protein,
                    carbs: nutritionInfo.carbs,
                    fat: nutritionInfo.fat,
                    confidence: nutritionInfo.confidence
                )
            )
        } catch {
            print("❌ Error searching for food: \(error)")
            // Just update the name without nutrition
            viewModel.updateMealAtIndex(
                for: day,
                slotId: slotId,
                index: index,
                meal: Meal(name: cleanedFoodName, calories: 0, protein: nil, carbs: nil, fat: nil, confidence: nil)
            )
        }
    }
    
    func searchForFoodAndAdd(
        day: DayOfWeek,
        slotId: String,
        foodName: String,
        viewModel: MealPlanViewModel
    ) async {
        do {
            let nutritionInfo = try await fetchNutritionInfo(for: foodName)
            
            // Add as new meal to the slot
            let newMeal = Meal(
                name: foodName,
                calories: nutritionInfo.calories,
                protein: nutritionInfo.protein,
                carbs: nutritionInfo.carbs,
                fat: nutritionInfo.fat,
                confidence: nutritionInfo.confidence
            )
            viewModel.addMealToSlot(for: day, slotId: UUID(uuidString: slotId)!, meal: newMeal)
        } catch {
            print("❌ Error searching for food: \(error)")
            // Just add the name without nutrition
            let newMeal = Meal(name: foodName, calories: 0, protein: nil, carbs: nil, fat: nil, confidence: nil)
            viewModel.addMealToSlot(for: day, slotId: UUID(uuidString: slotId)!, meal: newMeal)
        }
    }
    
    func searchForFood(
        day: DayOfWeek,
        slotId: String,
        foodName: String,
        viewModel: MealPlanViewModel
    ) async {
        let cleanedFoodName = cleanFoodName(foodName)
        
        print("🔍 Searching for food: '\(cleanedFoodName)' (original: '\(foodName)')")
        
        do {
            let nutritionInfo = try await fetchNutritionInfo(for: cleanedFoodName)
            
            // Update the meal with nutrition info and confidence
            viewModel.updateMealWithNutrition(
                for: day,
                slotId: slotId,
                name: cleanedFoodName,
                calories: nutritionInfo.calories,
                confidence: nutritionInfo.confidence
            )
        } catch {
            print("❌ Error searching for food: \(error)")
            // Just update the name without nutrition
            viewModel.updateMealName(for: day, slotId: slotId, newName: foodName)
        }
    }
    
    // MARK: - Private Methods
    
    private func cleanFoodName(_ foodName: String) -> String {
        var cleanedName = foodName
        
        // Handle common corrections
        if cleanedName.lowercased().contains("three egg") || cleanedName.lowercased().contains("3 egg") {
            if cleanedName.lowercased().contains("mushroom") {
                cleanedName = "3 egg omelette with mushrooms"
            } else {
                cleanedName = "3 egg omelette"
            }
        }
        
        return cleanedName
    }
    
    private func fetchNutritionInfo(for foodName: String) async throws -> NutritionInfo {
        // Search for nutrition info
        let searchContext = try await braveService.searchNutritionData(query: foodName)
        
        // Build context for AI
        let prompt = """
        Based on this search data about "\(foodName)":
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
        let calories = parseNumber(from: response, pattern: #"Calories:\s*(\d+)"#)
        let protein = parseNumber(from: response, pattern: #"Protein:\s*(\d+)"#)
        let carbs = parseNumber(from: response, pattern: #"Carbs:\s*(\d+)"#)
        let fat = parseNumber(from: response, pattern: #"Fat:\s*(\d+)"#)
        
        // Calculate confidence
        let foodConfidence = confidenceService.calculateConfidence(
            for: foodName,
            searchDomains: searchContext.domains
        )
        
        return NutritionInfo(
            calories: calories ?? 0,
            protein: protein,
            carbs: carbs,
            fat: fat,
            confidence: foodConfidence.confidence
        )
    }
    
    private func parseNumber(from text: String, pattern: String) -> Int? {
        guard let range = text.range(of: pattern, options: .regularExpression) else {
            return nil
        }
        let matchString = String(text[range])
        let numbers = matchString.filter { $0.isNumber }
        return Int(numbers)
    }
}

// MARK: - Supporting Types
struct NutritionInfo {
    let calories: Int
    let protein: Int?
    let carbs: Int?
    let fat: Int?
    let confidence: Double
}