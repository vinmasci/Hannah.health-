// Barcode Scanner Implementation for Hannah Health Meal Planner
// Uses QuaggaJS for barcode scanning and integrates with FatSecret + OpenFoodFacts APIs

class BarcodeScanner {
    constructor() {
        this.isScanning = false;
        this.modal = null;
        this.scannerConfig = {
            inputStream: {
                name: "Live",
                type: "LiveStream",
                target: document.querySelector('#scannerViewport'),
                constraints: {
                    width: 640,
                    height: 480,
                    facingMode: "environment"
                }
            },
            locator: {
                patchSize: "medium",
                halfSample: true
            },
            numOfWorkers: 2,
            frequency: 10,
            decoder: {
                readers: [
                    "code_128_reader",
                    "ean_reader",
                    "ean_8_reader",
                    "code_39_reader",
                    "code_39_vin_reader",
                    "codabar_reader",
                    "upc_reader",
                    "upc_e_reader",
                    "i2of5_reader"
                ]
            },
            locate: true
        };
        this.nutritionAPI = new NutritionAPI();
        this.lastScannedCode = null;
        this.scanTimeout = null;
    }

    // Open the scanner modal
    openScanner() {
        this.modal = document.getElementById('barcodeScannerModal');
        if (this.modal) {
            this.modal.classList.add('active');
            this.showStatus('Click "Start Scanner" to begin scanning barcodes', 'info');
            
            // Reset UI
            document.getElementById('scannerStartBtn').style.display = 'block';
            document.getElementById('scannerStopBtn').style.display = 'none';
            document.getElementById('scannerResults').innerHTML = '';
        }
    }

    // Close the scanner modal
    closeScanner() {
        if (this.isScanning) {
            this.stopScanning();
        }
        if (this.modal) {
            this.modal.classList.remove('active');
        }
    }

    // Start the barcode scanning process
    async startScanning() {
        try {
            this.showStatus('Initializing camera...', 'loading');
            
            // Request camera permission
            const stream = await navigator.mediaDevices.getUserMedia({ 
                video: { facingMode: 'environment' } 
            });
            
            // Initialize Quagga
            Quagga.init(this.scannerConfig, (err) => {
                if (err) {
                    console.error('Quagga initialization error:', err);
                    this.showStatus('Failed to initialize camera. Please ensure camera permissions are granted.', 'error');
                    return;
                }
                
                console.log('Quagga initialized successfully');
                Quagga.start();
                this.isScanning = true;
                
                // Update UI
                document.getElementById('scannerStartBtn').style.display = 'none';
                document.getElementById('scannerStopBtn').style.display = 'block';
                this.showStatus('Scanner active. Position barcode within the target area.', 'info');
                
                // Set up event listeners
                this.setupQuaggaEventListeners();
            });
            
        } catch (error) {
            console.error('Camera access error:', error);
            this.showStatus('Camera access denied. Please allow camera access and try again.', 'error');
        }
    }

    // Stop the barcode scanning process
    stopScanning() {
        if (this.isScanning) {
            Quagga.stop();
            this.isScanning = false;
            
            // Update UI
            document.getElementById('scannerStartBtn').style.display = 'block';
            document.getElementById('scannerStopBtn').style.display = 'none';
            this.showStatus('Scanner stopped', 'info');
            
            // Clear timeout
            if (this.scanTimeout) {
                clearTimeout(this.scanTimeout);
                this.scanTimeout = null;
            }
        }
    }

    // Set up Quagga event listeners
    setupQuaggaEventListeners() {
        Quagga.onDetected((result) => {
            const code = result.codeResult.code;
            
            // Prevent duplicate scans of the same code
            if (this.lastScannedCode === code) {
                return;
            }
            
            this.lastScannedCode = code;
            console.log('Barcode detected:', code);
            
            // Add visual feedback
            this.addScanFeedback();
            
            // Process the barcode
            this.processBarcode(code);
            
            // Reset the last scanned code after a delay
            if (this.scanTimeout) {
                clearTimeout(this.scanTimeout);
            }
            this.scanTimeout = setTimeout(() => {
                this.lastScannedCode = null;
            }, 3000);
        });

        Quagga.onProcessed((result) => {
            const drawingCtx = Quagga.canvas.ctx.overlay;
            const drawingCanvas = Quagga.canvas.dom.overlay;

            if (result) {
                if (result.boxes) {
                    drawingCtx.clearRect(0, 0, parseInt(drawingCanvas.getAttribute("width")), parseInt(drawingCanvas.getAttribute("height")));
                    result.boxes.filter(function (box) {
                        return box !== result.box;
                    }).forEach(function (box) {
                        Quagga.ImageDebug.drawPath(box, { x: 0, y: 1 }, drawingCtx, { color: "green", lineWidth: 2 });
                    });
                }

                if (result.box) {
                    Quagga.ImageDebug.drawPath(result.box, { x: 0, y: 1 }, drawingCtx, { color: "#00F", lineWidth: 2 });
                }

                if (result.codeResult && result.codeResult.code) {
                    Quagga.ImageDebug.drawPath(result.line, { x: 'x', y: 'y' }, drawingCtx, { color: 'red', lineWidth: 3 });
                }
            }
        });
    }

    // Add visual feedback when a barcode is scanned
    addScanFeedback() {
        const target = document.querySelector('.scanner-target');
        if (target) {
            target.style.borderColor = '#48bb78';
            target.style.boxShadow = '0 0 20px rgba(72, 187, 120, 0.5)';
            
            setTimeout(() => {
                target.style.borderColor = '#667eea';
                target.style.boxShadow = 'none';
            }, 1000);
        }
    }

    // Process a scanned barcode
    async processBarcode(barcode) {
        this.showStatus('Looking up nutrition data...', 'loading');
        
        try {
            const nutritionData = await this.nutritionAPI.lookupBarcode(barcode);
            
            if (nutritionData) {
                this.showStatus('Product found! Select a category to add it to.', 'success');
                this.displayNutritionResults(nutritionData);
            } else {
                this.showStatus('Product not found in nutrition database. Try scanning another item.', 'error');
            }
        } catch (error) {
            console.error('Nutrition lookup error:', error);
            this.showStatus('Error looking up nutrition data. Please try again.', 'error');
        }
    }

    // Display nutrition results
    displayNutritionResults(nutritionData) {
        const resultsContainer = document.getElementById('scannerResults');
        
        // Determine the best category for this food
        const suggestedCategory = this.suggestCategory(nutritionData);
        
        const resultHTML = `
            <div class="scanner-result-item">
                <div class="scanner-result-name">${nutritionData.name}</div>
                <div class="scanner-result-details">
                    ${nutritionData.brand ? `Brand: ${nutritionData.brand}<br>` : ''}
                    Calories: ${nutritionData.kcal} per ${nutritionData.baseQuantity}${nutritionData.baseUnit}<br>
                    Protein: ${nutritionData.protein.toFixed(1)}g | Carbs: ${nutritionData.carbs.toFixed(1)}g | Fat: ${nutritionData.fat.toFixed(1)}g
                </div>
                <div class="scanner-result-actions">
                    <button class="scanner-result-btn add" onclick="BarcodeScanner.addToCategory('${suggestedCategory}', ${JSON.stringify(nutritionData).replace(/"/g, '&quot;')})">
                        Add to ${suggestedCategory.charAt(0).toUpperCase() + suggestedCategory.slice(1)}
                    </button>
                    <button class="scanner-result-btn" onclick="BarcodeScanner.showCategorySelector(${JSON.stringify(nutritionData).replace(/"/g, '&quot;')})">
                        Choose Category
                    </button>
                </div>
            </div>
        `;
        
        resultsContainer.innerHTML = resultHTML;
    }

    // Suggest the best category for a food item based on its macros
    suggestCategory(nutritionData) {
        const { protein, carbs, fat } = nutritionData;
        const totalMacros = protein + carbs + fat;
        
        if (totalMacros === 0) return 'extras';
        
        const proteinRatio = protein / totalMacros;
        const carbsRatio = carbs / totalMacros;
        const fatRatio = fat / totalMacros;
        
        // Use name-based classification first
        const name = nutritionData.name.toLowerCase();
        if (name.includes('meat') || name.includes('chicken') || name.includes('beef') || 
            name.includes('fish') || name.includes('salmon') || name.includes('tuna') ||
            name.includes('egg') || name.includes('tofu') || name.includes('protein')) {
            return 'protein';
        }
        
        if (name.includes('vegetable') || name.includes('broccoli') || name.includes('spinach') ||
            name.includes('lettuce') || name.includes('carrot') || name.includes('pepper')) {
            return 'veg';
        }
        
        if (name.includes('fruit') || name.includes('apple') || name.includes('banana') ||
            name.includes('berry') || name.includes('orange') || name.includes('grape')) {
            return 'fruit';
        }
        
        if (name.includes('bread') || name.includes('rice') || name.includes('pasta') ||
            name.includes('potato') || name.includes('oat') || name.includes('cereal')) {
            return 'carbs';
        }
        
        // Fallback to macro-based classification
        if (proteinRatio > 0.4) return 'protein';
        if (carbsRatio > 0.5 && (name.includes('fruit') || name.includes('sweet'))) return 'fruit';
        if (carbsRatio > 0.5) return 'carbs';
        if (fatRatio > 0.4) return 'extras';
        
        // Default fallback
        return 'extras';
    }

    // Add food item to a specific category
    addToCategory(category, nutritionData) {
        // Make sure the category column exists
        if (!document.querySelector(`.category-column[data-category="${category}"]`)) {
            // Create the category column
            window.createCategoryColumn(category);
        }
        
        // Add the food to the local database for this session
        if (!window.foodDatabase[category]) {
            window.foodDatabase[category] = [];
        }
        
        // Add to the category if not already present
        const existingFood = window.foodDatabase[category].find(food => food.name === nutritionData.name);
        if (!existingFood) {
            window.foodDatabase[category].push(nutritionData);
            
            // Add to the UI
            const categoryColumn = document.querySelector(`.category-column[data-category="${category}"]`);
            const itemsContainer = categoryColumn.querySelector('.category-items');
            const foodElement = window.createFoodItemElement(nutritionData, category);
            itemsContainer.appendChild(foodElement);
        }
        
        this.showStatus(`${nutritionData.name} added to ${category} category!`, 'success');
        
        // Close the scanner after a delay
        setTimeout(() => {
            this.closeScanner();
        }, 2000);
    }

    // Show category selector for manual selection
    showCategorySelector(nutritionData) {
        const categories = ['protein', 'veg', 'fruit', 'carbs', 'extras'];
        const categoryButtons = categories.map(cat => 
            `<button class="scanner-result-btn add" onclick="BarcodeScanner.addToCategory('${cat}', ${JSON.stringify(nutritionData).replace(/"/g, '&quot;')})" style="margin: 4px;">
                ${cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>`
        ).join('');
        
        const resultsContainer = document.getElementById('scannerResults');
        resultsContainer.innerHTML = `
            <div class="scanner-result-item">
                <div class="scanner-result-name">${nutritionData.name}</div>
                <div class="scanner-result-details">Select a category:</div>
                <div class="scanner-result-actions" style="flex-wrap: wrap;">
                    ${categoryButtons}
                </div>
            </div>
        `;
    }

    // Show status message
    showStatus(message, type = 'info') {
        const statusElement = document.getElementById('scannerStatus');
        if (statusElement) {
            statusElement.textContent = message;
            statusElement.className = `scanner-status ${type}`;
            
            if (type === 'loading') {
                statusElement.innerHTML = `<div class="loading-spinner"></div> ${message}`;
            }
        }
    }
}

// Nutrition API Integration Class
class NutritionAPI {
    constructor() {
        this.fatSecretProxy = 'http://localhost:3003';
        this.openFoodFactsAPI = 'https://world.openfoodfacts.org/api/v0/product';
    }

    // Main barcode lookup function
    async lookupBarcode(barcode) {
        console.log('Looking up barcode:', barcode);
        
        try {
            // Try OpenFoodFacts first (free, no rate limits)
            const openFoodFactsResult = await this.lookupOpenFoodFacts(barcode);
            if (openFoodFactsResult) {
                return openFoodFactsResult;
            }
            
            // Fallback to FatSecret if available
            const fatSecretResult = await this.lookupFatSecret(barcode);
            if (fatSecretResult) {
                return fatSecretResult;
            }
            
            return null;
        } catch (error) {
            console.error('Nutrition lookup error:', error);
            return null;
        }
    }

    // Lookup using OpenFoodFacts API
    async lookupOpenFoodFacts(barcode) {
        try {
            const response = await fetch(`${this.openFoodFactsAPI}/${barcode}.json`);
            const data = await response.json();
            
            if (data.status === 1 && data.product) {
                const product = data.product;
                
                // Extract nutrition data
                const nutriments = product.nutriments || {};
                
                return {
                    name: product.product_name || 'Unknown Product',
                    brand: product.brands || '',
                    baseQuantity: 100,
                    baseUnit: 'g',
                    kcal: Math.round(nutriments.energy_kcal_100g || nutriments['energy-kcal_100g'] || 0),
                    protein: parseFloat(nutriments.proteins_100g || nutriments['proteins_100g'] || 0),
                    carbs: parseFloat(nutriments.carbohydrates_100g || nutriments['carbohydrates_100g'] || 0),
                    fat: parseFloat(nutriments.fat_100g || nutriments['fat_100g'] || 0),
                    cost: 2.00, // Default cost
                    source: 'openfoodfacts',
                    barcode: barcode
                };
            }
            
            return null;
        } catch (error) {
            console.error('OpenFoodFacts lookup error:', error);
            return null;
        }
    }

    // Lookup using FatSecret API (through proxy)
    async lookupFatSecret(barcode) {
        try {
            // FatSecret doesn't have direct barcode lookup, so we'll skip this for now
            // In a real implementation, you might use the search API with the product name
            return null;
        } catch (error) {
            console.error('FatSecret lookup error:', error);
            return null;
        }
    }
}

// Helper function to create food item element (moved from fatsecret-client.js for reuse)
window.createFoodItemElement = function(food, category) {
    const div = document.createElement('div');
    div.className = 'food-item';
    div.draggable = true;
    
    const foodData = {
        ...food,
        category: category,
        currentQuantity: food.baseQuantity,
        currentUnit: food.baseUnit
    };
    
    div.dataset.food = JSON.stringify(foodData);
    
    const units = window.getAvailableUnits(food.baseUnit);
    
    div.innerHTML = `
        <div class="food-name">${food.name}${food.brand ? ` (${food.brand})` : ''}</div>
        <div class="food-portion">
            <input type="number" class="portion-input" value="${food.baseQuantity}" min="1" step="1">
            <select class="unit-select">
                ${units.map(unit => 
                    `<option value="${unit}" ${unit === food.baseUnit ? 'selected' : ''}>${unit}</option>`
                ).join('')}
            </select>
        </div>
        <div class="food-macros">
            <div class="macro-bar-container">
                <div class="macro-bar">
                    ${window.createMacroBar(food.protein, food.carbs, food.fat)}
                </div>
                <div class="macro-labels">
                    ${window.createMacroLabels(food.protein, food.carbs, food.fat)}
                </div>
            </div>
            <div class="macro-stats">
                <span class="macro kcal">${food.kcal} kcal</span>
                <span class="macro cost">$${food.cost.toFixed(2)}</span>
            </div>
        </div>
        ${food.source ? `<div class="food-source">🔍 ${food.source === 'openfoodfacts' ? 'Scanned' : 'Online'}</div>` : ''}
    `;
    
    // Add event listeners
    div.addEventListener('dragstart', window.handleFoodDragStart);
    div.addEventListener('dragend', window.handleFoodDragEnd);
    
    const portionInput = div.querySelector('.portion-input');
    const unitSelect = div.querySelector('.unit-select');
    
    portionInput.addEventListener('change', window.handlePortionChange);
    unitSelect.addEventListener('change', window.handleUnitChange);
    
    return div;
};

// Create global instance
window.BarcodeScanner = new BarcodeScanner();

// Add keyboard shortcut for scanner (Ctrl+B)
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'b') {
        e.preventDefault();
        window.BarcodeScanner.openScanner();
    }
});

console.log('Barcode Scanner initialized successfully');