//
//  APIConfig.template.swift
//  HannahHealth
//
//  IMPORTANT: This is a template file for API configuration.
//  
//  Setup Instructions:
//  1. Copy this file to APIConfig.swift in the same directory
//  2. Replace all placeholder values with your actual API keys
//  3. NEVER commit APIConfig.swift to version control
//  4. APIConfig.swift is already in .gitignore for your safety
//
//  Security Notes:
//  - For production, implement Keychain storage instead of hardcoded values
//  - Consider using environment variables or build configurations
//  - Rotate keys immediately if they are ever exposed
//

import Foundation

// Template for APIConfig - Copy this file to APIConfig.swift and uncomment the struct below
/* 
struct APIConfig {
    // MARK: - API Keys (Replace with your actual keys)
    
    /// OpenAI API Key
    /// Get your key from: https://platform.openai.com/api-keys
    static let openAIKey = "YOUR_OPENAI_API_KEY_HERE"
    
    /// Brave Search API Key  
    /// Get your key from: https://brave.com/search/api/
    static let braveKey = "YOUR_BRAVE_SEARCH_API_KEY_HERE"
    
    // MARK: - Supabase Configuration
    
    /// Supabase Project URL
    /// Found in: Project Settings > API > Project URL
    static let supabaseURL = "https://YOUR_PROJECT_ID.supabase.co"
    
    /// Supabase Anonymous Key
    /// Found in: Project Settings > API > Project API keys > anon public
    static let supabaseAnonKey = "YOUR_SUPABASE_ANON_KEY_HERE"
    
    // MARK: - Optional Services
    
    /// Add other API keys as needed
    // static let stripeKey = "YOUR_STRIPE_KEY_HERE"
    // static let firebaseKey = "YOUR_FIREBASE_KEY_HERE"
    
    // MARK: - Environment Configuration
    
    /// Current environment (debug/staging/production)
    #if DEBUG
    static let environment = "development"
    static let apiBaseURL = "http://localhost:3000"
    #else
    static let environment = "production"
    static let apiBaseURL = "https://api.hannahhealth.app"
    #endif
    
    // MARK: - Security Configuration
    
    /// Enable/disable debug logging of sensitive data
    static let enableSensitiveLogging = false
    
    /// API request timeout in seconds
    static let requestTimeout: TimeInterval = 30
    
    // MARK: - Validation
    
    /// Validates that API keys are configured
    /// Call this on app launch to ensure configuration is complete
    static func validate() throws {
        guard !openAIKey.contains("YOUR_") else {
            throw ConfigurationError.missingAPIKey("OpenAI API key not configured")
        }
        
        guard !braveKey.contains("YOUR_") else {
            throw ConfigurationError.missingAPIKey("Brave Search API key not configured")
        }
        
        guard !supabaseURL.contains("YOUR_") else {
            throw ConfigurationError.missingAPIKey("Supabase URL not configured")
        }
        
        guard !supabaseAnonKey.contains("YOUR_") else {
            throw ConfigurationError.missingAPIKey("Supabase Anon Key not configured")
        }
    }
}

// MARK: - Configuration Errors

enum ConfigurationError: LocalizedError {
    case missingAPIKey(String)
    
    var errorDescription: String? {
        switch self {
        case .missingAPIKey(let key):
            return "Configuration Error: \(key). Please copy APIConfig.template.swift to APIConfig.swift and add your API keys."
        }
    }
}

// MARK: - Secure Storage Recommendation

/*
 IMPORTANT: For production apps, implement secure storage:
 
 ```swift
 import Security
 
 class KeychainService {
     static func getAPIKey(for service: String) -> String? {
         // Implement Keychain retrieval here
         // See: https://developer.apple.com/documentation/security/keychain_services
     }
     
     static func setAPIKey(_ key: String, for service: String) {
         // Implement Keychain storage here
     }
 }
 
 // Then use like:
 static let openAIKey = KeychainService.getAPIKey(for: "OpenAI") ?? ""
 ```
 
 Alternative approaches:
 1. Use environment variables in build schemes
 2. Use a local configuration plist (add to .gitignore)
 3. Use a secure configuration service
 4. Use iOS App Configuration for managed devices
 */

// Close the comment block for the struct
*/