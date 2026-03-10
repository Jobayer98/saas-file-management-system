# Unit Tests

This directory contains unit tests for all services in the application.

## Setup

Install dependencies:

```bash
npm install
```

## Running Tests

Run all tests:

```bash
npm test
```

Run tests in watch mode:

```bash
npm run test:watch
```

Run tests with coverage:

```bash
npm run test:coverage
```

Run tests with verbose output:

```bash
npm run test:verbose
```

## Test Structure

Tests are organized in the `tests` folder mirroring the source structure:

```
tests/
├── setup.ts                          # Global test setup
├── services/
│   ├── auth.service.test.ts         # Auth service tests
│   ├── dashboard.service.test.ts    # Dashboard service tests
│   ├── file.service.test.ts         # File service tests
│   └── ...                          # Other service tests
└── README.md
```

## Writing Tests

Each service test file should:

1. Mock all external dependencies (repositories, helpers, libraries)
2. Test all public methods
3. Cover success cases and error cases
4. Use descriptive test names
5. Follow the AAA pattern (Arrange, Act, Assert)

### Example Test Structure:

```typescript
describe("ServiceName", () => {
  let service: ServiceName;
  let mockRepository: jest.Mocked<RepositoryName>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRepository = new RepositoryName() as jest.Mocked<RepositoryName>;
    service = new ServiceName(mockRepository);
  });

  describe("methodName", () => {
    it("should handle success case", async () => {
      // Arrange
      // Act
      // Assert
    });

    it("should handle error case", async () => {
      // Arrange
      // Act & Assert
    });
  });
});
```

## Coverage Goals

- Aim for 80%+ code coverage
- Focus on critical business logic
- Test edge cases and error handling
- Mock external dependencies properly

## Completed Tests

- ✅ AuthService - 100% coverage (register, login, logout, verifyEmail, forgotPassword, resetPassword, refreshAccessToken, getMe)
- ✅ Admin StatsService - 100% coverage (getOverviewStats, getRevenueStats, getUsageStats)
- ✅ Admin PackageService - 100% coverage (createPackage, getAllPackages, getPackageById, updatePackage, deletePackage, togglePackageStatus)
- ✅ Admin UserService - 100% coverage (getAllUsers, getUserById, updateUserRole, suspendUser, activateUser)
- ✅ DashboardService - 100% coverage (getDashboardStats)

## Pending Tests

- [ ] File Service
- [ ] Folder Service
- [ ] Profile Service
- [ ] Subscription Service
- [ ] Trash Service
- [ ] Cloudinary Service
- [ ] Scheduler Service
