//
//  ProfileFormFields.swift
//  HannahHealth
//
//  Profile form fields component
//

import SwiftUI

struct ProfileFormFields: View {
    @ObservedObject var viewModel: UserProfileViewModel
    
    var body: some View {
        VStack(spacing: 20) {
            // Name field
            VStack(alignment: .leading, spacing: 8) {
                Text("What should we call you?")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.8))
                
                TextField("Your name", text: $viewModel.displayName)
                    .textFieldStyle(ProfileTextFieldStyle())
                    .onChange(of: viewModel.displayName) { _ in viewModel.hasChanges = true }
                    .keyboardToolbar()
            }
            
            // Birth Year field
            VStack(alignment: .leading, spacing: 8) {
                Text("Birth Year")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.8))
                
                TextField("1990", text: $viewModel.birthYear)
                    .keyboardType(.numberPad)
                    .textFieldStyle(ProfileTextFieldStyle())
                    .onChange(of: viewModel.birthYear) { _ in viewModel.hasChanges = true }
                    .keyboardToolbar()
            }
            
            // Height field
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Height")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    
                    Spacer()
                    
                    Picker("", selection: $viewModel.useMetricHeight) {
                        Text("ft/in").tag(false)
                        Text("cm").tag(true)
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    .frame(width: 100)
                    .onChange(of: viewModel.useMetricHeight) { _ in viewModel.hasChanges = true }
                }
                
                HStack {
                    if viewModel.useMetricHeight {
                        TextField("cm", text: $viewModel.heightCm)
                            .keyboardType(.numberPad)
                            .textFieldStyle(ProfileTextFieldStyle())
                            .frame(width: 80)
                            .onChange(of: viewModel.heightCm) { _ in viewModel.hasChanges = true }
                            .keyboardToolbar()
                        
                        Text("cm")
                            .foregroundColor(.white.opacity(0.7))
                    } else {
                        TextField("ft", text: $viewModel.heightFeet)
                            .keyboardType(.numberPad)
                            .textFieldStyle(ProfileTextFieldStyle())
                            .frame(width: 60)
                            .onChange(of: viewModel.heightFeet) { _ in viewModel.hasChanges = true }
                            .keyboardToolbar()
                        
                        Text("ft")
                            .foregroundColor(.white.opacity(0.7))
                        
                        TextField("in", text: $viewModel.heightInches)
                            .keyboardType(.numberPad)
                            .textFieldStyle(ProfileTextFieldStyle())
                            .frame(width: 60)
                            .onChange(of: viewModel.heightInches) { _ in viewModel.hasChanges = true }
                            .keyboardToolbar()
                        
                        Text("in")
                            .foregroundColor(.white.opacity(0.7))
                    }
                    
                    Spacer()
                }
            }
            
            // Weight field
            VStack(alignment: .leading, spacing: 8) {
                HStack {
                    Text("Weight")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    
                    Spacer()
                    
                    Picker("", selection: $viewModel.useMetricWeight) {
                        Text("lbs").tag(false)
                        Text("kg").tag(true)
                    }
                    .pickerStyle(SegmentedPickerStyle())
                    .frame(width: 100)
                    .onChange(of: viewModel.useMetricWeight) { _ in viewModel.hasChanges = true }
                }
                
                HStack {
                    if viewModel.useMetricWeight {
                        TextField("kg", text: $viewModel.weightKg)
                            .keyboardType(.decimalPad)
                            .textFieldStyle(ProfileTextFieldStyle())
                            .frame(width: 80)
                            .onChange(of: viewModel.weightKg) { _ in viewModel.hasChanges = true }
                            .keyboardToolbar()
                        
                        Text("kg")
                            .foregroundColor(.white.opacity(0.7))
                    } else {
                        TextField("lbs", text: $viewModel.weightLbs)
                            .keyboardType(.decimalPad)
                            .textFieldStyle(ProfileTextFieldStyle())
                            .frame(width: 80)
                            .onChange(of: viewModel.weightLbs) { _ in viewModel.hasChanges = true }
                            .keyboardToolbar()
                        
                        Text("lbs")
                            .foregroundColor(.white.opacity(0.7))
                    }
                    
                    Spacer()
                }
            }
            
            // Phone field
            VStack(alignment: .leading, spacing: 8) {
                Text("Mobile Phone (for SMS logging)")
                    .font(.caption)
                    .foregroundColor(.white.opacity(0.8))
                
                HStack(spacing: 8) {
                    // Country code selector
                    Button {
                        viewModel.showCountryPicker = true
                    } label: {
                        HStack {
                            Text(viewModel.countryCode)
                                .foregroundColor(.white)
                            Image(systemName: "chevron.down")
                                .font(.caption)
                                .foregroundColor(.white.opacity(0.6))
                        }
                        .padding(.horizontal, 12)
                        .padding(.vertical, 14)
                        .background(Color.white.opacity(0.1))
                        .cornerRadius(8)
                        .overlay(
                            RoundedRectangle(cornerRadius: 8)
                                .stroke(Color.white.opacity(0.2), lineWidth: 1)
                        )
                    }
                    
                    // Phone number field
                    TextField("234 567 8900", text: $viewModel.phoneNumber)
                        .keyboardType(.phonePad)
                        .textFieldStyle(ProfileTextFieldStyle())
                        .onChange(of: viewModel.phoneNumber) { newValue in
                            // Format the phone number as they type
                            viewModel.phoneNumber = viewModel.formatPhoneNumber(newValue)
                            viewModel.hasChanges = true
                        }
                        .keyboardToolbar()
                }
            }
            
            Divider()
                .background(Color.white.opacity(0.2))
            
            // Preferred Units toggle
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Prefer Metric Units")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    Text("Use kg and cm by default")
                        .font(.caption2)
                        .foregroundColor(.white.opacity(0.5))
                }
                
                Spacer()
                
                Toggle("", isOn: $viewModel.preferMetric)
                    .labelsHidden()
                    .tint(Theme.emerald)
                    .onChange(of: viewModel.preferMetric) { newValue in
                        viewModel.handleMetricPreferenceChange(newValue)
                    }
            }
            
            // Safe Mode toggle
            HStack {
                VStack(alignment: .leading, spacing: 4) {
                    Text("Safe Mode")
                        .font(.caption)
                        .foregroundColor(.white.opacity(0.8))
                    Text("Hides numbers for ED recovery")
                        .font(.caption2)
                        .foregroundColor(.white.opacity(0.5))
                }
                
                Spacer()
                
                Toggle("", isOn: $viewModel.safeMode)
                    .labelsHidden()
                    .tint(Theme.emerald)
                    .onChange(of: viewModel.safeMode) { _ in viewModel.hasChanges = true }
            }
        }
        .padding()
        .background(Theme.glassMorphism)
        .cornerRadius(12)
    }
}