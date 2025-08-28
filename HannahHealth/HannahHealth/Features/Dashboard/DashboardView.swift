//
//  DashboardView.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//  Refactored to comply with 350 line limit - components extracted to Modules/
//

import SwiftUI

struct DashboardView: View {
    @StateObject private var viewModel = DashboardViewModel()
    
    var body: some View {
        ScrollView(showsIndicators: false) {
                LazyVStack(spacing: 18) {
                    // Header
                    DashboardHeader()
                        .padding(.top, 5)
                    
                    // Period Navigation
                    ViewPeriodSelector(
                        selectedPeriod: $viewModel.selectedPeriod,
                        currentDate: $viewModel.currentDate
                    )
                    
                    // Show current period text
                    Text(ViewPeriodSelector.periodDisplayText(for: viewModel.currentDate, period: viewModel.selectedPeriod))
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                    
                    // Content based on selected period
                    Group {
                        switch viewModel.selectedPeriod {
                        case .day:
                            dayViewContent
                        case .week:
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
        
        // Quick Stats Grid
        QuickStatsGrid()
        
        // Food & Activity Log
        FoodActivityLogCard()
        
        // Hannah's Daily Advice
        HannahAdviceCarousel()
    }
}

// MARK: - Week View Content
extension DashboardView {
    @ViewBuilder
    private var weekViewContent: some View {
        // Week Summary Card
        if let weekData = viewModel.currentWeekData {
            WeekSummaryCard(weekData: weekData)
        }
        
        // Week Charts placeholder
        VStack(spacing: 16) {
            Text("Weekly Charts")
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            // Placeholder for charts
            RoundedRectangle(cornerRadius: 16)
                .fill(Theme.glassMorphism)
                .frame(height: 200)
                .overlay(
                    Text("Line Chart: Daily Calories")
                        .foregroundColor(.white.opacity(0.5))
                )
            
            RoundedRectangle(cornerRadius: 16)
                .fill(Theme.glassMorphism)
                .frame(height: 150)
                .overlay(
                    Text("Bar Chart: Daily Macros")
                        .foregroundColor(.white.opacity(0.5))
                )
        }
    }
}

// MARK: - Month View Content
extension DashboardView {
    @ViewBuilder
    private var monthViewContent: some View {
        // Month Summary Card
        if let monthData = viewModel.currentMonthData {
            MonthSummaryCard(monthData: monthData)
        }
        
        // Month visualization placeholder
        VStack(spacing: 16) {
            Text("Monthly Overview")
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            // Placeholder for calendar heatmap
            RoundedRectangle(cornerRadius: 16)
                .fill(Theme.glassMorphism)
                .frame(height: 300)
                .overlay(
                    Text("Calendar Heatmap")
                        .foregroundColor(.white.opacity(0.5))
                )
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

// MARK: - Month Summary Card
struct MonthSummaryCard: View {
    let monthData: MonthData
    
    var body: some View {
        VStack(spacing: 12) {
            Text("\(monthData.monthName) Summary")
                .font(.headline)
                .foregroundColor(.white)
                .frame(maxWidth: .infinity, alignment: .leading)
            
            HStack(spacing: 16) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Total Days")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                    Text("\(monthData.allDays.count)")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                }
                
                Spacer()
                
                VStack(alignment: .trailing, spacing: 4) {
                    Text("Avg Daily Cal")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                    Text("\(monthData.averageDailyCalories)")
                        .font(.title2)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
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
    DashboardView()
}