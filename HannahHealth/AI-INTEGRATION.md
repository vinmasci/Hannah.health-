# Hannah Health AI Integration Documentation

## Overview
Hannah Health uses ChatGPT (OpenAI) and Brave Search to provide intelligent nutrition tracking, food recognition, and personalized dietary guidance.

## Architecture

### Service Layer
```
ChatViewModel
    ├── OpenAIService (GPT-4/GPT-4 Vision)
    ├── BraveSearchService (Web Search)
    └── NutritionConfidenceService (Confidence Scoring)
```

## OpenAI Integration

### Models Used
- **GPT-4o-mini**: Text conversations, general chat
- **GPT-4o**: Image analysis with Vision API

### Key Features
1. **Food Photo Analysis**
   - User takes/selects photo
   - GPT-4 Vision identifies food items
   - Estimates portions and calories
   - Returns brief logging confirmation

2. **Natural Language Processing**
   - Understands casual food descriptions
   - Handles restaurant queries
   - Provides calorie information
   - Suggests healthier alternatives

### API Configuration
```swift
struct APIConfig {
    static let openAIAPIKey = "sk-proj-..."
    static let model = "gpt-4o-mini"
    static let visionModel = "gpt-4o"
    static let maxTokens = 3000
    static let temperature = 0.7
}
```

## Brave Search Integration

### Purpose
Provides real-time nutrition data and restaurant menu information to enhance AI responses.

## Data Persistence

### Supabase Integration
Hannah Health uses Supabase for cross-platform data persistence and user authentication.

#### Configuration
- **Database Documentation**: See `SUPABASE-SETUP.md` for complete schema and setup details
- **Service**: `SupabaseService.swift` handles all database operations
- **Authentication**: Supports email/password auth with user profiles

#### Key Features
- **Food Entries**: All logged food saved with confidence scores
- **User Profiles**: Extended health data (weight, height, BMR)
- **B2B Support**: Nutritionist-client relationships with RLS
- **Weekly Summaries**: Auto-generated nutrition reports
- **Cross-Platform**: Works with iOS now, Android support ready

#### Data Flow
```
User logs food → ChatViewModel extracts nutrition → Saves to Supabase with confidence
```

**Note**: Authentication UI required before data persistence activates. Currently logs show "No user logged in, skipping Supabase save" until auth is implemented.

### Search Types
1. **Nutrition Data**: Calories, macros, serving sizes
2. **Restaurant Menus**: McDonald's, KFC, Subway, etc.
3. **Food Alternatives**: Healthier substitutions
4. **Recipe Information**: Ingredients and cooking methods

### Smart Query Enhancement
```swift
// Restaurant query
"McDonald's" → "McDonald's nutrition calories menu Australia"

// Calorie query
"calories in banana" → "banana calories nutrition facts"

// Healthier options
"healthier at KFC" → "KFC healthy alternatives low calorie options"
```

## Confidence Scoring System

### How It Works
The confidence score reflects the quality and source of nutrition data:

```swift
enum ConfidenceSource {
    case websiteOfficial     // 95% - mcdonalds.com
    case databaseVerified    // 90% - MyFitnessPal, USDA
    case commonFood         // 85% - Well-known foods
    case brandedProduct     // 80% - Branded without official
    case homemade          // 70% - Home cooking
    case estimated         // 65% - Search with limited data
    case userDescribed     // 50% - No search data
}
```

### Confidence Calculation Flow
1. User sends message/photo
2. Brave Search finds nutrition sources
3. Domains are analyzed for quality
4. Hannah's response is generated
5. Confidence is calculated based on:
   - Domain authority (official sites score higher)
   - Data specificity (exact calories vs estimates)
   - Food type (branded vs generic)

## Message Flow

### Text Message
```
User Input → Should Search? → Brave Search → OpenAI + Context → Response + Confidence
```

### Photo Message
```
Photo → Brave Search ("food calories") → GPT-4 Vision + Context → Food Identification → Response + Confidence
```

## System Prompts

### Hannah's Personality
```
You are Hannah, a professional AI nutritionist who helps users track their nutrition. 
You have access to real-time nutrition data through web search.

FOR FOOD LOGGING:
- Keep responses brief (one sentence)
- Include calorie counts when available
- Use search results for accuracy

FOR RESTAURANT QUERIES:
- Provide specific menu items with calories
- Suggest 2-3 healthier options
- Use exact calorie counts from search
```

## Implementation Details

### ChatViewModel Integration
```swift
func processMessage(_ text: String) async {
    // 1. Search for nutrition data
    if braveSearchService.shouldSearchForQuery(text) {
        let searchResult = try await braveSearchService.searchNutritionData(query: text)
        searchContext = searchResult.context
        searchDomains = searchResult.domains
    }
    
    // 2. Get AI response with context
    let response = try await openAIService.sendMessage(messages, searchContext: searchContext)
    
    // 3. Calculate confidence
    let confidence = confidenceService.calculateConfidence(
        for: response,
        searchDomains: searchDomains
    )
    
    // 4. Add to chat
    messages.append(ChatMessage(
        text: response,
        confidence: confidence
    ))
}
```

### Image Processing
```swift
func analyzeImage(_ imageData: Data) async {
    // 1. Search for general food nutrition
    let searchResult = try await braveSearchService.searchNutritionData("food calories")
    
    // 2. Analyze with GPT-4 Vision
    let response = try await openAIService.analyzeImage(
        imageData,
        searchContext: searchResult.context
    )
    
    // 3. Calculate confidence and add to chat
    // Similar to text flow
}
```

## Error Handling

### API Failures
- Missing API keys → User-friendly error message
- Network errors → Retry with exponential backoff
- Decoding errors → Fallback to basic response

### Search Failures
- No results → Continue without context
- Timeout → Use cached data if available
- Invalid query → Sanitize and retry

## Performance Optimizations

1. **Single Search**: Search once, use results for confidence and context
2. **Lazy Loading**: Images compressed before sending
3. **Caching**: Recent searches cached for 15 minutes
4. **Parallel Processing**: Search and message history built concurrently

## Testing Checklist

- [ ] Food photo recognition accuracy
- [ ] Restaurant menu lookups
- [ ] Calorie accuracy vs real data
- [ ] Confidence score consistency
- [ ] API error handling
- [ ] Search timeout handling
- [ ] Image size limits
- [ ] Response time < 3 seconds

## Future Enhancements

1. **Barcode Scanning**: Direct product lookup
2. **Voice Input**: Siri integration
3. **Meal Plans**: AI-generated weekly plans
4. **Recipe Analysis**: Full recipe breakdown
5. **Nutrition Coaching**: Personalized advice based on goals
6. **Multi-language**: Support for non-English queries

## API Rate Limits

### OpenAI
- GPT-4o-mini: 10,000 requests/min
- GPT-4o: 500 requests/min
- Monitor usage in dashboard

### Brave Search
- 2,000 searches/month (free tier)
- Consider caching for common queries
- Upgrade if needed

## Security Notes

1. API keys should be moved to Keychain for production
2. User photos never stored permanently
3. Search queries sanitized before sending
4. Confidence scores help users verify accuracy
5. HTTPS only for all API calls