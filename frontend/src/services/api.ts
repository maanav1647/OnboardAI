import axios, { AxiosInstance } from 'axios';
import { AuthResponse, OnboardingResponse, ProfileData, User } from '../types';

/**
 * API Service - Handles all HTTP requests to backend
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const api: AxiosInstance = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  /**
   * Create new account
   */
  signup: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/signup', {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Login to existing account
   */
  login: async (email: string, password: string): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  /**
   * Get current user info
   */
  getCurrentUser: async (): Promise<{ success: boolean; data: { user: User } }> => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  /**
   * Logout
   */
  logout: (): void => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const userService = {
  /**
   * Update user profile and get assigned onboarding path
   */
  updateProfile: async (
    data: ProfileData
  ): Promise<OnboardingResponse> => {
    const response = await api.put<OnboardingResponse>('/users/profile', data);
    return response.data;
  },

  /**
   * Get user profile and current onboarding path
   */
  getProfile: async (): Promise<{ success: boolean; data: any }> => {
    const response = await api.get('/users/profile');
    return response.data;
  },

  /**
   * Get all users (admin)
   */
  getAllUsers: async (): Promise<{ success: boolean; data: any }> => {
    const response = await api.get('/users');
    return response.data;
  },
};

export default api;
