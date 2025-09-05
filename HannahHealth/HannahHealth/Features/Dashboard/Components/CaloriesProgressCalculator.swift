//
//  CaloriesProgressCalculator.swift
//  HannahHealth
//
//  Centralized progress calculation logic for calories views
//

import Foundation
import SwiftUI

// ProgressStatus removed - use the one from DonutChartComponents.swift instead

// MARK: - Calories Progress Calculator
struct CaloriesProgressCalculator {
    
    // Calculate progress status based on consumed vs target calories
    static func calculateProgressStatus(consumed: Int, target: Int, timeOfDay: Date? = nil) -> ProgressStatus {
        let percentage = Double(consumed) / Double(max(target, 1))
        
        if percentage <= 0.5 {
            return .ahead
        } else if percentage <= 1.0 {
            return .onTrack
        } else if percentage <= 1.15 {
            return .warning
        } else {
            return .over
        }
    }
    
    // Calculate TDEE (Total Daily Energy Expenditure)
    static func calculateTDEE(bmr: Int, activeEnergy: Int, tef: Int) -> Int {
        return bmr + activeEnergy + tef
    }
    
    // Calculate TEF (Thermic Effect of Food) - typically 10% of calories consumed
    static func calculateTEF(caloriesConsumed: Int) -> Double {
        return Double(caloriesConsumed) * 0.10
    }
    
    // Calculate meal progress based on time of day
    static func calculateMealProgress(consumed: Int, target: Int, currentTime: Date) -> Double {
        let calendar = Calendar.current
        let hour = calendar.component(.hour, from: currentTime)
        
        // Expected consumption percentage based on time of day
        let expectedPercentage: Double
        if hour < 12 {
            expectedPercentage = 0.3  // 30% by noon
        } else if hour < 17 {
            expectedPercentage = 0.6  // 60% by 5pm
        } else if hour < 21 {
            expectedPercentage = 0.9  // 90% by 9pm
        } else {
            expectedPercentage = 1.0  // 100% after 9pm
        }
        
        let actualPercentage = Double(consumed) / Double(max(target, 1))
        return actualPercentage / expectedPercentage
    }
    
    // Calculate calories remaining
    static func calculateRemaining(target: Int, consumed: Int) -> Int {
        return target - consumed
    }
    
    // Format calories display
    static func formatCalories(_ calories: Int, showSign: Bool = false) -> String {
        if showSign {
            let sign = calories >= 0 ? "+" : ""
            return "\(sign)\(calories)"
        }
        return "\(abs(calories))"
    }
    
    // Calculate deficit or surplus
    static func calculateDeficitSurplus(tdee: Int, consumed: Int) -> (value: Int, isDeficit: Bool) {
        let difference = tdee - consumed
        return (abs(difference), difference > 0)
    }
    
    // Get progress percentage for animations
    static func getProgressPercentage(consumed: Int, target: Int) -> Double {
        return min(Double(consumed) / Double(max(target, 1)), 1.5)
    }
    
    // Determine if user is on track based on time of day
    static func isOnTrackForTime(consumed: Int, target: Int, currentTime: Date) -> Bool {
        let progress = calculateMealProgress(consumed: consumed, target: target, currentTime: currentTime)
        return progress >= 0.8 && progress <= 1.2  // Within 20% of expected
    }
}

// MARK: - Shared Calculation Extensions
extension CaloriesProgressCalculator {
    
    // Weekly calculations
    static func calculateWeeklyTDEE(dailyBMR: Int, days: Int, weeklyActiveEnergy: Int, weeklyTEF: Int) -> Int {
        let weeklyBMR = dailyBMR * days
        return weeklyBMR + weeklyActiveEnergy + weeklyTEF
    }
    
    // Monthly calculations
    static func calculateMonthlyTDEE(dailyBMR: Int, days: Int, monthlyActiveEnergy: Int, monthlyTEF: Int) -> Int {
        let monthlyBMR = dailyBMR * days
        return monthlyBMR + monthlyActiveEnergy + monthlyTEF
    }
    
    // Removed aggregateMealCalories - not needed anymore since we use viewModel.mealCalories directly
}