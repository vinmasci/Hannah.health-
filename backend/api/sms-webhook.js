// api/sms-webhook.js - Vercel Function for Hannah SMS
const twilio = require('twilio');
const https = require('https');

// Simple in-memory storage
const userContexts = {};

module.exports = async function handler(req, res) {
  console.log('Webhook called!');
  console.log('Method:', req.method);
  console.log('Body:', req.body);
  
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { From, Body } = req.body;
  
  console.log(`Received from ${From}: ${Body}`);
  
  try {
    // Initialize Twilio (must be done in handler)
    const twilioClient = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN
    );
    
    let response;
    
    // Check if it's about food
    const foodKeywords = ['ate', 'had', 'breakfast', 'lunch', 'dinner', 'snack', 'drink', 'coffee', 'banana', 'food'];
    const isFood = foodKeywords.some(word => Body.toLowerCase().includes(word));
    
    if (isFood && Body.toLowerCase().includes('banana')) {
      response = "Great! A banana has ~105 calories with potassium & fiber. Nice healthy choice! 🍌";
    } else if (isFood) {
      // Extract food item
      const foodItem = Body.toLowerCase()
        .replace(/i (ate|had|drank|consumed)/gi, '')
        .replace(/for (breakfast|lunch|dinner|snack)/gi, '')
        .trim();
      
      // Simple nutrition database (no external API calls for now)
      const nutritionDB = {
        'orange': '~62 calories, vitamin C powerhouse! 🍊',
        'apple': '~95 calories with fiber. Great choice! 🍎',
        'pizza': '~285 calories per slice. Enjoy it! 🍕',
        'coffee': '~2 calories (black). Need that caffeine! ☕',
        'chicken': '~165 calories (3oz grilled). Protein boost! 🍗',
        'salad': '~150 calories with dressing. Healthy! 🥗',
        'sandwich': '~300-400 calories. Filling lunch! 🥪',
        'eggs': '~70 calories each. Protein packed! 🥚',
        'rice': '~205 calories per cup. Good carbs! 🍚',
        'pasta': '~200 calories per cup. Carb energy! 🍝'
      };
      
      // Find matching food
      let found = false;
      for (const [food, info] of Object.entries(nutritionDB)) {
        if (foodItem.includes(food)) {
          response = `${food.charAt(0).toUpperCase() + food.slice(1)}: ${info}`;
          found = true;
          break;
        }
      }
      
      if (!found) {
        response = `Logged "${foodItem}"! I'll track that for you. Keep going! 💪`;
      }
    } else {
      response = "Hey! I'm Hannah, your AI nutritionist. Text me what you eat and I'll help track it! 🍎";
    }
    
    // Send SMS reply
    await twilioClient.messages.create({
      body: response,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: From
    });
    
    console.log(`Sent reply: ${response}`);
    
    // Return empty TwiML
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send('<Response></Response>');
    
  } catch (error) {
    console.error('Full error:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    // Still return 200 to Twilio to prevent retries
    res.setHeader('Content-Type', 'text/xml');
    res.status(200).send('<Response><Message>Sorry, there was an error processing your message.</Message></Response>');
  }
};