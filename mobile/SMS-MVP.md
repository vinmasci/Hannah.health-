# SMS MVP Implementation Plan 📱

## Core Value Proposition
**The ONE thing Hannah does better**: Natural text-to-log food items
- Users text what they ate in plain language
- Hannah figures out the nutrition
- No searching databases or scanning barcodes

## MVP Scope (Version 1)

### ✅ Included Features
1. **Phone verification** during signup
2. **Multi-turn conversations** for confidence building
3. **Redis for conversation state** (24 hour TTL)
4. **Always split items** for detailed tracking
5. **Always ask which meal** for proper categorization
6. **50 free texts/month** with warning at 40
7. **Integration with main API** (`/api/food/log`)

### ❌ Not in MVP (Future)
- Pattern learning
- Auto-corrections
- User preferences memory
- Retroactive logging beyond today
- Custom dietary restrictions

## Technical Architecture

### Authentication Flow
1. User signs up in app with phone number
2. SMS verification code sent
3. Phone number linked to user ID in database
4. All SMS messages authenticated via phone lookup

### Message Processing Flow
```
SMS In → Gateway → Authenticate → Parse → Multi-turn if needed → Confirm → API → Response
```

### Conversation State (Redis)
```javascript
Key: phone:+1234567890
Value: {
  userId: "uuid",
  context: "logging_food",
  currentItem: {
    food: "pizza",
    pending: ["size", "slices"],
    answered: {meal: "lunch"}
  },
  messageCount: 2,
  expires: 24 hours  // Changed from 10 minutes
}
```

#### Why 24-Hour TTL?
Real-world scenarios that need longer than 10 minutes:
- **Late night snacking**: User falls asleep before completing
- **Work interruptions**: Meetings, calls, busy periods
- **Parenting**: Kids interrupt constantly
- **Commuting**: Can't safely respond while driving
- **Time zones**: Traveling users with irregular schedules

#### Example Flow with 24-Hour TTL:
```
11:45 PM: User: "had ice cream"
          Bot: "What flavor and how much?"
          [User falls asleep]

7:00 AM:  User: "chocolate, 1 cup"
          Bot: "Chocolate ice cream, 1 cup: 285 cal. Reply Y"
          User: "Y"
          ✅ Successfully logged to yesterday!
```

#### Memory Impact (Negligible):
- Per conversation: ~500 bytes
- 10,000 active conversations: 5MB
- 100,000 active conversations: 50MB
- Redis free tier (30MB): Handles ~60,000 conversations

#### Implementation:
```javascript
const TTL_24_HOURS = 24 * 60 * 60;  // 86400 seconds

// On every message, reset TTL to 24 hours
await redis.setex(
  `sms:${phoneNumber}`,
  TTL_24_HOURS,
  JSON.stringify(conversationState)
);

// Clear only when:
// 1. User confirms with "Y"
// 2. 24 hours pass (auto-expire)
// 3. User texts "CANCEL" or "START OVER"
```

### API Integration
SMS gateway calls existing endpoints:
- `POST /api/food/log` - Log confirmed food
- `GET /api/user/profile` - Get user settings
- `GET /api/user/daily-summary` - For "how many calories today?"

## User Experience Flow

### Successful Flow
```
User: "had a burger"
Hannah: "What meal was this - breakfast, lunch, dinner, or snack?"
User: "lunch"
Hannah: "What size burger - small, regular, or large?"
User: "large"
Hannah: "Large burger for lunch (650 cal). Reply Y to confirm"
User: "Y"
Hannah: "Logged! Daily total: 1,250 cal (550 remaining)"
```

### Edge Cases to Handle
1. **Ambiguous food**: "had some pizza"
2. **Multiple items**: "chicken salad and a coke"
3. **Brand names**: "big mac"
4. **Typos**: "had a borgur"
5. **Modifications**: "coffee with oat milk"
6. **Quantities**: "2 slices of pizza"
7. **Context switching**: Starting new item before finishing previous

## Response Guidelines

### Confidence Thresholds
- **>90%**: Auto-confirm with user
- **70-90%**: Ask one clarifying question
- **<70%**: Need multiple questions

### Response Format
- Keep under 140 characters when possible
- Use theatrical personality sparingly in SMS
- Always include calories in confirmation
- Show daily total after logging

## Testing Strategy

### Test Categories
1. **Simple items** - "apple", "banana"
2. **Restaurant items** - "big mac", "chipotle bowl"
3. **Homemade food** - "spaghetti", "sandwich"
4. **Ambiguous sizes** - "pizza", "salad"
5. **Multiple items** - "burger and fries"
6. **Drinks** - "coffee", "beer", "smoothie"
7. **Modifications** - "salad no dressing"
8. **Typos** - "chickn", "cofee"
9. **Quantities** - "3 tacos", "half a sandwich"
10. **Edge timing** - Foods at 3pm (lunch or snack?)

## Cost Analysis

### Per User Costs
- Average 10 texts/day from user = $0.08
- Average 10 responses from Hannah = $0.08
- **Daily cost**: $0.16
- **Monthly cost**: $4.80 in SMS fees

### Pricing Strategy
- 50 free messages/month (covers casual users)
- $9.99/month for unlimited (covers power users)
- Break-even at ~2,000 messages/month

## Success Metrics

### MVP Goals
1. **Accuracy**: >85% correct calorie logging
2. **Speed**: <3 messages to confirm most foods
3. **Retention**: Users continue after first week
4. **Confidence**: Users trust the calorie counts

### What We're Testing
- Is text really easier than MyFitnessPal?
- Do users prefer this to opening an app?
- What foods are hardest to log?
- How much conversation is too much?

## Implementation Checklist

- [ ] Add phone field to user signup
- [ ] Implement SMS verification
- [ ] Set up Redis for conversation state
- [ ] Build multi-turn conversation handler
- [ ] Create confidence scoring for foods
- [ ] Connect to existing food log API
- [ ] Add message counting/limits
- [ ] Deploy to production
- [ ] Test with 10 beta users
- [ ] Refine based on feedback

## Next Phase Features

Once MVP proves concept:
1. **Learning system** - Remember user preferences
2. **Photo support** - MMS/WhatsApp images
3. **Voice notes** - WhatsApp voice messages
4. **Proactive reminders** - "Did you log lunch?"
5. **Weekly summaries** - Text reports

---

*Last Updated: January 27, 2025*
*Status: Planning - Ready for Testing*