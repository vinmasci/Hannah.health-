//
//  VortexSimpleBackground.swift
//  HannahHealth
//
//  Placeholder background - Vortex package removed
//

import SwiftUI

struct VortexSimpleBackground: View {
    var body: some View {
        // Simple animated gradient instead of Vortex particles
        ZStack {
            LinearGradient(
                colors: [
                    Color.indigo.opacity(0.2),
                    Color.cyan.opacity(0.1)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            
            // Simple animated circles for visual effect
            ForEach(0..<3, id: \.self) { index in
                Circle()
                    .fill(
                        RadialGradient(
                            colors: [
                                Color.white.opacity(0.1),
                                Color.clear
                            ],
                            center: .center,
                            startRadius: 50,
                            endRadius: 200
                        )
                    )
                    .frame(width: 300, height: 300)
                    .offset(
                        x: CGFloat(index - 1) * 100,
                        y: CGFloat(index - 1) * 50
                    )
                    .blur(radius: 20)
            }
        }
        .ignoresSafeArea()
    }
}

#Preview {
    VortexSimpleBackground()
}