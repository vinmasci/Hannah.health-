//
//  CaloriesView.swift
//  HannahHealth
//
//  Extracted from DailySummaryCard.swift to comply with file limit
//

import SwiftUI
import Foundation

struct CaloriesView: View {
    @EnvironmentObject var viewModel: DashboardViewModel
    @State private var showTDEEExplanation = false
    @State private var selectedSegment: String? = nil
    @State private var hasAppeared = false
    @State private var animateProgress: Double = 0.0
    @State private var hasAnimated = false
    
    var remainingCalories: Int {
        viewModel.caloriesRemaining
    }
    
    var bmr: Int { viewModel.actualBMR }
    var stepCalories: Int {
        // Steps are for display only - Active Energy already includes all movement calories
        // Return 0 to avoid double counting
        return 0
    }
    var exerciseCalories: Int { 
        // Active Energy includes ALL activity (steps, exercise, daily movement)
        // Only add manual if Active Energy is suspiciously low
        if viewModel.caloriesBurned < 50 {
            return viewModel.manuallyLoggedExerciseCalories
        }
        return viewModel.caloriesBurned
    }
    var tefCalories: Int { Int(Double(viewModel.caloriesConsumed) * 0.10) }
    var tdeeTotal: Int { bmr + exerciseCalories + tefCalories }
    
    // Progress status
    var progressStatus: ProgressStatus {
        let consumed = viewModel.caloriesConsumed
        let target = viewModel.dailyCalorieTarget
        let percentage = Double(consumed) / Double(target)
        
        // Get current hour to determine which meal target to check
        let hour = Calendar.current.component(.hour, from: Date())
        let mealProgress: Double
        
        if hour < 12 {
            mealProgress = percentage / 0.33 // Should be at 33% by midday
        } else if hour < 18 {
            mealProgress = percentage / 0.66 // Should be at 66% by dinner
        } else {
            mealProgress = percentage // Full day
        }
        
        if mealProgress <= 1.0 {
            return .onTrack
        } else if mealProgress <= 1.15 {
            return .warning
        } else {
            return .over
        }
    }
    
    var body: some View {
        VStack(spacing: 8) {
            // Add top padding to prevent cutoff
            Spacer()
                .frame(height: 16)
            
            // Main Donut Chart
            ZStack {
                if viewModel.isLoadingDashboardData {
                    // Loading state with shimmer effect
                    LoadingRingView()
                        .frame(width: 200, height: 200)
                        .transition(.opacity)
                } else {
                    // Combined TDEE and Food Ring - using the component from DonutChartComponents.swift
                    CombinedDonutChart(
                        bmr: bmr,
                        steps: stepCalories,
                        exercise: exerciseCalories,
                        tef: tefCalories,
                        neat: 0, // REMOVED - steps already include activity
                        consumed: viewModel.caloriesConsumed,
                        target: viewModel.dailyCalorieTarget,
                        deficit: viewModel.dailyDeficitTarget,
                        mealCalories: viewModel.mealCalories,
                        selectedSegment: $selectedSegment,
                        progressStatus: progressStatus,
                        animateProgress: animateProgress
                    )
                    .frame(width: 200, height: 200)
                    .onTapGesture {
                        // Tap on background to deselect
                        withAnimation {
                            selectedSegment = nil
                        }
                    }
                    .scaleEffect(animateProgress)
                    .opacity(animateProgress)
                }
                
                // Center Display
                VStack(spacing: 4) {
                    if let selected = selectedSegment {
                        // Show selected segment details - using component from DonutChartComponents.swift
                        SelectedSegmentDetail(
                            segment: selected,
                            bmr: bmr,
                            steps: stepCalories,
                            stepCount: viewModel.todaySteps,
                            exercise: exerciseCalories,
                            tef: tefCalories,
                            food: viewModel.caloriesConsumed,
                            deficit: viewModel.dailyDeficitTarget,
                            mealCalories: viewModel.mealCalories
                        )
                    } else {
                        // Default display - calories remaining
                        Text("\(abs(remainingCalories))")
                            .font(.system(size: 28, weight: .bold, design: .rounded))
                            .foregroundColor(remainingCalories > 0 ? .white : Theme.coral)
                        
                        Text("cal")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.white.opacity(0.8))
                        
                        Text(remainingCalories >= 0 ? "remaining" : "over")
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
            }
            
            // Only show legend if something is selected
            if selectedSegment != nil {
                SegmentInfoBar(
                    segment: selectedSegment!,
                    bmr: bmr,
                    steps: stepCalories,
                    stepCount: viewModel.todaySteps,
                    exercise: exerciseCalories,
                    exerciseMinutes: viewModel.caloriesBurned > 0 ? viewModel.caloriesBurned / 10 : 0,
                    tef: tefCalories,
                    food: viewModel.caloriesConsumed,
                    deficit: viewModel.dailyDeficitTarget,
                    mealCalories: viewModel.mealCalories
                )
                .transition(.opacity.combined(with: .scale))
            }
            
            // TDEE and Goal Information - Aligned to the left
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 8) {
                    Text("TDEE")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.6))
                        .frame(width: 40, alignment: .leading)
                    
                    Text("\(viewModel.basalMetabolicRate) cal")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.white.opacity(0.8))
                    
                    Spacer()
                }
                
                if viewModel.dailyDeficitTarget > 0 {
                    HStack(spacing: 8) {
                        Text("Target")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.6))
                            .frame(width: 40, alignment: .leading)
                        
                        Text("\(viewModel.dailyCalorieTarget) cal")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.white.opacity(0.8))
                        
                        Text("(\(viewModel.dailyDeficitTarget) deficit)")
                            .font(.caption)
                            .foregroundColor(Theme.coral.opacity(0.8))
                        
                        Spacer()
                    }
                }
            }
            .padding(.leading, 16)
            .padding(.top, 12)
            .padding(.bottom, 8)
        }
        .contentShape(Rectangle())
        .onTapGesture {
            // Tap anywhere to deselect and show calories remaining
            withAnimation(.easeInOut(duration: 0.2)) {
                selectedSegment = nil
            }
        }
        .onChange(of: viewModel.isLoadingDashboardData) { _, isLoading in
            if !isLoading && !hasAnimated {
                // Animate the ring in when data loads with longer duration
                withAnimation(.spring(response: 1.2, dampingFraction: 0.75)) {
                    animateProgress = 1.0
                }
                hasAnimated = true
            } else if isLoading {
                // Reset animation when loading starts
                animateProgress = 0.0
                hasAnimated = false
            }
        }
        .onAppear {
            // Only animate on appear if we're not loading and haven't animated yet
            if !viewModel.isLoadingDashboardData && !hasAnimated {
                withAnimation(.spring(response: 1.2, dampingFraction: 0.75)) {
                    animateProgress = 1.0
                }
                hasAnimated = true
            }
        }
    }
}