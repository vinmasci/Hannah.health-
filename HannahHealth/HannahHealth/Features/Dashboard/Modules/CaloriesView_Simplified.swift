//
//  CaloriesView.swift
//  HannahHealth
//
//  Simplified daily calories view using shared components
//

import SwiftUI

struct CaloriesView: View {
    @EnvironmentObject var viewModel: DashboardViewModel
    @State private var selectedSegment: String? = nil
    @State private var animateProgress: Double = 0.0
    @State private var hasAnimated = false
    
    // MARK: - Computed Properties
    var bmrCalories: Int {
        viewModel.actualBMR
    }
    
    var exerciseCalories: Int {
        viewModel.todayHealthData.activeEnergy
    }
    
    var stepsCalories: Int { 0 } // Steps are included in Active Energy
    
    var tefCalories: Int {
        Int(CaloriesProgressCalculator.calculateTEF(
            caloriesConsumed: viewModel.todayHealthData.caloriesConsumed
        ))
    }
    
    var tdeeCalories: Int {
        CaloriesProgressCalculator.calculateTDEE(
            bmr: bmrCalories,
            activeEnergy: exerciseCalories,
            tef: tefCalories
        )
    }
    
    var targetCalories: Int {
        tdeeCalories - viewModel.dailyDeficitTarget
    }
    
    var caloriesRemaining: Int {
        CaloriesProgressCalculator.calculateRemaining(
            target: targetCalories,
            consumed: viewModel.todayHealthData.caloriesConsumed
        )
    }
    
    var progressStatus: ProgressStatus {
        let status = CaloriesProgressCalculator.calculateProgressStatus(
            consumed: viewModel.todayHealthData.caloriesConsumed,
            target: targetCalories
        )
        
        // Map to DonutChartComponents.ProgressStatus
        switch status {
        case .onTarget:
            return viewModel.todayHealthData.caloriesConsumed < targetCalories / 2 ? .ahead : .onTrack
        case .approaching:
            return .warning
        case .over:
            return .over
        }
    }
    
    var mealCalories: [String: Int] {
        CaloriesProgressCalculator.aggregateMealCalories(
            from: viewModel.todayHealthData.foodItems
        )
    }
    
    // MARK: - Body
    var body: some View {
        VStack(spacing: 16) {
            // Title
            PeriodTitleView(title: "Today", subtitle: Date().formatted(date: .abbreviated, time: .omitted))
            
            // Ring visualization with animation
            AnimatedRingView { progress in
                RingContainerView(
                    isLoading: viewModel.isLoading,
                    onTap: { withAnimation { selectedSegment = nil } }
                ) {
                    ZStack {
                        CombinedDonutChart(
                            bmr: bmrCalories,
                            steps: stepsCalories,
                            exercise: exerciseCalories,
                            tef: tefCalories,
                            neat: 0,
                            consumed: viewModel.todayHealthData.caloriesConsumed,
                            target: targetCalories,
                            deficit: viewModel.dailyDeficitTarget,
                            mealCalories: mealCalories,
                            selectedSegment: $selectedSegment,
                            progressStatus: progressStatus,
                            animateProgress: progress
                        )
                        
                        // Center display
                        if let selected = selectedSegment {
                            SelectedSegmentDetail(
                                segment: selected,
                                bmr: bmrCalories,
                                steps: stepsCalories,
                                stepCount: viewModel.todayHealthData.steps,
                                exercise: exerciseCalories,
                                tef: tefCalories,
                                food: viewModel.todayHealthData.caloriesConsumed,
                                deficit: viewModel.dailyDeficitTarget,
                                mealCalories: mealCalories
                            )
                        } else {
                            CaloriesRemainingDisplay(
                                remaining: caloriesRemaining,
                                isOver: caloriesRemaining < 0
                            )
                        }
                    }
                }
            }
            
            // Info bar when segment selected
            if let segment = selectedSegment {
                SegmentInfoBar(
                    segment: segment,
                    bmr: bmrCalories,
                    steps: stepsCalories,
                    stepCount: viewModel.todayHealthData.steps,
                    exercise: exerciseCalories,
                    exerciseMinutes: exerciseCalories > 0 ? exerciseCalories / 10 : 0,
                    tef: tefCalories,
                    food: viewModel.todayHealthData.caloriesConsumed,
                    deficit: viewModel.dailyDeficitTarget,
                    mealCalories: mealCalories
                )
                .transition(AnyTransition.opacity.combined(with: AnyTransition.scale))
            }
            
            // TDEE and Goal Information
            TDEEGoalInfoView(
                tdee: tdeeCalories,
                target: targetCalories,
                deficitGoal: viewModel.dailyDeficitTarget
            )
            
            // Quick stats
            HStack(spacing: 20) {
                QuickStatView(
                    value: "\(viewModel.todayHealthData.steps)",
                    label: "Steps",
                    color: Theme.emerald
                )
                
                Divider()
                    .frame(height: 30)
                    .background(Color.white.opacity(0.2))
                
                DeficitSurplusDisplay(
                    deficit: tdeeCalories - viewModel.todayHealthData.caloriesConsumed,
                    isDeficit: tdeeCalories > viewModel.todayHealthData.caloriesConsumed
                )
            }
        }
    }
}

#Preview {
    CaloriesView()
        .environmentObject(DashboardViewModel())
        .preferredColorScheme(.dark)
}