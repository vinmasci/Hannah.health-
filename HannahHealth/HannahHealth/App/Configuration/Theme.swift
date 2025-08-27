//
//  Theme.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct Theme {
    // MARK: - Colors - Updated for UI-DESIGN.md spec
    
    // Background gradient from UI-DESIGN.md
    static let backgroundGradient = LinearGradient(
        colors: [
            Color(hex: "0A0E27"), // Deep navy
            Color(hex: "1B1464")  // Deep purple
        ],
        startPoint: .top,
        endPoint: .bottom
    )
    
    // Glass effects from UI-DESIGN.md spec - Updated to 50% black tint
    static let cardBackground = Color.black.opacity(0.5)
    static let cardBorder = Color.white.opacity(0.1)
    static let glassMorphism = Color.black.opacity(0.5)
    static let glassMorphismMedium = Color.black.opacity(0.6)
    static let glassMorphismStrong = Color.black.opacity(0.7)
    
    // Accent colors from UI-DESIGN.md
    static let oceanBlue = Color(hex: "4361EE")
    static let coral = Color(hex: "FF6B6B")
    static let mint = Color(hex: "4ECDC4")
    static let lavender = Color(hex: "C06FFF")
    static let emerald = Color(hex: "10B981")
    static let sky = Color(hex: "38BDF8")
    
    // Legacy compatibility
    static let red400 = coral
    static let emerald400 = emerald
    static let sky400 = sky
    static let purple400 = lavender
    static let ocean = oceanBlue
    static let sunshine = Color(hex: "FFE66D")
    
    // Legacy gradients - keeping for backward compatibility
    static let primaryGradient = LinearGradient(
        colors: [oceanBlue, lavender],
        startPoint: .topLeading,
        endPoint: .bottomTrailing
    )
    
    // MARK: - Typography
    static let largeTitle = Font.system(size: 34, weight: .bold, design: .rounded)
    static let title = Font.system(size: 28, weight: .semibold, design: .rounded)
    static let headline = Font.system(size: 20, weight: .semibold, design: .rounded)
    static let body = Font.system(size: 17, weight: .regular, design: .rounded)
    static let caption = Font.system(size: 14, weight: .regular, design: .rounded)
}

// MARK: - Color Extension
extension Color {
    init(hex: String) {
        let hex = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var int: UInt64 = 0
        Scanner(string: hex).scanHexInt64(&int)
        let a, r, g, b: UInt64
        switch hex.count {
        case 3:
            (a, r, g, b) = (255, (int >> 8) * 17, (int >> 4 & 0xF) * 17, (int & 0xF) * 17)
        case 6:
            (a, r, g, b) = (255, int >> 16, int >> 8 & 0xFF, int & 0xFF)
        case 8:
            (a, r, g, b) = (int >> 24, int >> 16 & 0xFF, int >> 8 & 0xFF, int & 0xFF)
        default:
            (a, r, g, b) = (255, 0, 0, 0)
        }
        self.init(
            .sRGB,
            red: Double(r) / 255,
            green: Double(g) / 255,
            blue: Double(b) / 255,
            opacity: Double(a) / 255
        )
    }
}

// MARK: - View Modifiers
struct GlassCard: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(Color.black.opacity(0.5))
            .cornerRadius(20)
            .overlay(
                RoundedRectangle(cornerRadius: 20)
                    .stroke(Color.white.opacity(0.05))
            )
    }
}

struct NeuomorphicCard: ViewModifier {
    func body(content: Content) -> some View {
        content
            .background(Color(UIColor.systemBackground))
            .cornerRadius(20)
            .shadow(color: .black.opacity(0.1), radius: 10, x: 5, y: 5)
            .shadow(color: .white.opacity(0.7), radius: 10, x: -5, y: -5)
    }
}

extension View {
    func glassCard() -> some View {
        modifier(GlassCard())
    }
    
    func neuomorphicCard() -> some View {
        modifier(NeuomorphicCard())
    }
}