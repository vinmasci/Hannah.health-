//
//  SupabaseService.swift
//  HannahHealth
//
//  Created on 27/8/2025.
//

import Foundation
import Supabase

// MARK: - Models

struct SupabaseUser: Codable {
    let id: String
    let email: String?
    let createdAt: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case email
        case createdAt = "created_at"
    }
}

struct WeightLog: Codable, Identifiable {
    var id: String { internalId ?? UUID().uuidString }
    private let internalId: String?
    let userId: String
    let weightKg: Double
    let weightLbs: Double?
    let bodyFatPercentage: Double?
    let muscleMassKg: Double?
    let notes: String?
    let loggedVia: String?
    let measuredAt: String?
    let createdAt: String?
    
    enum CodingKeys: String, CodingKey {
        case internalId = "id"
        case userId = "user_id"
        case weightKg = "weight_kg"
        case weightLbs = "weight_lbs"
        case bodyFatPercentage = "body_fat_percentage"
        case muscleMassKg = "muscle_mass_kg"
        case notes
        case loggedVia = "logged_via"
        case measuredAt = "measured_at"
        case createdAt = "created_at"
    }
}

struct FoodEntry: Codable, Identifiable {
    var id: String { internalId ?? UUID().uuidString }
    private let internalId: String?
    let userId: String
    let foodName: String
    let calories: Int
    let protein: Double?
    let carbs: Double?
    let fat: Double?
    let fiber: Double?
    let sugar: Double?
    let sodium: Double?
    let confidence: Double?
    let confidenceSource: String?
    let portionSize: String?
    let brand: String?
    let restaurant: String?
    let imageUrl: String?
    let notes: String?
    let loggedVia: String?
    let createdAt: String?
    let mealType: String?
    
    init(id: String? = nil, userId: String, foodName: String, calories: Int, 
         protein: Double? = nil, carbs: Double? = nil, fat: Double? = nil,
         fiber: Double? = nil, sugar: Double? = nil, sodium: Double? = nil,
         confidence: Double? = nil, confidenceSource: String? = nil,
         portionSize: String? = nil, brand: String? = nil, restaurant: String? = nil,
         imageUrl: String? = nil, notes: String? = nil, loggedVia: String? = nil,
         createdAt: String? = nil, mealType: String? = nil) {
        self.internalId = id
        self.userId = userId
        self.foodName = foodName
        self.calories = calories
        self.protein = protein
        self.carbs = carbs
        self.fat = fat
        self.fiber = fiber
        self.sugar = sugar
        self.sodium = sodium
        self.confidence = confidence
        self.confidenceSource = confidenceSource
        self.portionSize = portionSize
        self.brand = brand
        self.restaurant = restaurant
        self.imageUrl = imageUrl
        self.notes = notes
        self.loggedVia = loggedVia
        self.createdAt = createdAt
        self.mealType = mealType
    }
    
    enum CodingKeys: String, CodingKey {
        case internalId = "id"
        case userId = "user_id"
        case foodName = "food_name"
        case calories
        case protein
        case carbs
        case fat
        case fiber
        case sugar
        case sodium
        case confidence
        case confidenceSource = "confidence_source"
        case portionSize = "portion_size"
        case brand
        case restaurant
        case imageUrl = "image_url"
        case notes
        case loggedVia = "logged_via"
        case createdAt = "created_at"
        case mealType = "meal_type"
    }
}

struct AuthResponse: Codable {
    let accessToken: String
    let user: SupabaseUser
    
    enum CodingKeys: String, CodingKey {
        case accessToken = "access_token"
        case user
    }
}

// MARK: - Service Protocol

protocol SupabaseServiceProtocol {
    func signInWithEmail(_ email: String, password: String) async throws -> SupabaseUser
    func signUp(_ email: String, password: String) async throws -> SupabaseUser
    func signOut() async throws
    func getCurrentUser() -> SupabaseUser?
    func saveFoodEntry(_ entry: FoodEntry) async throws
    func getFoodEntries(for date: Date) async throws -> [FoodEntry]
    func getWeeklyFoodEntries() async throws -> [FoodEntry]
}

// MARK: - Service Implementation

class SupabaseService: SupabaseServiceProtocol {
    static let shared = SupabaseService()
    
    private let baseURL = APIConfig.supabaseURL
    private let apiKey = APIConfig.supabaseAnonKey
    private var currentUser: SupabaseUser?
    private var authToken: String?
    
    // Reference to AuthManager's Supabase client
    private let supabaseClient = SupabaseClient(
        supabaseURL: URL(string: "https://phnvrqzqhuigmvuxfktf.supabase.co")!,
        supabaseKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBobnZycXpxaHVpZ212dXhma3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTg2NDEsImV4cCI6MjA3MTgzNDY0MX0.ZJC01hu8APXgm9HMOGDOQr89SS64Vd2M_R8IouHgJvw"
    )
    
    private init() {}
    
    // MARK: - Authentication
    
    func signInWithEmail(_ email: String, password: String) async throws -> SupabaseUser {
        let url = URL(string: "\(baseURL)/auth/v1/token?grant_type=password")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(apiKey, forHTTPHeaderField: "apikey")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = [
            "email": email,
            "password": password
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw NetworkError.serverError("Invalid response")
        }
        
        let authResponse = try JSONDecoder().decode(AuthResponse.self, from: data)
        self.authToken = authResponse.accessToken
        self.currentUser = authResponse.user
        
        return authResponse.user
    }
    
    func signUp(_ email: String, password: String) async throws -> SupabaseUser {
        let url = URL(string: "\(baseURL)/auth/v1/signup")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(apiKey, forHTTPHeaderField: "apikey")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        let body = [
            "email": email,
            "password": password
        ]
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw NetworkError.serverError("Invalid response")
        }
        
        let authResponse = try JSONDecoder().decode(AuthResponse.self, from: data)
        self.authToken = authResponse.accessToken
        self.currentUser = authResponse.user
        
        return authResponse.user
    }
    
    func signOut() async throws {
        authToken = nil
        currentUser = nil
        // Clear any cached data
    }
    
    func getCurrentUser() -> SupabaseUser? {
        return currentUser
    }
    
    // MARK: - Food Entries
    
    func saveFoodEntry(_ entry: FoodEntry) async throws {
        // Get auth token from the Supabase client session
        let session = try await supabaseClient.auth.session
        let authToken = session.accessToken
        
        let url = URL(string: "\(baseURL)/rest/v1/food_entries")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(apiKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("return=minimal", forHTTPHeaderField: "Prefer")
        
        let encoder = JSONEncoder()
        request.httpBody = try encoder.encode(entry)
        
        // Debug: Log the JSON being sent
        if let jsonData = request.httpBody,
           let jsonString = String(data: jsonData, encoding: .utf8) {
            print("📤 Sending to Supabase: \(jsonString)")
        }
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.serverError("Invalid response")
        }
        
        // Handle both 201 (created) and 204 (no content) as success
        if httpResponse.statusCode == 201 || httpResponse.statusCode == 204 {
            print("✅ Food entry saved to Supabase")
        } else {
            // Log the error for debugging
            if let errorBody = String(data: data, encoding: .utf8) {
                print("❌ Supabase error (\(httpResponse.statusCode)): \(errorBody)")
            }
            throw NetworkError.serverError("Failed to save food entry (status: \(httpResponse.statusCode))")
        }
    }
    
    func getFoodEntries(for date: Date) async throws -> [FoodEntry] {
        // Get auth token from the Supabase client session
        let session = try await supabaseClient.auth.session
        let authToken = session.accessToken
        let userId = session.user.id.uuidString
        
        // Get the user's local calendar and timezone
        let calendar = Calendar.current
        let timeZone = TimeZone.current
        
        // Get start and end of day in user's local timezone
        let startOfDayLocal = calendar.startOfDay(for: date)
        var components = DateComponents()
        components.day = 1
        components.second = -1
        let endOfDayLocal = calendar.date(byAdding: components, to: startOfDayLocal)!
        
        // Convert to UTC for database query
        let formatter = ISO8601DateFormatter()
        formatter.timeZone = TimeZone(identifier: "UTC")
        let startOfDayUTC = formatter.string(from: startOfDayLocal)
        let endOfDayUTC = formatter.string(from: endOfDayLocal)
        
        // Remove the 'Z' suffix if present for Supabase compatibility
        let startOfDay = startOfDayUTC.replacingOccurrences(of: "Z", with: "")
        let endOfDay = endOfDayUTC.replacingOccurrences(of: "Z", with: "")
        
        print("🔍 Querying food entries for user: \(userId)")
        print("🔍 Local date: \(date) in timezone: \(timeZone.identifier)")
        print("🔍 UTC date range: \(startOfDay) to \(endOfDay)")
        
        // Build query - Supabase allows duplicate parameters, they're AND'ed
        let queryString = "?user_id=eq.\(userId)&created_at=gte.\(startOfDay)&created_at=lte.\(endOfDay)&order=created_at.desc&select=*"
        let urlString = "\(baseURL)/rest/v1/food_entries\(queryString)"
        
        guard let url = URL(string: urlString) else {
            throw NetworkError.invalidURL
        }
        
        print("📡 Full query URL: \(urlString)")
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue(apiKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            print("❌ HTTP Error: \((response as? HTTPURLResponse)?.statusCode ?? -1)")
            throw NetworkError.serverError("Invalid response")
        }
        
        // Debug: Log raw response
        if let jsonString = String(data: data, encoding: .utf8) {
            print("📦 Raw food entries response: \(jsonString)")
        }
        
        let entries = try JSONDecoder().decode([FoodEntry].self, from: data)
        print("✅ Decoded \(entries.count) food entries")
        return entries
    }
    
    func getTodaysFoodEntries() async throws -> [FoodEntry] {
        return try await getFoodEntries(for: Date())
    }
    
    func getWeeklyFoodEntries() async throws -> [FoodEntry] {
        // Get auth token from the Supabase client session
        let session = try await supabaseClient.auth.session
        let authToken = session.accessToken
        let userId = session.user.id.uuidString
        
        // Get the user's local calendar and timezone
        let calendar = Calendar.current
        let today = Date()
        
        // Get start of day 7 days ago in user's local timezone
        guard let weekAgo = calendar.date(byAdding: .day, value: -7, to: today) else {
            throw NetworkError.serverError("Failed to calculate week ago date")
        }
        let startOfWeekAgo = calendar.startOfDay(for: weekAgo)
        
        // Convert to UTC for database query
        let formatter = ISO8601DateFormatter()
        formatter.timeZone = TimeZone(identifier: "UTC")
        let weekAgoUTC = formatter.string(from: startOfWeekAgo)
        
        // Remove the 'Z' suffix if present for Supabase compatibility
        let weekAgoString = weekAgoUTC.replacingOccurrences(of: "Z", with: "")
        
        var components = URLComponents(string: "\(baseURL)/rest/v1/food_entries")!
        components.queryItems = [
            URLQueryItem(name: "user_id", value: "eq.\(userId)"),
            URLQueryItem(name: "created_at", value: "gte.\(weekAgoString)"),
            URLQueryItem(name: "order", value: "created_at.desc")
        ]
        
        var request = URLRequest(url: components.url!)
        request.httpMethod = "GET"
        request.setValue(apiKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            print("❌ HTTP Error: \((response as? HTTPURLResponse)?.statusCode ?? -1)")
            throw NetworkError.serverError("Invalid response")
        }
        
        // Debug: Log raw response
        if let jsonString = String(data: data, encoding: .utf8) {
            print("📦 Raw food entries response: \(jsonString)")
        }
        
        let entries = try JSONDecoder().decode([FoodEntry].self, from: data)
        print("✅ Decoded \(entries.count) food entries")
        return entries
    }
    
    func deleteFoodEntry(_ entryId: String) async throws {
        // Get auth token from the Supabase client session
        let session = try await supabaseClient.auth.session
        let authToken = session.accessToken
        let userId = session.user.id.uuidString
        
        // Build URL for deleting the specific entry
        var components = URLComponents(string: "\(baseURL)/rest/v1/food_entries")!
        components.queryItems = [
            URLQueryItem(name: "id", value: "eq.\(entryId)"),
            URLQueryItem(name: "user_id", value: "eq.\(userId)")  // Ensure user can only delete their own entries
        ]
        
        var request = URLRequest(url: components.url!)
        request.httpMethod = "DELETE"
        request.setValue(apiKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              (200...299).contains(httpResponse.statusCode) else {
            print("❌ Failed to delete food entry: \((response as? HTTPURLResponse)?.statusCode ?? -1)")
            throw NetworkError.serverError("Failed to delete food entry")
        }
        
        print("✅ Successfully deleted food entry: \(entryId)")
        
        // Post notification to update UI
        NotificationCenter.default.post(
            name: NSNotification.Name("FoodDeleted"),
            object: nil,
            userInfo: ["entryId": entryId]
        )
    }
    
    // MARK: - Weight Tracking
    
    func logWeight(weightKg: Double, notes: String? = nil) async throws {
        // Get auth token from the Supabase client session
        let session = try await supabaseClient.auth.session
        let authToken = session.accessToken
        let userId = session.user.id.uuidString
        
        let url = URL(string: "\(baseURL)/rest/v1/weight_logs")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(apiKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("return=minimal", forHTTPHeaderField: "Prefer")
        
        let weightLog = [
            "user_id": userId,
            "weight_kg": weightKg,
            "notes": notes ?? "",
            "logged_via": "app"
        ] as [String : Any]
        
        request.httpBody = try JSONSerialization.data(withJSONObject: weightLog)
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse else {
            throw NetworkError.serverError("Invalid response")
        }
        
        if httpResponse.statusCode == 201 || httpResponse.statusCode == 204 {
            print("✅ Weight logged successfully: \(weightKg)kg")
            
            // Post notification to update UI
            NotificationCenter.default.post(
                name: NSNotification.Name("WeightLogged"),
                object: nil,
                userInfo: ["weight": weightKg]
            )
        } else {
            if let errorBody = String(data: data, encoding: .utf8) {
                print("❌ Supabase error (\(httpResponse.statusCode)): \(errorBody)")
            }
            throw NetworkError.serverError("Failed to log weight (status: \(httpResponse.statusCode))")
        }
    }
    
    func getLatestWeight() async throws -> WeightLog? {
        let session = try await supabaseClient.auth.session
        let authToken = session.accessToken
        let userId = session.user.id.uuidString
        
        let queryString = "?user_id=eq.\(userId)&order=measured_at.desc&limit=1"
        let url = URL(string: "\(baseURL)/rest/v1/weight_logs\(queryString)")!
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue(apiKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw NetworkError.serverError("Invalid response")
        }
        
        let logs = try JSONDecoder().decode([WeightLog].self, from: data)
        return logs.first
    }
    
    func getWeightHistory(days: Int = 30) async throws -> [WeightLog] {
        let session = try await supabaseClient.auth.session
        let authToken = session.accessToken
        let userId = session.user.id.uuidString
        
        let startDate = Date().addingTimeInterval(-Double(days) * 24 * 60 * 60)
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        formatter.timeZone = TimeZone(identifier: "UTC")
        let startDateString = formatter.string(from: startDate)
        
        let queryString = "?user_id=eq.\(userId)&measured_at=gte.\(startDateString)&order=measured_at.desc"
        let url = URL(string: "\(baseURL)/rest/v1/weight_logs\(queryString)")!
        
        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue(apiKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw NetworkError.serverError("Invalid response")
        }
        
        let logs = try JSONDecoder().decode([WeightLog].self, from: data)
        print("✅ Retrieved \(logs.count) weight logs")
        return logs
    }
}

