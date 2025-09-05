// hannah-sms-webhook.js
// Quick webhook to receive Twilio SMS and respond with Hannah AI

const express = require('express');
const bodyParser = require('body-parser');
const twilio = require('twilio');
const OpenAI = require('openai');

const app = express();
app.use(bodyParser.urlencoded({ extended: false }));

// Load environment variables
require('dotenv').config();

// Twilio credentials from .env
const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN = process.env.TWILIO_AUTH_TOKEN;
const MESSAGING_SERVICE_SID = process.env.TWILIO_MESSAGING_SERVICE_SID;
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER;

// Initialize Twilio client
const twilioClient = twilio(ACCOUNT_SID, AUTH_TOKEN);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY // You'll need to set this
});

// In-memory user context (use a database in production!)
const userContexts = {};

// Webhook endpoint for Twilio
app.post('/sms-webhook', async (req, res) => {
  const { From, Body, MessageSid } = req.body;
  
  console.log(`📱 Message from ${From}: ${Body}`);
  
  // Ignore messages from our own Twilio number (delivery confirmations)
  if (From === '+15513685291' || From === TWILIO_PHONE_NUMBER) {
    console.log('Ignoring message from Twilio number');
    return res.send('<Response></Response>');
  }
  
  try {
    // Get or create user context
    if (!userContexts[From]) {
      userContexts[From] = {
        phone: From,
        messages: [],
        pendingClarification: null,
        onboarded: false,
        dailyCalories: 0,
        targetCalories: 1800
      };
    }
    
    const user = userContexts[From];
    user.messages.push({ role: 'user', content: Body });
    
    // Process with Hannah AI
    const response = await processWithHannah(user, Body);
    
    // Send SMS reply via Twilio
    await twilioClient.messages.create({
      body: response,
      messagingServiceSid: MESSAGING_SERVICE_SID,
      to: From
    });
    
    // Log Hannah's response
    user.messages.push({ role: 'assistant', content: response });
    console.log(`✅ Hannah replied: ${response}`);
    
    // Send empty response to Twilio (acknowledges receipt)
    res.send('<Response></Response>');
    
  } catch (error) {
    console.error('Error:', error);
    
    // Send error message to user
    await twilioClient.messages.create({
      body: "Oops! Had a hiccup. Try again or text 'help'",
      messagingServiceSid: MESSAGING_SERVICE_SID,
      to: From
    });
    
    res.status(500).send('<Response></Response>');
  }
});

// Process message with Hannah AI
async function processWithHannah(user, message) {
  // Handle undefined message
  if (!message) {
    console.log('Error: Message is undefined');
    return "Sorry, I didn't receive your message. Please try again!";
  }
  
  const lowerMessage = message.toLowerCase();
  
  // Check if it's a nutrition question FIRST (before onboarding check)
  if (lowerMessage.includes('how many calories') || lowerMessage.includes('calories in') || 
      lowerMessage.includes('nutrition') || lowerMessage.includes('how much')) {
    // Mark as onboarded since they're asking questions
    user.onboarded = true;
    
    // Answer nutrition questions
    if (lowerMessage.includes('big mac')) {
      return "A Big Mac has 563 calories, 33g fat, 45g carbs, 25g protein. Want me to log it?";
    } else if (lowerMessage.includes('hash brown')) {
      return "McDonald's hash brown: 150 calories, 9g fat, 15g carbs, 1g protein. Want me to log it?";
    } else if (lowerMessage.includes('mcdonalds')) {
      return "Which McDonald's item? Big Mac (563cal), Quarter Pounder (520cal), McNuggets 6pc (250cal)?";
    } else {
      // Try to identify the food and give nutrition info
      const food = message.replace(/.*calories in |how many calories|.*nutrition of /gi, '').trim();
      return `Let me check "${food}" for you. Meanwhile, you can text me what you ate to track it!`;
    }
  }
  
  // Handle first-time users
  if (!user.onboarded && !user.pendingClarification) {
    user.onboarded = true;
    return "Hey! I'm Hannah, your AI nutritionist 🍎 I help track what you eat and give personalized advice. Just text me your meals! What did you have for breakfast today?";
  }
  
  // Check if waiting for clarification
  if (user.pendingClarification) {
    return await handleClarification(user, message);
  }
  
  // Check for food mentions
  const foodAnalysis = await analyzeFoodMentions(message);
  
  if (foodAnalysis.hasFood) {
    if (foodAnalysis.needsClarification) {
      user.pendingClarification = foodAnalysis;
      return foodAnalysis.clarificationQuestion;
    }
    
    // Log the food
    const calories = foodAnalysis.totalCalories;
    user.dailyCalories += calories;
    
    return `${foodAnalysis.summary} logged! ${calories} cal. Daily total: ${user.dailyCalories}/${user.targetCalories}`;
  }
  
  // General conversation
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `You are Hannah, a friendly AI nutritionist. Keep responses under 160 characters for SMS.
                  User's daily calories so far: ${user.dailyCalories}/${user.targetCalories}`
      },
      ...user.messages.slice(-5), // Last 5 messages for context
    ],
    max_tokens: 50
  });
  
  return completion.choices[0].message.content;
}

// Analyze message for food mentions
async function analyzeFoodMentions(message) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `Analyze this message for food mentions. If food is mentioned:
                  1. Identify if it needs clarification (e.g., "coffee" needs type, "burger" needs source)
                  2. Estimate calories if clear enough
                  3. Generate a clarification question if needed
                  
                  Return JSON:
                  {
                    "hasFood": boolean,
                    "needsClarification": boolean,
                    "foods": [{"item": string, "calories": number, "confidence": number}],
                    "clarificationQuestion": string or null,
                    "summary": string (brief description of foods),
                    "totalCalories": number
                  }`
      },
      { role: 'user', content: message }
    ],
    response_format: { type: 'json_object' }
  });
  
  return JSON.parse(completion.choices[0].message.content);
}

// Handle clarification responses
async function handleClarification(user, response) {
  const pending = user.pendingClarification;
  
  // Use OpenAI to apply clarification
  const completion = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: `User previously mentioned: "${pending.summary}"
                  You asked: "${pending.clarificationQuestion}"
                  They replied: "${response}"
                  
                  Now calculate accurate calories and provide a logging summary.
                  Return JSON:
                  {
                    "totalCalories": number,
                    "summary": string (e.g., "Oat milk latte + banana")
                  }`
      }
    ],
    response_format: { type: 'json_object' }
  });
  
  const result = JSON.parse(completion.choices[0].message.content);
  
  // Clear pending clarification
  user.pendingClarification = null;
  
  // Update calories
  user.dailyCalories += result.totalCalories;
  
  return `${result.summary} logged! ${result.totalCalories} cal. Daily total: ${user.dailyCalories}/${user.targetCalories}`;
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'Hannah SMS is running!' });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Hannah SMS webhook running on port ${PORT}`);
  console.log(`📱 Configure Twilio webhook to: https://your-domain.com/sms-webhook`);
  console.log(`\n💡 For local testing, use ngrok:`);
  console.log(`   1. Install ngrok: brew install ngrok`);
  console.log(`   2. Run: ngrok http 3000`);
  console.log(`   3. Copy the https URL and set it in Twilio console`);
});