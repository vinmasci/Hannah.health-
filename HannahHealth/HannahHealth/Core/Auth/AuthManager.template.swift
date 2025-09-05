//
//  AuthManager.swift
//  HannahHealth
//
//  TEMPLATE FILE - Replace placeholder values with your actual keys
//  1. Copy this file to AuthManager.swift
//  2. Replace YOUR_SUPABASE_URL with your Supabase project URL
//  3. Replace YOUR_SUPABASE_ANON_KEY with your Supabase anon key
//

import Foundation
import Supabase

class AuthManager: ObservableObject {
    static let shared = AuthManager()
    
    // MARK: - Published Properties
    @Published var user: User?
    @Published var authState: AuthState = .loading
    @Published var subscriptionStatus: SubscriptionStatus = .none
    @Published var userProfile: UserProfile?
    
    // MARK: - Enums
    enum AuthState {
        case loading
        case authenticated
        case unauthenticated
    }
    
    enum SubscriptionStatus {
        case none
        case trial(daysLeft: Int)
        case active
        case expired
    }
    
    // MARK: - Private Properties
    private let supabase = SupabaseClient(
        supabaseURL: URL(string: "YOUR_SUPABASE_URL")!,
        supabaseKey: "YOUR_SUPABASE_ANON_KEY"
    )
    
    // MARK: - Initialization
    private init() {
        // Clear the skip flag if it exists
        UserDefaults.standard.removeObject(forKey: "skipAuth")
        
        checkAuthStatus()
        setupAuthListener()
    }
    
    // MARK: - Auth Methods
    
    /// Sign up with email and password
    func signUp(email: String, password: String) async throws {
        do {
            let response = try await supabase.auth.signUp(
                email: email,
                password: password
            )
            
            // Update UI on main thread
            await MainActor.run {
                self.user = response.user
                self.authState = .authenticated
            }
            
            // CREATE THE PROFILE RIGHT HERE - Email confirmation is disabled
            await createProfileIfNeeded(userId: response.user.id, email: email)
            
            await fetchUserProfile(userId: response.user.id)
            await checkSubscriptionStatus()
        } catch {
            print("Sign up error: \(error)")
            throw error
        }
    }
    
    /// Sign in with email and password
    func signIn(email: String, password: String) async throws {
        do {
            let response = try await supabase.auth.signIn(
                email: email,
                password: password
            )
            
            // Update UI on main thread
            await MainActor.run {
                self.user = response.user
                self.authState = .authenticated
            }
            
            // Try to create profile if it doesn't exist (first sign in after email confirmation)
            await createProfileIfNeeded(userId: response.user.id, email: email)
            
            await fetchUserProfile(userId: response.user.id)
            await checkSubscriptionStatus()
        } catch {
            print("Sign in error: \(error)")
            throw error
        }
    }
    
    /// Create profile if it doesn't exist
    private func createProfileIfNeeded(userId: UUID, email: String) async {
        // Check if profile exists first
        let existingProfile = try? await supabase
            .from("user_profiles")
            .select()
            .eq("id", value: userId.uuidString)
            .single()
            .execute()
        
        if existingProfile == nil {
            // Create profile
            do {
                try await supabase
                    .from("user_profiles")
                    .insert([
                        "id": userId.uuidString,
                        "email": email,
                        "full_name": "Friend",
                        "basal_metabolic_rate": "2200",
                        "daily_deficit_target": "500",
                        "tracking_mode": "full",
                        "subscription_tier": "free",
                        "activity_level": "moderately_active",
                        "phone_verified": "false",
                        "sms_enabled": "true",
                        "sms_message_count": "0"
                    ])
                    .execute()
                print("Profile created on sign in")
            } catch {
                print("Could not create profile: \(error)")
            }
        }
    }
    
    /// Sign in with magic link (passwordless)
    func signInWithMagicLink(email: String) async throws {
        do {
            try await supabase.auth.signInWithOTP(
                email: email,
                redirectTo: URL(string: "hannahhealth://auth-callback")
            )
        } catch {
            print("Magic link error: \(error)")
            throw error
        }
    }
    
    /// Sign out
    func signOut() async throws {
        do {
            try await supabase.auth.signOut()
            self.user = nil
            self.userProfile = nil
            self.authState = .unauthenticated
            self.subscriptionStatus = .none
        } catch {
            print("Sign out error: \(error)")
            throw error
        }
    }
    
    /// Check current auth status
    private func checkAuthStatus() {
        Task {
            do {
                let session = try await supabase.auth.session
                // Update UI on main thread
                await MainActor.run {
                    self.user = session.user
                    self.authState = .authenticated
                }
                await fetchUserProfile(userId: session.user.id)
                await checkSubscriptionStatus()
            } catch {
                print("Session check error: \(error)")
                await MainActor.run {
                    self.authState = .unauthenticated
                }
            }
        }
    }
    
    /// Setup auth state listener
    private func setupAuthListener() {
        Task {
            for await (event, session) in supabase.auth.authStateChanges {
                switch event {
                case .signedIn:
                    if let user = session?.user {
                        await MainActor.run {
                            self.user = user
                            self.authState = .authenticated
                        }
                        await fetchUserProfile(userId: user.id)
                        await checkSubscriptionStatus()
                    }
                    
                case .signedOut:
                    await MainActor.run {
                        self.user = nil
                        self.userProfile = nil
                        self.authState = .unauthenticated
                        self.subscriptionStatus = .none
                    }
                    
                case .tokenRefreshed:
                    print("Token refreshed")
                    
                default:
                    break
                }
            }
        }
    }
    
    // MARK: - Profile Methods
    
    /// Fetch user profile from database
    private func fetchUserProfile(userId: UUID) async {
        do {
            // Fetch raw data first
            let response = try await supabase
                .from("user_profiles")
                .select()
                .eq("id", value: userId.uuidString)
                .single()
                .execute()
            
            // Debug: Log the raw response
            print("📥 Raw profile data from database:")
            if let jsonString = String(data: response.data, encoding: .utf8) {
                print(jsonString)
            }
            
            // Use custom decoder with flexible date strategy
            let decoder = JSONDecoder()
            // Don't use convertFromSnakeCase since we have explicit CodingKeys
            decoder.dateDecodingStrategy = .custom { decoder in
                let container = try decoder.singleValueContainer()
                let dateString = try container.decode(String.self)
                
                // Try different date formats
                let formatters = [
                    "yyyy-MM-dd",           // For birth_date: "1986-01-01"
                    "yyyy-MM-dd'T'HH:mm:ss.SSSSSS", // For timestamps with microseconds
                    "yyyy-MM-dd'T'HH:mm:ss.SSSSSS'+00:00'", // With timezone
                    "yyyy-MM-dd'T'HH:mm:ss.SSSSSSX", // With timezone X
                    "yyyy-MM-dd'T'HH:mm:ss", // For timestamps without timezone
                    "yyyy-MM-dd'T'HH:mm:ssZ", // For timestamps with timezone
                    "yyyy-MM-dd'T'HH:mm:ss.SSSSSSZ" // For full ISO8601
                ].map { format -> DateFormatter in
                    let formatter = DateFormatter()
                    formatter.dateFormat = format
                    formatter.locale = Locale(identifier: "en_US_POSIX")
                    formatter.timeZone = TimeZone(secondsFromGMT: 0)
                    return formatter
                }
                
                for formatter in formatters {
                    if let date = formatter.date(from: dateString) {
                        return date
                    }
                }
                
                throw DecodingError.dataCorruptedError(in: container, debugDescription: "Invalid date format: \(dateString)")
            }
            
            let profile = try decoder.decode(UserProfile.self, from: response.data)
            
            print("✅ Profile decoded successfully:")
            print("  ID: \(profile.id)")
            print("  Email: \(profile.email)")
            print("  Name: \(profile.fullName ?? "nil")")
            print("  Weight: \(profile.weightKg ?? 0)")
            print("  Height: \(profile.heightCm ?? 0)")
            print("  Birth: \(profile.birthDate?.description ?? "nil")")
            
            await MainActor.run {
                self.userProfile = profile
                print("✅ Profile stored in AuthManager")
                
                // Notify that profile is updated
                NotificationCenter.default.post(name: NSNotification.Name("UserProfileUpdated"), object: nil)
            }
        } catch {
            print("❌ Error decoding profile: \(error)")
            // If profile doesn't exist, user state should be set properly
            await MainActor.run {
                self.userProfile = nil
                // Don't change auth state - they're still authenticated
                // but subscription check will handle the expired state
            }
        }
    }
    
    /// Refresh profile from database
    func refreshProfile() async {
        guard let userId = user?.id else { return }
        await fetchUserProfile(userId: userId)
    }
    
    /// Update user profile with specific fields
    func updateProfile(fullName: String? = nil,
                       birthYear: Int? = nil,
                       phoneNumber: String? = nil, 
                       weightKg: Double? = nil, 
                       heightCm: Double? = nil,
                       preferMetric: Bool? = nil) async throws {
        guard let userId = user?.id else { throw AuthError.notAuthenticated }
        
        // Build update dictionary with only provided values
        struct ProfileUpdate: Codable {
            let fullName: String?
            let birthDate: String? // Store as YYYY-01-01 for just year
            let phoneNumber: String?
            let weightKg: Double?
            let heightCm: Double?
            let activityLevel: String? // Temporarily using this for metric preference
            
            enum CodingKeys: String, CodingKey {
                case fullName = "full_name"
                case birthDate = "birth_date"
                case phoneNumber = "phone_number"
                case weightKg = "weight_kg"
                case heightCm = "height_cm"
                case activityLevel = "activity_level"
            }
        }
        
        // Convert birth year to date format
        var birthDate: String? = nil
        if let year = birthYear {
            birthDate = "\(year)-01-01"
        }
        
        // Use activity_level to store metric preference temporarily
        // TODO: Add proper prefer_metric field to database
        var activityLevel: String? = nil
        if let preferMetric = preferMetric {
            activityLevel = preferMetric ? "prefer_metric" : "moderately_active"
        }
        
        let update = ProfileUpdate(
            fullName: fullName,
            birthDate: birthDate,
            phoneNumber: phoneNumber,
            weightKg: weightKg,
            heightCm: heightCm,
            activityLevel: activityLevel
        )
        
        print("🔄 Updating profile in database...")
        print("  ID: \(userId.uuidString)")
        print("  Full Name: \(fullName ?? "nil")")
        print("  Birth Date: \(birthDate ?? "nil")")
        print("  Weight: \(weightKg ?? 0) kg")
        print("  Height: \(heightCm ?? 0) cm")
        
        let updateResponse = try await supabase
            .from("user_profiles")
            .update(update)
            .eq("id", value: userId.uuidString)
            .execute()
        
        print("✅ Database update response:")
        if let jsonString = String(data: updateResponse.data, encoding: .utf8) {
            print(jsonString)
        }
        
        await fetchUserProfile(userId: userId)
    }
    
    // MARK: - Subscription Methods
    
    /// Check subscription status
    private func checkSubscriptionStatus() async {
        // SIMPLIFIED: Everyone gets access for now
        await MainActor.run {
            self.subscriptionStatus = .active
        }
    }
    
    /// Check if user has access to app features
    var hasActiveAccess: Bool {
        switch subscriptionStatus {
        case .trial, .active:
            return true
        case .none, .expired:
            return false
        }
    }
}

// MARK: - Error Types
enum AuthError: LocalizedError {
    case notAuthenticated
    case invalidCredentials
    case networkError
    case unknown
    
    var errorDescription: String? {
        switch self {
        case .notAuthenticated:
            return "Please sign in to continue"
        case .invalidCredentials:
            return "Invalid email or password"
        case .networkError:
            return "Network error. Please try again"
        case .unknown:
            return "Something went wrong"
        }
    }
}

// MARK: - User Profile Model
struct UserProfile: Codable {
    let id: UUID
    let email: String
    let fullName: String?
    let phoneNumber: String?
    let phoneVerified: Bool?
    let smsEnabled: Bool?
    let birthDate: Date?
    let weightKg: Double?
    let heightCm: Double?
    let gender: String?
    let activityLevel: String?
    let basalMetabolicRate: Int?
    let dailyDeficitTarget: Int?
    let trackingMode: String?
    let subscriptionTier: String?
    let subscriptionStatus: String?
    let trialStartsAt: Date?
    let trialEndsAt: Date?
    let createdAt: Date?
    let updatedAt: Date?
    
    enum CodingKeys: String, CodingKey {
        case id
        case email
        case fullName = "full_name"
        case phoneNumber = "phone_number"
        case phoneVerified = "phone_verified"
        case smsEnabled = "sms_enabled"
        case birthDate = "birth_date"
        case weightKg = "weight_kg"
        case heightCm = "height_cm"
        case gender
        case activityLevel = "activity_level"
        case basalMetabolicRate = "basal_metabolic_rate"
        case dailyDeficitTarget = "daily_deficit_target"
        case trackingMode = "tracking_mode"
        case subscriptionTier = "subscription_tier"
        case subscriptionStatus = "subscription_status"
        case trialStartsAt = "trial_starts_at"
        case trialEndsAt = "trial_ends_at"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}