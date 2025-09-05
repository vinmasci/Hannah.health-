//
//  SplashView.swift
//  HannahHealth
//
//  Created on 28/8/2025.
//  Loading screen shown while checking auth status
//

import SwiftUI

struct SplashView: View {
    @State private var scale: CGFloat = 0.8
    @State private var opacity: Double = 0
    
    var body: some View {
        ZStack {
            // Background gradient
            LinearGradient(
                colors: [
                    Color(hex: "1a1a2e"),
                    Color(hex: "0f0f1e")
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            VStack(spacing: 20) {
                // Logo or App Icon
                Image(systemName: "heart.fill")
                    .font(.system(size: 80))
                    .foregroundColor(Theme.emerald)
                    .scaleEffect(scale)
                
                Text("Hannah Health")
                    .font(.largeTitle)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .opacity(opacity)
                
                Text("Loading...")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
                    .opacity(opacity)
            }
        }
        .onAppear {
            withAnimation(.easeOut(duration: 0.6)) {
                scale = 1.0
                opacity = 1.0
            }
        }
    }
}

#Preview {
    SplashView()
}