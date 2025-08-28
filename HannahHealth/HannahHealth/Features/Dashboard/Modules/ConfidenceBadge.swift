//
//  ConfidenceBadge.swift
//  HannahHealth
//
//  Extracted from DashboardView.swift to comply with 350 line limit
//

import SwiftUI

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