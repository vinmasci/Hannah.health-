//
//  InsightsView.swift
//  HannahHealth
//
//  Created on 29/1/2025.
//

import SwiftUI
import Charts

struct InsightsView: View {
    @StateObject private var viewModel = InsightsViewModel()
    @State private var selectedTimeRange: TimeRange = .week
    @State private var selectedMetric: MetricType = .weight
    
    enum TimeRange: String, CaseIterable {
        case week = "Week"
        case month = "Month"
        case threeMonths = "3 Months"
        case year = "Year"
    }
    
    enum MetricType: String, CaseIterable {
        case weight = "Weight"
        case calories = "Calories"
        case steps = "Steps"
        case water = "Water"
    }
    
    var body: some View {
        ZStack {
            // Use the same background as other views
            VortexSimpleBackground()
            
            ScrollView {
                VStack(spacing: 20) {
                    // Navigation Header
                    HStack {
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Insights")
                                .font(.system(size: 34, weight: .bold))
                                .foregroundColor(.white)
                            Text("Track your health progress")
                                .font(.system(size: 16))
                                .foregroundColor(.white.opacity(0.7))
                        }
                        Spacer()
                    }
                    .padding(.horizontal)
                    .padding(.top, 60)
                    
                    // Weight Chart Card - Primary Focus
                    WeightChartCard(weightLogs: viewModel.weightLogs, isLoading: viewModel.isLoadingWeight)
                        .environmentObject(viewModel)
                        .padding(.horizontal)
                    
                    // Quick Stats Grid
                    InsightsQuickStatsGrid()
                        .environmentObject(viewModel)
                        .padding(.horizontal)
                    
                    
                    // Trends
                    TrendsCard()
                        .environmentObject(viewModel)
                        .padding(.horizontal)
                        .padding(.bottom, 100)
                }
            }
        }
        .onAppear {
            viewModel.loadAllData()
        }
    }
}

// MARK: - Weight Chart Card
struct WeightChartCard: View {
    let weightLogs: [WeightDataPoint]
    let isLoading: Bool
    @EnvironmentObject var viewModel: InsightsViewModel
    @State private var selectedDate: Date?
    @State private var selectedPeriod: TimePeriod = .week
    
    enum TimePeriod: String, CaseIterable {
        case week = "W"
        case month = "M"
        case sixMonths = "6M"
        case year = "Y"
        
        var days: Int {
            switch self {
            case .week: return 7
            case .month: return 30
            case .sixMonths: return 180
            case .year: return 365
            }
        }
    }
    
    // Format weight data for chart based on selected period
    var chartData: [WeightChartPoint] {
        let calendar = Calendar.current
        let cutoffDate = calendar.date(byAdding: .day, value: -selectedPeriod.days, to: Date()) ?? Date()
        
        return weightLogs
            .filter { $0.date >= cutoffDate }
            .map { log in
                WeightChartPoint(
                    date: log.date,
                    weight: viewModel.useMetric ? log.weightKg : log.weightLbs
                )
            }.sorted { $0.date < $1.date }
    }
    
    var selectedWeight: WeightChartPoint? {
        guard let selectedDate = selectedDate else { return nil }
        return chartData.first { 
            Calendar.current.isDate($0.date, inSameDayAs: selectedDate)
        }
    }
    
    var weightChange: Double? {
        guard chartData.count >= 2 else { return nil }
        return chartData.last!.weight - chartData.first!.weight
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Time Period Selector
            HStack(spacing: 0) {
                ForEach(TimePeriod.allCases, id: \.self) { period in
                    Button(action: {
                        withAnimation(.easeInOut(duration: 0.2)) {
                            selectedPeriod = period
                            selectedDate = nil // Clear selection when changing period
                        }
                    }) {
                        Text(period.rawValue)
                            .font(.system(size: 14, weight: selectedPeriod == period ? .semibold : .regular))
                            .foregroundColor(selectedPeriod == period ? .black : .white.opacity(0.6))
                            .frame(maxWidth: .infinity)
                            .padding(.vertical, 8)
                            .background(
                                RoundedRectangle(cornerRadius: 8)
                                    .fill(selectedPeriod == period ? Color.white : Color.white.opacity(0.1))
                            )
                    }
                    .buttonStyle(PlainButtonStyle())
                }
            }
            .padding(4)
            .background(Color.white.opacity(0.05))
            .cornerRadius(10)
            
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Weight Tracking")
                        .font(.system(size: 18, weight: .semibold))
                        .foregroundColor(.white)
                    
                    if let change = weightChange {
                        HStack(spacing: 4) {
                            Image(systemName: change < 0 ? "arrow.down" : "arrow.up")
                                .font(.system(size: 12))
                            Text(String(format: "%.1f %@", abs(change), viewModel.useMetric ? "kg" : "lbs"))
                                .font(.system(size: 14, weight: .medium))
                        }
                        .foregroundColor(change < 0 ? Theme.emerald : Theme.coral)
                    }
                }
                
                Spacer()
                
                if let lastWeight = chartData.last {
                    VStack(alignment: .trailing, spacing: 2) {
                        Text(String(format: "%.1f", lastWeight.weight))
                            .font(.system(size: 24, weight: .bold))
                            .foregroundColor(.white)
                        Text(viewModel.useMetric ? "kg" : "lbs")
                            .font(.system(size: 12))
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
            }
            
            // Chart
            if isLoading {
                HStack {
                    Spacer()
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    Spacer()
                }
                .frame(height: 200)
            } else if chartData.isEmpty {
                VStack(spacing: 8) {
                    Image(systemName: "chart.line.uptrend.xyaxis")
                        .font(.system(size: 40))
                        .foregroundColor(.white.opacity(0.3))
                    Text("No weight data yet")
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.5))
                    Text("Log your weight to see trends")
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.4))
                }
                .frame(maxWidth: .infinity)
                .frame(height: 200)
            } else {
                VStack(spacing: 0) {
                    // Show selected value above chart, like Apple Health
                    if let selected = selectedWeight {
                        VStack(spacing: 4) {
                            Text(String(format: "%.1f %@", selected.weight, viewModel.useMetric ? "kg" : "lbs"))
                                .font(.system(size: 24, weight: .semibold))
                                .foregroundColor(.white)
                            Text(formatDate(selected.date))
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.7))
                        }
                        .frame(height: 60)
                        .frame(maxWidth: .infinity)
                        .transition(.opacity)
                    }
                    
                    Chart(chartData) { point in
                        LineMark(
                            x: .value("Date", point.date),
                            y: .value("Weight", point.weight)
                        )
                        .foregroundStyle(Theme.sky)
                        .lineStyle(StrokeStyle(lineWidth: 3, lineCap: .round, lineJoin: .round))
                        
                        PointMark(
                            x: .value("Date", point.date),
                            y: .value("Weight", point.weight)
                        )
                        .foregroundStyle(Theme.sky)
                        .symbolSize(100)
                        
                        AreaMark(
                            x: .value("Date", point.date),
                            y: .value("Weight", point.weight)
                        )
                        .foregroundStyle(
                            LinearGradient(
                                colors: [Theme.sky.opacity(0.3), Theme.sky.opacity(0.05)],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        
                        // Add vertical line at selected date
                        if let selectedDate = selectedDate {
                            RuleMark(
                                x: .value("Selected", selectedDate)
                            )
                            .foregroundStyle(Color.white.opacity(0.5))
                            .lineStyle(StrokeStyle(lineWidth: 2))
                        }
                    }
                    .frame(height: 200)
                    .onTapGesture { location in
                        // Calculate which date was tapped
                        guard !chartData.isEmpty else { return }
                        let width: CGFloat = 300 // Approximate chart width
                        let xPercent = location.x / width
                        let index = Int(Double(chartData.count - 1) * xPercent)
                        let clampedIndex = max(0, min(chartData.count - 1, index))
                        
                        withAnimation(.easeInOut(duration: 0.2)) {
                            let tappedDate = chartData[clampedIndex].date
                            selectedDate = selectedDate == tappedDate ? nil : tappedDate
                        }
                    }
                }
                .chartXAxis {
                    if selectedPeriod == .week {
                        AxisMarks(values: .automatic(desiredCount: 7)) { _ in
                            AxisValueLabel(format: .dateTime.weekday(.abbreviated))
                                .foregroundStyle(.white.opacity(0.5))
                            AxisGridLine()
                                .foregroundStyle(.white.opacity(0.1))
                        }
                    } else if selectedPeriod == .month {
                        AxisMarks(values: .automatic(desiredCount: 6)) { _ in
                            AxisValueLabel(format: .dateTime.day())
                                .foregroundStyle(.white.opacity(0.5))
                            AxisGridLine()
                                .foregroundStyle(.white.opacity(0.1))
                        }
                    } else {
                        AxisMarks(values: .automatic(desiredCount: 5)) { _ in
                            AxisValueLabel(format: .dateTime.month(.abbreviated))
                                .foregroundStyle(.white.opacity(0.5))
                            AxisGridLine()
                                .foregroundStyle(.white.opacity(0.1))
                        }
                    }
                }
                .chartYAxis {
                    AxisMarks(values: .automatic(desiredCount: 5)) { value in
                        AxisValueLabel {
                            if let weightValue = value.as(Double.self) {
                                Text("\(Int(weightValue))")
                                    .foregroundStyle(.white.opacity(0.5))
                            }
                        }
                        AxisGridLine()
                            .foregroundStyle(.white.opacity(0.1))
                    }
                }
            }
        }
        .padding()
        .glassCard()
    }
    
    private func formatDate(_ date: Date) -> String {
        let formatter = DateFormatter()
        formatter.dateStyle = .medium
        formatter.timeStyle = .none
        return formatter.string(from: date)
    }
}

// MARK: - Quick Stats Grid
struct InsightsQuickStatsGrid: View {
    @EnvironmentObject var viewModel: InsightsViewModel
    
    var body: some View {
        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
            InsightStatCard(
                icon: "flame.fill",
                value: viewModel.isLoadingStats ? "..." : "\(viewModel.avgCalories.formatted())",
                label: "Avg Calories",
                trend: viewModel.caloriesTrend != 0 ? String(format: "%+.0f%%", viewModel.caloriesTrend) : "No change",
                trendIsGood: viewModel.caloriesTrend < 0  // Less calories is good for weight loss
            )
            
            InsightStatCard(
                icon: "figure.walk",
                value: viewModel.isLoadingStats ? "..." : "\(viewModel.avgSteps.formatted())",
                label: "Avg Steps",
                trend: viewModel.stepsTrend != 0 ? String(format: "%+.0f%%", viewModel.stepsTrend) : "No change",
                trendIsGood: viewModel.stepsTrend > 0
            )
            
            InsightStatCard(
                icon: "bolt.fill",
                value: viewModel.isLoadingStats ? "..." : "\(viewModel.avgActiveCalories)",
                label: "Avg Active Cal",
                trend: viewModel.exerciseTrend != 0 ? String(format: "%+.0f%%", viewModel.exerciseTrend) : "No change",
                trendIsGood: viewModel.exerciseTrend > 0
            )
            
            InsightStatCard(
                icon: "figure.run",
                value: viewModel.isLoadingStats ? "..." : "\(viewModel.avgExerciseMinutes) min",
                label: "Avg Exercise",
                trend: "Daily avg",
                trendIsGood: viewModel.avgExerciseMinutes > 30
            )
        }
    }
}

struct InsightStatCard: View {
    let icon: String
    let value: String
    let label: String
    let trend: String
    let trendIsGood: Bool
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            Image(systemName: icon)
                .font(.system(size: 20))
                .foregroundColor(Theme.sky)
            
            Text(value)
                .font(.system(size: 22, weight: .bold))
                .foregroundColor(.white)
            
            Text(label)
                .font(.system(size: 12))
                .foregroundColor(.white.opacity(0.6))
            
            Text(trend)
                .font(.system(size: 11, weight: .medium))
                .foregroundColor(trendIsGood ? Theme.emerald : Theme.coral)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding()
        .glassCard()
    }
}

// MARK: - Trends
struct TrendsCard: View {
    @EnvironmentObject var viewModel: InsightsViewModel
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("Trends")
                .font(.system(size: 18, weight: .semibold))
                .foregroundColor(.white)
            
            VStack(spacing: 0) {
                if !viewModel.mostActiveDay.isEmpty {
                    TrendItem(
                        icon: "star.fill",
                        label: "Most active day",
                        value: viewModel.mostActiveDay
                    )
                    
                    Divider()
                        .background(Color.white.opacity(0.1))
                }
                
                if viewModel.bestStreak > 0 {
                    TrendItem(
                        icon: "flame.fill",
                        label: "Current streak",
                        value: "\(viewModel.bestStreak) days"
                    )
                    
                    Divider()
                        .background(Color.white.opacity(0.1))
                }
                
                TrendItem(
                    icon: "arrow.down.right",
                    label: "Avg daily deficit",
                    value: viewModel.isLoadingStats ? "..." : "\(abs(viewModel.avgDeficit)) cal/day"
                )
            }
        }
        .padding()
        .glassCard()
    }
}

struct TrendItem: View {
    let icon: String
    let label: String
    let value: String
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .font(.system(size: 16))
                .foregroundColor(Theme.sky)
                .frame(width: 24)
            
            Text(label)
                .font(.system(size: 14))
                .foregroundColor(.white.opacity(0.7))
            
            Spacer()
            
            Text(value)
                .font(.system(size: 14, weight: .semibold))
                .foregroundColor(.white)
        }
        .padding(.vertical, 12)
    }
}

// MARK: - Chart Data Model
struct WeightChartPoint: Identifiable {
    let id = UUID()
    let date: Date
    let weight: Double
}

#Preview {
    InsightsView()
        .preferredColorScheme(.dark)
}