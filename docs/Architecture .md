## System Architecture

### Technology Stack

**Backend:** Node.js 20 + Express.js + TypeScript + Prisma + PostgreSQL + Redis  
**Frontend:** Next.js 14 + React 18 + TailwindCSS  
**Storage:** AWS S3 / Cloudflare R2  
**Auth:** JWT + Bcrypt

---

### System Overview

```
                    ┌─────────────┐
                    │  Next.js    │
                    │   Client    │
                    └──────┬──────┘
                           │
                           ▼
            ┌──────────────────────────┐
            │   Express.js API         │
            │  Rate Limit │ Auth │ Zod │
            └──────────────┬───────────┘
                           │
            ┌──────────────┴──────────────┐
            │                             │
            ▼                             ▼
    ┌───────────────┐           ┌───────────────┐
    │   Services    │           │  Enforcement  │
    │ • Auth        │           │ • Package     │
    │ • User        │           │ • Quota       │
    │ • File/Folder │           │ • Permission  │
    └───────┬───────┘           └───────┬───────┘
            │                           │
            └───────────┬───────────────┘
                        │
                        ▼
                ┌───────────────┐
                │  Prisma ORM   │
                └───────┬───────┘
                        │
        ┌───────────────┼───────────────┐
        ▼               ▼               ▼
┌───────────┐   ┌───────────┐   ┌───────────┐
│PostgreSQL │   │   Redis   │   │  S3/R2    │
│ Database  │   │   Cache   │   │  Storage  │
└───────────┘   └───────────┘   └───────────┘
```

---

### Database Schema

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    User     │───────│  Subscription   │───────│   Package   │
│─────────────│       │─────────────────│       │─────────────│
│ id          │       │ id              │       │ id          │
│ email       │       │ userId          │       │ name        │
│ password    │       │ packageId       │       │ maxFolders  │
│ isAdmin     │       │ startDate       │       │ maxNesting  │
│ createdAt   │       │ endDate         │       │ fileTypes   │
└─────────────┘       │ isActive        │       │ maxFileSize │
      │               └─────────────────┘       │ fileLimit   │
      │                                          └─────────────┘
      │
      ├───────────────┬───────────────┐
      ▼               ▼               ▼
┌─────────────┐ ┌─────────────┐ ┌─────────────┐
│   Folder    │ │    File     │ │  UsageLog   │
│─────────────│ │─────────────│ │─────────────│
│ id          │ │ id          │ │ id          │
│ name        │ │ name        │ │ userId      │
│ userId      │ │ userId      │ │ fileCount   │
│ parentId    │ │ folderId    │ │ folderCount │
│ path        │ │ size        │ │ totalSize   │
│ level       │ │ fileType    │ │ period      │
└─────────────┘ │ storageKey  │ └─────────────┘
                │ isDeleted   │
                └─────────────┘
```

---

### Package Enforcement Flow

```
        User Action Request
               │
               ▼
        ┌──────────────┐
        │ Authenticate │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │ Get Package  │
        │  & Usage     │
        └──────┬───────┘
               │
               ▼
        ┌──────────────┐
        │ Check Limits │
        │ • File Type  │
        │ • File Size  │
        │ • Folder Max │
        │ • Nesting    │
        └──────┬───────┘
               │
        ┌──────┴──────┐
        ▼             ▼
    ┌───────┐    ┌───────┐
    │ Allow │    │ Deny  │
    └───────┘    └───────┘
```

---

### File Upload Workflow

```
    Client Upload
         │
         ▼
  ┌──────────────┐
  │ 1. Validate  │
  │  • Folder    │
  │  • Limits    │
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │ 2. Process   │
  │  • Chunks    │
  │  • Metadata  │
  └──────┬───────┘
         │
         ▼
  ┌──────────────┐
  │ 3. Store     │
  │  • S3/R2     │
  │  • Database  │
  │  • Cache     │
  └──────┬───────┘
         │
         ▼
    Response
```

---

### Security Layers

```
┌─────────────────────────────────────┐
│ HTTPS/TLS + HSTS                    │
├─────────────────────────────────────┤
│ Rate Limiting (100 req/min)         │
├─────────────────────────────────────┤
│ JWT Auth (15min + refresh)          │
├─────────────────────────────────────┤
│ Package-based Authorization         │
├─────────────────────────────────────┤
│ Zod Validation + XSS Protection     │
├─────────────────────────────────────┤
│ File Type & Size Validation         │
├─────────────────────────────────────┤
│ Bcrypt Passwords + Prepared Queries │
└─────────────────────────────────────┘
```

---

### Caching Strategy

**Redis Cache:**
- Sessions: 24 hours
- User/Package data: 5-15 minutes
- Rate limiting: Rolling window
- Job queue: Persistent

**CDN Cache:**
- File downloads: 1 hour
- Thumbnails: 24 hours

---

### API Response Format

```typescript
// Success
{
  success: true,
  data: T,
  meta?: { page, limit, total }
}

// Error
{
  success: false,
  error: {
    code: "ERROR_CODE",
    message: "User-friendly message"
  }
}
```

---

### Key Design Decisions

1. **Materialized Path** - Store full folder paths for fast queries
2. **Soft Delete** - 30-day trash before permanent deletion
3. **Chunked Upload** - Handle large files (>10MB) with resume capability
4. **Redis Rate Limiting** - Distributed across multiple servers
5. **S3-Compatible Storage** - Vendor-agnostic (AWS/R2/MinIO)
6. **JWT + Refresh Tokens** - Stateless auth with revocation support

---

### Performance Optimizations

- Database indexes on: userId, folderId, parentId, path, email
- Connection pooling (max 20)
- Redis caching for hot data
- CDN for file delivery
- Gzip compression
- Pagination on all lists
- Background jobs for heavy tasks
