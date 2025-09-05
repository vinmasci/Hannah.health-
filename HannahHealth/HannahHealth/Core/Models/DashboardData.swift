//
//  DashboardData.swift
//  HannahHealth
//
//  Created on 27/8/2025.
//

import Foundation

// MARK: - View Period Types

enum ViewPeriod: String, CaseIterable {
    case day = "Day"
    case week = "Week" 
    case month = "Month"
}

// MARK: - Dashboard Data Models

struct DayData: Identifiable {
    let id = UUID()
    let date: Date
    let calories: Int
    let protein: Double
    let carbs: Double
    let fat: Double
    let water: Int // ml
    let steps: Int
    let sleep: Double // hours
    let workoutMinutes: Int
    let activeEnergy: Int // Active Energy from HealthKit
    let weight: Double? // optional, kg
    let meals: [FoodEntry]
    
    // Computed properties
    var calorieGoal: Int { 2000 } // Default goal
    var remainingCalories: Int { calorieGoal - calories }
    var proteinGoal: Double { 150 }
    var carbsGoal: Double { 200 }
    var fatGoal: Double { 65 }
    
    var macroTotal: Double { protein + carbs + fat }
    var proteinPercentage: Double { 
        guard macroTotal > 0 else { return 0 }
        return (protein / macroTotal) * 100
    }
    var carbsPercentage: Double {
        guard macroTotal > 0 else { return 0 }
        return (carbs / macroTotal) * 100
    }
    var fatPercentage: Double {
        guard macroTotal > 0 else { return 0 }
        return (fat / macroTotal) * 100
    }
}

struct WeekData: Identifiable {
    let id = UUID()
    let startDate: Date
    let endDate: Date
    let days: [DayData]
    
    // Computed totals
    var totalCalories: Int {
        days.reduce(0) { $0 + $1.calories }
    }
    var totalProtein: Double {
        days.reduce(0) { $0 + $1.protein }
    }
    var totalCarbs: Double {
        days.reduce(0) { $0 + $1.carbs }
    }
    var totalFat: Double {
        days.reduce(0) { $0 + $1.fat }
    }
    
    // Computed averages
    var averageCalories: Int {
        guard !days.isEmpty else { return 0 }
        return totalCalories / days.count
    }
    var averageProtein: Double {
        guard !days.isEmpty else { return 0 }
        return totalProtein / Double(days.count)
    }
    var averageCarbs: Double {
        guard !days.isEmpty else { return 0 }
        return totalCarbs / Double(days.count)
    }
    var averageFat: Double {
        guard !days.isEmpty else { return 0 }
        return totalFat / Double(days.count)
    }
    var averageWater: Int {
        guard !days.isEmpty else { return 0 }
        return days.reduce(0) { $0 + $1.water } / days.count
    }
    var averageSteps: Int {
        guard !days.isEmpty else { return 0 }
        return days.reduce(0) { $0 + $1.steps } / days.count
    }
    var averageSleep: Double {
        guard !days.isEmpty else { return 0 }
        return days.reduce(0) { $0 + $1.sleep } / Double(days.count)
    }
    
    // Weight tracking
    var startWeight: Double? {
        days.first { $0.weight != nil }?.weight
    }
    var endWeight: Double? {
        days.reversed().first { $0.weight != nil }?.weight
    }
    var weeklyWeightChange: Double? {
        guard let start = startWeight, let end = endWeight else { return nil }
        return end - start
    }
}

struct MonthData: Identifiable {
    let id = UUID()
    let month: Int
    let year: Int
    let weeks: [WeekData]
    
    var monthName: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMMM"
        let components = DateComponents(year: year, month: month)
        guard let date = Calendar.current.date(from: components) else { return "" }
        return formatter.string(from: date)
    }
    
    var shortMonthName: String {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM"
        let components = DateComponents(year: year, month: month)
        guard let date = Calendar.current.date(from: components) else { return "" }
        return formatter.string(from: date)
    }
    
    var allDays: [DayData] {
        weeks.flatMap { $0.days }
    }
    
    // Monthly totals
    var totalCalories: Int {
        weeks.reduce(0) { $0 + $1.totalCalories }
    }
    var averageDailyCalories: Int {
        guard !allDays.isEmpty else { return 0 }
        return totalCalories / allDays.count
    }
    
    // Monthly weight tracking
    var monthStartWeight: Double? {
        allDays.first { $0.weight != nil }?.weight
    }
    var monthEndWeight: Double? {
        allDays.reversed().first { $0.weight != nil }?.weight
    }
    var monthlyWeightChange: Double? {
        guard let start = monthStartWeight, let end = monthEndWeight else { return nil }
        return end - start
    }
    
    // Best/worst days
    var highestCalorieDay: DayData? {
        allDays.max { $0.calories < $1.calories }
    }
    var lowestCalorieDay: DayData? {
        allDays.min { $0.calories < $1.calories }
    }
    var mostActiveDay: DayData? {
        allDays.max { $0.steps < $1.steps }
    }
}