//
//  QuickChatViewModel.swift
//  HannahHealth
//
//  Lightweight view model for quick chat interactions
//

import Foundation
import SwiftUI

struct QuickMessage: Identifiable {
    let id = UUID()
    let content: String
    let isUser: Bool
}

@MainActor
final class QuickChatViewModel: ObservableObject {
    @Published var messages: [QuickMessage] = []
    @Published var isTyping = false
    @Published var shouldDismiss = false
    
    private var context: ChatContext = .dashboard
    private let hannahService = HannahService.shared
    
    func setContext(_ context: ChatContext) {
        self.context = context
        
        // Add welcome message based on context
        let welcome = getWelcomeMessage()
        messages = [QuickMessage(content: welcome, isUser: false)]
    }
    
    private func getWelcomeMessage() -> String {
        switch context {
        case .dashboard:
            return "What would you like to log? Just tell me what you ate! 🍎"
        case .mealPlan:
            return "Which meal would you like to edit? Or ask for recipe ideas! 🍽️"
        case .shopping:
            return "What should we add to your shopping list? 🛒"
        }
    }
    
    func sendMessage(_ text: String) async {
        // Add user message to chat
        messages.append(QuickMessage(content: text, isUser: true))
        
        // Show typing
        isTyping = true
        
        do {
            // Create context-aware prompt
            let prompt = """
            \(context.systemPrompt)
            
            User message: \(text)
            
            If the user is logging food, provide a brief confirmation with estimated calories.
            If they're asking for suggestions, give 2-3 concise options.
            Keep responses under 50 words.
            """
            
            // Get Hannah's response
            let response = try await hannahService.processMessage(prompt)
            
            // Stop typing
            isTyping = false
            
            // Add Hannah's response
            messages.append(QuickMessage(content: response, isUser: false))
            
            // Don't auto-dismiss - let user close manually
            
        } catch {
            isTyping = false
            messages.append(QuickMessage(
                content: "Sorry, I had trouble with that. Could you try again?",
                isUser: false
            ))
        }
    }
    
    private func shouldAutoDismiss(response: String, userMessage: String) -> Bool {
        let response = response.lowercased()
        let userMsg = userMessage.lowercased()
        
        // Auto-dismiss if action was completed
        let actionPhrases = [
            "logged", "added", "recorded", "saved",
            "done", "all set", "got it", "updated"
        ]
        
        // Check if user was logging something and Hannah confirmed
        let isLogging = userMsg.contains("ate") || userMsg.contains("had") || 
                       userMsg.contains("log") || userMsg.contains("add")
        
        let hasConfirmation = actionPhrases.contains { response.contains($0) }
        
        return isLogging && hasConfirmation
    }
}