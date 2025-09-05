//
//  MealPlanHelpers.swift
//  HannahHealth
//
//  Helper functions for meal planning UI
//

import SwiftUI

struct MealPlanHelpers {
    
    // MARK: - Icons
    static func getIcon(for slotType: MealSlotType) -> String {
        switch slotType {
        case .meal(let mealType):
            switch mealType {
            case .breakfast: return "sun.max.fill"
            case .lunch: return "sun.and.horizon.fill"
            case .dinner: return "moon.stars.fill"
            }
        case .snacks:
            return "carrot.fill"
        }
    }
    
    static func getIconColor(for slotType: MealSlotType) -> Color {
        switch slotType {
        case .meal(let mealType):
            switch mealType {
            case .breakfast: return Color(hex: "FDA4AF") // Rose 300
            case .lunch: return Color(hex: "4ECDC4")     // Mint
            case .dinner: return Color(hex: "C06FFF")    // Lavender
            }
        case .snacks:
            return Color(hex: "FB923C") // Tailwind orange-400
        }
    }
    
    // MARK: - Confidence Colors
    static func confidenceColor(_ confidence: Double) -> Color {
        switch confidence {
        case 0.9...1.0:
            return Color.green
        case 0.7..<0.9:
            return Color.yellow
        case 0.5..<0.7:
            return Color.orange
        default:
            return Color.red
        }
    }
    
    // MARK: - Date Helpers
    static func dateForDay(_ day: DayOfWeek) -> Date {
        let calendar = Calendar.current
        let today = Date()
        let weekday = calendar.component(.weekday, from: today)
        let daysFromMonday = (weekday == 1 ? 6 : weekday - 2) // Sunday = 1, Monday = 2
        let monday = calendar.date(byAdding: .day, value: -daysFromMonday, to: today)!
        
        let dayOffset: Int
        switch day {
        case .monday: dayOffset = 0
        case .tuesday: dayOffset = 1
        case .wednesday: dayOffset = 2
        case .thursday: dayOffset = 3
        case .friday: dayOffset = 4
        case .saturday: dayOffset = 5
        case .sunday: dayOffset = 6
        }
        
        return calendar.date(byAdding: .day, value: dayOffset, to: monday)!
    }
}