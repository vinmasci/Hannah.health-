//
//  MealPlanTypes.swift
//  HannahHealth
//
//  Types and models for meal planning
//

import Foundation

// MARK: - Day of Week
enum DayOfWeek: String, CaseIterable {
    case monday, tuesday, wednesday, thursday, friday, saturday, sunday
    
    var name: String {
        switch self {
        case .monday: return "Monday"
        case .tuesday: return "Tuesday"
        case .wednesday: return "Wednesday"
        case .thursday: return "Thursday"
        case .friday: return "Friday"
        case .saturday: return "Saturday"
        case .sunday: return "Sunday"
        }
    }
}

// MARK: - Meal Type
enum MealType: String, CaseIterable {
    case breakfast, lunch, dinner
    
    var displayName: String {
        switch self {
        case .breakfast: return "Breakfast"
        case .lunch: return "Lunch"
        case .dinner: return "Dinner"
        }
    }
}

// MARK: - Meal Slot Type
enum MealSlotType: Equatable, Hashable {
    case meal(MealType)
    case snacks
    
    var displayName: String {
        switch self {
        case .meal(let type):
            return type.displayName
        case .snacks:
            return "Snack"
        }
    }
}

// MARK: - Meal
struct Meal: Equatable, Hashable {
    var name: String
    let calories: Int
    let protein: Int?
    let carbs: Int?
    let fat: Int?
    let confidence: Double?
    let id = UUID()
    
    static func == (lhs: Meal, rhs: Meal) -> Bool {
        lhs.id == rhs.id
    }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
    }
}

// MARK: - Day Meal Slot
struct DayMealSlot: Identifiable, Equatable, Hashable {
    let id = UUID()
    var slotType: MealSlotType
    var time: String
    var meals: [Meal]
    
    init(slotType: MealSlotType, time: String, meals: [Meal] = []) {
        self.slotType = slotType
        self.time = time
        self.meals = meals
    }
    
    static func == (lhs: DayMealSlot, rhs: DayMealSlot) -> Bool {
        lhs.id == rhs.id &&
        lhs.slotType == rhs.slotType &&
        lhs.time == rhs.time &&
        lhs.meals == rhs.meals
    }
    
    func hash(into hasher: inout Hasher) {
        hasher.combine(id)
        hasher.combine(slotType)
        hasher.combine(time)
        hasher.combine(meals.map { $0.id })
    }
    
    var totalCalories: Int {
        meals.reduce(0) { $0 + $1.calories }
    }
}

// MARK: - Meal Slot Selection
struct MealSlot: Equatable, Hashable {
    let day: DayOfWeek
    let slotId: UUID
}