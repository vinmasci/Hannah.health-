//
//  VortexTimeBackground.swift
//  HannahHealth
//
//  High-performance time-based backgrounds using Vortex particle system
//

import SwiftUI
import Vortex

// MARK: - Vortex-Powered Dynamic Background
struct VortexTimeBackground: View {
    @State private var currentPeriod: TimePeriod = .current()
    @State private var timer: Timer?
    
    // Allow override for testing/preview
    var forcePeriod: TimePeriod?
    
    private var activePeriod: TimePeriod {
        forcePeriod ?? currentPeriod
    }
    
    private var colors: TimeOfDayColors {
        TimeOfDayColors.colors(for: activePeriod)
    }
    
    var body: some View {
        ZStack {
            // Base gradient background
            LinearGradient(
                gradient: Gradient(stops: colors.gradientStops),
                startPoint: .top,
                endPoint: .bottom
            )
            
            // Vortex Fireflies Effect
            VortexView(.fireflies) {
                Circle()
                    .fill(colors.particleColor)
                    .frame(width: 24)
                    .blur(radius: 2)
                    .blendMode(.plusLighter)
                    .tag("firefly")
            }
            .blendMode(.screen)
            
            // Alternative: Custom firefly configuration
            // VortexViewReader { proxy in
            //     VortexView(createCustomFireflies()) {
            //         Circle()
            //             .fill(colors.particleColor)
            //             .frame(width: 16)
            //             .blur(radius: 2)
            //             .tag("firefly")
            //     }
            // }
        }
        .ignoresSafeArea()
        .onAppear {
            startTimeTracking()
        }
        .onDisappear {
            timer?.invalidate()
        }
    }
    
    private func startTimeTracking() {
        guard forcePeriod == nil else { return }
        
        updateTimePeriod()
        
        // Update every minute
        timer = Timer.scheduledTimer(withTimeInterval: 60, repeats: true) { _ in
            updateTimePeriod()
        }
    }
    
    private func updateTimePeriod() {
        let newPeriod = TimePeriod.current()
        
        withAnimation(.easeInOut(duration: 2)) {
            currentPeriod = newPeriod
        }
    }
    
    // Custom firefly system with more control
    private func createCustomFireflies() -> VortexSystem {
        VortexSystem(
            tags: ["firefly"],
            spawnOccasion: .onUpdate,
            shape: .box(width: UIScreen.main.bounds.width, height: UIScreen.main.bounds.height),
            lifespan: 7.5,  // Single value instead of range
            speed: 0.2,      // Single value instead of range
            angleRange: Angle.degrees(360),  // Single angle value for full rotation
            colors: .random([.white]),  // Use Vortex colors
            size: 1.0,       // Single value instead of range
            sizeVariation: 0.5
        )
    }
}

// MARK: - Alternative Sparkle Effect
struct VortexSparkleBackground: View {
    @State private var currentPeriod: TimePeriod = .current()
    
    private var colors: TimeOfDayColors {
        TimeOfDayColors.colors(for: currentPeriod)
    }
    
    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                gradient: Gradient(stops: colors.gradientStops),
                startPoint: .top,
                endPoint: .bottom
            )
            
            // Sparkle effect (less CPU intensive than fireflies)
            VortexView(.spark) {  // Changed from .sparkle to .spark
                Circle()
                    .fill(colors.particleColor)
                    .frame(width: 8)
                    .blur(radius: 1)
                    .tag("spark")
            }
            .opacity(0.6)
        }
        .ignoresSafeArea()
    }
}

// MARK: - Magic Effect Background
struct VortexMagicBackground: View {
    @State private var currentPeriod: TimePeriod = .current()
    
    private var colors: TimeOfDayColors {
        TimeOfDayColors.colors(for: currentPeriod)
    }
    
    var body: some View {
        ZStack {
            // Gradient background
            LinearGradient(
                gradient: Gradient(stops: colors.gradientStops),
                startPoint: .top,
                endPoint: .bottom
            )
            
            // Magic particles
            VortexView(.magic) {
                Image(systemName: "sparkle")
                    .foregroundColor(colors.particleColor)
                    .blur(radius: 1)
                    .tag("magic")
            }
            .opacity(0.7)
        }
        .ignoresSafeArea()
    }
}

// MARK: - Performance Options
enum ParticlePerformanceMode {
    case high       // Full fireflies
    case medium     // Sparkle effect
    case low        // No particles
    
    @ViewBuilder
    func background() -> some View {
        switch self {
        case .high:
            VortexTimeBackground()
        case .medium:
            VortexSparkleBackground()
        case .low:
            DynamicTimeBackground() // Your existing non-particle version
        }
    }
}