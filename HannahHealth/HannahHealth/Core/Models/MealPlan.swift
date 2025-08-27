//
//  MealPlan.swift
//  HannahHealth
//
//  Created on 27/8/2025.
//

import Foundation

struct MealPlan: Codable, Identifiable {
    let id: String
    let userId: String
    let weekStartDate: Date
    let planData: MealPlanData
    let isActive: Bool
    let createdAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case weekStartDate = "week_start_date"
        case planData = "plan_data"
        case isActive = "is_active"
        case createdAt = "created_at"
    }
}

struct MealPlanData: Codable {
    let days: [DayPlan]
    let weeklyGoals: WeeklyGoals
    let suggestions: [String]
}

struct DayPlan: Codable, Identifiable {
    let id = UUID()
    let day: String
    let date: Date
    let meals: [PlannedMeal]
    let totalCalories: Int
    let totalProtein: Double
    let totalCarbs: Double
    let totalFat: Double
}

struct PlannedMeal: Codable, Identifiable {
    let id = UUID()
    let mealType: String // breakfast, lunch, dinner, snack
    let name: String
    let calories: Int
    let protein: Double?
    let carbs: Double?
    let fat: Double?
    let time: String? // "8:00 AM"
    let notes: String?
    let isCompleted: Bool
    
    private enum CodingKeys: String, CodingKey {
        case mealType = "meal_type"
        case name, calories, protein, carbs, fat, time, notes
        case isCompleted = "is_completed"
    }
}

struct WeeklyGoals: Codable {
    let targetCalories: Int
    let targetProtein: Double
    let targetCarbs: Double
    let targetFat: Double
    let deficitGoal: Int
}