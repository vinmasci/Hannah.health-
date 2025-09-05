# Session 24: Backend Deployment & BMR Projection Fix
*Date: January 5, 2025*

## Summary
Major deployment and calculation improvements for production readiness.

## Key Achievements

### 1. Backend Deployment to Vercel ✅
- Deployed backend to Vercel for remote access
- URL: `https://backend-b6oqfdo1s-vincents-projects-8ffc51f8.vercel.app`
- Configured all environment variables (OpenAI, Brave, Supabase, Twilio)
- Fixed CORS to allow iOS app connections
- Backend now accessible from anywhere, not just local network

### 2. BMR Projection for Today ✅
**Problem**: BMR accumulates throughout the day, causing unrealistic calorie targets early in the day
- At 3pm: Only showing 522 cal BMR (accumulated so far)
- Reality: Daily BMR should be ~1650-1700 cal

**Solution**: Implemented intelligent BMR projection
- Before 9pm: Uses profile BMR (~1650 cal) for realistic targets
- After 9pm: Uses actual accumulated resting energy
- Past days: Uses complete HealthKit data

### 3. Weight Chart Monthly View Fix ✅
**Problem**: Monthly view was summing all weight values per week
**Solution**: Created `WeightMonthlyBars` component that shows lowest weight per week

### 4. UI Improvements ✅
- Changed deficit info bar from bright red to coral theme color
- Fixed lunch parsing creating duplicate "Calories" entries
- Improved food entry parsing to skip summary lines

### 5. Security Audit & Cleanup ✅
- Verified all sensitive files are gitignored
- Removed hardcoded credentials from example files
- Replaced with placeholder values
- Successfully pushed to GitHub

## Technical Details

### Backend Deployment Configuration
```javascript
// server.js - Fixed for Vercel
if (process.env.VERCEL) {
  module.exports = app;
} else {
  app.listen(PORT, () => {
    console.log(`🚀 Hannah backend server running on port ${PORT}`);
  });
}

// CORS fix for iOS app
app.use(cors({
  origin: '*', // Allow all origins for iOS app
  credentials: true
}));
```

### BMR Projection Logic
```swift
// DashboardViewModel.swift
let hour = Calendar.current.component(.hour, from: Date())
let shouldProjectBMR = hour < 21 // Use projected BMR until 9pm

if shouldProjectBMR {
    let userProfileBMR = userDefaults.integer(forKey: "userBMR")
    if userProfileBMR > 1200 && userProfileBMR < 3000 {
        bmrToUse = userProfileBMR
    }
} else {
    bmrToUse = restingEnergy // Use actual after 9pm
}
```

### Weight Chart Fix
```swift
// WeightMonthlyBars - Shows lowest weight per week
private func lowestWeightForWeek(_ weekData: [DayData]) -> Double? {
    let weightsInWeek = weekData.compactMap { $0.weight }
    return weightsInWeek.min() // Get minimum instead of sum
}
```

## Files Modified
- `backend/server.js` - Added Vercel support
- `backend/vercel.json` - Deployment configuration  
- `HannahHealth/Features/Log/LogView.swift` - Updated API URL, fixed parsing
- `HannahHealth/Features/Dashboard/DashboardViewModel.swift` - BMR projection
- `HannahHealth/Features/Dashboard/Modules/MonthlyCaloriesView.swift` - Weight chart fix
- `HannahHealth/Features/Dashboard/Modules/CaloriesView.swift` - UI color fix

## Deployment Details
- **Backend URL**: https://backend-b6oqfdo1s-vincents-projects-8ffc51f8.vercel.app
- **Status**: ✅ Live and operational
- **Environment Variables**: All configured in Vercel dashboard
- **Security**: HTTPS, helmet middleware, CORS configured

## Next Steps
- Monitor backend performance on Vercel
- Consider adding error tracking (Sentry)
- Implement rate limiting for API endpoints
- Add backend health monitoring

## Lessons Learned
1. BMR accumulation throughout the day needs special handling for today's view
2. Vercel deployment is straightforward but requires CORS adjustments for mobile apps
3. GitHub's secret scanning is aggressive - always use placeholders in example files
4. Weight tracking should show trends (lowest/highest) not totals for longer periods

## User Impact
- ✅ App now works remotely without local server
- ✅ Realistic calorie targets throughout the day
- ✅ Accurate weight tracking in weekly/monthly views
- ✅ Better visual consistency with coral theme color