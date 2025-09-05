//
//  InsightsTypes.swift
//  HannahHealth
//
//  Data types and enums for Insights feature
//

import SwiftUI

// MARK: - Metric Type
enum MetricType: String, CaseIterable {
    case steps = "Steps"
    case exercise = "Exercise"
    case weight = "Weight"
    
    var icon: String {
        switch self {
        case .weight: return "scalemass.fill"
        case .steps: return "figure.walk"
        case .exercise: return "flame.fill"
        }
    }
    
    var unit: String {
        switch self {
        case .weight: return "lbs"
        case .steps: return "steps"
        case .exercise: return "cal"
        }
    }
    
    var color: Color {
        switch self {
        case .weight: return Theme.lavender
        case .steps: return Theme.emerald
        case .exercise: return Theme.coral
        }
    }
}

// MARK: - Time Range
enum TimeRange: String, CaseIterable {
    case today = "Today"
    case week = "Week"
    case month = "Month"
    case threeMonths = "3 Months"
    case year = "Year"
}

// MARK: - Chart Data Point
struct ChartDataPoint: Identifiable {
    let id = UUID()
    let label: String
    let value: Double
}