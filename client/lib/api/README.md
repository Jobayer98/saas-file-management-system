# API Client Service

This directory contains the API client implementation with authentication handling and service modules for interacting with the backend API.

## Features

- ✅ Axios-based HTTP client with base configuration
- ✅ Request interceptor for automatic token injection
- ✅ Response interceptor for error handling
- ✅ Automatic token refresh on 401 responses
- ✅ Retry logic for failed requests (max 3 retries with exponential backoff)
- ✅ Request timeout handling (30 seconds)
- ✅ TypeScript interfaces for all API endpoints
- ✅ Error logging for debugging

## Architecture

```
lib/api/
├── client.ts              # Core API client with interceptors
├── services/
│   ├── auth.service.ts    # Authentication endpoints
│   ├── file.service.ts    # File management endpoints
│   ├── folder.service.ts  # Folder management endpoints
│   ├── subscription.service.ts  # Subscription endpoints
│   ├── admin.service.ts   # Admin endpoints
│   └── index.ts           # Service exports
└── index.ts               # Main exports
```

## Usage

### Basic Usage

```typescript
import { authService, fileService } from "@/lib/api";

// Login
const response = await authService.login("user@example.com", "password");
localStorage.setItem("accessToken", response.data.token);
localStorage.setItem("refreshToken", response.data.refreshToken);

// Get files
const files = await fileService.getFiles();
```

### Authentication Flow

The API client automatically handles authentication:

1. **Token Injection**: Access token is automatically added to all requests
2. **Token Refresh**: On 401 response, automatically refreshes token and retries request
3. **Auth Failure**: If refresh fails, clears tokens and redirects to login

```typescript
// Tokens are stored in localStorage
localStorage.setItem("accessToken", token);
localStorage.setItem("refreshToken", refreshToken);

// All subsequent requests automatically include the token
const user = await authService.getCurrentUser();
```

### Error Handling

The API client provides comprehensive error handling:

```typescript
try {
  await fileService.uploadFile(file);
} catch (error) {
  // Error is already formatted with user-friendly message
  console.error(error.message);

  // Access additional error details
  if (error.status === 403) {
    // Handle forbidden error
  }
}
```

### Retry Logic

Failed requests are automatically retried with exponential backoff:

- Network errors: Retried up to 3 times
- Timeout errors: Retried up to 3 times
- 5xx server errors: Retried up to 3 times
- Backoff delays: 1s, 2s, 4s

### File Upload

```typescript
// Single file upload
const file = await fileService.uploadFile(file, folderId);

// Multiple files
const result = await fileService.uploadMultipleFiles(files, folderId);

// Chunked upload for large files
const uploadId = await fileService.initChunkedUpload(
  fileName,
  fileSize,
  fileType,
  totalChunks,
  folderId,
);

for (let i = 0; i < totalChunks; i++) {
  await fileService.uploadChunk(uploadId, chunk, i);
}

const file = await fileService.completeChunkedUpload(uploadId);
```

### Folder Management

```typescript
// Get folder tree
const tree = await folderService.getFolderTree();

// Create folder
const folder = await folderService.createFolder("My Folder", parentId);

// Move folder
await folderService.moveFolder(folderId, targetFolderId);
```

### Subscription Management

```typescript
// Get current subscription
const { subscription, package, usage } =
  await subscriptionService.getCurrentSubscription();

// Change package
await subscriptionService.changePackage(newPackageId);

// Get usage stats
const usage = await subscriptionService.getUsage();
```

### Admin Operations

```typescript
// Get users
const users = await adminService.getUsers(1, 20, "search query");

// Suspend user
await adminService.suspendUser(userId, "Violation of terms");

// Get statistics
const stats = await adminService.getOverviewStats();
```

## Configuration

Set the API base URL via environment variable:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

Default: `http://localhost:3000/api`

## Error Logging

Errors are automatically logged:

- **Development**: Logged to console
- **All environments**: Last 50 errors stored in `localStorage` under `api_errors` key

Access error logs:

```typescript
const errors = JSON.parse(localStorage.getItem("api_errors") || "[]");
```

## Type Safety

All API methods are fully typed with TypeScript interfaces defined in `types/index.ts`:

- `User`
- `FileItem`
- `Folder`
- `Package`
- `Subscription`
- `AuthResponse`
- `ApiResponse<T>`
- `PaginatedResponse<T>`

## Requirements Validation

This implementation satisfies the following requirements:

- **11.1**: RESTful HTTP communication with backend ✅
- **11.2**: Automatic token injection in authenticated requests ✅
- **11.3**: Automatic token refresh on 401 responses ✅
- **11.4**: Redirect to login on refresh failure ✅
- **11.5**: Graceful network error handling ✅
- **11.6**: Request timeout handling (30s) ✅
- **11.7**: Type-safe interfaces with TypeScript ✅
- **11.8**: Retry logic with max 3 retries ✅
- **11.9**: Error logging for debugging ✅
