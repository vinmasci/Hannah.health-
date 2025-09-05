//
//  DashboardViewModel.swift
//  HannahHealth
//
//  Created on 27/8/2025.
//

import Foundation
import Combine
import HealthKit

@MainActor
final class DashboardViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var todaySteps: Int = 0
    @Published var stepsGoal: Int = 10000  // Will be calculated dynamically
    @Published var stepsProgress: Double = 0.0
    
    @Published var caloriesBurned: Int = 0  // From Apple Health only
    @Published var manuallyLoggedExerciseCalories: Int = 0  // From our Quick Log
    @Published var shouldShowActiveEnergyPrompt: Bool = false  // Show help for 0 active energy
    @Published var caloriesBurnedGoal: Int = 400
    @Published var caloriesProgress: Double = 0.0
    
    @Published var isLoadingHealthData = false
    @Published var healthKitAuthorized = false
    @Published var isLoadingDashboardData = false  // Overall loading state for dashboard
    
    // User Profile Data (would come from onboarding/settings)
    @Published var userWeight: Double = 70.0 // kg - default 154 lbs
    @Published var userHeight: Double = 178.0 // cm - default 5'10"
    @Published var userAge: Int = 30 // years - default
    @Published var userGender: String = "male" // for BMR calculation
    @Published var dailyDeficitTarget: Int = 500 // Target daily calorie deficit
    @Published var caloriesConsumed: Int = 0 // From food logging
    @Published var basalMetabolicRate: Int = 2200 // Actually stores TDEE, not pure BMR
    
    // Meal breakdown data
    @Published var mealCalories: [String: Int] = [
        "breakfast": 0,
        "lunch": 0,
        "dinner": 0,
        "snack": 0
    ]
    
    // Goal Settings
    @Published var selectedGoal: DailyGoalType = .loseWeight
    @Published var weightLossRate: WeightLossRate = .moderate
    @Published var selectedCondition: MedicalCondition = .diabetes
    
    // Weight tracking data
    @Published var weightLogs: [WeightDataPoint] = []
    @Published var isLoadingWeight = false
    @Published var useMetric: Bool = false  // User's metric preference
    
    // MARK: - Navigation State
    @Published var selectedPeriod: ViewPeriod = .day
    @Published var currentDate: Date = Date()
    
    // MARK: - Dashboard Data
    @Published var allDaysData: [DayData] = []
    @Published var currentDayData: DayData?
    @Published var currentWeekData: WeekData?
    @Published var currentMonthData: MonthData?
    
    // MARK: - Dependencies
    private let healthKitService: HealthKitServiceProtocol
    private var cancellables = Set<AnyCancellable>()
    private var midnightTimer: Timer?
    private var healthKitObserverActive = false
    private let userDefaults = UserDefaults.standard
    
    // MARK: - Init
    init(healthKitService: HealthKitServiceProtocol = HealthKitService()) {
        self.healthKitService = healthKitService
        // Set initial loading state
        self.isLoadingDashboardData = true
        setupHealthKit()
        // loadMockData() // DISABLED - using real HealthKit data
        setupDateObserver()
        loadUserProfile()
        calculateBMR()
        
        // Listen for profile updates
        NotificationCenter.default.publisher(for: NSNotification.Name("UserProfileUpdated"))
            .sink { [weak self] _ in
                print("📱 Profile updated notification received")
                self?.loadUserProfile()
                self?.calculateBMR()
            }
            .store(in: &cancellables)
        
        // Listen for calorie updates from food logging
        NotificationCenter.default.publisher(for: NSNotification.Name("UpdateDashboardCalories"))
            .sink { [weak self] notification in
                guard let self = self else { return }
                print("📢 UpdateDashboardCalories notification received")
                
                // Check if this notification is for the date we're currently viewing
                if let notificationDate = notification.userInfo?["date"] as? Date {
                    let calendar = Calendar.current
                    if !calendar.isDate(notificationDate, inSameDayAs: self.currentDate) {
                        print("  ⚠️ Notification is for \(notificationDate) but we're viewing \(self.currentDate) - IGNORING")
                        return
                    }
                    print("  ✅ Notification date matches current view date")
                }
                
                if let calories = notification.userInfo?["calories"] as? Int {
                    print("  📢 Notification wants to set calories to: \(calories)")
                    print("  📢 Current date is: \(self.currentDate)")
                    self.updateCaloriesConsumed(calories)
                }
                if let mealBreakdown = notification.userInfo?["mealBreakdown"] as? [String: Int] {
                    print("  📢 Updating meal breakdown")
                    self.mealCalories = mealBreakdown
                }
                // Store manually logged exercise only if Active Energy is low
                if let loggedExerciseCalories = notification.userInfo?["exerciseCalories"] as? Int {
                    // Only use manual exercise if Active Energy is very low
                    if self.caloriesBurned < 200 {
                        self.manuallyLoggedExerciseCalories = loggedExerciseCalories
                        print("📝 Low Active Energy, using manual exercise: \(loggedExerciseCalories) cal")
                    } else {
                        self.manuallyLoggedExerciseCalories = 0
                        print("🍎 Active Energy sufficient (\(self.caloriesBurned) cal), ignoring manual: \(loggedExerciseCalories) cal")
                    }
                    
                    // Update progress with correct total
                    let totalExercise = self.caloriesBurned + self.manuallyLoggedExerciseCalories
                    if self.caloriesBurnedGoal > 0 {
                        self.caloriesProgress = min(Double(totalExercise) / Double(self.caloriesBurnedGoal), 1.0)
                    }
                    // Recalculate TDEE with new exercise total
                    if self.pureBMR > 0 {
                        let tdee = self.calculateTDEEFromActivity(bmr: Double(self.pureBMR))
                        self.basalMetabolicRate = Int(tdee)
                    }
                }
            }
            .store(in: &cancellables)
        
        // Fetch real health data immediately
        Task {
            await fetchHealthData()
            await loadTodaysFoodData()  // Need this for initial load!
            
            // Load historical data for weekly view
            await loadHistoricalData()
            
            // Add a slight delay to ensure loading animation shows
            try? await Task.sleep(nanoseconds: 300_000_000) // 0.3 seconds
            
            // Clear initial loading state
            await MainActor.run {
                self.isLoadingDashboardData = false
            }
        }
        
        // Listen for date changes to reload data
        $currentDate
            .dropFirst() // Skip initial value
            .sink { [weak self] date in
                guard let self = self else { return }
                
                print("📅 DATE CHANGED TO: \(date)")
                print("  Previous consumed: \(self.caloriesConsumed)")
                print("  Previous steps: \(self.todaySteps)")
                
                // Set loading state when date changes
                self.isLoadingDashboardData = true
                
                // Stop or start HealthKit observer based on whether we're viewing today
                let isToday = Calendar.current.isDateInToday(date)
                print("  Is today: \(isToday)")
                
                if isToday && !self.healthKitObserverActive {
                    print("  ✅ Re-enabling HealthKit observer for today")
                    self.startHealthKitObserver()
                } else if !isToday && self.healthKitObserverActive {
                    print("  ⏸️ Disabling HealthKit observer for past date")
                    self.stopHealthKitObserver()
                }
                
                Task {
                    print("  🔄 Fetching new data for \(date)...")
                    await self.fetchHealthData()
                    // Removed loadTodaysFoodData() - FoodActivityLogCard handles this via notifications
                    print("  ✅ Data loaded - Steps: \(self.todaySteps)")
                    
                    // Add a slight delay to ensure loading animation shows
                    try? await Task.sleep(nanoseconds: 300_000_000) // 0.3 seconds
                    
                    // Clear loading state after data loads
                    await MainActor.run {
                        self.isLoadingDashboardData = false
                    }
                }
            }
            .store(in: &cancellables)
        
        // Set up timer to check for midnight rollover
        setupMidnightTimer()
    }
    
    // MARK: - Public Methods
    func refreshUserProfile() {
        loadUserProfile()
    }
    
    private func loadTodaysFoodData() async {
        print("🍔 loadTodaysFoodData called for date: \(currentDate)")
        do {
            // Load food data for the currently selected date, not always today
            let entries = try await SupabaseService.shared.getFoodEntries(for: currentDate)
            print("  Found \(entries.count) food entries")
            let totalCalories = entries.reduce(0) { $0 + $1.calories }
            
            // Calculate meal breakdown
            var mealBreakdown: [String: Int] = [
                "breakfast": 0,
                "lunch": 0,
                "dinner": 0,
                "snack": 0
            ]
            
            for entry in entries {
                if let mealType = entry.mealType {
                    // Map snack variants to "snack"
                    let mappedType = mapMealTypeForDisplay(mealType)
                    mealBreakdown[mappedType, default: 0] += entry.calories
                }
            }
            
            await MainActor.run {
                print("  🍔 Updating consumed from \(self.caloriesConsumed) to \(totalCalories)")
                self.updateCaloriesConsumed(totalCalories)
                self.mealCalories = mealBreakdown
                print("  🍔 Done updating - consumed is now: \(self.caloriesConsumed)")
            }
        } catch {
            print("Failed to load food data for \(currentDate): \(error)")
        }
    }
    
    private func mapMealTypeForDisplay(_ mealType: String) -> String {
        // Map all snack variants to "snack" for dashboard display
        if mealType.contains("snack") {
            return "snack"
        }
        return mealType
    }
    
    func refreshHealthData() {
        // Set loading state when manually refreshing
        isLoadingDashboardData = true
        
        Task {
            await fetchHealthData()
            print("Health data refreshed:")
            print("  Steps: \(todaySteps)")
            print("  Calories burned: \(caloriesBurned)")
            
            // Add a slight delay to ensure loading animation shows
            try? await Task.sleep(nanoseconds: 300_000_000) // 0.3 seconds
            
            // Clear loading state
            await MainActor.run {
                self.isLoadingDashboardData = false
            }
        }
    }
    
    func updateCaloriesConsumed(_ calories: Int) {
        print("🔄 updateCaloriesConsumed called with \(calories) (was \(caloriesConsumed))")
        caloriesConsumed = calories
        calculateDynamicStepsGoal()
        // Recalculate progress with new goal
        if stepsGoal > 0 {
            stepsProgress = min(Double(todaySteps) / Double(stepsGoal), 1.0)
        }
        // Recalculate TDEE when food changes (affects TEF)
        if pureBMR > 0 {
            let tdee = calculateTDEEFromActivity(bmr: Double(pureBMR))
            basalMetabolicRate = Int(tdee)
        }
    }
    
    func updateUserProfile(weight: Double, deficit: Int, bmr: Int) {
        userWeight = weight
        self.dailyDeficitTarget = deficit
        basalMetabolicRate = bmr
        calculateDynamicStepsGoal()
    }
    
    // MARK: - Private Methods
    private func setupHealthKit() {
        Task {
            isLoadingHealthData = true
            
            // Request authorization
            let authorized = await healthKitService.requestAuthorization()
            healthKitAuthorized = authorized
            
            if authorized {
                // Fetch initial data
                await fetchHealthData()
                
                // Only start observing if we're viewing today
                if Calendar.current.isDateInToday(currentDate) {
                    startHealthKitObserver()
                }
            }
            
            isLoadingHealthData = false
        }
    }
    
    private func fetchHealthData() async {
        // Check if we're fetching for today or a past date
        let calendar = Calendar.current
        let isToday = calendar.isDateInToday(currentDate)
        
        if isToday {
            // Fetch real-time data for today
            print("Fetching today's steps from HealthKit...")
            if let steps = await healthKitService.fetchTodaySteps() {
                print("Got \(steps) steps from HealthKit")
                updateSteps(steps)
            } else {
                print("Failed to get steps from HealthKit")
            }
            
            // Fetch calories burned
            if let service = healthKitService as? HealthKitService,
               let calories = await service.fetchCaloriesBurned() {
                updateCaloriesBurned(calories)
            }
            
            // Fetch Apple's Resting Energy (more accurate than calculated BMR)
            if let service = healthKitService as? HealthKitService,
               let restingEnergy = await service.fetchRestingEnergy() {
                
                // For today, project the BMR to full day until late in the day
                let hour = Calendar.current.component(.hour, from: Date())
                let shouldProjectBMR = hour < 21 // Use projected BMR until 9pm
                
                if shouldProjectBMR {
                    // Calculate what the full day BMR should be based on current accumulated
                    // Assume linear accumulation throughout the day
                    let hoursElapsed = Double(hour) + (Double(Calendar.current.component(.minute, from: Date())) / 60.0)
                    let projectedDailyBMR = Int((Double(restingEnergy) / hoursElapsed) * 24.0)
                    
                    // Use the user's profile BMR if available and reasonable, otherwise use projection
                    let userProfileBMR = userDefaults.integer(forKey: "userBMR")
                    let bmrToUse: Int
                    
                    if userProfileBMR > 1200 && userProfileBMR < 3000 {
                        // Use user's profile BMR as it's more stable
                        bmrToUse = userProfileBMR
                        print("🍎 Today before 9pm: Using profile BMR: \(userProfileBMR) cal (current resting: \(restingEnergy) cal at \(hour):00)")
                    } else if projectedDailyBMR > 1200 && projectedDailyBMR < 3000 {
                        // Use projected BMR if reasonable
                        bmrToUse = projectedDailyBMR
                        print("🍎 Today before 9pm: Using projected BMR: \(projectedDailyBMR) cal (current: \(restingEnergy) cal at \(hour):00)")
                    } else {
                        // Fall back to a reasonable default based on gender
                        let isMale = userGender == "male"
                        bmrToUse = isMale ? 1700 : 1400
                        print("🍎 Today before 9pm: Using default BMR: \(bmrToUse) cal (current resting: \(restingEnergy) cal seems incorrect)")
                    }
                    
                    await MainActor.run {
                        self.pureBMR = bmrToUse
                        self.basalMetabolicRate = bmrToUse
                    }
                } else {
                    // After 9pm, use actual accumulated resting energy
                    await MainActor.run {
                        self.pureBMR = restingEnergy
                        self.basalMetabolicRate = restingEnergy
                        print("🍎 Today after 9pm: Using actual Resting Energy: \(restingEnergy) cal")
                    }
                }
            } else {
                // Fall back to calculated BMR if no Apple Watch data
                calculateBMR()
            }
        } else {
            // For past dates, fetch historical data from HealthKit
            print("Fetching historical data for \(currentDate)...")
            if let service = healthKitService as? HealthKitService {
                // Fetch steps for specific date
                if let steps = await service.fetchSteps(for: currentDate) {
                    updateSteps(steps)
                } else {
                    updateSteps(0)
                }
                
                // Fetch calories for specific date
                if let calories = await service.fetchCaloriesBurned(for: currentDate) {
                    updateCaloriesBurned(calories)
                } else {
                    updateCaloriesBurned(0)
                }
                
                // Fetch Resting Energy for specific date
                if let restingEnergy = await service.fetchRestingEnergy(for: currentDate) {
                    await MainActor.run {
                        self.pureBMR = restingEnergy
                        self.basalMetabolicRate = restingEnergy
                        print("🍎 Using Apple's Resting Energy for \(currentDate): \(restingEnergy) cal")
                    }
                } else {
                    // Fall back to calculated BMR
                    calculateBMR()
                }
            }
        }
        
        // Also fetch manually logged exercise from database for the selected date
        await fetchManualExerciseForDate()
    }
    
    private func fetchManualExerciseForDate() async {
        // Don't load any database exercise if we have significant Active Energy
        // Active Energy already includes ALL exercise when tracked with iPhone/Apple Watch
        
        // Set threshold higher - if Active Energy > 200, it's definitely working
        if caloriesBurned > 200 {
            await MainActor.run {
                self.manuallyLoggedExerciseCalories = 0
                print("🍎 Active Energy is comprehensive (\(caloriesBurned) cal), ignoring database entries")
            }
            return
        }
        
        // Only for very low Active Energy (user might not have iPhone with them)
        // Check for manual treadmill/gym entries
        do {
            let entries = try await SupabaseService.shared.getFoodEntries(for: currentDate)
            let exerciseCalories = entries
                .filter { $0.calories < 0 }
                .reduce(0) { $0 + abs($1.calories) }
            
            // Even if we find exercise in database, check if it makes sense
            // If Active Energy + database exercise would exceed 2x Active Energy, skip it
            if caloriesBurned > 0 && exerciseCalories > caloriesBurned {
                // Database exercise is larger than Active Energy - likely double counting
                await MainActor.run {
                    self.manuallyLoggedExerciseCalories = 0
                    print("⚠️ Skipping database exercise (\(exerciseCalories) cal) - likely already in Active Energy")
                }
                return
            }
            
            await MainActor.run {
                self.manuallyLoggedExerciseCalories = exerciseCalories
                print("📝 Low Active Energy, adding manual exercise: \(exerciseCalories) cal")
                
                // Update progress
                let totalExercise = self.caloriesBurned + exerciseCalories
                if self.caloriesBurnedGoal > 0 {
                    self.caloriesProgress = min(Double(totalExercise) / Double(self.caloriesBurnedGoal), 1.0)
                }
            }
        } catch {
            print("Failed to load manual exercise data: \(error)")
        }
    }
    
    private func loadHistoricalData() async {
        print("📊 Loading historical data for weekly view...")
        var historicalDays: [DayData] = []
        
        let calendar = Calendar.current
        let today = Date()
        
        // Fetch all weight data for the last 30 days once
        var weightsByDate: [Date: Double] = [:]
        if let service = healthKitService as? HealthKitService {
            let weightData = await service.fetchWeightHistory(days: 30)
            for weight in weightData {
                let dayStart = calendar.startOfDay(for: weight.date)
                weightsByDate[dayStart] = weight.weight  // Latest weight for each day
            }
            print("📊 Loaded weight data for \(weightsByDate.count) days")
        }
        
        // Load last 7 days of data
        for dayOffset in 0..<7 {
            guard let date = calendar.date(byAdding: .day, value: -dayOffset, to: today) else { continue }
            
            // Skip if it's today (already loaded)
            if calendar.isDateInToday(date) {
                // Fetch today's meals from database
                var todayMeals: [FoodEntry] = []
                do {
                    let entries = try await SupabaseService.shared.getFoodEntries(for: date)
                    todayMeals = entries.filter { $0.calories > 0 }  // Only food entries, not exercise
                } catch {
                    print("Failed to load today's meals: \(error)")
                }
                
                // Get weight for today from pre-fetched data
                let todayWeight = weightsByDate[calendar.startOfDay(for: date)]
                
                // Add today's data from current state
                let todayData = DayData(
                    date: date,
                    calories: caloriesConsumed,
                    protein: 0.0,  // We don't track macros yet
                    carbs: 0.0,
                    fat: 0.0,
                    water: 0,
                    steps: todaySteps,
                    sleep: 0.0,
                    workoutMinutes: (caloriesBurned + manuallyLoggedExerciseCalories) / 10,  // Rough estimate
                    activeEnergy: caloriesBurned,  // Active Energy from HealthKit
                    weight: todayWeight,
                    meals: todayMeals
                )
                historicalDays.append(todayData)
                continue
            }
            
            // Fetch data for this date
            var fetchedSteps = 0
            var fetchedWorkoutMinutes = 0
            var fetchedActiveEnergy = 0
            var fetchedCalories = 0
            var fetchedMeals: [FoodEntry] = []
            
            // Fetch steps from HealthKit
            if let service = healthKitService as? HealthKitService {
                if let steps = await service.fetchSteps(for: date) {
                    fetchedSteps = steps
                }
                
                // Fetch active energy from HealthKit
                if let calories = await service.fetchCaloriesBurned(for: date) {
                    fetchedActiveEnergy = calories
                    fetchedWorkoutMinutes = calories / 10  // Rough estimate
                }
            }
            
            // Fetch food data from Supabase
            do {
                let entries = try await SupabaseService.shared.getFoodEntries(for: date)
                
                // Calculate total calories consumed (positive values)
                fetchedCalories = entries.filter { $0.calories > 0 }.reduce(0) { $0 + $1.calories }
                
                // Calculate manual exercise (negative values) and add to workout minutes
                let exercise = entries.filter { $0.calories < 0 }.reduce(0) { $0 + abs($1.calories) }
                fetchedWorkoutMinutes += exercise / 10  // Rough estimate of minutes from calories
                
                // Store meals for this day
                fetchedMeals = entries.filter { $0.calories > 0 }
                
            } catch {
                print("Failed to load food data for \(date): \(error)")
            }
            
            // Get weight for this date from pre-fetched data
            let dayWeight = weightsByDate[calendar.startOfDay(for: date)]
            
            // Create the day data with all fetched values
            let dayData = DayData(
                date: date,
                calories: fetchedCalories,
                protein: 0.0,
                carbs: 0.0,
                fat: 0.0,
                water: 0,
                steps: fetchedSteps,
                sleep: 0.0,
                workoutMinutes: fetchedWorkoutMinutes,
                activeEnergy: fetchedActiveEnergy,
                weight: dayWeight,
                meals: fetchedMeals
            )
            
            historicalDays.append(dayData)
        }
        
        // Update allDaysData on main thread
        await MainActor.run {
            self.allDaysData = historicalDays.sorted { $0.date > $1.date }
            print("📊 Loaded \(self.allDaysData.count) days of historical data")
            
            // Update the current period data to refresh week/month views
            self.updateCurrentPeriodData()
        }
    }
    
    private func updateSteps(_ steps: Int) {
        print("👟 updateSteps called with \(steps) (was \(todaySteps))")
        todaySteps = steps
        calculateDynamicStepsGoal()
        if stepsGoal > 0 {
            stepsProgress = min(Double(steps) / Double(stepsGoal), 1.0)
        } else {
            stepsProgress = 0.0
        }
        // Recalculate TDEE when steps change
        if pureBMR > 0 {
            let tdee = calculateTDEEFromActivity(bmr: Double(pureBMR))
            basalMetabolicRate = Int(tdee)
        }
    }
    
    private func updateCaloriesBurned(_ calories: Int) {
        print("🔥 updateCaloriesBurned called with \(calories) (was \(caloriesBurned))")
        caloriesBurned = calories
        caloriesBurnedGoal = dailyDeficitTarget // Exercise goal equals target deficit
        // Use total of Apple Health + manually logged exercise for progress
        let totalExercise = caloriesBurned + manuallyLoggedExerciseCalories
        if caloriesBurnedGoal > 0 {
            caloriesProgress = min(Double(totalExercise) / Double(caloriesBurnedGoal), 1.0)
        } else {
            caloriesProgress = 0.0
        }
        // Recalculate TDEE when exercise changes
        if pureBMR > 0 {
            let tdee = calculateTDEEFromActivity(bmr: Double(pureBMR))
            basalMetabolicRate = Int(tdee)
        }
        
        // Check if user might have Active Energy disabled
        checkActiveEnergyStatus()
    }
    
    private func checkActiveEnergyStatus() {
        // Always prompt if Active Energy is 0 on current day
        // This is critical for accurate calorie tracking
        if caloriesBurned == 0 && Calendar.current.isDateInToday(currentDate) {
            // Give a grace period for early morning
            let hour = Calendar.current.component(.hour, from: Date())
            if hour >= 9 {  // After 9 AM, prompt if still no data
                shouldShowActiveEnergyPrompt = true
            }
        } else {
            shouldShowActiveEnergyPrompt = false
        }
    }
    
    private func calculateDynamicStepsGoal() {
        // Calculate how many calories still need to be burned through steps
        let currentDeficit = caloriesBurned - caloriesConsumed
        let remainingDeficitNeeded = dailyDeficitTarget - currentDeficit
        
        // If we've already hit our deficit through diet/exercise, minimal steps needed
        if remainingDeficitNeeded <= 0 {
            stepsGoal = 5000 // Minimum healthy steps
            return
        }
        
        // Calculate steps needed to burn remaining calories
        // Formula: calories per step = weight(kg) * 0.00045
        // Average: ~0.04 calories per step for 70kg person
        let caloriesPerStep = userWeight * 0.00045
        
        // Steps already taken burn calories too
        let caloriesFromCurrentSteps = Double(todaySteps) * caloriesPerStep
        
        // Calculate additional calories needed
        let additionalCaloriesNeeded = Double(remainingDeficitNeeded) - caloriesFromCurrentSteps
        
        if additionalCaloriesNeeded <= 0 {
            // Current steps already meet the goal
            stepsGoal = todaySteps
        } else {
            // Calculate total steps needed
            let totalStepsNeeded = Int(Double(remainingDeficitNeeded) / caloriesPerStep)
            // Set goal with minimum of 5000 and maximum of 20000
            stepsGoal = min(max(totalStepsNeeded, 5000), 20000)
        }
    }
    
    // Computed properties for display
    var stepsDisplayText: String {
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        return formatter.string(from: NSNumber(value: todaySteps)) ?? "0"
    }
    
    var stepsTargetText: String {
        let remainingSteps = max(0, stepsGoal - todaySteps)
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        let remaining = formatter.string(from: NSNumber(value: remainingSteps)) ?? "0"
        return "\(remaining) to goal"
    }
    
    var stepsDistanceText: String {
        // Check if we're over or under target
        let remainingCalories = dailyCalorieTarget - caloriesConsumed
        
        if remainingCalories >= 0 {
            // Under or at target - good!
            return "On track! 💪"
        }
        
        // We're over target - calculate distance needed to burn the excess
        let caloriesOver = -remainingCalories  // Make positive
        
        // Walking burns approximately 0.65 calories per kg per km
        // For a 70kg person: 70 * 0.65 = 45.5 cal/km
        // For a 80kg person: 80 * 0.65 = 52 cal/km
        let caloriesPerKm = userWeight * 0.65
        let kmNeeded = Double(caloriesOver) / caloriesPerKm
        
        if kmNeeded > 0 {
            // Format to 1 decimal place
            let formatted = String(format: "%.1f", kmNeeded)
            return "+\(formatted)km walk to offset"
        }
        
        return "On track! 💪"
    }
    
    var caloriesDisplayText: String {
        // Show total of Apple Health + manually logged exercise
        let total = caloriesBurned + manuallyLoggedExerciseCalories
        return "\(total) cal"
    }
    
    var caloriesTargetText: String {
        "\(caloriesBurnedGoal) cal"
    }
    
    var exerciseDetailsText: String {
        let total = caloriesBurned + manuallyLoggedExerciseCalories
        if total > 0 {
            // Show breakdown if both sources have data
            if caloriesBurned > 0 && manuallyLoggedExerciseCalories > 0 {
                return "Apple: \(caloriesBurned) + Logged: \(manuallyLoggedExerciseCalories)"
            } else if manuallyLoggedExerciseCalories > 0 {
                return "Manually logged"
            } else {
                // Estimate based on calories (rough approximation)
                let minutes = caloriesBurned / 10  // ~10 cal/min average
                return "Mixed • \(minutes) min"
            }
        }
        return "No exercise yet"
    }
    
    // MARK: - Mock Data Management
    private func loadMockData() {
        allDaysData = MockDataGenerator.shared.generateHistoricalData(days: 90)
        updateCurrentPeriodData()
    }
    
    private func setupDateObserver() {
        // Observe changes to currentDate and selectedPeriod
        $currentDate
            .combineLatest($selectedPeriod)
            .sink { [weak self] date, period in
                print("📍 Period/Date changed - Period: \(period), Date: \(date)")
                self?.updateCurrentPeriodData(for: period, date: date)
            }
            .store(in: &cancellables)
    }
    
    private func updateCurrentPeriodData(for period: ViewPeriod? = nil, date: Date? = nil) {
        let calendar = Calendar.current
        
        let actualPeriod = period ?? selectedPeriod
        let actualDate = date ?? currentDate
        
        print("🔄 updateCurrentPeriodData called - selectedPeriod: \(actualPeriod)")
        print("   allDaysData count: \(allDaysData.count)")
        
        switch actualPeriod {
        case .day:
            // Find the day data for current date
            currentDayData = allDaysData.first { day in
                calendar.isDate(day.date, inSameDayAs: actualDate)
            }
            
            // If no data exists for selected date, create empty data
            if currentDayData == nil {
                currentDayData = DayData(
                    date: actualDate,
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                    water: 0,
                    steps: 0,
                    sleep: 0,
                    workoutMinutes: 0,
                    activeEnergy: 0,
                    weight: nil,
                    meals: []
                )
            }
            
        case .week:
            // Get the week containing current date
            let weekday = calendar.component(.weekday, from: actualDate)
            let daysFromMonday = (weekday + 5) % 7
            guard let monday = calendar.date(byAdding: .day, value: -daysFromMonday, to: actualDate),
                  let sunday = calendar.date(byAdding: .day, value: 6, to: monday) else { 
                print("   ❌ Failed to calculate week boundaries")
                return 
            }
            
            print("   📅 Week boundaries: \(monday) to \(sunday)")
            
            let weekDays = allDaysData.filter { day in
                let inRange = day.date >= monday && day.date <= sunday
                if inRange {
                    print("   ✅ Including day: \(day.date) with \(day.calories) calories, \(day.steps) steps")
                }
                return inRange
            }
            
            print("   📊 Found \(weekDays.count) days for week view")
            
            currentWeekData = WeekData(startDate: monday, endDate: sunday, days: weekDays)
            print("   ✅ currentWeekData set with \(currentWeekData?.days.count ?? 0) days")
            
        case .month:
            // Get the month containing current date
            let components = calendar.dateComponents([.year, .month], from: actualDate)
            guard let year = components.year, let month = components.month else { return }
            
            let monthDays = allDaysData.filter { day in
                let dayComponents = calendar.dateComponents([.year, .month], from: day.date)
                return dayComponents.year == year && dayComponents.month == month
            }
            
            let weeks = MockDataGenerator.shared.groupDataByWeeks(monthDays)
            currentMonthData = MonthData(month: month, year: year, weeks: weeks)
        }
        
        // Update UI based on current data
        updateUIFromCurrentData()
    }
    
    private func updateUIFromCurrentData() {
        guard let dayData = currentDayData else { return }
        
        // Only update food calories from mock data
        // Don't overwrite real HealthKit data for steps and exercise
        caloriesConsumed = dayData.calories
        
        // Don't overwrite these - they come from HealthKit:
        // todaySteps = dayData.steps  // COMMENTED OUT - using real HealthKit data
        // caloriesBurned = dayData.exercise // COMMENTED OUT - using real HealthKit data
        
        // Recalculate calorie target based on goal
        updateCalorieTarget()
    }
    
    // MARK: - Goal-Based Calculations
    func updateCalorieTarget() {
        switch selectedGoal {
        case .loseWeight:
            // Apply deficit based on weight loss rate
            dailyDeficitTarget = weightLossRate.deficitPerDay
            
        case .maintainWeight:
            // No deficit, eat at TDEE
            dailyDeficitTarget = 0
            
        case .buildMuscle:
            // Small surplus for muscle building
            dailyDeficitTarget = -300 // Negative means surplus
            
        case .medicalRecovery:
            // No deficit, potentially surplus for recovery
            dailyDeficitTarget = -200 // Small surplus
            
        case .manageCondition:
            // Depends on condition, but generally maintenance
            switch selectedCondition {
            case .diabetes, .heartDisease, .ibs:
                dailyDeficitTarget = 0 // Maintenance
            case .nafld, .pcos:
                dailyDeficitTarget = 275 // Gentle weight loss
            case .kidneyDisease:
                dailyDeficitTarget = 0 // Maintenance with protein limits
            }
            
        case .intuitiveEating:
            // No specific target
            dailyDeficitTarget = 0
        }
    }
    
    // Calculate actual calorie target for display
    var dailyCalorieTarget: Int {
        // Use actual TDEE (stored in basalMetabolicRate) minus deficit
        // But ensure we never go below a safe minimum (1200 for women, 1500 for men)
        let minSafeCalories = userGender == "female" ? 1200 : 1500
        let calculatedTarget = basalMetabolicRate - dailyDeficitTarget
        return max(calculatedTarget, minSafeCalories)
    }
    
    // Calculate remaining calories
    var caloriesRemaining: Int {
        // Simple: just target minus what you've eaten
        // Exercise is already factored into TDEE and thus the target
        let remaining = dailyCalorieTarget - caloriesConsumed
        
        // Commented out to reduce log spam - computed property gets called frequently
        // print("🔢 Calorie Calculation Debug:")
        // print("  TDEE (basalMetabolicRate): \(basalMetabolicRate)")
        // print("  Deficit Target: \(dailyDeficitTarget)")
        // print("  Daily Target (TDEE - Deficit): \(dailyCalorieTarget)")
        // print("  Consumed: \(caloriesConsumed)")
        // print("  Exercise (Apple): \(caloriesBurned)")
        // print("  Exercise (Manual): \(manuallyLoggedExerciseCalories)")
        // print("  Remaining: \(remaining)")
        
        return remaining
    }
    
    // MARK: - Profile & BMR Methods
    
    private func loadUserProfile() {
        // Load from AuthManager's profile if available
        if let profile = AuthManager.shared.userProfile {
            print("🔍 Loading user profile - Profile exists")
            // Load weight - profile only stores kg
            if let weight = profile.weightKg {
                print("🔍 Setting weight from profile: \(weight)kg")
                userWeight = weight
            } else {
                print("⚠️ No weight in profile, using default: \(userWeight)kg")
            }
            
            // Load height - profile only stores cm
            if let height = profile.heightCm {
                userHeight = height
            }
            
            // Calculate age from birth date
            if let birthDate = profile.birthDate {
                let calendar = Calendar.current
                let ageComponents = calendar.dateComponents([.year], from: birthDate, to: Date())
                userAge = ageComponents.year ?? 30
            }
            
            // Gender
            if let gender = profile.gender {
                userGender = gender.lowercased()
            } else {
                // Default to male if not specified
                userGender = "male"
            }
            
            // Metric preference
            let userDefaults = UserDefaults.standard
            if let storedPreference = userDefaults.object(forKey: "preferMetric") as? Bool {
                useMetric = storedPreference
            } else {
                // Default to locale setting
                useMetric = Locale.current.usesMetricSystem
            }
            
            // Load activity level if available
            if let activityLevel = profile.activityLevel {
                // Can use this for future activity level calculations
            }
            
            // Load BMR if stored, otherwise calculate
            if let storedBMR = profile.basalMetabolicRate {
                basalMetabolicRate = storedBMR
            } else {
                calculateBMR()
            }
            
            // Load deficit target if stored
            if let deficit = profile.dailyDeficitTarget {
                dailyDeficitTarget = deficit
            }
        } else {
            print("⚠️ No user profile found in AuthManager, using default weight: \(userWeight)kg")
        }
    }
    
    func calculateBMR() {
        // Mifflin-St Jeor Equation (most accurate)
        // Men: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) + 5
        // Women: BMR = 10 × weight(kg) + 6.25 × height(cm) - 5 × age(years) - 161
        
        let weightComponent = 10.0 * userWeight
        let heightComponent = 6.25 * userHeight
        let ageComponent = 5.0 * Double(userAge)
        
        let bmr: Double
        if userGender == "male" {
            bmr = weightComponent + heightComponent - ageComponent + 5
        } else {
            bmr = weightComponent + heightComponent - ageComponent - 161
        }
        
        // Store pure BMR separately for display
        self.pureBMR = Int(bmr)
        
        // Save calculated BMR to UserDefaults for use in projections
        userDefaults.set(Int(bmr), forKey: "userBMR")
        print("💾 Saved calculated BMR to UserDefaults: \(Int(bmr)) cal")
        
        // Calculate TDEE from actual activity instead of multiplier
        let tdee = calculateTDEEFromActivity(bmr: bmr)
        
        basalMetabolicRate = Int(tdee)
        
        // Recalculate targets
        updateCalorieTarget()
    }
    
    private func calculateTDEEFromActivity(bmr: Double) -> Double {
        // TDEE = BMR + Active Energy + TEF
        // Active Energy already includes ALL activity (steps, exercise, etc.)
        // No need to calculate step calories separately
        
        // Active Energy from Apple Health (includes all movement)
        let activeEnergyCalories = Double(caloriesBurned)
        
        // Manually logged exercise (only if not already in Apple Health)
        let manualCalories = Double(manuallyLoggedExerciseCalories)
        
        // Only add manual calories if we have low/no Active Energy
        // This prevents double counting when user has Apple Watch
        let exerciseCalories: Double
        if activeEnergyCalories < 50 {
            // User likely doesn't have Active Energy tracking
            // Use manual logging as fallback
            exerciseCalories = manualCalories
        } else {
            // Active Energy is working, it already includes everything
            exerciseCalories = activeEnergyCalories
        }
        
        // TEF (Thermic Effect of Food) - 10% of consumed calories
        let tefCalories = Double(caloriesConsumed) * 0.10
        
        // If we have no activity data at all, assume sedentary activity level
        // Sedentary TDEE = BMR * 1.2 (accounts for basic daily movement)
        if exerciseCalories == 0 && tefCalories == 0 {
            // Use sedentary multiplier for more realistic TDEE
            let sedentaryTDEE = bmr * 1.2
            return sedentaryTDEE
        }
        
        // Total TDEE = BMR + Active Energy + TEF
        let totalCalories = bmr + exerciseCalories + tefCalories
        
        print("TDEE Calculation (Active Energy based):")
        print("  BMR: \(Int(bmr))")
        print("  Active Energy: +\(Int(activeEnergyCalories))")
        if manualCalories > 0 && activeEnergyCalories < 50 {
            print("  Manual Exercise (fallback): +\(Int(manualCalories))")
        }
        print("  TEF: +\(Int(tefCalories))")
        print("  Total TDEE: \(Int(totalCalories))")
        
        return totalCalories
    }
    
    // Store pure BMR for display
    private var pureBMR: Int = 0
    
    var actualBMR: Int {
        // Use Apple's Resting Energy if available, otherwise use calculated BMR
        if pureBMR > 0 {
            print("📊 Using pureBMR (Apple Resting Energy): \(pureBMR)")
            return pureBMR
        } else {
            // basalMetabolicRate might be TDEE, not pure BMR
            // Don't divide by activity factor - use a reasonable default BMR
            let defaultBMR = Int(10.0 * userWeight + 6.25 * userHeight - 5.0 * Double(userAge) + (userGender == "male" ? 5 : -161))
            print("⚠️ No Apple Resting Energy, using calculated BMR: \(defaultBMR)")
            return defaultBMR
        }
    }
    
    // TDEE-based progress calculations
    var stepsTDEEProgress: Double {
        // Check if we're over or under target
        let remainingCalories = dailyCalorieTarget - caloriesConsumed
        
        if remainingCalories >= 0 {
            // Under or at target - show progress toward 10k steps goal
            return min(Double(todaySteps) / 10000.0, 1.0)
        }
        
        // We're over target - show current steps as % of total steps needed
        let caloriesOver = -remainingCalories  // Make positive
        let caloriesPerStep = userWeight * 0.00045
        
        // Calculate total steps needed (current + additional for offset)
        let additionalStepsNeeded = Double(caloriesOver) / caloriesPerStep
        let totalStepsNeeded = Double(todaySteps) + additionalStepsNeeded
        
        // Show progress: current steps / total steps needed
        if totalStepsNeeded > 0 {
            return Double(todaySteps) / totalStepsNeeded  // Don't cap at 1.0 to show true percentage
        }
        
        return 0.0
    }
    
    var exerciseTDEEProgress: Double {
        // Check if we're over or under target
        let remainingCalories = dailyCalorieTarget - caloriesConsumed
        
        if remainingCalories >= 0 {
            // Under or at target - show progress toward general exercise goal (200 cal)
            let totalExercise = Double(caloriesBurned + manuallyLoggedExerciseCalories)
            return min(totalExercise / 200.0, 1.0)
        }
        
        // We're over target - show current exercise as % of total exercise needed
        let caloriesOver = -remainingCalories  // Make positive
        let currentExercise = Double(caloriesBurned + manuallyLoggedExerciseCalories)
        
        // Calculate total exercise needed (current + additional for offset)
        let totalExerciseNeeded = currentExercise + Double(caloriesOver)
        
        // Show progress: current exercise / total exercise needed
        if totalExerciseNeeded > 0 {
            return currentExercise / totalExerciseNeeded  // Don't cap at 1.0 to show true percentage
        }
        
        return 0.0
    }
    
    var exerciseMinutesText: String {
        // Check if we're over or under target
        let remainingCalories = dailyCalorieTarget - caloriesConsumed
        
        if remainingCalories >= 0 {
            // Under or at target - good!
            let totalExercise = caloriesBurned + manuallyLoggedExerciseCalories
            if totalExercise > 0 {
                return "\(totalExercise / 10) mins done"
            }
            return "Rest day 😌"
        }
        
        // We're over target - calculate distance needed to burn the excess
        let caloriesOver = -remainingCalories  // Make positive
        
        // Light running (10 km/hr) burns approximately 1.0 calories per kg per km
        // For a 70kg person: 70 * 1.0 = 70 cal/km
        // For a 80kg person: 80 * 1.0 = 80 cal/km
        // Note: Faster running burns more (12 km/hr ≈ 1.2 cal/kg/km)
        let caloriesPerKm = userWeight * 1.0
        let kmNeeded = Double(caloriesOver) / caloriesPerKm
        
        if kmNeeded > 0 {
            // Format to 1 decimal place
            let formatted = String(format: "%.1f", kmNeeded)
            return "+\(formatted)km run to offset"
        }
        
        return "On track! 💪"
    }
    
    // MARK: - Midnight Timer
    private func setupMidnightTimer() {
        // Cancel existing timer if any
        midnightTimer?.invalidate()
        
        // Calculate time until midnight
        let calendar = Calendar.current
        let now = Date()
        guard let tomorrow = calendar.date(byAdding: .day, value: 1, to: now),
              let midnight = calendar.dateComponents([.year, .month, .day], from: tomorrow).date else {
            return
        }
        
        let timeUntilMidnight = midnight.timeIntervalSince(now)
        
        // Set up timer to fire at midnight
        midnightTimer = Timer.scheduledTimer(withTimeInterval: timeUntilMidnight, repeats: false) { [weak self] _ in
            Task { @MainActor in
                self?.handleMidnightReset()
            }
        }
    }
    
    private func handleMidnightReset() {
        // Only reset if we're viewing today's data (which is now yesterday at midnight)
        let calendar = Calendar.current
        let wasViewingToday = calendar.isDateInYesterday(currentDate)
        
        if wasViewingToday {
            // Update to new day
            currentDate = Date()
            
            // Reset daily data
            todaySteps = 0
            caloriesBurned = 0
            manuallyLoggedExerciseCalories = 0
            caloriesConsumed = 0
            mealCalories = [
                "breakfast": 0,
                "lunch": 0,
                "dinner": 0,
                "snack": 0
            ]
            
            // Re-enable HealthKit observer for the new day
            startHealthKitObserver()
            
            // Reload data for new day
            Task {
                await fetchHealthData()
                // Removed loadTodaysFoodData() - FoodActivityLogCard handles this via notifications
            }
        }
        
        // Set up next midnight timer
        setupMidnightTimer()
    }
    
    private func startHealthKitObserver() {
        guard !healthKitObserverActive else { return }
        
        healthKitObserverActive = true
        healthKitService.startObservingSteps { [weak self] steps in
            guard let self = self else { return }
            
            // Only update if we're still viewing today
            if Calendar.current.isDateInToday(self.currentDate) {
                Task { @MainActor in
                    self.updateSteps(steps)
                }
            }
        }
    }
    
    private func stopHealthKitObserver() {
        healthKitObserverActive = false
        // Note: We can't actually stop the observer in HealthKit, but we flag it as inactive
        // and ignore updates in the callback
    }
    
    deinit {
        midnightTimer?.invalidate()
        // Note: Can't call stopHealthKitObserver from deinit due to actor isolation
        // The observer will be cleaned up when HealthKitService is deallocated
    }
}

// MARK: - Goal Types
enum DailyGoalType: String, CaseIterable {
    case loseWeight = "Lose Weight"
    case maintainWeight = "Maintain Weight"
    case buildMuscle = "Build Muscle"
    case medicalRecovery = "Medical Recovery"
    case manageCondition = "Manage Condition"
    case intuitiveEating = "Intuitive Eating"
}

enum WeightLossRate: String, CaseIterable {
    case gentle = "0.25 kg/week"
    case moderate = "0.5 kg/week"
    case aggressive = "0.75 kg/week"
    
    var deficitPerDay: Int {
        switch self {
        case .gentle: return 275
        case .moderate: return 550
        case .aggressive: return 825
        }
    }
}

enum MedicalCondition: String, CaseIterable {
    case diabetes = "Diabetes"
    case nafld = "NAFLD"
    case pcos = "PCOS"
    case kidneyDisease = "Kidney Disease"
    case heartDisease = "Heart Disease"
    case ibs = "IBS/IBD"
}