//
//  CountryPickerView.swift
//  HannahHealth
//
//  Country code picker for phone numbers
//

import SwiftUI

struct CountryPickerView: View {
    @Binding var countryCode: String
    @Binding var hasChanges: Bool
    @State private var searchText = ""
    @Environment(\.dismiss) private var dismiss
    
    var filteredCountries: [Country] {
        if searchText.isEmpty {
            return CountryData.allCountries
        } else {
            return CountryData.allCountries.filter { country in
                country.name.localizedCaseInsensitiveContains(searchText) ||
                country.code.contains(searchText)
            }
        }
    }
    
    var body: some View {
        NavigationView {
            ZStack {
                // Background
                Color(hex: "1a1a2e")
                    .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Search bar
                    HStack {
                        Image(systemName: "magnifyingglass")
                            .foregroundColor(.gray)
                        
                        TextField("Search country or code", text: $searchText)
                            .foregroundColor(.white)
                            .autocapitalization(.none)
                    }
                    .padding()
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(10)
                    .padding()
                    
                    // Country list
                    ScrollView {
                        LazyVStack(spacing: 0) {
                            ForEach(filteredCountries) { country in
                                Button {
                                    countryCode = country.code
                                    hasChanges = true
                                    dismiss()
                                } label: {
                                    HStack {
                                        Text("\(country.flag) \(country.name)")
                                            .foregroundColor(.white)
                                        
                                        Spacer()
                                        
                                        Text(country.code)
                                            .foregroundColor(.gray)
                                        
                                        if country.code == countryCode {
                                            Image(systemName: "checkmark")
                                                .foregroundColor(Theme.emerald)
                                        }
                                    }
                                    .padding(.horizontal)
                                    .padding(.vertical, 12)
                                }
                                .background(country.code == countryCode ? Theme.emerald.opacity(0.1) : Color.clear)
                                
                                Divider()
                                    .background(Color.white.opacity(0.1))
                            }
                        }
                    }
                }
            }
            .navigationTitle("Select Country")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        dismiss()
                    }
                    .foregroundColor(Theme.emerald)
                }
            }
        }
    }
}