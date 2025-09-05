//
//  MonthlyCaloriesView.swift
//  HannahHealth
//
//  Monthly aggregated view using same ring visualization as daily
//

import SwiftUI

struct MonthlyCaloriesView: View {
    @EnvironmentObject var viewModel: DashboardViewModel
    let monthData: MonthData
    
    @State private var selectedSegment: String? = nil
    @State private var animateProgress: Double = 0.0
    @State private var hasAnimated = false
    
    // Aggregate weekly data
    var totalCaloriesConsumed: Int {
        let total = monthData.totalCalories
        print("📍 Weekly totalCaloriesConsumed: \(total) from \(monthData.allDays.count) days")
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "MMM d"
        for day in monthData.allDays {
            print("   \(dateFormatter.string(from: day.date)): \(day.calories) cal consumed, \(day.activeEnergy) cal burned, \(day.meals.count) meals")
        }
        return total
    }
    
    var averageDailyCalories: Int {
        monthData.averageDailyCalories
    }
    
    // Calculate weekly totals from the days
    func monthlyBMR(actualBMR: Int) -> Int {
        // BMR is daily, so multiply by actual days with data (not full month for current month)
        actualBMR * monthData.allDays.count
    }
    
    var monthlySteps: Int {
        monthData.allDays.reduce(0) { $0 + $1.steps }
    }
    
    func monthlyStepCalories(userWeight: Double) -> Int {
        // Steps are for display only - Active Energy already includes all movement
        // Return 0 to avoid double counting
        return 0
    }
    
    var monthlyExerciseCalories: Int {
        // Sum up Active Energy from all days
        // Active Energy already includes all movement and exercise
        let total = monthData.allDays.reduce(0) { $0 + $1.activeEnergy }
        print("📊 Monthly Active Energy breakdown:")
        for day in monthData.allDays {
            print("   \(day.date): \(day.activeEnergy) cal")
        }
        print("   Total: \(total) cal")
        return total
    }
    
    var monthlyTEF: Int {
        Int(Double(totalCaloriesConsumed) * 0.10)
    }
    
    var monthlyTDEE: Int {
        // This will be calculated in the body where we have access to viewModel
        0  // Placeholder, will compute in body
    }
    
    func monthlyTarget(dailyTarget: Int) -> Int {
        // Monthly target = daily target × actual days with data (not full month for current month)
        dailyTarget * monthData.allDays.count
    }
    
    func monthlyDeficitTarget(dailyDeficit: Int) -> Int {
        // Monthly deficit = daily deficit × actual days with data
        dailyDeficit * monthData.allDays.count
    }
    
    // monthlyRemaining is computed in the body where we have access to viewModel
    
    // Calculate meal breakdown for the week
    var monthlyMealCalories: [String: Int] {
        var totals: [String: Int] = [
            "breakfast": 0,
            "lunch": 0,
            "dinner": 0,
            "snack": 0
        ]
        
        // Aggregate meals from all days
        for day in monthData.allDays {
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
        let computedMonthlyBMR = viewModel.actualBMR * monthData.allDays.count
        let computedMonthlyStepCalories = 0  // Steps are for display only - Active Energy includes all movement
        let computedMonthlyTDEE = computedMonthlyBMR + monthlyExerciseCalories + monthlyTEF  // Active Energy replaces step calories
        let computedMonthlyDeficitGoal = viewModel.dailyDeficitTarget * monthData.allDays.count
        let computedMonthlyTarget = computedMonthlyTDEE - computedMonthlyDeficitGoal  // Target = TDEE - deficit goal
        
        // Debug logging for monthly calculation
        let _ = print("🔍 Monthly Calculation Debug:")
        let _ = print("   actualBMR: \(viewModel.actualBMR)")
        let _ = print("   Days in month: \(monthData.allDays.count)")
        let _ = print("   Monthly BMR: \(computedMonthlyBMR)")
        let _ = print("   Monthly Exercise: \(monthlyExerciseCalories)")
        let _ = print("   Monthly TEF: \(monthlyTEF)")
        let _ = print("   Monthly TDEE: \(computedMonthlyTDEE)")
        let _ = print("   Monthly Target (TDEE - deficit goal): \(computedMonthlyTarget)")
        let _ = print("   Total Consumed: \(totalCaloriesConsumed)")
        let _ = print("   Actual Deficit/Surplus: \(computedMonthlyTDEE - totalCaloriesConsumed)")
        
        // Compute progress status
        let percentage = Double(totalCaloriesConsumed) / Double(max(computedMonthlyTarget, 1))
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
                Text("\(monthData.monthName)")
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
                        bmr: computedMonthlyBMR,
                        steps: computedMonthlyStepCalories,
                        exercise: monthlyExerciseCalories,
                        tef: monthlyTEF,
                        selectedSegment: $selectedSegment,
                        animateProgress: animateProgress
                    )
                    
                    // Inner ring - Food consumption vs target
                    FoodProgressRing(
                        consumed: totalCaloriesConsumed,
                        target: computedMonthlyTarget,
                        deficit: computedMonthlyDeficitGoal,
                        tdee: computedMonthlyTDEE,
                        progressStatus: computedProgressStatus,
                        mealCalories: monthlyMealCalories,
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
                        let _ = print("   BMR: \(computedMonthlyBMR)")
                        let _ = print("   TEF: \(monthlyTEF)")
                        let _ = print("   Exercise: \(monthlyExerciseCalories)")
                        let _ = print("   Meal calories: \(monthlyMealCalories)")
                        
                        // Show selected segment details
                        SelectedSegmentDetail(
                            segment: selected,
                            bmr: computedMonthlyBMR,
                            steps: computedMonthlyStepCalories,
                            stepCount: monthlySteps,
                            exercise: monthlyExerciseCalories,
                            tef: monthlyTEF,
                            food: totalCaloriesConsumed,
                            deficit: computedMonthlyDeficitGoal,
                            mealCalories: monthlyMealCalories
                        )
                    } else {
                        // Default display - calories remaining (EXACTLY like daily view)
                        let monthlyRemaining = computedMonthlyTarget - totalCaloriesConsumed
                        Text("\(abs(monthlyRemaining))")
                            .font(.system(size: 28, weight: .bold, design: .rounded))
                            .foregroundColor(monthlyRemaining >= 0 ? .white : Theme.coral)
                        
                        Text("cal")
                            .font(.system(size: 14, weight: .medium))
                            .foregroundColor(.white.opacity(0.8))
                        
                        Text(monthlyRemaining >= 0 ? "remaining" : "over")
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
                    stepCount: monthlySteps,
                    exercise: monthlyExerciseCalories,
                    exerciseMinutes: monthlyExerciseCalories > 0 ? monthlyExerciseCalories / 10 : 0,
                    tef: monthlyTEF,
                    food: totalCaloriesConsumed,
                    deficit: computedWeeklyDeficitGoal,
                    mealCalories: monthlyMealCalories
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
                    
                    Text("\(computedMonthlyTDEE) cal")
                        .font(.caption)
                        .fontWeight(.semibold)
                        .foregroundColor(.white.opacity(0.8))
                    
                    Spacer()
                }
                
                if computedMonthlyDeficitGoal > 0 {
                    HStack(spacing: 8) {
                        Text("Target")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.6))
                            .frame(width: 40, alignment: .leading)
                        
                        Text("\(computedMonthlyTarget) cal")
                            .font(.caption)
                            .fontWeight(.semibold)
                            .foregroundColor(.white.opacity(0.8))
                        
                        Text("(\(computedMonthlyDeficitGoal) deficit)")
                            .font(.caption)
                            .foregroundColor(Theme.coral.opacity(0.8))
                        
                        Spacer()
                    }
                }
            }
            
            // Monthly stats summary (simplified)
            HStack(spacing: 20) {
                VStack(spacing: 4) {
                    Text("\(monthData.allDays.count)")
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
                    let monthlyDeficit = computedMonthlyTDEE - totalCaloriesConsumed
                    Text("\(abs(monthlyDeficit))")
                        .font(.headline)
                        .foregroundColor(monthlyDeficit > 0 ? Theme.emerald : Theme.coral)
                    Text(monthlyDeficit > 0 ? "Deficit" : "Surplus")
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
            
            // Monthly Quick Stats - Last 4 Weeks (Separate Card)
            VStack(spacing: 20) {
                // Header
                HStack {
                    Text("Monthly Charts")
                        .font(.headline)
                        .foregroundColor(.white)
                    Spacer()
                }
                
                // Get last 4 weeks of data
                let weeksData = getLastFourWeeks(from: monthData.allDays)
                
                // Exercise Chart - 4 week bars
                MonthlyWeeklyBars(
                    title: "Exercise",
                    icon: "flame.fill",
                    weeks: weeksData,
                    valueForDay: { day in day.activeEnergy },
                    maxValue: 800,
                    unit: "cal",
                    color: Theme.coral
                )
                
                // Steps Chart - 4 week bars
                MonthlyWeeklyBars(
                    title: "Steps",
                    icon: "figure.walk",
                    weeks: weeksData,
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
                
                // Calories Chart - 4 week bars
                MonthlyWeeklyBars(
                    title: "Calories",
                    icon: "fork.knife",
                    weeks: weeksData,
                    valueForDay: { day in day.calories },
                    maxValue: 3000,
                    unit: "cal",
                    color: Theme.lavender,
                    formatValue: { value in
                        return "\(value)"
                    }
                )
                
                // Calories +/- Chart - 4 week bars
                MonthlyWeeklyBars(
                    title: "Calories +/-",
                    icon: "plusminus.circle.fill",
                    weeks: weeksData,
                    valueForDay: { day in
                        let dailyBMR = viewModel.actualBMR
                        let dailyActiveEnergy = day.activeEnergy
                        let dailyTEF = Int(Double(day.calories) * 0.10)
                        let dailyTDEE = dailyBMR + dailyActiveEnergy + dailyTEF
                        let difference = dailyTDEE - day.calories
                        return abs(difference)
                    },
                    maxValue: 1000,
                    unit: "cal",
                    color: Theme.emerald,
                    formatValue: { value in
                        return "\(value)"
                    },
                    showDeficitSurplus: true,
                    deficitSurplusValue: { day in
                        let dailyBMR = viewModel.actualBMR
                        let dailyActiveEnergy = day.activeEnergy
                        let dailyTEF = Int(Double(day.calories) * 0.10)
                        let dailyTDEE = dailyBMR + dailyActiveEnergy + dailyTEF
                        return dailyTDEE - day.calories
                    },
                    showTotal: true
                )
                
                // Weight Chart - Special handling for lowest weight per week
                WeightMonthlyBars(
                    title: "Weight",
                    icon: "scalemass",
                    weeks: getLastFourWeeks(from: monthData.allDays),
                    useMetric: viewModel.useMetric
                )
            }
            .padding()
            .glassCard()
            
        } // End of main VStack
    }
    
    // Helper to get last 4 weeks of data
    private func getLastFourWeeks(from days: [DayData]) -> [[DayData]] {
        let calendar = Calendar.current
        var weeks: [[DayData]] = []
        
        // Group all days by week
        var weekDict: [Int: [DayData]] = [:]
        for day in days {
            let weekOfYear = calendar.component(.weekOfYear, from: day.date)
            weekDict[weekOfYear, default: []].append(day)
        }
        
        // Get the last 4 weeks
        let sortedWeeks = weekDict.sorted { $0.key < $1.key }
        let lastFourWeeks = sortedWeeks.suffix(4)
        
        for (_, daysInWeek) in lastFourWeeks {
            weeks.append(daysInWeek.sorted { $0.date < $1.date })
        }
        
        return weeks
    }
}

// MARK: - Weight Monthly Bars Component (Shows lowest weight per week)
struct WeightMonthlyBars: View {
    let title: String
    let icon: String
    let weeks: [[DayData]]
    let useMetric: Bool
    
    private let weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4"]
    
    // Get the lowest weight from a week's data
    private func lowestWeightForWeek(_ weekData: [DayData]) -> Double? {
        let weightsInWeek = weekData.compactMap { $0.weight }
        guard !weightsInWeek.isEmpty else {
            // No weights this week, find last known weight from previous weeks
            return nil
        }
        return weightsInWeek.min()
    }
    
    var body: some View {
        VStack(spacing: 8) {
            // Header
            HStack {
                Image(systemName: icon)
                    .font(.system(size: 14))
                    .foregroundColor(Theme.lavender)
                Text(title)
                    .font(.system(size: 13, weight: .medium))
                    .foregroundColor(.white)
                Spacer()
                
                Text(useMetric ? "kg" : "lbs")
                    .font(.system(size: 11))
                    .foregroundColor(.white.opacity(0.5))
            }
            
            // Always show 4 Week bars
            HStack(spacing: 20) {
                ForEach(0..<4, id: \.self) { weekIndex in
                    let hasData = weekIndex < weeks.count
                    let weekData = hasData ? weeks[weekIndex] : []
                    let lowestWeight = hasData ? lowestWeightForWeek(weekData) : nil
                    
                    VStack(spacing: 4) {
                        // Weekly lowest weight value
                        if let weight = lowestWeight {
                            let displayWeight = useMetric ? weight : weight * 2.205
                            Text(String(format: "%.1f", displayWeight))
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundColor(Theme.lavender)
                        } else {
                            Text("-")
                                .font(.system(size: 10, weight: .semibold))
                                .foregroundColor(.white.opacity(0.3))
                        }
                        
                        // Bar
                        GeometryReader { geometry in
                            ZStack(alignment: .bottom) {
                                // Background (always visible)
                                RoundedRectangle(cornerRadius: 3)
                                    .fill(Color.white.opacity(0.1))
                                
                                // Value bar (only if has data)
                                if let weight = lowestWeight {
                                    let displayWeight = useMetric ? weight : weight * 2.205
                                    let maxWeight = useMetric ? 150.0 : 330.0
                                    let minWeight = useMetric ? 40.0 : 88.0
                                    let normalizedValue = (displayWeight - minWeight) / (maxWeight - minWeight)
                                    
                                    RoundedRectangle(cornerRadius: 3)
                                        .fill(Theme.lavender)
                                        .frame(height: geometry.size.height * min(max(normalizedValue, 0.1), 1.0))
                                        .animation(.easeInOut(duration: 0.3), value: displayWeight)
                                }
                            }
                        }
                        .frame(height: 60)
                        
                        // Week label
                        Text(weekIndex < weekLabels.count ? weekLabels[weekIndex] : "W\(weekIndex + 1)")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(hasData ? .white.opacity(0.7) : .white.opacity(0.3))
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

// MARK: - Monthly Weekly Bars Component (4 weeks of totals)
struct MonthlyWeeklyBars: View {
    let title: String
    let icon: String
    let weeks: [[DayData]]
    let valueForDay: (DayData) -> Int
    let maxValue: Int
    let unit: String
    let color: Color
    var formatValue: ((Int) -> String)? = nil
    var showDeficitSurplus: Bool = false
    var deficitSurplusValue: ((DayData) -> Int)? = nil
    var showTotal: Bool = false
    
    private let weekLabels = ["Week 1", "Week 2", "Week 3", "Week 4"]
    
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
                    let total = weeks.flatMap { $0 }.reduce(0) { sum, day in
                        sum + (deficitSurplusValue?(day) ?? 0)
                    }
                    let sign = total >= 0 ? "-" : "+"
                    Text("\(sign)\(abs(total))")
                        .font(.system(size: 12, weight: .semibold))
                        .foregroundColor(total >= 0 ? Theme.emerald : Theme.coral)
                }
            }
            
            // Always show 4 Week bars
            HStack(spacing: 20) {
                ForEach(0..<4, id: \.self) { weekIndex in
                    let hasData = weekIndex < weeks.count
                    let weekData = hasData ? weeks[weekIndex] : []
                    let weekTotal = weekData.reduce(0) { sum, day in
                        sum + valueForDay(day)
                    }
                    let weekDeficitSurplus = showDeficitSurplus && hasData ?
                        weekData.reduce(0) { sum, day in
                            sum + (deficitSurplusValue?(day) ?? 0)
                        } : 0
                    
                    let barColor = showDeficitSurplus ?
                        (weekDeficitSurplus >= 0 ? Theme.emerald : Theme.coral) : color
                    
                    VStack(spacing: 4) {
                        // Weekly total value
                        Text(hasData && weekTotal > 0 ? formatDisplayValue(weekTotal, deficit: weekDeficitSurplus) : "-")
                            .font(.system(size: 10, weight: .semibold))
                            .foregroundColor(hasData && weekTotal > 0 ? barColor : .white.opacity(0.3))
                        
                        // Bar
                        GeometryReader { geometry in
                            ZStack(alignment: .bottom) {
                                // Background (always visible)
                                RoundedRectangle(cornerRadius: 3)
                                    .fill(Color.white.opacity(0.1))
                                
                                // Value bar (only if has data)
                                if hasData && weekTotal > 0 {
                                    RoundedRectangle(cornerRadius: 3)
                                        .fill(barColor)
                                        .frame(height: geometry.size.height * min(Double(weekTotal) / Double(maxValue * 7), 1.0))
                                        .animation(.easeInOut(duration: 0.3), value: weekTotal)
                                }
                            }
                        }
                        .frame(height: 60)
                        
                        // Week label
                        Text(weekIndex < weekLabels.count ? weekLabels[weekIndex] : "W\(weekIndex + 1)")
                            .font(.system(size: 11, weight: .medium))
                            .foregroundColor(hasData ? .white.opacity(0.7) : .white.opacity(0.3))
                    }
                }
            }
        }
        .padding(.vertical, 12)
        .padding(.horizontal, 16)
        .background(Color.white.opacity(0.05))
        .cornerRadius(12)
    }
    
    private func formatDisplayValue(_ value: Int, deficit: Int = 0) -> String {
        if showDeficitSurplus {
            let sign = deficit >= 0 ? "-" : "+"
            return "\(sign)\(abs(value))"
        } else if let formatter = formatValue {
            return formatter(value)
        } else if value >= 10000 {
            return String(format: "%.1fk", Double(value) / 1000.0)
        } else {
            return "\(value)"
        }
    }
}