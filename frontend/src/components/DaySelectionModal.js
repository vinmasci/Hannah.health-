// DaySelectionModal - Modal for selecting and adding multiple days to the meal plan
// Extracted from DayMealManager.js to reduce file size

import DragDropManager from '../services/DragDropManager.js';

export class DaySelectionModal {
    static selectedDays = new Set();
    
    // Show modal for selecting days with dates
    static show() {
        // Remove any existing modal
        const existingModal = document.querySelector('.day-selection-modal');
        if (existingModal) existingModal.remove();
        
        // Create modal
        const modal = document.createElement('div');
        modal.className = 'day-selection-modal';
        
        // Get the current week's days (Monday to Sunday)
        const today = new Date();
        const todayIndex = today.getDay();
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        
        // Calculate Monday of this week
        const mondayDate = new Date(today);
        const daysSinceMonday = todayIndex === 0 ? 6 : todayIndex - 1;
        mondayDate.setDate(today.getDate() - daysSinceMonday);
        
        // Check which days already exist to determine counters
        const existingDayElements = [...document.querySelectorAll('.day-column:not(.add-day-placeholder)')];
        
        let dayOptions = '';
        const weekDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        
        for (let i = 0; i < 7; i++) {
            const date = new Date(mondayDate);
            date.setDate(mondayDate.getDate() + i);
            
            const dayName = weekDays[i];
            const dayNum = date.getDate();
            const monthName = months[date.getMonth()];
            const dateStr = `${dayNum} ${monthName.toUpperCase()}`;
            
            // Count how many instances of this day already exist
            const existingCount = existingDayElements.filter(col => {
                const colDay = col.dataset.day;
                return colDay === dayName || colDay.startsWith(`${dayName} `);
            }).length;
            
            // Determine the name for the new instance
            let finalName = dayName;
            let displayName = dayName;
            let instanceLabel = '';
            
            if (existingCount > 0) {
                // Find the next available number
                let counter = existingCount + 1;
                while (existingDayElements.some(col => col.dataset.day === `${dayName} ${counter}`)) {
                    counter++;
                }
                finalName = counter === 1 ? dayName : `${dayName} ${counter}`;
                instanceLabel = `<span class="instance-label">Instance #${counter}</span>`;
            }
            
            const isToday = date.toDateString() === today.toDateString();
            
            dayOptions += `
                <div class="day-option ${isToday ? 'is-today' : ''}" 
                     data-day-name="${finalName}" 
                     data-date="${dateStr}">
                    <input type="checkbox" 
                           class="day-checkbox" 
                           id="day-${i}" 
                           onchange="DaySelectionModal.toggleDaySelection('${finalName}', '${dateStr}')">
                    <label for="day-${i}" class="day-option-content">
                        <div class="day-option-header">
                            <span class="day-option-name">${displayName}</span>
                            ${isToday ? '<span class="today-badge">TODAY</span>' : ''}
                        </div>
                        <div class="day-option-date">${dateStr}</div>
                        ${instanceLabel}
                        ${existingCount > 0 ? `<div class="existing-count">${existingCount} already added</div>` : ''}
                    </label>
                </div>
            `;
        }
        
        modal.innerHTML = `
            <div class="modal-overlay" onclick="DaySelectionModal.close()"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <div class="modal-header-gradient">
                        <h3>📅 Add Days to Your Meal Plan</h3>
                        <button class="modal-close" onclick="DaySelectionModal.close()">×</button>
                    </div>
                </div>
                <div class="modal-body">
                    <div class="modal-info">
                        <p>Select days to add to your meal plan. Perfect for:</p>
                        <ul>
                            <li>Planning meals for multiple people (kids, partner, guests)</li>
                            <li>Creating separate meal plans on the same days</li>
                            <li>Planning for visitors staying specific days</li>
                        </ul>
                    </div>
                    <div class="modal-actions">
                        <button class="btn-select-all" onclick="DaySelectionModal.selectAllDays()">
                            Select All 7 Days
                        </button>
                        <button class="btn-clear-all" onclick="DaySelectionModal.clearAllDays()">
                            Clear Selection
                        </button>
                    </div>
                    <div class="day-options-grid">
                        ${dayOptions}
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-cancel" onclick="DaySelectionModal.close()">Cancel</button>
                    <button class="btn-add-days" onclick="DaySelectionModal.addSelectedDays()">
                        <span class="btn-text">Add Selected Days</span>
                        <span class="selected-count">(0)</span>
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Initialize selected days tracking
        this.selectedDays = new Set();
        
        // Add modal styles if not already present
        this.addModalStyles();
    }
    
    // Toggle day selection
    static toggleDaySelection(dayName, dateStr) {
        const key = `${dayName}|${dateStr}`;
        
        if (this.selectedDays.has(key)) {
            this.selectedDays.delete(key);
        } else {
            this.selectedDays.add(key);
        }
        
        // Update count display
        const countElement = document.querySelector('.selected-count');
        if (countElement) {
            countElement.textContent = `(${this.selectedDays.size})`;
        }
        
        // Enable/disable add button
        const addButton = document.querySelector('.btn-add-days');
        if (addButton) {
            addButton.disabled = this.selectedDays.size === 0;
        }
    }
    
    // Select all available days
    static selectAllDays() {
        const checkboxes = document.querySelectorAll('.day-checkbox:not(:disabled)');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
            const dayOption = checkbox.closest('.day-option');
            const dayName = dayOption.dataset.dayName;
            const dateStr = dayOption.dataset.date;
            const key = `${dayName}|${dateStr}`;
            this.selectedDays.add(key);
        });
        
        // Update count
        const countElement = document.querySelector('.selected-count');
        if (countElement) {
            countElement.textContent = `(${this.selectedDays.size})`;
        }
        
        // Enable add button
        const addButton = document.querySelector('.btn-add-days');
        if (addButton) {
            addButton.disabled = false;
        }
    }
    
    // Clear all selections
    static clearAllDays() {
        const checkboxes = document.querySelectorAll('.day-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        this.selectedDays.clear();
        
        // Update count
        const countElement = document.querySelector('.selected-count');
        if (countElement) {
            countElement.textContent = '(0)';
        }
        
        // Disable add button
        const addButton = document.querySelector('.btn-add-days');
        if (addButton) {
            addButton.disabled = true;
        }
    }
    
    // Add all selected days
    static addSelectedDays() {
        if (this.selectedDays.size === 0) return;
        
        const placeholder = document.querySelector('.add-day-placeholder');
        const mainBoard = document.querySelector('.main-board');
        
        // Import DayMealManager here to avoid circular dependency
        import('./DayMealManager.js').then(module => {
            const DayMealManager = module.default;
            
            // Create columns for each selected day
            this.selectedDays.forEach(key => {
                const [dayName, dateStr] = key.split('|');
                
                const column = document.createElement('div');
                column.className = 'day-column animate-in';
                column.dataset.day = dayName;
                
                column.innerHTML = `
                    <div class="day-header">
                        <div class="day-header-main">
                            <div class="day-info">
                                <span class="day-name">${dayName} <span class="date-part">${dateStr}</span></span>
                            </div>
                            <div class="day-controls">
                                <button class="btn-minimize-day" onclick="toggleDayMinimize(event)" title="Minimize">
                                    −
                                </button>
                                <button class="color-picker-btn" onclick="DayColorPicker.show('${dayName}')" title="Change color">
                                    <span class="color-circle"></span>
                                </button>
                                <button class="add-meal-btn" onclick="window.dayMealManager.addMeal('${dayName}')" title="Add meal">
                                    + Meal
                                </button>
                            </div>
                        </div>
                    </div>
                    <div class="day-content">
                        <div class="meals-container">
                            ${DayMealManager.createMealHTML(dayName, 'Breakfast', '8:00 AM')}
                            ${DayMealManager.createMealHTML(dayName, 'Lunch', '12:00 PM')}
                            ${DayMealManager.createMealHTML(dayName, 'Dinner', '6:00 PM')}
                        </div>
                        <div class="day-totals">
                            <div class="totals-header">Day Total</div>
                            <div class="totals-content">
                                <span class="total-calories">0 kcal</span>
                                <span class="total-cost">$0.00</span>
                            </div>
                            <div class="macro-bar"></div>
                            <div class="total-macros">0g P • 0g C • 0g F</div>
                        </div>
                    </div>
                `;
                
                // Insert before placeholder
                mainBoard.insertBefore(column, placeholder);
                
                // Load saved color
                DayMealManager.loadDayColor(dayName);
                
                // Setup drag handlers for meals
                column.querySelectorAll('.meal').forEach(meal => {
                    if (typeof DragDropManager !== 'undefined') {
                        DragDropManager.attachHandlers(meal, 'meal');
                    }
                });
            });
            
            // Make sure placeholder stays at the end
            mainBoard.appendChild(placeholder);
        });
        
        // Close modal
        this.close();
    }
    
    // Close the modal
    static close() {
        const modal = document.querySelector('.day-selection-modal');
        if (modal) modal.remove();
    }
    
    // Add modal styles
    static addModalStyles() {
        if (!document.getElementById('day-modal-styles')) {
            const style = document.createElement('style');
            style.id = 'day-modal-styles';
            style.textContent = `
                .day-selection-modal {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    z-index: 10000;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    animation: fadeIn 0.3s ease;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                
                .modal-overlay {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.6);
                    backdrop-filter: blur(4px);
                }
                
                .modal-content {
                    position: relative;
                    background: white;
                    border-radius: 16px;
                    width: 90%;
                    max-width: 700px;
                    max-height: 85vh;
                    overflow: hidden;
                    box-shadow: 0 24px 64px rgba(0, 0, 0, 0.15);
                    animation: slideUp 0.3s ease;
                }
                
                @keyframes slideUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                
                .modal-header {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 0;
                }
                
                .modal-header-gradient {
                    padding: 24px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .modal-header h3 {
                    margin: 0;
                    font-size: 24px;
                    font-weight: 600;
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .modal-close {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    font-size: 24px;
                    color: white;
                    cursor: pointer;
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.2s ease;
                }
                
                .modal-close:hover {
                    background: rgba(255, 255, 255, 0.3);
                    transform: rotate(90deg);
                }
                
                .modal-body {
                    padding: 24px;
                    overflow-y: auto;
                    max-height: calc(85vh - 200px);
                }
                
                .modal-info {
                    background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
                    border: 1px solid #e0e8ff;
                    border-radius: 8px;
                    padding: 16px;
                    margin-bottom: 20px;
                }
                
                .modal-info p {
                    margin: 0 0 8px 0;
                    color: #555;
                    font-size: 14px;
                    font-weight: 500;
                }
                
                .modal-info ul {
                    margin: 0;
                    padding-left: 20px;
                    color: #666;
                    font-size: 13px;
                }
                
                .modal-info li {
                    margin: 4px 0;
                }
                
                .modal-actions {
                    display: flex;
                    gap: 12px;
                    margin-bottom: 20px;
                }
                
                .btn-select-all, .btn-clear-all {
                    padding: 8px 16px;
                    border: 2px solid #e0e0e0;
                    background: white;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s ease;
                }
                
                .btn-select-all:hover, .btn-clear-all:hover {
                    border-color: #667eea;
                    background: #f8f9ff;
                    transform: translateY(-1px);
                }
                
                .day-options-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
                    gap: 16px;
                }
                
                .day-option {
                    position: relative;
                    border: 2px solid #e0e0e0;
                    border-radius: 12px;
                    overflow: hidden;
                    transition: all 0.2s ease;
                    background: white;
                }
                
                .day-option.is-today {
                    border-color: #ffd700;
                    background: linear-gradient(135deg, #fffef7 0%, #fff9e6 100%);
                }
                
                .day-checkbox {
                    position: absolute;
                    opacity: 0;
                    cursor: pointer;
                }
                
                .day-option-content {
                    display: block;
                    padding: 20px;
                    cursor: pointer;
                    text-align: center;
                    position: relative;
                }
                
                .day-checkbox:checked + .day-option-content {
                    background: linear-gradient(135deg, #f0f4ff 0%, #e8efff 100%);
                }
                
                .day-checkbox:checked + .day-option-content::before {
                    content: '✓';
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    width: 24px;
                    height: 24px;
                    background: #667eea;
                    color: white;
                    border-radius: 50%;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-weight: bold;
                    font-size: 14px;
                }
                
                .day-option:hover:not(.day-exists) {
                    border-color: #667eea;
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(102, 126, 234, 0.15);
                }
                
                .day-option-header {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 4px;
                }
                
                .day-option-name {
                    font-weight: 600;
                    font-size: 18px;
                    color: #333;
                }
                
                .today-badge {
                    background: linear-gradient(135deg, #ffd700 0%, #ffed4e 100%);
                    color: #333;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 10px;
                    font-weight: 600;
                    text-transform: uppercase;
                    letter-spacing: 0.5px;
                }
                
                .day-option-date {
                    font-size: 14px;
                    color: #666;
                    margin-top: 8px;
                    font-weight: 500;
                }
                
                .instance-label {
                    display: inline-block;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 6px;
                    font-size: 11px;
                    font-weight: 600;
                    margin-top: 4px;
                }
                
                .existing-count {
                    margin-top: 4px;
                    color: #999;
                    font-size: 11px;
                    font-style: italic;
                }
                
                .modal-footer {
                    padding: 20px 24px;
                    background: #f8f9fa;
                    border-top: 1px solid #e0e0e0;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                
                .btn-cancel, .btn-add-days {
                    padding: 12px 24px;
                    border-radius: 8px;
                    font-size: 15px;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    border: none;
                }
                
                .btn-cancel {
                    background: white;
                    color: #666;
                    border: 2px solid #e0e0e0;
                }
                
                .btn-cancel:hover {
                    background: #f5f5f5;
                    border-color: #ccc;
                }
                
                .btn-add-days {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
                }
                
                .btn-add-days:hover {
                    transform: translateY(-1px);
                    box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
                }
                
                .btn-add-days:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                    transform: none;
                }
                
                .selected-count {
                    background: rgba(255, 255, 255, 0.2);
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 13px;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Make available globally for onclick handlers
window.DaySelectionModal = DaySelectionModal;

export default DaySelectionModal;