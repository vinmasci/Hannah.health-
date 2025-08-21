// DragDropService - Centralized drag and drop management
export class DragDropService {
    constructor() {
        this.draggedData = null;
        this.draggedElement = null;
        this.dropIndicators = new Set();
        this.lastActiveDay = null;
        
        // Bind methods to preserve context
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
        this.handleDragOver = this.handleDragOver.bind(this);
        this.handleDrop = this.handleDrop.bind(this);
    }
    
    /**
     * Initialize drag and drop handlers for the application
     */
    initializeDragHandlers() {
        // Will be called from app.js to set up all drag handlers
        console.log('DragDropService initialized');
    }
    
    /**
     * Handle drag start for any draggable element
     * @param {DragEvent} e - Drag event
     * @param {Object} data - Data about what's being dragged
     */
    handleDragStart(e, data) {
        this.draggedElement = e.target;
        this.draggedData = data;
        
        // Add dragging class for visual feedback
        e.target.classList.add('dragging');
        
        // Set drag effect based on type
        e.dataTransfer.effectAllowed = data.type === 'food' ? 'copy' : 'move';
        
        // Store globally for compatibility with existing code
        window.draggedElement = this.draggedElement;
        window.draggedData = this.draggedData;
    }
    
    /**
     * Handle drag end for any draggable element
     * @param {DragEvent} e - Drag event
     */
    handleDragEnd(e) {
        // Remove dragging class
        if (e.target) {
            e.target.classList.remove('dragging');
        }
        
        // Clear drop indicators
        this.clearDropIndicators();
        
        // Reset drag state
        this.draggedElement = null;
        this.draggedData = null;
        window.draggedElement = null;
        window.draggedData = null;
    }
    
    /**
     * Handle drag over for drop zones
     * @param {DragEvent} e - Drag event
     * @param {string} targetType - Type of drop target
     */
    handleDragOver(e, targetType) {
        e.preventDefault();
        
        if (!this.draggedData) return;
        
        // Set drop effect based on drag type
        if (this.draggedData.type === 'food') {
            e.dataTransfer.dropEffect = 'copy';
        } else {
            e.dataTransfer.dropEffect = 'move';
        }
        
        // Add visual feedback to drop zone
        e.currentTarget.classList.add('drag-over');
        
        // Update last active day if dropping in a meal
        if (targetType === 'meal') {
            const dayColumn = e.currentTarget.closest('.day-column');
            if (dayColumn) {
                this.lastActiveDay = dayColumn;
                window.lastActiveDay = dayColumn;
            }
        }
    }
    
    /**
     * Handle drop for drop zones
     * @param {DragEvent} e - Drag event
     * @param {string} targetType - Type of drop target
     * @param {Function} callback - Callback to handle the drop
     */
    handleDrop(e, targetType, callback) {
        e.preventDefault();
        e.stopPropagation();
        
        // Remove visual feedback
        e.currentTarget.classList.remove('drag-over');
        
        if (!this.draggedData) return;
        
        // Update last active day if dropping in a meal
        if (targetType === 'meal') {
            const dayColumn = e.currentTarget.closest('.day-column');
            if (dayColumn) {
                this.lastActiveDay = dayColumn;
                window.lastActiveDay = dayColumn;
            }
        }
        
        // Execute callback with drag data
        if (callback) {
            callback(this.draggedData, e);
        }
        
        // Reset drag state
        this.handleDragEnd(e);
    }
    
    /**
     * Clear all drop indicators
     */
    clearDropIndicators() {
        document.querySelectorAll('.drop-indicator-left, .drop-indicator-right, .drag-over').forEach(el => {
            el.classList.remove('drop-indicator-left', 'drop-indicator-right', 'drag-over');
        });
    }
    
    /**
     * Get the element after which to insert when dragging
     * @param {HTMLElement} container - Container element
     * @param {number} y - Y coordinate
     * @returns {HTMLElement|null} Element after which to insert
     */
    getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll(':scope > :not(.dragging)')];
        
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
    
    /**
     * Get the column after which to insert when dragging columns
     * @param {HTMLElement} container - Container element
     * @param {number} x - X coordinate
     * @returns {HTMLElement|null} Column after which to insert
     */
    getDragAfterColumn(container, x) {
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
    
    /**
     * Setup drag handlers for a food item
     * @param {HTMLElement} element - Food item element
     */
    setupFoodItemDragHandlers(element) {
        element.addEventListener('dragstart', (e) => {
            const foodData = JSON.parse(element.dataset.food);
            this.handleDragStart(e, {
                type: 'food',
                food: foodData,
                quantity: parseFloat(element.querySelector('.portion-input').value),
                unit: element.querySelector('.unit-select').value
            });
        });
        
        element.addEventListener('dragend', this.handleDragEnd);
    }
    
    /**
     * Setup drag handlers for a food module
     * @param {HTMLElement} element - Food module element
     */
    setupModuleDragHandlers(element) {
        element.addEventListener('dragstart', (e) => {
            this.handleDragStart(e, {
                type: 'module',
                moduleElement: element
            });
        });
        
        element.addEventListener('dragend', this.handleDragEnd);
    }
    
    /**
     * Setup drag handlers for a category column
     * @param {HTMLElement} element - Category column element
     */
    setupColumnDragHandlers(element) {
        element.addEventListener('dragstart', (e) => {
            // Don't start drag if we're dragging a child element
            if (e.target.closest('.food-item') || e.target.closest('.food-module')) {
                return;
            }
            
            this.handleDragStart(e, {
                type: 'column',
                columnElement: element
            });
        });
        
        element.addEventListener('dragend', this.handleDragEnd);
        
        element.addEventListener('dragover', (e) => {
            if (this.draggedData?.type === 'column') {
                this.handleColumnDragOver(e, element);
            }
        });
        
        element.addEventListener('drop', (e) => {
            if (this.draggedData?.type === 'column') {
                this.handleColumnDrop(e, element);
            }
        });
    }
    
    /**
     * Handle column drag over
     * @param {DragEvent} e - Drag event
     * @param {HTMLElement} column - Column element
     */
    handleColumnDragOver(e, column) {
        if (!this.draggedData || this.draggedData.type !== 'column') return;
        if (column === this.draggedElement) return;
        
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const rect = column.getBoundingClientRect();
        const midpoint = rect.left + rect.width / 2;
        
        // Clear existing indicators
        this.clearDropIndicators();
        
        // Add indicator based on position
        if (e.clientX < midpoint) {
            column.classList.add('drop-indicator-left');
        } else {
            column.classList.add('drop-indicator-right');
        }
    }
    
    /**
     * Handle column drop
     * @param {DragEvent} e - Drag event
     * @param {HTMLElement} dropColumn - Column being dropped on
     */
    handleColumnDrop(e, dropColumn) {
        if (!this.draggedData || this.draggedData.type !== 'column') return;
        if (dropColumn === this.draggedElement) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        const mainBoard = document.querySelector('.main-board');
        const rect = dropColumn.getBoundingClientRect();
        const midpoint = rect.left + rect.width / 2;
        
        if (e.clientX < midpoint) {
            // Insert before
            mainBoard.insertBefore(this.draggedElement, dropColumn);
        } else {
            // Insert after
            if (dropColumn.nextSibling) {
                mainBoard.insertBefore(this.draggedElement, dropColumn.nextSibling);
            } else {
                mainBoard.appendChild(this.draggedElement);
            }
        }
        
        this.clearDropIndicators();
    }
    
    /**
     * Get current drag data
     * @returns {Object|null} Current drag data
     */
    getDragData() {
        return this.draggedData;
    }
    
    /**
     * Check if currently dragging
     * @returns {boolean} True if dragging
     */
    isDragging() {
        return this.draggedData !== null;
    }
    
    /**
     * Get last active day column
     * @returns {HTMLElement|null} Last active day column
     */
    getLastActiveDay() {
        return this.lastActiveDay;
    }
}

// Create singleton instance
const dragDropService = new DragDropService();

// Export singleton
export default dragDropService;