const mongoose = require('mongoose');
mongoose.set('debug', true);

// Ensure the right dotenv configuration based on the environment
if (process.env.NODE_ENV === 'production') {
  require('dotenv').config({ path: '.env.production' });
} else {
  require('dotenv').config({ path: '.env.development' });
}

let cachedDb = null;

const connectDB = async () => {
  // Use the existing database connection if it's already been established
  if (cachedDb) {
    console.log('Using existing database connection');
    return;
  }

  // Create a new database connection if none exists
  try {
    await mongoose.connect(process.env.MONGODB_CONNECTION_STRING, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected...');
    // Cache the database connection to reuse if the function is invoked again
    cachedDb = mongoose.connection;
  } catch (err) {
    console.error('Database connection error:', err.message);
    throw new Error('Failed to connect to DB: ' + err.message);
  }
};

module.exports = connectDB;