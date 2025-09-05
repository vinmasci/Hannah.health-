//
//  MealPlanChatPanel.swift
//  HannahHealth
//
//  Chat panel for meal planning with Hannah
//

import SwiftUI
import Combine

struct MealPlanChatPanel: View {
    @ObservedObject var viewModel: MealPlanChatViewModel
    @Binding var selectedSlots: Set<MealSlot>
    @State private var message = ""
    @State private var keyboardHeight: CGFloat = 0
    @FocusState private var isInputFocused: Bool
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            header
            
            Divider()
                .background(Color.white.opacity(0.1))
            
            // Chat messages
            ScrollViewReader { proxy in
                ScrollView(.vertical, showsIndicators: false) {
                    VStack(alignment: .leading, spacing: 12) {
                        ForEach(viewModel.messages) { msg in
                            messageView(msg)
                        }
                        
                        if viewModel.isTyping {
                            typingIndicator
                        }
                    }
                    .padding(16)
                    .id("messages")
                }
                .scrollDismissesKeyboard(.interactively)  // Swipe down to dismiss
                .simultaneousGesture(DragGesture())  // Allow parent scroll to work
                .onChange(of: viewModel.messages.count) { _ in
                    withAnimation {
                        proxy.scrollTo("messages", anchor: .bottom)
                    }
                }
            }
            
            // Input bar
            inputBar
                .padding(.bottom, keyboardHeight > 0 ? keyboardHeight - 80 : 0) // Adjust for keyboard
        }
        .background(Color.black.opacity(0.5))
        .cornerRadius(20)
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.white.opacity(0.05))
        )
        .onReceive(Publishers.keyboardHeight) { height in
            self.keyboardHeight = height
        }
        .animation(.easeOut(duration: 0.25), value: keyboardHeight)
    }
    
    private var header: some View {
        HStack {
            VStack(alignment: .leading, spacing: 4) {
                Text("Meal Planning Assistant")
                    .font(.system(size: 18, weight: .semibold, design: .rounded))
                    .foregroundColor(.white)
                
                if !selectedSlots.isEmpty {
                    Text("\(selectedSlots.count) \(selectedSlots.count == 1 ? "slot" : "slots") selected")
                        .font(.system(size: 14))
                        .foregroundColor(Color(hex: "10A37F"))
                } else {
                    Text("Tap meals to select")
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.5))
                }
            }
            
            Spacer()
            
            // Hannah avatar
            Circle()
                .fill(Color(hex: "10A37F"))
                .frame(width: 32, height: 32)
                .overlay(
                    Text("H")
                        .font(.system(size: 16, weight: .bold))
                        .foregroundColor(.white)
                )
        }
        .padding(16)
    }
    
    private func messageView(_ msg: MealPlanMessage) -> some View {
        HStack(alignment: .top) {
            if msg.isUser {
                Spacer()
                Text(msg.content)
                    .font(.system(size: 15))
                    .foregroundColor(.white)
                    .padding(12)
                    .background(Color(hex: "4361EE"))
                    .cornerRadius(12)
                    .frame(maxWidth: 250, alignment: .trailing)
            } else {
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
                        .padding(12)
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(12)
                        .frame(maxWidth: 250, alignment: .leading)
                }
                Spacer()
            }
        }
    }
    
    private var typingIndicator: some View {
        HStack(spacing: 8) {
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
            .padding(.vertical, 8)
        }
    }
    
    private var inputBar: some View {
        HStack(spacing: 12) {
            TextField(placeholderText, text: $message)
                .textFieldStyle(PlainTextFieldStyle())
                .foregroundColor(.white)
                .padding(12)
                .background(Color.white.opacity(0.1))
                .cornerRadius(20)
                .focused($isInputFocused)
                .onSubmit {
                    sendMessage()
                }
            
            Button(action: sendMessage) {
                Image(systemName: "arrow.up.circle.fill")
                    .font(.system(size: 28))
                    .foregroundColor(message.isEmpty ? .white.opacity(0.3) : Color(hex: "10A37F"))
            }
            .disabled(message.isEmpty)
        }
        .padding(16)
    }
    
    private var placeholderText: String {
        if !selectedSlots.isEmpty {
            if selectedSlots.count == 1 {
                return "Edit selected slot..."
            } else {
                return "Edit \(selectedSlots.count) selected meals..."
            }
        } else {
            return "Select meals to edit..."
        }
    }
    
    private func sendMessage() {
        guard !message.isEmpty else { return }
        let text = message
        message = ""
        
        Task {
            await viewModel.sendMessage(text, for: selectedSlots)
            // Clear selection after Hannah responds
            await MainActor.run {
                withAnimation(.spring(duration: 0.3)) {
                    selectedSlots.removeAll()
                }
            }
        }
    }
}

// Message model moved to MealPlanChatViewModel.swift