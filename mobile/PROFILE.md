# Hannah Health User Profile System

**Created**: January 29, 2025  
**Status**: Core implementation complete  
**Location**: `/Features/Profile/UserProfileView.swift`

## Overview
The user profile system manages personal information, tracking preferences, and app settings. It's designed to be minimal during onboarding but expandable as users engage with the app.

## Profile Fields

### Currently Implemented (Session 15)
- **full_name**: What the user wants to be called
- **birth_year**: Simple year input (stored as birth_date: YYYY-01-01)
- **height**: Feet/inches or cm based on metric preference (stored as height_cm)
- **weight**: Pounds or kg based on metric preference (stored as weight_kg)
- **phone_number**: With searchable country picker (195+ countries) and auto-formatting
- **prefer_metric**: Toggle between metric/imperial units
- **safe_mode**: Toggle for ED recovery users (hides weight/calorie data)

### To Be Implemented
- **tracking_mode**: Selected mode (ed_safe, weight_loss, etc.)
- **weight_kg**: Optional weight tracking
- **target_weight_kg**: Goal weight for weight loss mode
- **weekly_target**: 0.5 or 0.75 kg/week for weight loss
- **activity_level**: Sedentary to Very Active
- **health_conditions**: Optional medical conditions

## User Interface

### Profile Page Features
- **Full screen presentation** with dynamic time background
- **Direct field editing** - No separate edit mode, tap to edit
- **Unit toggles** - Switch between metric/imperial inline
- **Country picker** - Searchable list of 195+ countries with flags
- **Phone formatting** - Auto-format based on selected country
- **Keyboard toolbar** - "Done" button for number pads
- **Safe mode toggle** - Hide weight/calorie data
- **Sign out** with confirmation dialog
- **Close button** (X) to dismiss

### Visual Design
```
┌─────────────────────────────┐
│  X            Profile        │
│                              │
│        👤 (person icon)      │
│         Display Name         │
│      user@email.com          │
│                              │
│  ┌─────────────────────┐     │
│  │ What to call you?   │     │
│  │ Vincent             │     │
│  └─────────────────────┘     │
│                              │
│  ┌─────────────────────┐     │
│  │ Birth year          │     │
│  │ 1990                │     │
│  └─────────────────────┘     │
│                              │
│  ┌─────────────────────┐     │
│  │ Height         [in/cm]│    │
│  │ 5' 10" / 178 cm     │     │
│  └─────────────────────┘     │
│                              │
│  ┌─────────────────────┐     │
│  │ Weight        [lb/kg]│     │
│  │ 180 lbs / 82 kg     │     │
│  └─────────────────────┘     │
│                              │
│  ┌─────────────────────┐     │
│  │ Phone (for SMS)     │     │
│  │ [+1▼] 555-123-4567  │     │
│  └─────────────────────┘     │
│                              │
│  When [+1▼] tapped:          │
│  ┌─────────────────────┐     │
│  │ 🔍 Search country    │     │
│  │ 🇺🇸 United States +1 ✓│     │
│  │ 🇬🇧 United Kingdom +44│     │
│  │ 🇦🇺 Australia +61    │     │
│  │ ... (195+ countries) │     │
│  └─────────────────────┘     │
│                              │
│  [ ] Prefer Metric Units     │
│  [ ] Safe Mode (ED Recovery) │
│                              │
│  [   Save Changes    ]       │
│  [     Sign Out      ]       │
└─────────────────────────────┘
```

## Database Schema

### user_profiles table
```sql
-- Personal Information
full_name: Text
birth_date: Date (YYYY-01-01 for year only)
gender: Text (optional)
height_cm: Decimal
weight_kg: Decimal (optional)

-- Tracking Settings
tracking_mode: Text ('ed_safe', 'weight_loss', etc.)
mode_locked: Boolean (for ED-safe)
mode_lock_code: Text (hashed)

-- Goals (Weight Loss Mode)
target_weight_kg: Decimal
weekly_target: Decimal (0.5 or 0.75)
daily_calorie_target: Integer

-- Activity & Health
activity_level: Text
health_conditions: JSONB (array of conditions)
basal_metabolic_rate: Integer

-- Account Settings
phone_number: Text
phone_verified: Boolean
sms_enabled: Boolean
notification_preferences: JSONB
```

## Profile Update Flow

1. **User taps on any field**
   - Field becomes active/focused
   - Keyboard appears with "Done" button
   - Unit toggles appear for height/weight

2. **User modifies fields**
   - Local state updates
   - Phone numbers auto-format
   - Units convert on toggle

3. **User taps Save Changes**
   - Validate inputs
   - Call `authManager.updateProfile()`
   - Update Supabase
   - Refresh local profile

4. **Success/Error handling**
   - Show success feedback
   - Handle network errors gracefully
   - Revert on failure

## AuthManager Integration

```swift
// Update profile method
func updateProfile(
    fullName: String? = nil,
    birthYear: Int? = nil,
    phoneNumber: String? = nil,
    weightKg: Double? = nil,
    heightCm: Double? = nil,
    preferMetric: Bool? = nil
) async throws

// Profile model
struct UserProfile: Codable {
    let id: UUID
    let email: String
    let fullName: String?
    let birthDate: Date?
    let heightCm: Double?
    // ... other fields
}
```

## Mode Selection (To Be Implemented)

### During Onboarding
1. After basic info (name, year, height)
2. Present mode selection screen
3. Explain each mode clearly
4. Save to profile

### Mode Change Flow
1. Settings → Tracking Mode
2. Show current mode
3. Explain implications of change
4. ED-Safe mode requires confirmation
5. Update profile and refresh UI

## Privacy & Security

### Data Protection
- Profile data stored in Supabase
- RLS policies ensure users only see own data
- Sensitive fields (weight) are optional

### ED-Safe Considerations
- Mode lock prevents accidental switching
- No weight or calorie data visible
- Separate UI completely

## Future Enhancements

### Phase 2
- Profile photo upload
- Dietary preferences/restrictions
- Medication tracking
- Emergency contact

### Phase 3
- Export profile data
- Share with nutritionist
- Integration with HealthKit
- Progress photos (optional)

## Testing Checklist

- [x] Sign up creates basic profile
- [x] Direct field editing works
- [x] Save updates Supabase
- [x] Sign out clears session
- [x] Profile persists across sessions
- [x] Height conversion accurate (ft/in ↔ cm)
- [x] Weight conversion accurate (lbs ↔ kg)
- [x] Birth year validates correctly
- [x] Phone formatting works for US/Canada
- [x] Country code selector functions
- [x] Keyboard "Done" button dismisses
- [x] Metric preference toggles units
- [x] Safe mode toggle saves state

## Known Issues

1. **Profile not auto-creating on signup** ✅ FIXED
   - Fixed by creating profile in iOS after signup
   - Database trigger removed due to RLS issues

2. **Threading warnings** ✅ FIXED
   - Fixed with MainActor for UI updates

3. **Date decoding errors** ✅ FIXED (Session 15)
   - Added flexible date decoder supporting multiple formats
   - Made all UserProfile fields optional

4. **Profile data not persisting** ✅ FIXED (Session 15)
   - Fixed nil handling in UserProfile model
   - Improved error handling in fetchUserProfile

5. **Metric preference storage**
   - Currently using activity_level field as workaround
   - Need to add proper prefer_metric database field

---

*Last Updated: January 29, 2025 - Session 15 (Evening)*
*Features Complete: Full country picker with 195+ countries*
*Next Priority: Implement tracking mode selection and safe mode UI changes*