// DragDropManager - Handles all drag and drop operations for the meal planner
// Extracted from app.js to reduce file size and improve organization

import eventBus from './EventBus.js';

export class DragDropManager {
    static draggedElement = null;
    static draggedData = null;
    
    // Initialize drag drop handlers
    static init(mainBoard) {
        this.mainBoard = mainBoard;
    }
    
    // Pill drag handlers (category pills)
    static handlePillDragStart(e) {
        DragDropManager.draggedElement = e.target;
        DragDropManager.draggedData = {
            type: 'category',
            category: e.target.dataset.category
        };
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'copy';
    }
    
    static handlePillDragEnd(e) {
        e.target.classList.remove('dragging');
        DragDropManager.clearDropIndicators();
        DragDropManager.draggedElement = null;
        DragDropManager.draggedData = null;
    }
    
    // Board drag over and drop (for pills and columns)
    static handleBoardDragOver(e) {
        if ((DragDropManager.draggedData?.type === 'category' && !window.activeColumns.includes(DragDropManager.draggedData.category)) ||
            DragDropManager.draggedData?.type === 'column') {
            e.preventDefault();
            e.dataTransfer.dropEffect = DragDropManager.draggedData.type === 'category' ? 'copy' : 'move';
            
            // Show drop indicator between columns
            const afterElement = DragDropManager.getDragAfterColumn(DragDropManager.mainBoard, e.clientX);
            DragDropManager.clearDropIndicators();
            
            if (afterElement) {
                afterElement.classList.add('drop-indicator-left');
            } else {
                const columns = DragDropManager.mainBoard.querySelectorAll('.category-column, .day-column');
                if (columns.length > 0) {
                    columns[columns.length - 1].classList.add('drop-indicator-right');
                }
            }
        }
    }
    
    static handleBoardDrop(e) {
        e.preventDefault();
        DragDropManager.clearDropIndicators();
        
        if (DragDropManager.draggedData?.type === 'category' && !window.activeColumns.includes(DragDropManager.draggedData.category)) {
            // Get all columns to check if we're dragging between them
            const columns = DragDropManager.mainBoard.querySelectorAll('.category-column, .day-column, .ai-assistant-column');
            
            if (columns.length > 0 && e.clientX > 0) {
                // User is dragging to a specific position between columns
                const afterElement = DragDropManager.getDragAfterColumn(DragDropManager.mainBoard, e.clientX);
                window.createCategoryColumn(DragDropManager.draggedData.category, afterElement);
            } else {
                // No columns or dropping without specific position - use smart placement
                let targetDay = window.lastActiveDay;
                
                // If no active day, find first non-minimized day column
                if (!targetDay) {
                    targetDay = document.querySelector('.day-column:not(.minimized)');
                }
                
                // If still no target, just use first day column
                if (!targetDay) {
                    targetDay = document.querySelector('.day-column');
                }
                
                if (targetDay) {
                    // Insert before (to the left of) the target day column
                    window.createCategoryColumn(DragDropManager.draggedData.category, targetDay);
                } else {
                    // No columns at all, just create it
                    window.createCategoryColumn(DragDropManager.draggedData.category);
                }
            }
        } else if (DragDropManager.draggedData?.type === 'column') {
            const afterElement = DragDropManager.getDragAfterColumn(DragDropManager.mainBoard, e.clientX);
            if (afterElement !== DragDropManager.draggedElement) {
                DragDropManager.mainBoard.insertBefore(DragDropManager.draggedElement, afterElement);
            }
        }
        
        DragDropManager.draggedElement = null;
        DragDropManager.draggedData = null;
    }
    
    // Clear drop indicators
    static clearDropIndicators() {
        document.querySelectorAll('.drop-indicator-left, .drop-indicator-right').forEach(el => {
            el.classList.remove('drop-indicator-left', 'drop-indicator-right');
        });
    }
    
    // Get the column after which to drop
    static getDragAfterColumn(container, x) {
        const draggableColumns = [...container.querySelectorAll('.category-column:not(.dragging), .day-column:not(.dragging)')];
        
        return draggableColumns.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = x - box.left - box.width / 2;
            
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }
    
    // Food item drag handlers
    static handleFoodDragStart(e) {
        const foodItem = e.target.closest('.food-item');
        if (!foodItem) return;
        
        DragDropManager.draggedElement = foodItem;
        DragDropManager.draggedData = {
            type: 'food',
            food: JSON.parse(foodItem.dataset.food),
            category: foodItem.dataset.category
        };
        
        foodItem.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'copy';
    }
    
    static handleFoodDragEnd(e) {
        const foodItem = e.target.closest('.food-item');
        if (!foodItem) return;
        
        foodItem.classList.remove('dragging');
        DragDropManager.clearDropIndicators();
        DragDropManager.draggedElement = null;
        DragDropManager.draggedData = null;
    }
    
    // Module drag handlers
    static handleModuleDragStart(e) {
        const module = e.target.closest('.food-module');
        if (!module) return;
        
        DragDropManager.draggedElement = module;
        DragDropManager.draggedData = {
            type: 'module',
            moduleId: module.dataset.moduleId
        };
        
        module.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }
    
    static handleModuleDragEnd(e) {
        const module = e.target.closest('.food-module');
        if (!module) return;
        
        module.classList.remove('dragging');
        DragDropManager.clearDropIndicators();
        DragDropManager.draggedElement = null;
        DragDropManager.draggedData = null;
    }
    
    // Column drag handlers
    static handleColumnDragStart(e) {
        const column = e.target.closest('.category-column');
        if (!column || e.target.closest('.food-item') || e.target.closest('.ai-search-input') || 
            e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON') {
            return;
        }
        
        DragDropManager.draggedElement = column;
        DragDropManager.draggedData = {
            type: 'column',
            category: column.dataset.category
        };
        
        column.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
    }
    
    static handleColumnDragEnd(e) {
        const column = e.target.closest('.category-column');
        if (!column) return;
        
        column.classList.remove('dragging');
        DragDropManager.clearDropIndicators();
        DragDropManager.draggedElement = null;
        DragDropManager.draggedData = null;
    }
    
    static handleColumnDragOver(e) {
        // Only handle if we're dragging a column
        if (DragDropManager.draggedData?.type !== 'column') return;
        
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const afterElement = DragDropManager.getDragAfterColumn(DragDropManager.mainBoard, e.clientX);
        DragDropManager.clearDropIndicators();
        
        if (afterElement && afterElement !== DragDropManager.draggedElement) {
            afterElement.classList.add('drop-indicator-left');
        } else if (!afterElement) {
            const columns = DragDropManager.mainBoard.querySelectorAll('.category-column, .day-column');
            if (columns.length > 0 && columns[columns.length - 1] !== DragDropManager.draggedElement) {
                columns[columns.length - 1].classList.add('drop-indicator-right');
            }
        }
    }
    
    static handleColumnDrop(e) {
        e.preventDefault();
        DragDropManager.clearDropIndicators();
        
        if (DragDropManager.draggedData?.type === 'column') {
            const afterElement = DragDropManager.getDragAfterColumn(DragDropManager.mainBoard, e.clientX);
            if (afterElement !== DragDropManager.draggedElement) {
                DragDropManager.mainBoard.insertBefore(DragDropManager.draggedElement, afterElement);
            }
        } else {
            // Handle drops within the column (delegation to meal drop)
            const meal = e.target.closest('.meal');
            if (meal && (DragDropManager.draggedData?.type === 'food' || DragDropManager.draggedData?.type === 'module')) {
                window.handleMealDrop.call(meal, e);
            }
        }
        
        DragDropManager.draggedElement = null;
        DragDropManager.draggedData = null;
    }
    
    // Category Items Drop Handlers
    static handleCategoryItemsDragOver(e) {
        // Since AI foods are now regular food items, we don't need special handling
        e.preventDefault();
    }
    
    static handleCategoryItemsDrop(e) {
        e.preventDefault();
        // Foods dropped back into category column are just ignored
        // They remain in their original position
    }
    
    // Meal drag handlers
    static handleMealDragOver(e) {
        if (DragDropManager.draggedData?.type === 'food' || DragDropManager.draggedData?.type === 'module') {
            e.preventDefault();
            e.dataTransfer.dropEffect = DragDropManager.draggedData.type === 'food' ? 'copy' : 'move';
            e.currentTarget.classList.add('drag-over');
            
            // Show drop indicator for module reordering
            if (DragDropManager.draggedData.type === 'module') {
                const modulesContainer = e.currentTarget.querySelector('.food-modules-container');
                if (modulesContainer) {
                    const afterElement = DragDropManager.getDragAfterElement(modulesContainer, e.clientY);
                    DragDropManager.clearDropIndicators();
                    if (afterElement) {
                        afterElement.classList.add('drop-indicator-top');
                    }
                }
            }
        }
    }
    
    static handleMealDragLeave(e) {
        e.currentTarget.classList.remove('drag-over');
    }
    
    static handleMealDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        DragDropManager.clearDropIndicators();
        
        const meal = e.currentTarget;
        const modulesContainer = meal.querySelector('.food-modules-container');
        
        // Update last active day
        const dayColumn = meal.closest('.day-column');
        if (dayColumn) {
            window.lastActiveDay = dayColumn;
        }
        
        if (DragDropManager.draggedData?.type === 'food') {
            // Emit event to create food module
            eventBus.emit('food-module:create', { 
                dragData: DragDropManager.draggedData,
                container: modulesContainer,
                meal: meal
            });
        } else if (DragDropManager.draggedData?.type === 'module') {
            // Move existing module
            const module = document.querySelector(`[data-module-id="${DragDropManager.draggedData.moduleId}"]`);
            if (module) {
                const afterElement = DragDropManager.getDragAfterElement(modulesContainer, e.clientY);
                
                const oldMeal = module.closest('.meal');
                const oldDay = oldMeal?.closest('.day-column');
                
                if (afterElement) {
                    modulesContainer.insertBefore(module, afterElement);
                } else {
                    modulesContainer.appendChild(module);
                }
                
                // Emit events to update totals
                if (oldMeal) eventBus.emit('meal:update-totals', { meal: oldMeal });
                if (oldDay) eventBus.emit('day:update-totals', { dayColumn: oldDay });
                eventBus.emit('meal:update-totals', { meal });
                eventBus.emit('day:update-totals', { dayColumn: meal.closest('.day-column') });
            }
        }
    }
    
    // Get element after which to drop (for vertical reordering)
    static getDragAfterElement(container, y) {
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
    
    // Recipe drag handlers
    static handleRecipeDragOver(e) {
        e.preventDefault();
        if (DragDropManager.draggedData?.type === 'food') {
            e.dataTransfer.dropEffect = 'copy';
            e.currentTarget.classList.add('drag-over');
        }
    }
    
    static handleRecipeDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('drag-over');
        
        if (DragDropManager.draggedData?.type === 'food') {
            const recipe = e.currentTarget;
            const modulesContainer = recipe.querySelector('.recipe-modules');
            
            const module = window.createFoodModule(DragDropManager.draggedData, true);
            if (module) {
                modulesContainer.appendChild(module);
                window.updateRecipeTotals(recipe);
                
                // Update meal totals if recipe is in a meal
                const meal = recipe.closest('.meal');
                if (meal) {
                    window.updateMealTotals(meal);
                    const day = meal.closest('.day-column');
                    if (day) window.updateDayTotals(day);
                }
            }
        }
    }
    
    // Attach handlers to elements
    static attachHandlers(element, type) {
        switch(type) {
            case 'pill':
                element.addEventListener('dragstart', DragDropManager.handlePillDragStart);
                element.addEventListener('dragend', DragDropManager.handlePillDragEnd);
                break;
            case 'food':
                element.addEventListener('dragstart', DragDropManager.handleFoodDragStart);
                element.addEventListener('dragend', DragDropManager.handleFoodDragEnd);
                break;
            case 'module':
                element.addEventListener('dragstart', DragDropManager.handleModuleDragStart);
                element.addEventListener('dragend', DragDropManager.handleModuleDragEnd);
                break;
            case 'column':
                element.addEventListener('dragstart', DragDropManager.handleColumnDragStart);
                element.addEventListener('dragend', DragDropManager.handleColumnDragEnd);
                element.addEventListener('dragover', DragDropManager.handleColumnDragOver);
                element.addEventListener('drop', DragDropManager.handleColumnDrop);
                break;
            case 'meal':
                element.addEventListener('dragover', DragDropManager.handleMealDragOver);
                element.addEventListener('dragleave', DragDropManager.handleMealDragLeave);
                element.addEventListener('drop', DragDropManager.handleMealDrop);
                break;
            case 'recipe':
                element.addEventListener('dragover', DragDropManager.handleRecipeDragOver);
                element.addEventListener('drop', DragDropManager.handleRecipeDrop);
                break;
            case 'categoryItems':
                element.addEventListener('dragover', DragDropManager.handleCategoryItemsDragOver);
                element.addEventListener('drop', DragDropManager.handleCategoryItemsDrop);
                break;
        }
    }
}

// Export for use in app.js
export default DragDropManager;