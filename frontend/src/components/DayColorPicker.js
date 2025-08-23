// DayColorPicker - Color picker functionality for day columns
// Extracted from DayMealManager.js to reduce file size

export class DayColorPicker {
    // Define color palette
    static colors = [
        { name: 'Default Blue', value: '#e6f3ff', header: '#1e90ff' },
        { name: 'Pink', value: '#ffe6f2', header: '#ff69b4' },
        { name: 'Purple', value: '#f3e6ff', header: '#9370db' },
        { name: 'Green', value: '#e6ffe6', header: '#32cd32' },
        { name: 'Yellow', value: '#fffbe6', header: '#ffd700' },
        { name: 'Orange', value: '#fff0e6', header: '#ff8c00' },
        { name: 'Red', value: '#ffe6e6', header: '#ff6b6b' },
        { name: 'Teal', value: '#e6ffff', header: '#20b2aa' },
        { name: 'Indigo', value: '#e6e6ff', header: '#6b5b95' },
        { name: 'Coral', value: '#ffe6d9', header: '#ff7f50' }
    ];
    
    // Show color picker for a day column
    static show(dayName) {
        const dayColumn = document.querySelector(`[data-day="${dayName}"]`);
        if (!dayColumn) return;
        
        // Remove any existing color picker
        const existingPicker = document.querySelector('.color-picker-popover');
        if (existingPicker) existingPicker.remove();
        
        // Create color picker popover
        const picker = document.createElement('div');
        picker.className = 'color-picker-popover';
        
        let colorOptions = '';
        this.colors.forEach(color => {
            colorOptions += `
                <div class="color-option" 
                     onclick="DayColorPicker.applyColor('${dayName}', '${color.value}', '${color.header}')"
                     style="background: ${color.value}; border-color: ${color.header};"
                     title="${color.name}">
                    <div class="color-preview" style="background: ${color.header};"></div>
                </div>
            `;
        });
        
        picker.innerHTML = `
            <div class="color-picker-header">Choose a color</div>
            <div class="color-picker-grid">
                ${colorOptions}
            </div>
            <button class="color-picker-close" onclick="DayColorPicker.close()">×</button>
        `;
        
        // Position near the button
        const button = dayColumn.querySelector('.color-picker-btn');
        const rect = button.getBoundingClientRect();
        picker.style.top = `${rect.bottom + 5}px`;
        picker.style.left = `${rect.left}px`;
        
        document.body.appendChild(picker);
        
        // Add styles if not present
        this.addPickerStyles();
        
        // Close on click outside
        setTimeout(() => {
            document.addEventListener('click', this.closeOnClickOutside);
        }, 100);
    }
    
    // Apply color to day column
    static applyColor(dayName, bgColor, headerColor) {
        const dayColumn = document.querySelector(`[data-day="${dayName}"]`);
        if (!dayColumn) return;
        
        // Apply inline styles for custom colors using setAttribute for !important
        dayColumn.setAttribute('style', `background: ${bgColor} !important;`);
        const header = dayColumn.querySelector('.day-header');
        if (header) {
            header.setAttribute('style', `background: ${headerColor} !important;`);
        }
        
        // Apply color to footer
        const footer = dayColumn.querySelector('.day-totals');
        if (footer) {
            footer.setAttribute('style', `background: ${headerColor} !important;`);
        }
        
        // Update color circle
        const colorCircle = dayColumn.querySelector('.color-circle');
        if (colorCircle) {
            colorCircle.style.background = headerColor;
        }
        
        // Save color preference
        const colorPrefs = JSON.parse(localStorage.getItem('dayColors') || '{}');
        colorPrefs[dayName] = { bg: bgColor, header: headerColor };
        localStorage.setItem('dayColors', JSON.stringify(colorPrefs));
        
        this.close();
    }
    
    // Load saved color for a day column
    static loadColor(dayName) {
        const dayColumn = document.querySelector(`[data-day="${dayName}"]`);
        if (!dayColumn) return;
        
        const colorPrefs = JSON.parse(localStorage.getItem('dayColors') || '{}');
        const colorCircle = dayColumn.querySelector('.color-circle');
        
        if (colorPrefs[dayName]) {
            const { bg, header } = colorPrefs[dayName];
            dayColumn.setAttribute('style', `background: ${bg} !important;`);
            const headerElement = dayColumn.querySelector('.day-header');
            if (headerElement) {
                headerElement.setAttribute('style', `background: ${header} !important;`);
            }
            // Apply color to footer
            const footer = dayColumn.querySelector('.day-totals');
            if (footer) {
                footer.setAttribute('style', `background: ${header} !important;`);
            }
            // Update color circle to show current color
            if (colorCircle) {
                colorCircle.style.background = header;
            }
        } else {
            // Default blue color for circle
            if (colorCircle) {
                colorCircle.style.background = '#1e90ff';
            }
        }
    }
    
    // Close color picker
    static close() {
        const picker = document.querySelector('.color-picker-popover');
        if (picker) picker.remove();
        document.removeEventListener('click', this.closeOnClickOutside);
    }
    
    // Close color picker on click outside
    static closeOnClickOutside(e) {
        const picker = document.querySelector('.color-picker-popover');
        const button = e.target.closest('.color-picker-btn');
        if (picker && !picker.contains(e.target) && !button) {
            DayColorPicker.close();
        }
    }
    
    // Add picker styles
    static addPickerStyles() {
        if (!document.getElementById('color-picker-styles')) {
            const style = document.createElement('style');
            style.id = 'color-picker-styles';
            style.textContent = `
                .color-picker-btn {
                    background: transparent;
                    border: none;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    cursor: pointer;
                    transition: all 0.2s ease;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .color-picker-btn:hover {
                    transform: scale(1.15);
                }
                
                .color-picker-btn:hover .color-circle {
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
                }
                
                .color-circle {
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                    background: #1e90ff;
                    border: 2px solid rgba(255, 255, 255, 0.9);
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
                    transition: all 0.2s ease;
                }
                
                .color-picker-popover {
                    position: fixed;
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                    padding: 16px;
                    z-index: 10001;
                    animation: fadeIn 0.2s ease;
                }
                
                .color-picker-header {
                    font-size: 14px;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 12px;
                }
                
                .color-picker-grid {
                    display: grid;
                    grid-template-columns: repeat(5, 40px);
                    gap: 8px;
                }
                
                .color-option {
                    width: 40px;
                    height: 40px;
                    border-radius: 8px;
                    border: 3px solid;
                    cursor: pointer;
                    position: relative;
                    transition: all 0.2s ease;
                }
                
                .color-option:hover {
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                
                .color-preview {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    width: 20px;
                    height: 20px;
                    border-radius: 50%;
                }
                
                .color-picker-close {
                    position: absolute;
                    top: 8px;
                    right: 8px;
                    background: none;
                    border: none;
                    font-size: 20px;
                    color: #999;
                    cursor: pointer;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    border-radius: 50%;
                }
                
                .color-picker-close:hover {
                    background: #f0f0f0;
                    color: #333;
                }
            `;
            document.head.appendChild(style);
        }
    }
}

// Make available globally for onclick handlers
window.DayColorPicker = DayColorPicker;

export default DayColorPicker;