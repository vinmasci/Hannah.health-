// AI Service - Uses backend proxy for secure API calls
class AIService {
    constructor() {
        // Use Vite's proxy - /api routes to backend on port 3001
        this.apiUrl = '/api';
    }
    
    async chat(userInput, context) {
        try {
            console.log('Sending to AI with history:', context.conversationHistory);
            const response = await fetch(`${this.apiUrl}/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: userInput,
                    context: context,
                    conversationHistory: context.conversationHistory
                })
            });
            
            if (!response.ok) {
                throw new Error('AI API error');
            }
            
            const data = await response.json();
            
            // Return in expected format
            return {
                message: data.message || "Let me think about that..."
            };
            
        } catch (error) {
            console.error('AI Service error:', error);
            // Return fallback response
            return this.getFallbackResponse(userInput, context);
        }
    }
    
    getFallbackResponse(userInput, context) {
        // Smart fallbacks based on context
        const lower = userInput.toLowerCase();
        
        // CRITICAL: If they mention health condition, ask about it!
        if (lower.includes('health') && lower.includes('condition')) {
            return { message: "I understand. Could you tell me a bit more about what you're managing? This helps me suggest the right meals for you." };
        }
        
        if (lower.includes('medical') || lower.includes('doctor')) {
            return { message: "I see. What condition are you working with? I'll make sure to create meals that support your health." };
        }
        
        if (lower.includes('weight') || lower.includes('lose')) {
            return { message: "I can help with that! A pace of 0.5-0.75kg per week preserves muscle and keeps weight off long-term. Faster loss often backfires - your metabolism slows and the weight returns. Does that sound reasonable?" };
        }
        
        if (lower.includes('fatty liver') || lower.includes('nafld')) {
            return { message: "Thank you for sharing that. For NAFLD, we'll focus on meals rich in omega-3s, fiber, and antioxidants while limiting saturated fats - this helps promote fat reduction in the liver. Are you also looking to lose weight, or maintain where you are?" };
        }
        
        if (lower.includes('diabetes')) {
            return { message: "Got it - I'll focus on meals that help keep blood sugar stable. Are you looking to lose weight as well, or maintain your current weight?" };
        }
        
        if (lower.includes('meal') || lower.includes('food')) {
            return { message: "Let's create a meal plan that works for you. Are there any foods you particularly love or want to avoid?" };
        }
        
        if (context.messageCount > 5) {
            return { message: "I think I have enough to get started with your meal plan. Let me put something together for you!" };
        }
        
        return { message: "That's helpful to know! Do you happen to track your daily steps? Even a rough estimate helps me calculate your needs better." };
    }
}

export default AIService;