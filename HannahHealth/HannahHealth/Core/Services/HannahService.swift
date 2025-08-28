//
//  HannahService.swift
//  HannahHealth
//
//  Simplified service for Hannah AI interactions
//

import Foundation

@MainActor
final class HannahService {
    static let shared = HannahService()
    private let openAI: OpenAIService
    
    private init() {
        self.openAI = OpenAIService()
    }
    
    func processMessage(_ prompt: String) async throws -> String {
        // For now, return a simple response
        // TODO: Integrate with OpenAIService properly
        try await Task.sleep(nanoseconds: 1_000_000_000) // 1 second delay to simulate API
        
        // Simple mock responses based on context
        if prompt.lowercased().contains("log") || prompt.lowercased().contains("ate") {
            return "Got it! I've logged that for you. That's approximately 450 calories. You're doing great today! 💪"
        } else if prompt.lowercased().contains("recipe") || prompt.lowercased().contains("suggest") {
            return "Here are some healthy options: Grilled chicken salad (350 cal), Quinoa bowl with veggies (400 cal), or a Turkey wrap (380 cal). Which sounds good?"
        } else if prompt.lowercased().contains("add") || prompt.lowercased().contains("shopping") {
            return "Added to your shopping list! Anything else you need?"
        } else {
            return "I can help you log food, suggest meals, or update your shopping list. What would you like to do?"
        }
    }
    
    func analyzeFood(from text: String) async throws -> (food: String, calories: Int, confidence: Double) {
        let prompt = """
        Analyze this food description and provide:
        1. What food it is
        2. Estimated calories
        3. Your confidence (0-1)
        
        Food: \(text)
        
        Respond in format: "food|calories|confidence"
        Example: "Cheeseburger|550|0.85"
        """
        
        let response = try await processMessage(prompt)
        let parts = response.split(separator: "|")
        
        guard parts.count == 3,
              let calories = Int(parts[1].trimmingCharacters(in: .whitespaces)),
              let confidence = Double(parts[2].trimmingCharacters(in: .whitespaces)) else {
            throw HannahError.invalidResponse
        }
        
        return (
            food: String(parts[0]).trimmingCharacters(in: .whitespaces),
            calories: calories,
            confidence: confidence
        )
    }
}

enum HannahError: LocalizedError {
    case invalidResponse
    case networkError
    
    var errorDescription: String? {
        switch self {
        case .invalidResponse:
            return "I couldn't understand that. Could you try again?"
        case .networkError:
            return "Having trouble connecting. Please try again."
        }
    }
}