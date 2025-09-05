//
//  DashboardView.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//  Refactored to comply with 350 line limit - components extracted to Modules/
//

import SwiftUI

struct DashboardView: View {
    @EnvironmentObject var viewModel: DashboardViewModel
    @Binding var showProfile: Bool
    
    var body: some View {
        ScrollView(.vertical, showsIndicators: false) {
                LazyVStack(spacing: 18) {
                    // Header
                    DashboardHeader(showProfile: $showProfile)
                        .padding(.top, 5)
                    
                    // Period Navigation
                    ViewPeriodSelector(
                        selectedPeriod: $viewModel.selectedPeriod,
                        currentDate: $viewModel.currentDate
                    )
                    
                    // Show current period text
                    Text(ViewPeriodSelector.periodDisplayText(for: viewModel.currentDate, period: viewModel.selectedPeriod))
                        .font(.system(size: 16, weight: .medium))
                        .foregroundColor(.white.opacity(0.9))
                    
                    // Content based on selected period
                    Group {
                        let _ = print("🎯 Rendering view for period: \(viewModel.selectedPeriod)")
                        switch viewModel.selectedPeriod {
                        case .day:
                            dayViewContent
                        case .week:
                            let _ = print("📊 Switching to week view")
                            weekViewContent
                        case .month:
                            monthViewContent
                        }
                    }
                    
                    // Bottom padding for curved tab bar
                    Color.clear.frame(height: 140)
                }
                .padding(.horizontal, 16)
                .padding(.top, 5)
        }
        .frame(maxWidth: .infinity, maxHeight: .infinity)
        .onAppear {
            // Refresh health data when view appears
            viewModel.refreshHealthData()
        }
        .environmentObject(viewModel)
        .onAppear {
            viewModel.refreshHealthData()
        }
    }
}

// MARK: - Day View Content
extension DashboardView {
    @ViewBuilder
    private var dayViewContent: some View {
        // Daily Summary Card
        DailySummaryCard()
        
        // Daily Goal Selector
        DailyGoalSelector()
        
        // Quick Stats Grid
        QuickStatsGrid()
        
        // Food & Activity Log
        FoodActivityLogCard(currentDate: viewModel.currentDate)
        
    }
}

// MARK: - Week View Content
extension DashboardView {
    @ViewBuilder
    private var weekViewContent: some View {
        // Week Summary with Ring Visualization
        if let weekData = viewModel.currentWeekData {
            let _ = print("📈 Rendering WeeklyCaloriesView with \(weekData.days.count) days")
            WeeklyCaloriesView(weekData: weekData)
        } else {
            let _ = print("⚠️ No currentWeekData available")
            Text("No week data available")
                .foregroundColor(.white.opacity(0.5))
                .frame(maxWidth: .infinity, maxHeight: 200)
        }
    }
}

// MARK: - Month View Content
extension DashboardView {
    @ViewBuilder
    private var monthViewContent: some View {
        // Month Summary with Ring Visualization
        if let monthData = viewModel.currentMonthData {
            MonthlyCaloriesView(monthData: monthData)
        } else {
            Text("No month data available")
                .foregroundColor(.white.opacity(0.5))
                .frame(maxWidth: .infinity, maxHeight: 200)
        }
    }
}

// MARK: - Week Summary Card
struct WeekSummaryCard: View {
    let weekData: WeekData
    
    var body: some View {
        VStack(spacing: 12) {
            Text("Week Summary")
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Total Calories")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                    Text("\(weekData.totalCalories)")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Daily Average")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                    Text("\(weekData.averageCalories)")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                }
            }
            
            // Weight change if available
            if let weightChange = weekData.weeklyWeightChange {
                HStack {
                    Text("Weight Change")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                    Spacer()
                    Text(String(format: "%.1f kg", weightChange))
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(weightChange < 0 ? Theme.emerald : Theme.coral)
                }
            }
        }
        .padding()
        .background(Theme.glassMorphism)
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Theme.cardBorder)
        )
    }
}


#Preview {
    DashboardView(showProfile: .constant(false))
}