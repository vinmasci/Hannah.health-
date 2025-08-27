//
//  ChatViewModel.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import Foundation

@MainActor
final class ChatViewModel: ObservableObject {
    @Published var messages: [ChatMessage] = []
    @Published var isLoading = false
    @Published var isTyping = false
    @Published var errorMessage: String?
    @Published var shouldNavigateToMealPlan = false
    
    private let openAIService: OpenAIServiceProtocol
    private let braveSearchService: BraveSearchServiceProtocol
    private let confidenceService: NutritionConfidenceServiceProtocol
    private let supabaseService = SupabaseService.shared
    private var trackedFoods: [FoodConfidence] = []
    private let mealPlanViewModel = MealPlanViewModel()
    
    init(openAIService: OpenAIServiceProtocol = OpenAIService(),
         braveSearchService: BraveSearchServiceProtocol = BraveSearchService(),
         confidenceService: NutritionConfidenceServiceProtocol = NutritionConfidenceService()) {
        self.openAIService = openAIService
        self.braveSearchService = braveSearchService
        self.confidenceService = confidenceService
        
        // Add initial greeting
        messages.append(ChatMessage(
            text: "Hi! I'm Hannah. Just text me what you eat and I'll track it for you.",
            isUser: false
        ))
    }
    
    func sendMessage(_ text: String, imageData: Data? = nil) {
        guard !text.isEmpty || imageData != nil else { return }
        
        let messageText = text.isEmpty ? "What's in this image?" : text
        
        // Add user message with optional image
        messages.append(ChatMessage(text: messageText, isUser: true, imageData: imageData))
        
        // Process with AI
        Task {
            if let imageData = imageData {
                await processImageMessage(messageText, imageData: imageData)
            } else {
                await processMessage(messageText)
            }
        }
    }
    
    func sendImage(_ imageData: Data) {
        sendMessage("", imageData: imageData)
    }
    
    private func processMessage(_ text: String) async {
        isLoading = true
        isTyping = true
        errorMessage = nil
        
        // Check if user is asking about meal plans
        if checkMealPlanRequest(text) {
            await handleMealPlanRequest(text)
            return
        }
        
        do {
            var searchContext: String? = nil
            
            // Store search result for confidence calculation
            var searchDomains: [String] = []
            
            // Check if we should search for nutrition data
            if braveSearchService.shouldSearchForQuery(text) {
                print("📱 Triggering search for: \(text)")
                
                // Perform search without showing thinking message
                let searchResult = try await braveSearchService.searchNutritionData(query: text)
                searchContext = searchResult.context
                searchDomains = searchResult.domains
                
                if let context = searchContext, !context.isEmpty {
                    print("📱 Got search context with \(context.count) characters from domains: \(searchDomains)")
                } else {
                    print("⚠️ Search context is empty")
                }
            } else {
                print("📱 No search triggered for: \(text)")
            }
            
            // Build conversation history for OpenAI
            let openAIMessages = messages.compactMap { message -> OpenAIMessage? in
                // Skip thinking messages
                if message.text.contains("Searching nutrition") {
                    return nil
                }
                return OpenAIMessage(
                    role: message.isUser ? "user" : "assistant",
                    content: message.text
                )
            }
            
            // Get response from OpenAI
            let response = try await openAIService.sendMessage(openAIMessages, searchContext: searchContext)
            
            // Calculate confidence based on search domains we already have
            var confidence: Double? = nil
            if !searchDomains.isEmpty && braveSearchService.shouldSearchForQuery(text) {
                // Use the response text for better food identification
                let foodConfidence = confidenceService.calculateConfidence(
                    for: response,  // Use Hannah's response which contains the identified food
                    searchDomains: searchDomains
                )
                trackedFoods.append(foodConfidence)
                confidence = foodConfidence.confidence
                
                // Log confidence internally for debugging
                print("📊 Tracked: \(foodConfidence.foodItem) with \(Int(foodConfidence.confidence * 100))% confidence (\(foodConfidence.source))")
                print("📊 Domains used: \(searchDomains)")
            }
            
            // Add Hannah's response with confidence score
            messages.append(ChatMessage(
                text: response,
                isUser: false,
                confidence: confidence
            ))
            
            // Save to Supabase if food was tracked with confidence
            if let confidence = confidence, confidence > 0 {
                await saveFoodToSupabase(response: response, confidence: confidence, originalQuery: text)
            }
            
        } catch NetworkError.apiKeyMissing {
            errorMessage = "Please configure your API keys in APIConfig.swift"
            messages.append(ChatMessage(
                text: "I need API keys to be configured. Please update APIConfig.swift with your OpenAI and Brave Search API keys.",
                isUser: false
            ))
        } catch {
            errorMessage = error.localizedDescription
            messages.append(ChatMessage(
                text: "Sorry, I had trouble processing that. Please try again.",
                isUser: false
            ))
        }
        
        isLoading = false
        isTyping = false
    }
    
    private func calculateConfidence(for query: String, response: String) -> Double? {
        // Don't show confidence for simple logging responses
        // Confidence will be used internally for tracking accuracy but not displayed
        return nil
    }
    
    private func saveFoodToSupabase(response: String, confidence: Double, originalQuery: String) async {
        // Skip if user is not logged in
        guard let user = supabaseService.getCurrentUser() else {
            print("⚠️ No user logged in, skipping Supabase save")
            return
        }
        
        // Extract calories from response
        var calories = 0
        if let calorieRange = response.lowercased().range(of: #"(\d+)\s*(?:calories|cal|kcal)"#,
                                                           options: .regularExpression) {
            let calorieString = String(response[calorieRange])
            let numbers = calorieString.filter { $0.isNumber }
            calories = Int(numbers) ?? 0
        }
        
        // Extract food name from response (first few words after "Got it" or "Logged")
        var foodName = originalQuery
        if response.lowercased().contains("logged") || response.lowercased().contains("got it") {
            // Try to extract food name from response
            let components = response.components(separatedBy: CharacterSet(charactersIn: "-–"))
            if components.count > 0 {
                foodName = components[0]
                    .replacingOccurrences(of: "Got it,", with: "")
                    .replacingOccurrences(of: "Logged", with: "")
                    .replacingOccurrences(of: "your", with: "")
                    .trimmingCharacters(in: .whitespacesAndNewlines)
            }
        }
        
        // Determine meal type based on time of day
        let hour = Calendar.current.component(.hour, from: Date())
        let mealType: String
        switch hour {
        case 5..<11:
            mealType = "breakfast"
        case 11..<15:
            mealType = "lunch"
        case 15..<20:
            mealType = "dinner"
        default:
            mealType = "snack"
        }
        
        // Create food entry
        let foodEntry = FoodEntry(
            id: nil,
            userId: user.id,
            foodName: foodName,
            calories: calories,
            protein: nil,
            carbs: nil,
            fat: nil,
            confidence: confidence,
            imageUrl: nil,
            createdAt: nil,
            mealType: mealType
        )
        
        // Save to Supabase
        do {
            try await supabaseService.saveFoodEntry(foodEntry)
            print("✅ Saved to Supabase: \(foodName) - \(calories) cal (\(Int(confidence * 100))% confidence)")
        } catch {
            print("❌ Failed to save to Supabase: \(error)")
        }
    }
    
    private func processImageMessage(_ text: String, imageData: Data) async {
        isLoading = true
        isTyping = true
        errorMessage = nil
        
        do {
            // First, get search context for nutrition data
            let searchResult = try await braveSearchService.searchNutritionData(query: text.isEmpty ? "food calories nutrition" : text)
            
            // Analyze the image with GPT-4 Vision
            let response = try await openAIService.analyzeImage(
                imageData,
                text: text.isEmpty ? nil : text,
                searchContext: searchResult.context
            )
            
            // Calculate confidence based on image analysis
            let foodConfidence = confidenceService.calculateConfidence(
                for: response,
                searchDomains: searchResult.domains
            )
            trackedFoods.append(foodConfidence)
            
            // Add Hannah's response with confidence
            messages.append(ChatMessage(
                text: response,
                isUser: false,
                confidence: foodConfidence.confidence
            ))
            
            // Log confidence internally
            print("📸 Image analyzed: \(foodConfidence.foodItem) with \(Int(foodConfidence.confidence * 100))% confidence")
            
        } catch NetworkError.apiKeyMissing {
            errorMessage = "Please configure your API keys in APIConfig.swift"
            messages.append(ChatMessage(
                text: "I need API keys to be configured. Please update APIConfig.swift with your OpenAI and Brave Search API keys.",
                isUser: false
            ))
        } catch {
            errorMessage = error.localizedDescription
            messages.append(ChatMessage(
                text: "Sorry, I had trouble analyzing that image. Please try again.",
                isUser: false
            ))
        }
        
        isLoading = false
        isTyping = false
    }
    
    // MARK: - Meal Plan Integration
    
    private func checkMealPlanRequest(_ text: String) -> Bool {
        let mealPlanKeywords = [
            "meal plan", "mealplan", "plan my meals", "weekly plan",
            "create a meal plan", "make me a meal plan", "suggest meals",
            "plan for the week", "weekly meals", "meal schedule",
            "update my meal plan", "change my meal plan", "new meal plan"
        ]
        
        let lowercasedText = text.lowercased()
        return mealPlanKeywords.contains { lowercasedText.contains($0) }
    }
    
    private func handleMealPlanRequest(_ text: String) async {
        do {
            // First check if user has enough tracking days
            if !mealPlanViewModel.isUnlocked {
                messages.append(ChatMessage(
                    text: "Your personalized meal plan unlocks after 7 days of tracking. You have \(mealPlanViewModel.daysTracked) days tracked so far - \(mealPlanViewModel.daysUntilUnlock) more to go! Keep logging your meals and I'll create an amazing plan tailored just for you.",
                    isUser: false
                ))
                isLoading = false
                isTyping = false
                return
            }
            
            // Generate meal plan using AI
            messages.append(ChatMessage(
                text: "Creating your personalized meal plan based on your preferences and goals...",
                isUser: false
            ))
            
            // Build prompt with user context
            let systemPrompt = """
            You are Hannah, a nutrition expert creating personalized meal plans.
            Create a 7-day meal plan that:
            1. Includes breakfast, lunch, dinner, and one snack per day
            2. Provides realistic calorie counts and macros
            3. Uses common, accessible ingredients
            4. Considers the user's request: "\(text)"
            
            Format each meal clearly with name, calories, and basic macros.
            Keep suggestions practical and achievable.
            """
            
            let messages = [
                OpenAIMessage(role: "system", content: systemPrompt),
                OpenAIMessage(role: "user", content: text)
            ]
            
            let response = try await openAIService.sendMessage(messages, searchContext: nil)
            
            // Update UI with response
            self.messages.append(ChatMessage(
                text: response + "\n\n✨ I've created your meal plan! Check the Meal Plan tab to see your personalized weekly schedule.",
                isUser: false
            ))
            
            // Trigger navigation to meal plan
            shouldNavigateToMealPlan = true
            
            // Generate the actual meal plan in the background
            await mealPlanViewModel.generateMealPlan(from: text)
            
        } catch {
            messages.append(ChatMessage(
                text: "I had trouble creating your meal plan. Please try again or be more specific about your dietary preferences.",
                isUser: false
            ))
        }
        
        isLoading = false
        isTyping = false
    }
}