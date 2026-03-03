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

- [x] Initialize PostgreSQL database
- [x] Setup Prisma ORM
- [x] Create initial migration
- [x] Seed default admin user

#### Authentication API Endpoints

| Method | Endpoint                    | Request Body                | Response              | Status    |
| ------ | --------------------------- | --------------------------- | --------------------- | --------- |
| POST   | `/api/auth/register`        | `{ email, password, name }` | `{ message, userId }` | Completed |
| POST   | `/api/auth/login`           | `{ email, password }`       | `{ token, user }`     | Completed |
| POST   | `/api/auth/logout`          | `{ token }`                 | `{ message }`         | Completed |
| POST   | `/api/auth/verify-email`    | `{ token }`                 | `{ message }`         | Completed |
| POST   | `/api/auth/forgot-password` | `{ email }`                 | `{ message }`         | Completed |
| POST   | `/api/auth/reset-password`  | `{ token, newPassword }`    | `{ message }`         | Completed |
| GET    | `/api/auth/me`              | -                           | `{ user }`            | Completed |
| POST   | `/api/auth/refresh-token`   | `{ refreshToken }`          | `{ token }`           | Completed |

#### Email Service Setup

- [x] Configure email provider (Nodemailer)
- [x] Create email templates
- [x] Implement email queue system

---

## Phase 2: Admin Panel

### Tasks

#### Package Management API Endpoints

| Method | Endpoint                         | Request Body                                                                                                                         | Response         | Status    |
| ------ | -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | --------- |
| POST   | `/api/admin/packages`            | `{ name, description, maxFolders, maxNestingLevel, allowedFileTypes, maxFileSize, totalFileLimit, filesPerFolder, price }`           | `{ package }`    | Completed |
| GET    | `/api/admin/packages`            | -                                                                                                                                    | `{ packages[] }` | Completed |
| GET    | `/api/admin/packages/:id`        | -                                                                                                                                    | `{ package }`    | Completed |
| PUT    | `/api/admin/packages/:id`        | `{ name, description, maxFolders, maxNestingLevel, allowedFileTypes, maxFileSize, totalFileLimit, filesPerFolder, price, isActive }` | `{ package }`    | Completed |
| DELETE | `/api/admin/packages/:id`        | -                                                                                                                                    | `{ message }`    | Completed |
| PATCH  | `/api/admin/packages/:id/toggle` | -                                                                                                                                    | `{ isActive }`   | Completed |

#### User Management API Endpoints

| Method | Endpoint                        | Request Body                      | Response                        | Status    |
| ------ | ------------------------------- | --------------------------------- | ------------------------------- | --------- |
| GET    | `/api/admin/users`              | `{ page, limit, search }` (query) | `{ users[], total, page }`      | Completed |
| GET    | `/api/admin/users/:id`          | -                                 | `{ user, subscription, usage }` | Completed |
| PUT    | `/api/admin/users/:id/role`     | `{ isAdmin }`                     | `{ user }`                      | Completed |
| POST   | `/api/admin/users/:id/suspend`  | `{ reason }`                      | `{ message }`                   | Completed |
| POST   | `/api/admin/users/:id/activate` | -                                 | `{ message }`                   | Completed |

#### Admin Dashboard API Endpoints

| Method | Endpoint                    | Request Body           | Response                                                             | Status    |
| ------ | --------------------------- | ---------------------- | -------------------------------------------------------------------- | --------- |
| GET    | `/api/admin/stats/overview` | -                      | `{ totalUsers, activeSubscriptions, totalStorage, popularPackages }` | Completed |
| GET    | `/api/admin/stats/revenue`  | `{ from, to }` (query) | `{ revenue[], breakdown }`                                           | Completed |
| GET    | `/api/admin/stats/usage`    | -                      | `{ topUsers, storageTrend }`                                         | Completed |

---

## Phase 3: User Subscription

### Tasks

#### Subscription API Endpoints

| Method | Endpoint                      | Request Body              | Response                                             | Status    |
| ------ | ----------------------------- | ------------------------- | ---------------------------------------------------- | --------- |
| GET    | `/api/subscriptions/packages` | -                         | `{ packages[] }`                                     | Completed |
| GET    | `/api/subscriptions/current`  | -                         | `{ subscription, package, usage }`                   | Completed |
| POST   | `/api/subscriptions/select`   | `{ packageId }`           | `{ subscription }`                                   | Completed |
| PUT    | `/api/subscriptions/change`   | `{ newPackageId }`        | `{ subscription, message }`                          | Completed |
| GET    | `/api/subscriptions/history`  | `{ page, limit }` (query) | `{ history[], total }`                               | Completed |
| GET    | `/api/subscriptions/usage`    | -                         | `{ fileCount, folderCount, totalSize, percentUsed }` | Completed |
| GET    | `/api/subscriptions/limits`   | -                         | `{ current, allowed, remaining }`                    | Completed |
| POST   | `/api/subscriptions/cancel`   | -                         | `{ message, endDate }`                               | Completed |
| POST   | `/api/subscriptions/renew`    | -                         | `{ subscription }`                                   | Completed |

---

## Phase 4: Folder Management

### Tasks

#### Folder API Endpoints

| Method | Endpoint                      | Request Body                      | Response                          | Status    |
| ------ | ----------------------------- | --------------------------------- | --------------------------------- | --------- |
| POST   | `/api/folders`                | `{ name, parentId }`              | `{ folder }`                      | Completed |
| GET    | `/api/folders`                | `{ parentId }` (query)            | `{ folders[], files[] }`          | Completed |
| GET    | `/api/folders/:id`            | -                                 | `{ folder, children[], files[] }` | Completed |
| GET    | `/api/folders/:id/children`   | -                                 | `{ folders[] }`                   | Completed |
| PUT    | `/api/folders/:id`            | `{ name }`                        | `{ folder }`                      | Completed |
| DELETE | `/api/folders/:id`            | -                                 | `{ message, movedToTrash }`       | Completed |
| POST   | `/api/folders/:id/move`       | `{ targetFolderId }`              | `{ folder }`                      | Completed |
| POST   | `/api/folders/:id/copy`       | `{ targetFolderId }`              | `{ folder }`                      | Completed |
| GET    | `/api/folders/:id/breadcrumb` | -                                 | `{ path[] }`                      | Completed |
| GET    | `/api/folders/tree`           | -                                 | `{ tree[] }`                      | Completed |
| POST   | `/api/folders/bulk/create`    | `{ names[], parentId }`           | `{ folders[] }`                   | Completed |
| POST   | `/api/folders/bulk/delete`    | `{ folderIds[] }`                 | `{ message, deleted[] }`          | Completed |
| POST   | `/api/folders/bulk/move`      | `{ folderIds[], targetFolderId }` | `{ message, moved[] }`            | Completed |

---

## Phase 5: File Management

### Tasks

#### File Upload API Endpoints

| Method | Endpoint                           | Request Body                                              | Response                | Status    |
| ------ | ---------------------------------- | --------------------------------------------------------- | ----------------------- | --------- |
| POST   | `/api/files/upload`                | `form-data: { file, folderId }`                           | `{ file }`              | Completed |
| POST   | `/api/files/multi-upload`          | `form-data: { files[], folderId }`                        | `{ files[], failed[] }` | Completed |
| POST   | `/api/files/upload/chunk/init`     | `{ fileName, fileSize, folderId, fileType, totalChunks }` | `{ uploadId }`          | Completed |
| POST   | `/api/files/upload/chunk`          | `form-data: { chunk, uploadId, chunkIndex }`              | `{ received }`          | Completed |
| POST   | `/api/files/upload/chunk/complete` | `{ uploadId }`                                            | `{ file }`              | Completed |
| POST   | `/api/files/upload/url`            | `{ fileName, folderId, fileType }`                        | `{ uploadUrl, fileId }` | Completed |
| POST   | `/api/files/upload/cancel`         | `{ uploadId }`                                            | `{ message }`           | Completed |

#### File Management API Endpoints

| Method | Endpoint                    | Request Body                        | Response                 | Status    |
| ------ | --------------------------- | ----------------------------------- | ------------------------ | --------- |
| GET    | `/api/files`                | `{ folderId, page, limit }` (query) | `{ files[], total }`     | Completed |
| GET    | `/api/files/:id`            | -                                   | `{ file, metadata }`     | Completed |
| GET    | `/api/files/:id/download`   | -                                   | `{ downloadUrl }`        | Completed |
| GET    | `/api/files/:id/preview`    | -                                   | `{ previewUrl, type }`   | Completed |
| GET    | `/api/files/:id/thumbnail`  | -                                   | `{ thumbnailUrl }`       | Completed |
| PUT    | `/api/files/:id/rename`     | `{ newName }`                       | `{ file }`               | Completed |
| DELETE | `/api/files/:id`            | -                                   | `{ message }`            | Completed |
| POST   | `/api/files/:id/move`       | `{ targetFolderId }`                | `{ file }`               | Completed |
| POST   | `/api/files/:id/copy`       | `{ targetFolderId }`                | `{ file }`               | Completed |
| POST   | `/api/files/:id/favorite`   | -                                   | `{ isFavorite }`         | Completed |
| POST   | `/api/files/:id/unfavorite` | -                                   | `{ message }`            | Completed |
| POST   | `/api/files/:id/share`      | `{ expiresIn, permissions }`        | `{ shareLink }`          | Completed |
| DELETE | `/api/files/:id/share`      | -                                   | `{ message }`            | Completed |
| POST   | `/api/files/bulk/delete`    | `{ fileIds[] }`                     | `{ message, deleted[] }` | Completed |
| POST   | `/api/files/bulk/move`      | `{ fileIds[], targetFolderId }`     | `{ message, moved[] }`   | Completed |
| POST   | `/api/files/bulk/favorite`  | `{ fileIds[] }`                     | `{ message }`            | Completed |

#### File Version API Endpoints

| Method | Endpoint                                      | Request Body          | Response          | Status    |
| ------ | --------------------------------------------- | --------------------- | ----------------- | --------- |
| GET    | `/api/files/:id/versions`                     | -                     | `{ versions[] }`  | Completed |
| POST   | `/api/files/:id/versions`                     | `form-data: { file }` | `{ version }`     | Completed |
| POST   | `/api/files/:id/versions/:versionId/restore`  | -                     | `{ file }`        | Completed |
| DELETE | `/api/files/:id/versions/:versionId`          | -                     | `{ message }`     | Completed |
| GET    | `/api/files/:id/versions/:versionId/download` | -                     | `{ downloadUrl }` | Completed |

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

- [x] Authentication System: 100%
- [x] Database Schema: 100%
- [x] Email Service: 100%

### Phase 2: Admin Panel

- [x] Package Management: 100%
- [x] User Management: 100%
- [x] Admin Dashboard: 100%

### Phase 3: User Subscription

- [x] Package Viewing: 100%
- [x] Subscription Selection: 100%
- [x] Usage Tracking: 100%

### Phase 4: Folder Management

- [x] CRUD Operations: 100%
- [x] Hierarchy Management: 100%
- [x] Bulk Operations: 100%

### Phase 5: File Management

- [x] Upload System: 100%
- [x] File Operations: 100%
- [x] Version Control: 100%

### Phase 6: Advanced Features

- [ ] Search: 0%
- [ ] Trash: 0%
- [ ] Sharing: 0%
- [ ] Notifications: 0%

### Phase 7: Testing & Deployment

- [ ] Testing: 0%
- [ ] Deployment: 0%
- [ ] Documentation: 0%
