import { PackageService } from '../../src/services/admin/package.service';
import { PackageRepository } from '../../src/repositories/admin/package.repository';
import { AppError } from '../../src/middlewares/error/error.middleware';

describe('PackageService', () => {
  let packageService: PackageService;
  let mockPackageRepository: jest.Mocked<PackageRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockPackageRepository = {
      createPackage: jest.fn(),
      getAllPackages: jest.fn(),
      getPackageById: jest.fn(),
      updatePackage: jest.fn(),
      deletePackage: jest.fn(),
      getPackageWithSubscriptionCount: jest.fn(),
      togglePackageStatus: jest.fn(),
    } as any;

    packageService = new PackageService(mockPackageRepository);
  });

  describe('createPackage', () => {
    it('should successfully create a package', async () => {
      // Arrange
      const createInput = {
        name: 'Premium',
        description: 'Premium package',
        price: 9.99,
        maxFileSize: 10000000,
        totalFileLimit:100,
        maxFolders: 50,
        maxNestingLevel: 5,
        allowedFileTypes: ['image/*', 'application/pdf'],
        filesPerFolder: 20,
        isActive: true,
      };

      const mockPackage = {
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
      };

      mockPackageRepository.createPackage.mockResolvedValue(mockPackage);

      // Act
      const result = await packageService.createPackage(createInput);

      // Assert
      expect(mockPackageRepository.createPackage).toHaveBeenCalledWith(createInput);
      expect(result).toEqual({
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
          createdAt: mockPackage.createdAt,
          updatedAt: mockPackage.updatedAt,
        },
      });
    });
  });

  describe('getAllPackages', () => {
    it('should return all packages with formatted data', async () => {
      // Arrange
      const mockPackages = [
        {
          id: 1,
          name: 'free',
          description: 'Free package',
          price: 0,
          maxFileSize: BigInt(5000000),
          totalFileLimit: BigInt(10),
          maxFolders: 5,
          maxNestingLevel: 2,
          allowedFileTypes: ['image/*'],
          filesPerFolder: 5,
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
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
      ];

      mockPackageRepository.getAllPackages.mockResolvedValue(mockPackages);

      // Act
      const result = await packageService.getAllPackages();

      // Assert
      expect(mockPackageRepository.getAllPackages).toHaveBeenCalled();
      expect(result.packages).toHaveLength(2);
      expect(result.packages[0].maxFileSize).toBe('5000000');
      expect(result.packages[1].maxFileSize).toBe('10000000');
    });

    it('should return empty array when no packages exist', async () => {
      // Arrange
      mockPackageRepository.getAllPackages.mockResolvedValue([]);

      // Act
      const result = await packageService.getAllPackages();

      // Assert
      expect(result.packages).toEqual([]);
    });
  });

  describe('getPackageById', () => {
    it('should return package by id with formatted data', async () => {
      // Arrange
      const mockPackage = {
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
      };

      mockPackageRepository.getPackageById.mockResolvedValue(mockPackage);

      // Act
      const result = await packageService.getPackageById(1);

      // Assert
      expect(mockPackageRepository.getPackageById).toHaveBeenCalledWith(1);
      expect(result).toEqual({
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
          createdAt: mockPackage.createdAt,
          updatedAt: mockPackage.updatedAt,
        },
      });
    });

    it('should throw error if package not found', async () => {
      // Arrange
      mockPackageRepository.getPackageById.mockResolvedValue(null);

      // Act & Assert
      await expect(packageService.getPackageById(999)).rejects.toThrow(
        new AppError('Package not found', 404, 'PACKAGE_NOT_FOUND')
      );
    });
  });

  describe('updatePackage', () => {
    it('should successfully update a package', async () => {
      // Arrange
      const updateInput = {
        name: 'Premium Plus',
        price: 14.99,
      };

      const existingPackage = {
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
      };

      const updatedPackage = {
        ...existingPackage,
        name: 'Premium Plus',
        price: 14.99,
      };

      mockPackageRepository.getPackageById.mockResolvedValue(existingPackage);
      mockPackageRepository.updatePackage.mockResolvedValue(updatedPackage);

      // Act
      const result = await packageService.updatePackage(1, updateInput);

      // Assert
      expect(mockPackageRepository.getPackageById).toHaveBeenCalledWith(1);
      expect(mockPackageRepository.updatePackage).toHaveBeenCalledWith(1, updateInput);
      expect(result.package.name).toBe('Premium Plus');
      expect(result.package.price).toBe(14.99);
    });

    it('should throw error if package not found', async () => {
      // Arrange
      const updateInput = {
        name: 'Premium Plus',
      };

      mockPackageRepository.getPackageById.mockResolvedValue(null);

      // Act & Assert
      await expect(packageService.updatePackage(999, updateInput)).rejects.toThrow(
        new AppError('Package not found', 404, 'PACKAGE_NOT_FOUND')
      );
      expect(mockPackageRepository.updatePackage).not.toHaveBeenCalled();
    });
  });

  describe('deletePackage', () => {
    it('should successfully delete a package with no subscriptions', async () => {
      // Arrange
      const mockPackage = {
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
        _count: {
          subscriptions: 0,
        },
      };

      mockPackageRepository.getPackageWithSubscriptionCount.mockResolvedValue(mockPackage);
      mockPackageRepository.deletePackage.mockResolvedValue(undefined);

      // Act
      const result = await packageService.deletePackage(1);

      // Assert
      expect(mockPackageRepository.getPackageWithSubscriptionCount).toHaveBeenCalledWith(1);
      expect(mockPackageRepository.deletePackage).toHaveBeenCalledWith(1);
      expect(result).toEqual({ message: 'Package deleted successfully' });
    });

    it('should throw error if package not found', async () => {
      // Arrange
      mockPackageRepository.getPackageWithSubscriptionCount.mockResolvedValue(null);

      // Act & Assert
      await expect(packageService.deletePackage(999)).rejects.toThrow(
        new AppError('Package not found', 404, 'PACKAGE_NOT_FOUND')
      );
      expect(mockPackageRepository.deletePackage).not.toHaveBeenCalled();
    });

    it('should throw error if package has active subscriptions', async () => {
      // Arrange
      const mockPackage = {
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
        _count: {
          subscriptions: 5,
        },
      };

      mockPackageRepository.getPackageWithSubscriptionCount.mockResolvedValue(mockPackage);

      // Act & Assert
      await expect(packageService.deletePackage(1)).rejects.toThrow(
        new AppError('Cannot delete package with active subscriptions', 400, 'PACKAGE_HAS_SUBSCRIPTIONS')
      );
      expect(mockPackageRepository.deletePackage).not.toHaveBeenCalled();
    });
  });

  describe('togglePackageStatus', () => {
    it('should activate an inactive package', async () => {
      // Arrange
      const mockPackage = {
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
      };

      mockPackageRepository.togglePackageStatus.mockResolvedValue(mockPackage);

      // Act
      const result = await packageService.togglePackageStatus(1);

      // Assert
      expect(mockPackageRepository.togglePackageStatus).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        isActive: true,
        message: 'Package activated successfully',
      });
    });

    it('should deactivate an active package', async () => {
      // Arrange
      const mockPackage = {
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
        isActive: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPackageRepository.togglePackageStatus.mockResolvedValue(mockPackage);

      // Act
      const result = await packageService.togglePackageStatus(1);

      // Assert
      expect(mockPackageRepository.togglePackageStatus).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        isActive: false,
        message: 'Package deactivated successfully',
      });
    });
  });
});
