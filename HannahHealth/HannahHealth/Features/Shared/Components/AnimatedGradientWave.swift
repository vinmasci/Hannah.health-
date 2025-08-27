//
//  AnimatedGradientWave.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct AnimatedGradientWave: View {
    @State private var animateGradient = false
    @State private var waveOffset = 0.0
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Animated gradient background
                LinearGradient(
                    stops: [
                        .init(color: Color(hex: "DBEAFE"), location: 0.0),    // blue-100
                        .init(color: Color(hex: "BFDBFE"), location: 0.25),   // blue-200
                        .init(color: Color(hex: "93C5FD"), location: 0.5),    // blue-300
                        .init(color: Color(hex: "60A5FA"), location: 0.75),   // blue-400
                        .init(color: Color(hex: "3B82F6"), location: 1.0)     // blue-500
                    ],
                    startPoint: animateGradient ? .topLeading : .top,
                    endPoint: animateGradient ? .bottomTrailing : .bottom
                )
                .hueRotation(.degrees(animateGradient ? 15 : 0))
                .animation(.easeInOut(duration: 3).repeatForever(autoreverses: true), value: animateGradient)
                
                // SVG-style waves
                VStack(spacing: 0) {
                    Spacer()
                    
                    // Bottom waves with gradient fills
                    ZStack {
                        // Wave 1 - Deepest layer
                        SVGWave(
                            waveOffset: waveOffset,
                            amplitude: 60,
                            frequency: 0.4,
                            speed: 0.3
                        )
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color(hex: "6366F1").opacity(0.4),  // indigo-500
                                    Color(hex: "8B5CF6").opacity(0.3)   // violet-500
                                ],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .frame(height: 250)
                        
                        // Wave 2 - Middle layer
                        SVGWave(
                            waveOffset: waveOffset,
                            amplitude: 45,
                            frequency: 0.6,
                            speed: -0.2
                        )
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color(hex: "10B981").opacity(0.35), // emerald-500
                                    Color(hex: "06B6D4").opacity(0.3)   // cyan-500
                                ],
                                startPoint: .topLeading,
                                endPoint: .bottomTrailing
                            )
                        )
                        .frame(height: 200)
                        .offset(y: 20)
                        
                        // Wave 3 - Top layer
                        SVGWave(
                            waveOffset: waveOffset,
                            amplitude: 30,
                            frequency: 0.8,
                            speed: 0.4
                        )
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color(hex: "F59E0B").opacity(0.25), // amber-500
                                    Color(hex: "EF4444").opacity(0.2)   // red-500
                                ],
                                startPoint: .topTrailing,
                                endPoint: .bottomLeading
                            )
                        )
                        .frame(height: 150)
                        .offset(y: 40)
                    }
                }
            }
        }
        .ignoresSafeArea()
        .onAppear {
            animateGradient = true
            withAnimation(.linear(duration: 20).repeatForever(autoreverses: false)) {
                waveOffset = .pi * 2
            }
        }
    }
}

// SVG-style wave shape with smooth bezier curves
struct SVGWave: Shape {
    var waveOffset: Double
    let amplitude: CGFloat
    let frequency: CGFloat
    let speed: CGFloat
    
    var animatableData: Double {
        get { waveOffset }
        set { waveOffset = newValue }
    }
    
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let width = rect.width
        let height = rect.height
        let waveHeight = height * 0.3
        
        // Start from top left
        path.move(to: CGPoint(x: 0, y: waveHeight))
        
        // Create smooth wave using cubic bezier curves
        let wavelength = width / frequency
        let points = Int(width / 10) // More points for smoother curve
        
        for i in 0...points {
            let x = CGFloat(i) * width / CGFloat(points)
            let relativeX = x / wavelength
            
            // Combine multiple sine waves for organic look
            let y1 = sin((relativeX + waveOffset * speed) * .pi * 2) * amplitude
            let y2 = sin((relativeX * 1.5 + waveOffset * speed * 0.7) * .pi * 2) * (amplitude * 0.4)
            let y3 = sin((relativeX * 2.3 + waveOffset * speed * 1.2) * .pi * 2) * (amplitude * 0.2)
            
            let y = waveHeight + y1 + y2 + y3
            
            if i == 0 {
                path.move(to: CGPoint(x: 0, y: y))
            } else {
                path.addLine(to: CGPoint(x: x, y: y))
            }
        }
        
        // Close the path
        path.addLine(to: CGPoint(x: width, y: height))
        path.addLine(to: CGPoint(x: 0, y: height))
        path.closeSubpath()
        
        return path
    }
}

// Mesh gradient background for iOS 18+
@available(iOS 18.0, *)
struct MeshGradientWave: View {
    @State private var animateColors = false
    
    var body: some View {
        MeshGradient(
            width: 3,
            height: 3,
            points: [
                .init(0, 0), .init(0.5, 0), .init(1, 0),
                .init(0, 0.5), .init(0.5, 0.5), .init(1, 0.5),
                .init(0, 1), .init(0.5, 1), .init(1, 1)
            ],
            colors: [
                animateColors ? Theme.sky400 : Theme.purple400,
                Theme.emerald400,
                animateColors ? Theme.purple400 : Theme.sky400,
                Theme.red400.opacity(0.7),
                Color.white,
                Theme.emerald400.opacity(0.7),
                animateColors ? Theme.emerald400 : Theme.red400,
                Theme.sky400,
                animateColors ? Theme.red400 : Theme.emerald400
            ]
        )
        .ignoresSafeArea()
        .onAppear {
            withAnimation(.easeInOut(duration: 5).repeatForever(autoreverses: true)) {
                animateColors.toggle()
            }
        }
    }
}