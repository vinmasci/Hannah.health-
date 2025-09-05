# SMS Gateway Test Results 📱

## UPDATE: After Fixes (January 27, 2025 - Evening)

## Test Environment
- **Date**: January 27, 2025
- **Gateway**: Local SMS gateway on port 3000
- **Backend**: AI backend on port 3001
- **Issue**: Gateway crashed trying to send real SMS responses

### New Test Results

| Message | Response | Status |
|---------|----------|--------|
| "ate an apple" | "An average apple has about 95 calories. Reply Y to confirm." | ✅ Good |
| "had pizza" | "What specific type of pizza? Was this breakfast, lunch, dinner, or snack?" | ✅ Asks for details |
| "big mac" | "A Big Mac has about 550 calories. Was this breakfast, lunch, dinner, or snack? Reply Y to confirm." | ✅ Perfect |
| "burger and fries" | "What specific type of burger and fries?" | ⚠️ Should split items |
| "3 tacos" | "Three tacos have about 490 calories. Was this breakfast, lunch, dinner, or snack?" | ✅ Handles quantity |
| "coffee with oat milk" | "What size was the coffee? Reply Y to confirm." | ✅ Asks size |
| "ate a borgur" | "A burger typically has about 300-500 calories. What specific type?" | ✅ Handles typo |
| "i ate some food" | "What specific food did you have? Please provide more details." | ✅ Rejects vague |

### Improvements Made
1. ✅ **No URLs or emojis** - Clean, cost-effective responses
2. ✅ **Food logging focus** - Extracts calories properly
3. ✅ **Asking meal type** - Prompts for breakfast/lunch/dinner/snack
4. ✅ **Confirmation prompts** - "Reply Y to confirm"
5. ✅ **Size questions** - Asks for missing details
6. ✅ **Typo handling** - "borgur" understood as burger

### What We Achieved
- **No more URLs/emojis** ✅
- **Asking clarifying questions** ✅  
- **Handles specific items well** (Big Mac) ✅
- **Confirmation prompts working** ✅

### Remaining Issues
1. **Item splitting format** - AI responds conversationally ("X has Y calories and Z has...") instead of line-by-line format
   - Root cause: LLMs are trained to be conversational
   - Solution needed: Post-processing to reformat response OR fine-tuning

2. **Vague items** - "burger and fries" asks for specifics instead of giving estimates
   - Could default to: "Burger: 500 cal (estimated)\nFries: 300 cal (estimated)"
   
3. **Multi-turn conversation** - Need Redis to remember context between messages

## Original Key Findings

### ✅ What's Working
1. **Gateway receives messages** - Successfully processes POST requests
2. **AI responds** - Backend generates responses
3. **Theatrical personality** - "Oh my! A splendid choice!" working

### ❌ Current Issues

#### 1. **Not parsing food - just responding generically**
- Input: "ate an apple"
- Expected: "Apple logged (95 calories)"
- Actual: "Oh my! A splendid choice! Apples are nature's candy..."
- **Problem**: Acting like a chatbot, not a food logger

#### 2. **Phone number format issues**
- Twilio expects: `+61423691622`
- Gateway sending: `61423691622` (missing +)
- Causes Twilio API to reject

#### 3. **No calorie extraction**
- Responses are conversational but don't include calorie counts
- No confidence scoring visible
- No meal categorization happening

## Required Fixes

### Priority 1: Food Logging Focus
The AI needs a different prompt for SMS vs chat:
```javascript
// Current: Theatrical personality
// Needed: Food logging assistant

systemPrompt: `You are Hannah, a food logging assistant via SMS.
CRITICAL: Your job is to:
1. Extract food items and quantities
2. Estimate calories accurately
3. Ask for missing details (meal type, size)
4. Confirm with user before logging
Keep responses under 140 characters.`
```

### Priority 2: Multi-turn Conversation
Need to implement the conversation flow:
1. Parse food item
2. Check confidence
3. Ask clarifying questions if needed
4. Show calories and confirm
5. Actually log to database

### Priority 3: Test Mode
Add environment variable for testing without SMS:
```javascript
if (process.env.TEST_MODE) {
  // Return response in HTTP body
  res.json({ response: smsReply });
} else {
  // Send via Twilio
  await twilioClient.messages.create(...);
}
```

## Edge Cases to Test (Once Fixed)

### High Priority
1. **Ambiguous sizes**: "pizza" → "What size pizza?"
2. **Multiple items**: "burger and fries" → Split into two
3. **Typos**: "borgur" → "Did you mean burger?"
4. **Quantities**: "3 tacos" → Multiply calories

### Medium Priority
5. **Modifications**: "coffee with oat milk" → Adjust calories
6. **Brand items**: "big mac" → Use exact McDonald's data
7. **Meal timing**: 3pm food → "Was this lunch or snack?"

### Low Priority
8. **Vague input**: "ate some food" → "What did you eat?"
9. **Retroactive**: "had pizza yesterday" → Log to yesterday

## Recommended Next Steps

1. **Fix the prompt** - Make it food-logging focused, not chat focused
2. **Add TEST_MODE** - So we can test without Twilio costs
3. **Implement confidence scoring** - Based on how specific the input is
4. **Add Redis** - For multi-turn conversations
5. **Connect to food database** - For accurate calories

## Test Script Improvements

```bash
# Add TEST_MODE to avoid SMS sending
TEST_MODE=true node sms-gateway.js

# Then run tests and capture JSON responses
curl -X POST http://localhost:3000/sms-webhook \
  -d "From=+61423691622&Body=ate an apple" \
  -H "Content-Type: application/x-www-form-urlencoded"
```

---

*Status: Initial testing revealed core issues - needs refactoring from chatbot to food logger*