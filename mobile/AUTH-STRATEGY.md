# Hannah Health Authentication Strategy 🔐

**Created**: January 27, 2025  
**Status**: Planning Phase  
**Priority**: CRITICAL - Protects API costs

## Core Principle
**No anonymous access** - Every API call requires authenticated user with valid trial/subscription

## User Journey

### 1. First App Open (No Account)
```
App Launch → Check Auth → None Found → OnboardingView
```
- Welcome screen with value props
- "Start Free 7-Day Trial" button
- "Already have account? Sign in"

### 2. Sign Up Flow
```
Enter Email → Magic Link Sent → Verify → Trial Starts
```
- Email only (no password initially)
- Magic link verification
- Auto-creates user_profile with 7-day trial
- Immediate access to app

### 3. Active Trial (Days 1-7)
```
Full Access → Track Foods → Use SMS → AI Features
```
- Complete app functionality
- Gentle subscription reminders starting day 5
- "2 days left in trial" banner

### 4. Trial Expiration (Day 8+)
```
App Opens → Check Subscription → Expired → PaywallView
```
- Cannot access ChatView (AI costs)
- Cannot log new foods
- Can view past data (read-only)
- Must subscribe to continue

## Database Schema Changes

### user_profiles table additions:
```sql
-- Trial Management
trial_starts_at TIMESTAMP DEFAULT NOW()
trial_ends_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
subscription_status TEXT DEFAULT 'trial' -- 'trial', 'active', 'expired', 'cancelled'
subscription_tier TEXT DEFAULT 'free' -- 'free', 'premium', 'nutritionist'

-- Subscription Details (when upgraded)
stripe_customer_id TEXT
stripe_subscription_id TEXT
subscription_started_at TIMESTAMP
subscription_ends_at TIMESTAMP
```

## iOS Architecture

### 1. AuthManager (Singleton)
```swift
class AuthManager: ObservableObject {
    @Published var user: User?
    @Published var authState: AuthState = .loading
    @Published var subscriptionStatus: SubscriptionStatus = .none
    
    enum AuthState {
        case loading
        case authenticated
        case unauthenticated
    }
    
    enum SubscriptionStatus {
        case none
        case trial(daysLeft: Int)
        case active
        case expired
    }
    
    func signUp(email: String) async
    func signIn(email: String) async
    func signOut() async
    func checkSubscription() async
    func refreshSession() async
}
```

### 2. App Entry Point
```swift
@main
struct HannahHealthApp: App {
    @StateObject private var authManager = AuthManager()
    
    var body: some Scene {
        WindowGroup {
            Group {
                switch authManager.authState {
                case .loading:
                    SplashView()
                case .unauthenticated:
                    OnboardingView()
                case .authenticated:
                    switch authManager.subscriptionStatus {
                    case .expired:
                        PaywallView()
                    default:
                        ContentView() // Main app
                    }
                }
            }
            .environmentObject(authManager)
        }
    }
}
```

### 3. OnboardingView Structure
```swift
OnboardingView/
├── WelcomeScreen (logo, tagline)
├── ValuePropsCarousel (3 slides)
├── EmailSignupView (email input)
├── VerificationView (check email)
└── SuccessView (trial started!)
```

### 4. PaywallView Structure
```swift
PaywallView/
├── TrialExpiredHeader
├── BenefitsList
├── PricingOptions ($11.99/mo or $71.99/yr)
├── SubscribeButton → StoreKit 2
└── RestorePurchaseLink
```

## Backend Protection

### API Middleware
```javascript
// Every API endpoint needs auth check
async function requireAuth(req, res, next) {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'No auth token' });
    }
    
    // Verify with Supabase
    const { data: user, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
        return res.status(401).json({ error: 'Invalid token' });
    }
    
    // Check subscription status
    const profile = await getUserProfile(user.id);
    
    if (profile.subscription_status === 'expired') {
        return res.status(403).json({ error: 'Trial expired' });
    }
    
    req.user = user;
    next();
}

// Apply to all AI endpoints
app.use('/api/ai/*', requireAuth);
app.use('/api/brave/*', requireAuth);
```

## Auth Methods (Phases)

### Phase 1: Email Only (MVP)
- Magic links (no passwords)
- Simple and fast
- Works everywhere

### Phase 2: Social Auth
- Google Sign In
- Apple Sign In (required for App Store)
- Faster onboarding

### Phase 3: Phone Auth
- SMS verification
- For SMS-first users
- Alternative to email

## Security Considerations

1. **Token Refresh**: Auto-refresh tokens before expiry
2. **Secure Storage**: Keychain for tokens on iOS
3. **Rate Limiting**: Prevent API abuse even with auth
4. **Session Management**: Sign out on app delete/reinstall
5. **Privacy**: Minimal data collection, GDPR compliant

## Cost Protection

### Why This Matters:
- OpenAI: ~$0.002 per request
- Brave Search: ~$0.001 per search
- 1000 users × 100 requests/day = $200/day without protection!

### With Auth:
- Only verified emails can access
- Trial limits exposure to 7 days
- Subscription validates continued use
- Can track usage per user
- Can ban abusive accounts

## Implementation Order

1. ✅ Document strategy (this file)
2. ✅ Add trial fields to database (trigger created)
3. ✅ Create AuthManager class
4. ✅ Build OnboardingView
5. ⏳ Implement backend middleware
6. ✅ Add PaywallView
7. ⏳ Test full flow
8. ⏳ Add social auth later

## Session 13 Implementation Status (January 28, 2025)

### ✅ Completed Components

#### 1. Database Trigger
- Created `create_profile_on_signup()` function
- Auto-creates user_profiles on auth.users insert
- Sets default 7-day trial period
- Successfully installed in Supabase

#### 2. AuthManager.swift
- Full Supabase integration
- Auth state management (loading/authenticated/unauthenticated)
- Subscription status tracking (trial/active/expired)
- User profile fetching and updates
- Session management with auto-refresh
- Fixed Supabase v2 API compatibility issues

#### 3. OnboardingView.swift
- Welcome carousel with 3 value props:
  - "Track What You Actually Eat" (McDonald's/Pizza friendly)
  - "Text Your Meals Like a Friend" (SMS as key differentiator)
  - "We Let You Do You" (not everyone's a gym junky)
- Email signup/login form
- **"No payment details required"** prominently displayed
- "Start Free Trial (No Card Required)" button
- Password confirmation for signup
- Toggle between signup/login modes

#### 4. SplashView.swift
- Loading screen while checking auth
- Animated logo and loading indicator
- Smooth transition to app or onboarding

#### 5. PaywallView.swift
- Shows when trial expires
- Monthly ($11.99) and Yearly ($71.99) options
- Feature list highlighting value
- Sign out option

#### 6. App Entry Point Updated
- HannahHealthApp.swift now checks auth state
- Routes to appropriate view based on auth/subscription
- Environment object injection for AuthManager

### 🚧 Still Needed

1. **Backend Middleware**
   - Add auth requirement to AI endpoints
   - Check subscription status on each request
   - Rate limiting per user

2. **Testing**
   - Create real user account
   - Verify email confirmation
   - Test profile auto-creation
   - Verify SMS with authenticated user

3. **Phone Verification**
   - Add phone field to profile settings
   - Verification code UI
   - Link to SMS system

4. **Payment Integration**
   - StoreKit 2 for subscriptions
   - Webhook for subscription status
   - Grace period handling

## Key Decisions Made

1. **No payment upfront** - True free trial, builds trust
2. **Email-only start** - Social auth can be added later
3. **Trigger-based profiles** - Automatic, no manual steps
4. **SMS as differentiator** - Prominent in onboarding
5. **Non-judgmental messaging** - "We let you do you"

## Testing Status

### What Works
- ✅ User creation via API
- ✅ Email confirmation flow
- ✅ Database trigger installed
- ✅ iOS app compiles with auth

### Issues Found
- ❓ Profile might not auto-create on email confirmation
- Need to test with app-based signup
- May need to adjust trigger timing

## Files Created/Modified

### Created
- `/Core/Auth/AuthManager.swift` - Complete auth management
- `/Features/Onboarding/OnboardingView.swift` - Full onboarding flow
- `/Features/Onboarding/SplashView.swift` - Loading screen
- `/Features/Onboarding/PaywallView.swift` - Subscription prompt
- `/backend/supabase-user-trigger.sql` - Database trigger

### Modified
- `HannahHealthApp.swift` - Auth-based routing
- `Theme.swift` - Added gold and amber colors

## Success Metrics

- **Signup Conversion**: Downloads → Trial starts (target: 60%)
- **Trial Completion**: Signups → Day 7 (target: 40%)
- **Trial to Paid**: Trial → Subscription (target: 25%)
- **API Cost Control**: $0 from non-authenticated users

## Edge Cases Handled

1. **Email not verified**: Can't access app ✅
2. **Trial expired yesterday**: Immediate paywall ✅
3. **Subscription failed payment**: Grace period then expire ⏳
4. **User deletes app**: Trial continues counting ✅
5. **Multiple devices**: Shared trial/subscription status ✅

---

*Last Updated: January 28, 2025 - Session 13*
*Next Priority: Test full signup flow in iOS app*