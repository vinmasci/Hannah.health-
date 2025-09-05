//
//  DailyGoalSelector.swift
//  HannahHealth
//
//  Daily goal selector for dashboard - allows users to change their goal anytime
//

import SwiftUI

struct DailyGoalSelector: View {
    @EnvironmentObject var viewModel: DashboardViewModel
    @State private var showGoalDetails = false
    
    private var goalDirectionIcon: String {
        switch viewModel.selectedGoal {
        case .loseWeight:
            return "arrow.down"
        case .maintainWeight:
            return "minus"
        case .buildMuscle, .medicalRecovery:
            return "arrow.up"
        case .manageCondition:
            return "stethoscope"
        case .intuitiveEating:
            return "leaf"
        }
    }
    
    private var goalDirectionColor: Color {
        switch viewModel.selectedGoal {
        case .loseWeight:
            return Theme.coral
        case .maintainWeight:
            return Theme.ocean
        case .buildMuscle, .medicalRecovery:
            return Theme.emerald
        case .manageCondition:
            return Theme.purple400
        case .intuitiveEating:
            return Theme.amber
        }
    }
    
    var body: some View {
        VStack(spacing: 16) {
            // Header
            HStack {
                Image(systemName: "target")
                    .font(.system(size: 18))
                    .foregroundColor(Theme.emerald)
                
                Text("Daily Goal")
                    .font(Theme.headline)
                    .foregroundColor(.white)
                    .fontWeight(.semibold)
                
                Spacer()
                
                // Current goal summary with icon
                HStack(spacing: 4) {
                    Image(systemName: goalDirectionIcon)
                        .font(.system(size: 12))
                        .foregroundColor(goalDirectionColor)
                    
                    Text(goalSummary)
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                }
            }
            
            // Goal selector
            Menu {
                ForEach(DailyGoalType.allCases, id: \.self) { goal in
                    Button {
                        withAnimation(.spring(duration: 0.3)) {
                            viewModel.selectedGoal = goal
                            showGoalDetails = (goal == .loseWeight || goal == .manageCondition)
                            viewModel.updateCalorieTarget()
                        }
                    } label: {
                        Label {
                            VStack(alignment: .leading) {
                                Text(goal.rawValue)
                                Text(goalDescription(for: goal))
                                    .font(.caption)
                                    .foregroundColor(.secondary)
                            }
                        } icon: {
                            Image(systemName: goalIcon(for: goal))
                        }
                    }
                }
            } label: {
                HStack {
                    Image(systemName: goalIcon(for: viewModel.selectedGoal))
                        .font(.system(size: 16))
                        .foregroundColor(Theme.emerald)
                        .frame(width: 24)
                    
                    Text(viewModel.selectedGoal.rawValue)
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    Image(systemName: "chevron.up.chevron.down")
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.6))
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Theme.glassMorphism)
                .cornerRadius(12)
            }
            
            // Additional options based on goal
            if showGoalDetails {
                if viewModel.selectedGoal == .loseWeight {
                    // Weight loss rate selector
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Weight Loss Rate")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.8))
                        
                        ForEach(WeightLossRate.allCases, id: \.self) { rate in
                            Button {
                                withAnimation {
                                    viewModel.weightLossRate = rate
                                    viewModel.updateCalorieTarget()
                                }
                            } label: {
                                HStack {
                                    Image(systemName: viewModel.weightLossRate == rate ? "checkmark.circle.fill" : "circle")
                                        .foregroundColor(viewModel.weightLossRate == rate ? Theme.emerald : .white.opacity(0.3))
                                    
                                    VStack(alignment: .leading, spacing: 2) {
                                        Text(rate.rawValue)
                                            .foregroundColor(.white)
                                            .font(.system(size: 14, weight: .medium))
                                        
                                        Text(rateDescription(for: rate))
                                            .foregroundColor(.white.opacity(0.6))
                                            .font(.caption)
                                    }
                                    
                                    Spacer()
                                    
                                    Text("-\(rate.deficitPerDay) cal/day")
                                        .foregroundColor(Theme.coral)
                                        .font(.caption)
                                        .fontWeight(.medium)
                                }
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(viewModel.weightLossRate == rate ? Theme.emerald.opacity(0.1) : Color.clear)
                                .cornerRadius(8)
                            }
                        }
                    }
                    .padding(.top, 8)
                    .transition(.asymmetric(
                        insertion: .push(from: .top).combined(with: .opacity),
                        removal: .push(from: .bottom).combined(with: .opacity)
                    ))
                    
                } else if viewModel.selectedGoal == .manageCondition {
                    // Condition selector
                    VStack(alignment: .leading, spacing: 12) {
                        Text("Select Condition")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.8))
                        
                        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 10) {
                            ForEach(MedicalCondition.allCases, id: \.self) { condition in
                                Button {
                                    withAnimation {
                                        viewModel.selectedCondition = condition
                                        viewModel.updateCalorieTarget()
                                    }
                                } label: {
                                    VStack(spacing: 4) {
                                        Text(condition.rawValue)
                                            .font(.system(size: 13, weight: .medium))
                                            .foregroundColor(.white)
                                        
                                        Text(conditionFocus(for: condition))
                                            .font(.system(size: 10))
                                            .foregroundColor(.white.opacity(0.6))
                                            .multilineTextAlignment(.center)
                                            .lineLimit(2)
                                            .fixedSize(horizontal: false, vertical: true)
                                    }
                                    .frame(maxWidth: .infinity)
                                    .padding(.vertical, 10)
                                    .padding(.horizontal, 8)
                                    .background(viewModel.selectedCondition == condition ? Theme.emerald.opacity(0.2) : Theme.glassMorphism)
                                    .cornerRadius(10)
                                    .overlay(
                                        RoundedRectangle(cornerRadius: 10)
                                            .stroke(viewModel.selectedCondition == condition ? Theme.emerald : Color.clear, lineWidth: 1)
                                    )
                                }
                            }
                        }
                    }
                    .padding(.top, 8)
                    .transition(.asymmetric(
                        insertion: .push(from: .top).combined(with: .opacity),
                        removal: .push(from: .bottom).combined(with: .opacity)
                    ))
                }
            }
        }
        .padding(20)
        .glassCard()
    }
    
    private var goalSummary: String {
        switch viewModel.selectedGoal {
        case .loseWeight:
            return viewModel.weightLossRate.rawValue
        case .maintainWeight:
            return "TDEE: \(viewModel.basalMetabolicRate)"
        case .buildMuscle:
            return "+300 surplus"
        case .medicalRecovery:
            return "+200 surplus"
        case .manageCondition:
            return viewModel.selectedCondition.rawValue
        case .intuitiveEating:
            return "No tracking"
        }
    }
    
    private func goalIcon(for goal: DailyGoalType) -> String {
        switch goal {
        case .loseWeight: return "arrow.down.circle"
        case .maintainWeight: return "equal.circle"
        case .buildMuscle: return "figure.strengthtraining.traditional"
        case .medicalRecovery: return "heart.circle"
        case .manageCondition: return "stethoscope"
        case .intuitiveEating: return "leaf.circle"
        }
    }
    
    private func goalDescription(for goal: DailyGoalType) -> String {
        switch goal {
        case .loseWeight: return "Create a calorie deficit"
        case .maintainWeight: return "Stay at current weight"
        case .buildMuscle: return "High protein focus"
        case .medicalRecovery: return "High protein + calories"
        case .manageCondition: return "Condition-specific tracking"
        case .intuitiveEating: return "No calorie targets"
        }
    }
    
    private func conditionFocus(for condition: MedicalCondition) -> String {
        switch condition {
        case .diabetes: return "Blood sugar stability"
        case .nafld: return "Low sugar, weight loss"
        case .pcos: return "Low carb, anti-inflammatory"
        case .kidneyDisease: return "Limited protein"
        case .heartDisease: return "Low sodium, healthy fats"
        case .ibs: return "Trigger food tracking"
        }
    }
    
    private func rateDescription(for rate: WeightLossRate) -> String {
        switch rate {
        case .gentle: return "Gentle & sustainable"
        case .moderate: return "Recommended pace"
        case .aggressive: return "Maximum safe rate"
        }
    }
}

#Preview {
    ZStack {
        DynamicTimeBackground()
            .ignoresSafeArea()
        
        DailyGoalSelector()
            .environmentObject(DashboardViewModel())
            .padding()
    }
}