//
//  TabNavigation.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

enum Tab: String, CaseIterable {
    case dashboard = "dashboard"
    case log = "log"
    case mealPlan = "mealPlan"
    case shopping = "shopping"
    case aiCoach = "aiCoach"
    
    var title: String {
        switch self {
        case .dashboard:
            return "Dashboard"
        case .log:
            return "Log"
        case .mealPlan:
            return "Meal Plan"
        case .shopping:
            return "Shop List"
        case .aiCoach:
            return "AI Coach"
        }
    }
    
    var icon: String {
        switch self {
        case .dashboard:
            return "gauge.open.with.lines.needle.67percent.and.arrowtriangle"
        case .log:
            return "plus.bubble"
        case .mealPlan:
            return "calendar"
        case .shopping:
            return "cart"
        case .aiCoach:
            return "bubble.left.and.text.bubble.right"
        }
    }
}

struct TabButton: View {
    let icon: String
    let tab: Tab
    @Binding var selectedTab: Tab
    
    var isSelected: Bool {
        selectedTab == tab
    }
    
    var body: some View {
        Button {
            withAnimation(.spring(duration: 0.3)) {
                selectedTab = tab
            }
        } label: {
            VStack(spacing: 3) {
                Image(systemName: icon)
                    .font(.system(size: 22, weight: isSelected ? .semibold : .regular))
                    .foregroundColor(isSelected ? .white : .white.opacity(0.5))  // White icons
                
                if !tab.title.isEmpty {
                    Text(tab.title)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(isSelected ? .white : .white.opacity(0.4))  // White text
                }
            }
        }
        .frame(maxWidth: .infinity)
    }
}

struct CustomTabBar: View {
    @Binding var selectedTab: Tab
    
    var body: some View {
        ZStack {
            // Custom curved shape for tab bar
            TabBarShape()
                .fill(.ultraThinMaterial)
                .background(TabBarShape().fill(Color.black.opacity(0.5)))
                .overlay(
                    TabBarShape()
                        .stroke(Theme.cardBorder, lineWidth: 0.5),
                    alignment: .top
                )
                .frame(height: 75)
                .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: -3)
            
            // Tab buttons
            HStack(spacing: 0) {
                TabButton(icon: Tab.dashboard.icon, tab: .dashboard, selectedTab: $selectedTab)
                TabButton(icon: Tab.log.icon, tab: .log, selectedTab: $selectedTab)
                TabButton(icon: Tab.mealPlan.icon, tab: .mealPlan, selectedTab: $selectedTab)
                TabButton(icon: Tab.shopping.icon, tab: .shopping, selectedTab: $selectedTab)
                TabButton(icon: Tab.aiCoach.icon, tab: .aiCoach, selectedTab: $selectedTab)
            }
            .padding(.horizontal, 16)
            .padding(.top, 4)  // Icons moved even higher
            .padding(.bottom, 20)  // Maintain bottom safe area spacing
        }
        .frame(height: 75)
    }
}

// Simple rectangle shape for tab bar - no curve
struct TabBarShape: Shape {
    func path(in rect: CGRect) -> Path {
        return Path(rect)
    }
}

// Placeholder for Quick Add Modal
struct QuickAddModal: View {
    @Environment(\.dismiss) private var dismiss
    
    var body: some View {
        NavigationView {
            VStack(spacing: 24) {
                Text("Quick Add")
                    .font(Theme.title)
                    .foregroundColor(.white)
                
                VStack(spacing: 16) {
                    QuickAddOption(icon: "camera.fill", title: "Take Photo", action: {})
                    QuickAddOption(icon: "fork.knife", title: "Log Food", action: {})
                    QuickAddOption(icon: "figure.walk", title: "Log Exercise", action: {})
                    QuickAddOption(icon: "drop.fill", title: "Log Water", action: {})
                    QuickAddOption(icon: "scalemass.fill", title: "Log Weight", action: {})
                }
                .padding()
                
                Spacer()
            }
            .frame(maxWidth: .infinity, maxHeight: .infinity)
            .background(Theme.backgroundGradient)
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Done") {
                        dismiss()
                    }
                    .foregroundColor(Theme.sky)
                }
            }
        }
        .presentationDetents([.medium])
    }
}

struct QuickAddOption: View {
    let icon: String
    let title: String
    let action: () -> Void
    
    var body: some View {
        Button(action: action) {
            HStack(spacing: 16) {
                Image(systemName: icon)
                    .font(.title2)
                    .foregroundColor(Theme.sky)
                    .frame(width: 32)
                
                Text(title)
                    .font(Theme.body)
                    .foregroundColor(.white)
                
                Spacer()
                
                Image(systemName: "chevron.right")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.6))
            }
            .padding()
            .background(Theme.cardBackground)
            .background(.ultraThinMaterial)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Theme.cardBorder)
            )
        }
    }
}
