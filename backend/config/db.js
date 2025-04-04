const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    // Check if MONGODB_URI is defined
    if (!process.env.MONGODB_URI) {
      console.error('MONGODB_URI is not defined in environment variables');
      console.error('Available environment variables:', Object.keys(process.env));
      throw new Error('MONGODB_URI is not defined in environment variables');
    }

    console.log('=== MongoDB Connection Attempt ===');
    console.log('Attempting to connect to MongoDB...');
    console.log('Connection string exists:', !!process.env.MONGODB_URI);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    // Set mongoose global configuration - simplified settings
    mongoose.set('strictQuery', false);
    
    // Simplified connection options
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 60000, // Increased to 60 seconds
      connectTimeoutMS: 60000
    });

    console.log('=== MongoDB Connection Info ===');
    console.log(`Connected to host: ${conn.connection.host}`);
    console.log(`Database name: ${conn.connection.name}`);
    console.log(`Connection state: ${mongoose.STATES[conn.connection.readyState]}`);
    console.log('Models:', Object.keys(mongoose.models));
    console.log('==============================');

    // Monitor connection events
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected');
    });

    return conn;
  } catch (err) {
    console.error('=== MongoDB Connection Error ===');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    console.error('Full error:', err);
    console.error('Environment:', process.env.NODE_ENV);
    console.error('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    console.error('==============================');
    
    // Don't exit process in production
    if (process.env.NODE_ENV === 'production') {
      console.error('Connection error in production, retrying in 5 seconds...');
      return new Promise((resolve) => {
        setTimeout(() => resolve(connectDB()), 5000); // Retry after 5 seconds
      });
    } else {
      process.exit(1);
    }
  }
};

module.exports = connectDB;
