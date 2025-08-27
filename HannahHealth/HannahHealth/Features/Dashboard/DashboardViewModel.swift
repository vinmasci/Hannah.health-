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
    
    // MARK: - Dependencies
    private let healthKitService: HealthKitServiceProtocol
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Init
    init(healthKitService: HealthKitServiceProtocol = HealthKitService()) {
        self.healthKitService = healthKitService
        setupHealthKit()
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
}