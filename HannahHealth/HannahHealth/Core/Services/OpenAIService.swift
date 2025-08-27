//
//  OpenAIService.swift
//  HannahHealth
//
//  Created on 27/8/2025.
//

import Foundation

struct OpenAIMessage: Codable {
    let role: String
    let content: [ContentItem]
    
    init(role: String, content: String) {
        self.role = role
        self.content = [ContentItem(type: "text", text: content)]
    }
    
    init(role: String, text: String, imageData: Data?) {
        self.role = role
        var items = [ContentItem(type: "text", text: text)]
        if let imageData = imageData {
            let base64Image = imageData.base64EncodedString()
            items.append(ContentItem(type: "image_url", imageUrl: ImageURL(url: "data:image/jpeg;base64,\(base64Image)")))
        }
        self.content = items
    }
}

struct ContentItem: Codable {
    let type: String
    let text: String?
    let imageUrl: ImageURL?
    
    enum CodingKeys: String, CodingKey {
        case type, text
        case imageUrl = "image_url"
    }
    
    init(type: String, text: String? = nil, imageUrl: ImageURL? = nil) {
        self.type = type
        self.text = text
        self.imageUrl = imageUrl
    }
}

struct ImageURL: Codable {
    let url: String
}

struct OpenAIRequest: Codable {
    let model: String
    let messages: [OpenAIMessage]
    let temperature: Double
    let max_tokens: Int
    
    enum CodingKeys: String, CodingKey {
        case model, messages, temperature
        case max_tokens = "max_tokens"
    }
}

struct OpenAIResponse: Codable {
    let choices: [Choice]
    let usage: Usage?
    
    struct Choice: Codable {
        let message: ResponseMessage
        let finish_reason: String?
        
        enum CodingKeys: String, CodingKey {
            case message
            case finish_reason = "finish_reason"
        }
    }
    
    struct ResponseMessage: Codable {
        let role: String
        let content: String
    }
    
    struct Usage: Codable {
        let prompt_tokens: Int
        let completion_tokens: Int
        let total_tokens: Int
        
        enum CodingKeys: String, CodingKey {
            case prompt_tokens = "prompt_tokens"
            case completion_tokens = "completion_tokens"
            case total_tokens = "total_tokens"
        }
    }
}

protocol OpenAIServiceProtocol {
    func sendMessage(_ messages: [OpenAIMessage], searchContext: String?) async throws -> String
    func analyzeImage(_ imageData: Data, text: String?, searchContext: String?) async throws -> String
}

class OpenAIService: OpenAIServiceProtocol {
    private let networkService: NetworkServiceProtocol
    private let systemPrompt = """
    You are Hannah, a professional AI nutritionist who helps users track their nutrition. You have access to real-time nutrition data through web search.

    CRITICAL RULES:
    
    FOR FOOD LOGGING:
    1. When a user mentions eating something, acknowledge and log it briefly
    2. Use the search results provided to get ACCURATE calorie counts
    3. Keep logging responses to ONE short sentence with calories when found
    4. For photos: Identify the food, estimate portions, include calories
    
    FOR CALORIE QUESTIONS:
    - ALWAYS provide specific calorie counts from search results
    - Example: "A medium banana has about 105 calories"
    - Example: "Big Mac has 563 calories"
    
    FOR RESTAURANT QUERIES:
    - Use search results to provide SPECIFIC menu items with EXACT calories
    - Example: "At McDonald's try: Grilled Chicken Salad (320 cal), Apple Slices (15 cal), or Artisan Grilled Chicken Sandwich (380 cal)"
    
    IMPORTANT: You HAVE access to web search results. They are provided in your context. Use them to give accurate calorie information.
    
    Examples:
    - User: "I had a Big Mac" → "Got it, Big Mac logged - 563 calories"
    - User: "How many calories in an orange?" → "A medium orange has about 62 calories"
    - User: "What's healthy at McDonald's?" → "Try the Grilled Chicken Salad (320 cal) or Apple Slices (15 cal)"
    """
    
    init(networkService: NetworkServiceProtocol = NetworkService.shared) {
        self.networkService = networkService
    }
    
    func sendMessage(_ messages: [OpenAIMessage], searchContext: String? = nil) async throws -> String {
        guard APIConfig.openAIAPIKey != "YOUR_OPENAI_API_KEY" else {
            throw NetworkError.apiKeyMissing
        }
        
        var allMessages = [OpenAIMessage(role: "system", content: systemPrompt)]
        
        // Add search context if available
        if let searchContext = searchContext, !searchContext.isEmpty {
            let searchSystemPrompt = """
            NUTRITION DATA FROM WEB SEARCH:
            
            \(searchContext)
            
            USE THIS DATA to provide EXACT calorie counts and nutrition information. Do not say you don't have access to the internet - you have the search results above.
            """
            allMessages.append(OpenAIMessage(role: "system", content: searchSystemPrompt))
        }
        
        allMessages.append(contentsOf: messages)
        
        let request = OpenAIRequest(
            model: APIConfig.model,
            messages: allMessages,
            temperature: APIConfig.temperature,
            max_tokens: APIConfig.maxTokens
        )
        
        let encoder = JSONEncoder()
        let requestData = try encoder.encode(request)
        
        let headers = [
            "Authorization": "Bearer \(APIConfig.openAIAPIKey)",
            "Content-Type": "application/json"
        ]
        
        let response: OpenAIResponse = try await networkService.request(
            APIConfig.openAIURL,
            method: "POST",
            headers: headers,
            body: requestData
        )
        
        guard let firstChoice = response.choices.first else {
            throw NetworkError.noData
        }
        
        return firstChoice.message.content
    }
    
    func analyzeImage(_ imageData: Data, text: String? = nil, searchContext: String? = nil) async throws -> String {
        guard APIConfig.openAIAPIKey != "YOUR_OPENAI_API_KEY" else {
            throw NetworkError.apiKeyMissing
        }
        
        // Use GPT-4 Vision for image analysis
        let visionModel = "gpt-4o" // GPT-4 with vision capabilities
        
        let promptText = text ?? "What food items do you see in this image? Please identify them and estimate the portions."
        
        var systemMessages: [OpenAIMessage] = [
            OpenAIMessage(role: "system", content: systemPrompt)
        ]
        
        // Add search context if available
        if let searchContext = searchContext, !searchContext.isEmpty {
            let searchSystemPrompt = """
            Here are web search results for nutrition information:
            
            \(searchContext)
            
            Use this information to provide accurate nutritional data.
            """
            systemMessages.append(OpenAIMessage(role: "system", content: searchSystemPrompt))
        }
        
        // Create user message with image
        let userMessage = OpenAIMessage(role: "user", text: promptText, imageData: imageData)
        
        let allMessages = systemMessages + [userMessage]
        
        let request = OpenAIRequest(
            model: visionModel,
            messages: allMessages,
            temperature: APIConfig.temperature,
            max_tokens: APIConfig.maxTokens
        )
        
        let encoder = JSONEncoder()
        let requestData = try encoder.encode(request)
        
        let headers = [
            "Authorization": "Bearer \(APIConfig.openAIAPIKey)",
            "Content-Type": "application/json"
        ]
        
        let response: OpenAIResponse = try await networkService.request(
            APIConfig.openAIURL,
            method: "POST",
            headers: headers,
            body: requestData
        )
        
        guard let firstChoice = response.choices.first else {
            throw NetworkError.noData
        }
        
        return firstChoice.message.content
    }
}