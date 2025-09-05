//
//  DonutChartComponents.swift
//  HannahHealth
//
//  Shared components for donut chart visualizations
//

import SwiftUI

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
        // Always return all segments, even with 0 values, to ensure rings render
        // Use max to ensure BMR always has at least 1 calorie to show something
        [
            Segment(id: "BMR", value: max(bmr, 1), color: Theme.sky),
            Segment(id: "Steps", value: steps, color: Theme.emerald),
            Segment(id: "Active Energy", value: exercise, color: Theme.coral),
            Segment(id: "Digestion", value: tef, color: Color(hex: "5EEAD4"))
        ]
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
                        print("🔵 TDEE segment tapped: \(segment.id)")
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
    let mealCalories: [String: Int]
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
                        print("🟢 Meal segment tapped: \(meal.type)")
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
    let mealCalories: [String: Int]
    
    var body: some View {
        Group {
            switch segment {
            case "BMR":
                VStack(spacing: 2) {
                    Text("\(bmr)")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("BMR")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                    Text("Base Metabolism")
                        .font(.system(size: 10))
                        .foregroundColor(.white.opacity(0.6))
                }
            case "Steps":
                VStack(spacing: 2) {
                    Text("\(steps)")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("\(stepCount) steps")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                    Text("Movement")
                        .font(.system(size: 10))
                        .foregroundColor(.white.opacity(0.6))
                }
            case "Exercise", "Active Energy":
                VStack(spacing: 2) {
                    Text("\(exercise)")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("Active Energy")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                    Text("All movement")
                        .font(.system(size: 10))
                        .foregroundColor(.white.opacity(0.6))
                }
            case "Digestion":
                VStack(spacing: 2) {
                    Text("\(tef)")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("TEF")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                    Text("Digestion")
                        .font(.system(size: 10))
                        .foregroundColor(.white.opacity(0.6))
                }
            case "Breakfast":
                VStack(spacing: 2) {
                    Text("\(mealCalories["breakfast"] ?? 0)")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("Breakfast")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                }
            case "Lunch":
                VStack(spacing: 2) {
                    Text("\(mealCalories["lunch"] ?? 0)")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("Lunch")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                }
            case "Dinner":
                VStack(spacing: 2) {
                    Text("\(mealCalories["dinner"] ?? 0)")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("Dinner")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                }
            case "Snack":
                VStack(spacing: 2) {
                    Text("\(mealCalories["snack"] ?? 0)")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(.white)
                    Text("Snacks")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                }
            case "Deficit":
                VStack(spacing: 2) {
                    Text("\(deficit)")
                        .font(.system(size: 24, weight: .bold, design: .rounded))
                        .foregroundColor(Theme.coral)
                    Text("Deficit")
                        .font(.system(size: 12, weight: .medium))
                        .foregroundColor(.white.opacity(0.8))
                    Text("Target gap")
                        .font(.system(size: 10))
                        .foregroundColor(.white.opacity(0.6))
                }
            default:
                Text(segment)
                    .font(.system(size: 20, weight: .bold))
                    .foregroundColor(.white)
            }
        }
    }
}

// MARK: - Combined Donut Chart
struct CombinedDonutChart: View {
    let bmr: Int
    let steps: Int
    let exercise: Int
    let tef: Int
    let neat: Int
    let consumed: Int
    let target: Int
    let deficit: Int
    let mealCalories: [String: Int]
    @Binding var selectedSegment: String?
    let progressStatus: ProgressStatus
    let animateProgress: Double
    
    private let outerRadius: CGFloat = 100
    private let innerRadius: CGFloat = 60
    private let spacing: CGFloat = 2
    
    // TDEE components with colors matching CaloriesView
    var tdeeSegments: [(id: String, value: Int, color: Color)] {
        return [
            ("BMR", bmr, Theme.sky),           // Sky blue for BMR
            ("Steps", steps, Theme.emerald),   // Emerald for steps
            ("Exercise", exercise, Theme.coral), // Coral for exercise
            ("Digestion", tef, Color(hex: "5EEAD4")) // Teal for TEF
        ].filter { $0.value > 0 }
    }
    
    var tdeeTotal: Int {
        bmr + steps + exercise + tef + neat
    }
    
    // Food/meal segments with colors matching CaloriesView
    var mealSegments: [(id: String, value: Int, color: Color)] {
        return [
            ("Breakfast", mealCalories["breakfast"] ?? 0, Color(hex: "FDA4AF")), // Pink
            ("Lunch", mealCalories["lunch"] ?? 0, Color.yellow),                // Yellow
            ("Dinner", mealCalories["dinner"] ?? 0, Color.purple),              // Purple
            ("Snack", mealCalories["snack"] ?? 0, Color.orange)                 // Orange
        ].filter { $0.value > 0 }
    }
    
    var body: some View {
        ZStack {
            // Outer ring - TDEE components
            ForEach(Array(tdeeSegments.enumerated()), id: \.element.id) { index, segment in
                let startAngle = angleForSegment(at: index, in: tdeeSegments, total: tdeeTotal)
                let endAngle = angleForSegment(at: index + 1, in: tdeeSegments, total: tdeeTotal)
                
                RingSegment(
                    startAngle: startAngle,
                    endAngle: endAngle - Angle(degrees: spacing),
                    innerRadius: innerRadius + 15,
                    outerRadius: outerRadius
                )
                .fill(segment.color.opacity(selectedSegment == nil || selectedSegment == segment.id ? 1.0 : 0.3))
                .onTapGesture {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        selectedSegment = selectedSegment == segment.id ? nil : segment.id
                    }
                }
                .scaleEffect(selectedSegment == segment.id ? 1.05 : 1.0)
                .animation(.easeInOut(duration: 0.2), value: selectedSegment)
            }
            
            // Inner ring - Meal breakdown (if food consumed)
            if consumed > 0 {
                ForEach(Array(mealSegments.enumerated()), id: \.element.id) { index, segment in
                    let startAngle = angleForSegment(at: index, in: mealSegments, total: consumed)
                    let endAngle = angleForSegment(at: index + 1, in: mealSegments, total: consumed)
                    
                    RingSegment(
                        startAngle: startAngle,
                        endAngle: endAngle - Angle(degrees: spacing),
                        innerRadius: innerRadius - 15,
                        outerRadius: innerRadius + 10
                    )
                    .fill(segment.color.opacity(selectedSegment == nil || selectedSegment == segment.id ? 0.9 : 0.3))
                    .onTapGesture {
                        withAnimation(.easeInOut(duration: 0.3)) {
                            selectedSegment = selectedSegment == segment.id ? nil : segment.id
                        }
                    }
                    .scaleEffect(selectedSegment == segment.id ? 1.05 : 1.0)
                    .animation(.easeInOut(duration: 0.2), value: selectedSegment)
                }
            }
            
            // Deficit segment (if in deficit)
            if deficit > 0 && consumed < target {
                let deficitAngle = Angle(degrees: Double(deficit) / Double(tdeeTotal) * 360)
                let startAngle = Angle(degrees: -90) + Angle(degrees: Double(consumed) / Double(tdeeTotal) * 360)
                
                RingSegment(
                    startAngle: startAngle,
                    endAngle: startAngle + deficitAngle - Angle(degrees: spacing),
                    innerRadius: innerRadius - 15,
                    outerRadius: innerRadius + 10
                )
                .fill(Color.red.opacity(selectedSegment == nil || selectedSegment == "deficit" ? 0.3 : 0.15))
                .onTapGesture {
                    withAnimation(.easeInOut(duration: 0.3)) {
                        selectedSegment = selectedSegment == "deficit" ? nil : "deficit"
                    }
                }
            }
        }
        .rotationEffect(animateProgress > 0 ? .degrees(0) : .degrees(-90))
        .animation(.easeOut(duration: 1.0), value: animateProgress)
    }
    
    private func angleForSegment(at index: Int, in segments: [(id: String, value: Int, color: Color)], total: Int) -> Angle {
        guard total > 0 else { return Angle(degrees: -90) }
        
        let percentages = segments.map { Double($0.value) / Double(total) }
        let cumulativePercentage = percentages.prefix(index).reduce(0, +)
        
        return Angle(degrees: -90 + cumulativePercentage * 360)
    }
}

// MARK: - Ring Segment Shape
struct RingSegment: Shape {
    let startAngle: Angle
    let endAngle: Angle
    let innerRadius: CGFloat
    let outerRadius: CGFloat
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let center = CGPoint(x: rect.midX, y: rect.midY)
        
        path.addArc(center: center,
                   radius: outerRadius,
                   startAngle: startAngle,
                   endAngle: endAngle,
                   clockwise: false)
        
        path.addArc(center: center,
                   radius: innerRadius,
                   startAngle: endAngle,
                   endAngle: startAngle,
                   clockwise: true)
        
        path.closeSubpath()
        
        return path
    }
}

// MARK: - Progress Status
enum ProgressStatus {
    case ahead       // Ahead of schedule
    case onTrack     // On track for goals
    case behind      // Behind schedule
    case warning     // Close to limit
    case over        // Over budget
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