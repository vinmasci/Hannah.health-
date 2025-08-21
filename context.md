# Hannah Health - Project Context

## Project Overview

**Hannah Health** (MealPeace) is a dual-mode AI-powered meal planning application designed for people with medical conditions (NAFLD, diabetes, high cholesterol) and those in eating disorder recovery. The app provides a compassionate, personalized approach to meal planning that focuses on healing rather than dieting.

### Mission
Building the first meal planning app designed for healing, not dieting - serving people who need structure without obsession, nourishment without numbers, and progress without pressure.

### Core Features
- **Dual-Mode System**: Medical mode with health metrics and ED-safe mode that hides potentially triggering numbers
- **AI-Powered Onboarding**: Conversational flow to understand user needs and generate personalized meal plans
- **Drag-and-Drop Meal Planning**: Visual Kanban-style board for intuitive meal organization
- **Smart Recipe Search**: Natural language AI-powered recipe discovery
- **Barcode Scanning**: Quick food entry via barcode recognition
- **Favorites Management**: Save and reuse favorite meals
- **Shopping List Generation**: Automated shopping lists from meal plans
- **WhatsApp Integration**: Natural language food logging via WhatsApp messaging
- **Multi-Platform Sync**: Seamless data sync between WhatsApp, web app, and AI chat

## Technical Architecture

### Stack Overview
```
Frontend: HTML5, CSS3, Vanilla JavaScript (transitioning to React + Vite)
Backend: Node.js + Express
Database: Supabase (PostgreSQL)
AI Integration: Claude API (Anthropic)
APIs: Spoonacular (recipes), FatSecret (nutrition)
Deployment: Vercel (planned)
```

### Project Structure
```
/Kanban/
├── Frontend Layer
│   ├── index.html (main meal planner interface)
│   ├── agent-kanban.html (kanban board variation)
│   ├── ai-chat.html (AI chat component)
│   ├── landing-page.html (marketing page)
│   └── wireframe-*.html (various UI prototypes)
├── AI & Conversation
│   ├── conversation-flows.js (onboarding logic)
│   ├── ai-service.js (Claude API integration)
│   ├── ai-chat.js (chat UI logic)
│   └── recipe-ai.js (AI recipe search)
├── Core Features
│   ├── app.js (main application logic)
│   ├── storage.js (local storage management)
│   ├── favorites-manager.js (favorites functionality)
│   ├── barcode-scanner.js (barcode scanning)
│   └── meal-planner.js (meal planning logic)
├── API Clients
│   ├── spoonacular-client.js (recipe API)
│   ├── fatsecret-client.js (nutrition API)
│   └── fatsecret-proxy.js (API proxy)
├── Backend
│   ├── server.js (Express server)
│   └── routes/ai.js (AI endpoints)
├── Frontend (React/Vite - in progress)
│   ├── src/components/ (React components)
│   ├── src/services/ (service layer)
│   └── vite.config.js (build config)
└── Documentation
    ├── project-charter.md (business plan)
    ├── database_documentation.md (schema docs)
    ├── ai-onboarding-v2.md (conversation design)
    └── macro_logic_guide.md (nutrition logic)
```

## Key Components

### 1. AI Conversation System
- **Purpose**: Guide users through personalized onboarding
- **Implementation**: 
  - `conversation-flows.js`: Defines conversation tree and logic
  - `ai-service.js`: Handles Claude API interactions
  - `ai-chat.js`: Manages chat UI and user interactions
- **Features**:
  - ABC-style quick responses
  - Natural language processing
  - Context-aware responses
  - Progress tracking through conversation

### 2. Meal Planning Board
- **Purpose**: Visual drag-and-drop meal organization
- **Implementation**:
  - Kanban-style columns for days of the week
  - Category pills for macro groups (proteins, carbs, vegetables, etc.)
  - Real-time updates and local storage persistence
- **Features**:
  - Drag-and-drop interface
  - Meal categorization
  - Quick-add from favorites
  - Visual portion sizing

### 3. Recipe & Nutrition APIs
- **Spoonacular Integration**:
  - Complex recipe search with filters
  - Nutrition information
  - Diet-specific filtering
- **FatSecret Integration**:
  - Barcode lookup
  - Detailed nutrition data
  - Food database access

### 4. Backend Services
- **Express Server**: 
  - CORS-enabled for cross-origin requests
  - Helmet for security
  - Morgan for logging
- **AI Endpoints**:
  - `/api/ai/chat`: Claude-powered chat responses
  - `/api/ai/recipe-search`: AI-enhanced recipe search
  - Secure API key management

### 5. Database Schema (Supabase)
- **User Management**: Profiles, preferences, authentication
- **Food & Nutrition**: Foods, recipes, ingredients
- **Meal Planning**: Meal plans, meal items, templates
- **Progress Tracking**: Symptoms, mood, victories
- **Shopping**: Lists and list items
- **Security**: Row-level security for data isolation

## Platform Integration

### WhatsApp Bot
- **Purpose**: Frictionless daily food and exercise logging
- **Tech**: WhatsApp Business API + GPT-4o Mini
- **Features**:
  - Natural language food recognition
  - Photo-based meal logging
  - Automated reminders
  - Daily summaries
- **Cost**: ~$0.30/user/month for AI processing

### Multi-Platform Sync
- **Web App**: Meal planning and detailed analytics
- **WhatsApp**: Quick logging throughout the day
- **AI Chat**: Personalized guidance and support
- **Data Flow**: All platforms sync via Supabase in real-time

## User Flows

### 1. Onboarding Flow
```
Opening → Main Goal → Health Condition/Style → 
Activity Level → Daily Steps → Exercise/Age → 
Calorie Calculation → Meal Generation → 
Preferences → Finalization → Signup
```

### 2. Medical Mode Path
- Focuses on health condition management
- Shows relevant nutrients and metrics
- Tracks symptoms and medical markers
- Evidence-based recommendations

### 3. ED-Safe Mode Path
- Hides potentially triggering numbers
- Focuses on variety and nourishment
- Tracks mood and energy instead of weight
- Peaceful, encouraging interface

## Business Model

### Monetization Strategy
- **Free Tier**: 7-day meal planning
- **Premium ($9.99/mo)**: Unlimited planning + advanced features
- **Professional ($49/mo)**: For dietitians and therapists
- **Target**: $10k MRR within 12 months

### Growth Strategy
1. **Month 1-3**: MVP development and beta testing
2. **Month 4-6**: Content marketing and community building
3. **Month 7-12**: Paid acquisition and partnerships

## Current State & Next Steps

### Completed
- ✅ Core meal planning interface
- ✅ AI conversation system
- ✅ Recipe search integration
- ✅ Barcode scanning
- ✅ Backend API structure
- ✅ Database schema design
- ✅ Multiple UI prototypes

### In Progress
- 🔄 React/Vite migration
- 🔄 Supabase integration
- 🔄 User authentication
- 🔄 Payment integration

### Upcoming
- 📋 Production deployment
- 📋 Mobile responsiveness
- 📋 Performance optimization
- 📋 Clinical advisor integration
- 📋 Beta testing program

## Key Design Decisions

### 1. Dual-Mode Architecture
- Separate interfaces for medical vs. ED recovery users
- Configurable visibility of nutritional data
- Mode-specific progress tracking

### 2. AI-First Onboarding
- Natural conversation instead of forms
- Personalized plan generation
- Context-aware responses

### 3. Visual Meal Planning
- Kanban board metaphor for intuitive use
- Drag-and-drop for easy organization
- Category-based food organization

### 4. Privacy & Security
- Row-level security in database
- Encrypted sensitive data
- HIPAA-compliant design considerations

## Development Guidelines

### Code Style
- Clean, modular JavaScript
- Component-based architecture
- Clear naming conventions
- Comprehensive error handling

### Testing Approach
- Unit tests for core logic
- Integration tests for APIs
- User acceptance testing with beta users

### Deployment Strategy
- Vercel for frontend hosting
- Supabase for backend services
- Environment-based configuration
- Automated CI/CD pipeline

## API Keys & Configuration
- **Claude API**: AI conversation and recipe understanding
- **Spoonacular API**: Recipe database and search
- **FatSecret API**: Nutrition data and barcode lookup
- **Supabase**: Database and authentication
- All keys stored in environment variables

## Support & Resources

### Documentation

For detailed information about specific aspects of the project, see the following documentation:

#### Core Documentation
- **[sitemap.md](./sitemap.md)** - Complete file directory with detailed descriptions of every file and module
- **[project-charter.md](./project-charter.md)** - Business plan, mission, vision, target users, and monetization strategy
- **[database_documentation.md](./database_documentation.md)** - Complete Supabase PostgreSQL schema, tables, RLS policies, and migration strategy
- **[context.md](./context.md)** - This file - comprehensive project overview and architecture

#### AI & Conversation Design
- **[ai-onboarding-v2.md](./ai-onboarding-v2.md)** - Detailed conversation flow strategies and user journey mapping
- **[ai-onboarding-agent.md](./ai-onboarding-agent.md)** - Original AI agent specifications and behavior guidelines
- **[conversation-flows.js](./conversation-flows.js)** - Implementation of conversation logic and user paths

#### Technical Guides
- **[macro_logic_guide.md](./macro_logic_guide.md)** - TDEE calculations, macro distribution formulas, and medical condition adjustments
- **[user_lifecycle_document.md](./user_lifecycle_document.md)** - User onboarding flow, engagement strategies, and retention tactics
- **[project-structure.md](./project-structure.md)** - Technical architecture, module dependencies, and build process

#### Development Plans
- **[week1-action-plan.md](./week1-action-plan.md)** - Initial sprint priorities and task breakdown
- **[agents-responsibilities.md](./agents-responsibilities.md)** - AI agent types, capabilities, and interaction patterns
- **[meal-planner-app.md](./meal-planner-app.md)** & **[meal-planner-app-updated.md](./meal-planner-app-updated.md)** - Feature requirements and user stories

#### Implementation Guides
- **[README-BARCODE.md](./README-BARCODE.md)** - Barcode scanning setup, API configuration, and usage examples
- **[supabase_schema.sql](./supabase_schema.sql)** - Database schema definition file with tables, indexes, and triggers

### Target Audience
- People with NAFLD, diabetes, high cholesterol
- Individuals in eating disorder recovery
- Caregivers supporting family health
- Health-conscious individuals seeking structure

### Unique Value Proposition
The only meal planner that serves both medical nutrition needs and ED recovery with a compassionate, dual-mode approach that prioritizes healing over dieting.

---

*Last Updated: January 2025*
*Version: 1.0.0*