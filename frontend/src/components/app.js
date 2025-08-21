// Meal Planner Application JavaScript

// Food database with base values
const foodDatabase = {
    protein: [
        { name: 'Chicken Breast', baseQuantity: 100, baseUnit: 'g', kcal: 165, protein: 31, carbs: 0, fat: 3.6, cost: 3.50 },
        { name: 'Salmon', baseQuantity: 100, baseUnit: 'g', kcal: 206, protein: 22, carbs: 0, fat: 13, cost: 5.75 },
        { name: 'Tuna', baseQuantity: 100, baseUnit: 'g', kcal: 130, protein: 29, carbs: 0, fat: 1, cost: 3.00 },
        { name: 'Lean Beef', baseQuantity: 100, baseUnit: 'g', kcal: 217, protein: 26, carbs: 0, fat: 12, cost: 4.50 },
        { name: 'Turkey', baseQuantity: 100, baseUnit: 'g', kcal: 135, protein: 30, carbs: 0, fat: 1, cost: 3.25 },
        { name: 'Tofu', baseQuantity: 100, baseUnit: 'g', kcal: 96, protein: 10, carbs: 2.3, fat: 5.8, cost: 1.50 },
        { name: 'Eggs', baseQuantity: 1, baseUnit: 'large', kcal: 78, protein: 6.5, carbs: 0.6, fat: 5.5, cost: 0.60 },
        { name: 'Shrimp', baseQuantity: 100, baseUnit: 'g', kcal: 99, protein: 24, carbs: 0.2, fat: 0.3, cost: 6.00 }
    ],
    dairy: [
        { name: 'Greek Yogurt', baseQuantity: 100, baseUnit: 'g', kcal: 97, protein: 9, carbs: 4, fat: 5, cost: 2.00 },
        { name: 'Milk', baseQuantity: 250, baseUnit: 'ml', kcal: 103, protein: 8, carbs: 12, fat: 2.4, cost: 1.00 },
        { name: 'Cottage Cheese', baseQuantity: 100, baseUnit: 'g', kcal: 98, protein: 11, carbs: 3.4, fat: 4.3, cost: 2.50 },
        { name: 'Cheddar Cheese', baseQuantity: 28, baseUnit: 'g', kcal: 113, protein: 7, carbs: 0.4, fat: 9, cost: 1.00 },
        { name: 'Mozzarella', baseQuantity: 28, baseUnit: 'g', kcal: 85, protein: 6, carbs: 1, fat: 6, cost: 1.25 },
        { name: 'Butter', baseQuantity: 1, baseUnit: 'tbsp', kcal: 102, protein: 0.1, carbs: 0, fat: 11.5, cost: 0.30 }
    ],
    veg: [
        { name: 'Broccoli', baseQuantity: 100, baseUnit: 'g', kcal: 34, protein: 2.8, carbs: 6.6, fat: 0.4, cost: 1.25 },
        { name: 'Spinach', baseQuantity: 100, baseUnit: 'g', kcal: 23, protein: 2.9, carbs: 3.6, fat: 0.4, cost: 1.00 },
        { name: 'Kale', baseQuantity: 100, baseUnit: 'g', kcal: 35, protein: 2.9, carbs: 4.4, fat: 1.5, cost: 1.50 },
        { name: 'Bell Pepper', baseQuantity: 1, baseUnit: 'unit', kcal: 24, protein: 1, carbs: 6, fat: 0, cost: 1.50 },
        { name: 'Carrots', baseQuantity: 100, baseUnit: 'g', kcal: 41, protein: 0.9, carbs: 10, fat: 0.2, cost: 0.75 },
        { name: 'Tomatoes', baseQuantity: 100, baseUnit: 'g', kcal: 18, protein: 0.9, carbs: 3.9, fat: 0.2, cost: 1.00 },
        { name: 'Cucumber', baseQuantity: 100, baseUnit: 'g', kcal: 16, protein: 0.7, carbs: 3.6, fat: 0.1, cost: 0.75 },
        { name: 'Mushrooms', baseQuantity: 100, baseUnit: 'g', kcal: 22, protein: 3.1, carbs: 3.3, fat: 0.3, cost: 1.75 }
    ],
    fruit: [
        { name: 'Apple', baseQuantity: 1, baseUnit: 'medium', kcal: 95, protein: 0.5, carbs: 25, fat: 0.3, cost: 0.50 },
        { name: 'Banana', baseQuantity: 1, baseUnit: 'medium', kcal: 105, protein: 1.3, carbs: 27, fat: 0.4, cost: 0.35 },
        { name: 'Orange', baseQuantity: 1, baseUnit: 'medium', kcal: 62, protein: 1.2, carbs: 15.4, fat: 0.2, cost: 0.75 },
        { name: 'Berries', baseQuantity: 100, baseUnit: 'g', kcal: 57, protein: 0.7, carbs: 14.5, fat: 0.3, cost: 3.00 },
        { name: 'Strawberries', baseQuantity: 100, baseUnit: 'g', kcal: 32, protein: 0.7, carbs: 7.7, fat: 0.3, cost: 2.50 },
        { name: 'Blueberries', baseQuantity: 100, baseUnit: 'g', kcal: 57, protein: 0.7, carbs: 14.5, fat: 0.3, cost: 4.00 },
        { name: 'Mango', baseQuantity: 100, baseUnit: 'g', kcal: 60, protein: 0.8, carbs: 15, fat: 0.4, cost: 2.00 },
        { name: 'Pineapple', baseQuantity: 100, baseUnit: 'g', kcal: 50, protein: 0.5, carbs: 13, fat: 0.1, cost: 1.50 }
    ],
    grains: [
        { name: 'Brown Rice', baseQuantity: 100, baseUnit: 'g', kcal: 111, protein: 2.6, carbs: 23, fat: 0.9, cost: 1.00 },
        { name: 'White Rice', baseQuantity: 100, baseUnit: 'g', kcal: 130, protein: 2.7, carbs: 28, fat: 0.3, cost: 0.75 },
        { name: 'Quinoa', baseQuantity: 100, baseUnit: 'g', kcal: 120, protein: 4.1, carbs: 21.3, fat: 1.9, cost: 2.00 },
        { name: 'Oats', baseQuantity: 100, baseUnit: 'g', kcal: 379, protein: 13.2, carbs: 67.7, fat: 6.5, cost: 1.50 },
        { name: 'Whole Wheat Bread', baseQuantity: 1, baseUnit: 'slice', kcal: 81, protein: 4, carbs: 13.8, fat: 1.1, cost: 0.30 },
        { name: 'Pasta', baseQuantity: 100, baseUnit: 'g', kcal: 131, protein: 5, carbs: 25, fat: 1.1, cost: 1.00 },
        { name: 'Barley', baseQuantity: 100, baseUnit: 'g', kcal: 123, protein: 2.3, carbs: 28.2, fat: 0.4, cost: 1.25 }
    ],
    nuts: [
        { name: 'Almonds', baseQuantity: 28, baseUnit: 'g', kcal: 164, protein: 6, carbs: 6, fat: 14, cost: 1.50 },
        { name: 'Walnuts', baseQuantity: 28, baseUnit: 'g', kcal: 185, protein: 4.3, carbs: 3.9, fat: 18.5, cost: 1.75 },
        { name: 'Cashews', baseQuantity: 28, baseUnit: 'g', kcal: 157, protein: 5.2, carbs: 8.6, fat: 12.4, cost: 2.00 },
        { name: 'Peanuts', baseQuantity: 28, baseUnit: 'g', kcal: 161, protein: 7.3, carbs: 4.6, fat: 14, cost: 0.75 },
        { name: 'Chia Seeds', baseQuantity: 28, baseUnit: 'g', kcal: 138, protein: 4.7, carbs: 12, fat: 8.7, cost: 2.50 },
        { name: 'Flax Seeds', baseQuantity: 28, baseUnit: 'g', kcal: 150, protein: 5.2, carbs: 8.2, fat: 12, cost: 1.50 },
        { name: 'Pumpkin Seeds', baseQuantity: 28, baseUnit: 'g', kcal: 151, protein: 7, carbs: 5, fat: 13, cost: 2.00 }
    ],
    carbs: [
        { name: 'Sweet Potato', baseQuantity: 100, baseUnit: 'g', kcal: 86, protein: 1.6, carbs: 20, fat: 0.1, cost: 0.75 },
        { name: 'Potato', baseQuantity: 100, baseUnit: 'g', kcal: 77, protein: 2, carbs: 17, fat: 0.1, cost: 0.50 },
        { name: 'Corn', baseQuantity: 100, baseUnit: 'g', kcal: 86, protein: 3.3, carbs: 19, fat: 1.4, cost: 0.75 },
        { name: 'Beans', baseQuantity: 100, baseUnit: 'g', kcal: 127, protein: 8.7, carbs: 22.8, fat: 0.5, cost: 1.00 },
        { name: 'Lentils', baseQuantity: 100, baseUnit: 'g', kcal: 116, protein: 9, carbs: 20, fat: 0.4, cost: 1.25 },
        { name: 'Chickpeas', baseQuantity: 100, baseUnit: 'g', kcal: 164, protein: 8.9, carbs: 27.4, fat: 2.6, cost: 1.00 }
    ],
    drinks: [
        { name: 'Water', baseQuantity: 250, baseUnit: 'ml', kcal: 0, protein: 0, carbs: 0, fat: 0, cost: 0.00 },
        { name: 'Coffee', baseQuantity: 250, baseUnit: 'ml', kcal: 2, protein: 0.3, carbs: 0, fat: 0, cost: 0.50 },
        { name: 'Green Tea', baseQuantity: 250, baseUnit: 'ml', kcal: 2, protein: 0, carbs: 0, fat: 0, cost: 0.25 },
        { name: 'Orange Juice', baseQuantity: 250, baseUnit: 'ml', kcal: 112, protein: 1.7, carbs: 26, fat: 0.5, cost: 1.50 },
        { name: 'Smoothie', baseQuantity: 250, baseUnit: 'ml', kcal: 150, protein: 3, carbs: 35, fat: 1, cost: 3.00 },
        { name: 'Protein Shake', baseQuantity: 250, baseUnit: 'ml', kcal: 160, protein: 25, carbs: 8, fat: 3, cost: 2.50 },
        { name: 'Coconut Water', baseQuantity: 250, baseUnit: 'ml', kcal: 45, protein: 2, carbs: 9, fat: 0.5, cost: 2.00 },
        { name: 'Almond Milk', baseQuantity: 250, baseUnit: 'ml', kcal: 40, protein: 1, carbs: 3, fat: 3, cost: 1.00 }
    ],
    sweets: [
        { name: 'Dark Chocolate', baseQuantity: 28, baseUnit: 'g', kcal: 155, protein: 1.4, carbs: 17, fat: 9, cost: 1.25 },
        { name: 'Cookies', baseQuantity: 2, baseUnit: 'pieces', kcal: 140, protein: 2, carbs: 20, fat: 6, cost: 0.75 },
        { name: 'Ice Cream', baseQuantity: 100, baseUnit: 'g', kcal: 207, protein: 3.5, carbs: 24, fat: 11, cost: 1.50 },
        { name: 'Brownies', baseQuantity: 1, baseUnit: 'piece', kcal: 240, protein: 3, carbs: 35, fat: 10, cost: 1.00 },
        { name: 'Fruit Sorbet', baseQuantity: 100, baseUnit: 'g', kcal: 120, protein: 0.5, carbs: 30, fat: 0, cost: 2.00 },
        { name: 'Muffin', baseQuantity: 1, baseUnit: 'piece', kcal: 180, protein: 3, carbs: 25, fat: 7, cost: 1.50 },
        { name: 'Granola Bar', baseQuantity: 1, baseUnit: 'bar', kcal: 120, protein: 2, carbs: 18, fat: 5, cost: 0.75 },
        { name: 'Yogurt Parfait', baseQuantity: 150, baseUnit: 'g', kcal: 140, protein: 6, carbs: 22, fat: 3, cost: 2.50 }
    ],
    extras: [
        { name: 'Olive Oil', baseQuantity: 1, baseUnit: 'tbsp', kcal: 119, protein: 0, carbs: 0, fat: 14, cost: 0.25 },
        { name: 'Coconut Oil', baseQuantity: 1, baseUnit: 'tbsp', kcal: 117, protein: 0, carbs: 0, fat: 14, cost: 0.30 },
        { name: 'Avocado', baseQuantity: 100, baseUnit: 'g', kcal: 160, protein: 2, carbs: 8.5, fat: 14.7, cost: 2.00 },
        { name: 'Peanut Butter', baseQuantity: 2, baseUnit: 'tbsp', kcal: 191, protein: 7, carbs: 8, fat: 16, cost: 0.50 },
        { name: 'Almond Butter', baseQuantity: 2, baseUnit: 'tbsp', kcal: 196, protein: 7, carbs: 6, fat: 18, cost: 1.00 },
        { name: 'Honey', baseQuantity: 1, baseUnit: 'tbsp', kcal: 64, protein: 0.1, carbs: 17.3, fat: 0, cost: 0.50 },
        { name: 'Maple Syrup', baseQuantity: 1, baseUnit: 'tbsp', kcal: 52, protein: 0, carbs: 13.4, fat: 0, cost: 0.75 }
    ]
};

// Unit conversion factors
const unitConversions = {
    'g': { 'oz': 0.035274, 'lb': 0.00220462, 'kg': 0.001, 'cup': 0.00423, 'tbsp': 0.0667, 'tsp': 0.2 },
    'oz': { 'g': 28.3495, 'lb': 0.0625, 'kg': 0.0283495, 'cup': 0.12, 'tbsp': 1.89, 'tsp': 5.67 },
    'lb': { 'g': 453.592, 'oz': 16, 'kg': 0.453592, 'cup': 1.92, 'tbsp': 30.24, 'tsp': 90.72 },
    'kg': { 'g': 1000, 'oz': 35.274, 'lb': 2.20462, 'cup': 4.23, 'tbsp': 66.7, 'tsp': 200 },
    'cup': { 'g': 236.588, 'oz': 8.33, 'lb': 0.521, 'kg': 0.237, 'tbsp': 16, 'tsp': 48, 'ml': 236.588 },
    'tbsp': { 'g': 14.787, 'oz': 0.529, 'lb': 0.0326, 'kg': 0.0148, 'cup': 0.0625, 'tsp': 3, 'ml': 14.787 },
    'tsp': { 'g': 4.929, 'oz': 0.176, 'lb': 0.0109, 'kg': 0.00493, 'cup': 0.0208, 'tbsp': 0.333, 'ml': 4.929 },
    'ml': { 'cup': 0.00423, 'tbsp': 0.0676, 'tsp': 0.203, 'fl oz': 0.0338 },
    'fl oz': { 'ml': 29.574, 'cup': 0.125, 'tbsp': 2, 'tsp': 6 },
    'unit': { 'unit': 1 },
    'medium': { 'small': 1.5, 'large': 0.75, 'medium': 1 },
    'large': { 'small': 2, 'medium': 1.33, 'large': 1 },
    'small': { 'medium': 0.67, 'large': 0.5, 'small': 1 },
    'slice': { 'slice': 1 },
    'piece': { 'piece': 1 }
};

// DOM Elements
let mainBoard, categoryPillsContainer;
let activeColumns = [];
let draggedElement = null;
let draggedData = null;
let lastActiveDay = null; // Track the last active day column

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    initializeElements();
    setupEventListeners();
    createInitialDayColumns();
});

function initializeElements() {
    mainBoard = document.querySelector('.main-board');
    categoryPillsContainer = document.querySelector('.category-pills-container');
}

function setupEventListeners() {
    // Category pill drag and click handlers
    document.querySelectorAll('.category-pill').forEach(pill => {
        pill.addEventListener('dragstart', handlePillDragStart);
        pill.addEventListener('dragend', handlePillDragEnd);
        pill.addEventListener('click', handlePillClick);
    });

    // Main board drop zone for pills
    mainBoard.addEventListener('dragover', handleBoardDragOver);
    mainBoard.addEventListener('drop', handleBoardDrop);

    // Header controls
    document.getElementById('addDayBtn')?.addEventListener('click', addNewDay);
}

// Handle pill click - create column next to active day
function handlePillClick(e) {
    const category = e.target.closest('.category-pill').dataset.category;
    
    // Check if category column already exists
    if (document.querySelector(`.category-column[data-category="${category}"]`)) {
        return;
    }
    
    // Find the first day column or the last active day
    let targetDay = lastActiveDay || document.querySelector('.day-column');
    if (!targetDay) return;
    
    // Create the category column and insert it after (to the right of) the target day
    createCategoryColumn(category, targetDay.nextSibling);
}

// Drag and Drop Handlers
function handlePillDragStart(e) {
    draggedElement = e.target;
    draggedData = {
        type: 'category',
        category: e.target.dataset.category
    };
    e.target.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'copy';
}

function handlePillDragEnd(e) {
    e.target.classList.remove('dragging');
    clearDropIndicators();
    draggedElement = null;
    draggedData = null;
}

function handleBoardDragOver(e) {
    if (draggedData?.type === 'category' && !activeColumns.includes(draggedData.category)) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'copy';
        
        // Show drop indicator between columns
        const afterElement = getDragAfterColumn(mainBoard, e.clientX);
        clearDropIndicators();
        
        if (afterElement) {
            afterElement.classList.add('drop-indicator-left');
        } else {
            const columns = mainBoard.querySelectorAll('.category-column, .day-column');
            if (columns.length > 0) {
                columns[columns.length - 1].classList.add('drop-indicator-right');
            }
        }
    } else if (draggedData?.type === 'column') {
        // Handle column reordering in empty space
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }
}

function handleBoardDrop(e) {
    e.preventDefault();
    clearDropIndicators();
    
    if (draggedData?.type === 'category' && !activeColumns.includes(draggedData.category)) {
        const afterElement = getDragAfterColumn(mainBoard, e.clientX);
        createCategoryColumn(draggedData.category, afterElement);
    } else if (draggedData?.type === 'column') {
        // Handle dropping column in empty space
        const afterElement = getDragAfterColumn(mainBoard, e.clientX);
        if (afterElement && afterElement !== draggedElement) {
            mainBoard.insertBefore(draggedElement, afterElement);
        } else if (!afterElement) {
            mainBoard.appendChild(draggedElement);
        }
    }
}

function clearDropIndicators() {
    mainBoard.querySelectorAll('.category-column, .day-column').forEach(col => {
        col.classList.remove('drop-indicator-left', 'drop-indicator-right');
    });
}

function getDragAfterColumn(container, x) {
    const columns = [...container.querySelectorAll('.category-column, .day-column')];
    
    return columns.reduce((closest, column) => {
        const box = column.getBoundingClientRect();
        const offset = x - box.left - box.width / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: column };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Food item drag handlers
function handleFoodDragStart(e) {
    const foodItem = e.target.closest('.food-item');
    if (!foodItem) return;
    
    draggedElement = foodItem;
    const foodData = JSON.parse(foodItem.dataset.food);
    draggedData = {
        type: 'food',
        food: foodData,
        quantity: parseFloat(foodItem.querySelector('.portion-input').value),
        unit: foodItem.querySelector('.unit-select').value
    };
    foodItem.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'copy';
}

function handleFoodDragEnd(e) {
    const foodItem = e.target.closest('.food-item');
    if (foodItem) {
        foodItem.classList.remove('dragging');
    }
    draggedElement = null;
    draggedData = null;
}

// Module drag handlers
function handleModuleDragStart(e) {
    const module = e.target.closest('.food-module');
    if (!module) return;
    
    draggedElement = module;
    draggedData = {
        type: 'module',
        moduleElement: module
    };
    module.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleModuleDragEnd(e) {
    const module = e.target.closest('.food-module');
    if (module) {
        module.classList.remove('dragging');
    }
    draggedElement = null;
    draggedData = null;
}

// Column drag handlers
function handleColumnDragStart(e) {
    const column = e.target.closest('.category-column');
    if (!column) return;
    
    // Don't start drag if we're dragging a food item or module
    if (e.target.closest('.food-item') || e.target.closest('.food-module')) return;
    
    draggedElement = column;
    draggedData = {
        type: 'column',
        columnElement: column
    };
    column.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
}

function handleColumnDragEnd(e) {
    const column = e.target.closest('.category-column');
    if (column) {
        column.classList.remove('dragging');
    }
    // Clean up drop indicators
    document.querySelectorAll('.category-column').forEach(col => {
        col.classList.remove('drop-indicator-left', 'drop-indicator-right');
    });
    draggedElement = null;
    draggedData = null;
}

function handleColumnDragOver(e) {
    // Only handle if we're dragging a column
    if (!draggedData || draggedData.type !== 'column') return;
    
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    
    const column = e.target.closest('.category-column, .day-column');
    if (!column || column === draggedElement) return;
    
    const rect = column.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    
    // Remove existing indicators
    document.querySelectorAll('.category-column, .day-column').forEach(col => {
        col.classList.remove('drop-indicator-left', 'drop-indicator-right');
    });
    
    // Add indicator based on position
    if (e.clientX < midpoint) {
        column.classList.add('drop-indicator-left');
    } else {
        column.classList.add('drop-indicator-right');
    }
}

function handleColumnDrop(e) {
    // Only handle if we're dragging a column
    if (!draggedData || draggedData.type !== 'column') return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const dropColumn = e.target.closest('.category-column, .day-column');
    if (!dropColumn || dropColumn === draggedElement) return;
    
    const rect = dropColumn.getBoundingClientRect();
    const midpoint = rect.left + rect.width / 2;
    
    if (e.clientX < midpoint) {
        // Insert before
        mainBoard.insertBefore(draggedElement, dropColumn);
    } else {
        // Insert after
        if (dropColumn.nextSibling) {
            mainBoard.insertBefore(draggedElement, dropColumn.nextSibling);
        } else {
            mainBoard.appendChild(draggedElement);
        }
    }
    
    // Clean up indicators
    document.querySelectorAll('.category-column, .day-column').forEach(col => {
        col.classList.remove('drop-indicator-left', 'drop-indicator-right');
    });
}

// Create Category Column
function createCategoryColumn(category, insertBefore = null) {
    if (activeColumns.includes(category)) return;
    
    const column = document.createElement('div');
    column.className = `category-column ${category} animate-in`;
    column.dataset.category = category;
    column.draggable = true;
    
    const categoryData = foodDatabase[category] || [];
    const categoryColors = {
        protein: '#f56565',
        dairy: '#60a5fa',
        veg: '#48bb78',
        fruit: '#ed8936',
        grains: '#a78bfa',
        nuts: '#f59e0b',
        carbs: '#ecc94b',
        drinks: '#06b6d4',
        sweets: '#ec4899',
        extras: '#9f7aea'
    };
    
    const categoryEmojis = {
        protein: '🥩',
        dairy: '🥛',
        veg: '🥦',
        fruit: '🍎',
        grains: '🌾',
        nuts: '🥜',
        carbs: '🥔',
        drinks: '🥤',
        sweets: '🍰',
        extras: '✨'
    };
    
    column.innerHTML = `
        <div class="category-header ${category}" style="background: ${categoryColors[category]}">
            <span>${categoryEmojis[category]} ${category.charAt(0).toUpperCase() + category.slice(1)}</span>
            <button class="close-column" onclick="removeCategoryColumn('${category}')">×</button>
        </div>
        <div class="category-search">
            <input type="text" class="search-input" placeholder="Search ${category}..." 
                   onkeyup="filterFoodItems('${category}', this.value)">
            <div class="filter-buttons">
                <button class="filter-btn active" onclick="filterByMacro('${category}', 'all', this)">All</button>
                <button class="filter-btn" onclick="filterByMacro('${category}', 'high-protein', this)">High Protein</button>
                <button class="filter-btn" onclick="filterByMacro('${category}', 'low-carb', this)">Low Carb</button>
                <button class="filter-btn" onclick="filterByMacro('${category}', 'low-fat', this)">Low Fat</button>
            </div>
        </div>
        <div class="category-items" data-category="${category}">
            <div class="loading-popular">
                <div class="loading-spinner"></div> Loading popular items...
            </div>
            ${categoryData.map(food => createFoodItemHTML(food, category)).join('')}
        </div>
    `;
    
    // Insert at specified position
    if (insertBefore) {
        mainBoard.insertBefore(column, insertBefore);
    } else {
        // If no position specified, insert before first day column
        const firstDayColumn = mainBoard.querySelector('.day-column');
        if (firstDayColumn) {
            mainBoard.insertBefore(column, firstDayColumn);
        } else {
            mainBoard.appendChild(column);
        }
    }
    
    activeColumns.push(category);
    
    // Setup drag handlers for the column itself
    column.addEventListener('dragstart', handleColumnDragStart);
    column.addEventListener('dragend', handleColumnDragEnd);
    column.addEventListener('dragover', handleColumnDragOver);
    column.addEventListener('drop', handleColumnDrop);
    
    // Automatically load popular items
    loadPopularItemsAutomatically(category);
    
    // Setup drag handlers for food items
    column.querySelectorAll('.food-item').forEach(item => {
        item.addEventListener('dragstart', handleFoodDragStart);
        item.addEventListener('dragend', handleFoodDragEnd);
    });
    
    // Setup portion and unit change handlers
    column.querySelectorAll('.portion-input').forEach(input => {
        input.addEventListener('change', handlePortionChange);
    });
    
    column.querySelectorAll('.unit-select').forEach(select => {
        select.addEventListener('change', handleUnitChange);
    });
}

// Create macro bar visualization
function createMacroBar(protein, carbs, fat) {
    const total = protein + carbs + fat;
    if (total === 0) return '<div class="macro-bar-empty">No macros</div>';
    
    const proteinPercent = (protein / total) * 100;
    const carbsPercent = (carbs / total) * 100;
    const fatPercent = (fat / total) * 100;
    
    return `
        <div class="macro-bar-segment protein" style="width: ${proteinPercent}%" title="Protein: ${protein.toFixed(1)}g (${proteinPercent.toFixed(0)}%)"></div>
        <div class="macro-bar-segment carbs" style="width: ${carbsPercent}%" title="Carbs: ${carbs.toFixed(1)}g (${carbsPercent.toFixed(0)}%)"></div>
        <div class="macro-bar-segment fat" style="width: ${fatPercent}%" title="Fat: ${fat.toFixed(1)}g (${fatPercent.toFixed(0)}%)"></div>
    `;
}

// Create macro labels with percentages
function createMacroLabels(protein, carbs, fat) {
    const total = protein + carbs + fat;
    if (total === 0) return '';
    
    const proteinPercent = ((protein / total) * 100).toFixed(0);
    const carbsPercent = ((carbs / total) * 100).toFixed(0);
    const fatPercent = ((fat / total) * 100).toFixed(0);
    
    return `
        <span class="macro-label protein">Protein: ${protein.toFixed(1)}g (${proteinPercent}%)</span>
        <span class="macro-label carbs">Carbs: ${carbs.toFixed(1)}g (${carbsPercent}%)</span>
        <span class="macro-label fat">Fat: ${fat.toFixed(1)}g (${fatPercent}%)</span>
    `;
}

// Create Food Item HTML
function createFoodItemHTML(food, category) {
    const foodData = {
        ...food,
        category: category,
        currentQuantity: food.baseQuantity,
        currentUnit: food.baseUnit
    };
    
    const units = getAvailableUnits(food.baseUnit);
    const step = food.baseUnit === 'cup' ? 0.25 : 1;
    const min = food.baseUnit === 'cup' ? 0.25 : 1;
    
    const isFavorited = window.favoritesManager ? window.favoritesManager.isFavorite(foodData) : false;
    
    return `
        <div class="food-item" draggable="true" data-food='${JSON.stringify(foodData)}'>
            <div class="food-item-header">
                <div class="food-name">${food.name}</div>
                <button class="favorite-btn ${isFavorited ? 'favorited' : ''}" 
                        onclick="event.stopPropagation(); window.favoritesManager.toggleFavorite(this)" 
                        title="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}">
                    ${isFavorited ? '❤️' : '🤍'}
                </button>
            </div>
            <div class="food-portion">
                <input type="number" class="portion-input" value="${food.baseQuantity}" min="${min}" step="${step}" data-unit="${food.baseUnit}">
                <select class="unit-select">
                    ${units.map(unit => 
                        `<option value="${unit}" ${unit === food.baseUnit ? 'selected' : ''}>${unit}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="food-macros">
                <div class="macro-bar-container">
                    <div class="macro-bar">
                        ${createMacroBar(food.protein, food.carbs, food.fat)}
                    </div>
                    <div class="macro-labels">
                        ${createMacroLabels(food.protein, food.carbs, food.fat)}
                    </div>
                </div>
                <div class="macro-stats">
                    <span class="macro kcal" title="Calories">${food.kcal} kcal</span>
                    <span class="macro cost" title="Cost">$${food.cost.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;
}

// Get available units for conversion
function getAvailableUnits(baseUnit) {
    const weightUnits = ['g', 'oz', 'lb', 'kg'];
    const volumeUnits = ['cup', 'tbsp', 'tsp', 'ml', 'fl oz'];
    const countUnits = ['unit', 'small', 'medium', 'large', 'slice', 'piece'];
    
    // For weight units, also include cup for common cooking conversions
    if (weightUnits.includes(baseUnit)) return [...weightUnits, 'cup'];
    if (volumeUnits.includes(baseUnit)) return volumeUnits;
    if (countUnits.includes(baseUnit)) return countUnits;
    return [baseUnit];
}

// Handle portion change
function handlePortionChange(e) {
    const foodItem = e.target.closest('.food-item');
    if (!foodItem) return;
    
    const foodData = JSON.parse(foodItem.dataset.food);
    const newQuantity = parseFloat(e.target.value);
    const ratio = newQuantity / foodData.baseQuantity;
    
    updateFoodItemMacros(foodItem, foodData, ratio);
}

// Handle unit change
function handleUnitChange(e) {
    const foodItem = e.target.closest('.food-item');
    if (!foodItem) return;
    
    const foodData = JSON.parse(foodItem.dataset.food);
    const currentUnit = foodData.currentUnit || foodData.baseUnit;
    const newUnit = e.target.value;
    const quantityInput = foodItem.querySelector('.portion-input');
    const currentQuantity = parseFloat(quantityInput.value);
    
    // Convert quantity
    const newQuantity = convertUnit(currentQuantity, currentUnit, newUnit);
    quantityInput.value = newQuantity.toFixed(2);
    
    // Update step and min based on unit
    if (newUnit === 'cup') {
        quantityInput.step = '0.25';
        quantityInput.min = '0.25';
    } else {
        quantityInput.step = '1';
        quantityInput.min = '1';
    }
    quantityInput.dataset.unit = newUnit;
    
    // Update food data
    foodData.currentUnit = newUnit;
    foodItem.dataset.food = JSON.stringify(foodData);
    
    // Calculate ratio for macros
    const baseQuantityInNewUnit = convertUnit(foodData.baseQuantity, foodData.baseUnit, newUnit);
    const ratio = newQuantity / baseQuantityInNewUnit;
    
    updateFoodItemMacros(foodItem, foodData, ratio);
}

// Convert units
function convertUnit(quantity, fromUnit, toUnit) {
    if (fromUnit === toUnit) return quantity;
    
    if (unitConversions[fromUnit] && unitConversions[fromUnit][toUnit]) {
        return quantity * unitConversions[fromUnit][toUnit];
    }
    
    // Try reverse conversion
    if (unitConversions[toUnit] && unitConversions[toUnit][fromUnit]) {
        return quantity / unitConversions[toUnit][fromUnit];
    }
    
    return quantity;
}

// Update food item macros display
function updateFoodItemMacros(foodItem, foodData, ratio) {
    const protein = foodData.protein * ratio;
    const carbs = foodData.carbs * ratio;
    const fat = foodData.fat * ratio;
    const kcal = Math.round(foodData.kcal * ratio);
    const cost = foodData.cost * ratio;
    
    const macrosDiv = foodItem.querySelector('.food-macros');
    macrosDiv.innerHTML = `
        <div class="macro-bar-container">
            <div class="macro-bar">
                ${createMacroBar(protein, carbs, fat)}
            </div>
            <div class="macro-labels">
                ${createMacroLabels(protein, carbs, fat)}
            </div>
        </div>
        <div class="macro-stats">
            <span class="macro kcal" title="Calories">${kcal} kcal</span>
            <span class="macro cost" title="Cost">$${cost.toFixed(2)}</span>
        </div>
    `;
}

// Load popular items automatically when category column is created
async function loadPopularItemsAutomatically(category) {
    const column = document.querySelector(`.category-column[data-category="${category}"]`);
    const itemsContainer = column.querySelector('.category-items');
    const loadingDiv = itemsContainer.querySelector('.loading-popular');
    
    // Remove loading indicator immediately since we're using local data
    if (loadingDiv) {
        loadingDiv.remove();
    }
    
    // Get the most popular basic items from our local database
    const popularItems = {
        'protein': ['Chicken Breast', 'Eggs', 'Salmon', 'Tuna'],
        'dairy': ['Greek Yogurt', 'Milk', 'Cottage Cheese', 'Cheddar Cheese'],
        'veg': ['Broccoli', 'Spinach', 'Bell Pepper', 'Mushrooms'],
        'fruit': ['Apple', 'Banana', 'Berries', 'Orange'],
        'grains': ['Brown Rice', 'Oats', 'Quinoa', 'Whole Wheat Bread'],
        'nuts': ['Almonds', 'Walnuts', 'Chia Seeds', 'Peanuts'],
        'carbs': ['Sweet Potato', 'Beans', 'Lentils', 'Chickpeas'],
        'drinks': ['Water', 'Coffee', 'Green Tea', 'Protein Shake'],
        'sweets': ['Dark Chocolate', 'Cookies', 'Ice Cream', 'Granola Bar'],
        'extras': ['Olive Oil', 'Avocado', 'Peanut Butter', 'Honey']
    };
    
    const itemNames = popularItems[category] || [];
    const categoryData = foodDatabase[category] || [];
    
    const popularSection = document.createElement('div');
    popularSection.className = 'popular-section';
    popularSection.innerHTML = '<div class="results-header">🔥 Popular Items:</div>';
    
    // Add the popular items from local database
    itemNames.forEach(itemName => {
        const food = categoryData.find(f => f.name === itemName);
        if (food) {
            const foodElement = createFoodItemHTML(food, category);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = foodElement;
            const foodItem = tempDiv.firstChild;
            popularSection.appendChild(foodItem);
            
            // Add event listeners to the new element
            foodItem.addEventListener('dragstart', handleFoodDragStart);
            foodItem.addEventListener('dragend', handleFoodDragEnd);
            
            const portionInput = foodItem.querySelector('.portion-input');
            const unitSelect = foodItem.querySelector('.unit-select');
            
            if (portionInput) portionInput.addEventListener('change', handlePortionChange);
            if (unitSelect) unitSelect.addEventListener('change', handleUnitChange);
        }
    });
    
    // Add popular items to container if any were found
    if (popularSection.children.length > 1) { // More than just the header
        itemsContainer.insertBefore(popularSection, itemsContainer.firstChild);
    }
}

// Show popular items when search box is focused (kept for manual trigger if needed)
async function showPopularItems(category, currentValue) {
    if (currentValue && currentValue.length > 0) return; // Don't show if already typing
    
    const column = document.querySelector(`.category-column[data-category="${category}"]`);
    const itemsContainer = column.querySelector('.category-items');
    
    // Check if we already have popular items section
    if (itemsContainer.querySelector('.popular-section')) return;
    
    const popularSection = document.createElement('div');
    popularSection.className = 'popular-section';
    popularSection.innerHTML = '<div class="results-header">🔥 Popular Items:</div>';
    
    // Define popular searches per category
    const popularByCategory = {
        'protein': 'chicken',
        'veg': 'broccoli',
        'fruit': 'apple',
        'carbs': 'rice',
        'extras': 'olive oil'
    };
    
    const searchTerm = popularByCategory[category] || 'food';
    
    try {
        const results = await window.fatSecretClient.searchFoods(searchTerm, 5);
        if (results.length > 0) {
            results.forEach(food => {
                food.category = category;
                const foodElement = window.createFoodItemElement ? 
                    window.createFoodItemElement(food, category) :
                    createFoodItemElement(food, category);
                popularSection.appendChild(foodElement);
            });
            itemsContainer.insertBefore(popularSection, itemsContainer.firstChild);
        }
    } catch (error) {
        console.warn('Failed to load popular items:', error);
    }
}

// Hide popular items when search box loses focus
function hidePopularItems(category) {
    setTimeout(() => {
        const column = document.querySelector(`.category-column[data-category="${category}"]`);
        const popularSection = column?.querySelector('.popular-section');
        if (popularSection) {
            popularSection.remove();
        }
    }, 200); // Small delay to allow clicking on items
}

// Filter food items by search text
function filterFoodItems(category, searchText) {
    const column = document.querySelector(`.category-column[data-category="${category}"]`);
    const items = column.querySelectorAll('.food-item');
    
    items.forEach(item => {
        const foodName = item.querySelector('.food-name').textContent.toLowerCase();
        if (foodName.includes(searchText.toLowerCase())) {
            item.style.display = 'block';
        } else {
            item.style.display = 'none';
        }
    });
}

// Filter food items by macro criteria
function filterByMacro(category, filter, buttonElement) {
    const column = document.querySelector(`.category-column[data-category="${category}"]`);
    const items = column.querySelectorAll('.food-item');
    
    // Update active button state
    column.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
    buttonElement.classList.add('active');
    
    items.forEach(item => {
        const foodData = JSON.parse(item.dataset.food);
        let show = true;
        
        switch(filter) {
            case 'high-protein':
                // Show if protein is > 20% of calories (protein has 4 cal/g)
                const proteinCals = foodData.protein * 4;
                show = (proteinCals / foodData.kcal) > 0.2;
                break;
            case 'low-carb':
                // Show if carbs are < 30% of calories (carbs have 4 cal/g)
                const carbCals = foodData.carbs * 4;
                show = (carbCals / foodData.kcal) < 0.3;
                break;
            case 'low-fat':
                // Show if fat is < 30% of calories (fat has 9 cal/g)
                const fatCals = foodData.fat * 9;
                show = (fatCals / foodData.kcal) < 0.3;
                break;
            case 'all':
            default:
                show = true;
        }
        
        item.style.display = show ? 'block' : 'none';
    });
}

// Remove Category Column
function removeCategoryColumn(category) {
    const column = document.querySelector(`.category-column[data-category="${category}"]`);
    if (column) {
        column.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            column.remove();
            activeColumns = activeColumns.filter(c => c !== category);
        }, 300);
    }
}

// Create Initial Day Columns
function createInitialDayColumns() {
    // Add AI Assistant as the first column
    createAIAssistantColumn();
    
    // Then add the day columns
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    days.forEach(day => createDayColumn(day));
}

function createAIAssistantColumn() {
    // Import and create AI Assistant column
    if (window.aiAssistant) {
        const aiColumn = window.aiAssistant.createColumn();
        mainBoard.appendChild(aiColumn);
    }
}

// Create Day Column
function createDayColumn(dayName) {
    const column = document.createElement('div');
    column.className = 'day-column';
    column.dataset.day = dayName.toLowerCase();
    
    column.innerHTML = `
        <div class="day-header">
            <div class="day-name">${dayName}</div>
            <button class="add-meal-btn" onclick="addMeal('${dayName.toLowerCase()}')">+ Meal</button>
        </div>
        <div class="meals-container">
            ${createMealHTML(dayName.toLowerCase(), 'Breakfast', '07:00')}
            ${createMealHTML(dayName.toLowerCase(), 'Morning Snack', '10:00')}
            ${createMealHTML(dayName.toLowerCase(), 'Lunch', '12:30')}
            ${createMealHTML(dayName.toLowerCase(), 'Afternoon Snack', '15:00')}
            ${createMealHTML(dayName.toLowerCase(), 'Dinner', '18:30')}
            ${createMealHTML(dayName.toLowerCase(), 'Evening Snack', '20:30')}
        </div>
        <div class="day-totals">
            <div class="day-totals-title">Day Total</div>
            <div class="macro-bar-container">
                <div class="macro-bar day-macro-bar">
                    <div class="macro-bar-empty">No macros yet</div>
                </div>
                <div class="macro-labels">
                    <!-- Labels will appear when macros are added -->
                </div>
            </div>
            <div class="day-total-stats">
                <div class="day-total-item">
                    <span class="day-total-label">Calories</span>
                    <span class="day-total-value">0 kcal</span>
                </div>
                <div class="day-total-item">
                    <span class="day-total-label">Cost</span>
                    <span class="day-total-value">$0.00</span>
                </div>
            </div>
        </div>
    `;
    
    mainBoard.appendChild(column);
}

// Create Meal HTML
function createMealHTML(day, mealName, time) {
    const mealId = `${day}-${mealName.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;
    
    // Get meal emoji based on meal name
    const getMealEmoji = (name) => {
        const mealLower = name.toLowerCase();
        if (mealLower.includes('breakfast')) return '🍳';
        if (mealLower.includes('lunch')) return '☀️';
        if (mealLower.includes('dinner')) return '🌙';
        if (mealLower.includes('morning') && mealLower.includes('snack')) return '🥐';
        if (mealLower.includes('afternoon') && mealLower.includes('snack')) return '🍎';
        if (mealLower.includes('evening') && mealLower.includes('snack')) return '🍪';
        if (mealLower.includes('snack')) return '🥨';
        return '🍽️'; // default meal emoji
    };
    
    return `
        <div class="meal" data-meal-id="${mealId}">
            <div class="meal-header">
                <div class="meal-header-top">
                    <div class="meal-name" contenteditable="true" onclick="handleMealNameClick(event)" onblur="handleMealNameBlur(event, '${mealId}')" onkeydown="handleMealNameKeydown(event)">${getMealEmoji(mealName)} ${mealName}</div>
                    <div class="meal-time" contenteditable="true" onclick="handleMealTimeClick(event)" onblur="handleMealTimeBlur(event, '${mealId}')" onkeydown="handleMealTimeKeydown(event)">⏰ ${time}</div>
                </div>
                <div class="meal-header-bottom">
                    <div class="meal-controls">
                        <button class="meal-control-btn minimize-btn" onclick="toggleMealMinimize('${mealId}')" title="Minimize">
                            <span class="chevron">▼</span>
                        </button>
                        <button class="meal-control-btn" onclick="deleteMeal('${mealId}')">🗑️</button>
                    </div>
                </div>
            </div>
            <div class="meal-drop-zone" data-meal-id="${mealId}">
                <div class="recipes-container">
                    <!-- Recipe containers will be added here -->
                </div>
                <div class="food-modules-container" ondragover="handleMealDragOver(event)" ondrop="handleMealDrop(event)" ondragleave="handleMealDragLeave(event)">
                    <!-- Standalone food modules (not in recipes) will be added here -->
                </div>
                <div class="add-food-zone" ondragover="handleMealDragOver(event)" ondrop="handleMealDrop(event)" ondragleave="handleMealDragLeave(event)">
                    <span class="add-food-text">+ Add food or recipe</span>
                </div>
            </div>
            <div class="meal-totals" style="display: none;">
                <div class="meal-total">
                    <span class="meal-total-label">Total:</span>
                    <span class="meal-total-value">0 kcal</span>
                </div>
                <div class="meal-total">
                    <span class="meal-total-value">0g P</span>
                </div>
                <div class="meal-total">
                    <span class="meal-total-value">0g C</span>
                </div>
                <div class="meal-total">
                    <span class="meal-total-value">0g F</span>
                </div>
            </div>
        </div>
    `;
}

// Meal Drop Handlers
function handleMealDragOver(e) {
    e.preventDefault();
    if (draggedData?.type === 'food' || draggedData?.type === 'module') {
        e.currentTarget.classList.add('drag-over');
        e.dataTransfer.dropEffect = draggedData.type === 'food' ? 'copy' : 'move';
    }
    
    // Update last active day when interacting with a meal
    const dayColumn = e.currentTarget.closest('.day-column');
    if (dayColumn) {
        lastActiveDay = dayColumn;
    }
}

function handleMealDragLeave(e) {
    e.currentTarget.classList.remove('drag-over');
}

function handleMealDrop(e) {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    // Update last active day when dropping in a meal
    const dayColumn = e.currentTarget.closest('.day-column');
    if (dayColumn) {
        lastActiveDay = dayColumn;
    }
    
    const dropTarget = e.currentTarget;
    const meal = dropTarget.closest('.meal');
    const modulesContainer = meal.querySelector('.food-modules-container');
    
    if (draggedData?.type === 'food') {
        // Add to history when food is used
        if (window.favoritesManager) {
            window.favoritesManager.addToHistory(draggedData.food);
        }
        
        // Add new food module
        const module = createFoodModule(draggedData);
        
        // If dropping in add-food-zone, append to modules container
        if (dropTarget.classList.contains('add-food-zone') || dropTarget.classList.contains('food-modules-container')) {
            modulesContainer.appendChild(module);
        }
        
        updateMealTotals(meal);
        updateDayTotals(meal.closest('.day-column'));
        
    } else if (draggedData?.type === 'module') {
        // Reorder module
        if (dropTarget.classList.contains('food-modules-container')) {
            const afterElement = getDragAfterElement(modulesContainer, e.clientY);
            if (afterElement == null) {
                modulesContainer.appendChild(draggedData.moduleElement);
            } else {
                modulesContainer.insertBefore(draggedData.moduleElement, afterElement);
            }
        } else if (dropTarget.classList.contains('add-food-zone')) {
            // If dropping on add-food-zone, append to end
            modulesContainer.appendChild(draggedData.moduleElement);
        }
        updateMealTotals(meal);
        updateDayTotals(meal.closest('.day-column'));
    }
}

// Get element after which to insert dragged element
function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.food-module:not(.dragging)')];
    
    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Create Recipe Container
function createRecipeContainer(recipeName, recipeId = null) {
    const id = recipeId || `recipe-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const container = document.createElement('div');
    container.className = 'recipe-container';
    container.dataset.recipeId = id;
    
    container.innerHTML = `
        <div class="recipe-header">
            <div class="recipe-name">
                <span class="recipe-icon">📖</span>
                <span class="recipe-title" contenteditable="true">${recipeName}</span>
            </div>
            <div class="recipe-controls">
                <button class="recipe-control-btn" onclick="toggleRecipeCollapse('${id}')" title="Collapse">
                    <span class="chevron">▼</span>
                </button>
                <button class="recipe-control-btn" onclick="removeRecipe('${id}')" title="Remove Recipe">×</button>
            </div>
        </div>
        <div class="recipe-modules-container" ondragover="handleRecipeDragOver(event)" ondrop="handleRecipeDrop(event)">
            <!-- Food modules for this recipe go here -->
        </div>
        <div class="recipe-totals">
            <span class="recipe-total-calories">0 kcal</span>
            <span class="recipe-total-macros">0g P • 0g C • 0g F</span>
        </div>
    `;
    
    return container;
}

// Create Food Module
function createFoodModule(dragData, isPartOfRecipe = false) {
    const module = document.createElement('div');
    const category = dragData.food.category || 'default';
    module.className = `food-module food-module-${category} animate-in`;
    module.draggable = true;
    
    const moduleId = `module-${Date.now()}`;
    const food = dragData.food;
    const quantity = dragData.quantity;
    const unit = dragData.unit;
    
    // Calculate macros based on portion
    const baseQuantityInUnit = convertUnit(food.baseQuantity, food.baseUnit, unit);
    const ratio = quantity / baseQuantityInUnit;
    
    const moduleData = {
        id: moduleId,
        name: food.name,
        category: food.category,
        quantity: quantity,
        unit: unit,
        baseFood: food,
        kcal: Math.round(food.kcal * ratio),
        protein: food.protein * ratio,
        carbs: food.carbs * ratio,
        fat: food.fat * ratio,
        cost: food.cost * ratio
    };
    
    const units = getAvailableUnits(food.baseUnit);
    
    const isFavorited = window.favoritesManager ? window.favoritesManager.isFavorite(food) : false;
    
    module.innerHTML = `
        <div class="module-header">
            <div class="module-name">${food.name}</div>
            <div class="module-actions">
                <button class="module-favorite-btn ${isFavorited ? 'favorited' : ''}" 
                        onclick="event.stopPropagation(); toggleModuleFavorite('${moduleId}')" 
                        title="${isFavorited ? 'Remove from favorites' : 'Add to favorites'}">
                    ${isFavorited ? '❤️' : '🤍'}
                </button>
                <button class="remove-module" onclick="removeModule('${moduleId}')">×</button>
            </div>
        </div>
        <div class="module-controls">
            <div class="module-inputs">
                <input type="number" class="module-portion-input" value="${quantity}" min="${unit === 'cup' ? 0.25 : 1}" step="${unit === 'cup' ? 0.25 : 1}" data-module-id="${moduleId}" data-unit="${unit}">
                <select class="module-unit-select" data-module-id="${moduleId}">
                    ${units.map(u => 
                        `<option value="${u}" ${u === unit ? 'selected' : ''}>${u}</option>`
                    ).join('')}
                </select>
            </div>
            <button class="module-expand-btn" onclick="toggleModuleExpand('${moduleId}')">▼</button>
        </div>
        <div class="module-macros">
            <div class="macro-bar-container">
                <div class="macro-bar">
                    ${createMacroBar(moduleData.protein, moduleData.carbs, moduleData.fat)}
                </div>
                <div class="macro-labels">
                    ${createMacroLabels(moduleData.protein, moduleData.carbs, moduleData.fat)}
                </div>
            </div>
            <div class="macro-stats">
                <span class="macro kcal">${moduleData.kcal} kcal</span>
                <span class="macro cost">$${moduleData.cost.toFixed(2)}</span>
            </div>
        </div>
    `;
    
    module.dataset.moduleId = moduleId;
    module.dataset.module = JSON.stringify(moduleData);
    
    // Setup event handlers
    module.addEventListener('dragstart', handleModuleDragStart);
    module.addEventListener('dragend', handleModuleDragEnd);
    
    // Setup portion and unit change handlers
    const portionInput = module.querySelector('.module-portion-input');
    const unitSelect = module.querySelector('.module-unit-select');
    
    portionInput.addEventListener('change', (e) => updateModulePortion(moduleId, e.target.value));
    unitSelect.addEventListener('change', (e) => updateModuleUnit(moduleId, e.target.value));
    
    return module;
}

// Update Module Portion
function updateModulePortion(moduleId, newQuantity) {
    const module = document.querySelector(`[data-module-id="${moduleId}"]`);
    if (!module) return;
    
    const moduleData = JSON.parse(module.dataset.module);
    const baseFood = moduleData.baseFood;
    const currentUnit = moduleData.unit;
    
    // Calculate new macros
    const baseQuantityInUnit = convertUnit(baseFood.baseQuantity, baseFood.baseUnit, currentUnit);
    const ratio = parseFloat(newQuantity) / baseQuantityInUnit;
    
    moduleData.quantity = parseFloat(newQuantity);
    moduleData.kcal = Math.round(baseFood.kcal * ratio);
    moduleData.protein = baseFood.protein * ratio;
    moduleData.carbs = baseFood.carbs * ratio;
    moduleData.fat = baseFood.fat * ratio;
    moduleData.cost = baseFood.cost * ratio;
    
    module.dataset.module = JSON.stringify(moduleData);
    
    // Update display
    const macrosDiv = module.querySelector('.module-macros');
    macrosDiv.innerHTML = `
        <div class="macro-bar-container">
            <div class="macro-bar">
                ${createMacroBar(moduleData.protein, moduleData.carbs, moduleData.fat)}
            </div>
            <div class="macro-labels">
                <span class="macro-label protein">P: ${moduleData.protein.toFixed(1)}g</span>
                <span class="macro-label carbs">C: ${moduleData.carbs.toFixed(1)}g</span>
                <span class="macro-label fat">F: ${moduleData.fat.toFixed(1)}g</span>
            </div>
        </div>
        <div class="macro-stats">
            <span class="macro kcal">🔥 ${moduleData.kcal}</span>
            <span class="macro cost">💵 ${moduleData.cost.toFixed(2)}</span>
        </div>
    `;
    
    // Update totals
    updateMealTotals(module.closest('.meal'));
    updateDayTotals(module.closest('.day-column'));
}

// Update Module Unit
function updateModuleUnit(moduleId, newUnit) {
    const module = document.querySelector(`[data-module-id="${moduleId}"]`);
    if (!module) return;
    
    const moduleData = JSON.parse(module.dataset.module);
    const baseFood = moduleData.baseFood;
    const currentUnit = moduleData.unit;
    const currentQuantity = moduleData.quantity;
    
    // Convert quantity to new unit
    const newQuantity = convertUnit(currentQuantity, currentUnit, newUnit);
    const portionInput = module.querySelector('.module-portion-input');
    portionInput.value = newQuantity.toFixed(2);
    
    // Update step and min based on unit
    if (newUnit === 'cup') {
        portionInput.step = '0.25';
        portionInput.min = '0.25';
    } else {
        portionInput.step = '1';
        portionInput.min = '1';
    }
    portionInput.dataset.unit = newUnit;
    
    // Calculate new macros
    const baseQuantityInNewUnit = convertUnit(baseFood.baseQuantity, baseFood.baseUnit, newUnit);
    const ratio = newQuantity / baseQuantityInNewUnit;
    
    moduleData.unit = newUnit;
    moduleData.quantity = newQuantity;
    moduleData.kcal = Math.round(baseFood.kcal * ratio);
    moduleData.protein = baseFood.protein * ratio;
    moduleData.carbs = baseFood.carbs * ratio;
    moduleData.fat = baseFood.fat * ratio;
    moduleData.cost = baseFood.cost * ratio;
    
    module.dataset.module = JSON.stringify(moduleData);
    
    // Update display
    const macrosDiv = module.querySelector('.module-macros');
    macrosDiv.innerHTML = `
        <div class="macro-bar-container">
            <div class="macro-bar">
                ${createMacroBar(moduleData.protein, moduleData.carbs, moduleData.fat)}
            </div>
            <div class="macro-labels">
                <span class="macro-label protein">P: ${moduleData.protein.toFixed(1)}g</span>
                <span class="macro-label carbs">C: ${moduleData.carbs.toFixed(1)}g</span>
                <span class="macro-label fat">F: ${moduleData.fat.toFixed(1)}g</span>
            </div>
        </div>
        <div class="macro-stats">
            <span class="macro kcal">🔥 ${moduleData.kcal}</span>
            <span class="macro cost">💵 ${moduleData.cost.toFixed(2)}</span>
        </div>
    `;
    
    // Update totals
    updateMealTotals(module.closest('.meal'));
    updateDayTotals(module.closest('.day-column'));
}

// Toggle Module Favorite
function toggleModuleFavorite(moduleId) {
    const module = document.querySelector(`[data-module-id="${moduleId}"]`);
    if (!module) return;
    
    const moduleData = JSON.parse(module.dataset.module);
    const food = moduleData.baseFood;
    const btn = module.querySelector('.module-favorite-btn');
    
    if (window.favoritesManager) {
        const itemId = window.favoritesManager.generateItemId(food);
        
        if (window.favoritesManager.isFavorite(food)) {
            // Remove from favorites
            window.favoritesManager.removeFromFavorites(itemId);
            btn.innerHTML = '🤍';
            btn.classList.remove('favorited');
            btn.title = 'Add to favorites';
        } else {
            // Add to favorites
            window.favoritesManager.addToFavorites(food);
            btn.innerHTML = '❤️';
            btn.classList.add('favorited');
            btn.title = 'Remove from favorites';
        }
    }
}

// Remove Module
function toggleModuleExpand(moduleId) {
    const module = document.querySelector(`[data-module-id="${moduleId}"]`);
    if (!module) return;
    
    module.classList.toggle('expanded');
}

function removeModule(moduleId) {
    const module = document.querySelector(`[data-module-id="${moduleId}"]`);
    if (!module) return;
    
    const meal = module.closest('.meal');
    const dayColumn = module.closest('.day-column');
    
    module.style.animation = 'fadeOutScale 0.3s ease';
    setTimeout(() => {
        module.remove();
        updateMealTotals(meal);
        updateDayTotals(dayColumn);
    }, 300);
}

// Update Meal Totals
function updateMealTotals(meal) {
    if (!meal) return;
    
    // Get all modules - both in recipes and standalone
    const modules = meal.querySelectorAll('.food-module');
    const totalsDiv = meal.querySelector('.meal-totals');
    
    if (modules.length === 0) {
        totalsDiv.style.display = 'none';
        return;
    }
    
    let totals = {
        kcal: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        cost: 0
    };
    
    modules.forEach(module => {
        const moduleData = JSON.parse(module.dataset.module);
        totals.kcal += moduleData.kcal;
        totals.protein += moduleData.protein;
        totals.carbs += moduleData.carbs;
        totals.fat += moduleData.fat;
        totals.cost += moduleData.cost;
    });
    
    totalsDiv.style.display = 'block';
    totalsDiv.innerHTML = `
        <div class="meal-total-header">Meal Total</div>
        <div class="macro-bar-container">
            <div class="macro-bar">
                ${createMacroBar(totals.protein, totals.carbs, totals.fat)}
            </div>
            <div class="macro-labels">
                ${createMacroLabels(totals.protein, totals.carbs, totals.fat)}
            </div>
        </div>
        <div class="meal-total-stats">
            <span class="meal-total-stat">${totals.kcal} kcal</span>
            <span class="meal-total-stat">$${totals.cost.toFixed(2)}</span>
        </div>
    `;
}

// Update Day Totals
function updateDayTotals(dayColumn) {
    if (!dayColumn) return;
    
    const meals = dayColumn.querySelectorAll('.meal');
    let dayTotals = {
        kcal: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        cost: 0
    };
    
    meals.forEach(meal => {
        const modules = meal.querySelectorAll('.food-module');
        modules.forEach(module => {
            const moduleData = JSON.parse(module.dataset.module);
            dayTotals.kcal += moduleData.kcal;
            dayTotals.protein += moduleData.protein;
            dayTotals.carbs += moduleData.carbs;
            dayTotals.fat += moduleData.fat;
            dayTotals.cost += moduleData.cost;
        });
    });
    
    const totalsDiv = dayColumn.querySelector('.day-totals');
    const total = dayTotals.protein + dayTotals.carbs + dayTotals.fat;
    
    // Create a description of the macro distribution
    let macroDescription = '';
    if (total > 0) {
        const proteinPercent = Math.round((dayTotals.protein / total) * 100);
        const carbsPercent = Math.round((dayTotals.carbs / total) * 100);
        const fatPercent = Math.round((dayTotals.fat / total) * 100);
        
        // Determine the dominant macro
        const macros = [
            { name: 'Protein', percent: proteinPercent, emoji: '💪' },
            { name: 'Carbs', percent: carbsPercent, emoji: '🍞' },
            { name: 'Fat', percent: fatPercent, emoji: '🥑' }
        ];
        macros.sort((a, b) => b.percent - a.percent);
        
        // Create description based on distribution
        if (macros[0].percent > 50) {
            macroDescription = `<div class="macro-description">${macros[0].emoji} ${macros[0].name}-focused day (${macros[0].percent}%)</div>`;
        } else if (Math.abs(proteinPercent - carbsPercent) < 10 && Math.abs(carbsPercent - fatPercent) < 10) {
            macroDescription = `<div class="macro-description">⚖️ Balanced macro distribution</div>`;
        } else {
            macroDescription = `<div class="macro-description">${macros[0].emoji} ${macros[0].name}-led (${macros[0].percent}%) with ${macros[1].name} (${macros[1].percent}%)</div>`;
        }
    }
    
    totalsDiv.innerHTML = `
        <div class="day-totals-title">Day Total</div>
        ${macroDescription}
        <div class="macro-bar-container">
            <div class="macro-bar day-macro-bar">
                ${createMacroBar(dayTotals.protein, dayTotals.carbs, dayTotals.fat)}
            </div>
            <div class="macro-labels">
                ${createMacroLabels(dayTotals.protein, dayTotals.carbs, dayTotals.fat)}
            </div>
        </div>
        <div class="day-total-stats">
            <div class="day-total-item">
                <span class="day-total-label">Calories</span>
                <span class="day-total-value">${dayTotals.kcal} kcal</span>
            </div>
            <div class="day-total-item">
                <span class="day-total-label">Cost</span>
                <span class="day-total-value">$${dayTotals.cost.toFixed(2)}</span>
            </div>
        </div>
    `;
}

// Meal Management
function addMeal(day) {
    const dayColumn = document.querySelector(`[data-day="${day}"]`);
    if (!dayColumn) return;
    
    const mealsContainer = dayColumn.querySelector('.meals-container');
    const mealName = prompt('Enter meal name:', 'Snack');
    if (!mealName) return;
    
    const time = prompt('Enter meal time:', '15:00');
    if (!time) return;
    
    const mealHTML = createMealHTML(day, mealName, time);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = mealHTML;
    const newMeal = tempDiv.firstElementChild;
    newMeal.classList.add('animate-in');
    
    mealsContainer.appendChild(newMeal);
}

// Handle meal name click for editing
function handleMealNameClick(event) {
    const element = event.target;
    element.dataset.originalText = element.textContent;
    // Select only the text, not the emoji
    const text = element.textContent;
    const emojiMatch = text.match(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}]/u);
    if (emojiMatch) {
        const range = document.createRange();
        const sel = window.getSelection();
        range.setStart(element.childNodes[0], emojiMatch[0].length + 1);
        range.setEnd(element.childNodes[0], text.length);
        sel.removeAllRanges();
        sel.addRange(range);
    }
}

function handleMealNameBlur(event, mealId) {
    const element = event.target;
    const text = element.textContent.trim();
    // Extract emoji and name
    const emojiMatch = text.match(/^[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}]/u);
    const emoji = emojiMatch ? emojiMatch[0] : '';
    const mealName = text.replace(emoji, '').trim();
    
    if (!mealName) {
        element.textContent = element.dataset.originalText;
        return;
    }
    
    // Reapply the correct emoji based on the new meal name
    const getMealEmoji = (name) => {
        const mealLower = name.toLowerCase();
        if (mealLower.includes('breakfast')) return '🍳';
        if (mealLower.includes('lunch')) return '☀️';
        if (mealLower.includes('dinner')) return '🌙';
        if (mealLower.includes('morning') && mealLower.includes('snack')) return '🥐';
        if (mealLower.includes('afternoon') && mealLower.includes('snack')) return '🍎';
        if (mealLower.includes('evening') && mealLower.includes('snack')) return '🍪';
        if (mealLower.includes('snack')) return '🥨';
        return '🍽️';
    };
    
    element.textContent = `${getMealEmoji(mealName)} ${mealName}`;
}

function handleMealNameKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        event.target.blur();
    }
}

// Handle meal time editing
function handleMealTimeClick(event) {
    const element = event.target;
    element.dataset.originalText = element.textContent;
    // Select only the time, not the emoji
    const text = element.textContent;
    const range = document.createRange();
    const sel = window.getSelection();
    range.setStart(element.childNodes[0], 2); // Skip "⏰ "
    range.setEnd(element.childNodes[0], text.length);
    sel.removeAllRanges();
    sel.addRange(range);
}

function handleMealTimeBlur(event, mealId) {
    const element = event.target;
    const text = element.textContent.trim();
    const time = text.replace('⏰', '').trim();
    
    if (!time) {
        element.textContent = element.dataset.originalText;
        return;
    }
    
    element.textContent = `⏰ ${time}`;
}

function handleMealTimeKeydown(event) {
    if (event.key === 'Enter') {
        event.preventDefault();
        event.target.blur();
    }
}

function toggleMealMinimize(mealId) {
    const meal = document.querySelector(`[data-meal-id="${mealId}"]`);
    if (!meal) return;
    
    const dropZone = meal.querySelector('.meal-drop-zone');
    const totals = meal.querySelector('.meal-totals');
    const minimizeBtn = meal.querySelector('.minimize-btn');
    
    if (meal.classList.contains('minimized')) {
        // Expand the meal
        meal.classList.remove('minimized');
        dropZone.style.display = 'block';
        if (totals) totals.style.display = 'block';
        minimizeBtn.title = 'Minimize';
    } else {
        // Minimize the meal
        meal.classList.add('minimized');
        dropZone.style.display = 'none';
        if (totals) totals.style.display = 'none';
        minimizeBtn.title = 'Expand';
    }
}

function deleteMeal(mealId) {
    const meal = document.querySelector(`[data-meal-id="${mealId}"]`);
    if (!meal) return;
    
    if (confirm('Are you sure you want to delete this meal?')) {
        const dayColumn = meal.closest('.day-column');
        meal.style.animation = 'fadeOutScale 0.3s ease';
        setTimeout(() => {
            meal.remove();
            updateDayTotals(dayColumn);
        }, 300);
    }
}

// Add New Day
function addNewDay() {
    const dayName = prompt('Enter day name:', 'Saturday');
    if (!dayName) return;
    
    createDayColumn(dayName);
}

// Clear Board
function clearBoard() {
    if (confirm('Are you sure you want to clear all category columns? Day columns will remain.')) {
        document.querySelectorAll('.category-column').forEach(column => {
            column.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => column.remove(), 300);
        });
        activeColumns = [];
    }
}

// Recipe handlers
function handleRecipeDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    if (draggedData?.type === 'food' || draggedData?.type === 'module') {
        e.currentTarget.classList.add('drag-over');
        e.dataTransfer.dropEffect = draggedData.type === 'food' ? 'copy' : 'move';
    }
}

function handleRecipeDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('drag-over');
    
    const recipeContainer = e.currentTarget.closest('.recipe-container');
    const recipesModulesContainer = recipeContainer.querySelector('.recipe-modules-container');
    
    if (draggedData?.type === 'food') {
        // Add new food module to recipe
        const module = createFoodModule(draggedData, true);
        recipesModulesContainer.appendChild(module);
        updateRecipeTotals(recipeContainer);
        updateMealTotals(recipeContainer.closest('.meal'));
        updateDayTotals(recipeContainer.closest('.day-column'));
    } else if (draggedData?.type === 'module') {
        // Move module into recipe
        recipesModulesContainer.appendChild(draggedData.moduleElement);
        updateRecipeTotals(recipeContainer);
        updateMealTotals(recipeContainer.closest('.meal'));
        updateDayTotals(recipeContainer.closest('.day-column'));
    }
}

function updateRecipeTotals(recipeContainer) {
    const modules = recipeContainer.querySelectorAll('.food-module');
    let totals = { kcal: 0, protein: 0, carbs: 0, fat: 0 };
    
    modules.forEach(module => {
        const moduleData = JSON.parse(module.dataset.module);
        totals.kcal += moduleData.kcal;
        totals.protein += moduleData.protein;
        totals.carbs += moduleData.carbs;
        totals.fat += moduleData.fat;
    });
    
    const totalsDiv = recipeContainer.querySelector('.recipe-totals');
    totalsDiv.innerHTML = `
        <span class="recipe-total-calories">${totals.kcal} kcal</span>
        <span class="recipe-total-macros">${totals.protein.toFixed(1)}g P • ${totals.carbs.toFixed(1)}g C • ${totals.fat.toFixed(1)}g F</span>
    `;
}

function toggleRecipeCollapse(recipeId) {
    const recipe = document.querySelector(`[data-recipe-id="${recipeId}"]`);
    if (!recipe) return;
    
    const modulesContainer = recipe.querySelector('.recipe-modules-container');
    const chevron = recipe.querySelector('.chevron');
    
    if (recipe.classList.contains('collapsed')) {
        recipe.classList.remove('collapsed');
        modulesContainer.style.display = 'block';
        chevron.textContent = '▼';
    } else {
        recipe.classList.add('collapsed');
        modulesContainer.style.display = 'none';
        chevron.textContent = '▶';
    }
}

function removeRecipe(recipeId) {
    const recipe = document.querySelector(`[data-recipe-id="${recipeId}"]`);
    if (!recipe) return;
    
    const meal = recipe.closest('.meal');
    const dayColumn = recipe.closest('.day-column');
    
    recipe.style.animation = 'fadeOutScale 0.3s ease';
    setTimeout(() => {
        recipe.remove();
        updateMealTotals(meal);
        updateDayTotals(dayColumn);
    }, 300);
}

// Expose functions to global scope for inline event handlers
window.handleMealDragOver = handleMealDragOver;
window.handleMealDragLeave = handleMealDragLeave;
window.handleMealDrop = handleMealDrop;
window.removeCategoryColumn = removeCategoryColumn;
window.removeModule = removeModule;
window.toggleModuleFavorite = toggleModuleFavorite;
window.addMeal = addMeal;
window.deleteMeal = deleteMeal;
window.toggleMealMinimize = toggleMealMinimize;
window.handleMealNameClick = handleMealNameClick;
window.handleMealNameBlur = handleMealNameBlur;
window.handleMealNameKeydown = handleMealNameKeydown;
window.handleMealTimeClick = handleMealTimeClick;
window.handleMealTimeBlur = handleMealTimeBlur;
window.handleMealTimeKeydown = handleMealTimeKeydown;
window.handlePillClick = handlePillClick;
window.addNewDay = addNewDay;
window.clearBoard = clearBoard;
window.filterFoodItems = filterFoodItems;
window.filterByMacro = filterByMacro;
window.showPopularItems = showPopularItems;
window.hidePopularItems = hidePopularItems;
window.createCategoryColumn = createCategoryColumn;
window.getAvailableUnits = getAvailableUnits;
window.createMacroBar = createMacroBar;
window.createMacroLabels = createMacroLabels;

// Expose food database and functions for AI assistant
window.foodDatabase = foodDatabase;
window.createFoodModule = createFoodModule;
window.updateMealTotals = updateMealTotals;
window.updateDayTotals = updateDayTotals;
window.createRecipeContainer = createRecipeContainer;
window.updateRecipeTotals = updateRecipeTotals;
window.handleRecipeDragOver = handleRecipeDragOver;
window.handleRecipeDrop = handleRecipeDrop;
window.toggleRecipeCollapse = toggleRecipeCollapse;
window.removeRecipe = removeRecipe;
window.toggleModuleExpand = toggleModuleExpand;

// Animation styles
const animationStyles = document.createElement('style');
animationStyles.textContent = `
    @keyframes fadeOut {
        to {
            opacity: 0;
            transform: scale(0.9);
        }
    }
    
    @keyframes fadeOutScale {
        to {
            opacity: 0;
            transform: scale(0.8);
        }
    }
`;
document.head.appendChild(animationStyles);