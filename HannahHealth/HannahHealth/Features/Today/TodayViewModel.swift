//
//  TodayViewModel.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import Foundation

@MainActor
final class TodayViewModel: ObservableObject {
    @Published var dailyNutrition = DailyNutrition(
        target: NutritionData(calories: 1670, protein: 120, carbs: 200, fat: 60),
        consumed: NutritionData(calories: 1420, protein: 58, carbs: 180, fat: 45),
        deficit: -250
    )
    
    func updateNutrition(with food: NutritionData) {
        dailyNutrition.consumed.calories += food.calories
        dailyNutrition.consumed.protein += food.protein
        dailyNutrition.consumed.carbs += food.carbs
        dailyNutrition.consumed.fat += food.fat
        
        dailyNutrition.deficit = dailyNutrition.consumed.calories - dailyNutrition.target.calories
    }
}