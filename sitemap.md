# Hannah Health - Project Sitemap & File Directory

## 📁 Project Structure Overview

```
/Kanban/
├── 🌐 Frontend Pages (HTML)
├── 📱 JavaScript Modules
├── 🎨 Stylesheets (CSS)
├── 🔧 Backend Services
├── 📚 Documentation
├── ⚙️ Configuration Files
└── 🚀 Frontend App (React/Vite)
```

---

## 🌐 Frontend Pages (HTML Files)

### Core Application Pages

#### `index.html`
**Purpose:** Main meal planning application interface  
**Features:**
- Weekly meal planner with drag-and-drop functionality
- Category pills for macro groups (proteins, carbs, vegetables, etc.)
- AI recipe search integration
- Barcode scanner modal
- Shopping list generation
- Favorites management
**Status:** Active production page

#### `agent-kanban.html`
**Purpose:** AI-powered Kanban board variation of the meal planner  
**Features:**
- Agent-based task management for meal planning
- Visual Kanban columns for meal organization
- Gradient purple design theme
- Simplified drag-and-drop interface
**Status:** Alternative implementation

#### `landing-page.html`
**Purpose:** Marketing and onboarding landing page  
**Features:**
- Product introduction and value proposition
- Call-to-action for user signup
- Feature highlights
- Testimonials section
**Status:** Entry point for new users

### AI Chat Components

#### `ai-chat.html`
**Purpose:** Full AI chat interface for meal planning assistance  
**Features:**
- Conversational UI with Hannah AI assistant
- ABC-style quick response options
- Skip AI option for manual planning
- Mock meal board for testing
- Integration with conversation flows
**Status:** Testing/development interface

#### `ai-chat-simple.html`
**Purpose:** Simplified version of AI chat for embedded use  
**Features:**
- Minimal chat interface
- Basic conversation functionality
- Lightweight implementation
**Status:** Component for integration

### Wireframes & Prototypes

#### `wireframe.html`
**Purpose:** Original basic wireframe for meal planner  
**Description:** Initial concept layout for the application structure

#### `wireframe-trello-style.html`
**Purpose:** Trello-inspired board layout prototype  
**Description:** Explores column-based meal organization similar to Trello boards

#### `wireframe-modular.html`
**Purpose:** Modular component-based design exploration  
**Description:** Tests modular approach to meal planning interface

#### `wireframe-pills-top.html`
**Purpose:** Design with category pills at the top  
**Description:** Alternative layout with macro category pills positioned above the board

#### `meal-planner-shadcn.html`
**Purpose:** ShadCN UI library implementation test  
**Description:** Explores using ShadCN components for modern UI design

#### `reset-kanban.html`
**Purpose:** Clean slate Kanban board implementation  
**Description:** Minimal Kanban board for testing core functionality

---

## 📱 JavaScript Modules

### Core Application Logic

#### `app.js`
**Purpose:** Main application controller and state management  
**Functionality:**
- Food database with nutritional information
- Meal plan state management
- Drag-and-drop functionality
- Daily totals calculation
- Shopping list generation
- Local storage persistence
**Dependencies:** Works with storage.js, favorites-manager.js

#### `storage.js`
**Purpose:** Local storage management and data persistence  
**Functionality:**
- Save/load meal plans
- Manage user preferences
- Cache API responses
- Handle data serialization
**Usage:** Core utility for all data persistence

### AI & Conversation System

#### `conversation-flows.js`
**Purpose:** Defines AI conversation tree and user journey  
**Functionality:**
- Conversation flow definitions
- User profile building logic
- TDEE and calorie calculations
- Dynamic response routing
- Multiple conversation paths (medical, ED recovery, wellness)
**Key Feature:** UserProfile class for managing user data

#### `ai-service.js`
**Purpose:** Claude API integration service  
**Functionality:**
- API communication with Claude
- Natural language processing
- Context-aware response generation
- User input parsing
- Fallback response handling
**API:** Anthropic Claude API integration

#### `ai-chat.js`
**Purpose:** AI chat UI controller  
**Functionality:**
- Message rendering and display
- User input handling
- ABC option management
- Chat state management
- Integration with ai-service.js

#### `ai-chat-simple.js`
**Purpose:** Simplified AI chat implementation  
**Functionality:**
- Basic chat functionality
- Minimal UI requirements
- Lightweight message handling

### API Integrations

#### `spoonacular-client.js`
**Purpose:** Spoonacular recipe API client  
**Functionality:**
- Recipe search with filters
- Nutrition information retrieval
- Diet-specific filtering
- Recipe details fetching
**API:** Spoonacular Food API

#### `fatsecret-client.js`
**Purpose:** FatSecret nutrition API client  
**Functionality:**
- Barcode lookup
- Food database search
- Detailed nutrition data
- OAuth authentication handling
**API:** FatSecret Platform API

#### `fatsecret-proxy.js`
**Purpose:** Server-side proxy for FatSecret API  
**Functionality:**
- Secure API key management
- Request proxying
- Response caching
- CORS handling

#### `recipe-ai.js`
**Purpose:** AI-powered recipe search and suggestions  
**Functionality:**
- Natural language recipe search
- AI-enhanced query parsing
- Recipe recommendation logic
- Integration with Spoonacular

### Feature Modules

#### `barcode-scanner.js`
**Purpose:** Barcode scanning functionality  
**Functionality:**
- Camera access and control
- Barcode detection using Quagga.js
- Product lookup via FatSecret API
- UI modal management
**Library:** Quagga.js for barcode detection

#### `favorites-manager.js`
**Purpose:** Manage user's favorite meals  
**Functionality:**
- Save/load favorite meals
- Quick-add to meal plan
- Favorite meal organization
- Modal UI for favorites selection

#### `config.js`
**Purpose:** Application configuration  
**Functionality:**
- API key management
- Environment variables
- Feature flags
- Default settings

---

## 🎨 Stylesheets

#### `styles-clean.css`
**Purpose:** Main clean design stylesheet  
**Description:** Primary styles for the production meal planner with clean, modern design

#### `styles-gradient.css`
**Purpose:** Gradient theme styles  
**Description:** Purple gradient theme for enhanced visual appeal

#### `styles.css`
**Purpose:** Base/legacy styles  
**Description:** Original stylesheet, being phased out

#### `ai-chat.css`
**Purpose:** AI chat component styles  
**Description:** Styles specific to the AI chat interface

---

## 🔧 Backend Services

### Main Server

#### `server.js`
**Purpose:** Main Express server (root level)  
**Functionality:**
- Basic server setup
- API routing
- Static file serving
**Note:** Being replaced by backend/server.js

#### `backend/server.js`
**Purpose:** Production Express server  
**Functionality:**
- Express middleware setup (Helmet, CORS, Morgan)
- API route mounting
- Environment configuration
- Error handling
- Production static file serving
**Port:** 3001 (configurable)

#### `backend/routes/ai.js`
**Purpose:** AI-related API endpoints  
**Endpoints:**
- `POST /api/ai/chat` - Claude chat interactions
- `POST /api/ai/recipe-search` - AI-enhanced recipe search
- `GET /api/ai/health` - Health check endpoint
**Features:** Claude API integration, Spoonacular integration

---

## 📚 Documentation

### Project Documentation

#### `project-charter.md`
**Purpose:** Business plan and project vision  
**Contents:**
- Mission statement and values
- Business model (Freemium SaaS)
- Target user personas
- Development timeline
- Success metrics
- Tech stack decisions

#### `database_documentation.md`
**Purpose:** Complete database schema documentation  
**Contents:**
- Supabase PostgreSQL schema
- Table structures and relationships
- Row-level security policies
- API endpoint suggestions
- Migration strategy

#### `context.md`
**Purpose:** Comprehensive project context  
**Contents:**
- Project overview
- Technical architecture
- Key components
- User flows
- Development guidelines

#### `sitemap.md`
**Purpose:** This file - complete file directory and descriptions

### Feature Documentation

#### `ai-onboarding-v2.md`
**Purpose:** AI conversation design document  
**Contents:**
- Conversation flow strategies
- User journey mapping
- Response templates
- Personalization logic

#### `ai-onboarding-agent.md`
**Purpose:** Original AI agent specifications  
**Contents:**
- Agent behavior guidelines
- Conversation patterns
- Integration requirements

#### `macro_logic_guide.md`
**Purpose:** Nutrition calculation logic  
**Contents:**
- TDEE calculations
- Macro distribution formulas
- Calorie deficit/surplus logic
- Medical condition adjustments

#### `user_lifecycle_document.md`
**Purpose:** User journey and lifecycle management  
**Contents:**
- User onboarding flow
- Engagement strategies
- Retention tactics
- Upgrade paths

### Development Documentation

#### `project-structure.md`
**Purpose:** Technical project structure  
**Contents:**
- Directory organization
- Module dependencies
- Build process
- Deployment strategy

#### `week1-action-plan.md`
**Purpose:** Initial development sprint plan  
**Contents:**
- Week 1 priorities
- Task breakdown
- Success criteria

#### `agents-responsibilities.md`
**Purpose:** AI agent role definitions  
**Contents:**
- Agent types and capabilities
- Responsibility boundaries
- Interaction patterns

#### `meal-planner-app.md` & `meal-planner-app-updated.md`
**Purpose:** Application specifications  
**Contents:**
- Feature requirements
- User stories
- Technical specifications

#### `README-BARCODE.md`
**Purpose:** Barcode scanning implementation guide  
**Contents:**
- Setup instructions
- API configuration
- Usage examples

---

## ⚙️ Configuration Files

#### `package.json` (root)
**Purpose:** Root package configuration  
**Scripts:**
- `dev`: Concurrent backend and frontend development
- `build`: Frontend production build
- `start`: Backend production start
**Dependencies:** dotenv, concurrently

#### `backend/package.json`
**Purpose:** Backend dependencies and scripts  
**Dependencies:** Express, CORS, Helmet, Morgan, dotenv

#### `frontend/package.json`
**Purpose:** Frontend Vite configuration  
**Dependencies:** Vite, React (planned)

#### `supabase_schema.sql`
**Purpose:** Database schema definition  
**Contents:**
- Table definitions
- Indexes and constraints
- RLS policies
- Triggers and functions

#### `frontend/vite.config.js`
**Purpose:** Vite build configuration  
**Features:**
- Development server settings
- Build optimization
- Module resolution

---

## 🚀 Frontend App (React/Vite)

### Source Structure

#### `frontend/src/main.js`
**Purpose:** React app entry point  
**Status:** In development

#### `frontend/src/main-ai-chat.js`
**Purpose:** AI chat component entry  
**Status:** In development

#### `frontend/src/main-meal-planner.js`
**Purpose:** Meal planner component entry  
**Status:** In development

### Components Directory

#### `frontend/src/components/`
**Contents:** React component library (in migration)
- ai-chat components
- meal-planner components
- shared UI components

### Services Directory

#### `frontend/src/services/`
**Contents:** Service layer for API calls
- `ai-service.js` - AI API interactions

### Styles Directory

#### `frontend/src/styles/`
**Contents:** Component-specific styles
- `ai-chat.css`
- `styles-clean.css`
- `additional.css`

---

## 🔄 Migration Status

### Active Migration
- Moving from vanilla JavaScript to React + Vite
- Transitioning from local storage to Supabase
- Implementing proper authentication
- Adding payment processing

### Deprecated Files
- Original `server.js` (root) - Use `backend/server.js`
- Various wireframe files - Reference only
- Some standalone HTML files - Being componentized

### Future Additions
- Testing directories (`__tests__/`)
- Build output (`dist/`)
- Environment files (`.env`)
- Docker configuration
- CI/CD pipeline files

---

## 📝 Notes

1. **Security:** All API keys should be in environment variables
2. **Development:** Use `npm run dev` for concurrent frontend/backend development
3. **Production:** Build frontend with `npm run build`, serve from backend
4. **Database:** Supabase handles authentication, RLS, and real-time updates
5. **AI Integration:** Claude API for conversations, Spoonacular for recipes
6. **Mobile:** Currently web-only, mobile responsiveness in progress

---

*Last Updated: January 2025*  
*Version: 1.0.0*