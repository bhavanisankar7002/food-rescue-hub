import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/zerowaste';
  try {
    // Set connection timeout to 2.5s for fast fallback if local mongod is down
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 2500 });
    console.log(`[Database] Connected to MongoDB at: ${uri}`);
  } catch (err) {
    console.warn(`[Database] Could not connect to local MongoDB (${err.message}).`);
    console.log('[Database] Initializing high-performance MongoMemoryServer fallback...');
    try {
      mongoMemoryServer = await MongoMemoryServer.create();
      const memUri = mongoMemoryServer.getUri();
      await mongoose.connect(memUri);
      console.log(`[Database] MongoMemoryServer running seamlessly at: ${memUri}`);
    } catch (memErr) {
      console.error('[Database] Critical error starting MongoMemoryServer:', memErr);
      process.exit(1);
    }
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};
