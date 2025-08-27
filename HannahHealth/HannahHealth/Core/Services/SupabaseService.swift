//
//  SupabaseService.swift
//  HannahHealth
//
//  Created on 27/8/2025.
//

import Foundation

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

struct FoodEntry: Codable {
    let id: String?
    let userId: String
    let foodName: String
    let calories: Int
    let protein: Double?
    let carbs: Double?
    let fat: Double?
    let confidence: Double
    let imageUrl: String?
    let createdAt: String?
    let mealType: String?
    
    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case foodName = "food_name"
        case calories
        case protein
        case carbs
        case fat
        case confidence
        case imageUrl = "image_url"
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
        guard let authToken = authToken else {
            throw NetworkError.unauthorized
        }
        
        let url = URL(string: "\(baseURL)/rest/v1/food_entries")!
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue(apiKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("return=minimal", forHTTPHeaderField: "Prefer")
        
        let encoder = JSONEncoder()
        request.httpBody = try encoder.encode(entry)
        
        let (_, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 201 else {
            throw NetworkError.serverError("Failed to save food entry")
        }
        
        print("✅ Food entry saved to Supabase")
    }
    
    func getFoodEntries(for date: Date) async throws -> [FoodEntry] {
        guard let authToken = authToken,
              let userId = currentUser?.id else {
            throw NetworkError.unauthorized
        }
        
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        let dateString = formatter.string(from: date)
        
        let startOfDay = "\(dateString)T00:00:00"
        let endOfDay = "\(dateString)T23:59:59"
        
        var components = URLComponents(string: "\(baseURL)/rest/v1/food_entries")!
        components.queryItems = [
            URLQueryItem(name: "user_id", value: "eq.\(userId)"),
            URLQueryItem(name: "created_at", value: "gte.\(startOfDay)"),
            URLQueryItem(name: "created_at", value: "lte.\(endOfDay)"),
            URLQueryItem(name: "order", value: "created_at.desc")
        ]
        
        var request = URLRequest(url: components.url!)
        request.httpMethod = "GET"
        request.setValue(apiKey, forHTTPHeaderField: "apikey")
        request.setValue("Bearer \(authToken)", forHTTPHeaderField: "Authorization")
        
        let (data, response) = try await URLSession.shared.data(for: request)
        
        guard let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200 else {
            throw NetworkError.serverError("Invalid response")
        }
        
        let entries = try JSONDecoder().decode([FoodEntry].self, from: data)
        return entries
    }
    
    func getWeeklyFoodEntries() async throws -> [FoodEntry] {
        guard let authToken = authToken,
              let userId = currentUser?.id else {
            throw NetworkError.unauthorized
        }
        
        let weekAgo = Date().addingTimeInterval(-7 * 24 * 60 * 60)
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd'T'HH:mm:ss"
        let weekAgoString = formatter.string(from: weekAgo)
        
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
            throw NetworkError.serverError("Invalid response")
        }
        
        let entries = try JSONDecoder().decode([FoodEntry].self, from: data)
        return entries
    }
}

