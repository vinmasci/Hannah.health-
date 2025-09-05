//
//  DailySummaryCard.swift
//  HannahHealth
//
//  Extracted from DashboardView.swift to comply with 350 line limit
//

import SwiftUI

struct DailySummaryCard: View {
    @EnvironmentObject var viewModel: DashboardViewModel
    @State private var currentPage = 0
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text(currentPage == 0 ? "Dynamic Calorie Tracker" : "Macros")
                        .font(Theme.headline)
                        .foregroundColor(.white)
                        .fontWeight(.semibold)
                    
                    if currentPage == 0 {
                        Text("Grow the outer ring (your TDEE) with exercise, fill the inner ring with nutrition until you hit your target.")
                            .font(.caption)
                            .foregroundColor(.white.opacity(0.7))
                            .lineLimit(2)
                            .fixedSize(horizontal: false, vertical: true)
                    }
                }
                
                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.top, 8)
            .padding(.bottom, 2)
            
            // Swipeable content
            TabView(selection: $currentPage) {
                CaloriesView()
                    .environmentObject(viewModel)
                    .tag(0)
                
                MacrosView()
                    .tag(1)
            }
            .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
            .frame(minHeight: 340, maxHeight: 400)
            // Force TabView to update when data changes
            .id("\(viewModel.caloriesConsumed)-\(viewModel.basalMetabolicRate)")
            
            // Page indicator dots
            HStack(spacing: 8) {
                ForEach(0..<2) { index in
                    Circle()
                        .fill(currentPage == index ? Color.white : Color.white.opacity(0.3))
                        .frame(width: 8, height: 8)
                        .animation(.easeInOut, value: currentPage)
                }
            }
            .padding(.bottom, 4)
        }
        .glassCard()
    }
}