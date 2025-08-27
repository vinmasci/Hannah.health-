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
        HKObjectType.quantityType(forIdentifier: .distanceWalkingRunning)!
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
            return false
        }
        
        do {
            try await healthStore.requestAuthorization(
                toShare: writeTypes,
                read: readTypes
            )
            await MainActor.run {
                self.isAuthorized = true
            }
            return true
        } catch {
            print("HealthKit authorization failed: \(error)")
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
        guard isAuthorized else { return nil }
        
        let energyType = HKQuantityType.quantityType(forIdentifier: .activeEnergyBurned)!
        
        let calendar = Calendar.current
        let startOfDay = calendar.startOfDay(for: Date())
        let endOfDay = calendar.date(byAdding: .day, value: 1, to: startOfDay)!
        
        let predicate = HKQuery.predicateForSamples(
            withStart: startOfDay,
            end: endOfDay,
            options: .strictStartDate
        )
        
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
    
    deinit {
        if let query = stepsObserverQuery {
            healthStore.stop(query)
        }
    }
}