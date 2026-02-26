import express, { Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import config from './config/env';
import { initializeDatabase } from './config/database';
import { OnboardingPath } from './models/OnboardingPath';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';

/**
 * Main application entry point
 * Initializes Express server, database, and API routes
 */

const app: Express = express();

// Middleware
app.use(helmet()); // Security headers
app.use(cors({ origin: config.cors.origin })); // CORS
app.use(express.json()); // Parse JSON bodies

// Initialize database and seed default paths
async function initializeApp() {
  try {
    console.log('🗄️  Initializing database...');
    await initializeDatabase();
    
    console.log('🌱 Seeding default onboarding paths...');
    await OnboardingPath.seedDefaultPaths();
    
    console.log('✅ Database ready');
  } catch (err) {
    console.error('❌ Database initialization error:', err);
    process.exit(1);
  }
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;

initializeApp().then(() => {
  app.listen(PORT, () => {
    console.log(`\n🚀 Server running at http://localhost:${PORT}`);
    console.log(`📝 Environment: ${config.nodeEnv}`);
    console.log(`\nAPI Documentation:`);
    console.log(`  POST   /api/auth/signup        - Create account`);
    console.log(`  POST   /api/auth/login         - Login`);
    console.log(`  GET    /api/auth/me            - Get current user`);
    console.log(`  PUT    /api/users/profile      - Update profile & get path`);
    console.log(`  GET    /api/users/profile      - Get user profile`);
    console.log(`  GET    /api/users              - Get all users (admin)`);
    console.log(`  GET    /api/health             - Health check\n`);
  });
});

export default app;
