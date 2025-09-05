const express = require('express');
const router = express.Router();
const twilio = require('twilio');
const Redis = require('ioredis');
const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => {
  console.log('✅ SMS Route: Connected to Redis');
});

redis.on('error', (err) => {
  console.error('❌ SMS Route: Redis connection error:', err);
});

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

// Twilio client for sending responses
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
console.log('✅ SMS Route: Twilio client initialized');

// Helper functions for Redis conversation management
async function getConversation(phone) {
  try {
    const data = await redis.get(`sms:${phone}`);
    return data ? JSON.parse(data) : [];
  } catch (err) {
    console.error('Error getting conversation from Redis:', err);
    return [];
  }
}

async function saveConversation(phone, conversation) {
  try {
    // Set with 24-hour TTL (86400 seconds)
    await redis.setex(`sms:${phone}`, 86400, JSON.stringify(conversation));
  } catch (err) {
    console.error('Error saving conversation to Redis:', err);
  }
}

// Helper function to extract food info from conversation
function extractFoodInfo(conversation) {
  // Look for the last assistant message with calorie info
  for (let i = conversation.length - 1; i >= 0; i--) {
    if (conversation[i].role === 'assistant' && conversation[i].content.includes('cal')) {
      const content = conversation[i].content;
      // Try to extract food name and calories from patterns like "Big Mac: 550 cal"
      const match = content.match(/(.+?):\s*(\d+)\s*cal/);
      if (match) {
        return {
          foodName: match[1].trim(),
          calories: parseInt(match[2]),
          confidence: 0.85 // Default confidence for SMS
        };
      }
    }
  }
  return null;
}

// Helper function to log food to Supabase
async function logFoodToSupabase(phone, foodInfo) {
  try {
    // First, get user by phone number
    const { data: userData, error: userError } = await supabase.rpc('get_user_by_phone', {
      phone_input: phone
    });
    
    if (userError || !userData || userData.length === 0) {
      console.error('User not found for phone:', phone);
      return false;
    }
    
    const user = userData[0];
    
    // Log the food entry
    const { data, error } = await supabase.rpc('log_food_via_sms', {
      phone_input: phone,
      food_name_input: foodInfo.foodName,
      calories_input: foodInfo.calories,
      meal_type_input: foodInfo.mealType || 'snack',
      confidence_input: foodInfo.confidence
    });
    
    if (error) {
      console.error('Error logging food to Supabase:', error);
      return false;
    }
    
    console.log('✅ Food logged to Supabase:', data);
    return true;
  } catch (err) {
    console.error('Error in logFoodToSupabase:', err);
    return false;
  }
}

// SMS webhook endpoint
router.post('/webhook', async (req, res) => {
  const { From, Body } = req.body;
  
  console.log(`📱 SMS from ${From}: ${Body}`);
  
  // Ignore messages from our own Twilio number
  if (From === '+15513685291' || From === process.env.TWILIO_PHONE_NUMBER) {
    console.log('Ignoring message from Twilio number');
    return res.send('<Response></Response>');
  }
  
  try {
    // Get conversation history from Redis
    const conversationHistory = await getConversation(From);
    
    // Check if user is confirming with "Y"
    if (Body.toLowerCase() === 'y' || Body.toLowerCase() === 'yes') {
      // Extract food info from last conversation
      const foodInfo = extractFoodInfo(conversationHistory);
      
      if (foodInfo) {
        // Log to Supabase
        const success = await logFoodToSupabase(From, foodInfo);
        
        if (success) {
          // Clear conversation after successful log
          await redis.del(`sms:${From}`);
          
          const successMsg = `✅ Logged: ${foodInfo.foodName} (${foodInfo.calories} cal)`;
          
          if (process.env.TEST_MODE) {
            console.log(`✅ TEST Response: ${successMsg}`);
            return res.json({ 
              response: successMsg,
              from: From,
              foodLogged: foodInfo
            });
          } else {
            await twilioClient.messages.create({
              body: successMsg,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: From
            });
            return res.send('<Response></Response>');
          }
        }
      }
    }
    
    // Call the main AI chat endpoint
    const response = await axios.post('http://localhost:3001/api/ai/chat', {
      message: Body,
      conversationHistory: conversationHistory,
      context: {
        source: 'sms',
        phone: From,
        personality: 'food-logger',
        systemPrompt: `CRITICAL SMS FOOD LOGGER - Follow these rules EXACTLY:

1. For multiple items, use this format:
Item1: XXX cal
Item2: XXX cal
Total: XXX cal
Reply Y

2. Always ask for missing information:
- "How many slices of pizza?"
- "What size coffee?"
- "Breakfast, lunch, dinner, or snack?"

3. Keep responses under 140 characters
4. NO emojis, NO URLs, NO markdown
5. End with "Reply Y to confirm" when showing calories

Examples:
INPUT: "big mac and fries"
OUTPUT:
Big Mac: 550 cal
Fries: 230 cal
Total: 780 cal
Reply Y

INPUT: "pizza"
OUTPUT: How many slices and what type of pizza?

INPUT: "coffee"  
OUTPUT: What size coffee? Small, medium, or large?`
      }
    });
    
    const reply = response.data.response || response.data.message || "I found some information about that!";
    
    console.log('AI Response:', reply);
    
    // Store conversation
    conversationHistory.push({ role: 'user', content: Body });
    conversationHistory.push({ role: 'assistant', content: reply });
    
    // Keep only last 10 messages to avoid huge context
    if (conversationHistory.length > 20) {
      conversationHistory = conversationHistory.slice(-20);
    }
    
    // Save updated conversation to Redis with 24-hour TTL
    await saveConversation(From, conversationHistory);
    
    // Remove any URLs from the response (they're not useful in SMS)
    let cleanReply = reply.replace(/https?:\/\/[^\s]+/g, '').trim();
    // Also remove any markdown link format [text](url)
    cleanReply = cleanReply.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1');
    
    // Ensure response stays under 140 chars for single SMS
    let smsReply = cleanReply;
    if (cleanReply && cleanReply.length > 140) {
      smsReply = cleanReply.substring(0, 137) + '...';
    }
    
    // In TEST_MODE, return response as JSON instead of sending SMS
    if (process.env.TEST_MODE) {
      console.log(`✅ TEST Response: ${smsReply}`);
      res.json({ 
        response: smsReply,
        from: From,
        originalMessage: Body
      });
    } else {
      // Send SMS reply
      await twilioClient.messages.create({
        body: smsReply,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: From
      });
      
      console.log(`✅ SMS Sent: ${smsReply}`);
      
      // Return empty TwiML
      res.send('<Response></Response>');
    }
    
  } catch (error) {
    console.error('Error:', error);
    
    // Send simple error message for food logging
    const errorMsg = "Sorry, couldn't process that. Please try again or text a simple food item.";
    
    if (process.env.TEST_MODE) {
      res.json({ 
        error: true,
        response: errorMsg,
        from: From
      });
    } else {
      // Fix: Add "+" prefix if missing from phone number
      const toNumber = From.startsWith('+') ? From : `+${From}`;
      
      try {
        await twilioClient.messages.create({
          body: errorMsg,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: toNumber
        });
      } catch (twilioError) {
        console.error('Twilio error:', twilioError);
      }
      
      res.send('<Response></Response>');
    }
  }
});

// Phone verification endpoint
router.post('/verify-phone', async (req, res) => {
  const { userId, phoneNumber } = req.body;
  
  try {
    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store in database
    const { error: dbError } = await supabase
      .from('phone_verifications')
      .insert({
        user_id: userId,
        phone_number: phoneNumber,
        verification_code: code,
        expires_at: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      });
    
    if (dbError) {
      console.error('Error storing verification code:', dbError);
      return res.status(500).json({ error: 'Failed to generate verification code' });
    }
    
    // Send SMS with code
    await twilioClient.messages.create({
      body: `Your Hannah Health verification code is: ${code}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: phoneNumber
    });
    
    res.json({ success: true, message: 'Verification code sent' });
  } catch (error) {
    console.error('Error in phone verification:', error);
    res.status(500).json({ error: 'Failed to send verification code' });
  }
});

// Confirm verification code
router.post('/confirm-code', async (req, res) => {
  const { userId, phoneNumber, code } = req.body;
  
  try {
    const { data, error } = await supabase.rpc('verify_phone_number', {
      user_id_input: userId,
      phone_input: phoneNumber,
      code_input: code
    });
    
    if (error || !data) {
      return res.status(400).json({ error: 'Invalid verification code' });
    }
    
    res.json({ success: true, message: 'Phone number verified' });
  } catch (error) {
    console.error('Error confirming code:', error);
    res.status(500).json({ error: 'Failed to verify code' });
  }
});

module.exports = router;