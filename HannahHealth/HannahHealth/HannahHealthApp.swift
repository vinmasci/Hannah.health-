//
//  HannahHealthApp.swift
//  HannahHealth
//
//  Created by Vincent Masci on 26/8/2025.
//

import SwiftUI

@main
struct HannahHealthApp: App {
    @StateObject private var authManager = AuthManager.shared
    
    var body: some Scene {
        WindowGroup {
            Group {
                switch authManager.authState {
                case .loading:
                    // Show splash screen while checking auth
                    SplashView()
                    
                case .unauthenticated:
                    // Show onboarding/login
                    OnboardingView()
                        .environmentObject(authManager)
                    
                case .authenticated:
                    // No paywall - just go straight to app
                    ContentView()
                        .environmentObject(authManager)
                }
            }
        }
    }
}
