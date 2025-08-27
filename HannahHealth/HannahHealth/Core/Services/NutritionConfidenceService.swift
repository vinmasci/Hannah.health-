//
//  NutritionConfidenceService.swift
//  HannahHealth
//
//  Created on 27/8/2025.
//

import Foundation

struct FoodConfidence {
    let foodItem: String
    let confidence: Double
    let source: ConfidenceSource
    let nutritionData: NutritionEstimate?
}

enum ConfidenceSource {
    case websiteOfficial     // 95% - Official McDonald's, KFC, etc.
    case databaseVerified    // 90% - Verified nutrition database
    case commonFood         // 85% - Common foods with known values
    case brandedProduct     // 80% - Branded products with some variation
    case homemade          // 70% - Homemade with typical ingredients
    case estimated         // 60% - Rough estimate based on similar items
    case userDescribed     // 50% - Vague description needing clarification
}

struct NutritionEstimate {
    let calories: Int
    let protein: Double  // grams
    let carbs: Double    // grams
    let fat: Double      // grams
    let confidence: Double
}

protocol NutritionConfidenceServiceProtocol {
    func calculateConfidence(for foodItem: String, searchDomains: [String]) -> FoodConfidence
}

class NutritionConfidenceService: NutritionConfidenceServiceProtocol {
    
    // Restaurant domains for high confidence
    private let officialDomains = [
        "mcdonalds.com", "mcdonalds.com.au",
        "kfc.com", "kfc.com.au",
        "subway.com", "subway.com.au",
        "dominos.com", "dominos.com.au",
        "pizzahut.com", "pizzahut.com.au",
        "hungryjacks.com.au",
        "redrooster.com.au",
        "coles.com.au",
        "woolworths.com.au"
    ]
    
    // Common foods with well-known nutrition
    private let commonFoods = [
        "apple", "banana", "orange", "egg", "eggs",
        "toast", "bread", "milk", "coffee", "tea",
        "chicken breast", "rice", "pasta", "salad",
        "yogurt", "oatmeal", "cereal"
    ]
    
    // Branded products
    private let brandedProducts = [
        "big mac", "quarter pounder", "mcnuggets", "mcflurry",
        "whopper", "kfc bucket", "zinger burger",
        "footlong", "6 inch", "cookie", "muffin",
        "latte", "cappuccino", "flat white"
    ]
    
    func calculateConfidence(for foodItem: String, searchDomains: [String]) -> FoodConfidence {
        let lowercasedItem = foodItem.lowercased()
        
        // Check if we found official restaurant websites
        let hasOfficialSource = searchDomains.contains { domain in
            officialDomains.contains { official in
                domain.contains(official)
            }
        }
        
        // Determine confidence based on source
        let (confidence, source) = determineConfidenceLevel(
            foodItem: lowercasedItem,
            hasOfficialSource: hasOfficialSource,
            searchDomains: searchDomains
        )
        
        // Estimate nutrition (would be parsed from search results in real implementation)
        let nutritionEstimate = estimateNutrition(for: lowercasedItem, confidence: confidence)
        
        return FoodConfidence(
            foodItem: foodItem,
            confidence: confidence,
            source: source,
            nutritionData: nutritionEstimate
        )
    }
    
    private func determineConfidenceLevel(foodItem: String, 
                                         hasOfficialSource: Bool,
                                         searchDomains: [String]) -> (Double, ConfidenceSource) {
        let lowercasedItem = foodItem.lowercased()
        
        // Debug logging
        print("🎯 Calculating confidence for: '\(foodItem)'")
        print("🎯 Has official source: \(hasOfficialSource)")
        print("🎯 Search domains: \(searchDomains)")
        
        // Official restaurant website found with specific item
        if hasOfficialSource {
            // Check if it's a specific menu item from the restaurant
            if lowercasedItem.contains("big mac") || lowercasedItem.contains("mcnuggets") ||
               lowercasedItem.contains("whopper") || lowercasedItem.contains("zinger") {
                return (0.95, .websiteOfficial)
            }
            return (0.90, .websiteOfficial)
        }
        
        // Check if it's from a nutrition database
        if searchDomains.contains(where: { domain in
            domain.contains("nutritionix") || 
            domain.contains("myfitnesspal") || 
            domain.contains("fatsecret") ||
            domain.contains("calorieking") ||
            domain.contains("usda.gov")
        }) {
            return (0.90, .databaseVerified)
        }
        
        // Common foods with clear identification
        if lowercasedItem.contains("calories") || lowercasedItem.contains("logged") {
            // If Hannah mentioned specific calories, she found data
            if lowercasedItem.contains(where: { char in char.isNumber }) {
                return (0.85, .commonFood)
            }
        }
        
        // Branded products without official source
        if brandedProducts.contains(where: { lowercasedItem.contains($0) }) {
            return (0.80, .brandedProduct)
        }
        
        // Common foods
        if commonFoods.contains(where: { lowercasedItem.contains($0) }) {
            return (0.75, .commonFood)
        }
        
        // Homemade foods
        if lowercasedItem.contains("homemade") || lowercasedItem.contains("home made") {
            return (0.70, .homemade)
        }
        
        // Default - if search was performed
        if !searchDomains.isEmpty {
            return (0.65, .estimated)
        }
        
        // No search data
        return (0.50, .userDescribed)
    }
    
    private func estimateNutrition(for foodItem: String, confidence: Double) -> NutritionEstimate? {
        // Parse actual nutrition from Hannah's response
        let lowercasedItem = foodItem.lowercased()
        
        // Extract calories from response like "Big Mac logged - 563 calories"
        if let calorieRange = lowercasedItem.range(of: #"(\d+)\s*(?:calories|cal|kcal)"#, 
                                                     options: .regularExpression) {
            let calorieString = String(lowercasedItem[calorieRange])
            let numbers = calorieString.filter { $0.isNumber }
            if let calories = Int(numbers) {
                print("📊 Extracted \(calories) calories from response")
                return NutritionEstimate(
                    calories: calories,
                    protein: 0,  // Would need more parsing for macros
                    carbs: 0,
                    fat: 0,
                    confidence: confidence
                )
            }
        }
        
        // No nutrition data found in response
        return nil
    }
}