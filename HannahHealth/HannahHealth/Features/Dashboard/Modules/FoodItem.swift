//
//  FoodItem.swift
//  HannahHealth
//
//  Extracted from DashboardView.swift to comply with 350 line limit
//

import SwiftUI

struct FoodItem: View {
    let name: String
    let calories: String
    let confidence: Double
    let time: String
    let mealType: String?
    var isExercise: Bool = false
    var showIcon: Bool = true
    
    private var mealIcon: (icon: String, color: Color) {
        let meal = mealType?.lowercased() ?? ""
        
        // Check if it's any type of snack
        if meal.contains("snack") {
            return ("carrot", Color.orange)
        }
        
        switch meal {
        case "breakfast":
            return ("sunrise", Theme.sky)
        case "lunch":
            return ("sun.max", Color.yellow)
        case "dinner":
            return ("sunset", Color.purple)
        case "exercise":
            return ("figure.run", Theme.coral)
        default:
            return ("fork.knife", Theme.sky)
        }
    }
    
    var body: some View {
        HStack(spacing: 12) {
            if showIcon {
                Circle()
                    .fill(mealIcon.color.opacity(0.2))
                    .frame(width: 40, height: 40)
                    .overlay(
                        Image(systemName: mealIcon.icon)
                            .font(.system(size: 16))
                            .foregroundColor(mealIcon.color)
                    )
            } else {
                // Empty spacer to maintain alignment when icon is hidden
                Color.clear
                    .frame(width: 40, height: 40)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(name)
                    .font(.subheadline)
                    .foregroundColor(.white)
                    .fontWeight(.medium)
                
                Text(calories)
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
            }
            
            Spacer()
            
            Text(time)
                .font(.caption)
                .foregroundColor(.white.opacity(0.6))
        }
    }
}