# MealPeace - Compassionate Meal Planning App

## Executive Summary
A dual-mode meal planning app serving both medical nutrition therapy (NAFLD, diabetes, high cholesterol) and eating disorder recovery needs. Built with Duolingo-style friendliness to make meal planning peaceful, not stressful.

## The Problem We're Solving
- **Medical patients** need nutrition tracking without diet culture obsession
- **ED recovery individuals** need meal structure without triggering numbers
- **No existing app** serves both needs safely
- **Current apps** (MyFitnessPal, Noom) can harm recovery or create unhealthy obsessions

## Our Solution: Dual-Mode Architecture

### Medical Mode
- Shows relevant nutrients for specific conditions
- Tracks symptoms, not just weight
- Doctor-friendly export reports
- Evidence-based meal suggestions
- Progress without obsession

### ED-Safe Mode  
- Completely hidden numbers (calories, weight, macros)
- Focus on variety and balance
- Mood and energy tracking
- Celebration of nourishment
- No triggering language or features

## Core Features (MVP - 3 Months)

### Month 1: Foundation
- ✅ User authentication with mode selection
- ✅ Drag-and-drop meal planning interface
- ✅ Basic food database (expandable)
- ✅ Visual portion sizing (plate method)
- ✅ Save and load meal plans

### Month 2: Dual-Mode Features
- ✅ Toggle system for hiding/showing nutrition
- ✅ Symptom and mood tracking
- ✅ Recipe library with filters
- ✅ Shopping list generation
- ✅ Progress tracking (non-scale victories)

### Month 3: Launch Features
- ✅ Stripe payment integration
- ✅ Free vs Premium tiers
- ✅ Data export for healthcare providers
- ✅ Basic analytics and insights
- ✅ Mobile responsive design

## Design Philosophy (Duolingo-Inspired)

### Visual Design
- **Friendly and approachable** (not clinical)
- **Celebratory** animations and feedback
- **Soft, calming colors** (no aggressive reds)
- **Rounded corners** and playful elements
- **Large, accessible buttons**

### Language Design
- ✅ "Nourishment" not "diet"
- ✅ "Progress" not "weight loss"  
- ✅ "Celebration meal" not "cheat meal"
- ✅ "Movement" not "exercise to burn"
- ✅ "Learning opportunity" not "failure"

### User Experience
- **Minimal cognitive load** (simple choices)
- **Positive reinforcement** (celebrate small wins)
- **No pressure or guilt** (missed days are okay)
- **Customizable experience** (hide triggering features)
- **Professional yet warm** (trustworthy but not intimidating)

## Technical Architecture

### Frontend
```javascript
Stack:
- React 18 (UI framework)
- TypeScript (type safety)
- Vite (build tool)
- Tailwind CSS (styling)
- @dnd-kit (drag-and-drop)
- Zustand (state management)
- TanStack Query (data fetching)
```

### Backend
```javascript
Stack:
- Supabase (PostgreSQL database)
- Supabase Auth (authentication)
- Supabase Realtime (live updates)
- Supabase Storage (images)
- Row Level Security (data privacy)
```

### Integrations
```javascript
APIs:
- Stripe (payments)
- Nutritionix or Spoonacular (nutrition data)
- SendGrid/Resend (emails)
- Mixpanel (analytics - privacy-focused)
```

## Database Schema

### Core Tables
```sql
users
- id (uuid)
- email
- mode_preference (medical/ed-safe/balanced)
- created_at
- subscription_status

meal_plans
- id
- user_id
- date
- meals (jsonb)
- created_at

foods
- id
- name
- nutrition_data (jsonb - optional display)
- category
- safe_for_conditions (array)

progress
- id
- user_id
- date
- type (symptom/mood/energy/victory)
- value (flexible based on type)
- notes
```

## User Acquisition Strategy

### Phase 1: Warm Launch (Month 1)
- Personal network (30 users)
- Medical team referrals (20 users)
- Build in public audience (50 users)

### Phase 2: Community Growth (Month 2)
- Reddit communities (respectful sharing)
- Facebook support groups (with permission)
- Healthcare provider outreach
- Beta tester referrals

### Phase 3: Content Marketing (Month 3+)
- SEO blog content
- Social media presence
- Video demonstrations
- Partnership development

## Monetization Model

### Pricing Tiers
- **Free Forever**: 7-day meal planning, 10 recipes
- **MealPeace Plus** ($9.99/month):
  - Unlimited meal planning
  - Full recipe library
  - Shopping lists
  - Progress tracking
  - Export features
- **Professional** ($49/month):
  - Multiple profiles
  - Client management
  - White label options
  - Priority support

### Revenue Projections
- Month 3: 10 paying users = $100 MRR
- Month 6: 100 paying users = $1,000 MRR
- Month 12: 1,000 paying users = $10,000 MRR

## Safety & Compliance

### Medical Safety
- "Not medical advice" disclaimers
- Clinical advisor validation
- Evidence-based information
- Healthcare provider collaboration

### ED Recovery Safety
- Crisis resource links
- Trigger warnings where needed
- No before/after photos
- No comparison features
- Community moderation

### Data Privacy
- HIPAA compliance considerations
- GDPR compliance
- Encrypted sensitive data
- User data ownership
- Clear privacy policy

## Success Metrics

### User Metrics
- Sign-up to activation rate (>60%)
- Week 2 retention (>50%)
- Free to paid conversion (>10%)
- Monthly churn (<5%)
- NPS score (>50)

### Health Outcomes
- Symptom improvement tracking
- Mood stability scores
- Provider recommendations
- User testimonials
- Clinical validation

### Business Metrics
- MRR growth (20% month-over-month)
- CAC < $50
- LTV > $300
- Payback period < 6 months

## Competitive Analysis

### Direct Competitors
None - no app currently serves both medical and ED recovery needs

### Indirect Competitors
- **MyFitnessPal**: Number-obsessed, triggering for ED
- **Lose It**: Weight-focused, harmful name
- **Noom**: Psychology-based but diet-culture focused
- **Recovery Record**: ED-focused but lacks meal planning

### Our Advantages
- Dual-mode serving both audiences
- Clinical validation
- Personal founder story
- Community-driven development
- Ethical monetization

## Development Timeline

### Week 1-2: Foundation
- Project setup and architecture
- Authentication and database
- Basic UI components
- Landing page live

### Week 3-4: Core Meal Planning
- Drag-and-drop interface
- Food database structure
- Meal saving/loading
- Mode switching system

### Week 5-6: Medical Features
- Condition-specific filtering
- Symptom tracking
- Relevant nutrient display
- Progress analytics

### Week 7-8: ED-Safe Features
- Number hiding system
- Mood/energy tracking
- Variety encouragement
- Peaceful UI elements

### Week 9-10: Monetization
- Stripe integration
- Subscription management
- Free/paid feature gates
- Payment UI

### Week 11-12: Launch Prep
- Beta testing
- Bug fixes
- Performance optimization
- Launch materials

## Marketing Strategy

### Build in Public
- Daily Twitter updates
- Weekly blog posts
- Monthly video demos
- Transparent metrics

### Content Marketing
- "Living with NAFLD" series
- "Peaceful meal planning" guides
- "Recovery-safe nutrition" content
- SEO-optimized articles

### Community Building
- Discord server for users
- Weekly meal planning sessions
- Success story sharing
- Peer support groups

### Partnerships
- ED treatment centers
- Gastroenterology practices
- Registered dietitians
- Telehealth platforms

## Future Roadmap (Post-MVP)

### Phase 2 (Months 4-6)
- Mobile apps (React Native)
- Barcode scanning
- Recipe import from URLs
- Family meal planning
- Grocery delivery integration

### Phase 3 (Months 7-9)
- AI meal suggestions
- Nutrition coaching integration
- Insurance reimbursement
- White-label solutions
- API for developers

### Phase 4 (Months 10-12)
- International expansion
- Multiple language support
- Cultural food databases
- B2B enterprise features
- Acquisition preparation

## Team & Advisors

### Core Team
- **Founder/Developer**: Solo founder with AI assistance
- **Clinical Advisors**: 
  - RD specializing in eating disorders
  - Gastroenterologist/Hepatologist
  - Mental health professional

### Support Network
- Beta testing community (30+ users)
- Build in public audience
- Healthcare provider network
- Technical mentors

## Investment & Resources

### Monthly Costs
- Development tools: $200-300
- Clinical advisors: $500-1000
- Marketing: $200-500
- **Total**: $900-1800/month

### One-Time Costs
- Design assets: $500
- Legal/compliance: $1000
- Brand development: $500
- **Total**: $2000

## Exit Strategy

### Potential Acquirers
- Supermarket chains (Kroger, Whole Foods)
- Health platforms (Headspace Health, Noom)
- Medical companies (Teladoc, Ro)
- Nutrition platforms (MyFitnessPal, Lose It)

### Value Proposition for Acquisition
- Unique dual-mode technology
- Underserved market capture
- Clinical validation
- Strong user retention
- Ethical brand positioning

---

**"Building meal planning for healing, not dieting"**

*Start Date: [Today]
Soft Launch: 3 months
Goal: $10k MRR in 12 months*