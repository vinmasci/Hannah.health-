//
//  Constants.swift
//  HannahHealth
//
//  Central location for app-wide constants and magic numbers
//

import Foundation
import SwiftUI

enum Constants {
    
    // MARK: - UI Dimensions
    enum UI {
        static let defaultPadding: CGFloat = 16
        static let cardPadding: CGFloat = 20
        static let cornerRadius: CGFloat = 12
        static let tabBarHeight: CGFloat = 140
        static let profileImageSize: CGFloat = 44
        static let foodIconSize: CGFloat = 40
        static let statCardIconSize: CGFloat = 16
    }
    
    // MARK: - Animation Durations
    enum Animation {
        static let standard: Double = 0.3
        static let progress: Double = 0.5
        static let longProgress: Double = 1.0
        static let pageTransition: Double = 0.25
        static let particleMove: Double = 8.0  // minimum for particle movement
        static let particleMoveMax: Double = 15.0
        static let particlePulse: Double = 1.5  // minimum for pulsing
        static let particlePulseMax: Double = 3.0
        static let backgroundTransition: Double = 2.0
    }
    
    // MARK: - Calories & Nutrition
    enum Nutrition {
        static let defaultBMR: Int = 1800
        static let defaultDeficitTarget: Int = 500
        static let proteinCaloriesPerGram: Double = 4.0
        static let carbsCaloriesPerGram: Double = 4.0
        static let fatCaloriesPerGram: Double = 9.0
        static let waterCupsGoal: Int = 8
    }
    
    // MARK: - Progress Thresholds
    enum Progress {
        static let caloriesWarningThreshold: Double = 0.8
        static let deficitTargetProgress: Double = 0.85
        static let confidenceHighThreshold: Double = 0.9
        static let confidenceMediumThreshold: Double = 0.7
        static let mealDividers: [Double] = [0.0, 0.33, 0.66]  // breakfast, lunch, dinner
    }
    
    // MARK: - Dashboard Specific
    enum Dashboard {
        static let circleSize: CGFloat = 140
        static let circleLineWidth: CGFloat = 10
        static let macroCircleSize: CGFloat = 70
        static let macroLineWidth: CGFloat = 6
        static let adviceCardWidth: CGFloat = 200
        static let statsGridSpacing: CGFloat = 12
        static let vStackSpacing: CGFloat = 18
        static let progressBarHeight: CGFloat = 4
    }
    
    // MARK: - Steps & Exercise Goals
    enum Goals {
        static let defaultStepsGoal: Int = 10000
        static let defaultExerciseCaloriesGoal: Int = 300
        static let defaultProteinGoal: Int = 129
        static let defaultCarbsGoal: Int = 322
        static let defaultFatGoal: Int = 86
    }
    
    // MARK: - Particle System
    enum Particles {
        static let particleCount: Int = 15
        static let minParticleSize: CGFloat = 2
        static let maxParticleSize: CGFloat = 5
        static let minOpacity: Double = 0.4
        static let maxOpacity: Double = 0.9
        static let scaleRangeMin: CGFloat = 0.8
        static let scaleRangeMax: CGFloat = 1.3
    }
    
    // MARK: - SMS Configuration
    enum SMS {
        static let maxMessageLength: Int = 140  // Keep SMS responses concise
        static let maxSMSChainLength: Int = 320  // 2 SMS messages
        static let conversationHistoryLimit: Int = 20
        static let theatricalChance: Double = 0.2  // 20% chance for theatrical flair
    }
    
    // MARK: - API Configuration
    enum API {
        // These would typically be in environment variables
        static let backendPort: Int = 3001
        static let smsGatewayPort: Int = 3000
        static let requestTimeout: TimeInterval = 30
        static let imageUploadMaxSize: Int = 10_485_760  // 10MB
    }
}