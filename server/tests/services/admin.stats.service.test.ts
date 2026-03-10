import { StatsService } from '../../src/services/admin/stats.service';
import { StatsRepository } from '../../src/repositories/admin/stats.repository';

describe('StatsService', () => {
  let statsService: StatsService;
  let mockStatsRepository: jest.Mocked<StatsRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockStatsRepository = {
      getOverviewStats: jest.fn(),
      getRevenueStats: jest.fn(),
      getUsageStats: jest.fn(),
    } as any;

    statsService = new StatsService(mockStatsRepository);
  });

  describe('getOverviewStats', () => {
    it('should return overview statistics with formatted data', async () => {
      // Arrange
      const mockStats = {
        totalUsers: 100,
        activeSubscriptions: 75,
        totalStorage: BigInt(1000000000),
        popularPackages: [
          {
            id: 1,
            name: 'pro',
            price: 9.99,
            subscriberCount: 50,
          },
          {
            id: 2,
            name: 'basic',
            price: 4.99,
            subscriberCount: 25,
          },
        ],
      };

      mockStatsRepository.getOverviewStats.mockResolvedValue(mockStats);

      // Act
      const result = await statsService.getOverviewStats();

      // Assert
      expect(mockStatsRepository.getOverviewStats).toHaveBeenCalled();
      expect(result).toEqual({
        totalUsers: 100,
        activeSubscriptions: 75,
        totalStorage: '1000000000',
        popularPackages: [
          {
            id: 1,
            name: 'pro',
            price: 9.99,
            subscriberCount: 50,
          },
          {
            id: 2,
            name: 'basic',
            price: 4.99,
            subscriberCount: 25,
          },
        ],
      });
    });

    it('should handle empty popular packages', async () => {
      // Arrange
      const mockStats = {
        totalUsers: 0,
        activeSubscriptions: 0,
        totalStorage: BigInt(0),
        popularPackages: [],
      };

      mockStatsRepository.getOverviewStats.mockResolvedValue(mockStats);

      // Act
      const result = await statsService.getOverviewStats();

      // Assert
      expect(result).toEqual({
        totalUsers: 0,
        activeSubscriptions: 0,
        totalStorage: '0',
        popularPackages: [],
      });
    });
  });

  describe('getRevenueStats', () => {
    it('should return revenue statistics without date filters', async () => {
      // Arrange
      const mockRevenueStats = {
        revenue: [
          { date: new Date('2024-01-15'), amount: 9.99, packageName: 'pro' },
          { date: new Date('2024-01-20'), amount: 9.99, packageName: 'pro' },
          { date: new Date('2024-02-10'), amount: 4.99, packageName: 'basic' },
        ],
        breakdown: {
          'pro': { count: 50, revenue: 999.50 },
          'basic': { count: 25, revenue: 501.00 },
        },
      };

      mockStatsRepository.getRevenueStats.mockResolvedValue(mockRevenueStats);

      // Act
      const result = await statsService.getRevenueStats();

      // Assert
      expect(mockStatsRepository.getRevenueStats).toHaveBeenCalledWith(undefined, undefined);
      expect(result).toEqual({
        revenue: [
          { date: new Date('2024-01-15'), amount: 9.99, packageName: 'pro' },
          { date: new Date('2024-01-20'), amount: 9.99, packageName: 'pro' },
          { date: new Date('2024-02-10'), amount: 4.99, packageName: 'basic' },
        ],
        breakdown: [
          {
            packageName: 'pro',
            subscriptionCount: 50,
            revenue: 999.50,
          },
          {
            packageName: 'basic',
            subscriptionCount: 25,
            revenue: 501.00,
          },
        ],
      });
    });

    it('should return revenue statistics with date filters', async () => {
      // Arrange
      const fromDate = new Date('2024-01-01');
      const toDate = new Date('2024-12-31');
      const mockRevenueStats = {
        revenue: [
          { date: new Date('2024-06-15'), amount: 9.99, packageName: 'pro' },
        ],
        breakdown: {
          'pro': { count: 10, revenue: 500.00 },
        },
      };

      mockStatsRepository.getRevenueStats.mockResolvedValue(mockRevenueStats);

      // Act
      const result = await statsService.getRevenueStats(fromDate, toDate);

      // Assert
      expect(mockStatsRepository.getRevenueStats).toHaveBeenCalledWith(fromDate, toDate);
      expect(result).toEqual({
        revenue: [
          { date: new Date('2024-06-15'), amount: 9.99, packageName: 'pro' },
        ],
        breakdown: [
          {
            packageName: 'pro',
            subscriptionCount: 10,
            revenue: 500.00,
          },
        ],
      });
    });

    it('should handle zero revenue', async () => {
      // Arrange
      const mockRevenueStats = {
        revenue: [],
        breakdown: {},
      };

      mockStatsRepository.getRevenueStats.mockResolvedValue(mockRevenueStats);

      // Act
      const result = await statsService.getRevenueStats();

      // Assert
      expect(result).toEqual({
        revenue: [],
        breakdown: [],
      });
    });
  });

  describe('getUsageStats', () => {
    it('should return usage statistics with top users', async () => {
      // Arrange
      const mockUsageStats = {
        topUsers: [
          {
            id: 'user_1',
            name: 'John Doe',
            email: 'john@example.com',
            totalStorage: 5000000000,
            totalFiles: 100,
            totalFolders: 20,
          },
          {
            id: 'user_2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            totalStorage: 3000000000,
            totalFiles: 75,
            totalFolders: 15,
          },
        ],
        storageTrend: [
          {
            date: new Date('2024-03-01'),
            size: BigInt(1000000000),
            fileCount: 50,
          },
          {
            date: new Date('2024-03-02'),
            size: BigInt(1500000000),
            fileCount: 75,
          },
        ],
      };

      mockStatsRepository.getUsageStats.mockResolvedValue(mockUsageStats);

      // Act
      const result = await statsService.getUsageStats();

      // Assert
      expect(mockStatsRepository.getUsageStats).toHaveBeenCalled();
      expect(result).toEqual({
        topUsers: [
          {
            id: 'user_1',
            name: 'John Doe',
            email: 'john@example.com',
            totalStorage: 5000000000,
            totalFiles: 100,
            totalFolders: 20,
          },
          {
            id: 'user_2',
            name: 'Jane Smith',
            email: 'jane@example.com',
            totalStorage: 3000000000,
            totalFiles: 75,
            totalFolders: 15,
          },
        ],
      });
    });

    it('should handle empty top users list', async () => {
      // Arrange
      const mockUsageStats = {
        topUsers: [],
        storageTrend: [],
      };

      mockStatsRepository.getUsageStats.mockResolvedValue(mockUsageStats);

      // Act
      const result = await statsService.getUsageStats();

      // Assert
      expect(result).toEqual({
        topUsers: [],
      });
    });
  });
});
