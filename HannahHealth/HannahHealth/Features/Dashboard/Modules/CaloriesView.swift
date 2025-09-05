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
                    // Combined TDEE and Food Ring
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
                        // Show selected segment details
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

// MARK: - Selected Segment Detail
struct SelectedSegmentDetail: View {
    let segment: String
    let bmr: Int
    let steps: Int
    let stepCount: Int
    let exercise: Int
    let tef: Int
    let food: Int
    let deficit: Int
    let mealCalories: [String: Int]  // Add meal calories
    
    var body: some View {
        VStack(spacing: 2) {
            switch segment {
            case "BMR":
                Text("BMR")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                Text("\(bmr)")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(Theme.sky)
                Text("base cal")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.6))
                
            case "Steps":
                Text("\(steps)")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(Theme.emerald)
                Text("cal burned")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                Text("\(stepCount) steps")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.6))
                
            case "Exercise", "Active Energy":
                Text("\(exercise)")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(Theme.coral)
                Text("cal burned")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                if exercise > 0 {
                    Text("~\(exercise/10) min")
                        .font(.caption2)
                        .foregroundColor(.white.opacity(0.6))
                }
                
            case "Digestion":
                Text("TEF")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                Text("\(tef)")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(Color(hex: "5EEAD4"))
                Text("digestion")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.6))
                
            case "Deficit":
                // Don't show anything in center - deficit is already shown below the ring
                EmptyView()
                
            case "Breakfast":
                Text("\(mealCalories["breakfast"] ?? 0)")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(Color(hex: "FDA4AF"))
                Text("breakfast")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                Text("calories")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.6))
                
            case "Lunch":
                Text("\(mealCalories["lunch"] ?? 0)")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(Color.yellow)
                Text("lunch")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                Text("calories")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.6))
                
            case "Dinner":
                Text("\(mealCalories["dinner"] ?? 0)")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(Color.purple)
                Text("dinner")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                Text("calories")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.6))
                
            case "Snack":
                Text("\(mealCalories["snack"] ?? 0)")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(Color.orange)
                Text("snack")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                Text("calories")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.6))
                
            case "Morning Snack":
                Text("\(mealCalories["morning snack"] ?? 0)")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(Color.orange)
                Text("morning snack")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                Text("calories")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.6))
                
            case "Afternoon Snack":
                Text("\(mealCalories["afternoon snack"] ?? 0)")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(Color.orange)
                Text("afternoon snack")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                Text("calories")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.6))
                
            case "Evening Snack":
                Text("\(mealCalories["evening snack"] ?? 0)")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(Color.orange)
                Text("evening snack")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.8))
                Text("calories")
                    .font(.caption2)
                    .foregroundColor(.white.opacity(0.6))
                
            default:
                EmptyView()
            }
        }
    }
}

// MARK: - Segment Info Bar
struct SegmentInfoBar: View {
    let segment: String
    let bmr: Int
    let steps: Int
    let stepCount: Int
    let exercise: Int
    let exerciseMinutes: Int
    let tef: Int
    let food: Int
    let deficit: Int
    let mealCalories: [String: Int]
    
    var body: some View {
        VStack(spacing: 4) {
            switch segment {
            case "BMR":
                HStack {
                    Image(systemName: "person.fill")
                        .foregroundColor(Theme.sky)
                    Text("Basal Metabolic Rate")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    Spacer()
                    Text("\(bmr) cal/day")
                        .font(.caption.bold())
                        .foregroundColor(Theme.sky)
                }
                
            case "Steps":
                HStack {
                    Image(systemName: "figure.walk")
                        .foregroundColor(Theme.emerald)
                    Text("Walking Activity")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    Spacer()
                    Text("\(stepCount) steps = \(steps) cal")
                        .font(.caption.bold())
                        .foregroundColor(Theme.emerald)
                }
                
            case "Exercise", "Active Energy":
                HStack {
                    Image(systemName: "flame.fill")
                        .foregroundColor(Theme.coral)
                    Text("Active Exercise")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    Spacer()
                    Text(exerciseMinutes > 0 ? "\(exerciseMinutes) min = \(exercise) cal" : "\(exercise) cal")
                        .font(.caption.bold())
                        .foregroundColor(Theme.coral)
                }
                
            case "Digestion":
                HStack {
                    Image(systemName: "leaf.fill")
                        .foregroundColor(Color(hex: "5EEAD4"))
                    Text("Thermic Effect (10% of food)")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    Spacer()
                    Text("\(tef) cal")
                        .font(.caption.bold())
                        .foregroundColor(Color(hex: "5EEAD4"))
                }
                
            case "Deficit":
                HStack {
                    Image(systemName: "arrow.down.circle.fill")
                        .foregroundColor(Theme.coral)
                    Text("Daily Deficit for Weight Loss")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    Spacer()
                    Text("\(deficit) cal/day")
                        .font(.caption.bold())
                        .foregroundColor(Theme.coral)
                }
                
            case "Breakfast":
                HStack {
                    Image(systemName: "sunrise")
                        .foregroundColor(Color(hex: "FDA4AF"))
                    Text("Breakfast")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    Spacer()
                    Text("\(mealCalories["breakfast"] ?? 0) calories logged")
                        .font(.caption.bold())
                        .foregroundColor(Color(hex: "FDA4AF"))
                }
                
            case "Lunch":
                HStack {
                    Image(systemName: "sun.max")
                        .foregroundColor(Color.yellow)
                    Text("Lunch")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    Spacer()
                    Text("\(mealCalories["lunch"] ?? 0) calories logged")
                        .font(.caption.bold())
                        .foregroundColor(Color.yellow)
                }
                
            case "Dinner":
                HStack {
                    Image(systemName: "sunset")
                        .foregroundColor(Color.purple)
                    Text("Dinner")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    Spacer()
                    Text("\(mealCalories["dinner"] ?? 0) calories logged")
                        .font(.caption.bold())
                        .foregroundColor(Color.purple)
                }
                
            case "Snack":
                HStack {
                    Image(systemName: "carrot")
                        .foregroundColor(Color.orange)
                    Text("Snacks")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    Spacer()
                    Text("\(mealCalories["snack"] ?? 0) calories logged")
                        .font(.caption.bold())
                        .foregroundColor(Color.orange)
                }
                
            case "Morning Snack":
                HStack {
                    Image(systemName: "sun.min")
                        .foregroundColor(Color.orange)
                    Text("Morning Snack")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    Spacer()
                    Text("\(mealCalories["morning snack"] ?? 0) calories logged")
                        .font(.caption.bold())
                        .foregroundColor(Color.orange)
                }
                
            case "Afternoon Snack":
                HStack {
                    Image(systemName: "sun.haze")
                        .foregroundColor(Color.orange)
                    Text("Afternoon Snack")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    Spacer()
                    Text("\(mealCalories["afternoon snack"] ?? 0) calories logged")
                        .font(.caption.bold())
                        .foregroundColor(Color.orange)
                }
                
            case "Evening Snack":
                HStack {
                    Image(systemName: "moon.stars")
                        .foregroundColor(Color.orange)
                    Text("Evening Snack")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    Spacer()
                    Text("\(mealCalories["evening snack"] ?? 0) calories logged")
                        .font(.caption.bold())
                        .foregroundColor(Color.orange)
                }
                
            default:
                EmptyView()
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(
            Rectangle()
                .fill(Color.white.opacity(0.05))
        )
    }
}

// MARK: - Combined Donut Chart
struct CombinedDonutChart: View {
    let bmr: Int
    let steps: Int
    let exercise: Int
    let tef: Int
    let neat: Int // Will be 0
    let consumed: Int
    let target: Int
    let deficit: Int
    let mealCalories: [String: Int]
    @Binding var selectedSegment: String?
    let progressStatus: ProgressStatus
    var animateProgress: Double = 1.0
    
    var tdeeTotal: Int { bmr + steps + exercise + tef }
    
    var body: some View {
        ZStack {
            // Outer ring - TDEE Components
            TDEEDonutRing(
                bmr: bmr,
                steps: steps,
                exercise: exercise,
                tef: tef,
                selectedSegment: $selectedSegment,
                animateProgress: animateProgress
            )
            
            // Inner ring - Food consumption vs target
            FoodProgressRing(
                consumed: consumed,
                target: target,
                deficit: deficit,
                tdee: tdeeTotal,
                progressStatus: progressStatus,
                mealCalories: mealCalories,
                selectedSegment: $selectedSegment,
                animateProgress: animateProgress
            )
        }
    }
}

// MARK: - TDEE Donut Ring
struct TDEEDonutRing: View {
    let bmr: Int
    let steps: Int
    let exercise: Int
    let tef: Int
    @Binding var selectedSegment: String?
    var animateProgress: Double = 1.0
    
    var total: Int { 
        let sum = bmr + steps + exercise + tef
        // Ensure minimum value of 1 to avoid division by zero
        return max(sum, 1)
    }
    
    struct Segment {
        let id: String
        let value: Int
        let color: Color
    }
    
    var segments: [Segment] {
        // Only show segments with actual values
        // Active Energy now includes all movement (steps + exercise)
        var segs: [Segment] = [
            Segment(id: "BMR", value: max(bmr, 1), color: Theme.sky)
        ]
        
        // Only show Active Energy if there's any activity
        if exercise > 0 {
            segs.append(Segment(id: "Active Energy", value: exercise, color: Theme.coral))
        }
        
        // Only show TEF if food has been consumed
        if tef > 0 {
            segs.append(Segment(id: "Digestion", value: tef, color: Color(hex: "5EEAD4")))
        }
        
        // If no segments besides BMR, ensure we return at least BMR
        return segs.isEmpty ? [Segment(id: "BMR", value: max(bmr, 1), color: Theme.sky)] : segs
    }
    
    func angleForIndex(_ index: Int) -> Double {
        var totalAngle: Double = 0
        for i in 0..<index {
            totalAngle += (Double(segments[i].value) / Double(total)) * 360
        }
        return totalAngle
    }
    
    var body: some View {
        ZStack {
            ForEach(Array(segments.enumerated()), id: \.element.id) { index, segment in
                let startAngle = angleForIndex(index)
                let endAngle = angleForIndex(index + 1)
                let isSelected = selectedSegment == segment.id
                
                // Add a small gap for the separator (0.5 degrees on each side)
                let gapSize: Double = 0.5
                let adjustedStart = startAngle + (index == 0 ? 0 : gapSize)
                let adjustedEnd = endAngle - gapSize
                
                Circle()
                    .trim(from: CGFloat(adjustedStart / 360), to: CGFloat(adjustedEnd / 360 * animateProgress))
                    .stroke(
                        segment.color.opacity(isSelected ? 1.0 : 0.8),
                        style: StrokeStyle(lineWidth: isSelected ? 32 : 28, lineCap: .butt)
                    )
                    .scaleEffect(isSelected ? 1.05 : 1.0)
                    .animation(.easeInOut(duration: 0.2), value: isSelected)
                    .onTapGesture {
                        withAnimation {
                            selectedSegment = selectedSegment == segment.id ? nil : segment.id
                        }
                    }
            }
        }
        .rotationEffect(.degrees(-90))
    }
}

// MARK: - Food Progress Ring
struct FoodProgressRing: View {
    let consumed: Int
    let target: Int
    let deficit: Int
    let tdee: Int
    let progressStatus: ProgressStatus
    let mealCalories: [String: Int]  // Add this parameter
    @Binding var selectedSegment: String?
    var animateProgress: Double = 1.0
    
    // Use actual meal data from tracking
    var mealBreakdown: [(type: String, calories: Int, color: Color)] {
        var breakdown: [(type: String, calories: Int, color: Color)] = []
        
        // Only add meals that have calories logged
        if let breakfast = mealCalories["breakfast"], breakfast > 0 {
            breakdown.append(("Breakfast", breakfast, Color(hex: "FDA4AF")))
        }
        
        // Morning snack (between breakfast and lunch)
        if let morningSnack = mealCalories["morning snack"], morningSnack > 0 {
            breakdown.append(("Morning Snack", morningSnack, Color.orange))
        }
        
        if let lunch = mealCalories["lunch"], lunch > 0 {
            breakdown.append(("Lunch", lunch, Color.yellow))
        }
        
        // Afternoon snack (between lunch and dinner)
        if let afternoonSnack = mealCalories["afternoon snack"], afternoonSnack > 0 {
            breakdown.append(("Afternoon Snack", afternoonSnack, Color.orange))
        }
        
        if let dinner = mealCalories["dinner"], dinner > 0 {
            breakdown.append(("Dinner", dinner, Color.purple))
        }
        
        // Evening snack (after dinner)
        if let eveningSnack = mealCalories["evening snack"], eveningSnack > 0 {
            breakdown.append(("Evening Snack", eveningSnack, Color.orange))
        }
        
        // Regular snack (if not specified timing)
        if let snack = mealCalories["snack"], snack > 0 {
            breakdown.append(("Snack", snack, Color.orange))
        }
        
        // If no meals logged yet, return empty
        return breakdown
    }
    
    var progress: Double {
        min(Double(consumed) / Double(target), 1.0)
    }
    
    func angleForMeal(upTo index: Int) -> Double {
        var totalCalories: Double = 0
        for i in 0..<index {
            totalCalories += Double(mealBreakdown[i].calories)
        }
        // Calculate as percentage of TDEE, not target
        return (totalCalories / Double(tdee)) * 360
    }
    
    var body: some View {
        ZStack {
            // Background ring
            Circle()
                .stroke(Color.white.opacity(0.3), lineWidth: 12)
                .scaleEffect(0.65)
            
            // Meal segments with separators
            ForEach(Array(mealBreakdown.enumerated()), id: \.offset) { index, meal in
                let startAngle = index == 0 ? 0 : angleForMeal(upTo: index)
                let endAngle = angleForMeal(upTo: index + 1)
                let isSelected = selectedSegment == meal.type
                
                // Add a small gap for the separator (1 degree on each side)
                let gapSize: Double = 0.5
                let adjustedStart = startAngle + (index == 0 ? 0 : gapSize)
                let adjustedEnd = endAngle - gapSize
                
                Circle()
                    .trim(from: CGFloat(adjustedStart / 360), to: CGFloat(adjustedEnd / 360 * animateProgress))
                    .stroke(
                        meal.color.opacity(isSelected ? 1.0 : 0.9),
                        style: StrokeStyle(lineWidth: isSelected ? 14 : 12, lineCap: .butt)
                    )
                    .scaleEffect(isSelected ? 0.67 : 0.65)
                    .rotationEffect(.degrees(-90))
                    .animation(.easeInOut(duration: 0.2), value: isSelected)
                    .onTapGesture {
                        withAnimation {
                            selectedSegment = selectedSegment == meal.type ? nil : meal.type
                        }
                    }
            }
            
            // Deficit segment (shows the calories you're saving for weight loss)
            if deficit > 0 {
                // Calculate deficit as percentage of TDEE
                let deficitPercentage = Double(deficit) / Double(tdee)
                let deficitStart = 1.0 - deficitPercentage  // Start from the end minus deficit
                let deficitEnd = 1.0 // Goes to the end of the circle
                
                // Deficit segment with transparent stripes
                Circle()
                    .trim(from: CGFloat(deficitStart), to: CGFloat(deficitEnd))
                    .stroke(
                        selectedSegment == "Deficit" ? Color.red.opacity(0.9) : Color.red.opacity(0.6),
                        style: StrokeStyle(
                            lineWidth: 12,
                            lineCap: .butt,
                            dash: [4, 4]
                        )
                    )
                    .scaleEffect(selectedSegment == "Deficit" ? 0.67 : 0.65)
                    .rotationEffect(.degrees(-90))
                .animation(.easeInOut(duration: 0.2), value: selectedSegment == "Deficit")
                .onTapGesture {
                    withAnimation {
                        selectedSegment = selectedSegment == "Deficit" ? nil : "Deficit"
                    }
                }
            }
        }
    }
}

// MARK: - Loading Ring View
struct LoadingRingView: View {
    @State private var rotation: Double = 0
    
    var body: some View {
        ZStack {
            // Background ring
            Circle()
                .stroke(Color.white.opacity(0.1), lineWidth: 28)
            
            // Animated loading ring with gradient
            Circle()
                .trim(from: 0, to: 0.7)
                .stroke(
                    LinearGradient(
                        colors: [
                            Theme.sky.opacity(0.3),
                            Theme.emerald.opacity(0.5),
                            Theme.coral.opacity(0.3)
                        ],
                        startPoint: .leading,
                        endPoint: .trailing
                    ),
                    style: StrokeStyle(lineWidth: 28, lineCap: .round)
                )
                .rotationEffect(.degrees(rotation))
                .animation(.linear(duration: 1.5).repeatForever(autoreverses: false), value: rotation)
            
            // Inner ring
            Circle()
                .stroke(Color.white.opacity(0.05), lineWidth: 12)
                .scaleEffect(0.65)
            
            // Center loading text
            VStack(spacing: 4) {
                ProgressView()
                    .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    .scaleEffect(0.8)
                
                Text("Loading")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.6))
            }
        }
        .onAppear {
            rotation = 360
        }
    }
}



}
