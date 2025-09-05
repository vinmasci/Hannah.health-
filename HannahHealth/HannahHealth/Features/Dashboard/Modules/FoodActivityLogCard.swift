//
//  FoodActivityLogCard.swift
//  HannahHealth
//
//  Extracted from DashboardView.swift to comply with 350 line limit
//

import SwiftUI
import Combine
import HealthKit

struct FoodActivityLogCard: View {
    let currentDate: Date
    @StateObject private var viewModel = FoodActivityLogViewModel()
    @State private var itemToDelete: FoodEntry?
    @State private var showingDeleteAlert = false
    
    var body: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("Food & Activity Log")
                    .font(Theme.headline)
                    .foregroundColor(.white)
                    .fontWeight(.semibold)
                
                Spacer()
            }
            
            if viewModel.isLoading {
                HStack {
                    Spacer()
                    ProgressView()
                        .progressViewStyle(CircularProgressViewStyle(tint: .white))
                    Spacer()
                }
                .padding()
            } else if viewModel.foodItems.isEmpty {
                Text("No food logged yet today")
                    .font(.footnote)
                    .foregroundColor(.gray)
                    .padding()
            } else {
                ScrollView {
                    VStack(spacing: 8) {
                        ForEach(Array(viewModel.foodItems.enumerated()), id: \.element.id) { index, item in
                            // Exercise entries have negative calories and null meal type
                            let isExercise = item.calories < 0
                            
                            // Check if this is the first item of a meal group
                            let isFirstInMealGroup = index == 0 || 
                                viewModel.foodItems[index - 1].mealType != item.mealType ||
                                isExercise || // Always show icon for exercise
                                viewModel.foodItems[index - 1].calories < 0 // Previous was exercise
                            
                            HStack(spacing: 8) {
                                FoodItem(
                                    name: item.foodName,
                                    calories: isExercise ? "\(abs(item.calories)) burned" : "\(item.calories) cal",
                                    confidence: item.confidence ?? 0.85,
                                    time: formatTimeForMeal(item.createdAt ?? "", mealType: item.mealType),
                                    mealType: isExercise ? "exercise" : item.mealType,
                                    isExercise: isExercise,
                                    showIcon: isFirstInMealGroup
                                )
                                
                                // Apple Health workouts have nil mealType and contain duration info like "Running (30 min)"
                                // Manual exercise entries have mealType = "exercise"
                                let isAppleHealthWorkout = item.mealType == nil && item.calories < 0 && item.foodName.contains("(")
                                
                                if isAppleHealthWorkout {
                                    // Show Apple Health indicator for workouts from Health app
                                    Image(systemName: "heart.fill")
                                        .font(.system(size: 12))
                                        .foregroundColor(Theme.coral.opacity(0.7))
                                } else {
                                    // Delete button (for all manual entries including manual exercise)
                                    Button(action: {
                                        itemToDelete = item
                                        showingDeleteAlert = true
                                    }) {
                                        Image(systemName: "trash")
                                            .font(.system(size: 14))
                                            .foregroundColor(.red.opacity(0.7))
                                    }
                                }
                            }
                            .padding(.trailing, 8)
                        }
                    }
                }
                .frame(maxHeight: 300)
            }
        }
        .padding(20)
        .glassCard()
        .onAppear {
            // Only update if date is different
            if !Calendar.current.isDate(viewModel.currentDate, inSameDayAs: currentDate) {
                viewModel.updateDate(currentDate)
            }
        }
        .onChange(of: currentDate) { _, newDate in
            viewModel.updateDate(newDate)
        }
        .alert("Delete Item", isPresented: $showingDeleteAlert) {
            Button("Cancel", role: .cancel) { }
            Button("Delete", role: .destructive) {
                if let item = itemToDelete {
                    Task {
                        await viewModel.deleteFoodItem(item)
                    }
                }
            }
        } message: {
            if let item = itemToDelete {
                let itemName = item.calories < 0 ? item.foodName : "\(item.foodName) (\(item.calories) cal)"
                Text("Are you sure you want to delete \"\(itemName)\"?")
            }
        }
    }
    
    private func formatTime(_ dateString: String) -> String {
        let formatter = ISO8601DateFormatter()
        guard let date = formatter.date(from: dateString) else { return "" }
        
        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "h:mm a"
        return timeFormatter.string(from: date)
    }
    
    private func formatTimeForMeal(_ dateString: String, mealType: String?) -> String {
        // Debug logging to understand the issue
        print("🕐 formatTimeForMeal called with:")
        print("   dateString: '\(dateString)'")
        print("   mealType: '\(mealType ?? "nil")'")
        
        // Default times for each meal type
        let defaultTimes: [String: (hour: Int, minute: Int)] = [
            "breakfast": (9, 0),           // 9:00 AM
            "morning snack": (10, 30),     // 10:30 AM
            "lunch": (12, 30),             // 12:30 PM
            "afternoon snack": (15, 0),    // 3:00 PM
            "dinner": (18, 30),            // 6:30 PM
            "evening snack": (20, 30),     // 8:30 PM
            "snack": (15, 0)               // Default snack time 3:00 PM
        ]
        
        // Parse the actual logged time
        let formatter = ISO8601DateFormatter()
        guard let loggedDate = formatter.date(from: dateString) else { 
            print("❌ Failed to parse date, returning empty string")
            return "" 
        }
        
        // Get the hour component to check if it's in the right time window
        let calendar = Calendar.current
        let hour = calendar.component(.hour, from: loggedDate)
        
        // Determine if we should use default time based on meal type and actual time
        var shouldUseDefault = false
        var displayDate = loggedDate
        
        if let meal = mealType?.lowercased() {
            // Define reasonable time windows for each meal
            let timeWindows: [String: ClosedRange<Int>] = [
                "breakfast": 5...11,
                "morning snack": 9...12,
                "lunch": 11...14,
                "afternoon snack": 14...17,
                "dinner": 17...21,
                "evening snack": 20...23,
                "snack": 9...21
            ]
            
            // Check if logged outside normal meal window
            if let window = timeWindows[meal], !window.contains(hour) {
                shouldUseDefault = true
                
                // Create a new date with the default time but same day
                if let defaultTime = defaultTimes[meal] {
                    var components = calendar.dateComponents([.year, .month, .day], from: loggedDate)
                    components.hour = defaultTime.hour
                    components.minute = defaultTime.minute
                    if let newDate = calendar.date(from: components) {
                        displayDate = newDate
                    }
                }
            }
        }
        
        // Format the display time
        let timeFormatter = DateFormatter()
        timeFormatter.dateFormat = "h:mm a"
        let result = timeFormatter.string(from: displayDate)
        print("🕐 Returning formatted time: '\(result)'")
        return result
    }
}

// View Model for Food Activity Log
@MainActor
class FoodActivityLogViewModel: ObservableObject {
    @Published var foodItems: [FoodEntry] = []
    @Published var isLoading = false
    private let supabaseService = SupabaseService.shared
    private let healthKitService = HealthKitService()
    private var cancellables = Set<AnyCancellable>()
    var currentDate: Date = Date()  // Made non-private so view can access it
    
    init() {
        print("🆕 FoodActivityLogViewModel INIT")
        
        // Load initial data on init
        Task {
            await loadInitialData()
        }
        
        // Listen for food logged notifications
        NotificationCenter.default.publisher(for: NSNotification.Name("FoodLogged"))
            .sink { [weak self] notification in
                guard let self = self else { return }
                print("📊 FoodLogged notification received")
                
                // Only reload if we're viewing today's data
                let calendar = Calendar.current
                if calendar.isDateInToday(self.currentDate) {
                    print("  📊 We're viewing today, so reloading...")
                    if let userInfo = notification.userInfo,
                       let food = userInfo["food"] as? String,
                       let calories = userInfo["calories"] as? Int {
                        print("  📊 Food logged: \(food) - \(calories) calories")
                    }
                    self.loadTodaysFoodItems()
                } else {
                    print("  📊 We're viewing \(self.currentDate), not today, so NOT reloading")
                }
            }
            .store(in: &cancellables)
        
        // Listen for food deleted notifications
        NotificationCenter.default.publisher(for: NSNotification.Name("FoodDeleted"))
            .sink { [weak self] notification in
                print("📊 FoodDeleted notification received")
                if let userInfo = notification.userInfo,
                   let entryId = userInfo["entryId"] as? String {
                    print("📊 Food deleted with id: \(entryId)")
                    // Remove from local array without reloading
                    self?.foodItems.removeAll { $0.id == entryId }
                }
            }
            .store(in: &cancellables)
    }
    
    func updateDate(_ date: Date) {
        guard !Calendar.current.isDate(currentDate, inSameDayAs: date) else { return }
        print("📊 FoodActivityLogCard updating date from \(currentDate) to \(date)")
        self.currentDate = date
        Task {
            await loadFoodItems()
        }
    }
    
    func loadInitialData() async {
        await loadFoodItems()
    }
    
    func loadTodaysFoodItems() {
        Task {
            await loadFoodItems()
        }
    }
    
    private func loadFoodItems() async {
        isLoading = true
        print("📊 Loading food items for \(currentDate) from database...")
        do {
                // Fetch manual entries from database for the selected date
                var allItems = try await supabaseService.getFoodEntries(for: currentDate)
                print("📊 Loaded \(allItems.count) food items from database")
                
                // Fetch Apple Health workouts and add them as FoodEntry items
                let workouts = await fetchTodaysWorkouts()
                allItems.append(contentsOf: workouts)
                print("💪 Added \(workouts.count) Apple Health workouts")
                
                self.foodItems = allItems.sorted { item1, item2 in
                    // Get sort times based on meal type
                    let sortTime1 = getSortTime(for: item1)
                    let sortTime2 = getSortTime(for: item2)
                    return sortTime1 < sortTime2  // Earliest first
                }
                
                // Calculate total calories and meal breakdown
                // Exercise has negative calories, food has positive
                let foodItems = allItems.filter { $0.calories > 0 }
                let exerciseItems = allItems.filter { $0.calories < 0 }
                
                let totalFoodCalories = foodItems.reduce(0) { $0 + $1.calories }
                let totalExerciseCalories = abs(exerciseItems.reduce(0) { $0 + $1.calories })
                
                print("📊 Total food calories: \(totalFoodCalories)")
                print("💪 Total exercise calories: \(totalExerciseCalories)")
                
                // Calculate calories by meal type (only for food)
                var mealBreakdown: [String: Int] = [
                    "breakfast": 0,
                    "lunch": 0,
                    "dinner": 0,
                    "snack": 0,
                    "morning snack": 0,
                    "afternoon snack": 0,
                    "evening snack": 0
                ]
                
                for item in foodItems {
                    let mealType = item.mealType?.lowercased() ?? "snack"
                    mealBreakdown[mealType, default: 0] += item.calories
                }
                
                print("🍽️ Meal Breakdown:")
                print("  Breakfast: \(mealBreakdown["breakfast"] ?? 0)")
                print("  Lunch: \(mealBreakdown["lunch"] ?? 0)")
                print("  Dinner: \(mealBreakdown["dinner"] ?? 0)")
                print("  Morning Snack: \(mealBreakdown["morning snack"] ?? 0)")
                print("  Afternoon Snack: \(mealBreakdown["afternoon snack"] ?? 0)")
                print("  Evening Snack: \(mealBreakdown["evening snack"] ?? 0)")
                print("  Snack: \(mealBreakdown["snack"] ?? 0)")
                print("  Total from breakdown: \(mealBreakdown.values.reduce(0, +))")
                print("  Total food calories: \(totalFoodCalories)")
                
                print("📤 FoodActivityLogCard posting UpdateDashboardCalories notification")
                print("  📤 Date: \(currentDate)")
                print("  📤 Total food calories: \(totalFoodCalories)")
                print("  📤 Exercise calories: \(totalExerciseCalories)")
                NotificationCenter.default.post(
                    name: NSNotification.Name("UpdateDashboardCalories"),
                    object: nil,
                    userInfo: [
                        "calories": totalFoodCalories,  // Only food calories
                        "exerciseCalories": totalExerciseCalories,  // Exercise calories burned
                        "mealBreakdown": mealBreakdown,
                        "date": currentDate  // Include the date this data is for
                    ]
                )
            } catch {
                print("❌ Failed to load food items: \(error)")
                // Load mock data as fallback
                loadMockData()
            }
        isLoading = false
    }
    
    private func loadMockData() {
        // Don't load mock data - keep empty if no real data
        foodItems = []
    }
    
    private func fetchTodaysWorkouts() async -> [FoodEntry] {
        // Request HealthKit authorization if needed
        _ = await healthKitService.requestAuthorization()
        
        // Get the selected date range
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: currentDate)
        let endOfDay = calendar.date(byAdding: .day, value: 1, to: startOfDay)!
        
        // Fetch workouts from HealthKit
        let predicate = HKQuery.predicateForSamples(
            withStart: startOfDay,
            end: endOfDay,
            options: .strictStartDate
        )
        
        return await withCheckedContinuation { continuation in
            let query = HKSampleQuery(
                sampleType: .workoutType(),
                predicate: predicate,
                limit: HKObjectQueryNoLimit,
                sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)]
            ) { _, samples, error in
                guard let workouts = samples as? [HKWorkout] else {
                    continuation.resume(returning: [])
                    return
                }
                
                // Convert workouts to FoodEntry format
                let workoutEntries = workouts.map { workout -> FoodEntry in
                    let calories = Int(workout.totalEnergyBurned?.doubleValue(for: .kilocalorie()) ?? 0)
                    let workoutName = self.getWorkoutName(workout)
                    let duration = Int(workout.duration / 60) // Convert to minutes
                    
                    return FoodEntry(
                        id: workout.uuid.uuidString,  // Use workout UUID as ID
                        userId: AuthManager.shared.user?.id.uuidString ?? "",
                        foodName: "\(workoutName) (\(duration) min)",
                        calories: -calories,  // Negative for exercise
                        protein: 0,
                        carbs: 0,
                        fat: 0,
                        confidence: 0.95,  // High confidence for Apple Health data
                        imageUrl: nil,
                        createdAt: workout.startDate.ISO8601Format(),
                        mealType: nil  // nil for exercise
                    )
                }
                
                continuation.resume(returning: workoutEntries)
            }
            
            HKHealthStore().execute(query)
        }
    }
    
    private func getWorkoutName(_ workout: HKWorkout) -> String {
        switch workout.workoutActivityType {
        case .running: return "Running"
        case .walking: return "Walking"
        case .cycling: return "Cycling"
        case .swimming: return "Swimming"
        case .functionalStrengthTraining: return "Strength Training"
        case .traditionalStrengthTraining: return "Weight Training"
        case .crossTraining: return "Cross Training"
        case .yoga: return "Yoga"
        case .pilates: return "Pilates"
        case .dance: return "Dance"
        case .elliptical: return "Elliptical"
        case .rowing: return "Rowing"
        case .stairClimbing: return "Stair Climbing"
        case .highIntensityIntervalTraining: return "HIIT"
        case .mixedCardio: return "Cardio"
        default: return "Workout"
        }
    }
    
    private func getSortTime(for item: FoodEntry) -> Date {
        // Default times for each meal type (in minutes from midnight)
        let sortOrderMinutes: [String: Int] = [
            "breakfast": 9 * 60,           // 9:00 AM = 540 min
            "morning snack": 10 * 60 + 30, // 10:30 AM = 630 min
            "lunch": 12 * 60 + 30,         // 12:30 PM = 750 min
            "afternoon snack": 15 * 60,    // 3:00 PM = 900 min
            "dinner": 18 * 60 + 30,        // 6:30 PM = 1110 min
            "evening snack": 20 * 60 + 30, // 8:30 PM = 1230 min
            "snack": 15 * 60,              // Default snack = 900 min
            "exercise": 0                  // Exercise items sorted by actual time
        ]
        
        // Parse the actual logged time
        let formatter = ISO8601DateFormatter()
        guard let loggedDate = formatter.date(from: item.createdAt ?? "") else {
            return Date()
        }
        
        // For exercise, use actual time
        if item.calories < 0 {
            return loggedDate
        }
        
        let calendar = Calendar.current
        let hour = calendar.component(.hour, from: loggedDate)
        
        // Check if we should use sort order based on meal type
        if let meal = item.mealType?.lowercased() {
            // Define reasonable time windows for each meal
            let timeWindows: [String: ClosedRange<Int>] = [
                "breakfast": 5...11,
                "morning snack": 9...12,
                "lunch": 11...14,
                "afternoon snack": 14...17,
                "dinner": 17...21,
                "evening snack": 20...23,
                "snack": 9...21
            ]
            
            // If logged outside normal window, use default sort time
            if let window = timeWindows[meal], !window.contains(hour) {
                if let sortMinutes = sortOrderMinutes[meal] {
                    var components = calendar.dateComponents([.year, .month, .day], from: loggedDate)
                    components.hour = sortMinutes / 60
                    components.minute = sortMinutes % 60
                    if let sortDate = calendar.date(from: components) {
                        return sortDate
                    }
                }
            }
        }
        
        // Use actual time if within normal window
        return loggedDate
    }
    
    func deleteFoodItem(_ item: FoodEntry) async {
        do {
            try await supabaseService.deleteFoodEntry(item.id)
            
            // Remove from local array
            await MainActor.run {
                foodItems.removeAll { $0.id == item.id }
                
                // Recalculate totals after deletion
                // Separate food and exercise items
                let remainingFoodItems = foodItems.filter { $0.calories > 0 }
                let remainingExerciseItems = foodItems.filter { $0.calories < 0 }
                
                let totalFoodCalories = remainingFoodItems.reduce(0) { $0 + $1.calories }
                let totalExerciseCalories = abs(remainingExerciseItems.reduce(0) { $0 + $1.calories })
                
                // Recalculate meal breakdown (only for food)
                var mealBreakdown: [String: Int] = [
                    "breakfast": 0,
                    "lunch": 0,
                    "dinner": 0,
                    "snack": 0,
                    "morning snack": 0,
                    "afternoon snack": 0,
                    "evening snack": 0
                ]
                
                for foodItem in remainingFoodItems {
                    let mealType = foodItem.mealType?.lowercased() ?? "snack"
                    mealBreakdown[mealType, default: 0] += foodItem.calories
                }
                
                // Post notification to update dashboard
                print("📤 FoodActivityLogCard posting UpdateDashboardCalories notification")
                print("  📤 Date: \(currentDate)")
                print("  📤 Total food calories: \(totalFoodCalories)")
                print("  📤 Exercise calories: \(totalExerciseCalories)")
                NotificationCenter.default.post(
                    name: NSNotification.Name("UpdateDashboardCalories"),
                    object: nil,
                    userInfo: [
                        "calories": totalFoodCalories,  // Only food calories
                        "exerciseCalories": totalExerciseCalories,  // Exercise calories burned
                        "mealBreakdown": mealBreakdown,
                        "date": currentDate  // Include the date this data is for
                    ]
                )
            }
            
            print("✅ Successfully deleted food item: \(item.foodName)")
        } catch {
            print("❌ Failed to delete food item: \(error)")
        }
    }
}