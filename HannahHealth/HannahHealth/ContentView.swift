//
//  ContentView.swift
//  HannahHealth
//
//  Created by Vincent Masci on 26/8/2025.
//

import SwiftUI

struct ContentView: View {
    @StateObject private var dashboardViewModel = DashboardViewModel()
    @State private var selectedTab: Tab = .dashboard
    @State private var showProfile = false
    @State private var showLogDrawer = false
    
    var body: some View {
        ZStack(alignment: .bottom) {
            // Dynamic time-based background
            DynamicTimeBackground()
                .ignoresSafeArea()
            
            // Main content based on selected tab
            Group {
                switch selectedTab {
                case .dashboard:
                    DashboardView(showProfile: $showProfile)
                        .environmentObject(dashboardViewModel)
                case .log:
                    // Log tab doesn't navigate, it opens a drawer
                    DashboardView(showProfile: $showProfile)
                        .environmentObject(dashboardViewModel)
                case .mealPlan:
                    MealPlanWrapperView()
                case .shopping:
                    ShoppingListWrapperView()
                case .aiCoach:
                    WorkingChatView()
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
        .fullScreenCover(isPresented: $showProfile) {
            UserProfileView()
        }
        .sheet(isPresented: $showLogDrawer) {
            QuickLogDrawer(selectedDate: dashboardViewModel.currentDate)
        }
        .onChange(of: selectedTab) { oldValue, newValue in
            if newValue == .log {
                showLogDrawer = true
                // Reset back to previous tab
                selectedTab = oldValue != .log ? oldValue : .dashboard
            }
        }
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