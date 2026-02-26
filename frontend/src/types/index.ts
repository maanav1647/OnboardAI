/**
 * TypeScript interfaces for frontend
 */

export interface User {
  id: string;
  email: string;
  role?: string;
  team_size?: string;
  goal?: string;
  assigned_path?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ChecklistItem {
  title: string;
  description: string;
}

export interface OnboardingPath {
  id: string;
  name: string;
  description: string;
  checklist: ChecklistItem[];
}

export interface ProfileData {
  role: string;
  team_size: string;
  goal: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface OnboardingResponse {
  success: boolean;
  data: {
    user: User;
    assignedPath: string;
    welcomeMessage: string;
    path: OnboardingPath;
  };
}
