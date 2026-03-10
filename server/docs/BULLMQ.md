# BullMQ Background Jobs

## Overview

BullMQ is implemented for handling background email processing, improving API response times and reliability.

## Features

- **Asynchronous email sending**: Non-blocking email operations
- **Retry mechanism**: Automatic retry with exponential backoff
- **Job persistence**: Jobs stored in Redis for reliability
- **Concurrency control**: Process multiple emails simultaneously

## Email Job Types

### 1. Verification Email
Sent when user registers a new account.

```typescript
await emailQueueService.sendVerificationEmail(email, token);
```

### 2. Password Reset Email
Sent when user requests password reset.

```typescript
await emailQueueService.sendPasswordResetEmail(email, token);
```

### 3. Custom Email
For any custom email needs.

```typescript
await emailQueueService.sendCustomEmail(to, subject, html, text);
```

## Configuration

### Queue Settings
- **Attempts**: 3 retries on failure
- **Backoff**: Exponential (2s, 4s, 8s)
- **Concurrency**: 5 simultaneous jobs
- **Cleanup**: Auto-remove completed jobs

### Worker Configuration
Located in `src/lib/queue/email.worker.ts`

## Usage Example

```typescript
// In AuthService
await this.emailQueueService.sendVerificationEmail(
  user.email,
  emailVerifyToken
);
```

## Monitoring

Check logs for job status:
- `Email job {id} completed` - Success
- `Email job {id} failed` - Failure with error details

## Benefits

- **Faster API responses**: Email sending doesn't block requests
- **Reliability**: Failed jobs automatically retry
- **Scalability**: Easy to add more workers
- **Monitoring**: Built-in job tracking and logging
