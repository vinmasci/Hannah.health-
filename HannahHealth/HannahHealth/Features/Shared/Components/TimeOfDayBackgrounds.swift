//
//  TimeOfDayBackgrounds.swift
//  HannahHealth
//
//  Dynamic time-based backgrounds that transition throughout the day
//

import SwiftUI

// MARK: - Time Period Enum
enum TimePeriod: CaseIterable {
    case earlyMorning  // 5am - 7am
    case morning       // 7am - 10am
    case midday        // 10am - 3pm
    case afternoon     // 3pm - 5pm
    case sunset        // 5pm - 7pm
    case evening       // 7pm - 9pm
    case night         // 9pm - 11pm
    case midnight      // 11pm - 5am (OG colors!)
    
    static func current(for date: Date = Date()) -> TimePeriod {
        let hour = Calendar.current.component(.hour, from: date)
        
        switch hour {
        case 5..<7: return .earlyMorning
        case 7..<10: return .morning
        case 10..<15: return .midday
        case 15..<17: return .afternoon
        case 17..<19: return .sunset
        case 19..<21: return .evening
        case 21..<23: return .night
        default: return .midnight  // 11pm - 5am
        }
    }
    
    // Progress between current and next time period (0.0 to 1.0)
    static func transitionProgress(for date: Date = Date()) -> Double {
        let calendar = Calendar.current
        let components = calendar.dateComponents([.hour, .minute], from: date)
        let hour = Double(components.hour ?? 0)
        let minute = Double(components.minute ?? 0) / 60.0
        let currentTime = hour + minute
        
        let current = TimePeriod.current(for: date)
        let (startHour, endHour) = current.hourRange
        
        let progress = (currentTime - Double(startHour)) / Double(endHour - startHour)
        return min(max(progress, 0), 1)
    }
    
    var hourRange: (Int, Int) {
        switch self {
        case .earlyMorning: return (5, 7)
        case .morning: return (7, 10)
        case .midday: return (10, 15)
        case .afternoon: return (15, 17)
        case .sunset: return (17, 19)
        case .evening: return (19, 21)
        case .night: return (21, 23)
        case .midnight: return (23, 5)  // Wraps around
        }
    }
}

// MARK: - Color Themes
struct TimeOfDayColors {
    let gradientStops: [Gradient.Stop]
    let waveColors: [(color: Color, opacity: Double)]
    let particleColor: Color
    let particleOpacity: Range<Double>
    
    static let earlyMorning = TimeOfDayColors(
        gradientStops: [
            .init(color: Color(hex: "1E3A5F"), location: 0.0),    // Deep dawn blue
            .init(color: Color(hex: "364F6B"), location: 0.25),   // Morning blue
            .init(color: Color(hex: "4A6FA5"), location: 0.5),    // Lighter blue
            .init(color: Color(hex: "E8B4B8"), location: 0.75),   // Pink horizon
            .init(color: Color(hex: "FFB6B9"), location: 1.0)     // Soft pink
        ],
        waveColors: [
            (Color(hex: "FFE5CC"), 0.15),  // Peach
            (Color(hex: "FFC8DD"), 0.12),  // Pink
            (Color(hex: "C9ADA1"), 0.08),  // Warm gray
            (Color(hex: "F7E2E2"), 0.05)   // Light pink
        ],
        particleColor: Color(hex: "FFD700"),  // Gold fireflies
        particleOpacity: 0.3..<0.7
    )
    
    static let morning = TimeOfDayColors(
        gradientStops: [
            .init(color: Color(hex: "87CEEB"), location: 0.0),    // Sky blue
            .init(color: Color(hex: "98D8E8"), location: 0.25),   // Light blue
            .init(color: Color(hex: "FDB813"), location: 0.5),    // Golden yellow
            .init(color: Color(hex: "FFCC5C"), location: 0.75),   // Light gold
            .init(color: Color(hex: "FFE19C"), location: 1.0)     // Pale yellow
        ],
        waveColors: [
            (Color(hex: "FFFFFF"), 0.20),  // White clouds
            (Color(hex: "FFE5B4"), 0.15),  // Peach
            (Color(hex: "87CEEB"), 0.10),  // Sky blue
            (Color(hex: "F0E68C"), 0.08)   // Khaki
        ],
        particleColor: Color(hex: "FFEB3B"),  // Bright yellow fireflies
        particleOpacity: 0.4..<0.8
    )
    
    static let midday = TimeOfDayColors(
        gradientStops: [
            .init(color: Color(hex: "00B4DB"), location: 0.0),    // Bright blue
            .init(color: Color(hex: "0083B0"), location: 0.25),   // Deep sky
            .init(color: Color(hex: "00B4DB"), location: 0.5),    // Bright blue
            .init(color: Color(hex: "80D0C7"), location: 0.75),   // Turquoise
            .init(color: Color(hex: "A8E6CF"), location: 1.0)     // Mint
        ],
        waveColors: [
            (Color(hex: "FFFFFF"), 0.25),  // Bright white
            (Color(hex: "E3F2FD"), 0.18),  // Light blue
            (Color(hex: "81D4FA"), 0.12),  // Sky blue
            (Color(hex: "B3E5FC"), 0.08)   // Pale cyan
        ],
        particleColor: Color(hex: "FFFFFF"),  // Bright white fireflies
        particleOpacity: 0.5..<0.9
    )
    
    static let afternoon = TimeOfDayColors(
        gradientStops: [
            .init(color: Color(hex: "4CA1AF"), location: 0.0),    // Teal
            .init(color: Color(hex: "68B3BD"), location: 0.25),   // Light teal
            .init(color: Color(hex: "87BFCC"), location: 0.5),    // Pale blue
            .init(color: Color(hex: "F4E04D"), location: 0.75),   // Yellow
            .init(color: Color(hex: "F9DC5C"), location: 1.0)     // Gold
        ],
        waveColors: [
            (Color(hex: "F4E04D"), 0.18),  // Yellow
            (Color(hex: "95C9D3"), 0.14),  // Turquoise
            (Color(hex: "FAE588"), 0.10),  // Light yellow
            (Color(hex: "B8D4E3"), 0.06)   // Pale blue
        ],
        particleColor: Color(hex: "FFC107"),  // Amber fireflies
        particleOpacity: 0.4..<0.8
    )
    
    static let sunset = TimeOfDayColors(
        gradientStops: [
            .init(color: Color(hex: "FF6B6B"), location: 0.0),    // Coral
            .init(color: Color(hex: "FF8E53"), location: 0.25),   // Orange
            .init(color: Color(hex: "FE6B8B"), location: 0.5),    // Pink
            .init(color: Color(hex: "FF6F91"), location: 0.75),   // Rose
            .init(color: Color(hex: "753A88"), location: 1.0)     // Purple
        ],
        waveColors: [
            (Color(hex: "FF6B9D"), 0.20),  // Pink
            (Color(hex: "FEC84D"), 0.16),  // Gold
            (Color(hex: "E84393"), 0.12),  // Magenta
            (Color(hex: "A770EF"), 0.08)   // Lavender
        ],
        particleColor: Color(hex: "FF9800"),  // Orange fireflies
        particleOpacity: 0.5..<0.9
    )
    
    static let evening = TimeOfDayColors(
        gradientStops: [
            .init(color: Color(hex: "2C3E50"), location: 0.0),    // Dark blue-gray
            .init(color: Color(hex: "3A526B"), location: 0.25),   // Steel blue
            .init(color: Color(hex: "4E5D7A"), location: 0.5),    // Slate
            .init(color: Color(hex: "8B6F96"), location: 0.75),   // Dusty purple
            .init(color: Color(hex: "574B60"), location: 1.0)     // Dark purple
        ],
        waveColors: [
            (Color(hex: "8E8BA3"), 0.15),  // Lavender gray
            (Color(hex: "7B6D8D"), 0.12),  // Muted purple
            (Color(hex: "5C5470"), 0.08),  // Dark lavender
            (Color(hex: "4A4458"), 0.05)   // Deep purple
        ],
        particleColor: Color(hex: "E1BEE7"),  // Lavender fireflies
        particleOpacity: 0.4..<0.8
    )
    
    static let night = TimeOfDayColors(
        gradientStops: [
            .init(color: Color(hex: "0F2027"), location: 0.0),    // Very dark blue
            .init(color: Color(hex: "203A43"), location: 0.25),   // Dark teal
            .init(color: Color(hex: "2C5364"), location: 0.5),    // Blue-gray
            .init(color: Color(hex: "364958"), location: 0.75),   // Slate
            .init(color: Color(hex: "1F2937"), location: 1.0)     // Charcoal
        ],
        waveColors: [
            (Color(hex: "4B6584"), 0.12),  // Blue-gray
            (Color(hex: "596275"), 0.10),  // Gray
            (Color(hex: "3B4A5A"), 0.07),  // Dark blue
            (Color(hex: "2F3B4B"), 0.05)   // Deep blue
        ],
        particleColor: Color(hex: "64B5F6"),  // Light blue fireflies
        particleOpacity: 0.3..<0.7
    )
    
    // OG MIDNIGHT COLORS - YOUR BELOVED ORIGINAL!
    static let midnight = TimeOfDayColors(
        gradientStops: [
            .init(color: Color(hex: "0D1B2A"), location: 0.0),    // Deep midnight blue
            .init(color: Color(hex: "1B263B"), location: 0.25),   // Dark blue
            .init(color: Color(hex: "2E3E5F"), location: 0.5),    // Navy blue
            .init(color: Color(hex: "3D3B67"), location: 0.75),   // Purple-blue
            .init(color: Color(hex: "2C2348"), location: 1.0)     // Deep purple
        ],
        waveColors: [
            (Color(hex: "5B6C8C"), 0.15),  // Slate blue
            (Color(hex: "6B5B95"), 0.12),  // Muted purple
            (Color(hex: "B8C5D6"), 0.08),  // Pale blue (moonlight)
            (Color(hex: "4A5568"), 0.05)   // Gray-blue
        ],
        particleColor: Color(hex: "FFFFFF"),  // White fireflies (OG style)
        particleOpacity: 0.3..<0.7
    )
    
    static func colors(for period: TimePeriod) -> TimeOfDayColors {
        switch period {
        case .earlyMorning: return .earlyMorning
        case .morning: return .morning
        case .midday: return .midday
        case .afternoon: return .afternoon
        case .sunset: return .sunset
        case .evening: return .evening
        case .night: return .night
        case .midnight: return .midnight
        }
    }
}

// MARK: - Dynamic Background View
struct DynamicTimeBackground: View {
    @State private var animateWaves = false
    @State private var currentPeriod: TimePeriod = .current()
    @State private var timer: Timer?
    @State private var transitionProgress: Double = 0
    
    // Allow override for testing/preview
    var forcePeriod: TimePeriod?
    
    private var activePeriod: TimePeriod {
        forcePeriod ?? currentPeriod
    }
    
    private var colors: TimeOfDayColors {
        TimeOfDayColors.colors(for: activePeriod)
    }
    
    private var nextColors: TimeOfDayColors {
        let allCases = TimePeriod.allCases
        guard let currentIndex = allCases.firstIndex(of: activePeriod) else {
            return colors
        }
        let nextIndex = (currentIndex + 1) % allCases.count
        return TimeOfDayColors.colors(for: allCases[nextIndex])
    }
    
    var body: some View {
        ZStack {
            // Base gradient with smooth transition
            LinearGradient(
                gradient: Gradient(stops: interpolatedStops()),
                startPoint: .top,
                endPoint: .bottom
            )
            
            // Animated wave layers
            GeometryReader { geometry in
                ZStack {
                    ForEach(0..<4) { index in
                        DynamicWaveLayer(
                            color: interpolatedWaveColor(at: index),
                            amplitude: 55 - CGFloat(index * 10),
                            frequency: 0.8 + CGFloat(index) * 0.5,
                            phase: animateWaves ? CGFloat(index) * .pi * 0.5 : CGFloat(index) * .pi * 2,
                            offset: geometry.size.height * CGFloat(0.25 + Double(index) * 0.2)
                        )
                    }
                }
            }
            
            // Moving particles using the new simple approach
            SimpleMovingParticlesView(particleColor: colors.particleColor)
        }
        .ignoresSafeArea()
        .onAppear {
            startAnimations()
            startTimeTracking()
        }
        .onDisappear {
            timer?.invalidate()
        }
    }
    
    private func startAnimations() {
        withAnimation(.linear(duration: 20).repeatForever(autoreverses: false)) {
            animateWaves.toggle()
        }
    }
    
    private func startTimeTracking() {
        guard forcePeriod == nil else { return } // Don't update if forced
        
        updateTimePeriod()
        
        // Update every minute
        timer = Timer.scheduledTimer(withTimeInterval: 60, repeats: true) { _ in
            updateTimePeriod()
        }
    }
    
    private func updateTimePeriod() {
        let newPeriod = TimePeriod.current()
        let progress = TimePeriod.transitionProgress()
        
        withAnimation(.easeInOut(duration: 2)) {
            currentPeriod = newPeriod
            transitionProgress = progress
        }
    }
    
    // Interpolate between gradient stops
    private func interpolatedStops() -> [Gradient.Stop] {
        let currentStops = colors.gradientStops
        let nextStops = nextColors.gradientStops
        
        return zip(currentStops, nextStops).map { current, next in
            let interpolatedColor = Color(
                red: lerp(current.color.components.red, next.color.components.red, transitionProgress),
                green: lerp(current.color.components.green, next.color.components.green, transitionProgress),
                blue: lerp(current.color.components.blue, next.color.components.blue, transitionProgress)
            )
            return Gradient.Stop(color: interpolatedColor, location: current.location)
        }
    }
    
    // Interpolate wave colors
    private func interpolatedWaveColor(at index: Int) -> Color {
        guard index < colors.waveColors.count && index < nextColors.waveColors.count else {
            return colors.waveColors.first?.color.opacity(colors.waveColors.first?.opacity ?? 0.1) ?? .clear
        }
        
        let current = colors.waveColors[index]
        let next = nextColors.waveColors[index]
        
        let interpolatedOpacity = lerp(current.opacity, next.opacity, transitionProgress)
        
        let interpolatedColor = Color(
            red: lerp(current.color.components.red, next.color.components.red, transitionProgress),
            green: lerp(current.color.components.green, next.color.components.green, transitionProgress),
            blue: lerp(current.color.components.blue, next.color.components.blue, transitionProgress)
        )
        
        return interpolatedColor.opacity(interpolatedOpacity)
    }
    
    // Linear interpolation helper
    private func lerp(_ a: Double, _ b: Double, _ t: Double) -> Double {
        return a + (b - a) * t
    }
}

// MARK: - Floating Particle Component
struct FloatingParticle: View {
    let id: Int
    let geometry: GeometryProxy
    let color: Color
    let animateWaves: Bool
    
    @State private var xOffset: CGFloat = 0
    @State private var yOffset: CGFloat = 0
    @State private var opacity: Double = 1.0
    @State private var isAnimating = false
    
    private let size: CGFloat
    private let initialX: CGFloat
    private let initialY: CGFloat
    private let animationDuration: Double
    private let driftRange: CGFloat
    
    init(id: Int, geometry: GeometryProxy, color: Color, animateWaves: Bool) {
        self.id = id
        self.geometry = geometry
        self.color = color
        self.animateWaves = animateWaves
        
        // Random initial values with safe bounds checking
        self.size = CGFloat.random(in: 3...6)
        
        // Safe X position
        let minX: CGFloat = 50
        let maxX = max(minX + 1, geometry.size.width - 50)
        self.initialX = CGFloat.random(in: minX...maxX)
        
        // Safe Y position  
        let minY: CGFloat = 50
        let maxY = max(minY + 1, geometry.size.height * 0.6)
        self.initialY = CGFloat.random(in: minY...maxY)
        
        self.animationDuration = Double.random(in: 15...25)
        self.driftRange = CGFloat.random(in: 30...60)
    }
    
    var body: some View {
        Circle()
            .fill(color)
            .frame(width: size, height: size)
            .position(
                x: initialX + xOffset * sin(animateWaves ? 1 : 0),
                y: initialY + yOffset * cos(animateWaves ? 1 : 0)
            )
            .opacity(animateWaves ? 0.7 : 0.3)
            .animation(
                Animation.easeInOut(duration: animationDuration)
                    .repeatForever(autoreverses: true),
                value: animateWaves
            )
            .onAppear {
                // Set random offsets for this particle
                xOffset = CGFloat.random(in: -driftRange...driftRange)
                yOffset = CGFloat.random(in: -driftRange/2...driftRange/2)
            }
    }
}

// MARK: - Moving Firefly Component (OG style with movement!)
struct MovingFirefly: View {
    let geometry: GeometryProxy
    let index: Int
    let color: Color
    let opacityRange: Range<Double>
    let animateWaves: Bool
    
    @State private var position: CGPoint
    @State private var opacity: Double
    
    private let size: CGFloat
    private let moveRadius: CGFloat
    
    init(geometry: GeometryProxy, index: Int, color: Color, opacityRange: Range<Double>, animateWaves: Bool) {
        self.geometry = geometry
        self.index = index
        self.color = color
        self.opacityRange = opacityRange
        self.animateWaves = animateWaves
        
        // Initial random position
        let initialX = CGFloat.random(in: 50...(geometry.size.width - 50))
        let initialY = CGFloat.random(in: 50...(geometry.size.height * 0.6))
        self._position = State(initialValue: CGPoint(x: initialX, y: initialY))
        
        // Random opacity
        self._opacity = State(initialValue: Double.random(in: opacityRange))
        
        // Random size
        self.size = CGFloat.random(in: 1...3)
        
        // How far it can drift
        self.moveRadius = CGFloat.random(in: 30...60)
    }
    
    var body: some View {
        Circle()
            .fill(color.opacity(opacity))
            .frame(width: size, height: size)
            .position(position)
            .onAppear {
                // Start floating animation
                animateFloating()
                
                // Start twinkling animation
                animateTwinkling()
            }
    }
    
    private func animateFloating() {
        // Create a gentle floating path
        let duration = Double.random(in: 8...15)
        let newX = position.x + CGFloat.random(in: -moveRadius...moveRadius)
        let newY = position.y + CGFloat.random(in: -moveRadius/2...moveRadius/2)
        
        // Keep within bounds
        let boundedX = min(max(newX, 50), geometry.size.width - 50)
        let boundedY = min(max(newY, 50), geometry.size.height * 0.7)
        
        withAnimation(
            .easeInOut(duration: duration)
        ) {
            position = CGPoint(x: boundedX, y: boundedY)
        }
        
        // Schedule next movement
        DispatchQueue.main.asyncAfter(deadline: .now() + duration) {
            animateFloating()
        }
    }
    
    private func animateTwinkling() {
        let duration = Double.random(in: 2...5)
        
        withAnimation(
            .easeInOut(duration: duration)
            .repeatForever(autoreverses: true)
        ) {
            opacity = Double.random(in: opacityRange.lowerBound...(opacityRange.upperBound * 1.5))
        }
    }
}

// MARK: - Wave Layer Component
struct DynamicWaveLayer: View {
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
                
                // Organic waves with multiple sine waves
                for x in stride(from: 0, through: width, by: 1) {
                    let relativeX = x / width
                    
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

// MARK: - Color Extension for Components
extension Color {
    var components: (red: Double, green: Double, blue: Double, opacity: Double) {
        guard let cgColor = UIColor(self).cgColor.components else {
            return (red: 0.5, green: 0.5, blue: 0.5, opacity: 1.0)
        }
        
        if cgColor.count == 2 {
            // Grayscale
            return (red: cgColor[0], green: cgColor[0], blue: cgColor[0], opacity: cgColor[1])
        } else if cgColor.count >= 3 {
            // RGB
            return (red: cgColor[0], green: cgColor[1], blue: cgColor[2], opacity: cgColor.count > 3 ? cgColor[3] : 1.0)
        }
        
        return (red: 0.5, green: 0.5, blue: 0.5, opacity: 1.0)
    }
}

// MARK: - Preview Provider
struct TimeOfDayBackgrounds_Previews: PreviewProvider {
    static var previews: some View {
        ScrollView {
            VStack(spacing: 20) {
                ForEach(TimePeriod.allCases, id: \.self) { period in
                    VStack {
                        Text(String(describing: period))
                            .foregroundColor(.white)
                            .padding()
                        
                        DynamicTimeBackground(forcePeriod: period)
                            .frame(height: 300)
                            .cornerRadius(20)
                            .padding(.horizontal)
                    }
                }
            }
        }
        .background(Color.black)
    }
}