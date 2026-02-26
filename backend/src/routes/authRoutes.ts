import { Router } from 'express';
import { body } from 'express-validator';
import { signup, login, getCurrentUser } from '../controllers/authController';
import { authenticateToken } from '../middleware/auth';

/**
 * Authentication routes
 * POST /api/auth/signup - Create new user
 * POST /api/auth/login - Login user
 * GET /api/auth/me - Get current user
 */

const router = Router();

// Input validation for signup
const signupValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
];

// Input validation for login
const loginValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/signup', signupValidation, signup);
router.post('/login', loginValidation, login);
router.get('/me', authenticateToken, getCurrentUser);

export default router;
