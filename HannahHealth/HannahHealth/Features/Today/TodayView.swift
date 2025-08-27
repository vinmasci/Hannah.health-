//
//  TodayView.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct TodayView: View {
    @StateObject private var viewModel = TodayViewModel()
    
    var body: some View {
        VStack(alignment: .leading, spacing: 16) {
            // Running Total
            VStack(alignment: .leading, spacing: 8) {
                Text("Running Total")
                    .font(.caption)
                    .foregroundColor(.secondary)
                Text("\(viewModel.dailyNutrition.consumed.calories) cal")
                    .font(.title)
                    .fontWeight(.bold)
                Text("Target: \(viewModel.dailyNutrition.target.calories)")
                    .font(.caption)
                    .foregroundColor(.secondary)
            }
            .padding()
            .frame(maxWidth: .infinity, alignment: .leading)
            .background(
                RoundedRectangle(cornerRadius: 16)
                    .fill(Color.black.opacity(0.12))  // Black tint
                    .overlay(
                        RoundedRectangle(cornerRadius: 16)
                            .strokeBorder(Color.black.opacity(0.2), lineWidth: 0.5)
                    )
            )
            
            // Deficit/Surplus
            DeficitCard(deficit: viewModel.dailyNutrition.deficit)
            
            // Macros
            VStack(alignment: .leading, spacing: 8) {
                MacroProgressView(
                    name: "Protein",
                    value: viewModel.dailyNutrition.consumed.protein,
                    target: viewModel.dailyNutrition.target.protein,
                    color: .blue
                )
                MacroProgressView(
                    name: "Carbs",
                    value: viewModel.dailyNutrition.consumed.carbs,
                    target: viewModel.dailyNutrition.target.carbs,
                    color: .orange
                )
                MacroProgressView(
                    name: "Fat",
                    value: viewModel.dailyNutrition.consumed.fat,
                    target: viewModel.dailyNutrition.target.fat,
                    color: .green
                )
            }
            
            // Mood & Energy
            MoodEnergyView()
        }
    }
}