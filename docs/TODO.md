## Development Rules & Guidelines

### 1. Development Workflow

```
Feature Development Flow:
1. Database Schema Update → Prisma Generate → Migration
2. Service Layer Implementation
3. API Endpoint Creation
4. Middleware Integration
5. Frontend Component Development
6. Documentation Update
```

### 2. Code Standards

- **TypeScript**: Strict mode enabled
- **API Routes**: RESTful naming conventions
- **Error Handling**: Consistent error response format
- **Validation**: Input validation on all endpoints
- **Authorization**: Role-based access control on all endpoints

### 3. Database Migration Rules

- Never delete columns without deprecation period
- Always backup before migration
- Test migrations on staging first
- Document breaking changes

### 4. Testing Requirements

- Unit tests for services
- Integration tests for API endpoints
- E2E tests for critical flows
- Load testing for file uploads

---

## Phase 1: Foundation & Authentication

### Tasks

#### Database Setup

- [ ] Initialize PostgreSQL database
- [ ] Setup Prisma ORM
- [ ] Create initial migration
- [ ] Seed default admin user

#### Authentication API Endpoints

| Method | Endpoint                    | Request Body                | Response              | Status  |
| ------ | --------------------------- | --------------------------- | --------------------- | ------- |
| POST   | `/api/auth/register`        | `{ email, password, name }` | `{ message, userId }` | Pending |
| POST   | `/api/auth/login`           | `{ email, password }`       | `{ token, user }`     | Pending |
| POST   | `/api/auth/logout`          | `{ token }`                 | `{ message }`         | Pending |
| POST   | `/api/auth/verify-email`    | `{ token }`                 | `{ message }`         | Pending |
| POST   | `/api/auth/forgot-password` | `{ email }`                 | `{ message }`         | Pending |
| POST   | `/api/auth/reset-password`  | `{ token, newPassword }`    | `{ message }`         | Pending |
| GET    | `/api/auth/me`              | -                           | `{ user }`            | Pending |
| POST   | `/api/auth/refresh-token`   | `{ refreshToken }`          | `{ token }`           | Pending |

#### Email Service Setup

- [ ] Configure email provider (SendGrid/Nodemailer)
- [ ] Create email templates
- [ ] Implement email queue system

---

## Phase 2: Admin Panel

### Tasks

#### Package Management API Endpoints

| Method | Endpoint                         | Request Body                                                                                                                         | Response         | Status  |
| ------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------- |
| POST   | `/api/admin/packages`            | `{ name, description, maxFolders, maxNestingLevel, allowedFileTypes, maxFileSize, totalFileLimit, filesPerFolder, price }`           | `{ package }`    | Pending |
| GET    | `/api/admin/packages`            | -                                                                                                                                    | `{ packages[] }` | Pending |
| GET    | `/api/admin/packages/:id`        | -                                                                                                                                    | `{ package }`    | Pending |
| PUT    | `/api/admin/packages/:id`        | `{ name, description, maxFolders, maxNestingLevel, allowedFileTypes, maxFileSize, totalFileLimit, filesPerFolder, price, isActive }` | `{ package }`    | Pending |
| DELETE | `/api/admin/packages/:id`        | -                                                                                                                                    | `{ message }`    | Pending |
| PATCH  | `/api/admin/packages/:id/toggle` | -                                                                                                                                    | `{ isActive }`   | Pending |

#### User Management API Endpoints

| Method | Endpoint                        | Request Body                      | Response                        | Status  |
| ------ | ------------------------------- | --------------------------------- | ------------------------------- | ------- |
| GET    | `/api/admin/users`              | `{ page, limit, search }` (query) | `{ users[], total, page }`      | Pending |
| GET    | `/api/admin/users/:id`          | -                                 | `{ user, subscription, usage }` | Pending |
| PUT    | `/api/admin/users/:id/role`     | `{ isAdmin }`                     | `{ user }`                      | Pending |
| POST   | `/api/admin/users/:id/suspend`  | `{ reason }`                      | `{ message }`                   | Pending |
| POST   | `/api/admin/users/:id/activate` | -                                 | `{ message }`                   | Pending |

#### Admin Dashboard API Endpoints

| Method | Endpoint                    | Request Body           | Response                                                             | Status  |
| ------ | --------------------------- | ---------------------- | -------------------------------------------------------------------- | ------- |
| GET    | `/api/admin/stats/overview` | -                      | `{ totalUsers, activeSubscriptions, totalStorage, popularPackages }` | Pending |
| GET    | `/api/admin/stats/revenue`  | `{ from, to }` (query) | `{ revenue[], breakdown }`                                           | Pending |
| GET    | `/api/admin/stats/usage`    | -                      | `{ topUsers, storageTrend }`                                         | Pending |

---

## Phase 3: User Subscription

### Tasks

#### Subscription API Endpoints

| Method | Endpoint                      | Request Body              | Response                                             | Status  |
| ------ | ----------------------------- | ------------------------- | ---------------------------------------------------- | ------- |
| GET    | `/api/subscriptions/packages` | -                         | `{ packages[] }`                                     | Pending |
| GET    | `/api/subscriptions/current`  | -                         | `{ subscription, package, usage }`                   | Pending |
| POST   | `/api/subscriptions/select`   | `{ packageId }`           | `{ subscription }`                                   | Pending |
| PUT    | `/api/subscriptions/change`   | `{ newPackageId }`        | `{ subscription, message }`                          | Pending |
| GET    | `/api/subscriptions/history`  | `{ page, limit }` (query) | `{ history[], total }`                               | Pending |
| GET    | `/api/subscriptions/usage`    | -                         | `{ fileCount, folderCount, totalSize, percentUsed }` | Pending |
| GET    | `/api/subscriptions/limits`   | -                         | `{ current, allowed, remaining }`                    | Pending |
| POST   | `/api/subscriptions/cancel`   | -                         | `{ message, endDate }`                               | Pending |
| POST   | `/api/subscriptions/renew`    | -                         | `{ subscription }`                                   | Pending |

---

## Phase 4: Folder Management

### Tasks

#### Folder API Endpoints

| Method | Endpoint                      | Request Body                      | Response                          | Status  |
| ------ | ----------------------------- | --------------------------------- | --------------------------------- | ------- |
| POST   | `/api/folders`                | `{ name, parentId }`              | `{ folder }`                      | Pending |
| GET    | `/api/folders`                | `{ parentId }` (query)            | `{ folders[], files[] }`          | Pending |
| GET    | `/api/folders/:id`            | -                                 | `{ folder, children[], files[] }` | Pending |
| GET    | `/api/folders/:id/children`   | -                                 | `{ folders[] }`                   | Pending |
| PUT    | `/api/folders/:id`            | `{ name }`                        | `{ folder }`                      | Pending |
| DELETE | `/api/folders/:id`            | -                                 | `{ message, movedToTrash }`       | Pending |
| POST   | `/api/folders/:id/move`       | `{ targetFolderId }`              | `{ folder }`                      | Pending |
| POST   | `/api/folders/:id/copy`       | `{ targetFolderId }`              | `{ folder }`                      | Pending |
| GET    | `/api/folders/:id/breadcrumb` | -                                 | `{ path[] }`                      | Pending |
| GET    | `/api/folders/tree`           | -                                 | `{ tree[] }`                      | Pending |
| POST   | `/api/folders/bulk/create`    | `{ names[], parentId }`           | `{ folders[] }`                   | Pending |
| POST   | `/api/folders/bulk/delete`    | `{ folderIds[] }`                 | `{ message, deleted[] }`          | Pending |
| POST   | `/api/folders/bulk/move`      | `{ folderIds[], targetFolderId }` | `{ message, moved[] }`            | Pending |

---

## Phase 5: File Management

### Tasks

#### File Upload API Endpoints

| Method | Endpoint                           | Request Body                                              | Response                | Status  |
| ------ | ---------------------------------- | --------------------------------------------------------- | ----------------------- | ------- |
| POST   | `/api/files/upload`                | `form-data: { file, folderId }`                           | `{ file }`              | Pending |
| POST   | `/api/files/multi-upload`          | `form-data: { files[], folderId }`                        | `{ files[], failed[] }` | Pending |
| POST   | `/api/files/upload/chunk/init`     | `{ fileName, fileSize, folderId, fileType, totalChunks }` | `{ uploadId }`          | Pending |
| POST   | `/api/files/upload/chunk`          | `form-data: { chunk, uploadId, chunkIndex }`              | `{ received }`          | Pending |
| POST   | `/api/files/upload/chunk/complete` | `{ uploadId }`                                            | `{ file }`              | Pending |
| POST   | `/api/files/upload/url`            | `{ fileName, folderId, fileType }`                        | `{ uploadUrl, fileId }` | Pending |
| POST   | `/api/files/upload/cancel`         | `{ uploadId }`                                            | `{ message }`           | Pending |

#### File Management API Endpoints

| Method | Endpoint                    | Request Body                        | Response                 | Status  |
| ------ | --------------------------- | ----------------------------------- | ------------------------ | ------- |
| GET    | `/api/files`                | `{ folderId, page, limit }` (query) | `{ files[], total }`     | Pending |
| GET    | `/api/files/:id`            | -                                   | `{ file, metadata }`     | Pending |
| GET    | `/api/files/:id/download`   | -                                   | `{ downloadUrl }`        | Pending |
| GET    | `/api/files/:id/preview`    | -                                   | `{ previewUrl, type }`   | Pending |
| GET    | `/api/files/:id/thumbnail`  | -                                   | `{ thumbnailUrl }`       | Pending |
| PUT    | `/api/files/:id/rename`     | `{ newName }`                       | `{ file }`               | Pending |
| DELETE | `/api/files/:id`            | -                                   | `{ message }`            | Pending |
| POST   | `/api/files/:id/move`       | `{ targetFolderId }`                | `{ file }`               | Pending |
| POST   | `/api/files/:id/copy`       | `{ targetFolderId }`                | `{ file }`               | Pending |
| POST   | `/api/files/:id/favorite`   | -                                   | `{ isFavorite }`         | Pending |
| POST   | `/api/files/:id/unfavorite` | -                                   | `{ message }`            | Pending |
| POST   | `/api/files/:id/share`      | `{ expiresIn, permissions }`        | `{ shareLink }`          | Pending |
| DELETE | `/api/files/:id/share`      | -                                   | `{ message }`            | Pending |
| POST   | `/api/files/bulk/delete`    | `{ fileIds[] }`                     | `{ message, deleted[] }` | Pending |
| POST   | `/api/files/bulk/move`      | `{ fileIds[], targetFolderId }`     | `{ message, moved[] }`   | Pending |
| POST   | `/api/files/bulk/favorite`  | `{ fileIds[] }`                     | `{ message }`            | Pending |

#### File Version API Endpoints

| Method | Endpoint                                      | Request Body          | Response          | Status  |
| ------ | --------------------------------------------- | --------------------- | ----------------- | ------- |
| GET    | `/api/files/:id/versions`                     | -                     | `{ versions[] }`  | Pending |
| POST   | `/api/files/:id/versions`                     | `form-data: { file }` | `{ version }`     | Pending |
| POST   | `/api/files/:id/versions/:versionId/restore`  | -                     | `{ file }`        | Pending |
| DELETE | `/api/files/:id/versions/:versionId`          | -                     | `{ message }`     | Pending |
| GET    | `/api/files/:id/versions/:versionId/download` | -                     | `{ downloadUrl }` | Pending |

---

## Phase 6: Advanced Features

### Tasks

#### Search API Endpoints

| Method | Endpoint                | Request Body                          | Response                 | Status  |
| ------ | ----------------------- | ------------------------------------- | ------------------------ | ------- |
| GET    | `/api/search`           | `{ q, type, folderId, page }` (query) | `{ results[], total }`   | Pending |
| GET    | `/api/search/files`     | `{ q, fileType, from, to }` (query)   | `{ files[], total }`     | Pending |
| GET    | `/api/search/folders`   | `{ q, parentId }` (query)             | `{ folders[], total }`   | Pending |
| GET    | `/api/search/recent`    | `{ limit }` (query)                   | `{ items[] }`            | Pending |
| GET    | `/api/search/starred`   | -                                     | `{ files[], folders[] }` | Pending |
| POST   | `/api/search/save`      | `{ name, query, filters }`            | `{ savedSearch }`        | Pending |
| GET    | `/api/search/saved`     | -                                     | `{ searches[] }`         | Pending |
| DELETE | `/api/search/saved/:id` | -                                     | `{ message }`            | Pending |

#### Trash/Recycle Bin API Endpoints

| Method | Endpoint                  | Request Body              | Response                    | Status  |
| ------ | ------------------------- | ------------------------- | --------------------------- | ------- |
| GET    | `/api/trash`              | `{ page, limit }` (query) | `{ items[], total }`        | Pending |
| POST   | `/api/trash/restore/:id`  | `{ type }` (folder/file)  | `{ message, restored }`     | Pending |
| POST   | `/api/trash/restore/bulk` | `{ itemIds[], types[] }`  | `{ message, restored[] }`   | Pending |
| DELETE | `/api/trash/empty`        | -                         | `{ message, deletedCount }` | Pending |
| DELETE | `/api/trash/:id`          | `{ type }`                | `{ message }`               | Pending |
| DELETE | `/api/trash/bulk`         | `{ itemIds[], types[] }`  | `{ message, deleted[] }`    | Pending |
| GET    | `/api/trash/expired`      | -                         | `{ items[] }`               | Pending |
| POST   | `/api/trash/cleanup`      | -                         | `{ message, cleaned[] }`    | Pending |

#### Sharing API Endpoints

| Method | Endpoint                     | Request Body                                             | Response                           | Status  |
| ------ | ---------------------------- | -------------------------------------------------------- | ---------------------------------- | ------- |
| POST   | `/api/share`                 | `{ itemId, itemType, emails[], permissions, expiresAt }` | `{ shareLinks[] }`                 | Pending |
| GET    | `/api/share/:token`          | -                                                        | `{ item, permissions, expiresAt }` | Pending |
| DELETE | `/api/share/:id`             | -                                                        | `{ message }`                      | Pending |
| GET    | `/api/share/my-shares`       | -                                                        | `{ shares[] }`                     | Pending |
| PUT    | `/api/share/:id/permissions` | `{ permissions }`                                        | `{ share }`                        | Pending |
| POST   | `/api/share/:token/validate` | `{ password }`                                           | `{ access, item }`                 | Pending |

#### Notification API Endpoints

| Method | Endpoint                      | Request Body                          | Response                        | Status  |
| ------ | ----------------------------- | ------------------------------------- | ------------------------------- | ------- |
| GET    | `/api/notifications`          | `{ page, limit, unreadOnly }` (query) | `{ notifications[], total }`    | Pending |
| PUT    | `/api/notifications/:id/read` | -                                     | `{ notification }`              | Pending |
| PUT    | `/api/notifications/read-all` | -                                     | `{ message }`                   | Pending |
| DELETE | `/api/notifications/:id`      | -                                     | `{ message }`                   | Pending |
| GET    | `/api/notifications/settings` | -                                     | `{ emailEnabled, pushEnabled }` | Pending |
| PUT    | `/api/notifications/settings` | `{ emailEnabled, pushEnabled }`       | `{ settings }`                  | Pending |

#### WebSocket Events (Real-time)

| Event                  | Direction       | Data                      | Description           |
| ---------------------- | --------------- | ------------------------- | --------------------- |
| `file:uploaded`        | Server → Client | `{ file, userId }`        | New file uploaded     |
| `file:deleted`         | Server → Client | `{ fileId, userId }`      | File deleted          |
| `folder:created`       | Server → Client | `{ folder, userId }`      | New folder created    |
| `folder:deleted`       | Server → Client | `{ folderId, userId }`    | Folder deleted        |
| `subscription:changed` | Server → Client | `{ userId, newPackage }`  | Subscription updated  |
| `quota:warning`        | Server → Client | `{ userId, used, limit }` | Storage limit warning |
| `share:accessed`       | Server → Client | `{ shareId, accessedBy }` | Shared item accessed  |

---

## Phase 7: Testing & Deployment

### Testing Tasks

- [ ] Unit tests for all services
- [ ] Integration tests for API endpoints
- [ ] E2E tests for critical user flows
- [ ] Load testing for file uploads
- [ ] Security testing (penetration tests)
- [ ] Cross-browser testing
- [ ] Mobile responsiveness testing

### Deployment Tasks

- [ ] Configure production environment variables
- [ ] Setup CI/CD pipeline
- [ ] Configure database backups
- [ ] Setup monitoring and logging
- [ ] Configure CDN for file delivery
- [ ] SSL certificate setup
- [ ] Domain configuration
- [ ] Performance optimization
- [ ] Documentation deployment

### Documentation Tasks

- [ ] API documentation (Swagger/OpenAPI)
- [ ] User manual
- [ ] Admin guide
- [ ] Deployment guide
- [ ] Developer setup guide

---

## Progress Tracking

### Phase 1: Foundation

- [ ] Authentication System: 0%
- [ ] Database Schema: 0%
- [ ] Email Service: 0%

### Phase 2: Admin Panel

- [ ] Package Management: 0%
- [ ] User Management: 0%
- [ ] Admin Dashboard: 0%

### Phase 3: User Subscription

- [ ] Package Viewing: 0%
- [ ] Subscription Selection: 0%
- [ ] Usage Tracking: 0%

### Phase 4: Folder Management

- [ ] CRUD Operations: 0%
- [ ] Hierarchy Management: 0%
- [ ] Bulk Operations: 0%

### Phase 5: File Management

- [ ] Upload System: 0%
- [ ] File Operations: 0%
- [ ] Version Control: 0%

### Phase 6: Advanced Features

- [ ] Search: 0%
- [ ] Trash: 0%
- [ ] Sharing: 0%
- [ ] Notifications: 0%

### Phase 7: Testing & Deployment

- [ ] Testing: 0%
- [ ] Deployment: 0%
- [ ] Documentation: 0%