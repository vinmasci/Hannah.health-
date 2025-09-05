// test-sms.js - Test sending SMS
require('dotenv').config();
const twilio = require('twilio');

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Send a test message
async function sendTestMessage() {
  try {
    const message = await client.messages.create({
      body: 'Hey! This is Hannah, your AI nutritionist 🍎 Text me what you eat and I\'ll help you track it!',
      from: process.env.TWILIO_PHONE_NUMBER,
      to: '+1XXXXXXXXXX' // Replace with your phone number
    });
    
    console.log('✅ Test message sent!');
    console.log('Message SID:', message.sid);
  } catch (error) {
    console.error('❌ Error sending message:', error);
  }
}

sendTestMessage();