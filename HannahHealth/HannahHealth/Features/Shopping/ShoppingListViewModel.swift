//
//  ShoppingListViewModel.swift
//  HannahHealth
//
//  Created on 27/8/2025.
//

import Foundation
import SwiftUI

@MainActor
class ShoppingListViewModel: ObservableObject {
    @Published var shoppingItems: [ShoppingItem] = []
    @Published var customItems: [ShoppingItem] = []
    @Published var isLoading = false
    @Published var selectedCategory: ShoppingItem.ItemCategory?
    
    private let mealPlanViewModel = MealPlanViewModel()
    
    init() {
        generateShoppingList()
    }
    
    func generateShoppingList() {
        guard let mealPlan = mealPlanViewModel.currentMealPlan else {
            // Load sample items if no meal plan
            loadSampleItems()
            return
        }
        
        var allItems: [ShoppingItem] = []
        
        // Extract ingredients from all meals in the week
        for day in mealPlan.planData.days {
            for meal in day.meals {
                let ingredients = IngredientExtractor.extractIngredients(from: meal)
                allItems.append(contentsOf: ingredients)
            }
        }
        
        // Consolidate duplicate items
        shoppingItems = IngredientExtractor.consolidateItems(allItems)
            .sorted { $0.category.rawValue < $1.category.rawValue }
    }
    
    func loadSampleItems() {
        // Default items when no meal plan exists
        shoppingItems = [
            ShoppingItem(name: "Greek Yogurt", quantity: "2 containers", category: .dairy, mealSource: nil),
            ShoppingItem(name: "Eggs", quantity: "1 dozen", category: .dairy, mealSource: nil),
            ShoppingItem(name: "Chicken Breast", quantity: "2 lbs", category: .proteins, mealSource: nil),
            ShoppingItem(name: "Salmon", quantity: "1 lb", category: .proteins, mealSource: nil),
            ShoppingItem(name: "Spinach", quantity: "1 bag", category: .produce, mealSource: nil),
            ShoppingItem(name: "Blueberries", quantity: "1 pint", category: .produce, mealSource: nil),
            ShoppingItem(name: "Apples", quantity: "6", category: .produce, mealSource: nil),
            ShoppingItem(name: "Brown Rice", quantity: "1 bag", category: .grains, mealSource: nil),
            ShoppingItem(name: "Quinoa", quantity: "1 box", category: .grains, mealSource: nil),
            ShoppingItem(name: "Almond Milk", quantity: "1 carton", category: .beverages, mealSource: nil),
            ShoppingItem(name: "Olive Oil", quantity: "1 bottle", category: .pantry, mealSource: nil),
            ShoppingItem(name: "Almond Butter", quantity: "1 jar", category: .pantry, mealSource: nil)
        ]
    }
    
    func toggleItem(_ item: ShoppingItem) {
        if let index = shoppingItems.firstIndex(where: { $0.id == item.id }) {
            shoppingItems[index].isChecked.toggle()
        } else if let index = customItems.firstIndex(where: { $0.id == item.id }) {
            customItems[index].isChecked.toggle()
        }
    }
    
    func addCustomItem(name: String, category: ShoppingItem.ItemCategory) {
        let newItem = ShoppingItem(
            name: name,
            quantity: nil,
            category: category,
            mealSource: nil,
            isChecked: false
        )
        customItems.append(newItem)
    }
    
    func deleteItem(_ item: ShoppingItem) {
        shoppingItems.removeAll { $0.id == item.id }
        customItems.removeAll { $0.id == item.id }
    }
    
    func clearCheckedItems() {
        shoppingItems.removeAll { $0.isChecked }
        customItems.removeAll { $0.isChecked }
    }
    
    var itemsByCategory: [(category: ShoppingItem.ItemCategory, items: [ShoppingItem])] {
        let allItems = shoppingItems + customItems
        let grouped = Dictionary(grouping: allItems.filter { selectedCategory == nil || $0.category == selectedCategory }) { $0.category }
        return grouped.map { (category: $0.key, items: $0.value) }
            .sorted { $0.category.rawValue < $1.category.rawValue }
    }
    
    var checkedItemsCount: Int {
        (shoppingItems + customItems).filter { $0.isChecked }.count
    }
    
    var totalItemsCount: Int {
        shoppingItems.count + customItems.count
    }
}