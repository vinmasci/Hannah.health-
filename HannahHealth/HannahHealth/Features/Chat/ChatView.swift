//
//  ChatView.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct ChatView: View {
    @StateObject private var viewModel = ChatViewModel()
    @State private var messageText = ""
    @FocusState private var isInputFocused: Bool
    
    var body: some View {
        GeometryReader { geometry in
            VStack(spacing: 0) {
                // Clean header like ChatGPT
                ChatGPTHeader()
                
                // Messages area
                ScrollViewReader { scrollProxy in
                    ScrollView {
                        VStack(spacing: 16) {
                            // Top padding
                            Color.clear.frame(height: 20)
                            
                            ForEach(viewModel.messages) { message in
                                ChatGPTMessage(message: message)
                                    .id(message.id)
                                    .padding(.horizontal, 20)
                            }
                            
                            // Typing indicator
                            if viewModel.isTyping {
                                ChatGPTTypingIndicator()
                                    .padding(.horizontal, 20)
                            }
                            
                            // Bottom padding for input bar and tab bar
                            Color.clear.frame(height: 200)
                        }
                    }
                    .background(Color(hex: "202123"))
                    .onTapGesture {
                        isInputFocused = false
                    }
                    .onChange(of: viewModel.messages.count) { _ in
                        withAnimation(.easeOut(duration: 0.3)) {
                            scrollProxy.scrollTo(viewModel.messages.last?.id, anchor: .bottom)
                        }
                    }
                }
                
                // Input bar INSIDE the VStack - guaranteed visible
                ChatGPTInputBar(
                    messageText: $messageText,
                    isInputFocused: $isInputFocused,
                    onSend: {
                        if !messageText.isEmpty {
                            viewModel.sendMessage(messageText)
                            messageText = ""
                        }
                    }
                )
                
                // Tab bar spacer
                if !isInputFocused {
                    Color(hex: "202123")
                        .frame(height: 75)
                }
            }
            .background(Color(hex: "202123"))
        }
        .navigationBarHidden(true)
        .edgesIgnoringSafeArea(.bottom)
    }
}

struct ChatGPTHeader: View {
    var body: some View {
        HStack {
            Button {
                // Menu action
            } label: {
                Image(systemName: "sidebar.left")
                    .font(.system(size: 18))
                    .foregroundColor(Color(hex: "ECECEC"))
            }
            
            Spacer()
            
            Text("Hannah")
                .font(.system(size: 17, weight: .semibold))
                .foregroundColor(Color(hex: "ECECEC"))
            
            Spacer()
            
            Button {
                // New chat action
            } label: {
                Image(systemName: "square.and.pencil")
                    .font(.system(size: 18))
                    .foregroundColor(Color(hex: "ECECEC"))
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 14)
        .background(Color(hex: "202123"))
        .overlay(
            Rectangle()
                .fill(Color.white.opacity(0.1))
                .frame(height: 0.5),
            alignment: .bottom
        )
    }
}

struct ChatGPTTypingIndicator: View {
    @State private var animateDots = false
    
    var body: some View {
        HStack {
            HStack(spacing: 8) {
                // Hannah avatar
                Circle()
                    .fill(Color(hex: "10A37F"))
                    .frame(width: 30, height: 30)
                    .overlay(
                        Text("H")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                    )
                
                // Simple typing dots
                HStack(spacing: 3) {
                    ForEach(0..<3) { index in
                        Circle()
                            .fill(Color(hex: "ECECEC").opacity(0.6))
                            .frame(width: 8, height: 8)
                            .scaleEffect(animateDots ? 1.0 : 0.5)
                            .animation(
                                .easeInOut(duration: 0.6)
                                .repeatForever()
                                .delay(Double(index) * 0.15),
                                value: animateDots
                            )
                    }
                }
            }
            
            Spacer()
        }
        .onAppear {
            animateDots = true
        }
    }
}

// ChatGPT-style message bubble
struct ChatGPTMessage: View {
    let message: ChatMessage
    
    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            if message.isUser {
                Spacer(minLength: 50)
            } else {
                // Hannah avatar
                Circle()
                    .fill(Color(hex: "10A37F"))
                    .frame(width: 30, height: 30)
                    .overlay(
                        Text("H")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                    )
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(message.content)
                    .font(.system(size: 16))
                    .foregroundColor(Color(hex: "ECECEC"))
                    .textSelection(.enabled)
                
                // Show confidence for food logging messages
                if let confidence = message.confidence {
                    Text("\(Int(confidence * 100))% confident")
                        .font(.system(size: 12))
                        .foregroundColor(Color(hex: "8E8EA0"))
                }
            }
            .padding(.horizontal, message.isUser ? 16 : 0)
            
            if !message.isUser {
                Spacer(minLength: 50)
            } else {
                // User avatar
                Circle()
                    .fill(Color(hex: "8E8EA0"))
                    .frame(width: 30, height: 30)
                    .overlay(
                        Image(systemName: "person.fill")
                            .font(.system(size: 14))
                            .foregroundColor(Color(hex: "202123"))
                    )
            }
        }
    }
}

// Clean ChatGPT-style input bar
struct ChatGPTInputBar: View {
    @Binding var messageText: String
    @FocusState.Binding var isInputFocused: Bool
    let onSend: () -> Void
    
    var body: some View {
        VStack(spacing: 0) {
            // Container with background
            VStack(spacing: 12) {
                // Input field container
                HStack(spacing: 12) {
                    // Text field with border like ChatGPT
                    HStack(spacing: 12) {
                        TextField("Message Hannah...", text: $messageText)
                            .font(.system(size: 16))
                            .foregroundColor(Color(hex: "ECECEC"))
                            .accentColor(Color(hex: "10A37F"))
                            .textFieldStyle(.plain)
                            .focused($isInputFocused)
                            .submitLabel(.send)
                            .onSubmit {
                                if !messageText.isEmpty {
                                    onSend()
                                }
                            }
                        
                        // Send button
                        if !messageText.isEmpty {
                            Button(action: onSend) {
                                Image(systemName: "arrow.up")
                                    .font(.system(size: 16, weight: .semibold))
                                    .foregroundColor(.black)
                                    .frame(width: 30, height: 30)
                                    .background(Color(hex: "ECECEC"))
                                    .clipShape(Circle())
                            }
                        } else {
                            // Placeholder send button when empty
                            Image(systemName: "arrow.up")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(Color(hex: "565869"))
                                .frame(width: 30, height: 30)
                                .background(Color(hex: "40414F"))
                                .clipShape(Circle())
                        }
                    }
                    .padding(.horizontal, 20)
                    .padding(.vertical, 12)
                    .background(Color(hex: "40414F"))
                    .overlay(
                        RoundedRectangle(cornerRadius: 24)
                            .stroke(Color(hex: "565869"), lineWidth: 1)
                    )
                    .cornerRadius(24)
                }
                .padding(.horizontal, 20)
                
                // ChatGPT disclaimer text
                Text("Hannah can make mistakes. Check important info.")
                    .font(.system(size: 12))
                    .foregroundColor(Color(hex: "8E8EA0"))
            }
            .padding(.vertical, 16)
            .background(Color(hex: "202123"))
        }
    }
}

