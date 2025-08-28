//
//  QuickChatDrawer.swift
//  HannahHealth
//
//  Context-aware quick chat that knows what screen you're on
//

import SwiftUI
import Combine
import UIKit

// MARK: - Chat Context
enum ChatContext: String {
    case dashboard = "User is viewing their daily dashboard. Help with logging food, checking calories, or reviewing today's progress."
    case mealPlan = "User is on the Meal Plan screen. Help edit meals, suggest recipes, swap foods, or plan upcoming days."
    case shopping = "User is viewing their shopping list. Help add items, check ingredients, or organize the list."
    
    var systemPrompt: String {
        return """
        You are Hannah, a friendly nutrition assistant. 
        CONTEXT: \(self.rawValue)
        Keep responses brief and action-focused.
        Automatically perform actions when clear intent is shown.
        Be conversational but concise.
        """
    }
    
    var placeholder: String {
        switch self {
        case .dashboard: return "Quick log food or ask about today..."
        case .mealPlan: return "Edit meals or get recipe ideas..."
        case .shopping: return "Add items or check your list..."
        }
    }
    
    var title: String {
        switch self {
        case .dashboard: return "Quick Log"
        case .mealPlan: return "Edit Meals"
        case .shopping: return "Update List"
        }
    }
}

// MARK: - Quick Chat Drawer
struct QuickChatDrawer: View {
    @Binding var isPresented: Bool
    let context: ChatContext
    @StateObject private var viewModel = QuickChatViewModel()
    @State private var message = ""
    @State private var keyboardHeight: CGFloat = 0
    @FocusState private var isInputFocused: Bool
    
    var body: some View {
        VStack(spacing: 0) {
            // Drag Handle
            dragHandle
            
            // Header
            header
            
            // Chat Content
            chatContent
            
            // Input Bar
            inputBar
        }
        .frame(maxWidth: .infinity)
        .frame(height: UIScreen.main.bounds.height * 0.4)
        .background(Color.black.opacity(0.5))
        .background(.ultraThinMaterial)
        .cornerRadius(20, corners: [.topLeft, .topRight])
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.white.opacity(0.1))
                .mask(
                    Rectangle()
                        .frame(height: UIScreen.main.bounds.height * 0.4)
                        .offset(y: 10)
                )
        )
        .offset(y: isPresented ? -keyboardHeight : UIScreen.main.bounds.height * 0.5)
        .animation(.spring(response: 0.3, dampingFraction: 0.9), value: isPresented)
        .animation(.spring(response: 0.3, dampingFraction: 0.9), value: keyboardHeight)
        .gesture(
            DragGesture()
                .onEnded { value in
                    if value.translation.height > 50 {
                        isPresented = false
                        isInputFocused = false
                    }
                }
        )
        .onAppear {
            viewModel.setContext(context)
            // Auto-focus input with minimal delay
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                isInputFocused = true
            }
        }
        .onReceive(viewModel.$shouldDismiss) { shouldDismiss in
            if shouldDismiss {
                isPresented = false
            }
        }
        .onReceive(Publishers.keyboardHeight) { height in
            self.keyboardHeight = height
        }
    }
    
    private var dragHandle: some View {
        RoundedRectangle(cornerRadius: 3)
            .fill(Color.white.opacity(0.3))
            .frame(width: 40, height: 5)
            .padding(.top, 8)
            .padding(.bottom, 4)
    }
    
    private var header: some View {
        HStack {
            Text(context.title)
                .font(.system(size: 20, weight: .semibold, design: .rounded))
                .foregroundColor(.white)
            
            Spacer()
            
            Button(action: { isPresented = false }) {
                Image(systemName: "xmark.circle.fill")
                    .foregroundColor(.white.opacity(0.5))
                    .font(.system(size: 20))
            }
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 12)
    }
    
    private var chatContent: some View {
        ScrollView {
            VStack(alignment: .leading, spacing: 12) {
                // Messages (both user and Hannah)
                ForEach(viewModel.messages) { msg in
                    if msg.isUser {
                        // User message - right aligned
                        HStack {
                            Spacer()
                            Text(msg.content)
                                .font(.system(size: 15))
                                .foregroundColor(.white)
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(Color(hex: "4361EE"))
                                .cornerRadius(12)
                        }
                        .padding(.horizontal, 20)
                    } else {
                        // Hannah's response - left aligned
                        HStack(alignment: .top, spacing: 8) {
                            Circle()
                                .fill(Color(hex: "10A37F"))
                                .frame(width: 28, height: 28)
                                .overlay(
                                    Text("H")
                                        .font(.system(size: 14, weight: .bold))
                                        .foregroundColor(.white)
                                )
                            
                            Text(msg.content)
                                .font(.system(size: 15))
                                .foregroundColor(.white.opacity(0.9))
                                .padding(.horizontal, 12)
                                .padding(.vertical, 8)
                                .background(Color.white.opacity(0.1))
                                .cornerRadius(12)
                        }
                        .padding(.horizontal, 20)
                    }
                }
                
                // Typing indicator
                if viewModel.isTyping {
                    HStack(alignment: .top, spacing: 8) {
                        Circle()
                            .fill(Color(hex: "10A37F"))
                            .frame(width: 28, height: 28)
                            .overlay(
                                Text("H")
                                    .font(.system(size: 14, weight: .bold))
                                    .foregroundColor(.white)
                            )
                        
                        HStack(spacing: 4) {
                            ForEach(0..<3) { i in
                                Circle()
                                    .fill(Color.white.opacity(0.6))
                                    .frame(width: 6, height: 6)
                                    .offset(y: viewModel.isTyping ? -4 : 0)
                                    .animation(
                                        Animation.easeInOut(duration: 0.5)
                                            .repeatForever()
                                            .delay(Double(i) * 0.15),
                                        value: viewModel.isTyping
                                    )
                            }
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 12)
                    }
                    .padding(.horizontal, 20)
                }
            }
            .padding(.vertical, 8)
        }
        .scrollDismissesKeyboard(.interactively)
    }
    
    private var inputBar: some View {
        HStack(spacing: 12) {
            // Camera button
            Button(action: { /* TODO: Camera */ }) {
                Image(systemName: "camera.fill")
                    .foregroundColor(.white.opacity(0.6))
                    .font(.system(size: 20))
            }
            
            // Text field
            HStack {
                TextField(context.placeholder, text: $message)
                    .foregroundColor(.white)
                    .focused($isInputFocused)
                    .onSubmit {
                        sendMessage()
                    }
                
                // Send button
                Button(action: sendMessage) {
                    Image(systemName: "arrow.up.circle.fill")
                        .foregroundColor(message.isEmpty ? .white.opacity(0.3) : .white)
                        .font(.system(size: 24))
                }
                .disabled(message.isEmpty)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 12)
            .background(Color.white.opacity(0.1))
            .cornerRadius(20)
        }
        .padding(.horizontal, 20)
        .padding(.bottom, 20)
    }
    
    private func sendMessage() {
        guard !message.isEmpty else { return }
        let text = message
        message = ""
        Task {
            await viewModel.sendMessage(text)
        }
    }
}

// MARK: - Corner Radius Extension
extension View {
    func cornerRadius(_ radius: CGFloat, corners: UIRectCorner) -> some View {
        clipShape(RoundedCorner(radius: radius, corners: corners))
    }
}

struct RoundedCorner: Shape {
    var radius: CGFloat = 0
    var corners: UIRectCorner = .allCorners
    
    func path(in rect: CGRect) -> Path {
        let path = UIBezierPath(
            roundedRect: rect,
            byRoundingCorners: corners,
            cornerRadii: CGSize(width: radius, height: radius)
        )
        return Path(path.cgPath)
    }
}