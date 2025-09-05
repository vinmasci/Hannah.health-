//
//  EnvironmentLoader.swift
//  Hannah Health
//
//  Loads environment variables from .env file or iOS Keychain
//

import Foundation

/// Manages environment variables and secure credential storage
class EnvironmentLoader {
    static let shared = EnvironmentLoader()
    
    private var environment: [String: String] = [:]
    
    private init() {
        loadEnvironment()
    }
    
    /// Load environment from .env file in development or Keychain in production
    private func loadEnvironment() {
        #if DEBUG
        // In development, load from .env file
        loadFromEnvFile()
        #else
        // In production, load from Keychain
        loadFromKeychain()
        #endif
    }
    
    /// Load variables from .env file  
    private func loadFromEnvFile() {
        // Try to load from Config.xcconfig file in bundle
        if let path = Bundle.main.path(forResource: "Config", ofType: "plist"),
           let config = NSDictionary(contentsOfFile: path) as? [String: String] {
            environment = config
            print("✅ Loaded \(environment.count) environment variables from Config.plist")
        } else {
            print("⚠️ Config.plist not found, using defaults")
            loadDefaults()
        }
    }
    
    /// Load from iOS Keychain (for production)
    private func loadFromKeychain() {
        // This would load from Keychain in production
        // For now, we'll use UserDefaults as a simple example
        if let openAIKey = UserDefaults.standard.string(forKey: "OPENAI_API_KEY") {
            environment["OPENAI_API_KEY"] = openAIKey
        }
        if let braveKey = UserDefaults.standard.string(forKey: "BRAVE_API_KEY") {
            environment["BRAVE_API_KEY"] = braveKey
        }
        if let supabaseURL = UserDefaults.standard.string(forKey: "SUPABASE_URL") {
            environment["SUPABASE_URL"] = supabaseURL
        }
        if let supabaseKey = UserDefaults.standard.string(forKey: "SUPABASE_ANON_KEY") {
            environment["SUPABASE_ANON_KEY"] = supabaseKey
        }
    }
    
    /// Load default/placeholder values
    private func loadDefaults() {
        environment = [
            "OPENAI_API_KEY": "YOUR_OPENAI_API_KEY",
            "BRAVE_API_KEY": "YOUR_BRAVE_API_KEY",
            "SUPABASE_URL": "https://YOUR_PROJECT.supabase.co",
            "SUPABASE_ANON_KEY": "YOUR_SUPABASE_ANON_KEY"
        ]
    }
    
    /// Get environment variable
    func get(_ key: String) -> String? {
        return environment[key]
    }
    
    /// Get required environment variable (crashes if missing)
    func getRequired(_ key: String) -> String {
        guard let value = environment[key], !value.isEmpty, !value.hasPrefix("YOUR_") else {
            fatalError("❌ Missing required environment variable: \(key)")
        }
        return value
    }
}

// MARK: - Convenience API Configuration
extension EnvironmentLoader {
    var openAIAPIKey: String {
        return getRequired("OPENAI_API_KEY")
    }
    
    var braveAPIKey: String {
        return getRequired("BRAVE_API_KEY")
    }
    
    var supabaseURL: String {
        return getRequired("SUPABASE_URL")
    }
    
    var supabaseAnonKey: String {
        return getRequired("SUPABASE_ANON_KEY")
    }
}