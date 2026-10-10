import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import postRoutes from './routes/postRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import statsRoutes from './routes/statsRoutes.js';
import monitoringRoutes from './routes/monitoringRoutes.js';
import User from './models/User.js';
import { runSeedScript } from './seed.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/monitoring', monitoringRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'ZeroWaste API', timestamp: new Date() });
});

// Start Server & Connect Database
const startServer = async () => {
  try {
    await connectDB();

    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Server] Database is empty. Running initial seed script automatically...');
      await runSeedScript();
    }

    app.listen(PORT, () => {
      console.log(`\n==================================================`);
      console.log(`🚀 ZeroWaste Backend running at http://localhost:${PORT}`);
      console.log(`📊 Monitoring endpoint: http://localhost:${PORT}/api/monitoring`);
      console.log(`==================================================\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();
