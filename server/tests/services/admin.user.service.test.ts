import { UserService } from '../../src/services/admin/user.service';
import { UserRepository } from '../../src/repositories/admin/user.repository';
import { AppError } from '../../src/middlewares/error/error.middleware';

describe('UserService', () => {
  let userService: UserService;
  let mockUserRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockUserRepository = {
      getAllUsers: jest.fn(),
      getUserById: jest.fn(),
      getUserUsageStats: jest.fn(),
      updateUserRole: jest.fn(),
      suspendUser: jest.fn(),
      activateUser: jest.fn(),
    } as any;

    userService = new UserService(mockUserRepository);
  });

  describe('getAllUsers', () => {
    it('should return paginated users list', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 'user_1',
          email: 'user1@example.com',
          name: 'User One',
          isAdmin: false,
          isEmailVerified: true,
          isSuspended: false,
          suspensionReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 'user_2',
          email: 'user2@example.com',
          name: 'User Two',
          isAdmin: false,
          isEmailVerified: true,
          isSuspended: false,
          suspensionReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUserRepository.getAllUsers.mockResolvedValue({
        users: mockUsers,
        total: 25,
      });

      // Act
      const result = await userService.getAllUsers(1, 10);

      // Assert
      expect(mockUserRepository.getAllUsers).toHaveBeenCalledWith(1, 10, undefined);
      expect(result).toEqual({
        users: mockUsers,
        total: 25,
        page: 1,
        limit: 10,
        totalPages: 3,
      });
    });

    it('should return paginated users with search filter', async () => {
      // Arrange
      const mockUsers = [
        {
          id: 'user_1',
          email: 'john@example.com',
          name: 'John Doe',
          isAdmin: false,
          isEmailVerified: true,
          isSuspended: false,
          suspensionReason: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      mockUserRepository.getAllUsers.mockResolvedValue({
        users: mockUsers,
        total: 1,
      });

      // Act
      const result = await userService.getAllUsers(1, 10, 'john');

      // Assert
      expect(mockUserRepository.getAllUsers).toHaveBeenCalledWith(1, 10, 'john');
      expect(result).toEqual({
        users: mockUsers,
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should handle empty results', async () => {
      // Arrange
      mockUserRepository.getAllUsers.mockResolvedValue({
        users: [],
        total: 0,
      });

      // Act
      const result = await userService.getAllUsers(1, 10);

      // Assert
      expect(result).toEqual({
        users: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      });
    });
  });

  describe('getUserById', () => {
    it('should return user details with usage stats', async () => {
      // Arrange
      const mockUser = {
        id: 'user_1',
        email: 'user@example.com',
        name: 'Test User',
        isAdmin: false,
        isEmailVerified: true,
        isSuspended: false,
        suspensionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscription: {
          id: 'sub_1',
          userId: 'user_1',
          packageId: 1,
          startDate: new Date(),
          endDate: null,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          package: {
            id: 1,
            name: 'Premium',
            description: 'Premium package',
            price: 9.99,
            maxFileSize: BigInt(10000000),
            totalFileLimit: BigInt(100),
            maxFolders: 50,
            maxNestingLevel: 5,
            allowedFileTypes: ['image/*', 'application/pdf'],
            filesPerFolder: 20,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
        },
      };

      const mockUsage = {
        fileCount: 50,
        folderCount: 10,
        totalSize: BigInt(5000000000),
      };

      mockUserRepository.getUserById.mockResolvedValue(mockUser);
      mockUserRepository.getUserUsageStats.mockResolvedValue(mockUsage);

      // Act
      const result = await userService.getUserById('user_1');

      // Assert
      expect(mockUserRepository.getUserById).toHaveBeenCalledWith('user_1');
      expect(mockUserRepository.getUserUsageStats).toHaveBeenCalledWith('user_1');
      expect(result).toEqual({
        user: {
          id: 'user_1',
          email: 'user@example.com',
          name: 'Test User',
          isAdmin: false,
          isEmailVerified: true,
          isSuspended: false,
          suspensionReason: null,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
          subscription: {
            id: 'sub_1',
            userId: 'user_1',
            packageId: 1,
            startDate: mockUser.subscription.startDate,
            endDate: null,
            isActive: true,
            createdAt: mockUser.subscription.createdAt,
            updatedAt: mockUser.subscription.updatedAt,
            package: {
              id: 1,
              name: 'Premium',
              description: 'Premium package',
              price: 9.99,
              maxFileSize: '10000000',
              totalFileLimit: '100',
              maxFolders: 50,
              maxNestingLevel: 5,
              allowedFileTypes: ['image/*', 'application/pdf'],
              filesPerFolder: 20,
              isActive: true,
              createdAt: mockUser.subscription.package.createdAt,
              updatedAt: mockUser.subscription.package.updatedAt,
            },
          },
        },
        usage: {
          fileCount: 50,
          folderCount: 10,
          totalSize: '5000000000',
        },
      });
    });

    it('should return user without subscription', async () => {
      // Arrange
      const mockUser = {
        id: 'user_1',
        email: 'user@example.com',
        name: 'Test User',
        isAdmin: false,
        isEmailVerified: true,
        isSuspended: false,
        suspensionReason: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        subscription: null,
      };

      const mockUsage = {
        fileCount: 0,
        folderCount: 0,
        totalSize: BigInt(0),
      };

      mockUserRepository.getUserById.mockResolvedValue(mockUser);
      mockUserRepository.getUserUsageStats.mockResolvedValue(mockUsage);

      // Act
      const result = await userService.getUserById('user_1');

      // Assert
      expect(result.user.subscription).toBeNull();
      expect(result.usage.totalSize).toBe('0');
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockUserRepository.getUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.getUserById('non_existent')).rejects.toThrow(
        new AppError('User not found', 404, 'USER_NOT_FOUND')
      );
      expect(mockUserRepository.getUserUsageStats).not.toHaveBeenCalled();
    });
  });

  describe('updateUserRole', () => {
    it('should successfully update user to admin', async () => {
      // Arrange
      const existingUser = {
        id: 'user_1',
        email: 'user@example.com',
        name: 'Test User',
        isAdmin: false,
      };

      const updatedUser = {
        id: 'user_1',
        email: 'user@example.com',
        name: 'Test User',
        isAdmin: true,
        password: 'hashed',
        emailVerifyToken: null,
        isEmailVerified: true,
        isSuspended: false,
        suspensionReason: null,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.getUserById.mockResolvedValue(existingUser as any);
      mockUserRepository.updateUserRole.mockResolvedValue(updatedUser);

      // Act
      const result = await userService.updateUserRole('user_1', true);

      // Assert
      expect(mockUserRepository.getUserById).toHaveBeenCalledWith('user_1');
      expect(mockUserRepository.updateUserRole).toHaveBeenCalledWith('user_1', true);
      expect(result).toEqual({
        user: {
          id: 'user_1',
          email: 'user@example.com',
          name: 'Test User',
          isAdmin: true,
        },
      });
    });

    it('should successfully remove admin role from user', async () => {
      // Arrange
      const existingUser = {
        id: 'user_1',
        email: 'user@example.com',
        name: 'Test User',
        isAdmin: true,
      };

      const updatedUser = {
        id: 'user_1',
        email: 'user@example.com',
        name: 'Test User',
        isAdmin: false,
        password: 'hashed',
        emailVerifyToken: null,
        isEmailVerified: true,
        isSuspended: false,
        suspensionReason: null,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.getUserById.mockResolvedValue(existingUser as any);
      mockUserRepository.updateUserRole.mockResolvedValue(updatedUser);

      // Act
      const result = await userService.updateUserRole('user_1', false);

      // Assert
      expect(result.user.isAdmin).toBe(false);
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockUserRepository.getUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.updateUserRole('non_existent', true)).rejects.toThrow(
        new AppError('User not found', 404, 'USER_NOT_FOUND')
      );
      expect(mockUserRepository.updateUserRole).not.toHaveBeenCalled();
    });
  });

  describe('suspendUser', () => {
    it('should successfully suspend a user', async () => {
      // Arrange
      const existingUser = {
        id: 'user_1',
        email: 'user@example.com',
        name: 'Test User',
        isSuspended: false,
      };

      const suspendedUser = {
        id: 'user_1',
        email: 'user@example.com',
        name: 'Test User',
        password: 'hashed',
        emailVerifyToken: null,
        isEmailVerified: true,
        isSuspended: true,
        suspensionReason: 'Violation of terms',
        resetPasswordToken: null,
        resetPasswordExpiry: null,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.getUserById.mockResolvedValue(existingUser as any);
      mockUserRepository.suspendUser.mockResolvedValue(suspendedUser);

      // Act
      const result = await userService.suspendUser('user_1', 'Violation of terms');

      // Assert
      expect(mockUserRepository.getUserById).toHaveBeenCalledWith('user_1');
      expect(mockUserRepository.suspendUser).toHaveBeenCalledWith('user_1', 'Violation of terms');
      expect(result).toEqual({ message: 'User suspended successfully' });
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockUserRepository.getUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.suspendUser('non_existent', 'Reason')).rejects.toThrow(
        new AppError('User not found', 404, 'USER_NOT_FOUND')
      );
      expect(mockUserRepository.suspendUser).not.toHaveBeenCalled();
    });

    it('should throw error if user is already suspended', async () => {
      // Arrange
      const existingUser = {
        id: 'user_1',
        email: 'user@example.com',
        name: 'Test User',
        isSuspended: true,
      };

      mockUserRepository.getUserById.mockResolvedValue(existingUser as any);

      // Act & Assert
      await expect(userService.suspendUser('user_1', 'Reason')).rejects.toThrow(
        new AppError('User is already suspended', 400, 'USER_ALREADY_SUSPENDED')
      );
      expect(mockUserRepository.suspendUser).not.toHaveBeenCalled();
    });
  });

  describe('activateUser', () => {
    it('should successfully activate a suspended user', async () => {
      // Arrange
      const existingUser = {
        id: 'user_1',
        email: 'user@example.com',
        name: 'Test User',
        isSuspended: true,
      };

      const activatedUser = {
        id: 'user_1',
        email: 'user@example.com',
        name: 'Test User',
        password: 'hashed',
        emailVerifyToken: null,
        isEmailVerified: true,
        isSuspended: false,
        suspensionReason: null,
        resetPasswordToken: null,
        resetPasswordExpiry: null,
        isAdmin: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUserRepository.getUserById.mockResolvedValue(existingUser as any);
      mockUserRepository.activateUser.mockResolvedValue(activatedUser);

      // Act
      const result = await userService.activateUser('user_1');

      // Assert
      expect(mockUserRepository.getUserById).toHaveBeenCalledWith('user_1');
      expect(mockUserRepository.activateUser).toHaveBeenCalledWith('user_1');
      expect(result).toEqual({ message: 'User activated successfully' });
    });

    it('should throw error if user not found', async () => {
      // Arrange
      mockUserRepository.getUserById.mockResolvedValue(null);

      // Act & Assert
      await expect(userService.activateUser('non_existent')).rejects.toThrow(
        new AppError('User not found', 404, 'USER_NOT_FOUND')
      );
      expect(mockUserRepository.activateUser).not.toHaveBeenCalled();
    });

    it('should throw error if user is not suspended', async () => {
      // Arrange
      const existingUser = {
        id: 'user_1',
        email: 'user@example.com',
        name: 'Test User',
        isSuspended: false,
      };

      mockUserRepository.getUserById.mockResolvedValue(existingUser as any);

      // Act & Assert
      await expect(userService.activateUser('user_1')).rejects.toThrow(
        new AppError('User is not suspended', 400, 'USER_NOT_SUSPENDED')
      );
      expect(mockUserRepository.activateUser).not.toHaveBeenCalled();
    });
  });
});
