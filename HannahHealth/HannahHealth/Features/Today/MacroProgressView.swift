//
//  MacroProgressView.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct MacroProgressView: View {
    let name: String
    let value: Double
    let target: Double
    let color: Color
    
    var progress: Double {
        target > 0 ? min(value / target, 1.0) : 0
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text(name)
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundColor(.primary.opacity(0.8))
                Spacer()
                Text("\(Int(value))g / \(Int(target))g")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            
            // Custom progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    // Background track
                    RoundedRectangle(cornerRadius: 4)
                        .fill(Color.gray.opacity(0.1))
                        .frame(height: 8)
                    
                    // Progress fill
                    RoundedRectangle(cornerRadius: 4)
                        .fill(
                            LinearGradient(
                                colors: [color, color.opacity(0.7)],
                                startPoint: .leading,
                                endPoint: .trailing
                            )
                        )
                        .frame(width: geometry.size.width * progress, height: 8)
                        .animation(.spring(response: 0.5), value: progress)
                }
            }
            .frame(height: 8)
        }
        .padding(12)
        .background(
            RoundedRectangle(cornerRadius: 12)
                .fill(Color.black.opacity(0.12))  // Black tint
                .overlay(
                    RoundedRectangle(cornerRadius: 12)
                        .strokeBorder(Color.black.opacity(0.2), lineWidth: 0.5)
                )
        )
    }
}