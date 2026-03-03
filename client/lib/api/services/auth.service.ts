import { apiClient } from '../client';
import type { AuthResponse, User, ApiResponse } from '@/types';

export const authService = {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await apiClient.post('/auth/login', { email, password });
    return response.data;
  },

  async register(email: string, password: string, name: string): Promise<ApiResponse<{ userId: string }>> {
    const response = await apiClient.post('/auth/register', { email, password, name });
    return response.data;
  },

  async logout(refreshToken: string): Promise<void> {
    await apiClient.post('/auth/logout', { refreshToken });
  },

  async verifyEmail(token: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/auth/verify-email', { token });
    return response.data;
  },

  async forgotPassword(email: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token: string, newPassword: string): Promise<ApiResponse<void>> {
    const response = await apiClient.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  async getCurrentUser(): Promise<User> {
    const response = await apiClient.get('/auth/me');
    return response.data.data;
  },
};
