//
//  QuickStatsGrid.swift
//  HannahHealth
//
//  Extracted from DashboardView.swift to comply with 350 line limit
//

import SwiftUI

struct QuickStatsGrid: View {
    @EnvironmentObject var viewModel: DashboardViewModel
    @State private var showingActiveEnergyHelp = false
    
    var body: some View {
        LazyVGrid(columns: [
            GridItem(.flexible()),
            GridItem(.flexible())
        ], spacing: 12) {
            StatCard(
                icon: "figure.walk",
                title: "Steps",
                value: viewModel.stepsDisplayText,
                target: "",
                subtitle: viewModel.stepsDistanceText,
                progress: viewModel.stepsTDEEProgress,
                color: Theme.emerald
            )
            
            StatCard(
                icon: "flame.fill",
                title: "Active Energy",
                value: viewModel.caloriesDisplayText,
                target: "",  // No goal for Active Energy
                subtitle: viewModel.exerciseDetailsText,
                progress: viewModel.caloriesProgress,
                color: Theme.coral
            )
            .overlay(alignment: .topTrailing) {
                if viewModel.shouldShowActiveEnergyPrompt {
                    Button {
                        showingActiveEnergyHelp = true
                    } label: {
                        Image(systemName: "questionmark.circle.fill")
                            .foregroundColor(.yellow)
                            .font(.system(size: 20))
                    }
                    .offset(x: -8, y: 8)
                }
            }
        }
        .alert("Active Energy Not Recording", isPresented: $showingActiveEnergyHelp) {
            Button("Open Settings") {
                if let url = URL(string: UIApplication.openSettingsURLString) {
                    UIApplication.shared.open(url)
                }
            }
            Button("OK", role: .cancel) { }
        } message: {
            Text("You have \(viewModel.todaySteps) steps but no Active Energy recorded. This might mean Health tracking is disabled.\n\nTo enable: Settings > Privacy & Security > Motion & Fitness > Health")
        }
        .onReceive(viewModel.$shouldShowActiveEnergyPrompt) { shouldShow in
            if shouldShow && !showingActiveEnergyHelp {
                // Auto-show the alert once when detected
                DispatchQueue.main.asyncAfter(deadline: .now() + 2) {
                    showingActiveEnergyHelp = true
                }
            }
        }
    }
}

struct StatCard: View {
    let icon: String
    let title: String
    let value: String
    let target: String
    var subtitle: String? = nil
    let progress: Double
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(color)
                
                Text(title)
                    .font(.headline)
                    .foregroundColor(.white)
                    .fontWeight(.semibold)
                
                Spacer()
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(value)
                    .font(.headline)
                    .foregroundColor(.white)
                    .fontWeight(.semibold)
                
                if !target.isEmpty {
                    Text(target)
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                }
                
                if let subtitle = subtitle {
                    Text(subtitle)
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.7))
                }
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