//
//  SimpleChatView.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct SimpleChatView: View {
    @StateObject private var viewModel = ChatViewModel()
    @State private var messageText = ""
    
    var body: some View {
        VStack {
            // ChatGPT Header
            HStack {
                Button(action: {}) {
                    Image(systemName: "sidebar.left")
                        .font(.system(size: 18))
                        .foregroundColor(Color(hex: "ECECEC"))
                }
                
                Spacer()
                
                Text("Hannah")
                    .font(.system(size: 17, weight: .semibold))
                    .foregroundColor(Color(hex: "ECECEC"))
                
                Spacer()
                
                Button(action: {}) {
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
            
            // Messages ScrollView with Spacer to push input to bottom
            ScrollView {
                VStack(spacing: 16) {
                    // Welcome message
                    HStack(alignment: .top, spacing: 12) {
                        Circle()
                            .fill(Color(hex: "10A37F"))
                            .frame(width: 30, height: 30)
                            .overlay(
                                Text("H")
                                    .font(.system(size: 14, weight: .semibold))
                                    .foregroundColor(.white)
                            )
                        
                        VStack(alignment: .leading, spacing: 4) {
                            Text("Hi! I'm Hannah. Just text me what you eat and I'll track it for you.")
                                .font(.system(size: 16))
                                .foregroundColor(Color(hex: "ECECEC"))
                                .textSelection(.enabled)
                        }
                        
                        Spacer(minLength: 50)
                    }
                    .padding(.horizontal, 20)
                    .padding(.top, 20)
                    
                    // Other messages
                    ForEach(viewModel.messages) { message in
                        HStack(alignment: .top, spacing: 12) {
                            if message.isUser {
                                Spacer(minLength: 50)
                            } else {
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
                                Text(message.text)
                                    .font(.system(size: 16))
                                    .foregroundColor(Color(hex: "ECECEC"))
                                    .textSelection(.enabled)
                                
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
                        .padding(.horizontal, 20)
                    }
                }
                .padding(.bottom, 20)
            }
            .background(Color(hex: "202123"))
            
            Spacer() // IMPORTANT: This pushes the input to bottom
            
            // ChatGPT Input Bar
            HStack(spacing: 12) {
                // Input field container
                HStack(spacing: 12) {
                    TextField("Message Hannah...", text: $messageText)
                        .font(.system(size: 16))
                        .foregroundColor(Color(hex: "ECECEC"))
                        .accentColor(Color(hex: "10A37F"))
                        .textFieldStyle(.plain)
                        .onSubmit {
                            if !messageText.isEmpty {
                                viewModel.sendMessage(messageText)
                                messageText = ""
                            }
                        }
                    
                    // Send button
                    if !messageText.isEmpty {
                        Button(action: {
                            viewModel.sendMessage(messageText)
                            messageText = ""
                        }) {
                            Image(systemName: "arrow.up")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(.black)
                                .frame(width: 30, height: 30)
                                .background(Color(hex: "ECECEC"))
                                .clipShape(Circle())
                        }
                    } else {
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
            .padding(.vertical, 16)
            .background(Color(hex: "202123"))
            .padding(.bottom, 90) // SPACE FOR TAB BAR - INPUT WAS HIDDEN BEHIND IT
        }
        .background(Color(hex: "202123"))
        .navigationBarHidden(true)
        .ignoresSafeArea(.keyboard, edges: .bottom)
    }
}

#Preview {
    SimpleChatView()
}