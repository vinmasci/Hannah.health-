//
//  InsightsDataService.swift
//  HannahHealth
//
//  Data generation service for Insights
//

import SwiftUI

@MainActor
class InsightsDataService: ObservableObject {
    
    // MARK: - Sample Data Generation
    func generateSampleData(for metric: MetricType, timeRange: TimeRange, currentDate: Date) -> [ChartDataPoint] {
        switch timeRange {
        case .today:
            return generateTodayData(for: metric)
        case .week:
            return generateWeekData(for: metric, currentDate: currentDate)
        case .month:
            return generateMonthData(for: metric)
        case .threeMonths:
            return generateThreeMonthsData(for: metric, currentDate: currentDate)
        case .year:
            return generateYearData(for: metric, currentDate: currentDate)
        }
    }
    
    private func generateTodayData(for metric: MetricType) -> [ChartDataPoint] {
        let hours = ["6am", "9am", "12pm", "3pm", "6pm", "9pm", "Now"]
        
        switch metric {
        case .weight:
            // Weight typically measured once or twice a day
            return [
                ChartDataPoint(label: "Morning", value: 168.5),
                ChartDataPoint(label: "Evening", value: 167.8)
            ]
        case .steps:
            return hours.enumerated().map { index, hour in
                ChartDataPoint(label: hour, value: Double(index * 1500 + Int.random(in: -500...500)))
            }
        case .exercise:
            return hours.enumerated().map { index, hour in
                ChartDataPoint(label: hour, value: Double(index * 50 + Int.random(in: -20...30)))
            }
        }
    }
    
    private func generateWeekData(for metric: MetricType, currentDate: Date) -> [ChartDataPoint] {
        let calendar = Calendar.current
        let weekday = calendar.component(.weekday, from: currentDate)
        let daysFromMonday = (weekday + 5) % 7
        guard let monday = calendar.date(byAdding: .day, value: -daysFromMonday, to: currentDate) else {
            return []
        }
        
        let formatter = DateFormatter()
        formatter.dateFormat = "EEE"
        
        return (0..<7).compactMap { dayOffset in
            guard let date = calendar.date(byAdding: .day, value: dayOffset, to: monday) else { return nil }
            let label = formatter.string(from: date)
            
            switch metric {
            case .weight:
                return ChartDataPoint(label: label, value: 168.5 - Double(dayOffset) * 0.2 + Double.random(in: -0.3...0.3))
            case .steps:
                return ChartDataPoint(label: label, value: Double(8000 + Int.random(in: -2000...3000)))
            case .exercise:
                return ChartDataPoint(label: label, value: Double(350 + Int.random(in: -100...150)))
            }
        }
    }
    
    private func generateMonthData(for metric: MetricType) -> [ChartDataPoint] {
        let weeks = ["Week 1", "Week 2", "Week 3", "Week 4"]
        
        switch metric {
        case .weight:
            return weeks.enumerated().map { index, week in
                ChartDataPoint(label: week, value: 170.0 - Double(index) * 0.5 + Double.random(in: -0.2...0.2))
            }
        case .steps:
            return weeks.map { week in
                ChartDataPoint(label: week, value: Double(56000 + Int.random(in: -5000...5000)))
            }
        case .exercise:
            return weeks.map { week in
                ChartDataPoint(label: week, value: Double(2500 + Int.random(in: -300...300)))
            }
        }
    }
    
    private func generateThreeMonthsData(for metric: MetricType, currentDate: Date) -> [ChartDataPoint] {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM"
        
        return (0..<3).compactMap { monthOffset in
            guard let date = Calendar.current.date(byAdding: .month, value: monthOffset - 2, to: currentDate) else { return nil }
            let label = formatter.string(from: date)
            
            switch metric {
            case .weight:
                return ChartDataPoint(label: label, value: 172.0 - Double(monthOffset) * 1.5 + Double.random(in: -0.5...0.5))
            case .steps:
                return ChartDataPoint(label: label, value: Double(240000 + Int.random(in: -20000...20000)))
            case .exercise:
                return ChartDataPoint(label: label, value: Double(11000 + Int.random(in: -1000...1000)))
            }
        }
    }
    
    private func generateYearData(for metric: MetricType, currentDate: Date) -> [ChartDataPoint] {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM"
        
        let calendar = Calendar.current
        let currentMonth = calendar.component(.month, from: currentDate)
        let currentYear = calendar.component(.year, from: currentDate)
        
        return (1...12).compactMap { month in
            var components = DateComponents()
            components.year = currentYear
            components.month = month
            components.day = 1
            
            guard let date = calendar.date(from: components),
                  month <= currentMonth || !calendar.isDate(currentDate, equalTo: Date(), toGranularity: .year) else { return nil }
            
            let label = formatter.string(from: date)
            
            switch metric {
            case .weight:
                return ChartDataPoint(label: label, value: 175.0 - Double(month - 1) * 0.7 + Double.random(in: -0.5...0.5))
            case .steps:
                return ChartDataPoint(label: label, value: Double(240000 + Int.random(in: -20000...30000)))
            case .exercise:
                return ChartDataPoint(label: label, value: Double(11000 + Int.random(in: -1500...2000)))
            }
        }
    }
    
    // MARK: - Statistics Calculations
    func calculateAverage(data: [ChartDataPoint]) -> Double {
        guard !data.isEmpty else { return 0 }
        return data.map { $0.value }.reduce(0, +) / Double(data.count)
    }
    
    func calculateChange(data: [ChartDataPoint]) -> Double {
        guard let first = data.first?.value,
              let last = data.last?.value else { return 0 }
        return last - first
    }
}