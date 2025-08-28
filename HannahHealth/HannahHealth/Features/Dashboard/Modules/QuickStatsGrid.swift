//
//  QuickStatsGrid.swift
//  HannahHealth
//
//  Extracted from DashboardView.swift to comply with 350 line limit
//

import SwiftUI

struct QuickStatsGrid: View {
    @EnvironmentObject var viewModel: DashboardViewModel
    
    var body: some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible())
        ], spacing: 12) {
            StatCard(
                icon: "figure.walk",
                title: "Steps",
                value: viewModel.stepsDisplayText,
                target: viewModel.stepsTargetText,
                progress: viewModel.stepsProgress,
                color: Theme.emerald
            )
            
            StatCard(
                icon: "flame.fill",
                title: "Exercise",
                value: viewModel.caloriesDisplayText,
                target: viewModel.caloriesTargetText,
                progress: viewModel.caloriesProgress,
                color: Theme.coral
            )
        }
    }
}

struct StatCard: View {
    let icon: String
    let title: String
    let value: String
    let target: String
    let progress: Double
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(color)
                
                Spacer()
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.headline)
                    .foregroundColor(.white)
                    .fontWeight(.semibold)
                
                Text(target)
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
            }
            
            // Progress bar
            GeometryReader { geometry in
                ZStack(alignment: .leading) {
                    Rectangle()
                        .fill(Color.white.opacity(0.2))
                        .frame(height: 4)
                        .cornerRadius(2)
                    
                    Rectangle()
                        .fill(color)
                        .frame(width: geometry.size.width * progress, height: 4)
                        .cornerRadius(2)
                        .animation(.easeInOut(duration: 1.0), value: progress)
                }
            }
            .frame(height: 4)
        }
        .padding(16)
        .glassCard()
    }
}