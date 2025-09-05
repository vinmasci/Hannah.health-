//
//  MealPlanHeader.swift
//  HannahHealth
//
//  Header component for meal planning view
//

import SwiftUI

struct MealPlanHeader: View {
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("This Week")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
                
                Spacer()
                
                Button(action: { /* Week selector */ }) {
                    Image(systemName: "calendar")
                        .foregroundColor(.white.opacity(0.7))
                }
            }
            .padding(.horizontal, 4)
            
            Text("Tap meals to select, then swipe left to discuss with Hannah what you would like to add to your meal plan")
                .font(.system(size: 14))
                .foregroundColor(.white.opacity(0.5))
                .padding(.horizontal, 4)
                .padding(.bottom, 8)
        }
    }
}