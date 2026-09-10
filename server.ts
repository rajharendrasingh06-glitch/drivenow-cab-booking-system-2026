import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer as createViteServer } from 'vite';

import { connectMongoDB } from './src/server/db';
import { authRouter } from './src/server/routes/authRoutes';
import { vehicleRouter } from './src/server/routes/vehicleRoutes';
import { rideRouter } from './src/server/routes/rideRoutes';
import { driverRouter } from './src/server/routes/driverRoutes';
import { paymentRouter } from './src/server/routes/paymentRoutes';
import { adminRouter } from './src/server/routes/adminRoutes';
import { miscRouter } from './src/server/routes/miscRoutes';
import { uploadRouter } from './src/server/routes/uploadRoutes';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Middlewares
  app.use(cors());
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));

  // Connect to MongoDB and seed 400 vehicles if empty
  await connectMongoDB();

  // API Routes FIRST
  app.get('/api/health', (_req, res) => {
    res.json({
      status: 'ok',
      service: 'DriveNow – Indian Cab Booking System',
      stack: 'MERN Full-Stack',
      version: '2.0.0',
      timestamp: new Date().toISOString(),
    });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/vehicles', vehicleRouter);
  app.use('/api/rides', rideRouter);
  app.use('/api/driver', driverRouter);
  app.use('/api/drivers', driverRouter); // Alias for plural endpoint consistency
  app.use('/api/payments', paymentRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/upload', uploadRouter);
  app.use('/api', miscRouter);

  // Vite Middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[DriveNow Full-Stack Server] Running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting DriveNow server:', err);
  process.exit(1);
});
