import { AppError } from '@/middlewares/error/error.middleware';
import { ProfileRepository } from '@/repositories/profile/profile.repository';
import { hashPassword, comparePassword } from '@/utils/helpers/password.helper';
import { UpdateProfileInput, ChangePasswordInput } from '@/validators/user/user.validator';

export class ProfileService {
  constructor(private profileRepository: ProfileRepository) {}

  async updateProfile(userId: string, data: UpdateProfileInput) {
    const existingUser = await this.profileRepository.findById(userId);
    
    if (!existingUser) {
      throw new AppError('User not found', 404);
    }

    // Check if email is being changed and if it's already taken
    if (data.email && data.email !== existingUser.email) {
      const emailExists = await this.profileRepository.findByEmail(data.email);
      if (emailExists) {
        throw new AppError('Email already in use', 400);
      }
    }

    const updatedUser = await this.profileRepository.updateProfile(userId, data);
    
    return {
      message: 'Profile updated successfully',
      user: updatedUser,
    };
  }

  async changePassword(userId: string, data: ChangePasswordInput) {
    const user = await this.profileRepository.findByIdWithPassword(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isCurrentPasswordValid = await comparePassword(data.currentPassword, user.password);
    
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400);
    }

    const hashedNewPassword = await hashPassword(data.newPassword);
    await this.profileRepository.updatePassword(userId, hashedNewPassword);

    return {
      message: 'Password changed successfully',
    };
  }

  async deleteAccount(userId: string) {
    const user = await this.profileRepository.findById(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    await this.profileRepository.deleteAccount(userId);

    return {
      message: 'Account deleted successfully',
    };
  }

  async getProfile(userId: string) {
    const user = await this.profileRepository.findById(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }

    return {
      user,
    };
  }
}