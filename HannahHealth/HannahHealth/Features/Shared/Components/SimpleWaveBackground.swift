//
//  SimpleWaveBackground.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct SimpleWaveBackground: View {
    var body: some View {
        ZStack {
            // Base gradient matching BG.PNG - soft light blue gradient
            LinearGradient(
                colors: [
                    Color(hex: "E3F2FD"),  // Very light blue (blue-50)
                    Color(hex: "BBDEFB"),  // Light blue (blue-100)
                    Color(hex: "90CAF9")   // Soft blue (blue-200)
                ],
                startPoint: .top,
                endPoint: .bottom
            )
            
            // Simple wave overlay for texture
            GeometryReader { geometry in
                VStack {
                    Spacer()
                    
                    // Single subtle wave layer like in BG.PNG
                    SimpleWave()
                        .fill(
                            LinearGradient(
                                colors: [
                                    Color.white.opacity(0.3),
                                    Color(hex: "64B5F6").opacity(0.2)  // blue-300
                                ],
                                startPoint: .top,
                                endPoint: .bottom
                            )
                        )
                        .frame(height: geometry.size.height * 0.4)
                }
            }
        }
        .ignoresSafeArea()
    }
}

struct SimpleWave: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let width = rect.width
        let height = rect.height
        let waveHeight: CGFloat = 30
        
        // Start from top left
        path.move(to: CGPoint(x: 0, y: waveHeight))
        
        // Create a simple wave pattern like BG.PNG
        let segments = 5
        for i in 0...segments {
            let x = width * CGFloat(i) / CGFloat(segments)
            let relativeX = CGFloat(i) / CGFloat(segments)
            let y = waveHeight + sin(relativeX * .pi * 2) * waveHeight
            
            if i == 0 {
                path.move(to: CGPoint(x: 0, y: y))
            } else {
                let prevX = width * CGFloat(i - 1) / CGFloat(segments)
                let midX = (prevX + x) / 2
                let prevY = waveHeight + sin((CGFloat(i - 1) / CGFloat(segments)) * .pi * 2) * waveHeight
                let controlY = (prevY + y) / 2 - 10
                
                path.addQuadCurve(
                    to: CGPoint(x: x, y: y),
                    control: CGPoint(x: midX, y: controlY)
                )
            }
        }
        
        // Complete the shape
        path.addLine(to: CGPoint(x: width, y: height))
        path.addLine(to: CGPoint(x: 0, y: height))
        path.closeSubpath()
        
        return path
    }
}

// Exact recreation of BG.PNG pattern - just the gradient
struct BGImageBackground: View {
    var body: some View {
        // Navy to black purple gradient
        LinearGradient(
            gradient: Gradient(colors: [
                Color(red: 15/255, green: 20/255, blue: 40/255),     // Dark navy at top
                Color(red: 12/255, green: 15/255, blue: 35/255),     // Darker navy
                Color(red: 10/255, green: 5/255, blue: 25/255),      // Navy purple blend
                Color(red: 8/255, green: 2/255, blue: 15/255)        // Black purple at bottom
            ]),
            startPoint: .top,
            endPoint: .bottom
        )
        .ignoresSafeArea()
    }
}

struct WavePattern: Shape {
    func path(in rect: CGRect) -> Path {
        var path = Path()
        let width = rect.width
        let height = rect.height
        
        // Create repeating wave pattern like in BG.PNG
        let waveHeight: CGFloat = 20
        let numberOfWaves = 8
        
        for waveIndex in 0..<numberOfWaves {
            let yOffset = CGFloat(waveIndex) * (height / CGFloat(numberOfWaves))
            
            path.move(to: CGPoint(x: 0, y: yOffset))
            
            for x in stride(from: 0, to: width, by: 10) {
                let relativeX = x / width
                let y = yOffset + sin(relativeX * .pi * 4) * waveHeight
                path.addLine(to: CGPoint(x: x, y: y))
            }
        }
        
        return path
    }
}