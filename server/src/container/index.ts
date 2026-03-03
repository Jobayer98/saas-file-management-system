import { PrismaClient } from "@/generated/prisma/client";

// Repositories
import { AuthRepository } from '@/repositories/auth/auth.repository';
import { PackageRepository } from '@/repositories/admin/package.repository';
import { UserRepository } from '@/repositories/admin/user.repository';
import { StatsRepository } from '@/repositories/admin/stats.repository';
import { SubscriptionRepository } from '@/repositories/subscription/subscription.repository';
import { FolderRepository } from '@/repositories/folder/folder.repository';
import { FileRepository } from '@/repositories/file/file.repository';
import { DashboardRepository } from '@/repositories/dashboard/dashboard.repository';

// Services
import { AuthService } from '@/services/auth/auth.service';
import { PackageService } from '@/services/admin/package.service';
import { UserService } from '@/services/admin/user.service';
import { StatsService } from '@/services/admin/stats.service';
import { SubscriptionService } from '@/services/subscription/subscription.service';
import { FolderService } from '@/services/folder/folder.service';
import { FileService } from '@/services/file/file.service';
import { DashboardService } from '@/services/dashboard/dashboard.service';

// Controllers
import { AuthController } from '@/controllers/auth/auth.controller';
import { PackageController } from '@/controllers/admin/package.controller';
import { UserController } from '@/controllers/admin/user.controller';
import { StatsController } from '@/controllers/admin/stats.controller';
import { SubscriptionController } from '@/controllers/subscription/subscription.controller';
import { FolderController } from '@/controllers/folder/folder.controller';
import { FileController } from '@/controllers/file/file.controller';
import { DashboardController } from '@/controllers/dashboard/dashboard.controller';

export class Container {
  // Infrastructure
  private _prisma: PrismaClient;

  // Repositories
  private _authRepository?: AuthRepository;
  private _packageRepository?: PackageRepository;
  private _userRepository?: UserRepository;
  private _statsRepository?: StatsRepository;
  private _subscriptionRepository?: SubscriptionRepository;
  private _folderRepository?: FolderRepository;
  private _fileRepository?: FileRepository;
  private _dashboardRepository?: DashboardRepository;

  // Services
  private _authService?: AuthService;
  private _packageService?: PackageService;
  private _userService?: UserService;
  private _statsService?: StatsService;
  private _subscriptionService?: SubscriptionService;
  private _folderService?: FolderService;
  private _fileService?: FileService;
  private _dashboardService?: DashboardService;

  // Controllers
  private _authController?: AuthController;
  private _packageController?: PackageController;
  private _userController?: UserController;
  private _statsController?: StatsController;
  private _subscriptionController?: SubscriptionController;
  private _folderController?: FolderController;
  private _fileController?: FileController;
  private _dashboardController?: DashboardController;

  constructor(prisma: PrismaClient) {
    this._prisma = prisma;
  }

  // Infrastructure getters
  get prisma(): PrismaClient {
    return this._prisma;
  }

  // Repository getters
  get authRepository(): AuthRepository {
    if (!this._authRepository) {
      this._authRepository = new AuthRepository(this._prisma);
    }
    return this._authRepository;
  }

  get packageRepository(): PackageRepository {
    if (!this._packageRepository) {
      this._packageRepository = new PackageRepository(this._prisma);
    }
    return this._packageRepository;
  }

  get userRepository(): UserRepository {
    if (!this._userRepository) {
      this._userRepository = new UserRepository(this._prisma);
    }
    return this._userRepository;
  }

  get statsRepository(): StatsRepository {
    if (!this._statsRepository) {
      this._statsRepository = new StatsRepository(this._prisma);
    }
    return this._statsRepository;
  }

  get subscriptionRepository(): SubscriptionRepository {
    if (!this._subscriptionRepository) {
      this._subscriptionRepository = new SubscriptionRepository(this._prisma);
    }
    return this._subscriptionRepository;
  }

  get folderRepository(): FolderRepository {
    if (!this._folderRepository) {
      this._folderRepository = new FolderRepository(this._prisma);
    }
    return this._folderRepository;
  }

  get fileRepository(): FileRepository {
    if (!this._fileRepository) {
      this._fileRepository = new FileRepository(this._prisma);
    }
    return this._fileRepository;
  }

  get dashboardRepository(): DashboardRepository {
    if (!this._dashboardRepository) {
      this._dashboardRepository = new DashboardRepository(this._prisma);
    }
    return this._dashboardRepository;
  }

  // Service getters
  get authService(): AuthService {
    if (!this._authService) {
      this._authService = new AuthService(this.authRepository);
    }
    return this._authService;
  }

  get packageService(): PackageService {
    if (!this._packageService) {
      this._packageService = new PackageService(this.packageRepository);
    }
    return this._packageService;
  }

  get userService(): UserService {
    if (!this._userService) {
      this._userService = new UserService(this.userRepository);
    }
    return this._userService;
  }

  get statsService(): StatsService {
    if (!this._statsService) {
      this._statsService = new StatsService(this.statsRepository);
    }
    return this._statsService;
  }

  get subscriptionService(): SubscriptionService {
    if (!this._subscriptionService) {
      this._subscriptionService = new SubscriptionService(
        this.subscriptionRepository,
      );
    }
    return this._subscriptionService;
  }

  get folderService(): FolderService {
    if (!this._folderService) {
      this._folderService = new FolderService(
        this.folderRepository,
        this.subscriptionRepository,
      );
    }
    return this._folderService;
  }

  get fileService(): FileService {
    if (!this._fileService) {
      this._fileService = new FileService(
        this.fileRepository,
        this.subscriptionRepository,
        this.folderRepository
      );
    }
    return this._fileService;
  }

  get dashboardService(): DashboardService {
    if (!this._dashboardService) {
      this._dashboardService = new DashboardService(this.dashboardRepository);
    }
    return this._dashboardService;
  }

  // Controller getters
  get authController(): AuthController {
    if (!this._authController) {
      this._authController = new AuthController(this.authService);
    }
    return this._authController;
  }

  get packageController(): PackageController {
    if (!this._packageController) {
      this._packageController = new PackageController(this.packageService);
    }
    return this._packageController;
  }

  get userController(): UserController {
    if (!this._userController) {
      this._userController = new UserController(this.userService);
    }
    return this._userController;
  }

  get statsController(): StatsController {
    if (!this._statsController) {
      this._statsController = new StatsController(this.statsService);
    }
    return this._statsController;
  }

  get subscriptionController(): SubscriptionController {
    if (!this._subscriptionController) {
      this._subscriptionController = new SubscriptionController(this.subscriptionService);
    }
    return this._subscriptionController;
  }

  get folderController(): FolderController {
    if (!this._folderController) {
      this._folderController = new FolderController(this.folderService);
    }
    return this._folderController;
  }

  get fileController(): FileController {
    if (!this._fileController) {
      this._fileController = new FileController(this.fileService);
    }
    return this._fileController;
  }

  get dashboardController(): DashboardController {
    if (!this._dashboardController) {
      this._dashboardController = new DashboardController(this.dashboardService);
    }
    return this._dashboardController;
  }
}

// Singleton instance
let containerInstance: Container | null = null;

export function initializeContainer(prisma: PrismaClient): Container {
  if (!containerInstance) {
    containerInstance = new Container(prisma);
  }
  return containerInstance;
}

export function getContainer(): Container {
  if (!containerInstance) {
    throw new Error('Container not initialized. Call initializeContainer first.');
  }
  return containerInstance;
}
