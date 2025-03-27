// Load env variables first
require('dotenv').config();

// Enhanced environment variable logging
console.log('=== Environment Variables Check ===');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
console.log('MONGODB_URI first 10 chars:', process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 10) + '...' : 'not set');
console.log('Available env vars:', Object.keys(process.env).filter(key => !key.includes('SECRET')));
console.log('Process env location:', process.env.VERCEL ? 'Vercel' : 'Local');
console.log('================================');

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const Task = require('./models/Task');

const app = express();

// Enhanced CORS configuration with local development support
app.use(cors({
  origin: ['https://todo-frontend-nine-khaki.vercel.app', 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  exposedHeaders: ['x-auth-token'],
  credentials: true
}));

// Middleware
app.use(express.json());

// Middleware to log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} | ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

app.use('/api', authRoutes);       
app.use('/api/tasks', taskRoutes);  

// Add root route handler
app.get('/', async (req, res) => {
  try {
    const dbState = mongoose.STATES[mongoose.connection.readyState];
    const connectionInfo = {
      message: 'Todo API is running',
      database: {
        state: dbState,
        connected: mongoose.connection.readyState === 1,
        host: mongoose.connection.host,
        name: mongoose.connection.name,
        models: Object.keys(mongoose.models)
      },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        mongoDbUri: process.env.MONGODB_URI ? 'configured' : 'not configured'
      }
    };
    res.json(connectionInfo);
  } catch (error) {
    res.status(500).json({
      message: 'Error checking database status',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Internal server error'
    });
  }
});

// Add 404 handler
app.use((req, res) => {
  console.log(`404 Not Found: ${req.method} ${req.url}`);
  res.status(404).json({ message: `Route ${req.url} not found` });
});

// Function to periodically check for expired tasks
const updateExpiredTasks = async () => {
  try {
    console.log('Starting to check for expired tasks...');
    
    const now = new Date();
    const tasksToUpdate = await Task.find({
      deadline: { $lt: now },
      status: { $ne: 'Expired' }
    });
    
    if (tasksToUpdate.length > 0) {
      console.log(`Found ${tasksToUpdate.length} expired tasks, updating status to Expired`);
      
      const result = await Task.updateMany(
        { 
          _id: { $in: tasksToUpdate.map(t => t._id) },
          status: { $ne: 'Expired' }
        },
        { $set: { status: 'Expired' } }
      );
      
      console.log(`Updated ${result.nModified} tasks to Expired status`);
    } else {
      console.log('No tasks found that need status updates');
    }
  } catch (error) {
    console.error('Error updating expired tasks:', error);
  }
};

// Ensure database connection in Vercel environment
// Call the connection function directly in module scope
if (process.env.VERCEL) {
  console.log('In Vercel environment, connecting to database...');
  connectDB()
    .then(() => {
      console.log('Successfully connected to database in Vercel environment');
    })
    .catch(err => {
      console.error('Failed to connect to database in Vercel environment:', err);
    });
}

// Conditional server start (only in non-Vercel environment)
if (!process.env.VERCEL) {
  const PORT = process.env.PORT || 5001;
  
  const startServer = async () => {
    try {
      // Connect to database first
      await connectDB();
      
      // Start server
      const server = app.listen(PORT, () => {
        console.log(`Server started on port: ${PORT}`);
        
        // Run scheduled tasks
        updateExpiredTasks();
        setInterval(updateExpiredTasks, 60 * 60 * 1000);
      });
  
      // Graceful shutdown
      const shutdown = async () => {
        console.log('Received shutdown signal');
        
        // Close server
        server.close(() => {
          console.log('Server closed');
          
          // Close database connection
          mongoose.connection.close(false, () => {
            console.log('MongoDB connection closed');
            process.exit(0);
          });
        });
  
        // Force exit if not closed properly within 5 seconds
        setTimeout(() => {
          console.error('Could not close connections in time, forcefully shutting down');
          process.exit(1);
        }, 5000);
      };
  
      process.on('SIGTERM', shutdown);
      process.on('SIGINT', shutdown);
  
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  };
  
  startServer();
}

// Export Express app instance for Vercel
module.exports = app;
