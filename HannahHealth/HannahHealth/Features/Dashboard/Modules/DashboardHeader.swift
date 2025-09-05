//
//  DashboardHeader.swift
//  HannahHealth
//
//  Extracted from DashboardView.swift to comply with 350 line limit
//

import SwiftUI

struct DashboardHeader: View {
    @Binding var showProfile: Bool
    
    private var greeting: String {
        let hour = Calendar.current.component(.hour, from: Date())
        let userName = AuthManager.shared.userProfile?.fullName ?? "Vince"
        let baseGreeting: String
        
        switch hour {
        case 0..<12:
            baseGreeting = "Good morning"
        case 12..<17:
            baseGreeting = "Good afternoon"
        case 17..<21:
            baseGreeting = "Good evening"
        default:
            baseGreeting = "Good evening"
        }
        
        return "\(baseGreeting), \(userName)"
    }
    
    var body: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Hannah.app v1.0.0")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
                
                Text(greeting)
                    .font(.system(size: 26, weight: .bold, design: .rounded))
                    .foregroundColor(.white)
            }
            
            Spacer()
            
            Button {
                showProfile = true
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