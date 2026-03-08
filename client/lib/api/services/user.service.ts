import { apiClient } from '../client';
import type { User, ApiResponse } from '@/types';

export const userService = {
  async getProfile(): Promise<User> {
    const response = await apiClient.get('/users/profile');
    return response.data.data;
  },

  async updateProfile(data: { name?: string; email?: string }): Promise<User> {
    const response = await apiClient.put('/users/profile', data);
    return response.data.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string }): Promise<ApiResponse<void>> {
    const response = await apiClient.put('/users/change-password', data);
    return response.data;
  },

  async deleteAccount(): Promise<ApiResponse<void>> {
    const response = await apiClient.delete('/users/account');
    return response.data;
  },
};
