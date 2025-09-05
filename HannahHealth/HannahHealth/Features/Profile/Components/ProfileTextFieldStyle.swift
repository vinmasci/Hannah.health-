//
//  ProfileTextFieldStyle.swift
//  HannahHealth
//
//  Custom text field style for profile forms
//

import SwiftUI

struct ProfileTextFieldStyle: TextFieldStyle {
    func _body(configuration: TextField<Self._Label>) -> some View {
        configuration
            .padding(.horizontal, 12)
            .padding(.vertical, 14)
            .background(Color.white.opacity(0.1))
            .cornerRadius(8)
            .foregroundColor(.white)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color.white.opacity(0.2), lineWidth: 1)
            )
    }
}

// Keyboard toolbar modifier for dismissing keyboard
struct KeyboardToolbar: ViewModifier {
    func body(content: Content) -> some View {
        content
            .toolbar {
                ToolbarItemGroup(placement: .keyboard) {
                    Spacer()
                    Button("Done") {
                        UIApplication.shared.sendAction(#selector(UIResponder.resignFirstResponder), to: nil, from: nil, for: nil)
                    }
                    .font(.body)
                    .foregroundColor(Theme.emerald)
                }
            }
    }
}

extension View {
    func keyboardToolbar() -> some View {
        modifier(KeyboardToolbar())
    }
}