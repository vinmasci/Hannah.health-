//
//  CaloriesView.swift
//  HannahHealth
//
//  Extracted from DashboardView.swift to comply with 350 line limit
//

import SwiftUI

struct CaloriesView: View {
    @EnvironmentObject var viewModel: DashboardViewModel
    
    var remainingCalories: Int {
        viewModel.basalMetabolicRate - viewModel.caloriesConsumed + viewModel.caloriesBurned
    }
    
    var caloriesEatenProgress: Double {
        // Progress shows how much you've eaten (fills up as you eat, goes down with exercise)
        let effectiveBudget = viewModel.basalMetabolicRate + viewModel.caloriesBurned
        if effectiveBudget <= 0 { return 0 }
        let progress = Double(viewModel.caloriesConsumed) / Double(effectiveBudget)
        return max(0, min(1.0, progress))
    }
    
    var deficitTargetProgress: Double {
        // Where the circle should stop to maintain deficit (leaves gap for deficit)
        let targetCalories = viewModel.basalMetabolicRate - viewModel.dailyDeficitTarget + viewModel.caloriesBurned
        let effectiveBudget = viewModel.basalMetabolicRate + viewModel.caloriesBurned
        if effectiveBudget <= 0 { return 0.85 }
        return min(Double(targetCalories) / Double(effectiveBudget), 1.0)
    }
    
    var body: some View {
        VStack(spacing: 16) {
            Text("Remaining = Goal - Food + Exercise")
                .font(.caption)
                .foregroundColor(.white.opacity(0.6))
                .padding(.top, 8)
            
            // Large circular display
            ZStack {
                // Background circle
                Circle()
                    .stroke(Color.white.opacity(0.1), lineWidth: 10)
                    .frame(width: 140, height: 140)
                
                // Meal divider lines (breakfast, lunch, dinner markers)
                ForEach([0.0, 0.33, 0.66], id: \.self) { progress in
                    Rectangle()
                        .fill(Color.white.opacity(0.2))
                        .frame(width: 1, height: 12)
                        .offset(y: -70)
                        .rotationEffect(.degrees(-90 + (360 * progress)))
                }
                
                // Deficit target line (thicker, shows where to stop eating)
                Rectangle()
                    .fill(Color.red.opacity(0.4))
                    .frame(width: 2, height: 15)
                    .offset(y: -70)
                    .rotationEffect(.degrees(-90 + (360 * deficitTargetProgress)))
                
                // Progress circle
                Circle()
                    .trim(from: 0, to: caloriesEatenProgress)
                    .stroke(
                        LinearGradient(
                            colors: caloriesEatenProgress < 0.8 ? [Theme.mint, Theme.emerald] : [Theme.coral, Color.orange],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        style: StrokeStyle(lineWidth: 10, lineCap: .round)
                    )
                    .frame(width: 140, height: 140)
                    .rotationEffect(.degrees(-90))
                    .animation(.easeInOut(duration: 0.5), value: caloriesEatenProgress)
                
                VStack(spacing: 2) {
                    Text("\(remainingCalories)")
                        .font(.system(size: 36, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    
                    Text("Remaining")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                }
            }
            
            // Breakdown
            VStack(spacing: 10) {
                HStack {
                    Image(systemName: "flag.fill")
                        .foregroundColor(.white.opacity(0.6))
                        .font(.system(size: 14))
                        .frame(width: 20)
                    Text("Base Goal")
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.9))
                    Spacer()
                    Text("\(viewModel.basalMetabolicRate)")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                }
                
                HStack {
                    Image(systemName: "fork.knife")
                        .foregroundColor(Theme.sky)
                        .font(.system(size: 14))
                        .frame(width: 20)
                    Text("Food")
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.9))
                    Spacer()
                    Text("\(viewModel.caloriesConsumed)")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                }
                
                HStack {
                    Image(systemName: "flame.fill")
                        .foregroundColor(Theme.coral)
                        .font(.system(size: 14))
                        .frame(width: 20)
                    Text("Exercise")
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.9))
                    Spacer()
                    Text("\(viewModel.caloriesBurned)")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundColor(.white)
                }
            }
            .padding(.horizontal, 30)
            
        }
        .padding(.vertical, 4)
    }
}