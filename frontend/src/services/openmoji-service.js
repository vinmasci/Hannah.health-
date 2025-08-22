class OpenMojiService {
    constructor() {
        this.baseUrl = '/node_modules/openmoji/color/svg/';
        this.cdnUrl = 'https://cdn.jsdelivr.net/npm/openmoji@15.1.0/color/svg/';
        this.useCDN = true; // Set to true to use CDN instead of local files
        
        // Food category emoji mappings
        this.foodCategories = {
            proteins: {
                icon: '1F356', // meat on bone
                alternatives: ['1F357', '1F953', '1F95A', '1F373', '1F364'] // poultry, bacon, egg, fried shrimp
            },
            carbs: {
                icon: '1F35E', // bread
                alternatives: ['1F35D', '1F356', '1F35A', '1F35C'] // pasta, potato, rice, noodles
            },
            vegetables: {
                icon: '1F966', // broccoli
                alternatives: ['1F955', '1F954', '1F952', '1F96C'] // carrot, potato, cucumber, leafy green
            },
            fruits: {
                icon: '1F34E', // apple
                alternatives: ['1F34C', '1F347', '1F353', '1F34A'] // banana, grapes, strawberry, orange
            },
            dairy: {
                icon: '1F95B', // glass of milk
                alternatives: ['1F9C0', '1F9C8', '1F9C7'] // cheese, butter, waffle
            },
            fats: {
                icon: '1F95C', // peanuts
                alternatives: ['1F951', '1FAD2', '1F9C8'] // avocado, olive, butter
            },
            beverages: {
                icon: '1F964', // cup with straw
                alternatives: ['2615', '1F375', '1F376', '1F377'] // coffee, tea, sake, wine
            },
            snacks: {
                icon: '1F36A', // cookie
                alternatives: ['1F36B', '1F36C', '1F36D', '1F36E'] // chocolate, candy, lollipop, custard
            },
            meals: {
                icon: '1F372', // pot of food
                alternatives: ['1F371', '1F958', '1F959', '1F35B'] // bento, bowl, dumpling, curry
            }
        };
        
        // Mood and achievement emojis for ED-safe mode
        this.moodEmojis = {
            happy: '1F60A',
            calm: '1F60C',
            energized: '1F4AA',
            proud: '1F3C6',
            grateful: '1F64F',
            balanced: '2696',
            nourished: '1F33B',
            strong: '1F9BE'
        };
        
        // Quick action emojis
        this.actionEmojis = {
            add: '2795',
            remove: '2796',
            favorite: '2B50',
            search: '1F50D',
            calendar: '1F4C5',
            shopping: '1F6D2',
            recipe: '1F4D6',
            cook: '1F373'
        };
    }
    
    /**
     * Get emoji URL by unicode code point
     * @param {string} code - Unicode code point (e.g., '1F34E' for apple)
     * @param {boolean} useBlack - Use black/white variant
     * @returns {string} URL to emoji SVG
     */
    getEmojiUrl(code, useBlack = false) {
        const variant = useBlack ? 'black' : 'color';
        const baseUrl = this.useCDN ? 
            `https://cdn.jsdelivr.net/npm/openmoji@15.1.0/${variant}/svg/` : 
            `/node_modules/openmoji/${variant}/svg/`;
        return `${baseUrl}${code}.svg`;
    }
    
    /**
     * Create emoji img element
     * @param {string} code - Unicode code point
     * @param {number} size - Size in pixels
     * @param {string} alt - Alt text
     * @param {boolean} useBlack - Use black/white variant
     * @returns {HTMLImageElement}
     */
    createEmojiElement(code, size = 24, alt = '', useBlack = false) {
        const img = document.createElement('img');
        img.src = this.getEmojiUrl(code, useBlack);
        img.width = size;
        img.height = size;
        img.alt = alt;
        img.classList.add('openmoji-icon');
        img.loading = 'lazy';
        return img;
    }
    
    /**
     * Get emoji for food category
     * @param {string} category - Food category name
     * @param {number} index - Alternative index (for variety)
     * @returns {string} Unicode code point
     */
    getFoodCategoryEmoji(category, index = 0) {
        const cat = this.foodCategories[category.toLowerCase()];
        if (!cat) return '1F37D'; // Default to plate with cutlery
        
        if (index === 0) return cat.icon;
        
        const alternatives = cat.alternatives || [];
        return alternatives[index % alternatives.length] || cat.icon;
    }
    
    /**
     * Add emoji to meal card
     * @param {HTMLElement} element - Meal card element
     * @param {string} category - Food category
     */
    addMealCardEmoji(element, category) {
        const emojiCode = this.getFoodCategoryEmoji(category);
        const emoji = this.createEmojiElement(emojiCode, 20, category);
        emoji.classList.add('meal-emoji');
        
        // Find or create emoji container
        let emojiContainer = element.querySelector('.meal-emoji-container');
        if (!emojiContainer) {
            emojiContainer = document.createElement('span');
            emojiContainer.classList.add('meal-emoji-container');
            element.prepend(emojiContainer);
        }
        
        emojiContainer.appendChild(emoji);
    }
    
    /**
     * Create category pill with emoji
     * @param {string} category - Category name
     * @param {string} colorClass - CSS color class
     * @returns {HTMLElement}
     */
    createCategoryPill(category, colorClass) {
        const pill = document.createElement('span');
        pill.classList.add('category-pill', colorClass);
        
        const emojiCode = this.getFoodCategoryEmoji(category);
        const emoji = this.createEmojiElement(emojiCode, 16, category);
        
        const text = document.createElement('span');
        text.textContent = category;
        
        pill.appendChild(emoji);
        pill.appendChild(text);
        
        return pill;
    }
    
    /**
     * Add mood tracker emoji (for ED-safe mode)
     * @param {string} mood - Mood type
     * @param {HTMLElement} container - Container element
     */
    addMoodEmoji(mood, container) {
        const emojiCode = this.moodEmojis[mood.toLowerCase()] || this.moodEmojis.happy;
        const emoji = this.createEmojiElement(emojiCode, 32, mood);
        emoji.classList.add('mood-emoji');
        container.appendChild(emoji);
    }
    
    /**
     * Initialize emoji styles
     */
    initializeStyles() {
        if (document.getElementById('openmoji-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'openmoji-styles';
        style.textContent = `
            .openmoji-icon {
                display: inline-block;
                vertical-align: middle;
                margin: 0 4px;
            }
            
            .meal-emoji-container {
                display: inline-flex;
                gap: 4px;
                margin-right: 8px;
            }
            
            .meal-emoji {
                opacity: 0.8;
                transition: opacity 0.2s;
                object-fit: contain;
                vertical-align: middle;
            }
            
            .meal-emoji.size-28 {
                width: 28px !important;
                height: 28px !important;
            }
            
            .meal-emoji.size-24 {
                width: 24px !important;
                height: 24px !important;
            }
            
            .meal-emoji.size-20 {
                width: 20px !important;
                height: 20px !important;
            }
            
            .meal-card:hover .meal-emoji {
                opacity: 1;
            }
            
            .category-pill {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 4px 8px;
                border-radius: 12px;
                font-size: 12px;
            }
            
            .category-pill .openmoji-icon {
                margin: 0;
            }
            
            .mood-emoji {
                cursor: pointer;
                transition: transform 0.2s;
            }
            
            .mood-emoji:hover {
                transform: scale(1.1);
            }
            
            .action-emoji {
                cursor: pointer;
                opacity: 0.7;
                transition: opacity 0.2s, transform 0.2s;
            }
            
            .action-emoji:hover {
                opacity: 1;
                transform: scale(1.1);
            }
        `;
        document.head.appendChild(style);
    }
}

// Export for ES6 modules
export { OpenMojiService };

// Also make available globally for non-module scripts
if (typeof window !== 'undefined') {
    window.OpenMojiService = OpenMojiService;
}