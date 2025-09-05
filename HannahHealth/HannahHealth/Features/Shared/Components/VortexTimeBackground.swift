//
//  VortexTimeBackground.swift
//  HannahHealth
//
//  Placeholder background - Vortex package removed
//

import SwiftUI

struct VortexTimeBackground: View {
    var body: some View {
        // Simple gradient background instead of Vortex particles
        LinearGradient(
            colors: [
                Color.blue.opacity(0.3),
                Color.purple.opacity(0.2)
            ],
            startPoint: .topLeading,
            endPoint: .bottomTrailing
        )
        .ignoresSafeArea()
    }
}

#Preview {
    VortexTimeBackground()
}