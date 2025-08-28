//
//  MacrosView.swift
//  HannahHealth
//
//  Extracted from DashboardView.swift to comply with 350 line limit
//

import SwiftUI

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