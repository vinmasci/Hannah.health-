//
//  InsightsHelpers.swift
//  HannahHealth
//
//  Helper functions for Insights feature
//

import SwiftUI

struct InsightsHelpers {
    
    // MARK: - Period Display Text
    static func periodDisplayText(for timeRange: TimeRange, currentDate: Date) -> String {
        let formatter = DateFormatter()
        
        switch timeRange {
        case .today:
            if Calendar.current.isDateInToday(currentDate) {
                return "Today"
            } else if Calendar.current.isDateInYesterday(currentDate) {
                return "Yesterday"
            } else {
                formatter.dateFormat = "EEEE, MMM d"
                return formatter.string(from: currentDate)
            }
            
        case .week:
            let calendar = Calendar.current
            let weekday = calendar.component(.weekday, from: currentDate)
            let daysFromMonday = (weekday + 5) % 7
            guard let monday = calendar.date(byAdding: .day, value: -daysFromMonday, to: currentDate),
                  let sunday = calendar.date(byAdding: .day, value: 6, to: monday) else {
                return ""
            }
            formatter.dateFormat = "MMM d"
            let startStr = formatter.string(from: monday)
            let endStr = formatter.string(from: sunday)
            
            // Check if it's current week
            if calendar.isDate(Date(), equalTo: currentDate, toGranularity: .weekOfYear) {
                return "This Week (\(startStr) - \(endStr))"
            } else {
                return "\(startStr) - \(endStr)"
            }
            
        case .month:
            formatter.dateFormat = "MMMM yyyy"
            let monthStr = formatter.string(from: currentDate)
            
            // Check if it's current month
            if Calendar.current.isDate(Date(), equalTo: currentDate, toGranularity: .month) {
                return "This Month (\(monthStr))"
            } else {
                return monthStr
            }
            
        case .threeMonths:
            let calendar = Calendar.current
            guard let endDate = calendar.date(byAdding: .month, value: 2, to: currentDate) else {
                return ""
            }
            formatter.dateFormat = "MMM yyyy"
            let startStr = formatter.string(from: currentDate)
            let endStr = formatter.string(from: endDate)
            return "\(startStr) - \(endStr)"
            
        case .year:
            formatter.dateFormat = "yyyy"
            let yearStr = formatter.string(from: currentDate)
            
            // Check if it's current year
            if Calendar.current.isDate(Date(), equalTo: currentDate, toGranularity: .year) {
                return "This Year (\(yearStr))"
            } else {
                return yearStr
            }
        }
    }
    
    // MARK: - Weight Formatting
    static func formatWeight(weightKg: Double?, useMetric: Bool) -> String {
        guard let weightKg = weightKg else {
            return useMetric ? "70.0" : "154.0" // Default values
        }
        
        if useMetric {
            return String(format: "%.1f", weightKg)
        } else {
            let weightLbs = weightKg * 2.20462
            return String(format: "%.1f", weightLbs)
        }
    }
    
    // MARK: - Statistics Formatting
    static func formatAverageValue(data: [ChartDataPoint], metric: MetricType) -> String {
        guard !data.isEmpty else { return "0" }
        let avg = data.map { $0.value }.reduce(0, +) / Double(data.count)
        return String(format: metric == .weight ? "%.1f" : "%.0f", avg)
    }
    
    static func formatChangeValue(data: [ChartDataPoint], metric: MetricType) -> String {
        guard let first = data.first?.value,
              let last = data.last?.value else { return "0" }
        let change = last - first
        let prefix = change > 0 ? "+" : ""
        return prefix + String(format: metric == .weight ? "%.1f" : "%.0f", change)
    }
}