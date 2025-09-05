//
//  UserProfileView.swift
//  HannahHealth
//
//  User profile page with basic info and sign out
//

import SwiftUI

struct UserProfileView: View {
    @EnvironmentObject var authManager: AuthManager
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel = UserProfileViewModel()
    
    var body: some View {
        ZStack {
            // Dynamic time-based background (same as dashboard)
            DynamicTimeBackground()
                .ignoresSafeArea()
                .onTapGesture {
                    // Dismiss keyboard when tapping outside
                    UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                }
            
            VStack {
                // Top bar with close button
                ProfileNavigationBar(dismiss: dismiss, hasChanges: viewModel.hasChanges, onSave: {
                    Task {
                        await viewModel.saveProfile()
                    }
                })
                
                ScrollView {
                    VStack(spacing: 24) {
                        // Profile header
                        ProfileHeader(viewModel: viewModel)
                        
                        // Profile form fields
                        ProfileFormFields(viewModel: viewModel)
                            .padding(.horizontal)
                        
                        // Action buttons
                        ProfileActionButtons(viewModel: viewModel)
                            .padding(.horizontal)
                            .padding(.bottom, 40)
                    }
                }
            }
        }
        .sheet(isPresented: $viewModel.showCountryPicker) {
            CountryPickerView(
                countryCode: $viewModel.countryCode,
                hasChanges: $viewModel.hasChanges
            )
        }
        .alert("Sign Out", isPresented: $viewModel.showSignOutAlert) {
            Button("Cancel", role: .cancel) {}
            Button("Sign Out", role: .destructive) {
                viewModel.signOut()
                dismiss()
            }
        } message: {
            Text("Are you sure you want to sign out?")
        }
        .onAppear {
            viewModel.loadUserProfile()
        }
    }
}

// MARK: - Navigation Bar
struct ProfileNavigationBar: View {
    let dismiss: DismissAction
    let hasChanges: Bool
    let onSave: () -> Void
    
    var body: some View {
        HStack {
            Button(action: { dismiss() }) {
                Image(systemName: "xmark")
                    .font(.title3)
                    .foregroundColor(.white.opacity(0.8))
                    .frame(width: 44, height: 44)
                    .background(Theme.glassMorphism)
                    .clipShape(Circle())
            }
            
            Spacer()
            
            Text("Profile")
                .font(.headline)
                .foregroundColor(.white)
            
            Spacer()
            
            // Save button if there are changes
            if hasChanges {
                Button("Save") {
                    onSave()
                }
                .font(.body.weight(.medium))
                .foregroundColor(Theme.emerald)
                .frame(width: 44, height: 44)
            } else {
                // Invisible spacer for balance
                Color.clear
                    .frame(width: 44, height: 44)
            }
        }
        .padding(.horizontal)
        .padding(.top, 10)
    }
}

// MARK: - Action Buttons
struct ProfileActionButtons: View {
    @ObservedObject var viewModel: UserProfileViewModel
    
    var body: some View {
        VStack(spacing: 16) {
            // Save button
            if viewModel.hasChanges {
                Button {
                    Task {
                        await viewModel.saveProfile()
                    }
                } label: {
                    HStack {
                        if viewModel.isSaving {
                            ProgressView()
                                .progressViewStyle(CircularProgressViewStyle(tint: .white))
                                .scaleEffect(0.8)
                        } else {
                            Text("Save Changes")
                                .fontWeight(.medium)
                        }
                    }
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Theme.emerald)
                    .foregroundColor(.white)
                    .cornerRadius(12)
                }
                .disabled(viewModel.isSaving)
            }
            
            // Sign out button
            Button {
                viewModel.showSignOutAlert = true
            } label: {
                Text("Sign Out")
                    .fontWeight(.medium)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Color.red.opacity(0.15))
                    .foregroundColor(.red)
                    .cornerRadius(12)
                    .overlay(
                        RoundedRectangle(cornerRadius: 12)
                            .stroke(Color.red.opacity(0.3), lineWidth: 1)
                    )
            }
        }
    }
}

#Preview {
    UserProfileView()
        .environmentObject(AuthManager.shared)
}