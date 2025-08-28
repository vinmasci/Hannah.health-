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