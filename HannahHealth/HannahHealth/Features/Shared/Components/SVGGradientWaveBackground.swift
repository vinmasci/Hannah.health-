//
//  SVGGradientWaveBackground.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct SVGGradientWaveBackground: View {
    @State private var animateWaves = false
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Base gradient background (like the CodePen)
                LinearGradient(
                    stops: [
                        .init(color: Color(hex: "667eea"), location: 0.0),  // Purple
                        .init(color: Color(hex: "764ba2"), location: 1.0)   // Pink-purple
                    ],
                    startPoint: .topLeading,
                    endPoint: .bottomTrailing
                )
                
                // SVG Wave layers (exactly like CodePen)
                VStack {
                    Spacer()
                    
                    // The CodePen has 3-4 wave layers with different colors
                    ZStack(alignment: .bottom) {
                        // Wave 1 - Back layer (darker)
                        SVGWaveShape(
                            phase: animateWaves ? 0 : .pi * 2,
                            amplitude: 50,
                            frequency: 1.5
                        )
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color(hex: "f093fb").opacity(0.7),  // Pink
                                    Color(hex: "f5576c").opacity(0.7)   // Red-pink
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(height: 300)
                        .offset(y: 20)
                        
                        // Wave 2 - Middle layer
                        SVGWaveShape(
                            phase: animateWaves ? .pi * 0.5 : .pi * 2.5,
                            amplitude: 40,
                            frequency: 1.8
                        )
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color(hex: "fa709a").opacity(0.6),  // Pink
                                    Color(hex: "fee140").opacity(0.6)   // Yellow
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(height: 280)
                        .offset(y: 40)
                        
                        // Wave 3 - Front layer (lightest)
                        SVGWaveShape(
                            phase: animateWaves ? .pi : .pi * 3,
                            amplitude: 30,
                            frequency: 2.2
                        )
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color(hex: "30cfd0").opacity(0.5),  // Cyan
                                    Color(hex: "330867").opacity(0.5)   // Deep purple
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(height: 250)
                        .offset(y: 60)
                    }
                }
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation(.linear(duration: 10).repeatForever(autoreverses: false)) {
                animateWaves.toggle()
            }
        }
    }
}

// Exact SVG wave shape like the CodePen
struct SVGWaveShape: Shape {
    var phase: Double
    let amplitude: CGFloat
    let frequency: CGFloat
    
    var animatableData: Double {
        get { phase }
        set { phase = newValue }
    }
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let width = rect.width
        let height = rect.height
        
        // Start at top left of wave
        path.move(to: CGPoint(x: 0, y: amplitude))
        
        // Create the wave using the exact formula from SVG generators
        let waveWidth = width / frequency
        let steps = Int(width)
        
        for x in 0...steps {
            let xPos = CGFloat(x)
            let relativeX = xPos / waveWidth
            
            // Classic sine wave formula used in SVG generators
            let y = amplitude * sin(relativeX * .pi * 2 + phase) + amplitude
            
            path.addLine(to: CGPoint(x: xPos, y: y))
        }
        
        // Complete the shape
        path.addLine(to: CGPoint(x: width, y: height))
        path.addLine(to: CGPoint(x: 0, y: height))
        path.closeSubpath()
        
        return path
    }
}

// Alternative with exact CodePen colors and gradients
struct CodePenExactWaveBackground: View {
    @State private var offset: CGFloat = 0
    
    var body: some View {
        ZStack {
            // Exact gradient from the CodePen
            LinearGradient(
                gradient: Gradient(stops: [
                    .init(color: Color(hex: "ee9ca7"), location: 0.0),    // Soft pink
                    .init(color: Color(hex: "ffdde1"), location: 0.5),    // Light pink
                    .init(color: Color(hex: "3a1c71"), location: 1.0)     // Deep purple
                ]),
                startPoint: .top,
                endPoint: .bottom
            )
            
            // Animated waves overlay
            GeometryReader { geometry in
                VStack {
                    Spacer()
                    
                    // Multiple wave layers with exact CodePen styling
                    ZStack {
                        // Wave Layer 1
                        SVGWavePath(offset: offset, amplitude: 60, frequency: 0.01)
                            .fill(
                                LinearGradient(
                                    colors: [
                                        Color.white.opacity(0.1),
                                        Color(hex: "d76d77").opacity(0.3)
                                    ],
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            )
                            .frame(height: 200)
                        
                        // Wave Layer 2
                        SVGWavePath(offset: offset * 1.5, amplitude: 40, frequency: 0.015)
                            .fill(
                                LinearGradient(
                                    colors: [
                                        Color(hex: "ffaf7b").opacity(0.3),
                                        Color.white.opacity(0.1)
                                    ],
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            )
                            .frame(height: 180)
                            .offset(y: 20)
                        
                        // Wave Layer 3
                        SVGWavePath(offset: offset * 2, amplitude: 30, frequency: 0.02)
                            .fill(
                                LinearGradient(
                                    colors: [
                                        Color.white.opacity(0.2),
                                        Color(hex: "3a1c71").opacity(0.2)
                                    ],
                                    startPoint: .top,
                                    endPoint: .bottom
                                )
                            )
                            .frame(height: 160)
                            .offset(y: 40)
                    }
                }
            }
        }
        .ignoresSafeArea()
        .onAppear {
            withAnimation(.linear(duration: 20).repeatForever(autoreverses: false)) {
                offset = .pi * 2
            }
        }
    }
}

struct SVGWavePath: Shape {
    var offset: CGFloat
    let amplitude: CGFloat
    let frequency: CGFloat
    
    var animatableData: CGFloat {
        get { offset }
        set { offset = newValue }
    }
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let width = rect.width
        let height = rect.height
        
        path.move(to: CGPoint(x: 0, y: height * 0.5))
        
        for x in stride(from: 0, through: width, by: 1) {
            let relativeX = x / width
            let wavelength = width * frequency
            let y = amplitude * sin((relativeX / frequency + offset) * .pi * 2) + height * 0.5
            path.addLine(to: CGPoint(x: x, y: y))
        }
        
        path.addLine(to: CGPoint(x: width, y: height))
        path.addLine(to: CGPoint(x: 0, y: height))
        path.closeSubpath()
        
        return path
    }
}
