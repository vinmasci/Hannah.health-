//
//  ChatMessage.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import Foundation

struct ChatMessage: Identifiable, Codable {
    let id: UUID
    let text: String
    let isUser: Bool
    let timestamp: Date
    let confidence: Double?
    let imageData: Data?
    
    var content: String {
        return text
    }
    
    init(
        id: UUID = UUID(),
        text: String,
        isUser: Bool,
        confidence: Double? = nil,
        imageData: Data? = nil,
        timestamp: Date = Date()
    ) {
        self.id = id
        self.text = text
        self.isUser = isUser
        self.confidence = confidence
        self.imageData = imageData
        self.timestamp = timestamp
    }
}