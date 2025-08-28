//
//  ShoppingItem.swift
//  HannahHealth
//
//  Created on 27/8/2025.
//

import Foundation

struct ShoppingItem: Identifiable, Codable {
    let id = UUID()
    let name: String
    let quantity: String?
    let category: ItemCategory
    let mealSource: String? // Which meal this came from
    var isChecked: Bool = false
    
    enum ItemCategory: String, CaseIterable, Codable {
        case produce = "Produce"
        case proteins = "Proteins"
        case dairy = "Dairy & Eggs"
        case grains = "Grains & Bread"
        case pantry = "Pantry"
        case frozen = "Frozen"
        case beverages = "Beverages"
        case snacks = "Snacks"
        case other = "Other"
        
        var icon: String {
            switch self {
            case .produce: return "leaf.fill"
            case .proteins: return "fish.fill"
            case .dairy: return "drop.fill"
            case .grains: return "square.stack.fill"
            case .pantry: return "bag.fill"
            case .frozen: return "snowflake"
            case .beverages: return "cup.and.saucer.fill"
            case .snacks: return "carrot.fill"
            case .other: return "cart.fill"
            }
        }
    }
}

// Sample ingredient mappings from meals
struct IngredientExtractor {
    static func extractIngredients(from meal: PlannedMeal) -> [ShoppingItem] {
        // This would be enhanced with AI or a proper ingredient database
        switch meal.name.lowercased() {
        case let name where name.contains("greek yogurt"):
            return [
                ShoppingItem(name: "Greek Yogurt", quantity: "1 container", category: .dairy, mealSource: meal.name),
                ShoppingItem(name: "Mixed Berries", quantity: "1 cup", category: .produce, mealSource: meal.name)
            ]
        case let name where name.contains("chicken salad"):
            return [
                ShoppingItem(name: "Chicken Breast", quantity: "6 oz", category: .proteins, mealSource: meal.name),
                ShoppingItem(name: "Mixed Greens", quantity: "2 cups", category: .produce, mealSource: meal.name),
                ShoppingItem(name: "Cherry Tomatoes", quantity: "1 cup", category: .produce, mealSource: meal.name),
                ShoppingItem(name: "Salad Dressing", quantity: nil, category: .pantry, mealSource: meal.name)
            ]
        case let name where name.contains("salmon"):
            return [
                ShoppingItem(name: "Salmon Fillet", quantity: "6 oz", category: .proteins, mealSource: meal.name),
                ShoppingItem(name: "Quinoa", quantity: "1 cup", category: .grains, mealSource: meal.name)
            ]
        case let name where name.contains("apple"):
            return [
                ShoppingItem(name: "Apple", quantity: "1 medium", category: .produce, mealSource: meal.name),
                ShoppingItem(name: "Almond Butter", quantity: "2 tbsp", category: .pantry, mealSource: meal.name)
            ]
        default:
            return []
        }
    }
    
    static func consolidateItems(_ items: [ShoppingItem]) -> [ShoppingItem] {
        // Group identical items and combine quantities
        let grouped = Dictionary(grouping: items) { $0.name }
        return grouped.compactMap { (name, items) -> ShoppingItem? in
            guard let first = items.first else { return nil }
            // In a real app, we'd combine quantities intelligently
            return ShoppingItem(
                name: name,
                quantity: items.count > 1 ? "\(items.count) servings" : first.quantity,
                category: first.category,
                mealSource: nil,
                isChecked: false
            )
        }
    }
}