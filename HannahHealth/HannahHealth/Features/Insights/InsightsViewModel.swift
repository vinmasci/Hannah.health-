//
//  InsightsViewModel.swift
//  HannahHealth
//
//  Created on 29/1/2025.
//

import SwiftUI
import Combine
import HealthKit

// Simple weight data structure for HealthKit data
struct WeightDataPoint: Identifiable {
    let id = UUID()
    let date: Date
    let weightKg: Double
    var weightLbs: Double { weightKg * 2.205 }
}

@MainActor
final class InsightsViewModel: ObservableObject {
    // MARK: - Published Properties
    @Published var weightLogs: [WeightDataPoint] = []
    @Published var isLoadingWeight = false
    @Published var useMetric: Bool = false  // User's metric preference
    
    // Average Stats (calculated from real data)
    @Published var avgCalories: Int = 0
    @Published var avgSteps: Int = 0
    @Published var avgExerciseMinutes: Int = 0
    @Published var avgActiveCalories: Int = 0
    
    // Trends
    @Published var caloriesTrend: Double = 0.0  // Percentage change
    @Published var stepsTrend: Double = 0.0     // Percentage change
    @Published var exerciseTrend: Double = 0.0  // Percentage change
    
    // Weekly totals for goals
    @Published var weeklyCaloriesTotal: Int = 0
    @Published var weeklyStepsTotal: Int = 0
    @Published var weeklyExerciseMinutes: Int = 0
    
    // Insights
    @Published var mostActiveDay: String = ""
    @Published var bestStreak: Int = 0
    @Published var avgDeficit: Int = 0
    
    @Published var isLoadingStats = false
    
    // MARK: - Dependencies
    private let healthKitService = HealthKitService()
    private var cancellables = Set<AnyCancellable>()
    
    // MARK: - Init
    init() {
        loadUserPreferences()
        loadAllData()
    }
    
    private func loadUserPreferences() {
        // Check if user prefers metric from UserDefaults
        let userDefaults = UserDefaults.standard
        // Check for stored preference or use locale default
        if let storedPreference = userDefaults.object(forKey: "preferMetric") as? Bool {
            useMetric = storedPreference
        } else {
            // Default to locale setting
            useMetric = Locale.current.usesMetricSystem
        }
    }
    
    // MARK: - Data Loading
    func loadAllData() {
        Task {
            await loadWeightData()
            await loadHealthStats()
            await calculateTrends()
        }
    }
    
    func loadWeightData() async {
        isLoadingWeight = true
        
        // Load weight history from HealthKit (last 365 days to support year view)
        let weightData = await healthKitService.fetchWeightHistory(days: 365)
        
        // Group by date and keep only ONE entry per day (latest time)
        let calendar = Calendar.current
        var latestByDay: [String: (date: Date, weight: Double)] = [:]
        
        let dateFormatter = DateFormatter()
        dateFormatter.dateFormat = "yyyy-MM-dd"
        
        for data in weightData {
            let dayKey = dateFormatter.string(from: data.date)
            
            if let existing = latestByDay[dayKey] {
                // Keep the later entry for the same day
                if data.date > existing.date {
                    latestByDay[dayKey] = data
                }
            } else {
                latestByDay[dayKey] = data
            }
        }
        
        // Convert to WeightDataPoint format, sorted by date
        let logs = latestByDay.values
            .map { data in
                WeightDataPoint(
                    date: data.date,
                    weightKg: data.weight
                )
            }
            .sorted { $0.date < $1.date }
        
        await MainActor.run {
            self.weightLogs = logs
            self.isLoadingWeight = false
            
            if logs.isEmpty {
                print("⚠️ No weight data found in HealthKit")
            } else {
                print("✅ Loaded \(logs.count) unique daily weight entries from HealthKit (filtered from \(weightData.count) total)")
            }
        }
    }
    
    private func loadHealthStats() async {
        isLoadingStats = true
        
        let calendar = Calendar.current
        let today = Date()
        
        // Calculate averages for last 7 days
        var totalCalories = 0
        var totalSteps = 0
        var totalActiveCalories = 0
        var totalExerciseMinutes = 0
        var validDays = 0
        
        // Weekly totals
        var weeklyCalories = 0
        var weeklySteps = 0
        
        // Track daily activity for finding most active day
        var dailyActivity: [(day: String, calories: Int)] = []
        
        for dayOffset in 0..<7 {
            guard let date = calendar.date(byAdding: .day, value: -dayOffset, to: today) else { continue }
            
            // Fetch steps
            if let steps = await healthKitService.fetchSteps(for: date) {
                totalSteps += steps
                weeklySteps += steps
            }
            
            // Fetch active energy
            if let activeEnergy = await healthKitService.fetchCaloriesBurned(for: date) {
                totalActiveCalories += activeEnergy
                weeklyCalories += activeEnergy
                
                // Track for most active day
                let dayName = dayFormatter.string(from: date)
                dailyActivity.append((day: dayName, calories: activeEnergy))
            }
            
            // Fetch food calories from Supabase
            do {
                let foodEntries = try await SupabaseService.shared.getFoodEntries(for: date)
                let dayCalories = foodEntries.reduce(0) { $0 + $1.calories }
                totalCalories += dayCalories
            } catch {
                print("Failed to fetch food entries for \(date): \(error)")
            }
            
            validDays += 1
        }
        
        // Calculate averages
        await MainActor.run {
            if validDays > 0 {
                self.avgCalories = totalCalories / validDays
                self.avgSteps = totalSteps / validDays
                self.avgActiveCalories = totalActiveCalories / validDays
                self.avgExerciseMinutes = totalActiveCalories / 10  // Rough estimate: 10 cal/minute
                
                self.weeklyCaloriesTotal = weeklyCalories
                self.weeklyStepsTotal = weeklySteps
                self.weeklyExerciseMinutes = weeklyCalories / 10
            }
            
            // Find most active day
            if let mostActive = dailyActivity.max(by: { $0.calories < $1.calories }) {
                self.mostActiveDay = mostActive.day
            }
            
            // Calculate average deficit using actual user TDEE
            // Get user profile data (similar to DashboardViewModel)
            let userDefaults = UserDefaults.standard
            let bmr = userDefaults.integer(forKey: "userBMR")
            let tdee = bmr > 0 ? bmr : 1800  // Use actual BMR/TDEE from profile or reasonable default
            self.avgDeficit = tdee - self.avgCalories
            
            self.isLoadingStats = false
        }
    }
    
    private func calculateTrends() async {
        // Compare this week vs last week
        let calendar = Calendar.current
        let today = Date()
        
        // This week's data (already calculated above)
        let thisWeekSteps = weeklyStepsTotal
        let thisWeekCalories = weeklyCaloriesTotal
        
        // Last week's data
        var lastWeekSteps = 0
        var lastWeekCalories = 0
        
        for dayOffset in 7..<14 {
            guard let date = calendar.date(byAdding: .day, value: -dayOffset, to: today) else { continue }
            
            if let steps = await healthKitService.fetchSteps(for: date) {
                lastWeekSteps += steps
            }
            
            if let activeEnergy = await healthKitService.fetchCaloriesBurned(for: date) {
                lastWeekCalories += activeEnergy
            }
        }
        
        // Calculate the streak first (async)
        let streak = await calculateLoggingStreak()
        
        // Then update UI properties on MainActor
        await MainActor.run {
            // Calculate percentage changes
            if lastWeekSteps > 0 {
                self.stepsTrend = Double(thisWeekSteps - lastWeekSteps) / Double(lastWeekSteps) * 100
            }
            
            if lastWeekCalories > 0 {
                self.caloriesTrend = Double(thisWeekCalories - lastWeekCalories) / Double(lastWeekCalories) * 100
                self.exerciseTrend = self.caloriesTrend  // Same as calories trend for now
            }
            
            // Set the calculated streak
            self.bestStreak = streak
        }
    }
    
    private func calculateLoggingStreak() async -> Int {
        let calendar = Calendar.current
        let today = Date()
        var streak = 0
        var consecutiveDays = 0
        
        // Check last 30 days for logging streak
        for dayOffset in 0..<30 {
            guard let date = calendar.date(byAdding: .day, value: -dayOffset, to: today) else { break }
            
            do {
                let foodEntries = try await SupabaseService.shared.getFoodEntries(for: date)
                if !foodEntries.isEmpty {
                    consecutiveDays += 1
                    streak = max(streak, consecutiveDays)
                } else {
                    // Only break current streak if it's today or recent days
                    if dayOffset < 7 {
                        consecutiveDays = 0
                    }
                }
            } catch {
                // If we can't fetch, don't break the streak
                continue
            }
        }
        
        return streak
    }
    
    private let dayFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "EEEE"  // Full day name
        return formatter
    }()
}