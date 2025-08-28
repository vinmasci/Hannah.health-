//
//  MockDataGenerator.swift
//  HannahHealth
//
//  Created on 27/8/2025.
//

import Foundation

class MockDataGenerator {
    static let shared = MockDataGenerator()
    
    private init() {}
    
    // Generate 90 days of mock data
    func generateHistoricalData(days: Int = 90) -> [DayData] {
        var data: [DayData] = []
        let today = Date()
        var currentWeight: Double = 75.0 // Starting weight in kg
        
        for daysAgo in (0..<days).reversed() {
            guard let date = Calendar.current.date(byAdding: .day, value: -daysAgo, to: today) else { continue }
            
            // Determine if it's a weekend
            let weekday = Calendar.current.component(.weekday, from: date)
            let isWeekend = weekday == 1 || weekday == 7
            
            // Generate calories with variation (weekends tend to be higher)
            let baseCalories = isWeekend ? 2200 : 1900
            let calories = baseCalories + Int.random(in: -300...300)
            
            // Generate macros proportionally
            let protein = Double(calories) * 0.3 / 4 // 30% from protein, 4 cal/g
            let carbs = Double(calories) * 0.4 / 4   // 40% from carbs, 4 cal/g
            let fat = Double(calories) * 0.3 / 9     // 30% from fat, 9 cal/g
            
            // Generate activity data
            let water = isWeekend ? Int.random(in: 1500...2500) : Int.random(in: 2000...3000)
            let steps = isWeekend ? Int.random(in: 3000...8000) : Int.random(in: 5000...12000)
            let sleep = isWeekend ? Double.random(in: 7.5...9.0) : Double.random(in: 6.0...8.0)
            let workoutMinutes = Bool.random() ? Int.random(in: 20...60) : 0
            
            // Weight tracking (gradual loss trend)
            if daysAgo % 7 == 0 { // Weekly weigh-ins
                currentWeight -= Double.random(in: 0.1...0.3) // Gradual weight loss
                currentWeight = max(currentWeight, 70.0) // Minimum weight
            }
            let weight = daysAgo % 7 == 0 ? currentWeight : nil
            
            // Generate meals
            let meals = generateMeals(for: date, totalCalories: calories)
            
            let dayData = DayData(
                date: date,
                calories: calories,
                protein: protein,
                carbs: carbs,
                fat: fat,
                water: water,
                steps: steps,
                sleep: sleep,
                workoutMinutes: workoutMinutes,
                weight: weight,
                meals: meals
            )
            
            data.append(dayData)
        }
        
        return data
    }
    
    // Generate realistic meals for a day
    private func generateMeals(for date: Date, totalCalories: Int) -> [FoodEntry] {
        var meals: [FoodEntry] = []
        
        // Breakfast (20-25% of calories)
        let breakfastCalories = Int(Double(totalCalories) * Double.random(in: 0.20...0.25))
        let formatter = ISO8601DateFormatter()
        meals.append(FoodEntry(
            id: UUID().uuidString,
            userId: "mock-user",
            foodName: breakfastOptions.randomElement()!,
            calories: breakfastCalories,
            protein: Double(breakfastCalories) * 0.25 / 4,
            carbs: Double(breakfastCalories) * 0.5 / 4,
            fat: Double(breakfastCalories) * 0.25 / 9,
            confidence: 90,
            imageUrl: nil,
            createdAt: formatter.string(from: Calendar.current.date(bySettingHour: 8, minute: 0, second: 0, of: date)!),
            mealType: "breakfast"
        ))
        
        // Lunch (30-35% of calories)
        let lunchCalories = Int(Double(totalCalories) * Double.random(in: 0.30...0.35))
        meals.append(FoodEntry(
            id: UUID().uuidString,
            userId: "mock-user",
            foodName: lunchOptions.randomElement()!,
            calories: lunchCalories,
            protein: Double(lunchCalories) * 0.35 / 4,
            carbs: Double(lunchCalories) * 0.4 / 4,
            fat: Double(lunchCalories) * 0.25 / 9,
            confidence: 85,
            imageUrl: nil,
            createdAt: formatter.string(from: Calendar.current.date(bySettingHour: 12, minute: 30, second: 0, of: date)!),
            mealType: "lunch"
        ))
        
        // Dinner (35-40% of calories)
        let dinnerCalories = Int(Double(totalCalories) * Double.random(in: 0.35...0.40))
        meals.append(FoodEntry(
            id: UUID().uuidString,
            userId: "mock-user",
            foodName: dinnerOptions.randomElement()!,
            calories: dinnerCalories,
            protein: Double(dinnerCalories) * 0.4 / 4,
            carbs: Double(dinnerCalories) * 0.35 / 4,
            fat: Double(dinnerCalories) * 0.25 / 9,
            confidence: 88,
            imageUrl: nil,
            createdAt: formatter.string(from: Calendar.current.date(bySettingHour: 19, minute: 0, second: 0, of: date)!),
            mealType: "dinner"
        ))
        
        // Snack (remaining calories)
        let snackCalories = totalCalories - breakfastCalories - lunchCalories - dinnerCalories
        if snackCalories > 100 {
            meals.append(FoodEntry(
                id: UUID().uuidString,
                userId: "mock-user",
                foodName: snackOptions.randomElement()!,
                calories: snackCalories,
                protein: Double(snackCalories) * 0.15 / 4,
                carbs: Double(snackCalories) * 0.6 / 4,
                fat: Double(snackCalories) * 0.25 / 9,
                confidence: 80,
                imageUrl: nil,
                createdAt: formatter.string(from: Calendar.current.date(bySettingHour: 15, minute: 0, second: 0, of: date)!),
                mealType: "snack"
            ))
        }
        
        return meals
    }
    
    // Meal options for variety
    private let breakfastOptions = [
        "Greek Yogurt with Berries",
        "Oatmeal with Banana",
        "Scrambled Eggs and Toast",
        "Avocado Toast",
        "Protein Smoothie",
        "Overnight Oats"
    ]
    
    private let lunchOptions = [
        "Grilled Chicken Salad",
        "Turkey Sandwich",
        "Quinoa Bowl",
        "Caesar Salad with Chicken",
        "Tuna Wrap",
        "Veggie Burger"
    ]
    
    private let dinnerOptions = [
        "Salmon with Rice",
        "Chicken Breast and Vegetables",
        "Pasta with Marinara",
        "Steak and Sweet Potato",
        "Stir Fry with Tofu",
        "Grilled Fish Tacos"
    ]
    
    private let snackOptions = [
        "Apple with Almond Butter",
        "Protein Bar",
        "Mixed Nuts",
        "Hummus and Carrots",
        "Greek Yogurt",
        "Trail Mix"
    ]
    
    // Group data by weeks
    func groupDataByWeeks(_ days: [DayData]) -> [WeekData] {
        var weeks: [WeekData] = []
        var currentWeek: [DayData] = []
        var weekStart: Date?
        
        for day in days {
            let calendar = Calendar.current
            let weekday = calendar.component(.weekday, from: day.date)
            
            // Start new week on Monday (weekday 2)
            if weekday == 2 || currentWeek.isEmpty {
                if !currentWeek.isEmpty, let start = weekStart {
                    let end = currentWeek.last!.date
                    weeks.append(WeekData(startDate: start, endDate: end, days: currentWeek))
                }
                currentWeek = [day]
                weekStart = day.date
            } else {
                currentWeek.append(day)
            }
        }
        
        // Add last week
        if !currentWeek.isEmpty, let start = weekStart {
            let end = currentWeek.last!.date
            weeks.append(WeekData(startDate: start, endDate: end, days: currentWeek))
        }
        
        return weeks
    }
    
    // Group data by months
    func groupDataByMonths(_ days: [DayData]) -> [MonthData] {
        var months: [MonthData] = []
        let calendar = Calendar.current
        
        // Group days by month
        let grouped = Dictionary(grouping: days) { day in
            calendar.dateComponents([.year, .month], from: day.date)
        }
        
        for (components, monthDays) in grouped {
            guard let year = components.year, let month = components.month else { continue }
            let weeks = groupDataByWeeks(monthDays.sorted { $0.date < $1.date })
            months.append(MonthData(month: month, year: year, weeks: weeks))
        }
        
        return months.sorted { 
            if $0.year != $1.year {
                return $0.year < $1.year
            }
            return $0.month < $1.month
        }
    }
}