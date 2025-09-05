//
//  MealPlanKanbanView.swift
//  HannahHealth
//
//  Kanban-style meal plan with integrated chat panel
//

import SwiftUI
import Foundation

struct MealPlanKanbanView: View {
    @StateObject private var viewModel = MealPlanViewModel()
    @StateObject private var chatViewModel = MealPlanChatViewModel()
    @StateObject private var foodSearchService = FoodSearchService()
    @State private var scrollOffset: CGFloat = 0
    @State private var selectedMealSlots: Set<MealSlot> = []
    @State private var editingTimeSlot: String? = nil
    @State private var editingMealName: String? = nil
    @State private var editingMealType: String? = nil
    @State private var tempTimeValue: String = ""
    @State private var tempMealName: String = ""
    @State private var tempMealType: String = ""
    @State private var showTimePicker = false
    @State private var selectedTime = Date()
    @FocusState private var isMealNameFocused: Bool
    @FocusState private var isMealTypeFocused: Bool
    @State private var searchingFood = false
    @State private var searchingSlotId: String? = nil
    @State private var shouldFocusNewMeal = false
    
    var body: some View {
        GeometryReader { geometry in
            ScrollView(.horizontal, showsIndicators: false) {
                HStack(spacing: 20) {
                    // Column 1: Meal Plan
                    mealPlanColumn
                        .frame(width: geometry.size.width - 40)
                    
                    // Column 2: Chat Panel
                    VStack {
                        Spacer().frame(height: 5)
                        
                        MealPlanChatPanel(
                            viewModel: chatViewModel,
                            selectedSlots: $selectedMealSlots
                        )
                        .frame(width: geometry.size.width - 40)
                        .frame(maxHeight: .infinity)
                        
                        Spacer().frame(height: 80)
                    }
                }
                .padding(.horizontal, 20)
            }
            .scrollDisabled(false)
            .onAppear {
                chatViewModel.setMealPlanViewModel(viewModel)
            }
        }
        .padding(.vertical, 20)
        .sheet(isPresented: $showTimePicker) {
            TimePickerSheet(
                selectedTime: $selectedTime,
                isPresented: $showTimePicker,
                onSave: { newTime in
                    let formatter = DateFormatter()
                    formatter.dateFormat = "h:mm a"
                    let timeString = formatter.string(from: newTime)
                    if let slotId = editingTimeSlot {
                        for day in DayOfWeek.allCases {
                            if viewModel.getSlots(for: day).contains(where: { $0.id.uuidString == slotId }) {
                                viewModel.updateSlotTime(for: day, slotId: slotId, newTime: timeString)
                                break
                            }
                        }
                    }
                    editingTimeSlot = nil
                }
            )
        }
        .onChange(of: selectedMealSlots) { _ in
            chatViewModel.setSelectedSlots(selectedMealSlots)
        }
    }
    
    private var mealPlanColumn: some View {
        ScrollView {
            VStack(spacing: 16) {
                MealPlanHeader()
                
                // Days of the week
                ForEach(DayOfWeek.allCases, id: \.self) { day in
                    DayCard(
                        day: day,
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
            }
            .padding(.vertical, 20)
        }
    }
}