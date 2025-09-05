# Hannah Health - AI Nutritionist

A comprehensive nutrition tracking platform with iOS app and web interface, featuring AI-powered food logging and personalized health insights.

## 🚀 Quick Start

### iOS App (Swift/SwiftUI)
```bash
cd HannahHealth
open HannahHealth.xcodeproj
# Build and run in Xcode
```

### Backend (Node.js) - Deployed
- **Production URL**: https://backend-b6oqfdo1s-vincents-projects-8ffc51f8.vercel.app
- **Local Development**: 
```bash
cd backend
npm install
npm start
```

### Web Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📱 Features

### iOS App
- **AI Food Logging**: Quick log with AI nutritional analysis
- **HealthKit Integration**: Syncs with Apple Health for steps, exercise, weight
- **Smart BMR Calculation**: Projected daily BMR for accurate targets
- **Visual Dashboard**: Ring charts showing TDEE, calories, and macros
- **Weight Tracking**: Charts with trends over day/week/month views
- **Meal Planning**: Kanban-style meal organization
- **SMS Integration**: Text meals to log them

### Backend Services
- **Deployed on Vercel**: Always available, no local server needed
- **AI Chat API**: OpenAI-powered nutritional analysis
- **Twilio SMS**: Process food logs via text message
- **Supabase Integration**: Cloud database for food entries
- **Recipe Scraping**: Extract nutrition from recipe URLs

## 🔧 Configuration

### Environment Variables
Create `.env` files in respective directories:

#### Backend (.env)
```bash
OPENAI_API_KEY=your_openai_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth
TWILIO_PHONE_NUMBER=your_twilio_number
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_key
BRAVE_API_KEY=your_brave_key
```

#### iOS App (Config.plist)
```xml
<dict>
    <key>SUPABASE_URL</key>
    <string>your_supabase_url</string>
    <key>SUPABASE_ANON_KEY</key>
    <string>your_supabase_key</string>
</dict>
```

## 🏗️ Architecture

### iOS App Structure
```
HannahHealth/
├── Core/
│   ├── Services/       # HealthKit, Supabase, API services
│   ├── Models/         # Data models
│   └── Navigation/     # Tab navigation
├── Features/
│   ├── Dashboard/      # Main dashboard with rings
│   ├── Log/           # Food logging interface
│   ├── MealPlan/      # Meal planning kanban
│   └── Profile/       # User settings
└── Shared/
    └── Components/    # Reusable UI components
```

### Backend Structure
```
backend/
├── routes/
│   ├── ai.js         # AI chat endpoints
│   ├── sms.js        # Twilio webhook
│   └── recipe.js     # Recipe scraping
├── server.js         # Express server
└── vercel.json       # Deployment config
```

## 📊 Key Improvements (Jan 2025)

### BMR Projection System
- Uses profile BMR until 9pm for realistic daily targets
- Switches to actual accumulated resting energy after 9pm
- Prevents "over budget" warnings early in the day

### Weight Tracking
- Weekly view: Shows daily weights
- Monthly view: Shows lowest weight per week
- Proper carry-forward for missing data

### Food Parsing
- Multi-item meal support (e.g., "steak, rice, vegetables")
- Improved format detection for various AI responses
- Skips summary lines to prevent duplicate entries

## 🚀 Deployment

### Backend (Vercel)
```bash
cd backend
vercel --prod
```

### iOS App
1. Archive in Xcode
2. Upload to App Store Connect
3. Submit for review

## 🔒 Security

- All sensitive credentials in `.env` files (gitignored)
- API keys never hardcoded in source
- HTTPS/TLS encryption for all API calls
- Helmet.js for security headers
- CORS properly configured

## 📱 SMS Commands

Text to your Twilio number:
- "2 eggs and toast" - Log breakfast
- "30 min walk" - Log exercise
- "weight 150" - Log weight
- "help" - Get command list

## 🛠️ Development

### Prerequisites
- Xcode 15+
- Node.js 18+
- iOS 17+ device/simulator
- Supabase account
- OpenAI API key
- Twilio account (for SMS)

### Testing
```bash
# Backend tests
cd backend
npm test

# iOS tests
# Run from Xcode: Product > Test
```

## 📈 Monitoring

- Backend logs: `vercel logs`
- Error tracking: Consider adding Sentry
- Analytics: Firebase Analytics (optional)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Open pull request

## 📄 License

Private repository - All rights reserved

## 🆘 Support

For issues or questions, please open an issue in the repository.

---

**Current Status**: ✅ Production Ready
- Backend: Deployed on Vercel
- iOS App: Ready for TestFlight
- Web: Development mode