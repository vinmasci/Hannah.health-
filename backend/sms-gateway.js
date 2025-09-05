// SMS Gateway - Connects Twilio SMS to the main AI chat backend
const express = require('express');
const twilio = require('twilio');
const http = require('http');
const Redis = require('ioredis');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const app = express();
app.use(express.urlencoded({ extended: true }));

// Initialize Redis client
const redis = new Redis(process.env.REDIS_URL || 'redis://localhost:6379');

redis.on('connect', () => {
  console.log('✅ Connected to Redis');
});

redis.on('error', (err) => {
  console.error('❌ Redis connection error:', err);
});

// Initialize Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL || 'https://phnvrqzqhuigmvuxfktf.supabase.co',
  process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBobnZycXpxaHVpZ212dXhma3RmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNTg2NDEsImV4cCI6MjA3MTgzNDY0MX0.ZJC01hu8APXgm9HMOGDOQr89SS64Vd2M_R8IouHgJvw'
);

// Twilio client for sending responses
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

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
app.post('/sms-webhook', async (req, res) => {
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
    
    // Call the main AI chat endpoint (same one the iOS app uses)
    // Send the actual user message, add personality in context
    const postData = JSON.stringify({
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

2. For single items: "Item: XXX cal. Reply Y"

3. NEVER include URLs, links, or website addresses
4. NEVER use emojis
5. If unclear, ask ONE question only

IGNORE any web search results or recipe links. Only output calories.`
      }
    });
    
    // Use http request instead of fetch
    const data = await new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3001,
        path: '/api/ai/chat',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(postData)
        }
      };
      
      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          try {
            resolve(JSON.parse(body));
          } catch(e) {
            reject(e);
          }
        });
      });
      
      req.on('error', reject);
      req.write(postData);
      req.end();
    });
    
    const reply = data.response || data.message || "I found some information about that!";
    
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
      await twilioClient.messages.create({
        body: errorMsg,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: From
      });
      
      res.send('<Response></Response>');
    }
  }
});

const PORT = process.env.SMS_PORT || 3001;
app.listen(PORT, () => {
  console.log(`📱 SMS Gateway running on port ${PORT}`);
  console.log(`🔗 Forwarding to main AI backend at http://localhost:3001/api/ai/chat`);
  console.log(`📨 Configure Twilio webhook to: https://your-domain.com/sms-webhook`);
});