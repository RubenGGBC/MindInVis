import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';

// Load environment variables FIRST
dotenv.config();

// Validate required environment variables
if (!process.env.OPENAI_API_KEY) {
  console.error('ERROR: OPENAI_API_KEY is not set in environment variables');
  console.error('Please create a .env file in the server directory with your OpenAI API key');
  process.exit(1);
}

// Import database connection
import connectDB from './config/database.js';

// Import routes (AFTER dotenv.config())
import mindmapRoutes from './routes/mindmap.routes.js';
import authRoutes from './routes/auth.routes.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('dev')); // HTTP request logging

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    openai: !!process.env.OPENAI_API_KEY
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/mindmap', mindmapRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found'
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Start server
const server = app.listen(PORT, async () => {
  console.log(`\nServer running on port ${PORT}`);
  console.log(`CORS enabled for: ${process.env.CORS_ORIGIN || 'http://localhost:3000'}`);
  console.log(`OpenAI API configured: ${process.env.OPENAI_API_KEY ? 'configured' : 'not configured'}`);
  console.log(`Health check: http://localhost:${PORT}/health\n`);
  
  // Connect to MongoDB
  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
    process.exit(1);
  }
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

