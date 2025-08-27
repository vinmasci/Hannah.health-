//
//  WorkingChatView.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI
import Combine
import PhotosUI
import UIKit

// Keyboard height publisher
extension Publishers {
    static var keyboardHeight: AnyPublisher<CGFloat, Never> {
        let willShow = NotificationCenter.default.publisher(for: UIResponder.keyboardWillShowNotification)
            .map { notification -> CGFloat in
                (notification.userInfo?[UIResponder.keyboardFrameEndUserInfoKey] as? CGRect)?.height ?? 0
            }
        
        let willHide = NotificationCenter.default.publisher(for: UIResponder.keyboardWillHideNotification)
            .map { _ -> CGFloat in 0 }
        
        return Publishers.Merge(willShow, willHide)
            .eraseToAnyPublisher()
    }
}

struct WorkingChatView: View {
    @StateObject private var viewModel = ChatViewModel()
    @State private var messageText = ""
    @State private var keyboardHeight: CGFloat = 0
    @State private var showImageOptions = false
    @State private var showCamera = false
    @State private var selectedImage: PhotosPickerItem?
    @State private var selectedImageData: Data?
    
    private var messagesScrollView: some View {
        ScrollViewReader { scrollProxy in
            ScrollView {
                VStack(spacing: 16) {
                    // Add top padding
                    Color.clear
                        .frame(height: 20)
                    
                    ForEach(viewModel.messages) { message in
                        messageRow(for: message)
                            .id(message.id)
                    }
                    
                    Color.clear
                        .frame(height: 100)
                        .id("bottom")
                }
            }
            .scrollDismissesKeyboard(.interactively)
            .simultaneousGesture(
                DragGesture()
                    .onChanged { value in
                        // If dragging down more than 10 points, dismiss keyboard
                        if value.translation.height > 10 {
                            UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                        }
                    }
            )
            .onChange(of: viewModel.messages.count) { _ in
                withAnimation {
                    scrollProxy.scrollTo("bottom", anchor: .bottom)
                }
            }
            .onChange(of: keyboardHeight) { _ in
                withAnimation {
                    scrollProxy.scrollTo("bottom", anchor: .bottom)
                }
            }
        }
    }
    
    private func messageRow(for message: ChatMessage) -> some View {
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
                // Show image if present
                if let imageData = message.imageData,
                   let uiImage = UIImage(data: imageData) {
                    Image(uiImage: uiImage)
                        .resizable()
                        .scaledToFit()
                        .frame(maxWidth: 200, maxHeight: 200)
                        .cornerRadius(8)
                        .padding(.bottom, 4)
                }
                
                Text(message.text)
                    .font(.system(size: 16))
                    .foregroundColor(Color(hex: "ECECEC"))
                
                if let confidence = message.confidence {
                    Text("\(Int(confidence * 100))% confident")
                        .font(.system(size: 12))
                        .foregroundColor(Color(hex: "8E8EA0"))
                }
            }
            
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
    
    private var inputBar: some View {
        VStack(spacing: 12) {
            HStack(spacing: 12) {
                Button(action: {
                    showImageOptions = true
                }) {
                    Image(systemName: "camera.fill")
                        .font(.system(size: 22))
                        .foregroundColor(Color(hex: "ECECEC"))
                }
                
                HStack(spacing: 12) {
                    TextField("Message Hannah...", text: $messageText)
                        .font(.system(size: 16))
                        .foregroundColor(Color(hex: "ECECEC"))
                        .accentColor(Color(hex: "10A37F"))
                        .textFieldStyle(.plain)
                        .onSubmit {
                            if !messageText.isEmpty {
                                viewModel.sendMessage(messageText, imageData: selectedImageData)
                                messageText = ""
                                selectedImageData = nil
                            }
                        }
                    
                    Button(action: {
                        if !messageText.isEmpty || selectedImageData != nil {
                            viewModel.sendMessage(messageText, imageData: selectedImageData)
                            messageText = ""
                            selectedImageData = nil
                        }
                    }) {
                        Image(systemName: "arrow.up")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor((messageText.isEmpty && selectedImageData == nil) ? Color(hex: "565869") : .black)
                            .frame(width: 30, height: 30)
                            .background((messageText.isEmpty && selectedImageData == nil) ? Color(hex: "40414F") : Color(hex: "ECECEC"))
                            .clipShape(Circle())
                    }
                    .disabled(messageText.isEmpty && selectedImageData == nil)
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
            
            Text("Hannah can make mistakes. Check important info.")
                .font(.system(size: 12))
                .foregroundColor(Color(hex: "8E8EA0"))
        }
        .padding(.top, 8)
        .padding(.bottom, keyboardHeight > 0 ? keyboardHeight + 20 : 100)
        .background(Color(hex: "202123"))
        .animation(.easeOut(duration: 0.25), value: keyboardHeight)
    }
    
    private var chatHeader: some View {
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
    }
    
    var body: some View {
        GeometryReader { geometry in
            ZStack {
                // Background
                Color(hex: "202123")
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Header
                    chatHeader
                    
                    // Messages
                    messagesScrollView
                    
                    Spacer()
                    
                    // Input Bar
                    inputBar
                }
                .gesture(
                    DragGesture()
                        .onChanged { value in
                            // Swipe down anywhere to dismiss keyboard
                            if value.translation.height > 30 && abs(value.translation.width) < 100 {
                                UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                            }
                        }
                )
            }
        }
        .onReceive(Publishers.keyboardHeight) { height in
            self.keyboardHeight = height
        }
        .ignoresSafeArea(.keyboard) // THIS + keyboardHeight publisher = WORKING SOLUTION
        .confirmationDialog("Add Photo", isPresented: $showImageOptions) {
            Button("Take Photo") {
                showCamera = true
            }
            
            PhotosPicker(selection: $selectedImage, matching: .images) {
                Text("Choose from Library")
            }
            
            Button("Cancel", role: .cancel) {}
        }
        .sheet(isPresented: $showCamera) {
            CameraView(selectedImageData: $selectedImageData)
        }
        .onChange(of: selectedImage) { newItem in
            Task {
                if let data = try? await newItem?.loadTransferable(type: Data.self) {
                    selectedImageData = data
                    // Send the image immediately
                    viewModel.sendImage(data)
                    selectedImageData = nil
                    selectedImage = nil
                }
            }
        }
        .onChange(of: selectedImageData) { newData in
            if let data = newData {
                // Image captured from camera
                viewModel.sendImage(data)
                selectedImageData = nil
            }
        }
    }
}

#Preview {
    WorkingChatView()
}