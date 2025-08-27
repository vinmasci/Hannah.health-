//
//  DashboardView.swift
//  HannahHealth
//
//  Created on 26/8/2025.
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
                    
                    // Daily Summary Card
                    DailySummaryCard()
                    
                    // Quick Stats Grid
                    QuickStatsGrid()
                    
                    // Food & Activity Log
                    FoodActivityLogCard()
                    
                    // Hannah's Daily Advice
                    HannahAdviceCarousel()
                    
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

struct DashboardHeader: View {
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Good morning")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
                
                Text("Welcome back")
                    .font(Theme.title)
                    .foregroundColor(.white)
                    .fontWeight(.bold)
            }
            
            Spacer()
            
            Button {
                // Profile action
            } label: {
                Circle()
                    .fill(Theme.glassMorphism)
                    .frame(width: 44, height: 44)
                    .overlay(
                        Image(systemName: "person.circle")
                            .font(.title2)
                            .foregroundColor(.white)
                    )
            }
        }
        .padding(.top, 8)
    }
}

struct DailySummaryCard: View {
    @EnvironmentObject var viewModel: DashboardViewModel
    @State private var currentPage = 0
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Text(currentPage == 0 ? "Calories" : "Macros")
                    .font(Theme.headline)
                    .foregroundColor(.white)
                    .fontWeight(.semibold)
                
                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.top, 16)
            .padding(.bottom, 8)
            
            // Swipeable content
            TabView(selection: $currentPage) {
                CaloriesView()
                    .environmentObject(viewModel)
                    .tag(0)
                
                MacrosView()
                    .tag(1)
            }
            .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
            .frame(height: 300)
            
            // Page indicator dots
            HStack(spacing: 8) {
                ForEach(0..<2) { index in
                    Circle()
                        .fill(currentPage == index ? Color.white : Color.white.opacity(0.3))
                        .frame(width: 8, height: 8)
                        .animation(.easeInOut, value: currentPage)
                }
            }
            .padding(.bottom, 16)
        }
        .glassCard()
    }
}

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

struct MacrosView: View {
    var body: some View {
        VStack(spacing: 16) {
            // Three macro circles
            HStack(spacing: 16) {
                MacroCircle(
                    title: "Carbohydrates",
                    current: 145,
                    goal: 322,
                    color: Theme.coral,
                    progress: 0.45
                )
                
                MacroCircle(
                    title: "Fat",
                    current: 31,
                    goal: 86,
                    color: Theme.lavender,
                    progress: 0.36
                )
                
                MacroCircle(
                    title: "Protein",
                    current: 82,
                    goal: 129,
                    color: Theme.mint,
                    progress: 0.64
                )
            }
            .padding(.horizontal, 20)
            
        }
        .padding(.top, 12)
    }
}

struct MacroCircle: View {
    let title: String
    let current: Int
    let goal: Int
    let color: Color
    let progress: Double
    
    var body: some View {
        VStack(spacing: 8) {
            Text(title)
                .font(.caption2)
                .foregroundColor(color)
                .multilineTextAlignment(.center)
                .lineLimit(1)
                .minimumScaleFactor(0.8)
            
            ZStack {
                Circle()
                    .stroke(Color.white.opacity(0.1), lineWidth: 6)
                    .frame(width: 70, height: 70)
                
                Circle()
                    .trim(from: 0, to: progress)
                    .stroke(color, style: StrokeStyle(lineWidth: 6, lineCap: .round))
                    .frame(width: 70, height: 70)
                    .rotationEffect(.degrees(-90))
                
                VStack(spacing: 0) {
                    Text("\(current)")
                        .font(.system(size: 18, weight: .bold))
                        .foregroundColor(.white)
                    
                    Text("/\(goal)g")
                        .font(.system(size: 11))
                        .foregroundColor(.white.opacity(0.6))
                }
            }
            
            Text("\(goal - current)g left")
                .font(.system(size: 11))
                .foregroundColor(.white.opacity(0.7))
        }
    }
}

struct MacroItem: View {
    let title: String
    let value: String
    let color: Color
    
    var body: some View {
        VStack(spacing: 4) {
            Text(value)
                .font(.headline)
                .foregroundColor(color)
                .fontWeight(.semibold)
            
            Text(title)
                .font(.caption)
                .foregroundColor(.white.opacity(0.7))
        }
    }
}

struct QuickStatsGrid: View {
    @EnvironmentObject var viewModel: DashboardViewModel
    
    var body: some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible())
        ], spacing: 12) {
            StatCard(
                icon: "figure.walk",
                title: "Steps",
                value: viewModel.stepsDisplayText,
                target: viewModel.stepsTargetText,
                progress: viewModel.stepsProgress,
                color: Theme.emerald
            )
            
            StatCard(
                icon: "flame.fill",
                title: "Exercise",
                value: viewModel.caloriesDisplayText,
                target: viewModel.caloriesTargetText,
                progress: viewModel.caloriesProgress,
                color: Theme.coral
            )
        }
    }
}

struct StatCard: View {
    let icon: String
    let title: String
    let value: String
    let target: String
    let progress: Double
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(color)
                
                Spacer()
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.headline)
                    .foregroundColor(.white)
                    .fontWeight(.semibold)
                
                Text(target)
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
            }
            
            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(Color.white.opacity(0.2))
                        .frame(height: 4)
                        .cornerRadius(2)
                    
                    Rectangle()
                        .fill(color)
                        .frame(width: geometry.size.width * progress, height: 4)
                        .cornerRadius(2)
                        .animation(.easeInOut(duration: 1.0), value: progress)
                }
            }
            .frame(height: 4)
        }
        .padding(16)
        .glassCard()
    }
}

struct FoodActivityLogCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Food & Activity Log")
                    .font(Theme.headline)
                    .foregroundColor(.white)
                    .fontWeight(.semibold)
                
                Spacer()
                
                Button("View All") {
                    // View all action
                }
                .font(.caption)
                .foregroundColor(Theme.sky)
            }
            
            VStack(spacing: 8) {
                FoodItem(
                    name: "Greek Yogurt with Berries",
                    calories: "180 cal",
                    confidence: 0.92,
                    time: "8:30 AM"
                )
                
                FoodItem(
                    name: "Avocado Toast",
                    calories: "245 cal",
                    confidence: 0.78,
                    time: "12:15 PM"
                )
                
                FoodItem(
                    name: "Grilled Chicken Salad",
                    calories: "320 cal",
                    confidence: 0.85,
                    time: "6:45 PM"
                )
            }
        }
        .padding(20)
        .glassCard()
    }
}

struct HannahAdviceCarousel: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Hannah's Daily Advice")
                    .font(Theme.headline)
                    .foregroundColor(.white)
                    .fontWeight(.semibold)
                
                Spacer()
                
                Button("View All") {
                    // View all action
                }
                .font(.caption)
                .foregroundColor(Theme.sky)
            }
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    AdviceCard(
                        title: "Great protein intake!",
                        description: "You're hitting your protein goals perfectly. Keep it up!",
                        icon: "checkmark.circle.fill",
                        color: Theme.emerald
                    )
                    
                    AdviceCard(
                        title: "Try more vegetables",
                        description: "Add some leafy greens to your next meal for extra nutrients.",
                        icon: "leaf.fill",
                        color: Theme.mint
                    )
                    
                    AdviceCard(
                        title: "Stay hydrated",
                        description: "You're close to your water goal. Just 2 more cups!",
                        icon: "drop.fill",
                        color: Theme.sky
                    )
                }
            }
        }
        .padding(20)
        .glassCard()
    }
}

struct AdviceCard: View {
    let title: String
    let description: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(color)
                
                Spacer()
            }
            
            Text(title)
                .font(.subheadline)
                .foregroundColor(.white)
                .fontWeight(.semibold)
            
            Text(description)
                .font(.caption)
                .foregroundColor(.white.opacity(0.8))
                .multilineTextAlignment(.leading)
        }
        .padding(16)
        .frame(width: 200, alignment: .leading)
        .background(Color.black.opacity(0.3))
        .cornerRadius(12)
    }
}

struct FoodItem: View {
    let name: String
    let calories: String
    let confidence: Double
    let time: String
    
    var body: some View {
        HStack(spacing: 12) {
            Circle()
                .fill(Theme.sky.opacity(0.2))
                .frame(width: 40, height: 40)
                .overlay(
                    Image(systemName: "fork.knife")
                        .font(.system(size: 16))
                        .foregroundColor(Theme.sky)
                )
            
            VStack(alignment: .leading, spacing: 2) {
                Text(name)
                    .font(.subheadline)
                    .foregroundColor(.white)
                    .fontWeight(.medium)
                
                HStack {
                    Text(calories)
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                    
                    Text("•")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.5))
                    
                    ConfidenceBadge(confidence: confidence)
                }
            }
            
            Spacer()
            
            Text(time)
                .font(.caption)
                .foregroundColor(.white.opacity(0.6))
        }
    }
}

// Confidence Badge component from UI-DESIGN.md
struct ConfidenceBadge: View {
    let confidence: Double
    
    var color: Color {
        switch confidence {
        case 0.9...1.0: return Theme.emerald
        case 0.7..<0.9: return Color.yellow
        default: return Color.orange
        }
    }
    
    var body: some View {
        Text("\(Int(confidence * 100))% confident")
            .font(.caption2)
            .foregroundColor(color)
    }
}



#Preview {
    DashboardView()
}