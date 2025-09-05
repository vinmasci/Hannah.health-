//
//  InsightsPlaceholder.swift
//  HannahHealth
//
//  Temporary placeholder for InsightsView
//

import SwiftUI

struct InsightsView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var selectedMetric: MetricType = .steps
    @State private var selectedTimeRange: TimeRange = .week
    @State private var currentDate: Date = Date()
    
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
            case .weight: return Theme.lavender         // Blue (Tailwind sky-400)
            case .steps: return Theme.emerald      // Green (Tailwind emerald-400)
            case .exercise: return Theme.coral     // Red (Tailwind red-400)
            }
        }
    }
    
    enum TimeRange: String, CaseIterable {
        case today = "Today"
        case week = "Week"
        case month = "Month"
        case threeMonths = "3 Months"
        case year = "Year"
    }
    
    // Sample data for demo
    var sampleData: [ChartDataPoint] {
        switch selectedTimeRange {
        case .today:
            // Hourly data for today
            let hours = ["6am", "9am", "12pm", "3pm", "6pm", "9pm", "Now"]
            switch selectedMetric {
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
            
        case .week:
            // Daily data for the week
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
                
                switch selectedMetric {
                case .weight:
                    return ChartDataPoint(label: label, value: 168.5 - Double(dayOffset) * 0.2 + Double.random(in: -0.3...0.3))
                case .steps:
                    return ChartDataPoint(label: label, value: Double(8000 + Int.random(in: -2000...3000)))
                case .exercise:
                    return ChartDataPoint(label: label, value: Double(350 + Int.random(in: -100...150)))
                }
            }
            
        case .month:
            // Weekly data for the month
            let weeks = ["Week 1", "Week 2", "Week 3", "Week 4"]
            switch selectedMetric {
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
            
        case .threeMonths:
            // Monthly data for 3 months
            let formatter = DateFormatter()
            formatter.dateFormat = "MMM"
            
            return (0..<3).compactMap { monthOffset in
                guard let date = Calendar.current.date(byAdding: .month, value: monthOffset - 2, to: currentDate) else { return nil }
                let label = formatter.string(from: date)
                
                switch selectedMetric {
                case .weight:
                    return ChartDataPoint(label: label, value: 172.0 - Double(monthOffset) * 1.5 + Double.random(in: -0.5...0.5))
                case .steps:
                    return ChartDataPoint(label: label, value: Double(240000 + Int.random(in: -20000...20000)))
                case .exercise:
                    return ChartDataPoint(label: label, value: Double(11000 + Int.random(in: -1000...1000)))
                }
            }
            
        case .year:
            // Monthly data for the year
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
                
                switch selectedMetric {
                case .weight:
                    return ChartDataPoint(label: label, value: 175.0 - Double(month - 1) * 0.7 + Double.random(in: -0.5...0.5))
                case .steps:
                    return ChartDataPoint(label: label, value: Double(240000 + Int.random(in: -20000...30000)))
                case .exercise:
                    return ChartDataPoint(label: label, value: Double(11000 + Int.random(in: -1500...2000)))
                }
            }
        }
    }
    
    var averageValue: String {
        let avg = sampleData.map { $0.value }.reduce(0, +) / Double(sampleData.count)
        return String(format: selectedMetric == .weight ? "%.1f" : "%.0f", avg)
    }
    
    var changeValue: String {
        guard let first = sampleData.first?.value,
              let last = sampleData.last?.value else { return "0" }
        let change = last - first
        let prefix = change > 0 ? "+" : ""
        return prefix + String(format: selectedMetric == .weight ? "%.1f" : "%.0f", change)
    }
    
    // User preferences
    var useMetricWeight: Bool {
        // Check if user prefers metric from their profile
        authManager.userProfile?.activityLevel == "prefer_metric" || Locale.current.usesMetricSystem
    }
    
    // Format weight based on user preference
    func formatWeight() -> String {
        guard let weightKg = authManager.userProfile?.weightKg else {
            return useMetricWeight ? "70.0" : "154.0" // Default values
        }
        
        if useMetricWeight {
            return String(format: "%.1f", weightKg)
        } else {
            let weightLbs = weightKg * 2.20462
            return String(format: "%.1f", weightLbs)
        }
    }
    
    var body: some View {
        ScrollView {
            VStack(spacing: 24) {
                // Header
                VStack(alignment: .leading, spacing: 8) {
                    Text("Insights")
                        .font(Theme.title)
                        .foregroundColor(.white)
                    
                    Text("Track your health progress")
                        .font(Theme.body)
                        .foregroundColor(.white.opacity(0.7))
                }
                .frame(maxWidth: .infinity, alignment: .leading)
                .padding(.horizontal)
                .padding(.top, 10)
                
                // Date Navigation and Time Range Selector
                VStack(spacing: 12) {
                    // Navigation controls with time range selector
                    HStack(spacing: 8) {
                        // Left arrow
                        Button(action: navigateBackward) {
                            Image(systemName: "chevron.left")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.white)
                                .frame(width: 32, height: 32)
                                .background(Color.black.opacity(0.5))
                                .cornerRadius(16)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 16)
                                        .stroke(Theme.cardBorder, lineWidth: 1)
                                )
                        }
                        
                        // Time Range Pills
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 8) {
                                ForEach(TimeRange.allCases, id: \.self) { range in
                                    Button {
                                        withAnimation(.spring(duration: 0.3)) {
                                            selectedTimeRange = range
                                            // Reset to current date when changing range
                                            if range == .today {
                                                currentDate = Date()
                                            }
                                        }
                                    } label: {
                                        Text(range.rawValue)
                                            .font(.system(size: 14, weight: .medium))
                                            .foregroundColor(selectedTimeRange == range ? .black : .white.opacity(0.7))
                                            .padding(.horizontal, 16)
                                            .padding(.vertical, 8)
                                            .background(
                                                selectedTimeRange == range ? Theme.sky : Color.black.opacity(0.5)
                                            )
                                            .cornerRadius(20)
                                    }
                                }
                            }
                        }
                        
                        // Right arrow
                        Button(action: navigateForward) {
                            Image(systemName: "chevron.right")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.white)
                                .frame(width: 32, height: 32)
                                .background(Color.black.opacity(0.5))
                                .cornerRadius(16)
                                .overlay(
                                    RoundedRectangle(cornerRadius: 16)
                                        .stroke(Theme.cardBorder, lineWidth: 1)
                                )
                        }
                        .disabled(!canNavigateForward())
                        .opacity(canNavigateForward() ? 1.0 : 0.5)
                    }
                    .padding(.horizontal)
                    
                    // Current period display
                    Text(periodDisplayText)
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.white.opacity(0.9))
                }
                
                
                // Metric Selector
                HStack(spacing: 12) {
                    ForEach(MetricType.allCases, id: \.self) { metric in
                        MetricTab(
                            metric: metric,
                            isSelected: selectedMetric == metric,
                            action: {
                                withAnimation(.spring(duration: 0.3)) {
                                    selectedMetric = metric
                                }
                            }
                        )
                    }
                }
                .padding(.horizontal)
                
                // Main Chart Card
                VStack(alignment: .leading, spacing: 20) {
                    // Stats Row
                    HStack(spacing: 20) {
                        StatItem(
                            title: "Average",
                            value: averageValue,
                            unit: selectedMetric.unit,
                            color: selectedMetric.color
                        )
                        
                        StatItem(
                            title: "Change",
                            value: changeValue,
                            unit: selectedMetric.unit,
                            color: Double(changeValue) ?? 0 < 0 ? Theme.emerald : Theme.coral
                        )
                        
                        StatItem(
                            title: "Today",
                            value: String(format: selectedMetric == .weight ? "%.1f" : "%.0f", sampleData.last?.value ?? 0),
                            unit: selectedMetric.unit,
                            color: .white
                        )
                    }
                    
                    // Simple Bar Chart
                    GeometryReader { geometry in
                        HStack(alignment: .bottom, spacing: barSpacing) {
                            ForEach(sampleData) { point in
                                VStack(spacing: 4) {
                                    RoundedRectangle(cornerRadius: 4)
                                        .fill(selectedMetric.color.opacity(0.8))
                                        .frame(width: barWidth(for: geometry.size.width), height: barHeight(for: point.value))
                                    
                                    Text(point.label)
                                        .font(.system(size: fontSize))
                                        .foregroundColor(.white.opacity(0.6))
                                        .lineLimit(1)
                                        .minimumScaleFactor(0.5)
                                }
                                .frame(width: barWidth(for: geometry.size.width))
                            }
                        }
                        .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .bottom)
                    }
                    .frame(height: 200)
                }
                .padding()
                .background(Color.black.opacity(0.5))
                .cornerRadius(16)
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .stroke(Theme.cardBorder, lineWidth: 1)
                )
                .padding(.horizontal)
                
                // Quick Stats Grid
                VStack(spacing: 16) {
                    HStack(spacing: 16) {
                        QuickStatCard(
                            icon: "scalemass.fill",
                            title: "Current Weight",
                            value: formatWeight(),
                            unit: useMetricWeight ? "kg" : "lbs",
                            change: "-1.5 this week",
                            color: Theme.lavender
                        )
                        
                        QuickStatCard(
                            icon: "figure.walk",
                            title: "Avg Steps",
                            value: "9,008",
                            unit: "daily",
                            change: "+12% this week",
                            color: Theme.emerald
                        )
                    }
                    
                    HStack(spacing: 16) {
                        QuickStatCard(
                            icon: "flame.fill",
                            title: "Calories Burned",
                            value: "378",
                            unit: "avg/day",
                            change: "+8% this week",
                            color: Theme.coral
                        )
                        
                        QuickStatCard(
                            icon: "chart.line.uptrend.xyaxis",
                            title: "On Track",
                            value: "6",
                            unit: "days",
                            change: "Great progress!",
                            color: Theme.sky
                        )
                    }
                }
                .padding(.horizontal)
                .padding(.bottom, 100)
            }
        }
        .background(
            DynamicTimeBackground()
                .ignoresSafeArea()
        )
    }
    
    func barHeight(for value: Double) -> CGFloat {
        let maxValue = sampleData.map { $0.value }.max() ?? 1
        let minValue = sampleData.map { $0.value }.min() ?? 0
        let range = maxValue - minValue
        
        if range == 0 { return 100 }
        
        let normalizedValue = (value - minValue) / range
        return CGFloat(normalizedValue * 150 + 20) // Min height 20, max 170
    }
    
    func barWidth(for totalWidth: CGFloat) -> CGFloat {
        let count = CGFloat(sampleData.count)
        guard count > 0 else { return 40 }
        
        let totalSpacing = barSpacing * (count - 1)
        let availableWidth = totalWidth - totalSpacing - 32 // 32 for padding
        let width = availableWidth / count
        
        // Clamp width between min and max
        return min(max(width, 20), 60)
    }
    
    var barSpacing: CGFloat {
        switch sampleData.count {
        case 0...7: return 8
        case 8...12: return 4
        default: return 2
        }
    }
    
    var fontSize: CGFloat {
        switch sampleData.count {
        case 0...7: return 10
        case 8...12: return 9
        default: return 8
        }
    }
    
    // MARK: - Navigation Functions
    
    private func navigateBackward() {
        withAnimation(.spring(duration: 0.3)) {
            switch selectedTimeRange {
            case .today:
                currentDate = Calendar.current.date(byAdding: .day, value: -1, to: currentDate) ?? currentDate
            case .week:
                currentDate = Calendar.current.date(byAdding: .weekOfYear, value: -1, to: currentDate) ?? currentDate
            case .month:
                currentDate = Calendar.current.date(byAdding: .month, value: -1, to: currentDate) ?? currentDate
            case .threeMonths:
                currentDate = Calendar.current.date(byAdding: .month, value: -3, to: currentDate) ?? currentDate
            case .year:
                currentDate = Calendar.current.date(byAdding: .year, value: -1, to: currentDate) ?? currentDate
            }
        }
    }
    
    private func navigateForward() {
        withAnimation(.spring(duration: 0.3)) {
            switch selectedTimeRange {
            case .today:
                currentDate = Calendar.current.date(byAdding: .day, value: 1, to: currentDate) ?? currentDate
            case .week:
                currentDate = Calendar.current.date(byAdding: .weekOfYear, value: 1, to: currentDate) ?? currentDate
            case .month:
                currentDate = Calendar.current.date(byAdding: .month, value: 1, to: currentDate) ?? currentDate
            case .threeMonths:
                currentDate = Calendar.current.date(byAdding: .month, value: 3, to: currentDate) ?? currentDate
            case .year:
                currentDate = Calendar.current.date(byAdding: .year, value: 1, to: currentDate) ?? currentDate
            }
        }
    }
    
    private func canNavigateForward() -> Bool {
        // Don't allow navigating to future dates for "Today" view
        if selectedTimeRange == .today {
            return !Calendar.current.isDateInToday(currentDate)
        }
        // For other ranges, check if the end of the period is in the future
        let calendar = Calendar.current
        let now = Date()
        
        switch selectedTimeRange {
        case .week:
            let weekday = calendar.component(.weekday, from: currentDate)
            let daysFromMonday = (weekday + 5) % 7
            guard let sunday = calendar.date(byAdding: .day, value: 6 - daysFromMonday, to: currentDate) else { return true }
            return sunday < now
        case .month:
            guard let endOfMonth = calendar.dateInterval(of: .month, for: currentDate)?.end else { return true }
            return endOfMonth < now
        case .threeMonths:
            guard let threeMonthsEnd = calendar.date(byAdding: .month, value: 3, to: currentDate) else { return true }
            return threeMonthsEnd < now
        case .year:
            guard let endOfYear = calendar.dateInterval(of: .year, for: currentDate)?.end else { return true }
            return endOfYear < now
        default:
            return true
        }
    }
    
    private var periodDisplayText: String {
        let formatter = DateFormatter()
        
        switch selectedTimeRange {
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
}

struct ChartDataPoint: Identifiable {
    let id = UUID()
    let label: String
    let value: Double
}

struct MetricTab: View {
    let metric: InsightsView.MetricType
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Image(systemName: metric.icon)
                    .font(.system(size: 22, weight: isSelected ? .semibold : .regular))
                    .foregroundColor(isSelected ? .white : .white.opacity(0.6))
                
                Text(metric.rawValue)
                    .font(.system(size: 12, weight: .medium))
                    .foregroundColor(isSelected ? .white : .white.opacity(0.5))
            }
            .frame(maxWidth: .infinity)
            .padding(.vertical, 12)
            .background(
                isSelected ? metric.color : Color.black.opacity(0.6)
            )
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? metric.color : Color.clear, lineWidth: 1)
            )
        }
    }
}

struct StatItem: View {
    let title: String
    let value: String
    let unit: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            Text(title)
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.6))
            
            HStack(spacing: 4) {
                Text(value)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(color)
                
                Text(unit)
                    .font(.system(size: 11))
                    .foregroundColor(.white.opacity(0.5))
            }
        }
    }
}

struct QuickStatCard: View {
    let icon: String
    let title: String
    let value: String
    let unit: String
    let change: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(color)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.system(size: 11))
                    .foregroundColor(.white.opacity(0.6))
                
                HStack(spacing: 4) {
                    Text(value)
                        .font(.system(size: 20, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text(unit)
                        .font(.system(size: 11))
                        .foregroundColor(.white.opacity(0.5))
                }
                
                Text(change)
                    .font(.system(size: 10))
                    .foregroundColor(color)
            }
            
            Spacer()
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(Color.black.opacity(0.5))
        .cornerRadius(12)
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(Theme.cardBorder, lineWidth: 1)
        )
    }
}