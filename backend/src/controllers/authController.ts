import { Request, Response } from 'express';
import { User } from '../models/User';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { generateToken } from '../middleware/auth';
import { validationResult } from 'express-validator';

/**
 * Authentication controller
 * Handles signup and login
 */

export const signup = asyncHandler(async (req: Request, res: Response) => {
  // Check validation errors from express-validator
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  const { email, password } = req.body;

  // Check if user already exists
  const existingUser = await User.findByEmail(email);
  if (existingUser) {
    throw new ApiError(409, 'Email already registered');
  }

  // Create new user
  const user = await User.create(email, password);

  // Generate JWT token
  const token = generateToken(user.id, user.email);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
      },
      token,
    },
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  const { email, password } = req.body;

  // Find user
  const user = await User.findByEmail(email);
  if (!user) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Verify password
  const isPasswordValid = await User.verifyPassword(password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, 'Invalid email or password');
  }

  // Generate token
  const token = generateToken(user.id, user.email);

  // Return user (without password hash)
  const { password_hash, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      token,
    },
  });
});

export const getCurrentUser = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user) {
      throw new ApiError(401, 'Not authenticated');
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      throw new ApiError(404, 'User not found');
    }

    const { password_hash, ...userWithoutPassword } = user;

    res.json({
      success: true,
      data: { user: userWithoutPassword },
    });
  }
);
