# Hannah Health Mobile Context

## Project Overview
Hannah Health is an AI-powered nutrition tracking iOS app that uses conversational AI to help users log food through natural language and photos.

## Current Architecture

### Core Services
- **OpenAI Integration**: GPT-4o-mini for chat, GPT-4o for vision
- **Brave Search**: Real-time nutrition data from web
- **Supabase Backend**: Cross-platform data persistence (see `SUPABASE-SETUP.md`)
- **HealthKit**: iOS health data integration

### Key Features
- Natural language food logging
- Photo-based meal recognition  
- Confidence scoring (60-95% based on data source)
- Real-time nutrition data from web search
- Database persistence ready (pending auth UI)

### Data Flow
1. User sends message/photo to Hannah
2. Brave Search fetches nutrition data if needed
3. OpenAI processes with search context
4. Confidence calculated based on source quality
5. Food entry saved to Supabase (when auth enabled)

### Project Structure
```
HannahHealth/
├── Core/
│   ├── Configuration/     # API keys and config
│   ├── Services/          # OpenAI, Brave, Supabase services
│   └── Models/            # Data models
├── Features/
│   ├── Chat/              # Main chat interface
│   ├── Dashboard/         # Modular dashboard (new pivot)
│   └── Today/             # Daily tracking view
└── SUPABASE-SETUP.md      # Complete database documentation
```

## Recent Changes
- Pivoted from Kanban board to modular dashboard design
- Fixed OpenAI API response format (content is string, not array)
- Removed all hardcoded nutrition values
- Implemented Supabase for cross-platform support
- Enhanced confidence scoring with real data sources

## Next Steps
1. Add authentication UI (login/signup screens)
2. Connect auth flow to enable data persistence
3. Implement user profile setup
4. Add data visualization for weekly trends

## Important Notes
- Never use hardcoded nutrition values
- Confidence scores must come from actual data sources
- Android support planned (reason for Supabase over CloudKit)
- Database schema includes B2B nutritionist features

## References
- `AI-INTEGRATION.md` - AI services documentation
- `SUPABASE-SETUP.md` - Complete database setup and schema
- `MEAL-PLANNING.md` - Meal planning and shopping list features
- `UI-DESIGN.md` - Current UI architecture and design system
- `SECURITY-AUDIT.md` - Security assessment and critical vulnerabilities
- `ARCHITECTURE.md` - Complete mobile app architecture documentation