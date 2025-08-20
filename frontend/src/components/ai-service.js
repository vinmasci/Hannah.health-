// AI Service for Natural Conversations
// Integrates with Claude API for intelligent responses

class AIService {
    constructor(apiKey) {
        this.apiKey = apiKey || process.env.CLAUDE_API_KEY;
        this.apiUrl = 'https://api.anthropic.com/v1/messages';
        this.model = 'claude-3-sonnet-20240229'; // Using Sonnet for speed and cost efficiency
        
        // System prompt for Hannah
        this.systemPrompt = `You are Hannah, a friendly AI nutritionist helping users plan their meals. 

Your personality:
- Warm, encouraging, and supportive
- Knowledgeable about nutrition but not preachy
- Understanding of various health conditions including NAFLD, diabetes, and eating disorder recovery
- Focus on sustainable, healthy habits rather than quick fixes

Your current conversation flow should:
1. Gather information about the user's goals and health needs
2. Be sensitive to users who mention eating disorders or difficult relationships with food
3. Calculate appropriate calories and macros based on their activity level and goals
4. Generate meal suggestions that fit their preferences and restrictions

IMPORTANT weight loss guidelines:
- Recommend 0.5kg per week as the ideal sustainable pace
- Allow up to 1kg per week maximum if user specifically requests it
- NEVER recommend more than 1kg per week as it's unsafe
- If user asks for faster weight loss, explain health risks and guide to safe options
- Ensure minimum calories: 1200 for women, 1500 for men

Important guidelines:
- For ED recovery users, NEVER mention calories, weight loss, or numbers
- For medical conditions, provide evidence-based recommendations
- Always stay positive and encouraging
- Guide users back to the main conversation flow when they go off-topic
- Be natural and conversational, but keep responses concise (2-3 sentences max)

Current conversation context will be provided with each message.`;
    }

    async processUserInput(userInput, context) {
        try {
            // Build the messages array
            const messages = [
                {
                    role: 'system',
                    content: this.systemPrompt
                },
                {
                    role: 'assistant',
                    content: `Current context: User is at the "${context.currentFlow}" step. Profile so far: ${JSON.stringify(context.userProfile)}`
                },
                {
                    role: 'user',
                    content: userInput
                }
            ];

            // Add conversation history if available
            if (context.conversationHistory && context.conversationHistory.length > 0) {
                // Add last 5 messages for context
                const recentHistory = context.conversationHistory.slice(-5);
                recentHistory.forEach(msg => {
                    messages.splice(2, 0, {
                        role: msg.sender === 'hannah' ? 'assistant' : 'user',
                        content: msg.text
                    });
                });
            }

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: this.model,
                    messages: messages,
                    max_tokens: 200, // Keep responses concise
                    temperature: 0.7 // Some creativity but mostly consistent
                })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            return {
                message: data.content[0].text,
                nextFlow: this.determineNextFlow(userInput, context)
            };

        } catch (error) {
            console.error('AI Service error:', error);
            // Fallback to scripted response
            return this.getFallbackResponse(userInput, context);
        }
    }

    determineNextFlow(userInput, context) {
        // Analyze user input to determine next conversation flow
        const currentFlow = context.currentFlow;
        const lowerInput = userInput.toLowerCase();

        // Check for weight loss intent at mainGoal stage
        if (currentFlow === 'mainGoal') {
            if (lowerInput.includes('weight') || lowerInput.includes('lose') || 
                lowerInput.includes('diet') || lowerInput.includes('slim')) {
                return 'weightLossPace';
            }
            if (lowerInput.includes('health') || lowerInput.includes('medical') || 
                lowerInput.includes('condition') || lowerInput.includes('doctor')) {
                return 'healthCondition';
            }
        }

        // Map current flow to likely next steps
        const flowMap = {
            'mainGoal': 'healthyEating', // default if unclear
            'dailySteps': 'exerciseAge',
            'exerciseAge': 'showScience',
            'healthCondition': 'healthGoal',
            'healthGoal': 'activityLevel',
            'weightLossPace': 'activityLevel',
            'activityLevel': 'dailySteps',
            'householdSize': 'startWellnessPlan',
            'healthyEating': 'householdSize'
        };

        // Check for special cases
        if (lowerInput.includes('eating disorder') || lowerInput.includes('relationship with food')) {
            return 'edRecovery';
        }

        if (lowerInput.includes('skip') || lowerInput.includes('myself') || lowerInput.includes('manual')) {
            return 'minimizeChat';
        }

        // Return mapped next flow or stay on current
        return flowMap[currentFlow] || currentFlow;
    }

    getFallbackResponse(userInput, context) {
        // Intelligent fallback when API is unavailable
        const responses = {
            'dailySteps': {
                message: "Got it! I'll note that down. Now, could you tell me about your exercise routine and age?",
                nextFlow: 'exerciseAge'
            },
            'exerciseAge': {
                message: "Thanks for sharing! Let me calculate your personalized nutrition plan based on this information.",
                nextFlow: 'showScience'
            },
            'healthCondition': {
                message: "Thank you for sharing that with me. I'll make sure to create a plan that supports your health needs. What's your main goal - weight loss, maintenance, or muscle gain?",
                nextFlow: 'healthGoal'
            },
            default: {
                message: "I understand! Let me help you with that. Could you tell me a bit more about your goals?",
                nextFlow: context.currentFlow
            }
        };

        return responses[context.currentFlow] || responses.default;
    }

    // Extract structured data from natural language
    parseUserData(userInput, dataType) {
        const lowerInput = userInput.toLowerCase();
        
        switch(dataType) {
            case 'steps':
                const stepsMatch = userInput.match(/(\d{1,2}),?(\d{3})|(\d{4,5})/);
                if (stepsMatch) {
                    return parseInt(stepsMatch[0].replace(',', ''));
                }
                // Interpret descriptive answers
                if (lowerInput.includes('sedentary') || lowerInput.includes('not many')) return 3000;
                if (lowerInput.includes('moderate') || lowerInput.includes('average')) return 7000;
                if (lowerInput.includes('active') || lowerInput.includes('a lot')) return 12000;
                return 5000; // default

            case 'age':
                const ageMatch = userInput.match(/\b([2-7]\d)\b/);
                return ageMatch ? parseInt(ageMatch[1]) : 35; // default to 35

            case 'exercise':
                if (lowerInput.includes('never') || lowerInput.includes("don't")) return 0;
                const freqMatch = userInput.match(/(\d)\s*(?:x|times?|days?)/i);
                return freqMatch ? parseInt(freqMatch[1]) : 0;

            case 'condition':
                if (lowerInput.includes('fatty liver') || lowerInput.includes('nafld')) return 'NAFLD';
                if (lowerInput.includes('diabetes')) return 'diabetes';
                if (lowerInput.includes('cholesterol') || lowerInput.includes('heart')) return 'heart_health';
                if (lowerInput.includes('eating') || lowerInput.includes('recovery')) return 'ED_recovery';
                return 'general';

            default:
                return userInput;
        }
    }
}

// For browser environment
if (typeof window !== 'undefined') {
    window.AIService = AIService;
}

// For Node.js environment
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AIService;
}