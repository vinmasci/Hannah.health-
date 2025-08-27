//
//  MoodEnergyView.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct MoodEnergyView: View {
    @State private var mood = "😊"
    @State private var energy = "🔋"
    
    var body: some View {
        HStack {
            VStack {
                Text("Mood")
                    .font(.caption)
                Text(mood)
                    .font(.title)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color(UIColor.systemGray6))
            .cornerRadius(8)
            
            VStack {
                Text("Energy")
                    .font(.caption)
                Text(energy)
                    .font(.title)
            }
            .frame(maxWidth: .infinity)
            .padding()
            .background(Color(UIColor.systemGray6))
            .cornerRadius(8)
        }
    }
}