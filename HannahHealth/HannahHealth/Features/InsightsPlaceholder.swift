//
//  InsightsPlaceholder.swift
//  HannahHealth
//
//  Temporary placeholder for InsightsView - Refactored version
//

import SwiftUI

// Note: Since Swift doesn't support file imports, the types need to be in the same module
// The types from InsightsTypes.swift should be accessible if they're in the same target

struct InsightsPlaceholderView: View {
    @EnvironmentObject var authManager: AuthManager
    @StateObject private var dataService = InsightsDataService()
    @State private var selectedMetric: MetricType = .steps
    @State private var selectedTimeRange: TimeRange = .week
    @State private var currentDate: Date = Date()
    
    // Computed properties
    private var sampleData: [ChartDataPoint] {
        dataService.generateSampleData(for: selectedMetric, timeRange: selectedTimeRange, currentDate: currentDate)
    }
    
    private var averageValue: String {
        InsightsHelpers.formatAverageValue(data: sampleData, metric: selectedMetric)
    }
    
    private var changeValue: String {
        InsightsHelpers.formatChangeValue(data: sampleData, metric: selectedMetric)
    }
    
    private var periodDisplayText: String {
        InsightsHelpers.periodDisplayText(for: selectedTimeRange, currentDate: currentDate)
    }
    
    private var useMetricWeight: Bool {
        authManager.userProfile?.activityLevel == "prefer_metric" || Locale.current.usesMetricSystem
    }
    
    private var formattedWeight: String {
        InsightsHelpers.formatWeight(weightKg: authManager.userProfile?.weightKg, useMetric: useMetricWeight)
    }
    
    var body: some View {
        ZStack {
            Theme.backgroundGradient
                .ignoresSafeArea()
            
            ScrollView {
                VStack(spacing: 20) {
                    // Header
                    headerSection
                    
                    // Navigation Bar
                    InsightsNavigationBar(
                        selectedTimeRange: $selectedTimeRange,
                        currentDate: $currentDate,
                        periodDisplayText: periodDisplayText
                    )
                    
                    // Metric Tabs
                    metricTabsSection
                    
                    // Main Chart
                    InsightsChartView(
                        data: sampleData,
                        metric: selectedMetric,
                        averageValue: averageValue,
                        changeValue: changeValue
                    )
                    .padding(.horizontal)
                    
                    // Quick Stats Grid
                    quickStatsGrid
                    
                    Spacer(minLength: 100)
                }
            }
        }
    }
    
    // MARK: - Header Section
    private var headerSection: some View {
        Text("Insights")
            .font(.system(size: 34, weight: .bold, design: .rounded))
            .foregroundColor(.white)
            .frame(maxWidth: .infinity, alignment: .leading)
            .padding(.horizontal)
            .padding(.top, 10)
    }
    
    // MARK: - Metric Tabs Section
    private var metricTabsSection: some View {
        HStack(spacing: 10) {
            ForEach(MetricType.allCases, id: \.self) { metric in
                InsightsMetricTab(
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
    }
    
    // MARK: - Quick Stats Grid
    private var quickStatsGrid: some View {
        VStack(spacing: 16) {
            HStack(spacing: 16) {
                QuickStatCard(
                    icon: "scalemass.fill",
                    title: "Current Weight",
                    value: formattedWeight,
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
                    value: "89%",
                    unit: "of goals",
                    change: "Keep it up!",
                    color: Theme.emerald
                )
            }
        }
        .padding(.horizontal)
    }
}