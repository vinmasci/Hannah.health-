//
//  VortexSimpleBackground.swift
//  HannahHealth
//
//  Simplified Vortex particle background
//

import SwiftUI
// Uncomment after adding Vortex package
// import Vortex

struct VortexSimpleBackground: View {
    var body: some View {
        ZStack {
            // For now, use your existing background
            DynamicTimeBackground()
            
            // After adding Vortex package, replace with:
            /*
            VortexView(
                VortexSystem(
                    tags: ["particle"],
                    shape: .box(width: 400, height: 800),
                    birthRate: 20,
                    lifespan: 3...6,
                    speed: 0.02...0.05,
                    angleRange: Angle.degrees(0)...Angle.degrees(360),
                    size: 0.5...1.0
                )
            ) {
                Circle()
                    .fill(.white)
                    .frame(width: 4, height: 4)
                    .blur(radius: 1)
                    .opacity(0.6)
                    .tag("particle")
            }
            */
        }
        .ignoresSafeArea()
    }
}