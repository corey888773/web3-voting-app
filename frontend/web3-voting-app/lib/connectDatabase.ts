import mongoose from 'mongoose';

export async function connectDatabase() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri) {
      throw new Error('MONGODB_URI is not defined');
    }

    console.log('uri:', uri);
    
    await mongoose.connect(uri);
    console.log('Connected to database');
  } catch (error) {
    console.error('Error connecting to database:', error);
  }
}