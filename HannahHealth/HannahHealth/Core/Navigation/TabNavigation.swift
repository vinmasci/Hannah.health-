//
//  TabNavigation.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

enum Tab: String, CaseIterable {
    case dashboard = "dashboard"
    case chat = "chat" 
    case quickAdd = "quickAdd"
    case mealPlan = "mealPlan"
    case shopping = "shopping"
    
    var title: String {
        switch self {
        case .dashboard:
            return "Dashboard"
        case .chat:
            return "Chat"
        case .quickAdd:
            return ""
        case .mealPlan:
            return "Meal Plan"
        case .shopping:
            return "Shopping"
        }
    }
    
    var icon: String {
        switch self {
        case .dashboard:
            return "rectangle.3.group.fill"
        case .chat:
            return "message"
        case .quickAdd:
            return "plus"
        case .mealPlan:
            return "calendar"
        case .shopping:
            return "cart"
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
                    .foregroundColor(isSelected ? Theme.sky : .white.opacity(0.6))
                
                if !tab.title.isEmpty {
                    Text(tab.title)
                        .font(.system(size: 10, weight: .medium))
                        .foregroundColor(isSelected ? Theme.sky : .white.opacity(0.5))
                }
            }
        }
        .frame(maxWidth: .infinity)
    }
}

struct AddButton: View {
    @State private var showingQuickAdd = false
    
    var body: some View {
        Button {
            showingQuickAdd = true
        } label: {
            ZStack {
                // Main button circle - cleaner, smaller
                Circle()
                    .fill(LinearGradient(
                        colors: [Color(hex: "10B981"), Color(hex: "059669")], // Green gradient like reference
                        startPoint: .topLeading,
                        endPoint: .bottomTrailing
                    ))
                    .frame(width: 56, height: 56)
                    .shadow(color: .black.opacity(0.25), radius: 4, x: 0, y: 2)
                
                Image(systemName: "plus")
                    .font(.system(size: 24, weight: .semibold))
                    .foregroundColor(.white)
            }
        }
        .scaleEffect(showingQuickAdd ? 0.95 : 1.0)
        .animation(.spring(duration: 0.2), value: showingQuickAdd)
        .sheet(isPresented: $showingQuickAdd) {
            QuickAddModal()
        }
    }
}

struct CustomTabBar: View {
    @Binding var selectedTab: Tab
    
    var body: some View {
        ZStack {
            // Custom curved shape for tab bar
            TabBarShape()
                .fill(.ultraThinMaterial)
                .background(TabBarShape().fill(Theme.cardBackground))
                .overlay(
                    TabBarShape()
                        .stroke(Theme.cardBorder, lineWidth: 0.5),
                    alignment: .top
                )
                .frame(height: 75)
                .shadow(color: .black.opacity(0.1), radius: 8, x: 0, y: -3)
            
            // Tab buttons - moved up 5pt
            HStack(spacing: 0) {
                TabButton(icon: Tab.dashboard.icon, tab: .dashboard, selectedTab: $selectedTab)
                TabButton(icon: Tab.chat.icon, tab: .chat, selectedTab: $selectedTab)
                
                // Spacer for center button - smaller
                Color.clear
                    .frame(width: 70)
                
                TabButton(icon: Tab.mealPlan.icon, tab: .mealPlan, selectedTab: $selectedTab)
                TabButton(icon: Tab.shopping.icon, tab: .shopping, selectedTab: $selectedTab)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .offset(y: -5) // Move all icons up 5pt
            
            // Floating center + button - moved up 10pt
            AddButton()
                .offset(y: -15) // Moved up 10pt
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
