import { DashboardService } from '../../src/services/dashboard/dashboard.service';
import { DashboardRepository } from '../../src/repositories/dashboard/dashboard.repository';

describe('DashboardService', () => {
  let dashboardService: DashboardService;
  let mockDashboardRepository: jest.Mocked<DashboardRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDashboardRepository = {
      getTotalFiles: jest.fn(),
      getTotalFolders: jest.fn(),
      getStorageUsed: jest.fn(),
      getUserSubscription: jest.fn(),
      getRecentFiles: jest.fn(),
    } as any;

    dashboardService = new DashboardService(mockDashboardRepository);
  });

  describe('getDashboardStats', () => {
    it('should return dashboard stats with subscription', async () => {
      // Arrange
      const userId = 'user_123';
      const mockSubscription = {
        id: 'sub_1',
        userId: 'user_123',
        packageId: 1,
        startDate: new Date(),
        endDate: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        package: {
          name: 'Premium',
        },
      };

      const mockRecentFiles = [
        {
          id: 'file_1',
          name: 'document.pdf',
          originalName: 'document.pdf',
          mimeType: 'application/pdf',
          size: '1024000',
          createdAt: new Date(),
          updatedAt: new Date(),
          folder: null,
        },
        {
          id: 'file_2',
          name: 'image.jpg',
          originalName: 'image.jpg',
          mimeType: 'image/jpeg',
          size: '512000',
          createdAt: new Date(),
          updatedAt: new Date(),
          folder: {
            name: 'My Folder',
            path: '/my-folder',
          },
        },
      ];

      mockDashboardRepository.getTotalFiles.mockResolvedValue(25);
      mockDashboardRepository.getTotalFolders.mockResolvedValue(10);
      mockDashboardRepository.getStorageUsed.mockResolvedValue('4.66 GB');
      mockDashboardRepository.getUserSubscription.mockResolvedValue(mockSubscription as any);
      mockDashboardRepository.getRecentFiles.mockResolvedValue(mockRecentFiles);

      // Act
      const result = await dashboardService.getDashboardStats(userId);

      // Assert
      expect(mockDashboardRepository.getTotalFiles).toHaveBeenCalledWith(userId);
      expect(mockDashboardRepository.getTotalFolders).toHaveBeenCalledWith(userId);
      expect(mockDashboardRepository.getStorageUsed).toHaveBeenCalledWith(userId);
      expect(mockDashboardRepository.getUserSubscription).toHaveBeenCalledWith(userId);
      expect(mockDashboardRepository.getRecentFiles).toHaveBeenCalledWith(userId, 5);

      expect(result).toEqual({
        totalFiles: 25,
        totalFolders: 10,
        storageUsed: '4.66 GB',
        subscriptionType: 'Premium',
        recentFiles: mockRecentFiles,
      });
    });

    it('should return dashboard stats without subscription (Free)', async () => {
      // Arrange
      const userId = 'user_123';

      mockDashboardRepository.getTotalFiles.mockResolvedValue(5);
      mockDashboardRepository.getTotalFolders.mockResolvedValue(2);
      mockDashboardRepository.getStorageUsed.mockResolvedValue('976.56 KB');
      mockDashboardRepository.getUserSubscription.mockResolvedValue(null);
      mockDashboardRepository.getRecentFiles.mockResolvedValue([]);

      // Act
      const result = await dashboardService.getDashboardStats(userId);

      // Assert
      expect(result).toEqual({
        totalFiles: 5,
        totalFolders: 2,
        storageUsed: '976.56 KB',
        subscriptionType: 'Free',
        recentFiles: [],
      });
    });

    it('should return dashboard stats with subscription but no package (Free)', async () => {
      // Arrange
      const userId = 'user_123';
      const mockSubscription = {
        id: 'sub_1',
        userId: 'user_123',
        packageId: 1,
        startDate: new Date(),
        endDate: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        package: null,
      };

      mockDashboardRepository.getTotalFiles.mockResolvedValue(0);
      mockDashboardRepository.getTotalFolders.mockResolvedValue(0);
      mockDashboardRepository.getStorageUsed.mockResolvedValue('0 B');
      mockDashboardRepository.getUserSubscription.mockResolvedValue(mockSubscription as any);
      mockDashboardRepository.getRecentFiles.mockResolvedValue([]);

      // Act
      const result = await dashboardService.getDashboardStats(userId);

      // Assert
      expect(result).toEqual({
        totalFiles: 0,
        totalFolders: 0,
        storageUsed: '0 B',
        subscriptionType: 'Free',
        recentFiles: [],
      });
    });

    it('should handle user with no files or folders', async () => {
      // Arrange
      const userId = 'new_user_123';
      const mockSubscription = {
        id: 'sub_1',
        userId: 'new_user_123',
        packageId: 1,
        startDate: new Date(),
        endDate: null,
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        package: {
          name: 'Basic',
        },
      };

      mockDashboardRepository.getTotalFiles.mockResolvedValue(0);
      mockDashboardRepository.getTotalFolders.mockResolvedValue(0);
      mockDashboardRepository.getStorageUsed.mockResolvedValue('0 B');
      mockDashboardRepository.getUserSubscription.mockResolvedValue(mockSubscription as any);
      mockDashboardRepository.getRecentFiles.mockResolvedValue([]);

      // Act
      const result = await dashboardService.getDashboardStats(userId);

      // Assert
      expect(result).toEqual({
        totalFiles: 0,
        totalFolders: 0,
        storageUsed: '0 B',
        subscriptionType: 'Basic',
        recentFiles: [],
      });
    });

    it('should return dashboard stats with multiple recent files', async () => {
      // Arrange
      const userId = 'user_123';
      const mockRecentFiles = [
        {
          id: 'file_1',
          name: 'doc1.pdf',
          originalName: 'doc1.pdf',
          mimeType: 'application/pdf',
          size: '1024000',
          createdAt: new Date('2024-03-01'),
          updatedAt: new Date('2024-03-01'),
          folder: null,
        },
        {
          id: 'file_2',
          name: 'doc2.pdf',
          originalName: 'doc2.pdf',
          mimeType: 'application/pdf',
          size: '2048000',
          createdAt: new Date('2024-03-02'),
          updatedAt: new Date('2024-03-02'),
          folder: {
            name: 'Documents',
            path: '/documents',
          },
        },
        {
          id: 'file_3',
          name: 'doc3.pdf',
          originalName: 'doc3.pdf',
          mimeType: 'application/pdf',
          size: '3072000',
          createdAt: new Date('2024-03-03'),
          updatedAt: new Date('2024-03-03'),
          folder: null,
        },
        {
          id: 'file_4',
          name: 'doc4.pdf',
          originalName: 'doc4.pdf',
          mimeType: 'application/pdf',
          size: '4096000',
          createdAt: new Date('2024-03-04'),
          updatedAt: new Date('2024-03-04'),
          folder: {
            name: 'Work',
            path: '/work',
          },
        },
        {
          id: 'file_5',
          name: 'doc5.pdf',
          originalName: 'doc5.pdf',
          mimeType: 'application/pdf',
          size: '5120000',
          createdAt: new Date('2024-03-05'),
          updatedAt: new Date('2024-03-05'),
          folder: null,
        },
      ];

      mockDashboardRepository.getTotalFiles.mockResolvedValue(50);
      mockDashboardRepository.getTotalFolders.mockResolvedValue(15);
      mockDashboardRepository.getStorageUsed.mockResolvedValue('9.31');
      mockDashboardRepository.getUserSubscription.mockResolvedValue(null);
      mockDashboardRepository.getRecentFiles.mockResolvedValue(mockRecentFiles);

      // Act
      const result = await dashboardService.getDashboardStats(userId);

      // Assert
      expect(result.recentFiles).toHaveLength(5);
      expect(result.recentFiles).toEqual(mockRecentFiles);
    });
  });
});
