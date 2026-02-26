import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/env';
import { ApiError } from './errorHandler';

/**
 * JWT authentication middleware
 * Verifies token and attaches user to request
 */

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export const authenticateToken = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    throw new ApiError(401, 'Missing authentication token');
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as {
      id: string;
      email: string;
    };
    req.user = decoded;
    next();
  } catch (err) {
    throw new ApiError(401, 'Invalid or expired token');
  }
};

/**
 * Generate JWT token for user
 */
export const generateToken = (userId: string, email: string): string => {
  return jwt.sign(
    { id: userId, email },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn,
    } as any
  );
};
