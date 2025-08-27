//
//  ShoppingListView.swift
//  HannahHealth
//
//  Created on 26/8/2025.
//

import SwiftUI

struct ShoppingListView: View {
    @StateObject private var viewModel = ShoppingListViewModel()
    @State private var showingAddItem = false
    @State private var newItemName = ""
    @State private var selectedCategory = ShoppingItem.ItemCategory.produce
    
    var body: some View {
        NavigationStack {
            ZStack {
                // Dynamic time-based background like the rest of the app
                DynamicTimeBackground()
                    .ignoresSafeArea()
                
                ScrollView {
                    VStack(spacing: 20) {
                        // Header with progress
                        headerCard
                            .padding(.horizontal)
                            .padding(.top)
                        
                        // Category filter pills
                        categoryFilter
                            .padding(.horizontal)
                        
                        // Shopping items by category
                        ForEach(viewModel.itemsByCategory, id: \.category) { category, items in
                            categorySection(category: category, items: items)
                                .padding(.horizontal)
                        }
                        
                        // Add custom item button
                        addItemButton
                            .padding(.horizontal)
                        
                        // Bottom padding
                        Color.clear.frame(height: 100)
                    }
                }
            }
            .navigationTitle("Shopping List")
            .navigationBarTitleDisplayMode(.large)
            .toolbarColorScheme(.dark, for: .navigationBar)
            .toolbar {
                ToolbarItem(placement: .navigationBarTrailing) {
                    if viewModel.checkedItemsCount > 0 {
                        Button(action: {
                            withAnimation {
                                viewModel.clearCheckedItems()
                            }
                        }) {
                            Text("Clear Done")
                                .foregroundColor(Theme.emerald)
                        }
                    }
                }
            }
        }
        .sheet(isPresented: $showingAddItem) {
            addItemSheet
        }
    }
    
    private var headerCard: some View {
        HStack {
            VStack(alignment: .leading, spacing: 8) {
                Text("Week's Groceries")
                    .font(.system(size: 24, weight: .bold))
                    .foregroundColor(.white)
                
                HStack(spacing: 16) {
                    Label("\(viewModel.totalItemsCount) items", systemImage: "cart.fill")
                        .font(.system(size: 14))
                        .foregroundColor(.white.opacity(0.7))
                    
                    if viewModel.checkedItemsCount > 0 {
                        Label("\(viewModel.checkedItemsCount) done", systemImage: "checkmark.circle.fill")
                            .font(.system(size: 14))
                            .foregroundColor(Theme.emerald)
                    }
                }
            }
            
            Spacer()
            
            // Progress ring
            ZStack {
                Circle()
                    .stroke(Theme.cardBorder, lineWidth: 4)
                    .frame(width: 60, height: 60)
                
                Circle()
                    .trim(from: 0, to: viewModel.totalItemsCount > 0 
                          ? CGFloat(viewModel.checkedItemsCount) / CGFloat(viewModel.totalItemsCount) 
                          : 0)
                    .stroke(Theme.emerald, lineWidth: 4)
                    .frame(width: 60, height: 60)
                    .rotationEffect(.degrees(-90))
                    .animation(.spring(), value: viewModel.checkedItemsCount)
                
                Text("\(Int((Double(viewModel.checkedItemsCount) / Double(max(viewModel.totalItemsCount, 1))) * 100))%")
                    .font(.system(size: 16, weight: .bold))
                    .foregroundColor(.white)
            }
        }
        .padding(20)
        .background(Theme.glassMorphism)
        .cornerRadius(16)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Theme.cardBorder)
        )
    }
    
    private var categoryFilter: some View {
        ScrollView(.horizontal, showsIndicators: false) {
            HStack(spacing: 12) {
                // All categories pill
                Button(action: {
                    withAnimation {
                        viewModel.selectedCategory = nil
                    }
                }) {
                    HStack {
                        Image(systemName: "square.grid.2x2")
                            .font(.system(size: 14))
                        Text("All")
                            .font(.system(size: 14, weight: .medium))
                    }
                    .padding(.horizontal, 16)
                    .padding(.vertical, 8)
                    .background(viewModel.selectedCategory == nil ? Theme.emerald : Theme.glassMorphism)
                    .foregroundColor(.white)
                    .cornerRadius(20)
                    .overlay(
                        RoundedRectangle(cornerRadius: 20)
                            .stroke(viewModel.selectedCategory == nil ? Theme.emerald.opacity(0.5) : Theme.cardBorder)
                    )
                }
                
                ForEach(ShoppingItem.ItemCategory.allCases, id: \.self) { category in
                    Button(action: {
                        withAnimation {
                            viewModel.selectedCategory = category
                        }
                    }) {
                        HStack {
                            Image(systemName: category.icon)
                                .font(.system(size: 14))
                            Text(category.rawValue)
                                .font(.system(size: 14, weight: .medium))
                        }
                        .padding(.horizontal, 16)
                        .padding(.vertical, 8)
                        .background(viewModel.selectedCategory == category ? Theme.emerald : Theme.glassMorphism)
                        .foregroundColor(.white)
                        .cornerRadius(20)
                        .overlay(
                            RoundedRectangle(cornerRadius: 20)
                                .stroke(viewModel.selectedCategory == category ? Theme.emerald.opacity(0.5) : Theme.cardBorder)
                        )
                    }
                }
            }
        }
    }
    
    private func categorySection(category: ShoppingItem.ItemCategory, items: [ShoppingItem]) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            // Category header
            HStack {
                Image(systemName: category.icon)
                    .font(.system(size: 16))
                    .foregroundColor(categoryColor(for: category))
                
                Text(category.rawValue)
                    .font(.system(size: 18, weight: .semibold))
                    .foregroundColor(.white)
                
                Spacer()
                
                Text("\(items.count)")
                    .font(.system(size: 14))
                    .foregroundColor(.white.opacity(0.7))
                    .padding(.horizontal, 8)
                    .padding(.vertical, 2)
                    .background(Theme.glassMorphism)
                    .cornerRadius(8)
            }
            .padding(.horizontal, 16)
            .padding(.vertical, 8)
            
            // Items in category
            VStack(spacing: 1) {
                ForEach(items) { item in
                    itemRow(item: item)
                }
            }
            .background(Theme.glassMorphism)
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Theme.cardBorder)
            )
        }
    }
    
    private func itemRow(item: ShoppingItem) -> some View {
        HStack(spacing: 12) {
            Button(action: {
                withAnimation(.spring(duration: 0.3)) {
                    viewModel.toggleItem(item)
                }
            }) {
                Image(systemName: item.isChecked ? "checkmark.circle.fill" : "circle")
                    .font(.system(size: 22))
                    .foregroundColor(item.isChecked ? Theme.emerald : Theme.cardBorder)
            }
            
            VStack(alignment: .leading, spacing: 2) {
                Text(item.name)
                    .font(.system(size: 16, weight: .medium))
                    .foregroundColor(item.isChecked ? .white.opacity(0.5) : .white)
                    .strikethrough(item.isChecked, color: .white.opacity(0.5))
                
                if let quantity = item.quantity {
                    Text(quantity)
                        .font(.system(size: 12))
                        .foregroundColor(.white.opacity(0.6))
                }
            }
            
            Spacer()
            
            // Delete button on swipe
            if item.isChecked {
                Image(systemName: "xmark.circle.fill")
                    .font(.system(size: 20))
                    .foregroundColor(Theme.coral.opacity(0.7))
                    .onTapGesture {
                        withAnimation {
                            viewModel.deleteItem(item)
                        }
                    }
            }
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .contentShape(Rectangle())
    }
    
    private var addItemButton: some View {
        Button(action: {
            showingAddItem = true
        }) {
            HStack {
                Image(systemName: "plus.circle.fill")
                    .font(.system(size: 20))
                
                Text("Add Custom Item")
                    .font(.system(size: 16, weight: .medium))
            }
            .foregroundColor(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 14)
            .background(Theme.emerald.opacity(0.3))
            .cornerRadius(12)
            .overlay(
                RoundedRectangle(cornerRadius: 12)
                    .stroke(Theme.emerald)
            )
        }
    }
    
    private var addItemSheet: some View {
        NavigationView {
            ZStack {
                Theme.backgroundGradient
                    .ignoresSafeArea()
                
                VStack(spacing: 20) {
                    TextField("Item name", text: $newItemName)
                        .textFieldStyle(RoundedBorderTextFieldStyle())
                        .font(.system(size: 18))
                    
                    Picker("Category", selection: $selectedCategory) {
                        ForEach(ShoppingItem.ItemCategory.allCases, id: \.self) { category in
                            Label(category.rawValue, systemImage: category.icon)
                                .tag(category)
                        }
                    }
                    .pickerStyle(MenuPickerStyle())
                    .padding()
                    .background(Theme.glassMorphism)
                    .cornerRadius(12)
                    
                    Spacer()
                }
                .padding()
            }
            .navigationTitle("Add Item")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Cancel") {
                        showingAddItem = false
                        newItemName = ""
                    }
                    .foregroundColor(Theme.coral)
                }
                
                ToolbarItem(placement: .navigationBarTrailing) {
                    Button("Add") {
                        if !newItemName.isEmpty {
                            viewModel.addCustomItem(name: newItemName, category: selectedCategory)
                            showingAddItem = false
                            newItemName = ""
                        }
                    }
                    .foregroundColor(Theme.emerald)
                    .disabled(newItemName.isEmpty)
                }
            }
        }
        .presentationDetents([.medium])
    }
    
    // Helper function for category colors
    private func categoryColor(for category: ShoppingItem.ItemCategory) -> Color {
        switch category {
        case .produce: return Theme.mint
        case .proteins: return Theme.coral
        case .dairy: return Theme.sky
        case .grains: return Color(hex: "F59E0B")  // Amber
        case .pantry: return Theme.lavender
        case .frozen: return Color(hex: "38BDF8")  // Sky blue
        case .beverages: return Theme.ocean
        case .snacks: return Theme.emerald
        case .other: return Theme.cardBorder
        }
    }
}