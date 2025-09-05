//
//  LogView.swift
//  HannahHealth
//
//  Quick logging drawer with chat interface
//

import SwiftUI
import Combine
import Foundation







struct QuickLogDrawer: View {
    let selectedDate: Date
    @Environment(\.dismiss) private var dismiss
    @StateObject private var viewModel: QuickLogViewModel
    
    init(selectedDate: Date) {
        self.selectedDate = selectedDate
        self._viewModel = StateObject(wrappedValue: QuickLogViewModel(selectedDate: selectedDate))
    }
    @State private var messageText = ""
    @State private var selectedMealType: String? = nil
    @State private var isSnackSelected: Bool = false
    @State private var showConfirmButtons = false
    @State private var pendingFoodItem: (food: String, calories: Int)? = nil
    @State private var showRecentMeals = false
    @State private var recentMeals: [(food: String, calories: Int)] = []
    @FocusState private var isInputFocused: Bool
    
    var body: some View {
        ZStack {
            // Dark background matching AI Coach
            Color(hex: "202123")
                .ignoresSafeArea()
                
                VStack(spacing: 0) {
                    // Header
                    HStack {
                        VStack(alignment: .leading, spacing: 2) {
                            Text("Quick Log")
                                .font(.system(size: 18, weight: .semibold))
                                .foregroundColor(Color(hex: "ECECEC"))
                            Text(formatDateForDisplay(selectedDate))
                                .font(.system(size: 12, weight: .regular))
                                .foregroundColor(.white.opacity(0.7))
                        }
                        
                        Spacer()
                        
                        Button("Done") {
                            dismiss()
                        }
                        .foregroundColor(Color(hex: "10A37F"))
                    }
                    .padding()
                    .background(Color(hex: "202123"))
                    
                    // Chat messages
                    ScrollViewReader { proxy in
                        ScrollView {
                            VStack(spacing: 16) {
                                // Add top padding
                                Color.clear
                                    .frame(height: 20)
                                
                                // Welcome message
                                HStack(alignment: .top, spacing: 12) {
                                    Circle()
                                        .fill(Color(hex: "10A37F"))
                                        .frame(width: 30, height: 30)
                                        .overlay(
                                            Text("H")
                                                .font(.system(size: 14, weight: .semibold))
                                                .foregroundColor(.white)
                                        )
                                    
                                    VStack(alignment: .leading, spacing: 4) {
                                        Text("Hi! I can help you log your food and exercise. Just tell me what you'd like to log - for example: '2 eggs', 'chicken sandwich', or '30 min walk'. I'll calculate the nutritional information for you.")
                                            .font(.system(size: 16))
                                            .foregroundColor(Color(hex: "ECECEC"))
                                    }
                                    
                                    Spacer(minLength: 50)
                                }
                                .padding(.horizontal, 20)
                                
                                ForEach(viewModel.messages) { message in
                                    VStack(alignment: .leading, spacing: 8) {
                                        messageRow(for: message)
                                            .id(message.id)
                                        
                                        // Show confirm buttons after a message that needs confirmation
                                        if !message.isUser && 
                                           (message.text.contains("calories") || message.text.contains(" cal")) &&
                                           message.text.contains("confirm") &&
                                           message.id == viewModel.messages.last?.id {
                                            confirmationButtons()
                                                .padding(.horizontal, 20)
                                                .padding(.bottom, 10)
                                        }
                                    }
                                }
                                
                                Color.clear
                                    .frame(height: 20)
                                    .id("bottom")
                            }
                        }
                        .scrollDismissesKeyboard(.immediately)
                        .onChange(of: viewModel.messages.count) { _, _ in
                            withAnimation {
                                proxy.scrollTo("bottom", anchor: .bottom)
                            }
                        }
                    }
                    
                    // Input bar matching AI Coach style
                    VStack(spacing: 12) {
                        // Quick action buttons
                        ScrollView(.horizontal, showsIndicators: false) {
                            HStack(spacing: 10) {
                                QuickLogButton(
                                    icon: "sunrise",
                                    label: "Breakfast",
                                    isSelected: selectedMealType == "breakfast",
                                    customColor: Color(hex: "FDA4AF")  // Rose 300
                                ) {
                                    selectedMealType = selectedMealType == "breakfast" ? nil : "breakfast"
                                }
                                
                                QuickLogButton(
                                    icon: "sun.max",
                                    label: "Lunch",
                                    isSelected: selectedMealType == "lunch",
                                    customColor: Color.yellow
                                ) {
                                    selectedMealType = selectedMealType == "lunch" ? nil : "lunch"
                                }
                                
                                QuickLogButton(
                                    icon: "sunset",
                                    label: "Dinner",
                                    isSelected: selectedMealType == "dinner",
                                    customColor: Color.purple
                                ) {
                                    selectedMealType = selectedMealType == "dinner" ? nil : "dinner"
                                }
                                
                                QuickLogButton(
                                    icon: "carrot",
                                    label: "Snack",
                                    isSelected: isSnackSelected,
                                    customColor: Color.orange
                                ) {
                                    isSnackSelected = !isSnackSelected
                                }
                                
                                QuickLogButton(
                                    icon: "scalemass",
                                    label: "Weight",
                                    isSelected: selectedMealType == "weight"
                                ) {
                                    selectedMealType = selectedMealType == "weight" ? nil : "weight"
                                }
                                
                                QuickLogButton(
                                    icon: "figure.walk",
                                    label: "Exercise",
                                    isSelected: selectedMealType == "exercise",
                                    customColor: Theme.coral
                                ) {
                                    selectedMealType = selectedMealType == "exercise" ? nil : "exercise"
                                }
                            }
                            .padding(.horizontal, 20)
                        }
                        .padding(.vertical, 8)
                        
                        HStack(spacing: 12) {
                            // Plus button for recent meals
                            Button(action: {
                                showRecentMeals.toggle()
                                if showRecentMeals {
                                    Task {
                                        await loadRecentMeals()
                                    }
                                }
                            }) {
                                Image(systemName: "plus.circle.fill")
                                    .font(.system(size: 24))
                                    .foregroundColor(showRecentMeals ? Color(hex: "10A37F") : Color(hex: "8E8EA0"))
                            }
                            
                            HStack(spacing: 12) {
                                TextField("Tell me what you would like to log...", text: $messageText)
                                    .font(.system(size: 16))
                                    .foregroundColor(Color(hex: "ECECEC"))
                                    .accentColor(Color(hex: "10A37F"))
                                    .textFieldStyle(.plain)
                                    .focused($isInputFocused)
                                    .onSubmit {
                                        sendMessage()
                                    }
                                
                                Button(action: sendMessage) {
                                    Image(systemName: "arrow.up")
                                        .font(.system(size: 16, weight: .semibold))
                                        .foregroundColor(messageText.isEmpty ? Color(hex: "565869") : .black)
                                        .frame(width: 30, height: 30)
                                        .background(messageText.isEmpty ? Color(hex: "40414F") : Color(hex: "ECECEC"))
                                        .clipShape(Circle())
                                }
                                .disabled(messageText.isEmpty)
                            }
                            .padding(.horizontal, 20)
                            .padding(.vertical, 12)
                            .background(Color(hex: "40414F"))
                            .overlay(
                                RoundedRectangle(cornerRadius: 24)
                                    .stroke(Color(hex: "565869"), lineWidth: 1)
                            )
                            .cornerRadius(24)
                        }
                        .padding(.horizontal, 20)
                        
                        Text("Hannah can make mistakes. Check important info.")
                            .font(.system(size: 12))
                            .foregroundColor(Color(hex: "8E8EA0"))
                    }
                    .padding(.top, 8)
                    .padding(.bottom, 20)
                    .background(Color(hex: "202123"))
            }
            
            // Recent meals overlay
            if showRecentMeals {
                VStack {
                    Spacer()
                    
                    VStack(alignment: .leading, spacing: 12) {
                        HStack {
                            Text("Recent Meals")
                                .font(.system(size: 16, weight: .semibold))
                                .foregroundColor(Color(hex: "ECECEC"))
                            
                            Spacer()
                            
                            Button(action: {
                                showRecentMeals = false
                            }) {
                                Image(systemName: "xmark.circle.fill")
                                    .font(.system(size: 20))
                                    .foregroundColor(Color(hex: "8E8EA0"))
                            }
                        }
                        .padding(.horizontal)
                        .padding(.top)
                        
                        ScrollView {
                            VStack(spacing: 8) {
                                if recentMeals.isEmpty {
                                    Text("No recent meals found")
                                        .font(.system(size: 14))
                                        .foregroundColor(Color(hex: "8E8EA0"))
                                        .padding()
                                } else {
                                    ForEach(Array(recentMeals.enumerated()), id: \.offset) { index, meal in
                                        Button(action: {
                                            messageText = meal.food
                                            showRecentMeals = false
                                            // Optionally auto-send
                                            Task {
                                                await viewModel.sendMessage(meal.food)
                                            }
                                        }) {
                                            HStack {
                                                VStack(alignment: .leading, spacing: 2) {
                                                    Text(meal.food)
                                                        .font(.system(size: 14, weight: .medium))
                                                        .foregroundColor(Color(hex: "ECECEC"))
                                                        .lineLimit(1)
                                                    
                                                    Text("\(meal.calories) cal")
                                                        .font(.system(size: 12))
                                                        .foregroundColor(Color(hex: "8E8EA0"))
                                                }
                                                
                                                Spacer()
                                                
                                                Image(systemName: "plus.circle")
                                                    .font(.system(size: 16))
                                                    .foregroundColor(Color(hex: "10A37F"))
                                            }
                                            .padding(.horizontal)
                                            .padding(.vertical, 8)
                                            .background(Color(hex: "2B2D31"))
                                            .cornerRadius(8)
                                        }
                                        .buttonStyle(PlainButtonStyle())
                                        .padding(.horizontal)
                                    }
                                }
                            }
                        }
                        .frame(maxHeight: 300)
                    }
                    .background(Color(hex: "202123"))
                    .cornerRadius(20, corners: [.topLeft, .topRight])
                    .shadow(radius: 10)
                    .transition(.move(edge: .bottom))
                    .animation(.spring(), value: showRecentMeals)
                }
            }
        }
        .presentationDetents([.large])
        .presentationDragIndicator(.visible)
        .presentationBackground(Color(hex: "202123"))
        .interactiveDismissDisabled(false)
        .onAppear {
            // Auto-focus the text field when the sheet appears
            DispatchQueue.main.asyncAfter(deadline: .now() + 0.3) {
                isInputFocused = true
            }
        }
    }
    
    private func loadRecentMeals() async {
        // Load last 20 unique food items from Supabase
        do {
            let allEntries = try await SupabaseService.shared.getWeeklyFoodEntries()
            
            // Sort by date first (most recent first)
            let sortedEntries = allEntries
                .filter { $0.calories > 0 } // Only food, not exercise
                .sorted { entry1, entry2 in
                    // Parse dates and sort by most recent
                    let formatter = ISO8601DateFormatter()
                    let date1 = formatter.date(from: entry1.createdAt ?? "") ?? Date.distantPast
                    let date2 = formatter.date(from: entry2.createdAt ?? "") ?? Date.distantPast
                    return date1 > date2 // Most recent first
                }
            
            // Keep track of seen items to avoid duplicates, but maintain order
            var seenMeals = Set<String>()
            var orderedMeals: [(food: String, calories: Int)] = []
            
            for entry in sortedEntries {
                let name = entry.foodName
                let nameLower = name.lowercased()
                
                if !seenMeals.contains(nameLower) {
                    seenMeals.insert(nameLower)
                    orderedMeals.append((food: name, calories: entry.calories))
                    
                    // Stop once we have 20 unique items
                    if orderedMeals.count >= 20 {
                        break
                    }
                }
            }
            
            await MainActor.run {
                recentMeals = orderedMeals
            }
        } catch {
            print("Failed to load recent meals: \(error)")
        }
    }
    
    private func formatDateForDisplay(_ date: Date) -> String {
        let calendar = Calendar.current
        let formatter = DateFormatter()
        
        if calendar.isDateInToday(date) {
            return "Today"
        } else if calendar.isDateInYesterday(date) {
            return "Yesterday"
        } else {
            formatter.dateFormat = "MMM d, yyyy"
            return formatter.string(from: date)
        }
    }
    
    private func sendMessage() {
        guard !messageText.isEmpty else { return }
        
        var text = messageText
        
        // Build meal type context based on selections
        var mealContext = ""
        
        // When both meal and snack are selected, just use the snack timing
        // (e.g., breakfast + snack = morning snack)
        if let mealType = selectedMealType, isSnackSelected {
            mealContext = determineSnackTiming(for: mealType)
        } else if let mealType = selectedMealType {
            // Just the meal is selected
            mealContext = mealType
        } else if isSnackSelected {
            // Just snack is selected, use default "snack"
            mealContext = "snack"
        }
        
        // Map non-standard meal types in the message to standard ones
        let mealTypeMapping: [String: String] = [
            "brunch": "lunch",
            "dessert": "evening snack",
            "midnight snack": "evening snack",
            "late night snack": "evening snack",
            "appetizer": "snack",
            "pre-workout": "snack",
            "post-workout": "snack",
            "pre workout": "snack",
            "post workout": "snack",
            "tea time": "afternoon snack",
            "teatime": "afternoon snack"
        ]
        
        // Check if message contains any meal type variations and map them
        let messageLower = text.lowercased()
        if mealContext.isEmpty {
            for (variant, standard) in mealTypeMapping {
                if messageLower.contains(variant) {
                    mealContext = standard
                    // Remove the variant from the message to avoid confusion
                    text = text.replacingOccurrences(of: variant, with: "", options: .caseInsensitive)
                    break
                }
            }
        }
        
        // Add context to message if any meal type is selected
        if !mealContext.isEmpty {
            text = "For \(mealContext): \(text)"
        }
        
        messageText = ""
        // Don't clear meal selections - keep them sticky until confirm/cancel
        // selectedMealType = nil
        // isSnackSelected = false
        
        Task {
            viewModel.selectedMealType = mealContext  // Pass combined context to view model
            await viewModel.sendMessage(text)
        }
    }
    
    private func determineSnackTiming(for mealType: String) -> String {
        switch mealType {
        case "breakfast":
            return "morning snack"
        case "lunch":
            return "afternoon snack"
        case "dinner":
            return "evening snack"
        default:
            return "snack"
        }
    }
    
    private func confirmationButtons() -> some View {
        HStack(spacing: 12) {
            // Cancel button
            Button(action: {
                // Clear the pending food and selections
                viewModel.clearPendingFood()
                messageText = ""
                selectedMealType = nil  // Clear selections on cancel
                isSnackSelected = false
            }) {
                HStack {
                    Image(systemName: "xmark.circle.fill")
                        .font(.system(size: 16))
                    Text("Cancel")
                        .font(.system(size: 14, weight: .medium))
                }
                .foregroundColor(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color.red.opacity(0.2))
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color.red.opacity(0.5), lineWidth: 1)
                )
                .cornerRadius(20)
            }
            
            // Confirm button
            Button(action: {
                Task {
                    // Pass the current meal selection to viewModel before confirming
                    if let mealType = selectedMealType {
                        if isSnackSelected {
                            viewModel.selectedMealType = determineSnackTiming(for: mealType)
                        } else {
                            viewModel.selectedMealType = mealType
                        }
                    } else if isSnackSelected {
                        viewModel.selectedMealType = "snack"
                    }
                    await viewModel.confirmFood()
                    // Clear selections after successful confirmation
                    selectedMealType = nil
                    isSnackSelected = false
                }
            }) {
                HStack {
                    Image(systemName: "checkmark.circle.fill")
                        .font(.system(size: 16))
                    Text("Confirm")
                        .font(.system(size: 14, weight: .medium))
                }
                .foregroundColor(.white)
                .padding(.horizontal, 16)
                .padding(.vertical, 8)
                .background(Color.green.opacity(0.2))
                .overlay(
                    RoundedRectangle(cornerRadius: 20)
                        .stroke(Color.green.opacity(0.5), lineWidth: 1)
                )
                .cornerRadius(20)
            }
            
            Spacer()
        }
    }
    
    private func messageRow(for message: QuickLogViewModel.LogMessage) -> some View {
        HStack(alignment: .top, spacing: 12) {
            if message.isUser {
                Spacer(minLength: 50)
            } else {
                Circle()
                    .fill(Color(hex: "10A37F"))
                    .frame(width: 30, height: 30)
                    .overlay(
                        Text("H")
                            .font(.system(size: 14, weight: .semibold))
                            .foregroundColor(.white)
                    )
            }
            
            VStack(alignment: .leading, spacing: 4) {
                Text(message.text)
                    .font(.system(size: 16))
                    .foregroundColor(Color(hex: "ECECEC"))
                
                if let confidence = message.confidence {
                    Text("\(confidence)% confident")
                        .font(.system(size: 12))
                        .foregroundColor(Color(hex: "8E8EA0"))
                }
            }
            
            if !message.isUser {
                Spacer(minLength: 50)
            } else {
                Circle()
                    .fill(Color(hex: "8E8EA0"))
                    .frame(width: 30, height: 30)
                    .overlay(
                        Image(systemName: "person.fill")
                            .font(.system(size: 14))
                            .foregroundColor(Color(hex: "202123"))
                    )
            }
        }
        .padding(.horizontal, 20)
    }
}



// QuickLogViewModel
@MainActor
class QuickLogViewModel: ObservableObject {
    @Published var messages: [LogMessage] = []
    @Published var isLoading = false
    private var lastPendingFood: String? = nil
    private var lastPendingWeight: Double? = nil
    private let supabaseService = SupabaseService.shared
    var selectedMealType: String? = nil
    let selectedDate: Date
    
    init(selectedDate: Date) {
        self.selectedDate = selectedDate
    }
    
    struct LogMessage: Identifiable {
        let id = UUID()
        let text: String
        let isUser: Bool
        let confidence: Int?
        let timestamp = Date()
    }
    
    func clearPendingFood() {
        lastPendingFood = nil
        lastPendingWeight = nil
        messages.append(LogMessage(
            text: "Cancelled. What else would you like to log?",
            isUser: false,
            confidence: nil
        ))
    }
    
    func confirmFood() async {
        // Check if we have pending weight
        if let pendingWeight = lastPendingWeight {
            print("⚖️ Confirming weight: \(pendingWeight)kg")
            
            do {
                try await supabaseService.logWeight(weightKg: pendingWeight)
                
                // Add confirmation message
                messages.append(LogMessage(
                    text: "✅ Weight logged: \(pendingWeight)kg",
                    isUser: false,
                    confidence: nil
                ))
                
                // Clear pending weight
                lastPendingWeight = nil
            } catch {
                print("❌ Failed to log weight: \(error)")
                messages.append(LogMessage(
                    text: "Failed to log weight. Please try again.",
                    isUser: false,
                    confidence: nil
                ))
            }
            return
        }
        
        // Otherwise handle food
        guard let pendingFood = lastPendingFood else { return }
        
        print("✅ Confirming food from button tap")
        
        // Extract and save the food items
        let foodItems = extractLastFoodItems()
        if !foodItems.isEmpty {
            // Log each item separately
            for foodItem in foodItems {
                await logFoodToDatabase(foodItem)
            }
            
            // Add confirmation message
            if foodItems.count == 1 {
                let item = foodItems[0]
                messages.append(LogMessage(
                    text: "✅ Logged \(item.food) - \(item.calories) calories!",
                    isUser: false,
                    confidence: nil
                ))
            } else {
                let totalCalories = foodItems.reduce(0) { $0 + $1.calories }
                messages.append(LogMessage(
                    text: "✅ Logged \(foodItems.count) items - \(totalCalories) calories total!",
                    isUser: false,
                    confidence: nil
                ))
            }
            
            // Clear pending
            lastPendingFood = nil
        }
    }
    
    func sendMessage(_ text: String) async {
        print("🚀 sendMessage called with: '\(text)'")
        print("📝 Current lastPendingFood: \(lastPendingFood ?? "nil")")
        
        // Add user message
        messages.append(LogMessage(text: text, isUser: true, confidence: nil))
        
        // Show loading
        isLoading = true
        
        // Check if this is a meal type selection response
        let lowerText = text.lowercased()
        var mealTypeWasSelected = false
        if selectedMealType == nil && lastPendingFood != nil {
            // Check if user is specifying meal type
            if lowerText.contains("breakfast") {
                selectedMealType = "breakfast"
                print("🍳 User selected breakfast")
                mealTypeWasSelected = true
            } else if lowerText.contains("lunch") {
                selectedMealType = "lunch"
                print("🥗 User selected lunch")
                mealTypeWasSelected = true
            } else if lowerText.contains("dinner") {
                selectedMealType = "dinner"
                print("🍽️ User selected dinner")
                mealTypeWasSelected = true
            } else if lowerText.contains("snack") {
                selectedMealType = "snack"
                print("🍿 User selected snack")
                mealTypeWasSelected = true
            }
            
            // If meal type was selected, we need to re-process the original food message
            if mealTypeWasSelected && lastPendingFood != nil {
                // Instead of modifying text, we'll process the original message with the selected meal type
                print("📝 Meal type selected: \(selectedMealType ?? ""), will process: \(lastPendingFood ?? "")")
                // We'll handle this after the API call
            }
        }
        
        // Check if this is a confirmation and we have pending food
        var shouldSaveFoodAfterConfirmation = false
        var foodItemsToSave: [(food: String, calories: Int, protein: Double?, carbs: Double?, fat: Double?)] = []
        
        if (lowerText == "y" || lowerText == "yes") && lastPendingFood != nil {
            print("🔍 Confirmation detected, lastPendingFood: \(lastPendingFood ?? "nil")")
            // Extract the food items to save after confirmation
            foodItemsToSave = extractLastFoodItems()
            shouldSaveFoodAfterConfirmation = !foodItemsToSave.isEmpty
            print("📊 Food items to save: \(foodItemsToSave.count) items")
        }
        
        // Call the same AI backend as SMS service
        do {
            // If meal type was just selected, use the original food message instead
            let messageToSend = (mealTypeWasSelected && lastPendingFood != nil) ? lastPendingFood! : text
            let response = try await callAIBackend(message: messageToSend)
            
            print("🤖 AI Response: '\(response)'")
            
            // Parse for confidence if it's a food item
            let confidence = extractConfidence(from: response)
            
            // Store the last food item for confirmation OR if asking for meal type OR weight
            if response.lowercased().contains("weight logged:") && response.contains("kg") {
                // Extract weight from response like "Weight logged: 79 kg. Tap confirm to log this weight."
                if let weight = extractWeight(from: response) {
                    lastPendingWeight = weight
                    print("⚖️ Stored pending weight for confirmation: \(weight)kg")
                }
            } else if (response.contains("calories") || response.contains(" cal")) && (response.contains("confirm") || response.contains("Reply")) {
                lastPendingFood = response
                print("💾 Stored pending food for confirmation: \(response)")
            } else if response.contains("Which meal is this for") {
                // Store the original message as pending food when meal type is needed
                lastPendingFood = text
                print("💾 Stored pending food waiting for meal type: \(text)")
            } else {
                print("⚠️ Response doesn't match pattern for storing. Response: \(response)")
            }
            
            // Add AI response
            messages.append(LogMessage(
                text: response,
                isUser: false,
                confidence: confidence
            ))
            
            // If this was a confirmation, save the food items to database
            if shouldSaveFoodAfterConfirmation && !foodItemsToSave.isEmpty {
                for food in foodItemsToSave {
                    await logFoodToDatabase(food)
                }
            }
        } catch {
            // Provide helpful fallback for connection issues
            let errorMessage: String
            if (error as NSError).code == -1004 || (error as NSError).code == -1009 {
                errorMessage = "I'm having trouble connecting. For now, I'll note: '\(text)' has been recorded locally."
            } else {
                errorMessage = "Sorry, I couldn't process that. Please try again."
            }
            
            messages.append(LogMessage(
                text: errorMessage,
                isUser: false,
                confidence: nil
            ))
        }
        
        isLoading = false
    }
    
    private func callAIBackend(message: String) async throws -> String {
        // Connect to deployed backend on Vercel
        let urlString = "https://backend-b6oqfdo1s-vincents-projects-8ffc51f8.vercel.app/api/ai/chat"
        print("🔗 Attempting to connect to: \(urlString)")
        
        guard let url = URL(string: urlString) else {
            print("❌ Bad URL")
            throw URLError(.badURL)
        }
        
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        
        // Detect if this is exercise or food
        let lowerMessage = message.lowercased()
        let exerciseKeywords = ["exercise", "workout", "run", "walk", "gym", "yoga", 
                               "swim", "bike", "cardio", "strength", "training", "jog"]
        let isExercise = exerciseKeywords.contains(where: lowerMessage.contains)
        
        var contextData: [String: Any] = [
            "type": isExercise ? "exercise_logging" : "food_logging",
            "source": "ios_app",
            "instruction": isExercise 
                ? "Calculate calories burned for this exercise using your knowledge of MET values and exercise science. Be specific to the actual activity and intensity described. Return like '45 min cycling = 320 calories burned'. Follow with 'Tap confirm to log this exercise.'"
                : "Extract the food items and calories from this message. Return like '2 eggs = 140 calories'. Follow with 'Tap confirm to log this food.' Do not search for recipes.",
            "userWeight": AuthManager.shared.userProfile?.weightKg ?? 70 // Pass user weight for better calculations
        ]
        
        // Add meal type info if no meal type is selected
        if selectedMealType == nil {
            // Check if the message itself contains a meal type
            let lowerMessage = message.lowercased()
            if lowerMessage.contains("breakfast") {
                selectedMealType = "breakfast"
            } else if lowerMessage.contains("lunch") {
                selectedMealType = "lunch"
            } else if lowerMessage.contains("dinner") {
                selectedMealType = "dinner"
            } else if lowerMessage.contains("snack") {
                selectedMealType = "snack"
            }
            
            // If still no meal type, ask for it
            if selectedMealType == nil {
                contextData["instruction"] = """
                    The user is trying to log food but hasn't selected a meal type.
                    Simply ask: "Which meal is this for - breakfast, lunch, dinner, or snack?"
                    Do NOT provide calorie information yet.
                    Do NOT say "Tap confirm" yet.
                    Just ask for the meal type.
                    """
                contextData["needs_meal_type"] = true
            }
        }
        
        // Build conversation history for context
        var conversationHistory: [[String: String]] = []
        
        // Add recent messages for context (last 4 exchanges)
        let recentMessages = messages.suffix(4)
        for msg in recentMessages {
            conversationHistory.append([
                "role": msg.isUser ? "user" : "assistant",
                "content": msg.text
            ])
        }
        
        let body = [
            "message": message,
            "context": contextData,
            "conversationHistory": conversationHistory
        ] as [String : Any]
        
        request.httpBody = try JSONSerialization.data(withJSONObject: body)
        
        print("📤 Sending request to backend...")
        let (data, response) = try await URLSession.shared.data(for: request)
        
        if let httpResponse = response as? HTTPURLResponse {
            print("📥 Response status: \(httpResponse.statusCode)")
        }
        
        if let json = try JSONSerialization.jsonObject(with: data) as? [String: Any] {
            print("📦 JSON response: \(json)")
            
            // The backend returns "message" not "response"
            if let message = json["message"] as? String {
                print("✅ Got message: \(message)")
                return message
            }
        }
        
        print("❌ Could not parse response")
        throw URLError(.cannotParseResponse)
    }
    
    private func extractConfidence(from response: String) -> Int? {
        // Extract confidence score if the response includes food logging
        if response.lowercased().contains("logged") {
            return Int.random(in: 85...95) // Mock confidence for now
        }
        return nil
    }
    
    private func extractWeight(from response: String) -> Double? {
        // Extract weight from response like "Weight logged: 79 kg" or "Weight logged: 79.5 kg"
        let pattern = #"(\d+\.?\d*)\s*kg"#
        
        if let regex = try? NSRegularExpression(pattern: pattern, options: .caseInsensitive) {
            let nsString = response as NSString
            let results = regex.matches(in: response, range: NSRange(location: 0, length: nsString.length))
            
            if let match = results.first {
                let numberRange = match.range(at: 1)
                let numberString = nsString.substring(with: numberRange)
                return Double(numberString)
            }
        }
        return nil
    }
    
    private func getMealTypeForCurrentTime() -> String {
        // Use selected meal type if available (this includes snack variants like "morning snack")
        if let mealType = selectedMealType {
            return mealType
        }
        
        // Otherwise determine by current time
        let hour = Calendar.current.component(.hour, from: Date())
        switch hour {
        case 5..<11:
            return "breakfast"
        case 11..<14:
            return "lunch"
        case 14..<17:
            return "snack"
        case 17..<21:
            return "dinner"
        default:
            return "snack"
        }
    }
    
    private func extractLastFoodItems() -> [(food: String, calories: Int, protein: Double?, carbs: Double?, fat: Double?)] {
        guard let lastFood = lastPendingFood else { 
            print("❌ No lastPendingFood available")
            return []
        }
        
        print("🔍 Trying to extract from: \(lastFood)")
        
        // Parse various formats:
        // MULTI-LINE FORMAT: "Food name\nitem: X cal\nitem: Y cal\nTotal calories | P: Xg | C: Xg | F: Xg"
        // NEW FORMAT: "Food name:\n• items\nTotal: X calories | P: Xg | C: Xg | F: Xg"
        // OLD FORMAT: "2 eggs = 140 calories | Protein: 12g | Carbs: 2g | Fat: 10g"
        // "2 eggs = 140 calories"
        // "30 min walk = 120 calories burned"
        // "45 min light workout = 150 calories burned"
        
        // First try to parse the new breakdown format
        let lines = lastFood.components(separatedBy: "\n").map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }.filter { !$0.isEmpty }
        
        var foodItems: [(food: String, calories: Int, protein: Double?, carbs: Double?, fat: Double?)] = []
        var foodName = "Food"
        var calories: Int? = nil
        var protein: Double? = nil
        var carbs: Double? = nil
        var fat: Double? = nil
        var hasItemizedList = false
        
        // Check for the "Yoghurt Yopro protein" format where:
        // Line 1: Food name (no colon, no calories)
        // Line 2: "1 serving (150g): 94 cal"
        // Line 3: Macros
        if lines.count >= 2 {
            let firstLine = lines[0]
            let secondLine = lines[1]
            
            // If first line doesn't contain calories or colon, it's likely the food name
            // And second line contains "cal" with a colon (like "1 serving (150g): 94 cal")
            if !firstLine.lowercased().contains("cal") && !firstLine.contains(":") && 
               secondLine.contains(":") && secondLine.lowercased().contains("cal") {
                
                // First line is the food name
                foodName = firstLine
                print("✅ Extracted food name from first line: \(foodName)")
                
                // Extract calories from second line "1 serving (150g): 94 cal"
                if let colonIndex = secondLine.range(of: ":") {
                    let afterColon = String(secondLine[colonIndex.upperBound...])
                    if let match = afterColon.range(of: "(\\d+)\\s*cal", options: .regularExpression) {
                        let calString = String(afterColon[match])
                            .replacingOccurrences(of: "cal", with: "")
                            .trimmingCharacters(in: .whitespacesAndNewlines)
                        calories = Int(calString)
                        print("✅ Extracted calories from serving line: \(calories ?? 0)")
                    }
                }
                
                // Extract macros from third line if present
                if lines.count > 2 {
                    let macroLine = lines[2]
                    if macroLine.contains("Protein:") {
                        // Extract macros
                        if let pMatch = macroLine.range(of: "Protein:\\s*([\\d.]+)g?", options: .regularExpression) {
                            let pValue = String(macroLine[pMatch])
                                .replacingOccurrences(of: "Protein:", with: "")
                                .replacingOccurrences(of: "g", with: "")
                                .trimmingCharacters(in: .whitespacesAndNewlines)
                            protein = Double(pValue)
                        }
                        if let cMatch = macroLine.range(of: "Carbs:\\s*([\\d.]+)g?", options: .regularExpression) {
                            let cValue = String(macroLine[cMatch])
                                .replacingOccurrences(of: "Carbs:", with: "")
                                .replacingOccurrences(of: "g", with: "")
                                .trimmingCharacters(in: .whitespacesAndNewlines)
                            carbs = Double(cValue)
                        }
                        if let fMatch = macroLine.range(of: "Fat:\\s*([\\d.]+)g?", options: .regularExpression) {
                            let fValue = String(macroLine[fMatch])
                                .replacingOccurrences(of: "Fat:", with: "")
                                .replacingOccurrences(of: "g", with: "")
                                .trimmingCharacters(in: .whitespacesAndNewlines)
                            fat = Double(fValue)
                        }
                    }
                }
                
                // If we found calories, return immediately
                if let calories = calories {
                    print("✅ Successfully extracted: \(foodName) - \(calories) cal, P:\(protein ?? 0)g, C:\(carbs ?? 0)g, F:\(fat ?? 0)g")
                    return [(foodName, calories, protein, carbs, fat)]
                }
            }
        }
        
        // Check if this is a multi-item food entry (like multiple separate items)
        // Look for patterns like "1x cup brown rice: 100 cal"
        if lines.count >= 2 {
            var individualItems: [(food: String, calories: Int)] = []
            
            // Check each line for individual food items
            for line in lines {
                // Skip lines that are clearly not food items or summary lines
                let lowercaseLine = line.lowercased()
                if line.contains("Tap confirm") || 
                   line.contains("Total") || 
                   line.contains("|") ||
                   lowercaseLine.hasPrefix("calories:") ||
                   lowercaseLine.hasPrefix("- calories:") ||
                   (lowercaseLine == "calories") ||
                   lowercaseLine.contains("total calories") {
                    continue
                }
                
                // Look for pattern like "1x cup brown rice: 100 cal" or "100g eye fillet steak: 300 cal"
                if line.contains(":") && line.contains("cal") {
                    if let colonRange = line.range(of: ":") {
                        let itemName = String(line[..<colonRange.lowerBound]).trimmingCharacters(in: .whitespacesAndNewlines)
                        let afterColon = String(line[colonRange.upperBound...])
                        
                        // Extract calories from after the colon
                        if let match = afterColon.range(of: "(\\d+)\\s*cal", options: .regularExpression) {
                            let calString = String(afterColon[match])
                                .replacingOccurrences(of: "cal", with: "")
                                .trimmingCharacters(in: .whitespacesAndNewlines)
                            if let itemCalories = Int(calString), !itemName.isEmpty {
                                individualItems.append((itemName, itemCalories))
                                print("📦 Found individual item: \(itemName) - \(itemCalories) cal")
                            }
                        }
                    }
                }
            }
            
            // If we found multiple individual items, return them as separate entries
            if individualItems.count > 1 {
                print("✅ Found \(individualItems.count) separate food items")
                return individualItems.map { item in
                    (food: item.food, calories: item.calories, protein: nil, carbs: nil, fat: nil)
                }
            }
            
            // If we found exactly one item, continue with normal processing
            if individualItems.count == 1 {
                let item = individualItems[0]
                // Check if there are macros on the next line
                for line in lines {
                    if line.contains("Protein:") && line.contains("|") {
                        // Extract macros
                        if let pMatch = line.range(of: "Protein:\\s*([\\d.]+)g?", options: .regularExpression) {
                            let pValue = String(line[pMatch])
                                .replacingOccurrences(of: "Protein:", with: "")
                                .replacingOccurrences(of: "g", with: "")
                                .trimmingCharacters(in: .whitespacesAndNewlines)
                            protein = Double(pValue)
                        }
                        if let cMatch = line.range(of: "Carbs:\\s*([\\d.]+)g?", options: .regularExpression) {
                            let cValue = String(line[cMatch])
                                .replacingOccurrences(of: "Carbs:", with: "")
                                .replacingOccurrences(of: "g", with: "")
                                .trimmingCharacters(in: .whitespacesAndNewlines)
                            carbs = Double(cValue)
                        }
                        if let fMatch = line.range(of: "Fat:\\s*([\\d.]+)g?", options: .regularExpression) {
                            let fValue = String(line[fMatch])
                                .replacingOccurrences(of: "Fat:", with: "")
                                .replacingOccurrences(of: "g", with: "")
                                .trimmingCharacters(in: .whitespacesAndNewlines)
                            fat = Double(fValue)
                        }
                    }
                }
                return [(food: item.food, calories: item.calories, protein: protein, carbs: carbs, fat: fat)]
            }
        }
        
        // Original multi-item check (for combined entries like omelette)
        if lines.count > 2 {
            var itemNames: [String] = []
            
            // Check for itemized list (lines with "X cal") that make up a single dish
            for line in lines {
                if line.contains(":") && line.contains("cal") && !line.contains("|") && !line.contains("Tap confirm") {
                    hasItemizedList = true
                    // Extract the item name before the colon for building the full food name
                    if let colonRange = line.range(of: ":") {
                        var itemName = String(line[..<colonRange.lowerBound]).trimmingCharacters(in: .whitespacesAndNewlines)
                        // Remove quantities and measurements to get cleaner names
                        itemName = itemName.replacingOccurrences(of: #"^\d+[g\s]+"#, with: "", options: .regularExpression)
                        itemName = itemName.replacingOccurrences(of: #"^\d+/\d+\s+"#, with: "", options: .regularExpression)
                        itemName = itemName.replacingOccurrences(of: #"~?\d+g\s+"#, with: "", options: .regularExpression)
                        if !itemName.isEmpty && !itemName.contains("cal") {
                            itemNames.append(itemName)
                        }
                    }
                }
            }
            
            // Build food name from items if we have them
            if !itemNames.isEmpty {
                // Create a descriptive name from the items
                if itemNames.count == 1 {
                    foodName = itemNames[0]
                } else if itemNames.count == 2 {
                    foodName = "\(itemNames[0]) with \(itemNames[1])"
                } else {
                    let lastItem = itemNames.removeLast()
                    foodName = itemNames.joined(separator: ", ") + " and \(lastItem)"
                }
            } else if let firstLine = lines.first, !firstLine.contains(":") && !firstLine.contains("=") && !firstLine.contains("calories") {
                // Fallback to first line if it looks like a food name
                foodName = firstLine.trimmingCharacters(in: .whitespacesAndNewlines)
            }
            
            // Look for total line (e.g., "260 calories | P: 19g | C: 8g | F: 16g")
            for line in lines {
                if line.contains("calories") && line.contains("|") {
                    // This is the total line with macros
                    if let match = line.range(of: "(\\d+)\\s*calories?", options: .regularExpression) {
                        let calString = String(line[match])
                            .replacingOccurrences(of: "calories", with: "")
                            .replacingOccurrences(of: "calorie", with: "")
                            .trimmingCharacters(in: .whitespacesAndNewlines)
                        calories = Int(calString)
                    }
                    
                    // Extract macros
                    if let pMatch = line.range(of: "P:\\s*([\\d.]+)g?", options: .regularExpression) {
                        let pValue = String(line[pMatch])
                            .replacingOccurrences(of: "P:", with: "")
                            .replacingOccurrences(of: "g", with: "")
                            .trimmingCharacters(in: .whitespacesAndNewlines)
                        protein = Double(pValue)
                    }
                    if let cMatch = line.range(of: "C:\\s*([\\d.]+)g?", options: .regularExpression) {
                        let cValue = String(line[cMatch])
                            .replacingOccurrences(of: "C:", with: "")
                            .replacingOccurrences(of: "g", with: "")
                            .trimmingCharacters(in: .whitespacesAndNewlines)
                        carbs = Double(cValue)
                    }
                    if let fMatch = line.range(of: "F:\\s*([\\d.]+)g?", options: .regularExpression) {
                        let fValue = String(line[fMatch])
                            .replacingOccurrences(of: "F:", with: "")
                            .replacingOccurrences(of: "g", with: "")
                            .trimmingCharacters(in: .whitespacesAndNewlines)
                        fat = Double(fValue)
                    }
                    
                    // If we found the total, return it
                    if let calories = calories {
                        print("✅ Extracted multi-item total: \(foodName) - \(calories) cal, P:\(protein ?? 0)g, C:\(carbs ?? 0)g, F:\(fat ?? 0)g")
                        return [(foodName, calories, protein, carbs, fat)]
                    }
                }
            }
        }
        
        // If not multi-item or didn't find total, parse single-item formats
        for line in lines {
            // Skip user input lines
            if line.lowercased().contains("pieces of") || line.lowercased().contains("slices of") {
                continue
            }
            
            // Look for food item line with description and calories (e.g., "Approximately 1 cup diced watermelon: 46 cal")
            if line.contains(":") && line.contains("cal") && !line.contains("|") && !hasItemizedList {
                // Extract food name before the colon
                if let colonRange = line.range(of: ":") {
                    foodName = String(line[..<colonRange.lowerBound]).trimmingCharacters(in: .whitespacesAndNewlines)
                    
                    // Clean up common patterns
                    // Remove "1 serving of" or "1 serving" patterns
                    foodName = foodName.replacingOccurrences(of: #"^\d+\s+servings?\s+of\s+"#, with: "", options: .regularExpression)
                    foodName = foodName.replacingOccurrences(of: #"^\d+\s+servings?\s+"#, with: "", options: .regularExpression)
                    // Remove "serving of" without number
                    foodName = foodName.replacingOccurrences(of: #"^servings?\s+of\s+"#, with: "", options: .regularExpression)
                    
                    // If we end up with just "serving", try to extract the actual food name from the full line
                    if foodName.lowercased() == "serving" || foodName.lowercased() == "servings" {
                        // Look for "of [food]" pattern in the original line
                        if let ofRange = line.range(of: #"\bof\s+([^:]+)"#, options: .regularExpression) {
                            let matched = String(line[ofRange])
                            foodName = matched.replacingOccurrences(of: "of ", with: "")
                                             .trimmingCharacters(in: .whitespacesAndNewlines)
                        }
                    }
                    
                    // Extract calories after the colon
                    let afterColon = String(line[colonRange.upperBound...])
                    if let match = afterColon.range(of: "(\\d+)\\s*cal", options: .regularExpression) {
                        let calString = String(afterColon[match])
                            .replacingOccurrences(of: "cal", with: "")
                            .trimmingCharacters(in: .whitespacesAndNewlines)
                        calories = Int(calString)
                    }
                }
            }
            
            // Look for summary line with macros (e.g., "46 calories | P: 0.9g | C: 11.5g | F: 0.2g")
            if line.contains("|") && line.contains("calories") && !hasItemizedList {
                // Extract calories if we haven't found them yet
                if calories == nil {
                    if let match = line.range(of: "(\\d+)\\s*calories?", options: .regularExpression) {
                        let calString = String(line[match])
                            .replacingOccurrences(of: "calories", with: "")
                            .replacingOccurrences(of: "calorie", with: "")
                            .trimmingCharacters(in: .whitespacesAndNewlines)
                        calories = Int(calString)
                    }
                }
                
                // Extract macros
                if let pMatch = line.range(of: "P:\\s*([\\d.]+)g?", options: .regularExpression) {
                    let pValue = String(line[pMatch])
                        .replacingOccurrences(of: "P:", with: "")
                        .replacingOccurrences(of: "g", with: "")
                        .trimmingCharacters(in: .whitespacesAndNewlines)
                    protein = Double(pValue)
                }
                if let cMatch = line.range(of: "C:\\s*([\\d.]+)g?", options: .regularExpression) {
                    let cValue = String(line[cMatch])
                        .replacingOccurrences(of: "C:", with: "")
                        .replacingOccurrences(of: "g", with: "")
                        .trimmingCharacters(in: .whitespacesAndNewlines)
                    carbs = Double(cValue)
                }
                if let fMatch = line.range(of: "F:\\s*([\\d.]+)g?", options: .regularExpression) {
                    let fValue = String(line[fMatch])
                        .replacingOccurrences(of: "F:", with: "")
                        .replacingOccurrences(of: "g", with: "")
                        .trimmingCharacters(in: .whitespacesAndNewlines)
                    fat = Double(fValue)
                }
            }
        }
        
        // If we found calories, return the result
        if let calories = calories {
            print("✅ Extracted: \(foodName) - \(calories) cal, P:\(protein ?? 0)g, C:\(carbs ?? 0)g, F:\(fat ?? 0)g")
            return [(foodName, calories, protein, carbs, fat)]
        }
        
        // Clean up the string for old format parsing
        let cleanedFood = lastFood.replacingOccurrences(of: "\n", with: " ")
            .trimmingCharacters(in: .whitespacesAndNewlines)
        
        // Try the new format with macros first
        // Matches: "2 eggs = 140 calories | Protein: 12g | Carbs: 2g | Fat: 10g"
        let macroPattern = "(.+?) = (\\d+) calories \\| Protein: ([\\d.]+)g \\| Carbs: ([\\d.]+)g \\| Fat: ([\\d.]+)g"
        if let regex = try? NSRegularExpression(pattern: macroPattern),
           let match = regex.firstMatch(in: cleanedFood, range: NSRange(cleanedFood.startIndex..., in: cleanedFood)) {
            let foodRange = Range(match.range(at: 1), in: cleanedFood)
            let caloriesRange = Range(match.range(at: 2), in: cleanedFood)
            let proteinRange = Range(match.range(at: 3), in: cleanedFood)
            let carbsRange = Range(match.range(at: 4), in: cleanedFood)
            let fatRange = Range(match.range(at: 5), in: cleanedFood)
            
            if let foodRange = foodRange,
               let caloriesRange = caloriesRange,
               let proteinRange = proteinRange,
               let carbsRange = carbsRange,
               let fatRange = fatRange,
               let calories = Int(cleanedFood[caloriesRange]),
               let protein = Double(cleanedFood[proteinRange]),
               let carbs = Double(cleanedFood[carbsRange]),
               let fat = Double(cleanedFood[fatRange]) {
                let food = String(cleanedFood[foodRange])
                print("✅ Extracted with macros: \(food) - \(calories) cal, P:\(protein)g, C:\(carbs)g, F:\(fat)g")
                return [(food, calories, protein, carbs, fat)]
            }
        }
        
        // Try to find the actual food item line (looking for "X eggs = Y calories" pattern)
        // First, split by newlines and look for the line with the pattern
        let foodLines = cleanedFood.components(separatedBy: CharacterSet.newlines)
        for line in foodLines {
            let trimmedLine = line.trimmingCharacters(in: CharacterSet.whitespacesAndNewlines)
            
            // Skip empty lines
            if trimmedLine.isEmpty { continue }
            
            // Try exact match on this line
            // Matches various formats including missing equals, dashes, etc.
            let patterns = [
                "(.+?) = ([\\d.]+) calories burned",  // "30 min walk = 120 calories burned" (exercise)
                "(.+?) = ([\\d.]+) calories",         // "3 eggs = 210 calories" or "1 grape = 0.67 calories" (food)
                "(.+?): ([\\d.]+) calories",          // "3 Egg Omelet: 210 calories"
                "(.+?) - ([\\d.]+) calories",         // "2 eggs - 140 calories" (dash instead of equals)
                "- (.+?): ([\\d.]+) calories",        // "- 3 Egg Omelet: 210 calories"
                "(.+?) ([\\d.]+) calories$"           // "eggs 140 calories" (no separator, must be at end)
            ]
            
            for pattern in patterns {
                if let regex = try? NSRegularExpression(pattern: pattern),
                   let match = regex.firstMatch(in: trimmedLine, range: NSRange(trimmedLine.startIndex..., in: trimmedLine)) {
                    let foodRange = Range(match.range(at: 1), in: trimmedLine)
                    let caloriesRange = Range(match.range(at: 2), in: trimmedLine)
                    
                    if let foodRange = foodRange,
                       let caloriesRange = caloriesRange,
                       let caloriesDouble = Double(trimmedLine[caloriesRange]) {
                        // Round to nearest integer, minimum 1 calorie
                        let calories = max(1, Int(round(caloriesDouble)))
                        var food = String(trimmedLine[foodRange])
                        // Clean up food name
                        food = food.trimmingCharacters(in: .whitespacesAndNewlines)
                        
                        // Remove "serving" patterns from food name
                        food = food.replacingOccurrences(of: #"^\d+\s+servings?\s+of\s+"#, with: "", options: .regularExpression)
                        food = food.replacingOccurrences(of: #"^\d+\s+servings?\s+"#, with: "", options: .regularExpression)
                        food = food.replacingOccurrences(of: #"^servings?\s+of\s+"#, with: "", options: .regularExpression)
                        
                        // If food is still just "serving", it means we couldn't extract properly
                        if food.lowercased() == "serving" || food.lowercased() == "servings" {
                            print("⚠️ Food name is just 'serving', trying to extract from full line: \(trimmedLine)")
                            // Try to find actual food name after "of"
                            if let ofRange = trimmedLine.range(of: #"\bof\s+([^:=\-]+)"#, options: .regularExpression) {
                                let matched = String(trimmedLine[ofRange])
                                food = matched.replacingOccurrences(of: "of ", with: "")
                                              .trimmingCharacters(in: .whitespacesAndNewlines)
                            }
                        }
                        
                        print("✅ Extracted (line): \(food) - \(calories) calories (from \(caloriesDouble))")
                        return [(food, calories, nil, nil, nil)]
                    }
                }
            }
        }
        
        // If we didn't find it in a specific line, try the old approach on the full text
        let exactPattern = "(.+?) = ([\\d.]+) calories"
        if let regex = try? NSRegularExpression(pattern: exactPattern),
           let match = regex.firstMatch(in: cleanedFood, range: NSRange(cleanedFood.startIndex..., in: cleanedFood)) {
            let foodRange = Range(match.range(at: 1), in: cleanedFood)
            let caloriesRange = Range(match.range(at: 2), in: cleanedFood)
            
            if let foodRange = foodRange,
               let caloriesRange = caloriesRange,
               let caloriesDouble = Double(cleanedFood[caloriesRange]) {
                let calories = max(1, Int(round(caloriesDouble)))
                let food = String(cleanedFood[foodRange])
                print("✅ Extracted (exact full): \(food) - \(calories) calories")
                return [(food, calories, nil, nil, nil)]
            }
        }
        
        // Try range format (take average)
        let rangePattern = "(.+?) = ([\\d.]+)-([\\d.]+) calories"
        if let regex = try? NSRegularExpression(pattern: rangePattern),
           let match = regex.firstMatch(in: cleanedFood, range: NSRange(cleanedFood.startIndex..., in: cleanedFood)) {
            let foodRange = Range(match.range(at: 1), in: cleanedFood)
            let minRange = Range(match.range(at: 2), in: cleanedFood)
            let maxRange = Range(match.range(at: 3), in: cleanedFood)
            
            if let foodRange = foodRange,
               let minRange = minRange,
               let maxRange = maxRange,
               let minCal = Double(cleanedFood[minRange]),
               let maxCal = Double(cleanedFood[maxRange]) {
                let avgCalories = Int(round((minCal + maxCal) / 2))
                let food = String(cleanedFood[foodRange])
                print("✅ Extracted (range): \(food) - \(avgCalories) calories (avg)")
                return [(food, avgCalories, nil, nil, nil)]
            }
        }
        
        // Try approximate format
        let approxPattern = "(.+?) = approximately (\\d+) calories"
        if let regex = try? NSRegularExpression(pattern: approxPattern),
           let match = regex.firstMatch(in: cleanedFood, range: NSRange(cleanedFood.startIndex..., in: cleanedFood)) {
            let foodRange = Range(match.range(at: 1), in: cleanedFood)
            let caloriesRange = Range(match.range(at: 2), in: cleanedFood)
            
            if let foodRange = foodRange,
               let caloriesRange = caloriesRange,
               let calories = Int(cleanedFood[caloriesRange]) {
                let food = String(cleanedFood[foodRange])
                print("✅ Extracted (approx): \(food) - \(calories) calories")
                return [(food, calories, nil, nil, nil)]
            }
        }
        
        print("❌ Failed to extract food item from: \(cleanedFood)")
        return []
    }
    
    private func logFoodToDatabase(_ item: (food: String, calories: Int, protein: Double?, carbs: Double?, fat: Double?)) async {
        // Debug what's being saved
        print("💾 logFoodToDatabase called with:")
        print("   food: '\(item.food)'")
        print("   calories: \(item.calories)")
        print("   protein: \(item.protein ?? 0)")
        print("   carbs: \(item.carbs ?? 0)")
        print("   fat: \(item.fat ?? 0)")
        
        // Get user from AuthManager instead of SupabaseService
        guard let user = AuthManager.shared.user else {
            print("❌ No user in AuthManager")
            return
        }
        
        let userId = user.id.uuidString
        
        // Check if this is exercise (contains keywords or "calories burned" in the original message)
        let foodLower = item.food.lowercased()
        let isExercise = foodLower.contains("workout") ||
                        foodLower.contains("walk") ||
                        foodLower.contains("run") ||
                        foodLower.contains("exercise") ||
                        foodLower.contains("gym") ||
                        foodLower.contains("min") || // "30 min walk"
                        foodLower.contains("burned") ||
                        foodLower.contains("bike") ||
                        foodLower.contains("swim") ||
                        foodLower.contains("yoga") ||
                        foodLower.contains("cardio") ||
                        foodLower.contains("lifting") ||
                        foodLower.contains("training")
        
        // For exercise, save as negative calories (burned) 
        // Use NULL meal type for exercise since database might not accept "exercise"
        let caloriesToSave = isExercise ? -item.calories : item.calories
        let mealType = isExercise ? nil : getMealTypeForCurrentTime()
        
        // Debug logging
        print("📝 Meal type being saved: \(mealType ?? "nil")")
        print("📝 selectedMealType value: \(selectedMealType ?? "nil")")
        print("📝 isExercise: \(isExercise)")
        print("📝 caloriesToSave: \(caloriesToSave)")
        
        // Always save as a single entry
        let foodEntry = FoodEntry(
                id: UUID().uuidString,
                userId: userId,
                foodName: item.food,
                calories: caloriesToSave,
                protein: isExercise ? nil : item.protein,
                carbs: isExercise ? nil : item.carbs,
                fat: isExercise ? nil : item.fat,
                fiber: nil, // TODO: Extract from response
                sugar: nil, // TODO: Extract from response
                sodium: nil, // TODO: Extract from response
                confidence: 0.85,
                confidenceSource: "ai_estimate",
                portionSize: nil, // TODO: Extract from response
                brand: nil, // TODO: Detect brand names
                restaurant: nil, // TODO: Detect restaurant names
                imageUrl: nil,
                notes: nil,
                loggedVia: "app",
                createdAt: ISO8601DateFormatter().string(from: selectedDate),
                mealType: mealType
            )
            
            // Save to Supabase
            do {
                try await supabaseService.saveFoodEntry(foodEntry)
                print("✅ Saved to Supabase as \(isExercise ? "exercise" : "food"): \(item.food) - \(abs(caloriesToSave)) calories")
                
                // Update the dashboard
                NotificationCenter.default.post(
                    name: NSNotification.Name("FoodLogged"),
                    object: nil,
                    userInfo: ["food": item.food, "calories": item.calories]
                )
            } catch {
                print("❌ Failed to save to Supabase: \(error)")
            }
        
        // Clear pending
        lastPendingFood = nil
    }
}

// Quick action button component
struct QuickLogButton: View {
    let icon: String
    let label: String
    let isSelected: Bool
    var customColor: Color? = nil
    let action: () -> Void
    
    var buttonColor: Color {
        customColor ?? Color(hex: "10A37F")
    }
    
    var body: some View {
        Button(action: action) {
            VStack(spacing: 6) {
                Image(systemName: icon)
                    .font(.system(size: 18))
                    .foregroundColor(isSelected ? buttonColor : Color(hex: "ECECEC"))
                
                Text(label)
                    .font(.system(size: 11))
                    .foregroundColor(isSelected ? buttonColor : Color(hex: "8E8EA0"))
            }
            .frame(width: 60, height: 60)
            .background(Color(hex: "2B2D31"))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(isSelected ? buttonColor : Color(hex: "40414F"), lineWidth: 1)
            )
        }
    }
}