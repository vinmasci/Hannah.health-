//
//  AdviceCard.swift
//  HannahHealth
//
//  Extracted from DashboardView.swift to comply with 350 line limit
//

import SwiftUI

struct AdviceCard: View {
    let title: String
    let description: String
    let icon: String
    let color: Color
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Image(systemName: icon)
                    .font(.title3)
                    .foregroundColor(color)
                
                Spacer()
            }
            
            Text(title)
                .font(.subheadline)
                .foregroundColor(.white)
                .fontWeight(.semibold)
            
            Text(description)
                .font(.caption)
                .foregroundColor(.white.opacity(0.8))
                .multilineTextAlignment(.leading)
        }
        .padding(16)
        .frame(width: 200, alignment: .leading)
        .background(Color.black.opacity(0.3))
        .cornerRadius(12)
    }
}