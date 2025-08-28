//
//  ContentView.swift
//  HannahHealth
//
//  Created by Vincent Masci on 26/8/2025.
//

import SwiftUI

struct ContentView: View {
    @State private var selectedTab: Tab = .dashboard
    @State private var showQuickChat = false
    
    // Compute context based on current tab
    private var chatContext: ChatContext {
        switch selectedTab {
        case .dashboard:
            return .dashboard
        case .mealPlan:
            return .mealPlan
        case .shopping:
            return .shopping
        default:
            return .dashboard
        }
    }
    
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
            CustomTabBar(selectedTab: $selectedTab, showQuickChat: $showQuickChat)
                .ignoresSafeArea(.keyboard)
            
            // Quick Chat Drawer
            if showQuickChat {
                Color.black.opacity(0.3)
                    .ignoresSafeArea()
                    .onTapGesture {
                        showQuickChat = false
                    }
                
                VStack {
                    Spacer()
                    QuickChatDrawer(isPresented: $showQuickChat, context: chatContext)
                }
                .ignoresSafeArea(.keyboard)
            }
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