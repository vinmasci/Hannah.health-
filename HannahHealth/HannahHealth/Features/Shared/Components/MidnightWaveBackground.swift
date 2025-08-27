//
//  MidnightWaveBackground.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct MidnightWaveBackground: View {
    @State private var animateWaves = false
    
    var body: some View {
        ZStack {
            // Base midnight gradient
            LinearGradient(
                gradient: Gradient(stops: [
                    .init(color: Color(hex: "0D1B2A"), location: 0.0),    // Deep midnight blue
                    .init(color: Color(hex: "1B263B"), location: 0.25),   // Dark blue
                    .init(color: Color(hex: "2E3E5F"), location: 0.5),    // Navy blue
                    .init(color: Color(hex: "3D3B67"), location: 0.75),   // Purple-blue
                    .init(color: Color(hex: "2C2348"), location: 1.0)     // Deep purple
                ]),
                startPoint: .top,
                endPoint: .bottom
            )
            
            // Wavy overlay layers for depth
            GeometryReader { geometry in
                ZStack {
                    // Back wave layer - deep blue with organic movement
                    MidnightWaveLayer(
                        color: Color(hex: "5B6C8C").opacity(0.15),  // Slate blue
                        amplitude: 55,
                        frequency: 0.8,
                        phase: animateWaves ? 0 : .pi * 2,
                        offset: geometry.size.height * 0.25
                    )
                    
                    // Middle wave layer - purple tint with different frequency
                    MidnightWaveLayer(
                        color: Color(hex: "6B5B95").opacity(0.12),  // Muted purple
                        amplitude: 45,
                        frequency: 1.3,
                        phase: animateWaves ? .pi : .pi * 3,
                        offset: geometry.size.height * 0.45
                    )
                    
                    // Front wave layer - moonlight with organic flow
                    MidnightWaveLayer(
                        color: Color(hex: "B8C5D6").opacity(0.08),  // Pale blue (moonlight)
                        amplitude: 35,
                        frequency: 1.9,
                        phase: animateWaves ? .pi * 0.5 : .pi * 2.5,
                        offset: geometry.size.height * 0.65
                    )
                    
                    // Extra subtle wave for more depth
                    MidnightWaveLayer(
                        color: Color(hex: "4A5568").opacity(0.05),  // Gray-blue
                        amplitude: 25,
                        frequency: 2.5,
                        phase: animateWaves ? .pi * 1.2 : .pi * 3.2,
                        offset: geometry.size.height * 0.8
                    )
                }
            }
            
            // Subtle stars/particles effect
            GeometryReader { geometry in
                ForEach(0..<20) { i in
                    Circle()
                        .fill(Color.white.opacity(Double.random(in: 0.3...0.7)))
                        .frame(width: CGFloat.random(in: 1...3))
                        .position(
                            x: CGFloat.random(in: 0...geometry.size.width),
                            y: CGFloat.random(in: 0...geometry.size.height * 0.6)
                        )
                        .opacity(animateWaves ? 0.6 : 0.2)
                        .animation(.easeInOut(duration: Double.random(in: 3...6)).repeatForever(autoreverses: true), value: animateWaves)
                }
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation(.linear(duration: 20).repeatForever(autoreverses: false)) {
                animateWaves.toggle()
            }
        }
    }
}

// Alternative deep midnight gradient
struct DeepMidnightBackground: View {
    var body: some View {
        ZStack {
            // Deep midnight colors
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 8/255, green: 12/255, blue: 30/255),      // Almost black blue
                    Color(red: 15/255, green: 20/255, blue: 45/255),     // Deep midnight
                    Color(red: 25/255, green: 28/255, blue: 65/255),     // Dark blue
                    Color(red: 35/255, green: 30/255, blue: 75/255),     // Purple midnight
                    Color(red: 20/255, green: 15/255, blue: 40/255)      // Deep purple
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            // Soft gradient overlay for depth
            RadialGradient(
                colors: [
                    Color(hex: "4A5568").opacity(0.1),  // Gray-blue glow
                    Color.clear
                ],
                center: .center,
                startRadius: 100,
                endRadius: 400
            )
        }
        .ignoresSafeArea()
    }
}

// Starry midnight with animated gradient
struct StarryMidnightBackground: View {
    @State private var animateGradient = false
    
    private var baseGradient: LinearGradient {
        LinearGradient(
            gradient: Gradient(colors: [
                Color(hex: "0F0C29"),  // Deep purple-black
                Color(hex: "302B63"),  // Midnight purple
                Color(hex: "24243E")   // Dark blue-gray
            ]),
            startPoint: animateGradient ? .topLeading : .top,
            endPoint: animateGradient ? .bottomTrailing : .bottom
        )
    }
    
    private var overlayGradient: LinearGradient {
        LinearGradient(
            gradient: Gradient(colors: [
                Color(hex: "00D2FF").opacity(0.05),  // Cyan hint
                Color(hex: "3A7BD5").opacity(0.08),  // Blue
                Color(hex: "9B59B6").opacity(0.05)   // Purple
            ]),
            startPoint: .topTrailing,
            endPoint: .bottomLeading
        )
    }
    
    var body: some View {
        ZStack {
            // Base gradient that shifts slightly
            baseGradient
            
            // Aurora-like overlay
            overlayGradient
                .blendMode(.screen)
            
            // Subtle animated waves
            StarryWaveOverlay()
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation(.easeInOut(duration: 8).repeatForever(autoreverses: true)) {
                animateGradient.toggle()
            }
        }
    }
}

// Separate view for the wave overlay
struct StarryWaveOverlay: View {
    var body: some View {
        GeometryReader { geometry in
            ForEach(0..<3) { i in
                WavePath(index: i, geometry: geometry)
                    .fill(
                        LinearGradient(
                            colors: [
                                Color.white.opacity(0.03),
                                Color.clear
                            ],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
            }
        }
    }
}

// Separate shape for wave path
struct WavePath: Shape {
    let index: Int
    let geometry: GeometryProxy
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let width = geometry.size.width
        let height = geometry.size.height
        let baseHeight = 0.6 + (Double(index) * 0.1)
        let waveHeight = height * CGFloat(baseHeight)
        
        path.move(to: CGPoint(x: 0, y: waveHeight))
        
        for x in stride(from: 0, to: width, by: 10) {
            let relativeX = x / width
            let phase = Double(index)
            let sineValue = sin(relativeX * .pi * 2 + phase)
            let y = waveHeight + CGFloat(sineValue * 20)
            path.addLine(to: CGPoint(x: x, y: y))
        }
        
        path.addLine(to: CGPoint(x: width, y: height))
        path.addLine(to: CGPoint(x: 0, y: height))
        path.closeSubpath()
        
        return path
    }
}

// Random organic wave layer
struct MidnightWaveLayer: View {
    let color: Color
    let amplitude: CGFloat
    let frequency: CGFloat
    var phase: CGFloat
    let offset: CGFloat
    
    var body: some View {
        GeometryReader { geometry in
            Path { path in
                let width = geometry.size.width
                let height = geometry.size.height
                
                path.move(to: CGPoint(x: 0, y: offset))
                
                // Create more organic waves with multiple sine waves combined
                for x in stride(from: 0, through: width, by: 1) {
                    let relativeX = x / width
                    
                    // Combine multiple sine waves for randomness
                    let wave1 = sin((relativeX * frequency + phase) * .pi * 2) * amplitude
                    let wave2 = sin((relativeX * frequency * 1.7 + phase * 0.5) * .pi * 3) * (amplitude * 0.3)
                    let wave3 = sin((relativeX * frequency * 2.3 + phase * 1.5) * .pi * 1.5) * (amplitude * 0.2)
                    
                    let y = offset + wave1 + wave2 + wave3
                    path.addLine(to: CGPoint(x: x, y: y))
                }
                
                path.addLine(to: CGPoint(x: width, y: height))
                path.addLine(to: CGPoint(x: 0, y: height))
                path.closeSubpath()
            }
            .fill(color)
        }
    }
}