//
//  DeficitCard.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct DeficitCard: View {
    let deficit: Int
    @State private var animateValue = false
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text(deficit < 0 ? "Deficit" : "Surplus")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text("Great progress!")
                    .font(.system(size: 11))
                    .foregroundColor(.secondary)
            }
            Spacer()
            
            HStack(spacing: 4) {
                Image(systemName: deficit < 0 ? "arrow.down.circle.fill" : "arrow.up.circle.fill")
                    .foregroundColor(deficit < 0 ? Theme.emerald400 : Theme.red400)
                    .rotationEffect(.degrees(animateValue ? 0 : -90))
                    .animation(.spring(response: 0.5), value: animateValue)
                
                Text("\(deficit > 0 ? "+" : "")\(deficit)")
                    .font(.system(size: 28, weight: .bold, design: .rounded))
                    .foregroundColor(deficit < 0 ? Theme.emerald400 : Theme.red400)
                    .scaleEffect(animateValue ? 1 : 0.8)
                    .animation(.spring(response: 0.4, dampingFraction: 0.6), value: animateValue)
                
                Text("cal")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
        }
        .padding()
        .background(
            RoundedRectangle(cornerRadius: 16)
                .fill(Color.black.opacity(0.12))  // Black tint
                .overlay(
                    RoundedRectangle(cornerRadius: 16)
                        .strokeBorder(Color.black.opacity(0.2), lineWidth: 0.5)
                )
        )
        .onAppear {
            withAnimation(.easeOut(duration: 0.5)) {
                animateValue = true
            }
        }
    }
}