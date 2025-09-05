//
//  DayCard.swift
//  HannahHealth
//
//  Day card component for meal planning
//

import SwiftUI
import Foundation

struct DayCard: View {
    let day: DayOfWeek
    @ObservedObject var viewModel: MealPlanViewModel
    @ObservedObject var foodSearchService: FoodSearchService
    @Binding var selectedMealSlots: Set<MealSlot>
    @Binding var editingTimeSlot: String?
    @Binding var editingMealName: String?
    @Binding var editingMealType: String?
    @Binding var tempTimeValue: String
    @Binding var tempMealName: String
    @Binding var tempMealType: String
    @Binding var showTimePicker: Bool
    @Binding var selectedTime: Date
    @FocusState.Binding var isMealNameFocused: Bool
    @FocusState.Binding var isMealTypeFocused: Bool
    
    private var isCollapsed: Bool {
        viewModel.isDayCollapsed(day)
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Header with collapse button
            Button(action: {
                withAnimation(.spring(duration: 0.3)) {
                    viewModel.toggleDayCollapsed(day)
                }
            }) {
                HStack {
                    Text(day.name)
                        .font(.system(size: 20, weight: .semibold, design: .rounded))
                        .foregroundColor(.white)
                    
                    Spacer()
                    
                    // Display date
                    Text(MealPlanHelpers.dateForDay(day), style: .date)
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.6))
                    
                    Image(systemName: isCollapsed ? "chevron.right" : "chevron.down")
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.7))
                }
            }
            
            if !isCollapsed {
                // Display all meal/snack slots for this day
                ForEach(viewModel.getSlots(for: day)) { slot in
                    MealSlotCard(
                        day: day,
                        slot: slot,
                        viewModel: viewModel,
                        foodSearchService: foodSearchService,
                        selectedMealSlots: $selectedMealSlots,
                        editingTimeSlot: $editingTimeSlot,
                        editingMealName: $editingMealName,
                        editingMealType: $editingMealType,
                        tempTimeValue: $tempTimeValue,
                        tempMealName: $tempMealName,
                        tempMealType: $tempMealType,
                        showTimePicker: $showTimePicker,
                        selectedTime: $selectedTime,
                        isMealNameFocused: $isMealNameFocused,
                        isMealTypeFocused: $isMealTypeFocused
                    )
                }
                
                // Daily totals
                dayTotalsSection
                
                // Add meal slot button
                addMealButton
            }
        }
        .padding(16)
        .background(Color.black.opacity(0.5))
        .cornerRadius(20)
        .overlay(
            RoundedRectangle(cornerRadius: 20)
                .stroke(Color.white.opacity(0.05))
        )
    }
    
    private var dayTotalsSection: some View {
        Group {
            if !viewModel.getSlots(for: day).isEmpty {
                let daySlots = viewModel.getSlots(for: day)
                let totalDayCalories = daySlots.reduce(0) { $0 + $1.totalCalories }
                let totalDayProtein = daySlots.flatMap { $0.meals }.compactMap { $0.protein }.reduce(0, +)
                let totalDayCarbs = daySlots.flatMap { $0.meals }.compactMap { $0.carbs }.reduce(0, +)
                let totalDayFat = daySlots.flatMap { $0.meals }.compactMap { $0.fat }.reduce(0, +)
                
                VStack(spacing: 8) {
                    Divider()
                        .background(Color.white.opacity(0.3))
                        .padding(.vertical, 4)
                    
                    HStack {
                        Text("Day Total")
                            .font(.system(size: 16, weight: .semibold))
                            .foregroundColor(.white)
                        Spacer()
                        Text("\(totalDayCalories) cal")
                            .font(.system(size: 16, weight: .bold))
                            .foregroundColor(Color(hex: "10A37F"))
                    }
                    
                    if totalDayProtein > 0 || totalDayCarbs > 0 || totalDayFat > 0 {
                        HStack(spacing: 16) {
                            if totalDayProtein > 0 {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Protein")
                                        .font(.system(size: 11))
                                        .foregroundColor(.white.opacity(0.6))
                                    Text("\(totalDayProtein)g")
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(.white)
                                }
                            }
                            if totalDayCarbs > 0 {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Carbs")
                                        .font(.system(size: 11))
                                        .foregroundColor(.white.opacity(0.6))
                                    Text("\(totalDayCarbs)g")
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(.white)
                                }
                            }
                            if totalDayFat > 0 {
                                VStack(alignment: .leading, spacing: 2) {
                                    Text("Fat")
                                        .font(.system(size: 11))
                                        .foregroundColor(.white.opacity(0.6))
                                    Text("\(totalDayFat)g")
                                        .font(.system(size: 14, weight: .medium))
                                        .foregroundColor(.white)
                                }
                            }
                            Spacer()
                        }
                    }
                }
                .padding(12)
                .background(Color(hex: "10A37F").opacity(0.1))
                .cornerRadius(8)
                .overlay(
                    RoundedRectangle(cornerRadius: 8)
                        .stroke(Color(hex: "10A37F").opacity(0.3), lineWidth: 1)
                )
            }
        }
    }
    
    private var addMealButton: some View {
        Button(action: {
            withAnimation(.spring(duration: 0.3)) {
                viewModel.addSnackSlot(for: day)
            }
        }) {
            HStack {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 16))
                    .foregroundColor(Color(hex: "10A37F"))
                
                Text("Add Meal")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(Color(hex: "10A37F"))
                
                Spacer()
            }
            .padding(12)
            .background(Color(hex: "10A37F").opacity(0.1))
            .cornerRadius(8)
            .overlay(
                RoundedRectangle(cornerRadius: 8)
                    .stroke(Color(hex: "10A37F").opacity(0.3), lineWidth: 1)
            )
        }
    }
}