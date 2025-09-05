//
//  UserProfileViewModel.swift
//  HannahHealth
//
//  ViewModel for user profile management
//

import SwiftUI
import Combine

@MainActor
final class UserProfileViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var displayName = ""
    @Published var birthYear = ""
    @Published var heightFeet = ""
    @Published var heightInches = ""
    @Published var heightCm = ""
    @Published var useMetricHeight = false
    @Published var weightLbs = ""
    @Published var weightKg = ""
    @Published var useMetricWeight = false
    @Published var preferMetric = false
    @Published var phoneNumber = ""
    @Published var countryCode = "+1" // Default to US
    @Published var safeMode = false
    @Published var isSaving = false
    @Published var showSignOutAlert = false
    @Published var hasChanges = false
    @Published var showCountryPicker = false
    
    // MARK: - Dependencies
    private let authManager: AuthManager
    
    // MARK: - Init
    init(authManager: AuthManager = AuthManager.shared) {
        self.authManager = authManager
        loadUserProfile()
    }
    
    // MARK: - Public Methods
    func loadUserProfile() {
        // Load from user profile if available
        guard let profile = authManager.userProfile else { return }
        
        // Only update if we have a value from the database
        if let name = profile.fullName, !name.isEmpty {
            displayName = name
        }
        
        // Parse birth year from birth_date if available
        if let birthDate = profile.birthDate {
            let calendar = Calendar.current
            let year = calendar.component(.year, from: birthDate)
            birthYear = "\(year)"
        }
        
        // Load phone number and extract country code
        if let phone = profile.phoneNumber, !phone.isEmpty {
            let (code, number) = PhoneNumberFormatter.extractCountryCode(from: phone)
            countryCode = code
            phoneNumber = number
        }
        
        // Load preference for metric units (stored in activity_level temporarily)
        // TODO: Add proper prefer_metric field to database
        preferMetric = (profile.activityLevel == "prefer_metric")
        useMetricHeight = preferMetric
        useMetricWeight = preferMetric
        
        // Parse height from height_cm if available
        if let heightCmValue = profile.heightCm {
            self.heightCm = "\(Int(heightCmValue))"
            let totalInches = Int(heightCmValue / 2.54)
            heightFeet = "\(totalInches / 12)"
            heightInches = "\(totalInches % 12)"
        }
        
        // Parse weight if available
        if let weightKgValue = profile.weightKg {
            self.weightKg = String(format: "%.1f", weightKgValue)
            let lbs = weightKgValue * 2.20462
            self.weightLbs = String(format: "%.1f", lbs)
        }
        
        // Load safe mode preference (will need to add this to profile)
        // safeMode = profile.trackingMode == "ed_safe"
    }
    
    func saveProfile() async {
        isSaving = true
        defer { isSaving = false }
        
        // Parse birth year
        let birthYearInt = Int(birthYear)
        
        // Calculate height in cm
        var heightCmValue: Double? = nil
        if useMetricHeight {
            heightCmValue = Double(heightCm)
        } else {
            if let feet = Double(heightFeet), let inches = Double(heightInches) {
                let totalInches = feet * 12 + inches
                heightCmValue = totalInches * 2.54
            }
        }
        
        // Calculate weight in kg
        var weightKgValue: Double? = nil
        if useMetricWeight {
            weightKgValue = Double(weightKg)
        } else {
            if let lbs = Double(weightLbs) {
                weightKgValue = lbs / 2.20462
            }
        }
        
        // Format phone with country code
        let fullPhone = phoneNumber.isEmpty ? nil : "\(countryCode) \(phoneNumber)"
        
        // Update profile
        do {
            try await authManager.updateProfile(
                fullName: displayName.isEmpty ? nil : displayName,
                birthYear: birthYearInt,
                phoneNumber: fullPhone,
                weightKg: weightKgValue,
                heightCm: heightCmValue,
                preferMetric: preferMetric
            )
            hasChanges = false
        } catch {
            print("Error saving profile: \(error)")
        }
    }
    
    func signOut() {
        Task {
            do {
                try await authManager.signOut()
            } catch {
                print("Sign out error: \(error)")
            }
        }
    }
    
    func formatPhoneNumber(_ newValue: String) -> String {
        PhoneNumberFormatter.format(newValue, countryCode: countryCode)
    }
    
    func handleMetricPreferenceChange(_ newValue: Bool) {
        hasChanges = true
        // Update the toggles when preference changes
        useMetricHeight = newValue
        useMetricWeight = newValue
    }
    
    // MARK: - Computed Properties
    var userEmail: String {
        authManager.user?.email ?? ""
    }
    
    var profileDisplayName: String {
        displayName.isEmpty ? "Friend" : displayName
    }
}