//
//  NutritionData.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import Foundation

struct NutritionData: Codable {
    var calories: Int
    var protein: Double
    var carbs: Double
    var fat: Double
    var confidence: Double
    
    init(
        calories: Int = 0,
        protein: Double = 0,
        carbs: Double = 0,
        fat: Double = 0,
        confidence: Double = 1.0
    ) {
        self.calories = calories
        self.protein = protein
        self.carbs = carbs
        self.fat = fat
        self.confidence = confidence
    }
}

struct DailyNutrition: Codable {
    var target: NutritionData
    var consumed: NutritionData
    var deficit: Int
    
    var proteinProgress: Double {
        guard target.protein > 0 else { return 0 }
        return consumed.protein / target.protein
    }
    
    var carbsProgress: Double {
        guard target.carbs > 0 else { return 0 }
        return consumed.carbs / target.carbs
    }
    
    var fatProgress: Double {
        guard target.fat > 0 else { return 0 }
        return consumed.fat / target.fat
    }
}