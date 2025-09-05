//
//  MealSlotCard.swift
//  HannahHealth
//
//  Meal slot card component for meal planning
//

import SwiftUI
import Foundation

struct MealSlotCard: View {
    let day: DayOfWeek
    let slot: DayMealSlot
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
    var isMealNameFocused: FocusState<Bool>.Binding
    var isMealTypeFocused: FocusState<Bool>.Binding
    
    private let mealSlot: MealSlot
    private var isSelected: Bool {
        selectedMealSlots.contains(mealSlot)
    }
    
    init(day: DayOfWeek,
         slot: DayMealSlot,
         viewModel: MealPlanViewModel,
         foodSearchService: FoodSearchService,
         selectedMealSlots: Binding<Set<MealSlot>>,
         editingTimeSlot: Binding<String?>,
         editingMealName: Binding<String?>,
         editingMealType: Binding<String?>,
         tempTimeValue: Binding<String>,
         tempMealName: Binding<String>,
         tempMealType: Binding<String>,
         showTimePicker: Binding<Bool>,
         selectedTime: Binding<Date>,
         isMealNameFocused: FocusState<Bool>.Binding,
         isMealTypeFocused: FocusState<Bool>.Binding) {
        self.day = day
        self.slot = slot
        self.viewModel = viewModel
        self.foodSearchService = foodSearchService
        self._selectedMealSlots = selectedMealSlots
        self._editingTimeSlot = editingTimeSlot
        self._editingMealName = editingMealName
        self._editingMealType = editingMealType
        self._tempTimeValue = tempTimeValue
        self._tempMealName = tempMealName
        self._tempMealType = tempMealType
        self._showTimePicker = showTimePicker
        self._selectedTime = selectedTime
        self.isMealNameFocused = isMealNameFocused
        self.isMealTypeFocused = isMealTypeFocused
        self.mealSlot = MealSlot(day: day, slotId: slot.id)
    }
    
    var body: some View {
        VStack(alignment: .leading, spacing: 8) {
            headerRow
            mealContent
        }
        .padding(12)
        .background(Color.white.opacity(isSelected ? 0.15 : 0.05))
        .cornerRadius(8)
        .overlay(
            RoundedRectangle(cornerRadius: 8)
                .stroke(isSelected ? Color(hex: "10A37F") : Color.clear, lineWidth: 2)
        )
        .onTapGesture {
            withAnimation(.spring(duration: 0.3)) {
                if isSelected {
                    selectedMealSlots.remove(mealSlot)
                } else {
                    selectedMealSlots.insert(mealSlot)
                }
            }
        }
    }
    
    private var headerRow: some View {
        HStack {
            // Icon based on meal type
            Image(systemName: MealPlanHelpers.getIcon(for: slot.slotType))
                .font(.system(size: 16))
                .foregroundColor(MealPlanHelpers.getIconColor(for: slot.slotType))
            
            if editingMealType == slot.id.uuidString {
                TextField("Type", text: $tempMealType, onCommit: {
                    viewModel.updateSlotType(for: day, slotId: slot.id.uuidString, newType: tempMealType)
                    editingMealType = nil
                    isMealTypeFocused.wrappedValue = false
                })
                .font(.system(size: 14, weight: .medium))
                .foregroundColor(.white)
                .textFieldStyle(PlainTextFieldStyle())
                .frame(width: 80)
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.white.opacity(0.15))
                .cornerRadius(6)
                .focused(isMealTypeFocused)
                .onAppear {
                    isMealTypeFocused.wrappedValue = true
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                        UIApplication.shared.sendAction(#selector(UIResponder.selectAll(_:)), to: nil, from: nil, for: nil)
                    }
                }
            } else {
                Text(slot.slotType.displayName)
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
                    .onTapGesture {
                        tempMealType = slot.slotType.displayName
                        editingMealType = slot.id.uuidString
                    }
            }
            
            Spacer()
            
            // Editable time with DatePicker
            Button(action: {
                let formatter = DateFormatter()
                formatter.dateFormat = "h:mm a"
                if let date = formatter.date(from: slot.time) {
                    selectedTime = date
                }
                editingTimeSlot = slot.id.uuidString
                showTimePicker = true
            }) {
                Text(slot.time)
                    .font(.system(size: 12))
                    .foregroundColor(.white.opacity(0.5))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(Color.white.opacity(0.1))
                    .cornerRadius(6)
            }
            
            // Delete button for all meal slots
            Button(action: {
                withAnimation(.spring(duration: 0.3)) {
                    viewModel.removeSlot(for: day, slotId: slot.id)
                }
            }) {
                Image(systemName: "minus.circle")
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.3))
            }
        }
    }
    
    private var mealContent: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Display all meals in this slot
            ForEach(Array(slot.meals.enumerated()), id: \.offset) { index, meal in
                mealRow(index: index, meal: meal)
            }
            
            // Add meal button
            Button(action: {
                let newMeal = Meal(name: "", calories: 0, protein: nil, carbs: nil, fat: nil, confidence: nil)
                viewModel.addMealToSlot(for: day, slotId: slot.id, meal: newMeal)
                tempMealName = ""
                let currentCount = slot.meals.count
                editingMealName = "\(slot.id.uuidString)_\(currentCount)"
                DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                    self.isMealNameFocused.wrappedValue = true
                }
            }) {
                HStack {
                    Image(systemName: "plus.circle")
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.5))
                    Text("Add item")
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.3))
                }
            }
            .padding(.top, 4)
            
            // Show total calories and macros
            if !slot.meals.isEmpty {
                totalSection
            }
        }
    }
    
    private func mealRow(index: Int, meal: Meal) -> some View {
        HStack {
            let isEditing = editingMealName == "\(slot.id.uuidString)_\(index)"
            
            if isEditing || meal.name.isEmpty {
                TextField("Enter food name", text: Binding(
                    get: {
                        if isEditing {
                            return tempMealName
                        } else {
                            return meal.name
                        }
                    },
                    set: { tempMealName = $0 }
                ), onCommit: {
                    if !tempMealName.isEmpty {
                        Task {
                            await foodSearchService.updateMealAtIndex(
                                day: day,
                                slotId: slot.id.uuidString,
                                index: index,
                                foodName: tempMealName,
                                viewModel: viewModel
                            )
                        }
                    } else {
                        viewModel.removeMealAtIndex(for: day, slotId: slot.id.uuidString, index: index)
                    }
                    editingMealName = nil
                    isMealNameFocused.wrappedValue = false
                })
                .font(.system(size: 16))
                .foregroundColor(.white)
                .textFieldStyle(PlainTextFieldStyle())
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(Color.white.opacity(0.15))
                .cornerRadius(6)
                .focused(isMealNameFocused)
                .onAppear {
                    if meal.name.isEmpty || isEditing {
                        isMealNameFocused.wrappedValue = true
                        DispatchQueue.main.asyncAfter(deadline: .now() + 0.1) {
                            if !meal.name.isEmpty {
                                UIApplication.shared.sendAction(#selector(UIResponder.selectAll(_:)), to: nil, from: nil, for: nil)
                            }
                        }
                    }
                }
            } else if !meal.name.isEmpty {
                VStack(alignment: .leading, spacing: 2) {
                    Text(meal.name)
                        .font(.system(size: 16))
                        .foregroundColor(.white)
                    
                    // Show confidence if available
                    if let confidence = meal.confidence {
                        HStack(spacing: 4) {
                            Image(systemName: "checkmark.seal.fill")
                                .font(.system(size: 10))
                                .foregroundColor(MealPlanHelpers.confidenceColor(confidence))
                            Text("\(Int(confidence * 100))% confident")
                                .font(.system(size: 11))
                                .foregroundColor(MealPlanHelpers.confidenceColor(confidence).opacity(0.8))
                        }
                    }
                }
                .onTapGesture {
                    tempMealName = meal.name
                    editingMealName = "\(slot.id.uuidString)_\(index)"
                }
            }
            
            Spacer()
            
            Text("\(meal.calories) cal")
                .font(.system(size: 12))
                .foregroundColor(.white.opacity(0.5))
            
            // Remove button for individual meals
            Button(action: {
                withAnimation(.spring(duration: 0.3)) {
                    viewModel.removeMealAtIndex(for: day, slotId: slot.id.uuidString, index: index)
                }
            }) {
                Image(systemName: "minus.circle")
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.3))
            }
        }
        .padding(.vertical, 4)
    }
    
    private var totalSection: some View {
        VStack(spacing: 4) {
            Divider()
                .background(Color.white.opacity(0.2))
                .padding(.vertical, 4)
            
            HStack {
                Text("Total")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
                Spacer()
                Text("\(slot.totalCalories) cal")
                    .font(.system(size: 14, weight: .medium))
                    .foregroundColor(.white.opacity(0.7))
            }
            
            // Calculate and show macros if available
            let totalProtein = slot.meals.compactMap { $0.protein }.reduce(0, +)
            let totalCarbs = slot.meals.compactMap { $0.carbs }.reduce(0, +)
            let totalFat = slot.meals.compactMap { $0.fat }.reduce(0, +)
            
            if totalProtein > 0 || totalCarbs > 0 || totalFat > 0 {
                HStack(spacing: 12) {
                    if totalProtein > 0 {
                        Text("P: \(totalProtein)g")
                            .font(.system(size: 12))
                            .foregroundColor(.white.opacity(0.6))
                    }
                    if totalCarbs > 0 {
                        Text("C: \(totalCarbs)g")
                            .font(.system(size: 12))
                            .foregroundColor(.white.opacity(0.6))
                    }
                    if totalFat > 0 {
                        Text("F: \(totalFat)g")
                            .font(.system(size: 12))
                            .foregroundColor(.white.opacity(0.6))
                    }
                    Spacer()
                }
            }
        }
        .padding(.top, 4)
        .padding(.horizontal, 4)
    }
}