//
//  OnboardingView.swift
//  HannahHealth
//
//  Created on 28/8/2025.
//  Handles user signup and login flow
//

import SwiftUI

struct OnboardingView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var currentPage = 0
    @State private var showSignUp = false
    
    var body: some View {
        ZStack {
            // Background
            LinearGradient(
                colors: [
                    Color(hex: "1a1a2e"),
                    Color(hex: "0f0f1e")
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()
            
            if !showSignUp {
                // Welcome screens
                WelcomeScreens(showSignUp: $showSignUp)
                    .environmentObject(authManager)
            } else {
                // Sign up flow
                SignUpView()
                    .environmentObject(authManager)
            }
        }
    }
}

// MARK: - Welcome Screens
struct WelcomeScreens: View {
    @Binding var showSignUp: Bool
    @State private var currentPage = 0
    @EnvironmentObject var authManager: AuthManager
    
    let pages = [
        WelcomePage(
            icon: "message.fill",
            title: "Text Your Meals Like a Friend",
            subtitle: "Just SMS \"had scrambled eggs for breakfast\" and you're done. No menus, no searching, no hassle."
        ),
        WelcomePage(
            icon: "camera.fill",
            title: "Life Gets Messy",
            subtitle: "Use your own assistant to help make informed choices. Screenshot a restaurant menu and ask for the best option for you."
        ),
        WelcomePage(
            icon: "heart.fill",
            title: "More Than Weight Loss",
            subtitle: "This isn't just about calories. Turn them off and use journal mode to focus on habits and how food makes you feel."
        )
    ]
    
    var body: some View {
        VStack(spacing: 0) {
            // Pages
            TabView(selection: $currentPage) {
                ForEach(0..<pages.count, id: \.self) { index in
                    WelcomePageView(page: pages[index])
                        .tag(index)
                }
            }
            .tabViewStyle(PageTabViewStyle(indexDisplayMode: .never))
            
            // Custom page indicators
            HStack(spacing: 8) {
                ForEach(0..<pages.count, id: \.self) { index in
                    Circle()
                        .fill(currentPage == index ? Theme.emerald : Color.white.opacity(0.3))
                        .frame(width: 8, height: 8)
                        .animation(.easeInOut, value: currentPage)
                }
            }
            .padding(.bottom, 20)
            
            // Get Started button
            Button(action: {
                showSignUp = true
            }) {
                Text(currentPage == pages.count - 1 ? "Get Started" : "Next")
                    .font(.headline)
                    .foregroundColor(Color(hex: "1a1a2e"))
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Theme.emerald)
                    .cornerRadius(12)
            }
            .padding(.horizontal, 20)
            
            // TEMPORARY: Skip button for development
            Button(action: {
                // Skip authentication for testing
                UserDefaults.standard.set(true, forKey: "skipAuth")
                // Force the auth state to authenticated
                authManager.authState = .authenticated
                authManager.subscriptionStatus = .active
            }) {
                Text("Skip (Dev Mode)")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.5))
                    .padding(.vertical, 8)
            }
            .padding(.bottom, 30)
        }
    }
}

// MARK: - Welcome Page Model
struct WelcomePage {
    let icon: String
    let title: String
    let subtitle: String
}

// MARK: - Welcome Page View
struct WelcomePageView: View {
    let page: WelcomePage
    
    var body: some View {
        VStack(spacing: 30) {
            Spacer()
            
            Image(systemName: page.icon)
                .font(.system(size: 80))
                .foregroundColor(Theme.emerald)
            
            VStack(spacing: 12) {
                Text(page.title)
                    .font(.title)
                    .fontWeight(.bold)
                    .foregroundColor(.white)
                    .multilineTextAlignment(.center)
                
                Text(page.subtitle)
                    .font(.body)
                    .foregroundColor(.white.opacity(0.8))
                    .multilineTextAlignment(.center)
                    .padding(.horizontal, 40)
            }
            
            Spacer()
            Spacer()
        }
    }
}

// MARK: - Sign Up View
struct SignUpView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var email = ""
    @State private var password = ""
    @State private var confirmPassword = ""
    @State private var isSignUp = true
    @State private var showError = false
    @State private var errorMessage = ""
    @State private var isLoading = false
    
    var body: some View {
        VStack(spacing: 20) {
            // Back button
            HStack {
                Button(action: {
                    // Go back logic
                }) {
                    Image(systemName: "chevron.left")
                        .foregroundColor(.white)
                        .font(.title2)
                }
                Spacer()
            }
            .padding(.horizontal)
            
            // Logo
            Image(systemName: "heart.fill")
                .font(.system(size: 60))
                .foregroundColor(Theme.emerald)
                .padding(.top, 40)
            
            Text(isSignUp ? "Create Account" : "Welcome Back")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            VStack(spacing: 4) {
                Text(isSignUp ? "7-day free trial" : "Sign in to continue")
                    .font(.headline)
                    .foregroundColor(.white.opacity(0.9))
                
                if isSignUp {
                    VStack(spacing: 2) {
                        Text("No commitments required")
                            .font(.caption)
                            .foregroundColor(Theme.emerald)
                        Text("No payment details now - just try it and sign up if you like it")
                            .font(Theme.caption2)
                            .foregroundColor(.white.opacity(0.7))
                            .multilineTextAlignment(.center)
                    }
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Theme.emerald.opacity(0.2))
                    .cornerRadius(12)
                }
            }
            
            // Email field
            VStack(alignment: .leading, spacing: 8) {
                Text("Email")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.8))
                
                TextField("your@email.com", text: $email)
                    .textFieldStyle(CustomTextFieldStyle())
                    .autocapitalization(.none)
                    .keyboardType(.emailAddress)
            }
            .padding(.horizontal)
            
            // Password field
            VStack(alignment: .leading, spacing: 8) {
                Text("Password")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.8))
                
                SecureField("Enter password", text: $password)
                    .textFieldStyle(CustomTextFieldStyle())
            }
            .padding(.horizontal)
            
            // Confirm password (sign up only)
            if isSignUp {
                VStack(alignment: .leading, spacing: 8) {
                    Text("Confirm Password")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    
                    SecureField("Confirm password", text: $confirmPassword)
                        .textFieldStyle(CustomTextFieldStyle())
                }
                .padding(.horizontal)
            }
            
            // Error message
            if showError {
                Text(errorMessage)
                    .font(.caption)
                    .foregroundColor(Theme.coral)
                    .padding(.horizontal)
            }
            
            // Submit button
            Button(action: handleSubmit) {
                if isLoading {
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: Color(hex: "1a1a2e")))
                } else {
                    Text(isSignUp ? "Start Free Trial" : "Sign In")
                        .fontWeight(.semibold)
                }
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Theme.emerald)
            .foregroundColor(Color(hex: "1a1a2e"))
            .cornerRadius(12)
            .padding(.horizontal)
            .disabled(isLoading)
            
            // Toggle sign up/sign in
            Button(action: {
                isSignUp.toggle()
                showError = false
            }) {
                Text(isSignUp ? "Already have an account? Sign in" : "Don't have an account? Sign up")
                    .font(.footnote)
                    .foregroundColor(.white.opacity(0.8))
            }
            .padding(.top, 10)
            
            Spacer()
        }
        .padding(.top, 40)
    }
    
    private func handleSubmit() {
        // Validation
        guard !email.isEmpty else {
            showError(message: "Please enter your email")
            return
        }
        
        guard !password.isEmpty else {
            showError(message: "Please enter a password")
            return
        }
        
        if isSignUp {
            guard password == confirmPassword else {
                showError(message: "Passwords don't match")
                return
            }
            
            guard password.count >= 6 else {
                showError(message: "Password must be at least 6 characters")
                return
            }
        }
        
        // Submit
        isLoading = true
        showError = false
        
        Task {
            do {
                if isSignUp {
                    try await authManager.signUp(email: email, password: password)
                } else {
                    try await authManager.signIn(email: email, password: password)
                }
            } catch {
                await MainActor.run {
                    showError(message: error.localizedDescription)
                    isLoading = false
                }
            }
        }
    }
    
    private func showError(message: String) {
        errorMessage = message
        showError = true
    }
}

// MARK: - Custom Text Field Style
struct CustomTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding()
            .background(Color.white.opacity(0.1))
            .cornerRadius(8)
            .foregroundColor(.white)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
            )
    }
}

#Preview {
    OnboardingView()
        .environmentObject(AuthManager.shared)
}