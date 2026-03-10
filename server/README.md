# Server - SaaS File Management System

Backend API server built with Express.js and TypeScript, providing secure file management, authentication, and subscription services.

## 🚀 Features

- **RESTful API**: Clean API architecture with versioned endpoints
- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **File Management**: Upload, download, and organize files with Cloudinary integration
- **Subscription System**: Package-based access control with usage tracking
- **Admin Panel**: User and package management with analytics
- **Redis Caching**: High-performance caching for frequently accessed data
- **Rate Limiting**: Redis-based rate limiting for API protection
- **Database ORM**: Prisma for type-safe database operations
- **Background Jobs**: Scheduled tasks for cleanup and maintenance
- **Email Service**: Nodemailer integration for notifications
- **API Documentation**: Swagger/OpenAPI documentation

## 🏗️ Tech Stack

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Cache**: Redis
- **Storage**: Cloudinary
- **Authentication**: JWT + Bcrypt
- **Validation**: Zod
- **File Upload**: Multer
- **Email**: Nodemailer
- **Testing**: Jest
- **Load Testing**: k6

## 📦 Installation

### Prerequisites

- Node.js 20 or higher
- PostgreSQL 14 or higher
- Redis 6 or higher
- Cloudinary account

### Setup

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Update `.env` with your configuration:

   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/filemanagement"

   # Redis
   REDIS_URL="redis://localhost:6379"

   # JWT
   JWT_SECRET="your-super-secret-jwt-key"
   JWT_REFRESH_SECRET="your-refresh-secret-key"

   # Cloudinary
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret-key

   # Email
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```

3. **Setup database**

   ```bash
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run unit tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:prod` - Run production migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run load-test` - Run load tests with k6

## 🔧 Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm test` - Run unit tests
- `npm run test:coverage` - Run tests with coverage report
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:migrate:prod` - Run production migrations
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio
- `npm run load-test` - Run load tests with k6

## 📁 Project Structure

```
server/
├── prisma/
│   ├── migrations/          # Database migrations
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Database seeding
├── src/
│   ├── config/              # Configuration files
│   ├── controllers/         # Request handlers
│   ├── middlewares/         # Express middlewares
│   ├── repositories/        # Database access layer
│   ├── routes/              # API routes
│   ├── services/            # Business logic
│   ├── validators/          # Request validation schemas
│   ├── utils/               # Helper functions
│   ├── app.ts               # Express app setup
│   └── server.ts            # Server entry point
├── tests/                   # Unit tests
├── load-tests/              # Load testing scripts
└── uploads/                 # Temporary file storage
```

## 🔌 API Endpoints

### Authentication
- `POST /api/v1/auth/register` - User registration
- `POST /api/v1/auth/login` - User login
- `POST /api/v1/auth/refresh` - Refresh access token
- `POST /api/v1/auth/logout` - User logout

### Files
- `GET /api/v1/files` - List user files
- `POST /api/v1/files/upload` - Upload file
- `GET /api/v1/files/:id` - Get file details
- `DELETE /api/v1/files/:id` - Delete file

### Folders
- `GET /api/v1/folders` - List folders
- `POST /api/v1/folders` - Create folder
- `PUT /api/v1/folders/:id` - Update folder
- `DELETE /api/v1/folders/:id` - Delete folder

### Subscriptions
- `GET /api/v1/subscriptions/packages` - List packages
- `POST /api/v1/subscriptions/subscribe` - Subscribe to package
- `GET /api/v1/subscriptions/current` - Get current subscription

### Admin
- `GET /api/v1/admin/users` - List all users
- `GET /api/v1/admin/stats` - System statistics
- `POST /api/v1/admin/packages` - Create package
- `PUT /api/v1/admin/packages/:id` - Update package

## 🧪 Testing

### Unit Tests

```bash
npm test
npm run test:coverage
```

### Load Tests

```bash
npm run load-test
npm run load-test:auth
npm run load-test:files
```

## 🚀 Deployment

### Production Build

```bash
npm run build
npm run db:migrate:prod
npm start
```

### Environment Variables

Ensure all production environment variables are configured:
- Strong JWT secrets
- Production database URL
- Redis connection string
- Cloudinary credentials
- SMTP configuration

## 📄 License

This project is licensed under the MIT License.
