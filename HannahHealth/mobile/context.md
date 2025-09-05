# Hannah Health Mobile Context

## Known Issues
- **Dashboard rings not rendering on initial load** - CaloriesView inner/outer rings require scroll to appear. TabView with PageTabViewStyle causes lazy rendering. Multiple fixes attempted but unresolved.

## Project Overview
Hannah Health is an AI-powered nutrition tracking iOS app that uses conversational AI to help users log food through natural language and photos.

## Current Architecture

### Core Services
- **OpenAI Integration**: GPT-4o-mini for chat, GPT-4o for vision, exercise MET calculations
- **Brave Search**: Real-time nutrition data from web
- **Supabase Backend**: Cross-platform data persistence (see `SUPABASE-SETUP.md`)
- **HealthKit**: iOS health data integration (steps, workouts, active energy)

### Key Features
- Natural language food logging
- Photo-based meal recognition  
- Confidence scoring (60-95% based on data source)
- Real-time nutrition data from web search
- Database persistence ready (pending auth UI)
- **Multi-temporal dashboard**: Day, Week, and Month views with navigation
- **Mock data system**: 90 days of realistic historical data
- **Meal planning**: Weekly meal plans with Week 1 Magic unlock
- **Shopping lists**: Auto-generated from meal plans with category organization
- **Exercise logging**: Natural language exercise tracking with MET-based calorie calculations
- **Dual-source activity tracking**: Combines Apple Health workouts with manual logs
- **Weight tracking**: Historical weight logging with Supabase persistence
- **Multi-selection food logging**: Log meals with time-based snack categorization

### Data Flow
1. User sends message/photo to Hannah
2. System detects if input is food or exercise via keyword matching
3. For food: Brave Search fetches nutrition data if needed
4. For exercise: GPT calculates calories using MET values and user weight
5. OpenAI processes with appropriate context (food_logging or exercise_logging)
6. Confidence calculated based on source quality
7. Entry saved to Supabase with negative calories for exercise
8. Apple Health data integrated for steps and workouts

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

## Recent Changes (Session 22)
- Fixed critical TDEE calculation bugs (steps not adding, exercise using max instead of sum)
- Removed faulty deduplication logic that was zeroing out step calories
- Fixed AuthManager reference to use `user?.id.uuidString` instead of non-existent `currentUserId`
- Enhanced CaloriesView UI with TDEE/Target labels and proper component sizing
- Implemented multi-selection for meal + snack logging with time-based categorization
- Added weight tracking infrastructure with database schema and Swift models
- Fixed profile weight loading with notification listeners
- Updated ring chart colors and deficit display (thinner ring with stripes)
- Added delete confirmation alerts for activity log items
- Fixed calories remaining calculation to not double-count exercise
- **Part 2 Updates**:
  - Fixed database constraint to accept snack variants (morning/afternoon/evening snack)
  - Added decimal calorie support for foods like "0.67 calories"
  - Split combined meal+snack selections into separate database entries
  - Made all snacks 100% orange in ring chart
  - Added white separators between all ring segments for clarity
- **Part 3 Updates**:
  - Enhanced food extraction patterns (dash, no separator, decimals)
  - Added minimum 1 calorie logic to prevent zero values
  - Expanded exercise detection keywords (bike, swim, yoga, cardio, etc.)
  - Implemented meal type mapping (brunch→lunch, dessert→evening snack)
  - Improved robustness for edge cases

## Next Steps
1. Run weight_tracking_schema.sql in Supabase
2. Add date selector UI for logging to past dates
3. Implement multiple food item parsing in single message
4. Add weight unit conversion based on user preference
5. Add authentication UI (login/signup screens)
6. Connect auth flow to enable data persistence
7. Implement Insights tab with weight trend charts

## Important Notes
- Never use hardcoded nutrition values
- Confidence scores must come from actual data sources
- Android support planned (reason for Supabase over CloudKit)
- Database schema includes B2B nutritionist features

## References

### Core Documentation
- `ARCHITECTURE.md` - Complete mobile app architecture documentation
- `DEVELOPMENT-SUMMARY.md` - Quick overview and navigation to all sessions
- `SECURITY-AUDIT.md` - Security assessment and critical vulnerabilities

### Feature Documentation
- `AI-INTEGRATION.md` - AI services documentation
- `SUPABASE-SETUP.md` - Complete database setup and schema
- `MEAL-PLANNING.md` - Meal planning and shopping list features
- `DASHBOARD-VIEWS.md` - Multi-temporal dashboard system (day/week/month views)
- `UI-DESIGN.md` - Current UI architecture and design system

### Development History
- `sessions/` - Individual development session details
- `development-diary-archive.md` - Original consolidated diary (archived)