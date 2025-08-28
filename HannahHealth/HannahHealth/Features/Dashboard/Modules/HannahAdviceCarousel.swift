//
//  HannahAdviceCarousel.swift
//  HannahHealth
//
//  Extracted from DashboardView.swift to comply with 350 line limit
//

import SwiftUI

struct HannahAdviceCarousel: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Hannah's Daily Advice")
                    .font(Theme.headline)
                    .foregroundColor(.white)
                    .fontWeight(.semibold)
                
                Spacer()
                
                Button("View All") {
                    // View all action
                }
                .font(.caption)
                .foregroundColor(Theme.sky)
            }
            
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 12) {
                    AdviceCard(
                        title: "Great protein intake!",
                        description: "You're hitting your protein goals perfectly. Keep it up!",
                        icon: "checkmark.circle.fill",
                        color: Theme.emerald
                    )
                    
                    AdviceCard(
                        title: "Try more vegetables",
                        description: "Add some leafy greens to your next meal for extra nutrients.",
                        icon: "leaf.fill",
                        color: Theme.mint
                    )
                    
                    AdviceCard(
                        title: "Stay hydrated",
                        description: "You're close to your water goal. Just 2 more cups!",
                        icon: "drop.fill",
                        color: Theme.sky
                    )
                }
            }
        }
        .padding(20)
        .glassCard()
    }
}