//
//  SimpleMovingParticles.swift
//  HannahHealth
//
//  Simple moving particles that actually work!
//

import SwiftUI

struct SimpleMovingParticle: View {
    @State private var moveToEnd = false
    @State private var isPulsing = false
    
    let color: Color
    let size: CGFloat = CGFloat.random(in: 2...5)
    let startX: CGFloat
    let startY: CGFloat
    let endX: CGFloat
    let endY: CGFloat
    let duration: Double = Double.random(in: 8...15)  // Faster movement (was 20-40)
    
    init(color: Color, in geometry: GeometryProxy) {
        self.color = color
        
        // Random start position
        self.startX = CGFloat.random(in: 0...geometry.size.width)
        self.startY = CGFloat.random(in: 0...geometry.size.height * 0.7)
        
        // Random end position (different from start)
        self.endX = CGFloat.random(in: 0...geometry.size.width)
        self.endY = CGFloat.random(in: 0...geometry.size.height * 0.7)
    }
    
    var body: some View {
        Circle()
            .fill(color)
            .frame(width: size, height: size)
            .scaleEffect(isPulsing ? 1.3 : 0.8)  // Pulsing effect
            .opacity(isPulsing ? 0.9 : 0.4)      // Opacity pulse
            .position(x: moveToEnd ? endX : startX, y: moveToEnd ? endY : startY)
            .onAppear {
                // Movement animation
                withAnimation(
                    Animation.linear(duration: duration)
                        .repeatForever(autoreverses: true)
                ) {
                    moveToEnd = true
                }
                
                // Pulsing animation (faster, more noticeable)
                withAnimation(
                    Animation.easeInOut(duration: Double.random(in: 1.5...3))
                        .repeatForever(autoreverses: true)
                ) {
                    isPulsing = true
                }
            }
    }
}

struct SimpleMovingParticlesView: View {
    let particleColor: Color
    
    var body: some View {
        GeometryReader { geometry in
            ForEach(0..<15, id: \.self) { _ in
                SimpleMovingParticle(color: particleColor, in: geometry)
            }
        }
    }
}