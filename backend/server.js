const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*', // Allow all origins for iOS app
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true })); // For SMS webhook
app.use(morgan('dev'));

// Log all requests
app.use((req, res, next) => {
  console.log(`📍 ${req.method} ${req.path}`);
  next();
});

// API routes
app.use('/api/ai', require('./routes/ai'));
app.use('/api/brave', require('./routes/brave-search'));
app.use('/api/recipe', require('./routes/recipe-scraper'));
app.use('/api/sms', require('./routes/sms'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Hannah API is running' });
});

// Serve frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('public'));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public', 'index.html'));
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// For Vercel deployment
if (process.env.VERCEL) {
  // Export for Vercel serverless
  module.exports = app;
} else {
  // Local development
  app.listen(PORT, () => {
    console.log(`🚀 Hannah backend server running on port ${PORT}`);
    console.log(`🔑 OpenAI API key loaded: ${process.env.OPENAI_API_KEY ? 'Yes' : 'No'}`);
    console.log(`🔍 Brave API key loaded: ${process.env.BRAVE_API_KEY ? 'Yes' : 'No'}`);
  });
}