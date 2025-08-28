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
        guard let projectPath = Bundle.main.object(forInfoDictionaryKey: "PROJECT_DIR") as? String else {
            print("⚠️ PROJECT_DIR not set in Info.plist")
            loadDefaults()
            return
        }
        
        let envPath = "\(projectPath)/.env"
        
        do {
            let contents = try String(contentsOfFile: envPath, encoding: .utf8)
            let lines = contents.components(separatedBy: .newlines)
            
            for line in lines {
                // Skip comments and empty lines
                if line.hasPrefix("#") || line.trimmingCharacters(in: .whitespaces).isEmpty {
                    continue
                }
                
                // Parse KEY=VALUE
                let parts = line.split(separator: "=", maxSplits: 1)
                if parts.count == 2 {
                    let key = String(parts[0]).trimmingCharacters(in: .whitespaces)
                    let value = String(parts[1]).trimmingCharacters(in: .whitespaces)
                    environment[key] = value
                }
            }
            
            print("✅ Loaded \(environment.count) environment variables")
        } catch {
            print("⚠️ Could not load .env file: \(error)")
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