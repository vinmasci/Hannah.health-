//
//  FoodActivityLogCard.swift
//  HannahHealth
//
//  Extracted from DashboardView.swift to comply with 350 line limit
//

import SwiftUI

struct FoodActivityLogCard: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Food & Activity Log")
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
            
            VStack(spacing: 8) {
                FoodItem(
                    name: "Greek Yogurt with Berries",
                    calories: "180 cal",
                    confidence: 0.92,
                    time: "8:30 AM"
                )
                
                FoodItem(
                    name: "Avocado Toast",
                    calories: "245 cal",
                    confidence: 0.78,
                    time: "12:15 PM"
                )
                
                FoodItem(
                    name: "Grilled Chicken Salad",
                    calories: "320 cal",
                    confidence: 0.85,
                    time: "6:45 PM"
                )
            }
        }
        .padding(20)
        .glassCard()
    }
}