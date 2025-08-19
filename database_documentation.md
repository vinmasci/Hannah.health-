# Hannah.health Database Schema Documentation

## Overview
This document describes the complete database schema for Hannah.health, a dual-mode meal planning application supporting both medical nutrition therapy and eating disorder recovery.

## Architecture Highlights
- **PostgreSQL** database hosted on Supabase
- **Row Level Security (RLS)** for data isolation
- **Dual-mode support** with flexible visibility controls
- **HIPAA-compliant** design for medical data
- **Optimized indexes** for performance

## Core Design Principles

### 1. Privacy First
- All user data is isolated using RLS policies
- Sensitive medical information is encrypted
- ED-safe mode can hide triggering numeric data

### 2. Flexibility
- Supports both medical and ED recovery modes
- Custom foods and recipes per user
- Flexible nutrition tracking (optional in ED-safe mode)

### 3. Performance
- Strategic indexes on frequently queried columns
- Materialized calculations for meal plan totals
- Efficient foreign key relationships

## Table Structure

### User Management

#### `profiles`
Extends Supabase auth.users with application-specific data.
- **Purpose**: Store user profile information
- **Key Fields**: 
  - `mode_preference`: medical, ed_safe, or balanced
  - `subscription_status`: free/premium tracking
- **Relationships**: One-to-many with most other tables

#### `user_preferences`
Stores detailed user preferences and settings.
- **Purpose**: Personalization and dietary requirements
- **Key Features**:
  - Medical conditions array for condition-specific recommendations
  - Toggle fields for hiding sensitive data (calories, weight, etc.)
  - Dietary preferences and restrictions
- **Privacy**: Only accessible by the owning user

### Food & Nutrition

#### `foods`
Master food database with nutrition information.
- **Purpose**: Central repository of food items
- **Key Features**:
  - Nutrition data per 100g standardization
  - Custom foods per user
  - Barcode support for scanning
  - Cost tracking for budget planning
- **Access**: Public foods visible to all, custom foods private

#### `recipes`
User-created and system recipes.
- **Purpose**: Store multi-ingredient meal preparations
- **Key Features**:
  - Aggregated nutrition per serving
  - Step-by-step instructions (JSONB)
  - Public/private visibility
  - Dietary tag support
- **Relationships**: Many-to-many with foods via recipe_ingredients

#### `recipe_ingredients`
Junction table linking recipes to foods.
- **Purpose**: Define recipe composition
- **Key Features**:
  - Flexible units and amounts
  - Optional ingredients support
  - Sort ordering for display

### Meal Planning

#### `meal_plans`
Daily meal plans for users.
- **Purpose**: Organize meals by date
- **Key Features**:
  - Unique constraint on user_id + date
  - Automatic total calculations via triggers
  - Template support for reusable plans
- **Performance**: Indexed on user_id and date for fast lookups

#### `meal_plan_items`
Individual items within a meal plan.
- **Purpose**: Store breakfast, lunch, dinner, snacks
- **Flexibility**: Can reference foods, recipes, or custom items
- **Key Features**:
  - Serving size adjustments
  - Custom nutrition override
  - Sort ordering within meal type

### Shopping & Lists

#### `shopping_lists`
Shopping lists generated from meal plans.
- **Purpose**: Aggregate ingredients for shopping
- **Key Features**:
  - Date range support
  - Archive functionality
  - Named lists for organization

#### `shopping_list_items`
Individual items on shopping lists.
- **Purpose**: Track needed ingredients
- **Key Features**:
  - Check-off functionality
  - Store category grouping
  - Quantity aggregation

### Progress Tracking

#### `progress_entries`
Flexible progress tracking for both modes.
- **Purpose**: Track various types of progress
- **Types Supported**:
  - Symptoms (medical mode)
  - Mood & energy (ED-safe mode)
  - Victories (non-scale wins)
  - Custom measurements
- **Flexibility**: Multiple value types (numeric, text, JSON)

#### `symptom_logs`
Detailed symptom tracking for medical users.
- **Purpose**: Track medical symptoms and triggers
- **Key Features**:
  - Severity scaling (1-10)
  - Trigger identification
  - Time-of-day tracking

#### `meal_feedback`
Satisfaction tracking for ED recovery.
- **Purpose**: Focus on food enjoyment vs numbers
- **Key Features**:
  - Satisfaction and fullness ratings
  - Enjoyment tracking
  - Non-numeric progress

### User Features

#### `saved_meals`
Favorite meals for quick planning.
- **Purpose**: Speed up meal planning
- **Key Features**:
  - Usage tracking
  - Quick-add to meal plans
  - Personal meal library

## Security Model

### Row Level Security (RLS)
Every table has RLS enabled with specific policies:

1. **Profile Data**: Users can only access their own data
2. **Foods**: Public foods visible to all, custom foods private
3. **Recipes**: Public/private visibility control
4. **Meal Plans**: Completely private to each user
5. **Progress**: All progress data is private

### Key Security Policies

```sql
-- Example: Users can only view their own meal plans
CREATE POLICY "Users can view own meal plans" 
ON public.meal_plans
FOR SELECT 
USING (auth.uid() = user_id);
```

## Performance Optimizations

### Indexes
Strategic indexes for common queries:
- `idx_meal_plans_user_date`: Fast meal plan lookups
- `idx_foods_name`: Quick food search
- `idx_foods_barcode`: Instant barcode scanning
- `idx_recipes_created_by`: User's recipe list

### Triggers
Automatic calculations and updates:
- `update_updated_at_column()`: Timestamp management
- `calculate_meal_plan_totals()`: Automatic nutrition totals
- `handle_new_user()`: Profile creation on signup

## Data Types & Enums

### Custom Enums
- `user_mode`: medical, ed_safe, balanced
- `medical_condition`: NAFLD, diabetes, etc.
- `meal_type`: breakfast, lunch, dinner, snack
- `dietary_preference`: vegan, keto, etc.
- `progress_type`: symptom, mood, energy, victory

## Migration Strategy

### Initial Setup
1. Run the main schema file: `supabase_schema.sql`
2. Enable Supabase Auth
3. Configure RLS policies
4. Set up triggers

### Future Migrations
- Each migration in separate numbered file
- Use Supabase migrations for version control
- Test in staging before production

## API Integration

### Suggested API Endpoints

```typescript
// Foods
GET    /api/foods           // Search foods
POST   /api/foods           // Create custom food
PUT    /api/foods/:id       // Update custom food
DELETE /api/foods/:id       // Delete custom food

// Meal Plans
GET    /api/meal-plans/:date     // Get meal plan for date
POST   /api/meal-plans           // Create/update meal plan
DELETE /api/meal-plans/:id       // Delete meal plan

// Recipes
GET    /api/recipes               // Browse recipes
POST   /api/recipes               // Create recipe
PUT    /api/recipes/:id          // Update recipe

// Shopping Lists
POST   /api/shopping-lists/generate  // Generate from date range
GET    /api/shopping-lists/:id       // Get specific list
PUT    /api/shopping-lists/:id       // Update list items

// Progress
POST   /api/progress              // Log progress entry
GET    /api/progress/:date-range  // Get progress history
```

## Best Practices

### When Adding New Tables
1. Always enable RLS
2. Add appropriate indexes
3. Create updated_at trigger
4. Document in this file
5. Add TypeScript types

### When Modifying Schema
1. Create migration file
2. Test locally first
3. Update TypeScript types
4. Update API documentation
5. Notify frontend team

## Backup & Recovery

### Backup Strategy
- Daily automated backups via Supabase
- Point-in-time recovery available
- Export critical data weekly

### Disaster Recovery
- RTO: 4 hours
- RPO: 24 hours
- Backup retention: 30 days

## Monitoring

### Key Metrics to Track
- Query performance (>100ms queries)
- Table sizes (especially meal_plan_items)
- Index usage statistics
- RLS policy performance

### Alerts
- Failed authentication attempts
- Slow queries (>500ms)
- High error rates
- Storage approaching limits

## Future Considerations

### Potential Optimizations
1. Partition meal_plans by month for large datasets
2. Add caching layer for foods database
3. Consider read replicas for analytics
4. Implement data archival for old meal plans

### Planned Features
1. Meal plan sharing (requires new permissions model)
2. Nutritionist collaboration (new role system)
3. Family accounts (account hierarchy)
4. API rate limiting (usage tracking)

## Support & Maintenance

### Common Issues
1. **Slow meal plan loading**: Check indexes on meal_plan_items
2. **RLS errors**: Verify user authentication
3. **Trigger failures**: Check function permissions
4. **Migration conflicts**: Use Supabase CLI for resolution

### Contact
- Database Admin: Backend Agent
- Schema Changes: Architecture Agent
- Performance Issues: Performance Agent
- Security Concerns: Security Agent

---

*Last Updated: January 19, 2025*
*Version: 1.0.0*