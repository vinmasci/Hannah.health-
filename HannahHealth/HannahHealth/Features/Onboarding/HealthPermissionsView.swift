//
//  HealthPermissionsView.swift
//  HannahHealth
//
//  Health permissions onboarding screen
//

import SwiftUI
import HealthKit

struct HealthPermissionsView: View {
    @EnvironmentObject var authManager: AuthManager
    @State private var healthKitAuthorized = false
    @State private var isCheckingPermissions = false
    @State private var showingManualInstructions = false
    @Binding var onboardingComplete: Bool
    
    private let healthStore = HKHealthStore()
    
    var body: some View {
        VStack(spacing: 24) {
            Spacer()
            
            // Icon
            Image(systemName: "heart.text.square.fill")
                .font(.system(size: 80))
                .foregroundColor(Theme.coral)
                .padding(.bottom, 16)
            
            // Title
            Text("Connect Apple Health")
                .font(.largeTitle)
                .fontWeight(.bold)
                .foregroundColor(.white)
            
            // Subtitle
            Text("Hannah needs access to Active Energy to accurately track your calorie burn throughout the day")
                .font(.body)
                .foregroundColor(.white.opacity(0.8))
                .multilineTextAlignment(.center)
                .padding(.horizontal, 32)
            
            // What we access
            VStack(alignment: .leading, spacing: 16) {
                PermissionRow(
                    icon: "flame.fill",
                    title: "Active Energy",
                    description: "Track calories burned from all activities"
                )
                
                PermissionRow(
                    icon: "figure.walk",
                    title: "Steps (Optional)",
                    description: "Monitor daily movement patterns"
                )
                
                PermissionRow(
                    icon: "scalemass.fill",
                    title: "Weight (Optional)",
                    description: "Track progress over time"
                )
            }
            .padding(20)
            .background(Color.white.opacity(0.1))
            .cornerRadius(16)
            .padding(.horizontal, 20)
            
            Spacer()
            
            // Action buttons
            VStack(spacing: 12) {
                Button(action: requestHealthKitPermission) {
                    HStack {
                        if isCheckingPermissions {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: Color(hex: "1a1a2e")))
                                .scaleEffect(0.8)
                        } else {
                            Image(systemName: "heart.fill")
                        }
                        Text(isCheckingPermissions ? "Connecting..." : "Connect Apple Health")
                    }
                    .font(.headline)
                    .foregroundColor(Color(hex: "1a1a2e"))
                    .frame(maxWidth: .infinity)
                    .padding()
                    .background(Theme.emerald)
                    .cornerRadius(12)
                }
                .disabled(isCheckingPermissions)
                
                Button(action: { showingManualInstructions = true }) {
                    Text("Having trouble?")
                        .font(.footnote)
                        .foregroundColor(.white.opacity(0.6))
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 40)
        }
        .background(
            LinearGradient(
                colors: [
                    Color(hex: "1a1a2e"),
                    Color(hex: "0f0f1e")
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
        )
        .sheet(isPresented: $showingManualInstructions) {
            ManualHealthInstructionsView()
        }
    }
    
    private func requestHealthKitPermission() {
        guard HKHealthStore.isHealthDataAvailable() else {
            // Health data not available on this device
            showingManualInstructions = true
            return
        }
        
        isCheckingPermissions = true
        
        let typesToRead: Set<HKObjectType> = [
            HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
            HKObjectType.quantityType(forIdentifier: .stepCount)!,
            HKObjectType.quantityType(forIdentifier: .bodyMass)!,
            HKObjectType.workoutType()
        ]
        
        healthStore.requestAuthorization(toShare: nil, read: typesToRead) { success, error in
            DispatchQueue.main.async {
                isCheckingPermissions = false
                
                if success {
                    // Check if Active Energy is actually authorized
                    let activeEnergyType = HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!
                    let status = healthStore.authorizationStatus(for: activeEnergyType)
                    
                    if status == .sharingAuthorized {
                        healthKitAuthorized = true
                        onboardingComplete = true
                    } else {
                        // User didn't grant Active Energy permission
                        showingManualInstructions = true
                    }
                } else {
                    showingManualInstructions = true
                }
            }
        }
    }
}

struct PermissionRow: View {
    let icon: String
    let title: String
    let description: String
    
    var body: some View {
        HStack(alignment: .center, spacing: 16) {
            Image(systemName: icon)
                .font(.title2)
                .foregroundColor(Theme.emerald)
                .frame(width: 32)
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                    .foregroundColor(.white)
                
                Text(description)
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.7))
            }
            
            Spacer()
        }
    }
}

struct ManualHealthInstructionsView: View {
    @Environment(\.dismiss) var dismiss
    
    var body: some View {
        NavigationView {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    Text("Enable Active Energy Tracking")
                        .font(.largeTitle)
                        .fontWeight(.bold)
                        .padding(.bottom, 8)
                    
                    Text("Active Energy tracking is essential for Hannah to accurately calculate your calorie burn. Here's how to enable it:")
                        .font(.body)
                        .foregroundColor(.secondary)
                    
                    VStack(alignment: .leading, spacing: 16) {
                        InstructionStep(
                            number: 1,
                            title: "Open Settings",
                            description: "Go to your iPhone's Settings app"
                        )
                        
                        InstructionStep(
                            number: 2,
                            title: "Privacy & Security",
                            description: "Tap on Privacy & Security"
                        )
                        
                        InstructionStep(
                            number: 3,
                            title: "Health",
                            description: "Select Health from the list"
                        )
                        
                        InstructionStep(
                            number: 4,
                            title: "Hannah Health",
                            description: "Find and tap on Hannah Health"
                        )
                        
                        InstructionStep(
                            number: 5,
                            title: "Turn on Active Energy",
                            description: "Make sure Active Energy Burned is toggled ON"
                        )
                    }
                    
                    Text("Why is this important?")
                        .font(.headline)
                        .padding(.top, 20)
                    
                    Text("Active Energy includes all calories burned from movement throughout your day - walking, exercising, even fidgeting. Without it, Hannah can't accurately track your total daily energy expenditure (TDEE), which is crucial for reaching your health goals.")
                        .font(.body)
                        .foregroundColor(.secondary)
                    
                    Button(action: {
                        if let url = URL(string: UIApplication.openSettingsURLString) {
                            UIApplication.shared.open(url)
                        }
                    }) {
                        HStack {
                            Image(systemName: "gear")
                            Text("Open Settings")
                        }
                        .font(.headline)
                        .foregroundColor(.white)
                        .frame(maxWidth: .infinity)
                        .padding()
                        .background(Theme.coral)
                        .cornerRadius(12)
                    }
                    .padding(.top, 20)
                }
                .padding()
            }
            .navigationBarItems(trailing: Button("Done") { dismiss() })
        }
    }
}

struct InstructionStep: View {
    let number: Int
    let title: String
    let description: String
    
    var body: some View {
        HStack(alignment: .top, spacing: 16) {
            Text("\(number)")
                .font(.headline)
                .foregroundColor(.white)
                .frame(width: 32, height: 32)
                .background(Theme.coral)
                .clipShape(Circle())
            
            VStack(alignment: .leading, spacing: 4) {
                Text(title)
                    .font(.headline)
                
                Text(description)
                    .font(.body)
                    .foregroundColor(.secondary)
            }
            
            Spacer()
        }
    }
}

#Preview {
    HealthPermissionsView(onboardingComplete: .constant(false))
        .environmentObject(AuthManager())
}