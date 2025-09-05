//
//  WeeklyCaloriesView.swift
//  HannahHealth
//
//  Weekly aggregated view using same ring visualization as daily
//

import SwiftUI

struct WeeklyCaloriesView: View {
    @EnvironmentObject var viewModel: DashboardViewModel
    let weekData: WeekData
    
    @State private var selectedSegment: String? = nil
    @State private var animateProgress: Double = 0.0
    @State private var hasAnimated = false
    
    // Aggregate weekly data
    var totalCaloriesConsumed: Int {
        let total = weekData.totalCalories
        print("📍 Weekly totalCaloriesConsumed: \(total) from \(weekData.days.count) days")
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MMM d"
        for day in weekData.days {
            print("   \(dateFormatter.string(from: day.date)): \(day.calories) cal consumed, \(day.activeEnergy) cal burned, \(day.meals.count) meals")
        }
        return total
    }
    
    var averageDailyCalories: Int {
        weekData.averageCalories
    }
    
    // Calculate weekly totals from the days
    func weeklyBMR(actualBMR: Int) -> Int {
        // BMR is daily, so multiply by actual days with data (not full week for current week)
        actualBMR * weekData.days.count
    }
    
    var weeklySteps: Int {
        weekData.days.reduce(0) { $0 + $1.steps }
    }
    
    func weeklyStepCalories(userWeight: Double) -> Int {
        // Steps are for display only - Active Energy already includes all movement
        // Return 0 to avoid double counting
        return 0
    }
    
    var weeklyExerciseCalories: Int {
        // Sum up Active Energy from all days
        // Active Energy already includes all movement and exercise
        let total = weekData.days.reduce(0) { $0 + $1.activeEnergy }
        print("📊 Weekly Active Energy breakdown:")
        for day in weekData.days {
            print("   \(day.date): \(day.activeEnergy) cal")
        }
        print("   Total: \(total) cal")
        return total
    }
    
    var weeklyTEF: Int {
        Int(Double(totalCaloriesConsumed) * 0.10)
    }
    
    var weeklyTDEE: Int {
        // This will be calculated in the body where we have access to viewModel
        0  // Placeholder, will compute in body
    }
    
    func weeklyTarget(dailyTarget: Int) -> Int {
        // Weekly target = daily target × actual days with data (not full week for current week)
        dailyTarget * weekData.days.count
    }
    
    func weeklyDeficitTarget(dailyDeficit: Int) -> Int {
        // Weekly deficit = daily deficit × actual days with data
        dailyDeficit * weekData.days.count
    }
    
    // weeklyRemaining is computed in the body where we have access to viewModel
    
    // Calculate meal breakdown for the week
    var weeklyMealCalories: [String: Int] {
        var totals: [String: Int] = [
            "breakfast": 0,
            "lunch": 0,
            "dinner": 0,
            "snack": 0
        ]
        
        // Aggregate meals from all days
        for day in weekData.days {
            for meal in day.meals {
                if let mealType = meal.mealType {
                    let mappedType = mapMealTypeForDisplay(mealType)
                    totals[mappedType, default: 0] += meal.calories
                }
            }
        }
        
        return totals
    }
    
    private func mapMealTypeForDisplay(_ mealType: String) -> String {
        if mealType.contains("snack") {
            return "snack"
        }
        return mealType
    }
    
    // This will be computed in the body where we have access to viewModel
    // var progressStatus: CaloriesView.ProgressStatus { ... }
    
    var body: some View {
        // Compute all values here where we have access to viewModel
        let computedWeeklyBMR = viewModel.actualBMR * weekData.days.count
        let computedWeeklyStepCalories = 0  // Steps are for display only - Active Energy includes all movement
        let computedWeeklyTDEE = computedWeeklyBMR + weeklyExerciseCalories + weeklyTEF  // Active Energy replaces step calories
        let computedWeeklyDeficitGoal = viewModel.dailyDeficitTarget * weekData.days.count
        let computedWeeklyTarget = computedWeeklyTDEE - computedWeeklyDeficitGoal  // Target = TDEE - deficit goal
        
        // Debug logging for weekly calculation
        let _ = print("🔍 Weekly Calculation Debug:")
        let _ = print("   actualBMR: \(viewModel.actualBMR)")
        let _ = print("   Days in week: \(weekData.days.count)")
        let _ = print("   Weekly BMR: \(computedWeeklyBMR)")
        let _ = print("   Weekly Exercise: \(weeklyExerciseCalories)")
        let _ = print("   Weekly TEF: \(weeklyTEF)")
        let _ = print("   Weekly TDEE: \(computedWeeklyTDEE)")
        let _ = print("   Weekly Target (TDEE - deficit goal): \(computedWeeklyTarget)")
        let _ = print("   Total Consumed: \(totalCaloriesConsumed)")
        let _ = print("   Actual Deficit/Surplus: \(computedWeeklyTDEE - totalCaloriesConsumed)")
        
        // Compute progress status
        let percentage = Double(totalCaloriesConsumed) / Double(max(computedWeeklyTarget, 1))
        let computedProgressStatus: ProgressStatus = {
            if percentage <= 1.0 {
                return .onTrack
            } else if percentage <= 1.15 {
                return .warning
            } else {
                return .over
            }
        }()
        
        return VStack(spacing: 20) {
            // Ring Card
            VStack(spacing: 16) {
            // Title
            HStack {
                Text("Week of \(weekData.startDate, formatter: weekFormatter)")
                    .font(.headline)
                    .foregroundColor(.white)
                Spacer()
            }
            
            // Ring visualization (same as daily but with weekly data)
            ZStack {
                // Background circle
                Circle()
                    .stroke(Color.white.opacity(0.1), lineWidth: 2)
                    .frame(width: 200, height: 200)
                
                // Use EXACT same components as daily view
                ZStack {
                    // Outer ring - TDEE Components
                    TDEEDonutRing(
                        bmr: computedWeeklyBMR,
                        steps: computedWeeklyStepCalories,
                        exercise: weeklyExerciseCalories,
                        tef: weeklyTEF,
                        selectedSegment: $selectedSegment,
                        animateProgress: animateProgress
                    )
                    
                    // Inner ring - Food consumption vs target
                    FoodProgressRing(
                        consumed: totalCaloriesConsumed,
                        target: computedWeeklyTarget,
                        deficit: computedWeeklyDeficitGoal,
                        tdee: computedWeeklyTDEE,
                        progressStatus: computedProgressStatus,
                        mealCalories: weeklyMealCalories,
                        selectedSegment: $selectedSegment,
                        animateProgress: animateProgress
                    )
                }
                .frame(width: 200, height: 200)
                .scaleEffect(animateProgress)
                .opacity(animateProgress)
                
                // Center display - same as day view
                VStack(spacing: 4) {
                    if let selected = selectedSegment {
                        // Debug logging
                        let _ = print("🎯 Selected segment: \(selected)")
                        let _ = print("   BMR: \(computedWeeklyBMR)")
                        let _ = print("   TEF: \(weeklyTEF)")
                        let _ = print("   Exercise: \(weeklyExerciseCalories)")
                        let _ = print("   Meal calories: \(weeklyMealCalories)")
                        
                        // Show selected segment details
                        SelectedSegmentDetail(
                            segment: selected,
                            bmr: computedWeeklyBMR,
                            steps: computedWeeklyStepCalories,
                            stepCount: weeklySteps,
                            exercise: weeklyExerciseCalories,
                            tef: weeklyTEF,
                            food: totalCaloriesConsumed,
                            deficit: computedWeeklyDeficitGoal,
                            mealCalories: weeklyMealCalories
                        )
                    } else {
                        // Default display - calories remaining (EXACTLY like daily view)
                        let weeklyRemaining = computedWeeklyTarget - totalCaloriesConsumed
                        Text("\(abs(weeklyRemaining))")
                            .font(.system(size: 28, weight: .bold, design: .rounded))
                            .foregroundColor(weeklyRemaining >= 0 ? .white : Theme.coral)
                        
                        Text("cal")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.white.opacity(0.8))
                        
                        Text(weeklyRemaining >= 0 ? "remaining" : "over")
                            .font(.caption2)
                            .foregroundColor(.white.opacity(0.6))
                    }
                }
            }
            
            // Only show info bar if something is selected (same as daily view)
            // TODO: SegmentInfoBar is defined in CaloriesView.swift - may need to move to separate file
            /*
            if selectedSegment != nil {
                SegmentInfoBar(
                    segment: selectedSegment!,
                    bmr: computedWeeklyBMR,
                    steps: computedWeeklyStepCalories,
                    stepCount: weeklySteps,
                    exercise: weeklyExerciseCalories,
                    exerciseMinutes: weeklyExerciseCalories > 0 ? weeklyExerciseCalories / 10 : 0,
                    tef: weeklyTEF,
                    food: totalCaloriesConsumed,
                    deficit: computedWeeklyDeficitGoal,
                    mealCalories: weeklyMealCalories
                )
                .transition(AnyTransition.opacity.combined(with: AnyTransition.scale))
            }
            */
            
            // TDEE and Goal Information - Same as daily view
            VStack(alignment: .leading, spacing: 4) {
                HStack(spacing: 8) {
                    Text("TDEE")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.6))
                        .frame(width: 40, alignment: .leading)
                    
                    Text("\(computedWeeklyTDEE) cal")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.white.opacity(0.8))
                    
                    Spacer()
                }
                
                if computedWeeklyDeficitGoal > 0 {
                    HStack(spacing: 8) {
                        Text("Target")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.6))
                            .frame(width: 40, alignment: .leading)
                        
                        Text("\(computedWeeklyTarget) cal")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.white.opacity(0.8))
                        
                        Text("(\(computedWeeklyDeficitGoal) deficit)")
                            .font(.caption)
                            .foregroundColor(Theme.coral.opacity(0.8))
                        
                        Spacer()
                    }
                }
            }
            
            // Weekly stats summary (simplified)
            HStack(spacing: 20) {
                VStack(spacing: 4) {
                    Text("\(weekData.days.count)")
                        .font(.headline)
                        .foregroundColor(.white)
                    Text("Days Logged")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                }
                
                Divider()
                    .frame(height: 30)
                    .background(Color.white.opacity(0.2))
                
                VStack(spacing: 4) {
                    let weeklyDeficit = computedWeeklyTDEE - totalCaloriesConsumed
                    Text("\(abs(weeklyDeficit))")
                        .font(.headline)
                        .foregroundColor(weeklyDeficit > 0 ? Theme.emerald : Theme.coral)
                    Text(weeklyDeficit > 0 ? "Deficit" : "Surplus")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                }
            }
            } // End of Ring Card VStack
            .padding()
            .glassCard()
            .contentShape(Rectangle()) // Make entire view tappable
            .onTapGesture {
                // Reset to default view when tapping outside the ring
                withAnimation {
                    selectedSegment = nil
                }
            }
            .onAppear {
                withAnimation(.easeOut(duration: 1.0)) {
                    animateProgress = 1.0
                }
            }
            
            // Weekly Quick Stats with Day-by-Day Bar Charts (Separate Card)
            VStack(spacing: 20) {
                // Header
                HStack {
                    Text("Weekly Charts")
                        .font(.headline)
                        .foregroundColor(.white)
                    Spacer()
                }
                
                // Exercise Chart
                WeeklyDayChart(
                    title: "Exercise",
                    icon: "flame.fill",
                    days: weekData.days,
                    valueForDay: { day in day.activeEnergy },
                    maxValue: 800,
                    unit: "cal",
                    color: Theme.coral
                )
                
                // Steps Chart
                WeeklyDayChart(
                    title: "Steps",
                    icon: "figure.walk",
                    days: weekData.days,
                    valueForDay: { day in day.steps },
                    maxValue: 15000,
                    unit: "",
                    color: Theme.mint,
                    formatValue: { value in
                        if value > 9999 {
                            return String(format: "%.1fk", Double(value) / 1000.0)
                        }
                        return "\(value)"
                    }
                )
                
                // Calories In Chart
                WeeklyDayChart(
                    title: "Calories",
                    icon: "fork.knife",
                    days: weekData.days,
                    valueForDay: { day in day.calories },
                    maxValue: 3000,
                    unit: "cal",
                    color: Theme.lavender, // Changed to purple
                    formatValue: { value in
                        // Show actual calorie values
                        return "\(value)"
                    }
                )
                
                // Calories +/- Chart (Deficit/Surplus)
                WeeklyDayChart(
                    title: "Calories +/-",
                    icon: "plusminus.circle.fill",
                    days: weekData.days,
                    valueForDay: { day in
                        // Calculate daily TDEE for this specific day
                        let dailyBMR = viewModel.actualBMR
                        let dailyActiveEnergy = day.activeEnergy
                        let dailyTEF = Int(Double(day.calories) * 0.10)
                        let dailyTDEE = dailyBMR + dailyActiveEnergy + dailyTEF
                        
                        // Calculate deficit (negative) or surplus (positive)
                        // If consumed < TDEE, it's a deficit (good, show as positive green)
                        // If consumed > TDEE, it's a surplus (bad, show as negative red)
                        let difference = dailyTDEE - day.calories
                        return abs(difference)
                    },
                    maxValue: 1000,
                    unit: "cal",
                    color: Theme.emerald, // Will be overridden per bar
                    formatValue: { value in
                        // Show actual calorie values with +/- prefix
                        return "\(value)"
                    },
                    showDeficitSurplus: true,
                    deficitSurplusValue: { day in
                        // Calculate the actual deficit/surplus for color coding
                        let dailyBMR = viewModel.actualBMR
                        let dailyActiveEnergy = day.activeEnergy
                        let dailyTEF = Int(Double(day.calories) * 0.10)
                        let dailyTDEE = dailyBMR + dailyActiveEnergy + dailyTEF
                        return dailyTDEE - day.calories // Positive = deficit, Negative = surplus
                    },
                    showTotal: true
                )
                
                // Weight Chart
                WeeklyDayChart(
                    title: "Weight",
                    icon: "scalemass",
                    days: weekData.days,
                    valueForDay: { day in
                        // Get weight for this day, converting based on user preference
                        if let weightKg = day.weight {
                            let weight = viewModel.useMetric ? weightKg : weightKg * 2.205
                            return Int(weight * 10) // Store as Int (multiply by 10 to preserve decimal)
                        }
                        
                        // If no weight for this day, find the last known weight
                        let dayIndex = weekData.days.firstIndex(where: { $0.id == day.id }) ?? 0
                        for i in stride(from: dayIndex - 1, through: 0, by: -1) {
                            if let previousWeight = weekData.days[i].weight {
                                let weight = viewModel.useMetric ? previousWeight : previousWeight * 2.205
                                return Int(weight * 10) // Store as Int (multiply by 10 to preserve decimal)
                            }
                        }
                        return 0 // No weight data found
                    },
                    maxValue: viewModel.useMetric ? 1500 : 3300,  // 150kg or 330lbs max
                    unit: viewModel.useMetric ? "kg" : "lbs",
                    color: Theme.lavender,
                    formatValue: { value in
                        // Convert back from Int to decimal
                        let weight = Double(value) / 10.0
                        return String(format: "%.1f", weight)
                    }
                )
            }
            .padding()
            .glassCard()
            
        } // End of main VStack
    }
    
    private var weekFormatter: DateFormatter {
        let formatter = DateFormatter()
        formatter.dateFormat = "MMM d"
        return formatter
    }
}

// MARK: - Weekly Day Chart Component
struct WeeklyDayChart: View {
    let title: String
    let icon: String
    let days: [DayData]
    let valueForDay: (DayData) -> Int
    let maxValue: Int
    let unit: String
    let color: Color
    var formatValue: ((Int) -> String)? = nil
    var showDeficitSurplus: Bool = false
    var deficitSurplusValue: ((DayData) -> Int)? = nil
    var showTotal: Bool = false
    
    private let dayLabels = ["M", "T", "W", "T", "F", "S", "S"]
    
    private func getDayLabel(for date: Date) -> String {
        let weekday = Calendar.current.component(.weekday, from: date)
        // Convert from 1=Sunday to 0=Monday indexing
        let index = weekday == 1 ? 6 : weekday - 2
        return dayLabels[safe: index] ?? ""
    }
    
    var body: some View {
        VStack(spacing: 8) {
            // Header
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 14))
                    .foregroundColor(color)
                Text(title)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.white)
                Spacer()
                
                // Show total if requested
                if showTotal && showDeficitSurplus {
                    let total = days.reduce(0) { sum, day in
                        sum + (deficitSurplusValue?(day) ?? 0)
                    }
                    let sign = total >= 0 ? "-" : "+"
                    Text("\(sign)\(abs(total))")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(total >= 0 ? Theme.emerald : Theme.coral)
                }
            }
            
            // Day bars
            HStack(spacing: 8) {
                ForEach(0..<7, id: \.self) { dayIndex in
                    if let dayData = days.first(where: { day in
                        let calendar = Calendar.current
                        let weekday = calendar.component(.weekday, from: day.date)
                        let dataIndex = weekday == 1 ? 6 : weekday - 2
                        return dataIndex == dayIndex
                    }) {
                        // Day with data
                        let deficitSurplus = showDeficitSurplus ? (deficitSurplusValue?(dayData) ?? 0) : 0
                        let barColor = showDeficitSurplus ? 
                            (deficitSurplus >= 0 ? Theme.emerald : Theme.coral) : color
                        
                        DayBar(
                            dayLabel: dayLabels[dayIndex],
                            value: valueForDay(dayData),
                            maxValue: maxValue,
                            color: barColor,
                            formatValue: formatValue,
                            isDeficitSurplus: showDeficitSurplus,
                            deficitSurplusAmount: deficitSurplus
                        )
                    } else {
                        // Empty day
                        DayBar(
                            dayLabel: dayLabels[dayIndex],
                            value: 0,
                            maxValue: maxValue,
                            color: color.opacity(0.3),
                            formatValue: formatValue
                        )
                    }
                }
            }
        }
        .padding(.vertical, 12)
        .padding(.horizontal, 16)
        .background(Color.white.opacity(0.05))
        .cornerRadius(12)
    }
}

// Individual Day Bar
struct DayBar: View {
    let dayLabel: String
    let value: Int
    let maxValue: Int
    let color: Color
    var formatValue: ((Int) -> String)? = nil
    var isDeficitSurplus: Bool = false
    var deficitSurplusAmount: Int = 0
    
    private var percentage: Double {
        guard maxValue > 0 else { return 0 }
        return min(Double(value) / Double(maxValue), 1.0)
    }
    
    private var displayValue: String {
        if isDeficitSurplus {
            // For deficit/surplus, show with +/- sign
            let sign = deficitSurplusAmount >= 0 ? "-" : "+"
            return "\(sign)\(value)"
        } else if let formatter = formatValue {
            return formatter(value)
        } else if value >= 10000 {
            // Only use k for 10,000+
            return String(format: "%.1fk", Double(value) / 1000.0)
        } else if value >= 1000 {
            // Show comma for thousands (1,234)
            let formatter = NumberFormatter()
            formatter.numberStyle = .decimal
            formatter.maximumFractionDigits = 0
            return formatter.string(from: NSNumber(value: value)) ?? "\(value)"
        } else {
            return "\(value)"
        }
    }
    
    var body: some View {
        VStack(spacing: 4) {
            // Value (shown above bar)
            Text(value > 0 ? displayValue : "-")
                .font(.system(size: 9, weight: .medium))
                .foregroundColor(value > 0 ? 
                    (isDeficitSurplus ? color.opacity(0.9) : .white.opacity(0.8)) : 
                    .white.opacity(0.3))
            
            // Bar
            GeometryReader { geometry in
                ZStack(alignment: .bottom) {
                    // Background
                    RoundedRectangle(cornerRadius: 2)
                        .fill(Color.white.opacity(0.1))
                    
                    // Value bar
                    if value > 0 {
                        RoundedRectangle(cornerRadius: 2)
                            .fill(color)
                            .frame(height: geometry.size.height * percentage)
                            .animation(.easeInOut(duration: 0.3), value: percentage)
                    }
                }
            }
            .frame(height: 40)
            
            // Day label
            Text(dayLabel)
                .font(.system(size: 10, weight: .medium))
                .foregroundColor(.white.opacity(0.6))
        }
    }
}

// Safe array subscript extension
extension Array {
    subscript(safe index: Int) -> Element? {
        return indices.contains(index) ? self[index] : nil
    }
}