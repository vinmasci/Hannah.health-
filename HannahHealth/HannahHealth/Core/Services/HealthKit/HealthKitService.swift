//
//  HealthKitService.swift
//  HannahHealth
//
//  Created on 27/8/2025.
//

import Foundation
import HealthKit
import Combine

protocol HealthKitServiceProtocol {
    func requestAuthorization() async -> Bool
    func fetchTodaySteps() async -> Int?
    func fetchSteps(for date: Date) async -> Int?
    func startObservingSteps(completion: @escaping (Int) -> Void)
}

class HealthKitService: ObservableObject, HealthKitServiceProtocol {
    private let healthStore = HKHealthStore()
    private var stepsObserverQuery: HKObserverQuery?
    
    @Published var todaySteps: Int = 0
    @Published var isAuthorized: Bool = false
    
    // Types to read from HealthKit
    private let readTypes: Set<HKObjectType> = [
        HKObjectType.quantityType(forIdentifier: .stepCount)!,
        HKObjectType.quantityType(forIdentifier: .activeEnergyBurned)!,
        HKObjectType.quantityType(forIdentifier: .basalEnergyBurned)!,  // Apple's Resting Energy
        HKObjectType.quantityType(forIdentifier: .distanceWalkingRunning)!,
        HKObjectType.quantityType(forIdentifier: .bodyMass)!,  // Weight data
        HKObjectType.workoutType()  // Add workout type to read actual workouts
    ]
    
    // Types to write (none for now)
    private let writeTypes: Set<HKSampleType> = []
    
    init() {
        checkHealthKitAvailability()
    }
    
    private func checkHealthKitAvailability() {
        guard HKHealthStore.isHealthDataAvailable() else {
            print("HealthKit is not available on this device")
            return
        }
    }
    
    func requestAuthorization() async -> Bool {
        guard HKHealthStore.isHealthDataAvailable() else {
            print("❌ HealthKit not available on this device")
            return false
        }
        
        print("🔐 Requesting HealthKit authorization for:")
        print("  - Steps")
        print("  - Active Energy")
        print("  - Basal Energy")
        print("  - Distance")
        print("  - Body Mass (Weight)")
        print("  - Workouts")
        
        do {
            try await healthStore.requestAuthorization(
                toShare: writeTypes,
                read: readTypes
            )
            await MainActor.run {
                self.isAuthorized = true
            }
            print("✅ HealthKit authorization granted")
            return true
        } catch {
            print("❌ HealthKit authorization failed: \(error)")
            return false
        }
    }
    
    func fetchTodaySteps() async -> Int? {
        await fetchSteps(for: Date())
    }
    
    func fetchSteps(for date: Date) async -> Int? {
        guard isAuthorized else {
            _ = await requestAuthorization()
            guard isAuthorized else { return nil }
            return nil
        }
        
        let stepsType = HKQuantityType.quantityType(forIdentifier: .stepCount)!
        
        // Create date range for the day
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: date)
        let endOfDay = calendar.date(byAdding: .day, value: 1, to: startOfDay)!
        
        let predicate = HKQuery.predicateForSamples(
            withStart: startOfDay,
            end: endOfDay,
            options: .strictStartDate
        )
        
        return await withCheckedContinuation { continuation in
            let query = HKStatisticsQuery(
                quantityType: stepsType,
                quantitySamplePredicate: predicate,
                options: .cumulativeSum
            ) { _, result, error in
                guard let result = result,
                      let sum = result.sumQuantity() else {
                    continuation.resume(returning: nil)
                    return
                }
                
                let steps = Int(sum.doubleValue(for: HKUnit.count()))
                continuation.resume(returning: steps)
            }
            
            healthStore.execute(query)
        }
    }
    
    func startObservingSteps(completion: @escaping (Int) -> Void) {
        guard isAuthorized else { return }
        
        let stepsType = HKQuantityType.quantityType(forIdentifier: .stepCount)!
        
        // Stop previous observer if exists
        if let existingQuery = stepsObserverQuery {
            healthStore.stop(existingQuery)
        }
        
        // Create observer query for real-time updates
        stepsObserverQuery = HKObserverQuery(
            sampleType: stepsType,
            predicate: nil
        ) { [weak self] _, _, error in
            if error != nil { return }
            
            Task {
                if let steps = await self?.fetchTodaySteps() {
                    await MainActor.run {
                        self?.todaySteps = steps
                        completion(steps)
                    }
                }
            }
        }
        
        if let query = stepsObserverQuery {
            healthStore.execute(query)
        }
        
        // Fetch initial value
        Task {
            if let steps = await fetchTodaySteps() {
                await MainActor.run {
                    self.todaySteps = steps
                    completion(steps)
                }
            }
        }
    }
    
    func fetchCaloriesBurned() async -> Int? {
        return await fetchCaloriesBurned(for: Date())
    }
    
    func fetchRestingEnergy() async -> Int? {
        return await fetchRestingEnergy(for: Date())
    }
    
    func fetchRestingEnergy(for date: Date) async -> Int? {
        guard isAuthorized else { return nil }
        
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: date)
        let endOfDay = calendar.date(byAdding: .day, value: 1, to: startOfDay)!
        
        let predicate = HKQuery.predicateForSamples(
            withStart: startOfDay,
            end: endOfDay,
            options: .strictStartDate
        )
        
        // Get Apple's Resting Energy (Basal Energy Burned)
        let restingType = HKQuantityType.quantityType(forIdentifier: .basalEnergyBurned)!
        
        return await withCheckedContinuation { continuation in
            let query = HKStatisticsQuery(
                quantityType: restingType,
                quantitySamplePredicate: predicate,
                options: .cumulativeSum
            ) { _, result, error in
                guard let result = result,
                      let sum = result.sumQuantity() else {
                    continuation.resume(returning: nil)
                    return
                }
                
                let calories = Int(sum.doubleValue(for: HKUnit.kilocalorie()))
                continuation.resume(returning: calories)
            }
            
            healthStore.execute(query)
        }
    }
    
    func fetchCaloriesBurned(for date: Date) async -> Int? {
        guard isAuthorized else { return nil }
        
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: date)
        let endOfDay = calendar.date(byAdding: .day, value: 1, to: startOfDay)!
        
        let predicate = HKQuery.predicateForSamples(
            withStart: startOfDay,
            end: endOfDay,
            options: .strictStartDate
        )
        
        // Always use total active energy burned (includes workouts + all movement)
        let energyType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned)!
        
        return await withCheckedContinuation { continuation in
            let query = HKStatisticsQuery(
                quantityType: energyType,
                quantitySamplePredicate: predicate,
                options: .cumulativeSum
            ) { _, result, error in
                guard let result = result,
                      let sum = result.sumQuantity() else {
                    continuation.resume(returning: nil)
                    return
                }
                
                let calories = Int(sum.doubleValue(for: HKUnit.kilocalorie()))
                continuation.resume(returning: calories)
            }
            
            healthStore.execute(query)
        }
    }
    
    private func fetchWorkoutCalories(from startDate: Date, to endDate: Date) async -> Int? {
        let predicate = HKQuery.predicateForSamples(
            withStart: startDate,
            end: endDate,
            options: .strictStartDate
        )
        
        return await withCheckedContinuation { continuation in
            let query = HKSampleQuery(
                sampleType: .workoutType(),
                predicate: predicate,
                limit: HKObjectQueryNoLimit,
                sortDescriptors: nil
            ) { _, samples, error in
                guard let workouts = samples as? [HKWorkout] else {
                    continuation.resume(returning: nil)
                    return
                }
                
                // Sum up all workout calories
                let totalCalories = workouts.reduce(0) { total, workout in
                    let calories = workout.totalEnergyBurned?.doubleValue(for: .kilocalorie()) ?? 0
                    print("🏃 Workout: \(workout.workoutActivityType.name) - \(Int(calories)) cal")
                    return total + Int(calories)
                }
                
                continuation.resume(returning: totalCalories > 0 ? totalCalories : nil)
            }
            
            healthStore.execute(query)
        }
    }
    
    func fetchWeightHistory(days: Int) async -> [(date: Date, weight: Double)] {
        print("🏋️ fetchWeightHistory called for \(days) days")
        
        if !isAuthorized {
            print("🏋️ Not authorized, requesting...")
            let authorized = await requestAuthorization()
            if !authorized {
                print("❌ Authorization failed")
                return []
            }
        }
        
        let weightType = HKQuantityType.quantityType(forIdentifier: .bodyMass)!
        let calendar = Calendar.current
        let endDate = Date()
        guard let startDate = calendar.date(byAdding: .day, value: -days, to: endDate) else { 
            print("❌ Failed to calculate start date")
            return [] 
        }
        
        print("🏋️ Querying weight from \(startDate) to \(endDate)")
        
        let predicate = HKQuery.predicateForSamples(
            withStart: startDate,
            end: endDate,
            options: .strictStartDate
        )
        
        return await withCheckedContinuation { continuation in
            let query = HKSampleQuery(
                sampleType: weightType,
                predicate: predicate,
                limit: HKObjectQueryNoLimit,
                sortDescriptors: [NSSortDescriptor(key: HKSampleSortIdentifierStartDate, ascending: true)]
            ) { _, samples, error in
                if let error = error {
                    print("❌ HealthKit query error: \(error)")
                    continuation.resume(returning: [])
                    return
                }
                
                guard let samples = samples as? [HKQuantitySample] else {
                    print("⚠️ No weight samples found or wrong type")
                    continuation.resume(returning: [])
                    return
                }
                
                print("✅ Found \(samples.count) weight samples")
                
                let weightData = samples.map { sample in
                    let weightInKg = sample.quantity.doubleValue(for: HKUnit.gramUnit(with: .kilo))
                    print("  📊 Weight: \(weightInKg)kg on \(sample.startDate)")
                    return (date: sample.startDate, weight: weightInKg)
                }
                
                continuation.resume(returning: weightData)
            }
            
            healthStore.execute(query)
        }
    }
    
    deinit {
        if let query = stepsObserverQuery {
            healthStore.stop(query)
        }
    }
}

// Extension to get workout type name
extension HKWorkoutActivityType {
    var name: String {
        switch self {
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
}