//
//  DashboardHeader.swift
//  HannahHealth
//
//  Extracted from DashboardView.swift to comply with 350 line limit
//

import SwiftUI

struct DashboardHeader: View {
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Good morning")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
                
                Text("Welcome back")
                    .font(Theme.title)
                    .foregroundColor(.white)
                    .fontWeight(.bold)
            }
            
            Spacer()
            
            Button {
                // Profile action
            } label: {
                Circle()
                    .fill(Theme.glassMorphism)
                    .frame(width: 44, height: 44)
                    .overlay(
                        Image(systemName: "person.circle")
                            .font(.title2)
                            .foregroundColor(.white)
                    )
            }
        }
        .padding(.top, 8)
    }
}