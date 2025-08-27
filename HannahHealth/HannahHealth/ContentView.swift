//
//  ContentView.swift
//  HannahHealth
//
//  Created by Vincent Masci on 26/8/2025.
//

import SwiftUI

struct ContentView: View {
    @State private var selectedTab: Tab = .dashboard
    
    var body: some View {
        ZStack(alignment: .bottom) {
            // Dynamic time-based background
            // Automatically transitions through sunrise, midday, sunset, and midnight colors
            // Your beloved OG midnight colors are preserved from 11pm-5am!
            DynamicTimeBackground()
                .ignoresSafeArea()
            
            // Main content based on selected tab
            Group {
                switch selectedTab {
                case .dashboard:
                    DashboardView()
                case .chat:
                    WorkingChatView()
                case .quickAdd:
                    // Quick add is handled by the modal
                    DashboardView()
                case .mealPlan:
                    MealPlanWrapperView()
                case .shopping:
                    ShoppingListWrapperView()
                }
            }
            .transition(.asymmetric(
                insertion: .push(from: .trailing),
                removal: .push(from: .leading)
            ))
            .animation(.spring(duration: 0.3), value: selectedTab)
            
            // Custom Tab Bar
            CustomTabBar(selectedTab: $selectedTab)
                .ignoresSafeArea(.keyboard)
        }
        .ignoresSafeArea(.all, edges: .bottom)
    }
}

// Wrapper views to maintain existing functionality
struct MealPlanWrapperView: View {
    var body: some View {
        MealPlanView()
    }
}

struct ShoppingListWrapperView: View {
    var body: some View {
        ShoppingListView()
    }
}

#Preview {
    ContentView()
}