//
//  CaloriesSegmentDetails.swift
//  HannahHealth
//
//  Segment selection and detail display components for calories views
//

import SwiftUI

// SelectedSegmentDetail removed - using the one from DonutChartComponents.swift instead

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
            Group {
                switch segment {
                case "BMR":
                    BMRInfoBar(bmr: bmr)
                case "Steps":
                    StepsInfoBar(stepCount: stepCount, steps: steps)
                case "Exercise", "Active Energy":
                    ExerciseInfoBar(exerciseMinutes: exerciseMinutes, exercise: exercise)
                case "Digestion":
                    TEFInfoBar(tef: tef)
                case "Deficit":
                    DeficitInfoBar(deficit: deficit)
                case "Breakfast":
                    MealInfoBar(mealName: "Breakfast", calories: mealCalories["breakfast"] ?? 0, 
                              icon: "sunrise", color: Color(hex: "FDA4AF"))
                case "Lunch":
                    MealInfoBar(mealName: "Lunch", calories: mealCalories["lunch"] ?? 0,
                              icon: "sun.max", color: Color.yellow)
                case "Dinner":
                    MealInfoBar(mealName: "Dinner", calories: mealCalories["dinner"] ?? 0,
                              icon: "sunset", color: Color.purple)
                case "Snack":
                    MealInfoBar(mealName: "Snacks", calories: mealCalories["snack"] ?? 0,
                              icon: "carrot", color: Color.orange)
                case "Morning Snack":
                    MealInfoBar(mealName: "Morning Snack", calories: mealCalories["morning snack"] ?? 0,
                              icon: "sun.min", color: Color.orange)
                case "Afternoon Snack":
                    MealInfoBar(mealName: "Afternoon Snack", calories: mealCalories["afternoon snack"] ?? 0,
                              icon: "sun.haze", color: Color.orange)
                case "Evening Snack":
                    MealInfoBar(mealName: "Evening Snack", calories: mealCalories["evening snack"] ?? 0,
                              icon: "moon.stars", color: Color.orange)
                default:
                    EmptyView()
                }
            }
        }
        .padding(.horizontal, 12)
        .padding(.vertical, 8)
        .background(Rectangle().fill(Color.white.opacity(0.05)))
    }
}

// MARK: - Individual Segment Views
private struct BMRSegmentView: View {
    let bmr: Int
    
    var body: some View {
        Text("BMR")
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(.white.opacity(0.8))
        Text("\(bmr)")
            .font(.system(size: 28, weight: .bold, design: .rounded))
            .foregroundColor(Theme.sky)
        Text("base cal")
            .font(.caption2)
            .foregroundColor(.white.opacity(0.6))
    }
}

private struct StepsSegmentView: View {
    let steps: Int
    let stepCount: Int
    
    var body: some View {
        Text("\(steps)")
            .font(.system(size: 28, weight: .bold, design: .rounded))
            .foregroundColor(Theme.emerald)
        Text("cal burned")
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(.white.opacity(0.8))
        Text("\(stepCount) steps")
            .font(.caption2)
            .foregroundColor(.white.opacity(0.6))
    }
}

private struct ExerciseSegmentView: View {
    let exercise: Int
    
    var body: some View {
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
    }
}

private struct TEFSegmentView: View {
    let tef: Int
    
    var body: some View {
        Text("TEF")
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(.white.opacity(0.8))
        Text("\(tef)")
            .font(.system(size: 28, weight: .bold, design: .rounded))
            .foregroundColor(Color(hex: "5EEAD4"))
        Text("digestion")
            .font(.caption2)
            .foregroundColor(.white.opacity(0.6))
    }
}

private struct MealSegmentView: View {
    let calories: Int
    let mealName: String
    let color: Color
    
    var body: some View {
        Text("\(calories)")
            .font(.system(size: 28, weight: .bold, design: .rounded))
            .foregroundColor(color)
        Text(mealName)
            .font(.system(size: 14, weight: .medium))
            .foregroundColor(.white.opacity(0.8))
        Text("calories")
            .font(.caption2)
            .foregroundColor(.white.opacity(0.6))
    }
}

// MARK: - Info Bar Components
private struct BMRInfoBar: View {
    let bmr: Int
    
    var body: some View {
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
    }
}

private struct StepsInfoBar: View {
    let stepCount: Int
    let steps: Int
    
    var body: some View {
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
    }
}

private struct ExerciseInfoBar: View {
    let exerciseMinutes: Int
    let exercise: Int
    
    var body: some View {
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
    }
}

private struct TEFInfoBar: View {
    let tef: Int
    
    var body: some View {
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
    }
}

private struct DeficitInfoBar: View {
    let deficit: Int
    
    var body: some View {
        HStack {
            Image(systemName: "arrow.down.circle.fill")
                .foregroundColor(Color.red)
            Text("Daily Deficit for Weight Loss")
                .font(.caption)
                .foregroundColor(.white.opacity(0.8))
            Spacer()
            Text("\(deficit) cal/day")
                .font(.caption.bold())
                .foregroundColor(Color.red)
        }
    }
}

private struct MealInfoBar: View {
    let mealName: String
    let calories: Int
    let icon: String
    let color: Color
    
    var body: some View {
        HStack {
            Image(systemName: icon)
                .foregroundColor(color)
            Text(mealName)
                .font(.caption)
                .foregroundColor(.white.opacity(0.8))
            Spacer()
            Text("\(calories) calories logged")
                .font(.caption.bold())
                .foregroundColor(color)
        }
    }
}