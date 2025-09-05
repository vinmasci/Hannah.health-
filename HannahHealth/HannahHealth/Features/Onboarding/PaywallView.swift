//
//  PaywallView.swift
//  HannahHealth
//
//  Created on 28/8/2025.
//  Shown when trial expires or subscription needed
//

import SwiftUI

struct PaywallView: View {
    @EnvironmentObject var authManager: AuthManager
    
    var body: some View {
        ZStack {
            // Background
            LinearGradient(
                colors: [
                    Color(hex: "1a1a2e"),
                    Color(hex: "0f0f1e")
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 30) {
                // Header
                VStack(spacing: 12) {
                    Image(systemName: "crown.fill")
                        .font(.system(size: 60))
                        .foregroundColor(Theme.gold)
                    
                    Text("Your Trial Has Ended")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .foregroundColor(.white)
                    
                    Text("Continue your health journey with Hannah")
                        .font(.body)
                        .foregroundColor(.white.opacity(0.8))
                }
                .padding(.top, 60)
                
                // Features
                VStack(alignment: .leading, spacing: 16) {
                    FeatureRow(icon: "brain", text: "AI-powered meal tracking")
                    FeatureRow(icon: "message.fill", text: "SMS food logging")
                    FeatureRow(icon: "chart.line.uptrend.xyaxis", text: "Progress insights")
                    FeatureRow(icon: "fork.knife", text: "Personalized meal plans")
                }
                .padding(.horizontal, 40)
                .padding(.vertical, 30)
                
                // Pricing
                VStack(spacing: 16) {
                    // Monthly
                    PricingOption(
                        title: "Monthly",
                        price: "$11.99",
                        period: "per month",
                        isSelected: true,
                        action: {
                            // Handle monthly subscription
                        }
                    )
                    
                    // Yearly
                    PricingOption(
                        title: "Yearly",
                        price: "$71.99",
                        period: "per year (save 50%)",
                        isSelected: false,
                        action: {
                            // Handle yearly subscription
                        }
                    )
                }
                .padding(.horizontal)
                
                Spacer()
                
                // Sign out option
                Button(action: {
                    Task {
                        try? await authManager.signOut()
                    }
                }) {
                    Text("Sign Out")
                        .font(.footnote)
                        .foregroundColor(.white.opacity(0.6))
                }
                .padding(.bottom, 30)
            }
        }
    }
}

struct FeatureRow: View {
    let icon: String
    let text: String
    
    var body: some View {
        HStack(spacing: 12) {
            Image(systemName: icon)
                .foregroundColor(Theme.emerald)
                .frame(width: 24)
            
            Text(text)
                .foregroundColor(.white)
                .font(.body)
        }
    }
}

struct PricingOption: View {
    let title: String
    let price: String
    let period: String
    let isSelected: Bool
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 8) {
                Text(title)
                    .font(.headline)
                    .foregroundColor(isSelected ? Color(hex: "1a1a2e") : .white)
                
                Text(price)
                    .font(.title2)
                    .fontWeight(.bold)
                    .foregroundColor(isSelected ? Color(hex: "1a1a2e") : .white)
                
                Text(period)
                    .font(.caption)
                    .foregroundColor(isSelected ? Color(hex: "1a1a2e").opacity(0.8) : .white.opacity(0.8))
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(isSelected ? Theme.emerald : Color.white.opacity(0.1))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? Color.clear : Color.white.opacity(0.2), lineWidth: 1)
            )
        }
    }
}

#Preview {
    PaywallView()
        .environmentObject(AuthManager.shared)
}