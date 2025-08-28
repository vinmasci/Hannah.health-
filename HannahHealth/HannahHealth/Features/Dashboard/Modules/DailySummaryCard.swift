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
                Text(currentPage == 0 ? "Calories" : "Macros")
                    .font(Theme.headline)
                    .foregroundColor(.white)
                    .fontWeight(.semibold)
                
                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.top, 16)
            .padding(.bottom, 8)
            
            // Swipeable content
            TabView(selection: $currentPage) {
                CaloriesView()
                    .environmentObject(viewModel)
                    .tag(0)
                
                MacrosView()
                    .tag(1)
            }
            .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
            .frame(height: 300)
            
            // Page indicator dots
            HStack(spacing: 8) {
                ForEach(0..<2) { index in
                    Circle()
                        .fill(currentPage == index ? Color.white : Color.white.opacity(0.3))
                        .frame(width: 8, height: 8)
                        .animation(.easeInOut, value: currentPage)
                }
            }
            .padding(.bottom, 16)
        }
        .glassCard()
    }
}