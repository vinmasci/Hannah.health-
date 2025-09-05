//
//  CaloriesDisplayComponents.swift
//  HannahHealth
//
//  Reusable display components for calories views
//

import SwiftUI

// MARK: - Calories Remaining Display
struct CaloriesRemainingDisplay: View {
    let remaining: Int
    let isOver: Bool
    
    var body: some View {
        VStack(spacing: 4) {
            Text("\(abs(remaining))")
                .font(.system(size: 28, weight: .bold, design: .rounded))
                .foregroundColor(isOver ? Theme.coral : .white)
            
            Text("cal")
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white.opacity(0.8))
            
            Text(isOver ? "over" : "remaining")
                .font(.caption2)
                .foregroundColor(.white.opacity(0.6))
        }
    }
}

// MARK: - TDEE Goal Info View
struct TDEEGoalInfoView: View {
    let tdee: Int
    let target: Int
    let deficitGoal: Int
    
    var body: some View {
        VStack(alignment: .leading, spacing: 4) {
            HStack(spacing: 8) {
                Text("TDEE")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.6))
                    .frame(width: 40, alignment: .leading)
                
                Text("\(tdee) cal")
                    .font(.caption)
                    .fontWeight(.semibold)
                    .foregroundColor(.white.opacity(0.8))
                
                Spacer()
            }
            
            if deficitGoal > 0 {
                HStack(spacing: 8) {
                    Text("Target")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.6))
                        .frame(width: 40, alignment: .leading)
                    
                    Text("\(target) cal")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.white.opacity(0.8))
                    
                    Text("(\(deficitGoal) deficit)")
                        .font(.caption)
                        .foregroundColor(Theme.coral.opacity(0.8))
                    
                    Spacer()
                }
            }
        }
    }
}

// MARK: - Calories Stats Row
struct CaloriesStatsRow: View {
    let label: String
    let value: String
    let color: Color
    let icon: String?
    
    init(label: String, value: String, color: Color = .white, icon: String? = nil) {
        self.label = label
        self.value = value
        self.color = color
        self.icon = icon
    }
    
    var body: some View {
        HStack {
            if let icon = icon {
                Image(systemName: icon)
                    .foregroundColor(color.opacity(0.8))
                    .font(.system(size: 14))
            }
            
            Text(label)
                .font(.caption)
                .foregroundColor(.white.opacity(0.6))
            
            Spacer()
            
            Text(value)
                .font(.caption)
                .fontWeight(.semibold)
                .foregroundColor(color.opacity(0.8))
        }
    }
}

// MARK: - Quick Stat View
struct QuickStatView: View {
    let value: String
    let label: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.headline)
                .foregroundColor(color)
            Text(label)
                .font(.caption)
                .foregroundColor(.white.opacity(0.7))
        }
    }
}

// MARK: - Deficit Surplus Display
struct DeficitSurplusDisplay: View {
    let deficit: Int
    let isDeficit: Bool
    
    var body: some View {
        VStack(spacing: 4) {
            Text("\(abs(deficit))")
                .font(.headline)
                .foregroundColor(isDeficit ? Theme.emerald : Theme.coral)
            Text(isDeficit ? "Deficit" : "Surplus")
                .font(.caption)
                .foregroundColor(.white.opacity(0.7))
        }
    }
}

// MARK: - Ring Container View
struct RingContainerView<Content: View>: View {
    let content: Content
    let isLoading: Bool
    let onTap: () -> Void
    
    init(isLoading: Bool = false, onTap: @escaping () -> Void = {}, @ViewBuilder content: () -> Content) {
        self.isLoading = isLoading
        self.onTap = onTap
        self.content = content()
    }
    
    var body: some View {
        ZStack {
            // Background circle
            Circle()
                .stroke(Color.white.opacity(0.1), lineWidth: 2)
                .frame(width: 200, height: 200)
            
            if isLoading {
                LoadingRingView()
                    .frame(width: 200, height: 200)
            } else {
                content
                    .frame(width: 200, height: 200)
            }
        }
        .contentShape(Rectangle())
        .onTapGesture(perform: onTap)
    }
}

// MARK: - Animation Wrapper
struct AnimatedRingView<Content: View>: View {
    @State private var animateProgress: Double = 0.0
    let content: (Double) -> Content
    
    init(@ViewBuilder content: @escaping (Double) -> Content) {
        self.content = content
    }
    
    var body: some View {
        content(animateProgress)
            .scaleEffect(animateProgress)
            .opacity(animateProgress)
            .onAppear {
                withAnimation(.easeOut(duration: 1.0)) {
                    animateProgress = 1.0
                }
            }
    }
}

// MARK: - Glass Card Modifier
struct GlassCardModifier: ViewModifier {
    func body(content: Content) -> some View {
        content
            .padding()
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Theme.glassMorphism)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Theme.cardBorder)
                    )
            )
    }
}

// glassCard() removed - already defined in Theme.swift

// MARK: - Period Title View
struct PeriodTitleView: View {
    let title: String
    let subtitle: String?
    
    init(title: String, subtitle: String? = nil) {
        self.title = title
        self.subtitle = subtitle
    }
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.headline)
                    .foregroundColor(.white)
                
                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.6))
                }
            }
            Spacer()
        }
    }
}