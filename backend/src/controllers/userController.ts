import { Request, Response } from 'express';
import { User } from '../models/User';
import { OnboardingPath } from '../models/OnboardingPath';
import { scoreAndAssignPath, generateWelcomeMessage } from '../services/aiService';
import { ApiError, asyncHandler } from '../middleware/errorHandler';
import { validationResult } from 'express-validator';

/**
 * User controller
 * Handles user profile updates and onboarding
 */

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ApiError(400, errors.array()[0].msg);
  }

  if (!req.user) {
    throw new ApiError(401, 'Not authenticated');
  }

  const { role, team_size, goal } = req.body;

  try {
    // Score user and assign path using AI
    const assignedPath = await scoreAndAssignPath(role, team_size, goal);

    // Find the path ID for the assigned path name
    const pathData = await OnboardingPath.findByUserType(assignedPath);
    if (!pathData) {
      throw new ApiError(500, 'Could not find assigned path');
    }

    // Update user with profile and assigned path
    const updatedUser = await User.updateProfile(req.user.id, {
      role,
      team_size,
      goal,
      assigned_path: pathData.id,
    });

    if (!updatedUser) {
      throw new ApiError(500, 'Could not update user profile');
    }

    // Generate personalized welcome message
    const welcomeMessage = await generateWelcomeMessage(
      updatedUser.email.split('@')[0],
      assignedPath
    );

    const { password_hash, ...userWithoutPassword } = updatedUser;

    res.json({
      success: true,
      data: {
        user: userWithoutPassword,
        assignedPath,
        welcomeMessage,
        path: {
          id: pathData.id,
          name: pathData.name,
          description: pathData.description,
          checklist: OnboardingPath.parseChecklist(pathData),
        },
      },
    });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(500, 'Failed to process onboarding');
  }
});

export const getUserProfile = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) {
    throw new ApiError(401, 'Not authenticated');
  }

  const user = await User.findById(req.user.id);
  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  let pathData = null;
  if (user.assigned_path) {
    pathData = await OnboardingPath.findById(user.assigned_path);
  }

  const { password_hash, ...userWithoutPassword } = user;

  res.json({
    success: true,
    data: {
      user: userWithoutPassword,
      path: pathData
        ? {
            id: pathData.id,
            name: pathData.name,
            description: pathData.description,
            checklist: OnboardingPath.parseChecklist(pathData),
          }
        : null,
    },
  });
});

/**
 * Admin: Get all users with their assignments
 */
export const getAllUsers = asyncHandler(async (req: Request, res: Response) => {
  // In production, check admin role here
  // if (req.user?.role !== 'admin') throw new ApiError(403, 'Forbidden');

  const users = await User.getAllUsers();

  // Enrich with path information
  const enrichedUsers = await Promise.all(
    users.map(async (user: any) => {
      if (user.assigned_path) {
        const path = await OnboardingPath.findById(user.assigned_path);
        return {
          ...user,
          assignedPathName: path?.name || 'Unknown',
        };
      }
      return {
        ...user,
        assignedPathName: null,
      };
    })
  );

  res.json({
    success: true,
    data: {
      users: enrichedUsers,
      total: enrichedUsers.length,
    },
  });
});
