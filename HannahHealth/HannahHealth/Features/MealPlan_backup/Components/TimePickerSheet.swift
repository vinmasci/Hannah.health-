//
//  TimePickerSheet.swift
//  HannahHealth
//
//  Time picker sheet for meal planning
//

import SwiftUI

struct TimePickerSheet: View {
    @Binding var selectedTime: Date
    @Binding var isPresented: Bool
    let onSave: (Date) -> Void
    
    var body: some View {
        VStack(spacing: 0) {
            // Header
            HStack {
                Button("Cancel") {
                    isPresented = false
                }
                .foregroundColor(.blue)
                
                Spacer()
                
                Text("Select Time")
                    .font(.headline)
                
                Spacer()
                
                Button("Done") {
                    onSave(selectedTime)
                    isPresented = false
                }
                .fontWeight(.semibold)
                .foregroundColor(.blue)
            }
            .padding()
            .background(Color(UIColor.systemGray6))
            
            // Time Picker
            DatePicker("",
                      selection: $selectedTime,
                      displayedComponents: .hourAndMinute)
                .datePickerStyle(WheelDatePickerStyle())
                .labelsHidden()
                .padding()
            
            Spacer()
        }
        .presentationDetents([.fraction(0.35)])
        .presentationDragIndicator(.visible)
    }
}