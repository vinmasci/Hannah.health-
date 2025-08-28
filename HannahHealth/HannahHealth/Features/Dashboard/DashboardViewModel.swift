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
    
    @Published var caloriesBurned: Int = 0
    @Published var caloriesBurnedGoal: Int = 400
    @Published var caloriesProgress: Double = 0.0
    
    @Published var isLoadingHealthData = false
    @Published var healthKitAuthorized = false
    
    // User Profile Data (would come from onboarding/settings)
    @Published var userWeight: Double = 70.0 // kg - default 154 lbs
    @Published var dailyDeficitTarget: Int = 500 // Target daily calorie deficit
    @Published var caloriesConsumed: Int = 0 // From food logging
    @Published var basalMetabolicRate: Int = 2200 // From user profile
    
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
    
    // MARK: - Init
    init(healthKitService: HealthKitServiceProtocol = HealthKitService()) {
        self.healthKitService = healthKitService
        setupHealthKit()
        loadMockData()
        setupDateObserver()
    }
    
    // MARK: - Public Methods
    func refreshHealthData() {
        Task {
            await fetchHealthData()
        }
    }
    
    func updateCaloriesConsumed(_ calories: Int) {
        caloriesConsumed = calories
        calculateDynamicStepsGoal()
        // Recalculate progress with new goal
        if stepsGoal > 0 {
            stepsProgress = min(Double(todaySteps) / Double(stepsGoal), 1.0)
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
                
                // Start observing for real-time updates
                healthKitService.startObservingSteps { [weak self] steps in
                    Task { @MainActor in
                        self?.updateSteps(steps)
                    }
                }
            }
            
            isLoadingHealthData = false
        }
    }
    
    private func fetchHealthData() async {
        // Fetch steps
        if let steps = await healthKitService.fetchTodaySteps() {
            updateSteps(steps)
        }
        
        // Fetch calories burned
        if let service = healthKitService as? HealthKitService,
           let calories = await service.fetchCaloriesBurned() {
            updateCaloriesBurned(calories)
        }
    }
    
    private func updateSteps(_ steps: Int) {
        todaySteps = steps
        calculateDynamicStepsGoal()
        if stepsGoal > 0 {
            stepsProgress = min(Double(steps) / Double(stepsGoal), 1.0)
        } else {
            stepsProgress = 0.0
        }
    }
    
    private func updateCaloriesBurned(_ calories: Int) {
        caloriesBurned = calories
        caloriesBurnedGoal = dailyDeficitTarget // Exercise goal equals target deficit
        if caloriesBurnedGoal > 0 {
            caloriesProgress = min(Double(calories) / Double(caloriesBurnedGoal), 1.0)
        } else {
            caloriesProgress = 0.0
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
        let formatter = NumberFormatter()
        formatter.numberStyle = .decimal
        return formatter.string(from: NSNumber(value: stepsGoal)) ?? "10,000"
    }
    
    var caloriesDisplayText: String {
        "\(caloriesBurned) cal"
    }
    
    var caloriesTargetText: String {
        "\(caloriesBurnedGoal) cal"
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
            .sink { [weak self] _, _ in
                self?.updateCurrentPeriodData()
            }
            .store(in: &cancellables)
    }
    
    private func updateCurrentPeriodData() {
        let calendar = Calendar.current
        
        switch selectedPeriod {
        case .day:
            // Find the day data for current date
            currentDayData = allDaysData.first { day in
                calendar.isDate(day.date, inSameDayAs: currentDate)
            }
            
            // If no data exists for selected date, create empty data
            if currentDayData == nil {
                currentDayData = DayData(
                    date: currentDate,
                    calories: 0,
                    protein: 0,
                    carbs: 0,
                    fat: 0,
                    water: 0,
                    steps: 0,
                    sleep: 0,
                    workoutMinutes: 0,
                    weight: nil,
                    meals: []
                )
            }
            
        case .week:
            // Get the week containing current date
            let weekday = calendar.component(.weekday, from: currentDate)
            let daysFromMonday = (weekday + 5) % 7
            guard let monday = calendar.date(byAdding: .day, value: -daysFromMonday, to: currentDate),
                  let sunday = calendar.date(byAdding: .day, value: 6, to: monday) else { return }
            
            let weekDays = allDaysData.filter { day in
                day.date >= monday && day.date <= sunday
            }
            
            currentWeekData = WeekData(startDate: monday, endDate: sunday, days: weekDays)
            
        case .month:
            // Get the month containing current date
            let components = calendar.dateComponents([.year, .month], from: currentDate)
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
        
        // Update the existing properties that the UI uses
        caloriesConsumed = dayData.calories
        todaySteps = dayData.steps
        // Update other properties as needed
    }
}