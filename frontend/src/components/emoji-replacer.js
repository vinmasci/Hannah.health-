import { OpenMojiService } from '../services/openmoji-service.js';

class EmojiReplacer {
    constructor() {
        this.openMojiService = new OpenMojiService();
        
        // Map category names to OpenMoji codes
        this.categoryEmojiMap = {
            'ai-search': '1F916', // robot
            'favorites': '2764', // red heart
            'protein': '1F356', // meat on bone
            'dairy': '1F95B', // glass of milk
            'veg': '1F966', // broccoli
            'fruit': '1F34E', // red apple
            'grains': '1F33E', // ear of rice
            'nuts': '1F95C', // peanuts
            'carbs': '1F956', // baguette
            'drinks': '1F964', // cup with straw
            'sweets': '1F9C1', // cupcake
            'extras': '2728' // sparkles
        };
    }
    
    /**
     * Replace all category pill emojis with OpenMoji SVGs
     */
    replaceCategoryPillEmojis() {
        const pills = document.querySelectorAll('.category-pill');
        
        pills.forEach(pill => {
            const category = pill.dataset.category;
            const emojiCode = this.categoryEmojiMap[category];
            
            if (emojiCode) {
                // Find the emoji span (first span element)
                const emojiSpan = pill.querySelector('span:first-child');
                if (emojiSpan) {
                    // Create OpenMoji element
                    const openMoji = this.openMojiService.createEmojiElement(
                        emojiCode, 
                        20, 
                        category
                    );
                    
                    // Replace the content
                    emojiSpan.innerHTML = '';
                    emojiSpan.appendChild(openMoji);
                }
            }
        });
    }
    
    /**
     * Get food emoji code based on name and category
     * @param {string} foodName - The name of the food
     * @param {string} category - The food category
     * @returns {string} OpenMoji code
     */
    getFoodEmojiCode(foodName, category) {
        // Map food categories to emoji codes
        const foodEmojiMap = {
            // Proteins
            'chicken': '1F357', // poultry leg
            'beef': '1F356', // meat on bone
            'steak': '1F969', // cut of meat
            'pork': '1F953', // bacon
            'fish': '1F41F', // fish
            'salmon': '1F363', // sushi
            'tuna': '1F363', // sushi
            'shrimp': '1F364', // fried shrimp
            'egg': '1F95A', // egg
            'tofu': '1F961', // dango
            // Dairy
            'milk': '1F95B', // milk
            'cheese': '1F9C0', // cheese
            'yogurt': '1F95B', // milk
            'butter': '1F9C8', // butter
            // Carbs
            'bread': '1F35E', // bread
            'rice': '1F35A', // rice
            'pasta': '1F35D', // spaghetti
            'noodle': '1F35C', // steaming bowl
            'potato': '1F954', // potato
            'cereal': '1F963', // bowl with spoon
            // Vegetables
            'broccoli': '1F966', // broccoli
            'carrot': '1F955', // carrot
            'tomato': '1F345', // tomato
            'lettuce': '1F96C', // leafy green
            'salad': '1F957', // green salad
            'corn': '1F33D', // corn
            'pepper': '1F336', // hot pepper
            'mushroom': '1F344', // mushroom
            'onion': '1F9C5', // onion
            'garlic': '1F9C4', // garlic
            // Fruits
            'apple': '1F34E', // apple
            'banana': '1F34C', // banana
            'orange': '1F34A', // orange
            'berry': '1F353', // strawberry
            'grape': '1F347', // grapes
            'watermelon': '1F349', // watermelon
            'peach': '1F351', // peach
            'pear': '1F350', // pear
            'avocado': '1F951', // avocado
            // Nuts & Seeds
            'nut': '1F95C', // peanuts
            'almond': '1F95C', // peanuts
            'peanut': '1F95C', // peanuts
            // Beverages
            'water': '1F4A7', // droplet
            'coffee': '2615', // hot beverage
            'tea': '1F375', // teacup
            'juice': '1F9C3', // beverage box
            'soda': '1F964', // cup with straw
            'wine': '1F377', // wine glass
            'beer': '1F37A', // beer mug
            // Sweets
            'cake': '1F370', // cake
            'cookie': '1F36A', // cookie
            'chocolate': '1F36B', // chocolate bar
            'candy': '1F36C', // candy
            'ice cream': '1F368', // ice cream
            'donut': '1F369', // doughnut
            // Meals
            'pizza': '1F355', // pizza
            'burger': '1F354', // hamburger
            'sandwich': '1F96A', // sandwich
            'taco': '1F32E', // taco
            'soup': '1F372', // pot of food
            // Category-based fallbacks
            'protein': '1F356', // meat on bone
            'dairy': '1F95B', // milk
            'veg': '1F966', // broccoli
            'fruit': '1F34E', // apple
            'grains': '1F35E', // bread
            'nuts': '1F95C', // peanuts
            'carbs': '1F35A', // rice
            'drinks': '1F964', // cup with straw
            'sweets': '1F36A', // cookie
            'default': '1F37D' // plate with cutlery
        };
        
        const lowerName = foodName.toLowerCase();
        const lowerCategory = (category || '').toLowerCase();
        
        // First, try to match specific food names
        for (const [keyword, code] of Object.entries(foodEmojiMap)) {
            if (lowerName.includes(keyword)) {
                return code;
            }
        }
        
        // Then try category-based fallback
        if (foodEmojiMap[lowerCategory]) {
            return foodEmojiMap[lowerCategory];
        }
        
        // Default fallback
        return foodEmojiMap.default;
    }
    
    /**
     * Replace food item emoji placeholders
     */
    replaceFoodItemEmojis() {
        const placeholders = document.querySelectorAll('.food-emoji-placeholder');
        
        placeholders.forEach(placeholder => {
            // Skip if already has emoji
            if (placeholder.querySelector('.openmoji-icon')) return;
            
            const foodName = placeholder.dataset.foodName || '';
            const category = placeholder.dataset.category || '';
            
            const emojiCode = this.getFoodEmojiCode(foodName, category);
            const emoji = this.openMojiService.createEmojiElement(
                emojiCode,
                16,
                foodName
            );
            
            placeholder.innerHTML = '';
            placeholder.appendChild(emoji);
        });
    }
    
    /**
     * Initialize the emoji replacer
     */
    init() {
        // Replace category pills on load
        this.replaceCategoryPillEmojis();
        
        // Replace existing food items
        this.replaceFoodItemEmojis();
        
        // Watch for new elements being added
        this.observeChanges();
    }
    
    /**
     * Watch for new elements being added to the DOM
     */
    observeChanges() {
        // Set up a mutation observer to watch for new elements
        const observer = new MutationObserver((mutations) => {
            // Batch process after mutations
            setTimeout(() => {
                // Replace any new food item emojis
                this.replaceFoodItemEmojis();
            }, 10);
        });
        
        // Start observing the entire document for changes
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
}

export { EmojiReplacer };