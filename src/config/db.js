import mongoose from 'mongoose';

const connectDB = async (mongoUri) => {
  try {
    if (!mongoUri) throw new Error('MONGO_URI not provided');
    await mongoose.connect(mongoUri, {
      // useNewUrlParser, useUnifiedTopology removed in mongoose v6+
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export default connectDB;
