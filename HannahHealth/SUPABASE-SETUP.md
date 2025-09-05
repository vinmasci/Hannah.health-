# Hannah Health Supabase Database Documentation

## Overview
Hannah Health uses Supabase for data persistence, user authentication, and real-time synchronization across devices. This enables the B2B nutritionist monitoring feature, the "Week 1 Magic" meal planning, and SMS food logging integration.

**Last Updated**: January 27, 2025
**Status**: ✅ Phone support migration applied successfully

## Connection Details
- **Project URL**: `https://YOUR_PROJECT_ID.supabase.co`
- **Anon Key**: `YOUR_SUPABASE_ANON_KEY`
- **Dashboard**: `https://app.supabase.com/project/YOUR_PROJECT_ID`

## Database Schema

### Core Tables

#### 1. `user_profiles` 📱 UPDATED
Extends Supabase auth.users with health-specific data and SMS support.
```sql
- id: UUID (Primary Key, references auth.users)
- email: Text
- full_name: Text
- phone_number: Text (UNIQUE) ✅ NEW
- phone_verified: Boolean ✅ NEW
- phone_verified_at: Timestamp ✅ NEW
- sms_enabled: Boolean (default: true) ✅ NEW
- sms_message_count: Integer (default: 0) ✅ NEW
- sms_last_message_at: Timestamp ✅ NEW
- weight_kg: Decimal (5,2)
- height_cm: Integer
- birth_date: Date
- gender: Text (male/female/other)
- activity_level: Text (sedentary/lightly_active/moderately_active/very_active/extremely_active)
- basal_metabolic_rate: Integer (default: 2200)
- daily_deficit_target: Integer (default: 500)
- tracking_mode: Text (full/macros_only/habits_only)
- is_nutritionist: Boolean
- subscription_tier: Text (free/premium/nutritionist)
- created_at: Timestamp
- updated_at: Timestamp
```

#### 2. `food_entries` ⭐
The main table for all food logging.
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → auth.users)
- food_name: Text (Required)
- calories: Integer (Required)
- protein: Decimal (8,2)
- carbs: Decimal (8,2)
- fat: Decimal (8,2)
- fiber: Decimal (8,2)
- sugar: Decimal (8,2)
- sodium: Decimal (8,2)
- confidence: Decimal (3,2) - 0.00 to 1.00
- confidence_source: Text (website_official/database_verified/etc)
- meal_type: Text (breakfast/lunch/dinner/snack)
- portion_size: Text
- brand: Text
- restaurant: Text
- image_url: Text
- notes: Text
- logged_via: Text (app/sms/web)
- created_at: Timestamp
```

#### 3. `chat_messages`
Stores conversation history with Hannah.
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → auth.users)
- message_text: Text (Required)
- is_user: Boolean (true for user, false for Hannah)
- confidence: Decimal (3,2)
- image_data: Text (Base64 encoded)
- food_entry_id: UUID (Links to food_entries)
- created_at: Timestamp
```

#### 4. `nutritionist_clients`
B2B feature - Links nutritionists to their clients.
```sql
- id: UUID (Primary Key)
- nutritionist_id: UUID (Foreign Key → auth.users)
- client_id: UUID (Foreign Key → auth.users)
- invite_code: Text (Unique)
- status: Text (pending/active/inactive)
- notes: Text
- created_at: Timestamp
- accepted_at: Timestamp
```

#### 5. `weekly_summaries`
Auto-generated weekly nutrition reports.
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → auth.users)
- week_start_date: Date
- avg_daily_calories: Integer
- avg_daily_protein: Decimal (8,2)
- avg_daily_carbs: Decimal (8,2)
- avg_daily_fat: Decimal (8,2)
- total_deficit: Integer
- pattern_insights: JSONB
- ai_recommendations: Text
- created_at: Timestamp
```

#### 6. `meal_plans`
AI-generated meal plans (Week 1 Magic feature).
```sql
- id: UUID (Primary Key)
- user_id: UUID (Foreign Key → auth.users)
- week_start_date: Date
- plan_data: JSONB (Full meal plan structure)
- is_active: Boolean
- created_at: Timestamp
```

## Database Triggers

### Auto-Create User Profile (Added Session 13)
```sql
-- Automatically creates user_profiles entry when user signs up
CREATE OR REPLACE FUNCTION create_profile_on_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (
    id, email, full_name,
    basal_metabolic_rate, daily_deficit_target,
    tracking_mode, subscription_tier,
    created_at, updated_at
  )
  VALUES (
    NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Friend'),
    2200, 500, 'full', 'free',
    NOW(), NOW()
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger runs after user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_profile_on_signup();
```

## Row Level Security (RLS)

All tables have RLS enabled for data privacy:

### User Data Protection
- Users can only see/edit their own data
- No cross-user data access
- Automatic enforcement at database level

### Nutritionist Access
Special policy allows nutritionists to view client data:
```sql
-- Nutritionists can view client food entries
EXISTS (
    SELECT 1 FROM nutritionist_clients
    WHERE nutritionist_id = auth.uid()
    AND client_id = food_entries.user_id
    AND status = 'active'
)
```

## Key Functions

### SMS-Specific Functions ✅ NEW

#### `get_user_by_phone(phone_number)`
Retrieves user info by verified phone number.
```sql
SELECT * FROM get_user_by_phone('+1234567890');
-- Returns: user_id, full_name, sms_enabled, message_count
```

#### `log_food_via_sms(phone, food, calories, meal_type, confidence)`
Logs food entry from SMS gateway.
```sql
SELECT log_food_via_sms(
    '+1234567890',
    '2 slices pizza',
    580,
    'lunch',
    0.85
);
-- Returns: UUID of created food_entry
```

#### `verify_phone_number(user_id, phone, code)`
Verifies SMS verification code.
```sql
SELECT verify_phone_number(
    'user-uuid',
    '+1234567890',
    '123456'
);
-- Returns: TRUE/FALSE
```

### Original Functions

### `get_daily_calories(user_id, date)`
Returns total calories consumed on a specific date.
```sql
SELECT get_daily_calories('user-uuid', '2025-01-27');
-- Returns: 1850
```

### `analyze_weekly_patterns(user_id)`
Analyzes eating patterns for meal plan generation.
```sql
SELECT analyze_weekly_patterns('user-uuid');
-- Returns: {
--   "avg_breakfast_time": 8.5,
--   "favorite_foods": ["Big Mac", "Coffee", "Greek Yogurt"],
--   "restaurant_frequency": 3
-- }
```

## iOS Integration

### Authentication Flow
```swift
// Sign up
let user = try await supabaseService.signUp(email, password)

// Sign in
let user = try await supabaseService.signInWithEmail(email, password)

// Sign out
try await supabaseService.signOut()
```

### Saving Food Entries
```swift
let foodEntry = FoodEntry(
    userId: currentUser.id,
    foodName: "Big Mac",
    calories: 563,
    confidence: 0.95,
    mealType: "lunch"
)
try await supabaseService.saveFoodEntry(foodEntry)
```

### Retrieving Data
```swift
// Today's food
let todaysFoods = try await supabaseService.getFoodEntries(for: Date())

// Weekly data
let weeklyFoods = try await supabaseService.getWeeklyFoodEntries()
```

## Data Flow

```
User logs food in app
        ↓
ChatViewModel processes
        ↓
Extracts: food name, calories, confidence
        ↓
Saves to Supabase food_entries
        ↓
Syncs across all devices
        ↓
Nutritionist can view (if linked)
```

## Performance Optimizations

### Indexes
- `idx_food_entries_user_id` - Fast user lookups
- `idx_food_entries_created_at` - Time-based queries
- `idx_food_entries_user_date` - Daily summaries
- `idx_chat_messages_user_id` - Chat history
- `idx_nutritionist_clients_*` - B2B relationships

### Query Examples

#### Get today's calories
```sql
SELECT SUM(calories) as total
FROM food_entries
WHERE user_id = auth.uid()
AND DATE(created_at) = CURRENT_DATE;
```

#### Find McDonald's patterns
```sql
SELECT DATE(created_at) as date, COUNT(*) as visits
FROM food_entries
WHERE user_id = auth.uid()
AND restaurant = 'McDonald''s'
GROUP BY DATE(created_at)
ORDER BY date DESC;
```

#### Get confidence distribution
```sql
SELECT 
  CASE 
    WHEN confidence >= 0.9 THEN 'High (90%+)'
    WHEN confidence >= 0.7 THEN 'Medium (70-89%)'
    ELSE 'Low (<70%)'
  END as confidence_level,
  COUNT(*) as count
FROM food_entries
WHERE user_id = auth.uid()
GROUP BY confidence_level;
```

## Backup & Recovery

Supabase automatically handles:
- Daily backups (7 day retention on free tier)
- Point-in-time recovery (Pro tier)
- Automatic failover

## Security Features

1. **SSL/TLS Encryption** - All connections encrypted
2. **Row Level Security** - Database-level access control
3. **API Key Rotation** - Can regenerate keys anytime
4. **Audit Logs** - Track all database changes (Pro tier)

## Common Operations

### Reset User's Data
```sql
-- Delete all user's food entries (careful!)
DELETE FROM food_entries WHERE user_id = 'user-uuid';
```

### Link Nutritionist to Client
```sql
INSERT INTO nutritionist_clients (nutritionist_id, client_id, status)
VALUES ('nutritionist-uuid', 'client-uuid', 'active');
```

### Generate Weekly Summary
```sql
INSERT INTO weekly_summaries (user_id, week_start_date, avg_daily_calories)
SELECT 
  user_id,
  DATE_TRUNC('week', CURRENT_DATE) as week_start,
  AVG(daily_total) as avg_calories
FROM (
  SELECT user_id, DATE(created_at) as day, SUM(calories) as daily_total
  FROM food_entries
  WHERE user_id = 'user-uuid'
  AND created_at >= CURRENT_DATE - INTERVAL '7 days'
  GROUP BY user_id, DATE(created_at)
) daily_totals
GROUP BY user_id;
```

## Monitoring & Debugging

### Check Database Size
Dashboard → Database → Statistics

### View Real-time Logs
Dashboard → Logs → API Logs

### Test Queries
Dashboard → SQL Editor

### Monitor RLS Policies
Dashboard → Authentication → Policies

## Future Enhancements

1. **Real-time Subscriptions** - Live updates when nutritionist views data
2. **Edge Functions** - Weekly summary generation
3. **Storage** - Food photos in Supabase Storage
4. **Vector Embeddings** - Smart food search
5. **Webhooks** - Trigger meal plan generation after 7 days

## Troubleshooting

### "User not authenticated" error
- Check if user is logged in: `supabaseService.getCurrentUser()`
- Verify auth token is valid
- Check RLS policies

### Data not saving
- Check console for errors
- Verify table permissions in dashboard
- Test with SQL editor directly

### Slow queries
- Add indexes for common queries
- Use pagination for large datasets
- Consider caching frequently accessed data

## Contact

- **Supabase Support**: https://supabase.com/support
- **Status Page**: https://status.supabase.com
- **Documentation**: https://supabase.com/docs