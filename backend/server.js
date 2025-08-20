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
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://hannah.health' 
    : 'http://localhost:3000'
}));
app.use(express.json());
app.use(morgan('dev'));

// API routes
app.use('/api/ai', require('./routes/ai'));

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

app.listen(PORT, () => {
  console.log(`🚀 Hannah backend server running on port ${PORT}`);
  console.log(`🔑 Claude API key loaded: ${process.env.CLAUDE_API_KEY ? 'Yes' : 'No'}`);
});