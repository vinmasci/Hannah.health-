//
//  WavyBackgroundView.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct WavyBackgroundView: View {
    @State private var phase: CGFloat = 0
    
    var body: some View {
        Canvas { context, size in
            // Draw multiple wave layers
            for i in 0..<4 {
                let wavePath = createWavePath(in: size, offset: CGFloat(i * 30))
                
                context.fill(
                    wavePath,
                    with: .linearGradient(
                        Gradient(colors: [
                            Theme.sky400.opacity(0.15 - Double(i) * 0.03),
                            Theme.sky400.opacity(0.08 - Double(i) * 0.02)
                        ]),
                        startPoint: .zero,
                        endPoint: CGPoint(x: size.width, y: size.height)
                    )
                )
            }
        }
        .onAppear {
            withAnimation(.linear(duration: 10).repeatForever(autoreverses: false)) {
                phase = .pi * 2
            }
        }
        .background(
            LinearGradient(
                colors: [
                    Color(hex: "E0F2FE"),  // sky-100
                    Color(hex: "F0F9FF")   // sky-50
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .ignoresSafeArea()
    }
    
    private func createWavePath(in size: CGSize, offset: CGFloat = 0) -> Path {
        var path = Path()
        let waveHeight: CGFloat = 20
        let waveLength = size.width / 2
        
        path.move(to: CGPoint(x: 0, y: size.height * 0.5 + offset))
        
        for x in stride(from: 0, to: size.width + waveLength, by: 1) {
            let relativeX = x / waveLength
            let sine = sin(relativeX * .pi * 2 + phase) * waveHeight
            let y = size.height * 0.5 + sine + offset
            path.addLine(to: CGPoint(x: x, y: y))
        }
        
        path.addLine(to: CGPoint(x: size.width + waveLength, y: size.height))
        path.addLine(to: CGPoint(x: 0, y: size.height))
        path.closeSubpath()
        
        return path
    }
}

// Static wavy pattern for performance - inspired by SVG Gradient Wave
struct StaticWavyPattern: View {
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Base gradient background
                LinearGradient(
                    stops: [
                        .init(color: Color(hex: "E3F2FD"), location: 0.0),    // blue-50
                        .init(color: Color(hex: "BBDEFB"), location: 0.3),    // blue-100
                        .init(color: Color(hex: "90CAF9"), location: 0.6),    // blue-200
                        .init(color: Color(hex: "64B5F6"), location: 1.0)     // blue-300
                    ],
                    startPoint: .top,
                    endPoint: .bottom
                )
                
                // Multiple gradient waves
                VStack(spacing: 0) {
                    Spacer()
                    
                    // First wave layer
                    GradientWave(
                        gradient: LinearGradient(
                            colors: [
                                Theme.sky400.opacity(0.3),
                                Theme.purple400.opacity(0.2)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        amplitude: 50,
                        frequency: 0.5,
                        phase: 0
                    )
                    .frame(height: 200)
                    .offset(y: -30)
                    
                    // Second wave layer
                    GradientWave(
                        gradient: LinearGradient(
                            colors: [
                                Theme.emerald400.opacity(0.25),
                                Theme.sky400.opacity(0.2)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        amplitude: 40,
                        frequency: 0.8,
                        phase: 0.5
                    )
                    .frame(height: 180)
                    .offset(y: -80)
                    
                    // Third wave layer
                    GradientWave(
                        gradient: LinearGradient(
                            colors: [
                                Theme.purple400.opacity(0.2),
                                Theme.red400.opacity(0.15)
                            ],
                            startPoint: .topLeading,
                            endPoint: .bottomTrailing
                        ),
                        amplitude: 30,
                        frequency: 1.2,
                        phase: 1
                    )
                    .frame(height: 150)
                    .offset(y: -120)
                }
            }
        }
        .ignoresSafeArea()
    }
}

// SVG-inspired gradient wave shape
struct GradientWave: View {
    let gradient: LinearGradient
    let amplitude: CGFloat
    let frequency: CGFloat
    let phase: CGFloat
    
    var body: some View {
        GeometryReader { geometry in
            Path { path in
                let width = geometry.size.width
                let height = geometry.size.height
                let waveHeight = height * 0.3
                
                path.move(to: CGPoint(x: 0, y: waveHeight))
                
                // Create smooth wave using bezier curves
                let steps = Int(width / 20)
                for i in 0...steps {
                    let x = CGFloat(i) * width / CGFloat(steps)
                    let relativeX = x / width
                    
                    // Create more organic wave using multiple sine waves
                    let y1 = sin((relativeX * frequency + phase) * .pi * 2) * amplitude
                    let y2 = sin((relativeX * frequency * 2 + phase) * .pi * 2) * (amplitude * 0.3)
                    let y = waveHeight + y1 + y2
                    
                    if i == 0 {
                        path.move(to: CGPoint(x: x, y: y))
                    } else {
                        // Use quadratic curves for smoother waves
                        let prevX = CGFloat(i - 1) * width / CGFloat(steps)
                        let midX = (prevX + x) / 2
                        let prevRelativeX = prevX / width
                        let prevY1 = sin((prevRelativeX * frequency + phase) * .pi * 2) * amplitude
                        let prevY2 = sin((prevRelativeX * frequency * 2 + phase) * .pi * 2) * (amplitude * 0.3)
                        let prevY = waveHeight + prevY1 + prevY2
                        let midY = (prevY + y) / 2
                        
                        path.addQuadCurve(
                            to: CGPoint(x: x, y: y),
                            control: CGPoint(x: midX, y: midY - 10)
                        )
                    }
                }
                
                path.addLine(to: CGPoint(x: width, y: height))
                path.addLine(to: CGPoint(x: 0, y: height))
                path.closeSubpath()
            }
            .fill(gradient)
        }
    }
}

struct Wave: Shape {
    let amplitude: CGFloat
    let frequency: CGFloat
    let phase: Double
    let opacity: Double
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let width = rect.width
        let height = rect.height
        let midHeight = height * 0.5
        
        path.move(to: CGPoint(x: 0, y: midHeight))
        
        for x in stride(from: 0, to: width, by: 1) {
            let relativeX = x / width
            let sine = sin((relativeX * frequency + phase) * .pi * 2) * amplitude
            let y = midHeight + sine
            path.addLine(to: CGPoint(x: x, y: y))
        }
        
        path.addLine(to: CGPoint(x: width, y: height))
        path.addLine(to: CGPoint(x: 0, y: height))
        path.closeSubpath()
        
        return path
    }
}