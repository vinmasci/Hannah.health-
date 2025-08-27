//
//  SunsetWaveBackground.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct SunsetWaveBackground: View {
    @State private var animateWaves = false
    
    var body: some View {
        ZStack {
            // Base sunset gradient
            LinearGradient(
                gradient: Gradient(stops: [
                    .init(color: Color(hex: "FF6B6B"), location: 0.0),    // Coral red
                    .init(color: Color(hex: "FF8E53"), location: 0.25),   // Orange
                    .init(color: Color(hex: "FE6B8B"), location: 0.5),    // Pink
                    .init(color: Color(hex: "7C4DFF"), location: 0.75),   // Purple
                    .init(color: Color(hex: "3F51B5"), location: 1.0)     // Deep blue
                ]),
                startPoint: .top,
                endPoint: .bottom
            )
            
            // Wavy overlay layers for depth
            GeometryReader { geometry in
                ZStack {
                    // Back wave layer
                    SunsetWaveLayer(
                        color: Color(hex: "FFB74D").opacity(0.3),  // Amber
                        amplitude: 50,
                        frequency: 1.2,
                        phase: animateWaves ? 0 : .pi * 2,
                        offset: geometry.size.height * 0.3
                    )
                    
                    // Middle wave layer
                    SunsetWaveLayer(
                        color: Color(hex: "FF7043").opacity(0.25),  // Deep orange
                        amplitude: 40,
                        frequency: 1.5,
                        phase: animateWaves ? .pi : .pi * 3,
                        offset: geometry.size.height * 0.5
                    )
                    
                    // Front wave layer
                    SunsetWaveLayer(
                        color: Color(hex: "9C27B0").opacity(0.2),  // Purple
                        amplitude: 30,
                        frequency: 1.8,
                        phase: animateWaves ? .pi * 0.5 : .pi * 2.5,
                        offset: geometry.size.height * 0.7
                    )
                }
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation(.linear(duration: 15).repeatForever(autoreverses: false)) {
                animateWaves.toggle()
            }
        }
    }
}

struct SunsetWaveLayer: View {
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
                
                for x in stride(from: 0, through: width, by: 1) {
                    let relativeX = x / width
                    let wavelength = width / frequency
                    let y = offset + amplitude * sin((relativeX * frequency + phase) * .pi * 2)
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

// Alternative warm sunset gradient
struct WarmSunsetBackground: View {
    var body: some View {
        ZStack {
            // Warm sunset colors
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(red: 255/255, green: 94/255, blue: 77/255),    // Coral
                    Color(red: 255/255, green: 154/255, blue: 0/255),    // Orange
                    Color(red: 237/255, green: 117/255, blue: 127/255),  // Pink
                    Color(red: 95/255, green: 39/255, blue: 205/255),    // Purple
                    Color(red: 30/255, green: 20/255, blue: 80/255)      // Dark purple
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            // Soft overlay for depth
            RadialGradient(
                colors: [
                    Color.white.opacity(0.2),
                    Color.clear
                ],
                center: .top,
                startRadius: 100,
                endRadius: 400
            )
        }
        .ignoresSafeArea()
    }
}

// Dreamy sunset with mesh gradient effect (iOS 18+)
struct DreamySunsetBackground: View {
    @State private var animateColors = false
    
    var body: some View {
        ZStack {
            // Base gradient
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(hex: "FA709A"),  // Pink
                    Color(hex: "FEE140")   // Yellow
                ]),
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            
            // Overlay gradient for complexity
            LinearGradient(
                gradient: Gradient(colors: [
                    Color(hex: "F093FB").opacity(0.5),  // Purple
                    Color(hex: "F5576C").opacity(0.5)   // Red
                ]),
                startPoint: .topTrailing,
                endPoint: .bottomLeading
            )
            .blendMode(.multiply)
            
            // Subtle animated waves
            GeometryReader { geometry in
                ForEach(0..<3) { i in
                    Path { path in
                        let width = geometry.size.width
                        let height = geometry.size.height
                        let waveHeight = height * CGFloat(0.6 + Double(i) * 0.1)
                        
                        path.move(to: CGPoint(x: 0, y: waveHeight))
                        
                        for x in stride(from: 0, to: width, by: 10) {
                            let relativeX = x / width
                            let y = waveHeight + sin(relativeX * .pi * 3) * 20
                            path.addLine(to: CGPoint(x: x, y: y))
                        }
                        
                        path.addLine(to: CGPoint(x: width, y: height))
                        path.addLine(to: CGPoint(x: 0, y: height))
                        path.closeSubpath()
                    }
                    .fill(
                        LinearGradient(
                            colors: [
                                Color.white.opacity(0.1),
                                Color.clear
                            ],
                            startPoint: .top,
                            endPoint: .bottom
                        )
                    )
                }
            }
        }
        .ignoresSafeArea()
    }
}