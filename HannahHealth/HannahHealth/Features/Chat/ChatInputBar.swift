//
//  ChatInputBar.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct ChatInputBar: View {
    @Binding var messageText: String
    @FocusState.Binding var isInputFocused: Bool
    let onSend: () -> Void
    let onCameraPressed: () -> Void
    @State private var isAnimating = false
    
    var body: some View {
        VStack(spacing: 0) {
            // Smart suggestions (placeholder for future)
            if false { // isInputFocused && !messageText.isEmpty
                SmartSuggestions()
            }
            
            // Main input bar
            HStack(spacing: 12) {
                // Camera button
                Button(action: onCameraPressed) {
                    Image(systemName: "camera.fill")
                        .font(.system(size: 22))
                        .foregroundColor(.white.opacity(0.7))
                }
                .padding(.leading, 4)
                
                // Text field container
                HStack(spacing: 8) {
                    TextField("Tell Hannah what you ate", text: $messageText)
                        .textFieldStyle(.plain)
                        .font(.system(size: 17))
                        .foregroundColor(.white)
                        .accentColor(Theme.sky)
                        .focused($isInputFocused)
                        .submitLabel(.send)
                        .onSubmit {
                            if !messageText.isEmpty {
                                onSend()
                            }
                        }
                    
                    // Voice input button (placeholder for future)
                    if false {
                        Button(action: {}) {
                            Image(systemName: "mic.fill")
                                .font(.system(size: 18))
                                .foregroundColor(.white.opacity(0.6))
                        }
                    }
                }
                .padding(.horizontal, 16)
                .padding(.vertical, 12)
                .background(Theme.cardBackground)
                .background(.ultraThinMaterial)
                .cornerRadius(25)
                .overlay(
                    RoundedRectangle(cornerRadius: 25)
                        .stroke(Theme.cardBorder)
                )
                
                // Send button with animation
                Button(action: {
                    withAnimation(.spring(duration: 0.3)) {
                        isAnimating = true
                        onSend()
                    }
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                        isAnimating = false
                    }
                }) {
                    Image(systemName: "arrow.up.circle.fill")
                        .font(.system(size: 34))
                        .foregroundColor(messageText.isEmpty ? .white.opacity(0.3) : Theme.sky)
                        .scaleEffect(isAnimating ? 1.1 : 1.0)
                        .rotation3DEffect(
                            .degrees(isAnimating ? 360 : 0),
                            axis: (x: 0, y: 0, z: 1)
                        )
                }
                .disabled(messageText.isEmpty)
                .padding(.trailing, 4)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
        }
        .background(Theme.cardBackground)
        .background(.ultraThinMaterial)
        .overlay(
            Rectangle()
                .fill(Theme.cardBorder)
                .frame(height: 0.5),
            alignment: .top
        )
    }
}

// Placeholder for future smart suggestions feature
struct SmartSuggestions: View {
    private let suggestions = ["🥗 Salad", "🍳 Eggs", "🥑 Avocado", "🍎 Apple"]
    
    var body: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 8) {
                ForEach(suggestions, id: \.self) { suggestion in
                    Button(suggestion) {
                        // Handle suggestion tap
                    }
                    .font(.caption)
                    .foregroundColor(.white)
                    .padding(.horizontal, 12)
                    .padding(.vertical, 6)
                    .background(Theme.cardBackground)
                    .background(.ultraThinMaterial)
                    .cornerRadius(16)
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .stroke(Theme.cardBorder)
                    )
                }
            }
            .padding(.horizontal, 16)
        }
        .padding(.vertical, 8)
        .background(Theme.cardBackground.opacity(0.5))
    }
}