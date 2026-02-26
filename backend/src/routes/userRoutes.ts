import { Router } from 'express';
import { body } from 'express-validator';
import {
  updateProfile,
  getUserProfile,
  getAllUsers,
} from '../controllers/userController';
import { authenticateToken } from '../middleware/auth';

/**
 * User routes
 * PUT /api/users/profile - Update user profile and assign onboarding path
 * GET /api/users/profile - Get user profile
 * GET /api/users - Get all users (admin)
 */

const router = Router();

// Middleware to require authentication
router.use(authenticateToken);

// Input validation for profile update
const profileValidation = [
  body('role').notEmpty().withMessage('Role is required'),
  body('team_size').notEmpty().withMessage('Team size is required'),
  body('goal').notEmpty().withMessage('Goal is required'),
];

router.put('/profile', profileValidation, updateProfile);
router.get('/profile', getUserProfile);
router.get('/', getAllUsers); // Admin endpoint

export default router;
