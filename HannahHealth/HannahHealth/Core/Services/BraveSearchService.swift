//
//  BraveSearchService.swift
//  HannahHealth
//
//  Created on 27/8/2025.
//

import Foundation

struct BraveSearchResponse: Codable {
    let web: WebResults?
    
    struct WebResults: Codable {
        let results: [SearchResult]
    }
    
    struct SearchResult: Codable {
        let title: String
        let url: String
        let description: String
        let extra_snippets: [String]?
        
        enum CodingKeys: String, CodingKey {
            case title, url, description
            case extra_snippets = "extra_snippets"
        }
    }
}

struct SearchContext {
    let context: String
    let domains: [String]
}

protocol BraveSearchServiceProtocol {
    func searchNutritionData(query: String) async throws -> SearchContext
    func shouldSearchForQuery(_ query: String) -> Bool
    func searchRestaurantMenu(restaurant: String, query: String?) async throws -> SearchContext
}

class BraveSearchService: BraveSearchServiceProtocol {
    private let networkService: NetworkServiceProtocol
    
    private let foodKeywords = [
        "recipe", "how to make", "how to cook", "cook", "bake", "prepare",
        "frittata", "pasta", "salad", "soup", "sandwich", "smoothie", "bowl",
        "breakfast", "lunch", "dinner", "snack", "meal", "dish", "food",
        "mcdonald", "mcdonalds", "big mac", "nugget", "fries", "burger",
        "coles", "woolworths", "kfc", "subway", "hungry jack",
        "calories", "nutrition", "protein", "carbs", "fat",
        "chicken", "beef", "fish", "salmon", "tuna", "eggs", "rice",
        "vegetables", "fruit", "bread", "cheese", "yogurt", "oats",
        "garlic", "butter", "steak", "pork", "turkey", "bacon",
        "pizza", "tacos", "curry", "stir fry", "roast", "grilled",
        "banana", "apple", "orange", "avocado", "coffee", "tea",
        "ate", "had", "eating", "drank", "drinking", "consumed"
    ]
    
    init(networkService: NetworkServiceProtocol = NetworkService.shared) {
        self.networkService = networkService
    }
    
    func shouldSearchForQuery(_ query: String) -> Bool {
        let lowercaseQuery = query.lowercased()
        
        // Always search for any query that might be food-related
        let shouldSearch = foodKeywords.contains { keyword in
            lowercaseQuery.contains(keyword)
        } || lowercaseQuery.contains("give me") ||
             lowercaseQuery.contains("find me") ||
             lowercaseQuery.contains("show me") ||
             lowercaseQuery.contains("i want") ||
             lowercaseQuery.contains("i need") ||
             lowercaseQuery.contains("how many") ||
             lowercaseQuery.contains("what") ||
             lowercaseQuery.contains("?") // Any question
        
        print("🔍 Should search for '\(query)'? \(shouldSearch)")
        return shouldSearch
    }
    
    func searchNutritionData(query: String) async throws -> SearchContext {
        guard !APIConfig.braveAPIKey.isEmpty && APIConfig.braveAPIKey != "YOUR_BRAVE_API_KEY" else {
            print("⚠️ Brave API key missing or invalid")
            throw NetworkError.apiKeyMissing
        }
        
        print("🔍 Searching Brave for: \(query)")
        
        // Adjust search query based on type
        let searchQuery: String
        let lowercaseQuery = query.lowercased()
        
        // Check if it's a restaurant query
        if lowercaseQuery.contains("mcdonald") || lowercaseQuery.contains("kfc") || 
           lowercaseQuery.contains("subway") || lowercaseQuery.contains("hungry jack") {
            searchQuery = "\(query) nutrition calories menu Australia"
        } else if lowercaseQuery.contains("calories") || lowercaseQuery.contains("how many") {
            searchQuery = "\(query) calories nutrition facts"
        } else if lowercaseQuery.contains("healthier") || lowercaseQuery.contains("substitute") {
            searchQuery = "\(query) healthy alternatives low calorie options"
        } else if lowercaseQuery.contains("recipe") || 
                  lowercaseQuery.contains("chicken") || 
                  lowercaseQuery.contains("garlic") {
            searchQuery = "\(query) recipe ingredients instructions cooking"
        } else {
            searchQuery = "\(query) calories nutrition facts"
        }
        
        guard var components = URLComponents(string: APIConfig.braveSearchURL) else {
            throw NetworkError.invalidURL
        }
        
        components.queryItems = [
            URLQueryItem(name: "q", value: searchQuery),
            URLQueryItem(name: "country", value: "AU"),
            URLQueryItem(name: "count", value: "5")
        ]
        
        guard let url = components.url else {
            throw NetworkError.invalidURL
        }
        
        let headers = [
            "Accept": "application/json",
            "X-Subscription-Token": APIConfig.braveAPIKey
        ]
        
        let response: BraveSearchResponse = try await networkService.request(
            url.absoluteString,
            method: "GET",
            headers: headers,
            body: nil
        )
        
        guard let results = response.web?.results else {
            print("⚠️ No search results found")
            return SearchContext(context: "", domains: [])
        }
        
        print("✅ Found \(results.count) search results")
        
        // Compile search results with clear URL marking
        let searchContext = results.map { result in
            """
            [REAL URL: \(result.url)]
            Title: \(result.title)
            \(result.description)
            \(result.extra_snippets?.first ?? "")
            """
        }.joined(separator: "\n\n---\n\n")
        
        // Extract domain names
        let domains = results.compactMap { result -> String? in
            guard let url = URL(string: result.url) else { return nil }
            return url.host
        }
        
        return SearchContext(context: searchContext, domains: domains)
    }
    
    func searchRestaurantMenu(restaurant: String, query: String? = nil) async throws -> SearchContext {
        guard APIConfig.braveAPIKey != "YOUR_BRAVE_API_KEY" else {
            throw NetworkError.apiKeyMissing
        }
        
        // Build search query for restaurant menus
        let searchQuery: String
        if let query = query {
            searchQuery = "\(restaurant) \(query) menu nutrition calories Australia"
        } else {
            searchQuery = "\(restaurant) menu healthy options low calorie nutrition Australia"
        }
        
        guard var components = URLComponents(string: APIConfig.braveSearchURL) else {
            throw NetworkError.invalidURL
        }
        
        components.queryItems = [
            URLQueryItem(name: "q", value: searchQuery),
            URLQueryItem(name: "country", value: "AU"),
            URLQueryItem(name: "count", value: "5")
        ]
        
        guard let url = components.url else {
            throw NetworkError.invalidURL
        }
        
        let headers = [
            "Accept": "application/json",
            "X-Subscription-Token": APIConfig.braveAPIKey
        ]
        
        let response: BraveSearchResponse = try await networkService.request(
            url.absoluteString,
            method: "GET",
            headers: headers,
            body: nil
        )
        
        guard let results = response.web?.results else {
            return SearchContext(context: "", domains: [])
        }
        
        // Compile search results with focus on menu items
        let searchContext = results.map { result in
            """
            [REAL URL: \(result.url)]
            Title: \(result.title)
            \(result.description)
            \(result.extra_snippets?.joined(separator: "\n") ?? "")
            """
        }.joined(separator: "\n\n---\n\n")
        
        // Extract domain names
        let domains = results.compactMap { result -> String? in
            guard let url = URL(string: result.url) else { return nil }
            return url.host
        }
        
        return SearchContext(context: searchContext, domains: domains)
    }
}