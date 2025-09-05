// User Profile Manager
// Handles user stats, goals, and profile calculations

export class UserProfileManager {
    constructor() {
        this.userProfile = {
            age: null,
            weight: null,
            height: null,
            activityLevel: null,
            goals: null,
            restrictions: null,
            tdee: null
        };
        this.loadProfile();
    }
    
    // Parse user stats from message
    parseUserStats(message) {
        const lowerMessage = message.toLowerCase();
        
        // Extract age
        const ageMatch = message.match(/\b(\d{1,2})\s*(?:years?\s*old|yo\b)/i);
        if (ageMatch) {
            this.userProfile.age = parseInt(ageMatch[1]);
        }
        
        // Extract weight
        const weightMatch = message.match(/\b(\d{2,3})\s*(?:kg|kilograms?|pounds?|lbs?)\b/i);
        if (weightMatch) {
            this.userProfile.weight = parseFloat(weightMatch[1]);
            if (message.includes('lb') || message.includes('pound')) {
                this.userProfile.weight = this.userProfile.weight * 0.453592; // Convert to kg
            }
        }
        
        // Extract height
        const heightMatch = message.match(/\b(\d{3})\s*(?:cm|centimeters?)\b/i) || 
                          message.match(/\b(\d)\s*(?:\'|ft|feet)\s*(\d{1,2})\s*(?:\"|in|inches?)\b/i);
        if (heightMatch) {
            if (heightMatch[2]) { // Feet and inches
                this.userProfile.height = Math.round((parseInt(heightMatch[1]) * 30.48) + (parseInt(heightMatch[2]) * 2.54));
            } else { // Centimeters
                this.userProfile.height = parseInt(heightMatch[1]);
            }
        }
        
        // Extract activity level
        if (lowerMessage.includes('sedentary')) this.userProfile.activityLevel = 'sedentary';
        else if (lowerMessage.includes('light') || lowerMessage.includes('lightly active')) this.userProfile.activityLevel = 'light';
        else if (lowerMessage.includes('moderate') || lowerMessage.includes('moderately active')) this.userProfile.activityLevel = 'moderate';
        else if (lowerMessage.includes('very active')) this.userProfile.activityLevel = 'very';
        else if (lowerMessage.includes('active')) this.userProfile.activityLevel = 'moderate';
        
        // Extract goals
        if (lowerMessage.includes('lose weight') || lowerMessage.includes('weight loss')) {
            this.userProfile.goals = 'weight_loss';
        } else if (lowerMessage.includes('gain weight') || lowerMessage.includes('bulk')) {
            this.userProfile.goals = 'weight_gain';
        } else if (lowerMessage.includes('maintain')) {
            this.userProfile.goals = 'maintenance';
        }
        
        this.saveProfile();
        this.updateStatsDisplay();
        return this.userProfile;
    }
    
    // Update stats display in UI
    updateStatsDisplay() {
        const statsEl = document.querySelector('.user-stats-display');
        if (this.userProfile.age || this.userProfile.weight || this.userProfile.height) {
            const stats = [];
            if (this.userProfile.age) stats.push(`Age: ${this.userProfile.age}`);
            if (this.userProfile.weight) stats.push(`Weight: ${Math.round(this.userProfile.weight)}kg`);
            if (this.userProfile.height) stats.push(`Height: ${this.userProfile.height}cm`);
            if (this.userProfile.tdee) stats.push(`TDEE: ${Math.round(this.userProfile.tdee)} cal`);
            
            if (statsEl) {
                statsEl.textContent = stats.join(' • ');
                statsEl.style.display = 'block';
            }
        }
    }
    
    // Load user profile from localStorage
    loadProfile() {
        const saved = localStorage.getItem('userProfile');
        if (saved) {
            this.userProfile = { ...this.userProfile, ...JSON.parse(saved) };
            
            // Populate form fields if they exist
            if (this.userProfile.goals) {
                const goalEl = document.getElementById('user-goal');
                if (goalEl) goalEl.value = this.userProfile.goals;
            }
            if (this.userProfile.weight) {
                const weightEl = document.getElementById('user-weight');
                if (weightEl) weightEl.value = this.userProfile.weight;
            }
            if (this.userProfile.height) {
                const heightEl = document.getElementById('user-height');
                if (heightEl) heightEl.value = this.userProfile.height;
            }
            if (this.userProfile.age) {
                const ageEl = document.getElementById('user-age');
                if (ageEl) ageEl.value = this.userProfile.age;
            }
            if (this.userProfile.activityLevel) {
                const activityEl = document.getElementById('user-activity');
                if (activityEl) activityEl.value = this.userProfile.activityLevel;
            }
            if (this.userProfile.restrictions) {
                const restrictionsEl = document.getElementById('user-restrictions');
                if (restrictionsEl) restrictionsEl.value = this.userProfile.restrictions;
            }
            
            this.updateStatsDisplay();
        }
    }
    
    // Save user profile to localStorage
    saveProfile() {
        const goalEl = document.getElementById('user-goal');
        const weightEl = document.getElementById('user-weight');
        const heightEl = document.getElementById('user-height');
        const ageEl = document.getElementById('user-age');
        const activityEl = document.getElementById('user-activity');
        const restrictionsEl = document.getElementById('user-restrictions');
        
        if (goalEl) this.userProfile.goals = goalEl.value;
        if (weightEl) this.userProfile.weight = parseFloat(weightEl.value) || null;
        if (heightEl) this.userProfile.height = parseFloat(heightEl.value) || null;
        if (ageEl) this.userProfile.age = parseInt(ageEl.value) || null;
        if (activityEl) this.userProfile.activityLevel = activityEl.value;
        if (restrictionsEl) this.userProfile.restrictions = restrictionsEl.value;
        
        this.calculateBasicStats();
        
        localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
        this.updateStatsDisplay();
    }
    
    // Calculate basic stats like TDEE
    calculateBasicStats() {
        if (this.userProfile.weight && this.userProfile.height && this.userProfile.age) {
            // Basic BMR calculation (Mifflin-St Jeor)
            const bmr = 10 * this.userProfile.weight + 
                       6.25 * this.userProfile.height - 
                       5 * this.userProfile.age + 5; // Assuming male for now
            
            // Activity multipliers
            const activityMultipliers = {
                'sedentary': 1.2,
                'light': 1.375,
                'moderate': 1.55,
                'very': 1.725,
                'extra': 1.9
            };
            
            const multiplier = activityMultipliers[this.userProfile.activityLevel] || 1.2;
            this.userProfile.tdee = Math.round(bmr * multiplier);
        }
    }
    
    // Get formatted profile for AI
    getProfileForAI() {
        const parts = [];
        if (this.userProfile.age) parts.push(`Age: ${this.userProfile.age}`);
        if (this.userProfile.weight) parts.push(`Weight: ${Math.round(this.userProfile.weight)}kg`);
        if (this.userProfile.height) parts.push(`Height: ${this.userProfile.height}cm`);
        if (this.userProfile.activityLevel) parts.push(`Activity: ${this.userProfile.activityLevel}`);
        if (this.userProfile.goals) parts.push(`Goals: ${this.userProfile.goals}`);
        if (this.userProfile.restrictions) parts.push(`Restrictions: ${this.userProfile.restrictions}`);
        if (this.userProfile.tdee) parts.push(`TDEE: ${this.userProfile.tdee} calories`);
        
        return parts.length > 0 ? `User Profile: ${parts.join(', ')}` : '';
    }
}

export default UserProfileManager;