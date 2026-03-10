# SaaS File Management System

A comprehensive cloud-based file management platform built with modern web technologies, offering secure file storage, sharing, and collaboration features with subscription-based access control.

## 🌐 Live Demo

- **Frontend**: [https://saas-file-management-system-lg83.onrender.com](https://saas-file-management-system-lg83.onrender.com)
- **API Documentation**: [https://saas-file-management-system-server-q48e.onrender.com/api-docs](https://saas-file-management-system-server-q48e.onrender.com/api-docs)

## 🚀 Features

### Core Features

- **Secure File Management**: Upload, organize, and manage files with drag-and-drop interface
- **Folder Hierarchy**: Create nested folder structures with unlimited depth
- **File Versioning**: Track file changes with version history and restore capabilities
- **File Sharing**: Generate secure shareable links with expiration dates and permissions
- **Advanced Search**: Full-text search across files and folders with filters
- **Bulk Operations**: Perform actions on multiple files simultaneously
- **Trash/Recycle Bin**: Soft delete with 30-day recovery period

### Subscription Management

- **Package-Based Access**: Multiple subscription tiers with different storage limits
- **Usage Tracking**: Real-time monitoring of storage usage and file counts
- **Quota Enforcement**: Automatic enforcement of package limits
- **Flexible Billing**: Monthly/yearly subscription options

### Admin Panel

- **User Management**: Comprehensive user administration with role-based access
- **Package Management**: Create and manage subscription packages
- **Analytics Dashboard**: Revenue, usage, and user statistics with charts
- **System Monitoring**: Real-time system health and performance metrics

### Security & Performance

- **JWT Authentication**: Secure token-based authentication with refresh tokens
- **Rate Limiting**: API protection with configurable rate limits
- **Chunked Uploads**: Efficient handling of large files with resume capability

## 🏗️ Architecture

### System Overview

```
┌─────────────┐    ┌──────────────────┐    ┌─────────────┐
│  Next.js    │    │   Express.js     │    │ PostgreSQL  │
│   Client    │◄──►│   API Server     │◄──►│  Database   │
└─────────────┘    └──────────────────┘    └─────────────┘
                            │
                   ┌────────┼────────┐
                   ▼        ▼        ▼
            ┌──────────┐ ┌───────────┐ ┌──────────┐
            │  Redis   │ │Cloudinary │ │  Email   │
            │  Cache   │ │  Storage  │ │ Service  │
            └──────────┘ └───────────┘ └──────────┘
```

### Tech Stack

#### Frontend

- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18 + shadcn/ui components
- **Styling**: Tailwind CSS
- **State Management**: React Context + Custom hooks
- **Form Handling**: React Hook Form + Zod validation
- **HTTP Client**: Axios with interceptors
- **Icons**: Lucide React

#### Backend

- **Runtime**: Node.js 20
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Authentication**: JWT + Bcrypt
- **Validation**: Zod
- **File Upload**: Multer
- **Rate Limiting**: Express Rate Limit + Redis

#### Database & Storage

- **Primary Database**: PostgreSQL
- **Cache**: Redis
- **File Storage**: Cloudinary
- **Email**: Nodemailer

#### DevOps & Tools

- **Package Manager**: npm
- **Build Tool**: TypeScript Compiler
- **Database Migrations**: Prisma Migrate
- **API Documentation**: Swagger/OpenAPI

## 📦 Installation

### Prerequisites

- Node.js 20 or higher
- PostgreSQL 14 or higher
- Redis 6 or higher
- Cloudinary account

### Backend Setup

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd saas-file-management-system
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Configure environment variables**

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

   # Cloudinary Configuration
   CLOUDINARY_CLOUD_NAME=your-cloudinary-name
   CLOUDINARY_API_KEY=your-cloudinary-api-key
   CLOUDINARY_API_SECRET=your-cloudinary-secret-key


   # Email
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="your-email@gmail.com"
   SMTP_PASS="your-app-password"
   ```

4. **Setup database**

   ```bash
   npx prisma generate
   npx prisma migrate dev
   npx prisma db seed
   ```

5. **Start the server**
   ```bash
   npm run dev
   ```

### Frontend Setup

1. **Install client dependencies**

   ```bash
   cd client
   npm install
   ```

2. **Configure environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Update `.env.local`:

   ```env
   NEXT_PUBLIC_API_URL="http://localhost:3001/api"
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

### Access the Application

#### Local Development
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: http://localhost:3001/api-docs

#### Live Production
- **Frontend**: https://saas-file-management-system-lg83.onrender.com
- **API Documentation**: https://saas-file-management-system-server-q48e.onrender.com/api-docs

### Default Admin Account

- **Email**: admin@example.com
- **Password**: admin123456

### Sample User Accounts (Created by Seed)

After running the seed command, you'll have these test accounts available:

- **Free User**
  - Email: john@example.com
  - Password: password123
  - Package: Free (10MB storage, 10 folders max)

- **Basic User**
  - Email: alice@example.com
  - Password: password123
  - Package: Basic (1GB storage, 50 folders max)

- **Pro User**
  - Email: bob@example.com
  - Password: password123
  - Package: Pro (10GB storage, 200 folders max)

Each sample user comes with:

- Pre-created folder structure (Documents/Projects, Documents/Images)
- Sample files (PDFs, images) for testing
- Active subscription to their respective package
- Usage tracking data

## 🚀 Deployment

### Production Build

1. **Build the backend**

   ```bash
   cd server
   npm run build
   ```

2. **Build the frontend**

   ```bash
   cd client
   npm run build
   ```

3. **Run development migrations**

   ```bash
   cd server
   npm run db:migrate
   npm run db:generate
   ```

4. **Run production migrations**
   ```bash
   cd server
   npm run db:migrate:prod
   ```

### Environment Setup

Ensure all production environment variables are configured:

- Database connection strings
- Redis connection
- Cloudinary credentials
- SMTP configuration
- JWT secrets (use strong, unique keys)

### Recommended Deployment Platforms

- **Frontend**: Vercel, Netlify
- **Backend**: Railway, Render, AWS EC2
- **Database**: AWS RDS, Supabase
- **Redis**: Redis Cloud, AWS ElastiCache

## 🔮 Future Features

### Planned Enhancements

- **Real-time Collaboration**: Live document editing and comments
- **Advanced Analytics**: Detailed usage analytics and reporting
- **Mobile Apps**: Native iOS and Android applications
- **API Webhooks**: Event-driven integrations
- **Advanced Search**: AI-powered content search and tagging
- **Team Workspaces**: Collaborative team environments
- **Integration APIs**: Third-party service integrations
- **Advanced Security**: Two-factor authentication, SSO
- **Automated Backups**: Scheduled backup and restore functionality
- **Content Preview**: Enhanced preview for more file types



## ⚠️ Limitations

### Current Limitations

- **File Size**: Maximum individual file size of 5GB
- **Storage**: Package-dependent storage limits
- **Concurrent Uploads**: Limited to 5 simultaneous uploads per user
- **File Types**: Some executable file types are restricted for security
- **API Rate Limits**: 100 requests per minute per user
- **Search**: Basic text search (advanced search in development)

### Technical Constraints

- **Database**: PostgreSQL-specific features used (not easily portable)
- **Storage**: Requires Cloudinary account for file storage
- **Email**: SMTP configuration required for notifications
- **Cache**: Redis dependency for optimal performance
- **Browser Support**: Modern browsers only (ES2020+ features)

### Scalability Considerations

- **File Storage**: Horizontal scaling requires load balancer configuration
- **Database**: May require read replicas for high-traffic scenarios
- **Cache**: Redis clustering needed for high availability
- **CDN**: Recommended for global file delivery

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the [documentation](docs/)
- Review the [API documentation](http://localhost:3001/api-docs) when running locally

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Prisma](https://prisma.io/) for the excellent database toolkit
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the [documentation](docs/)
- Review the [API documentation](http://localhost:3001/api-docs) when running locally

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) for the amazing React framework
- [shadcn/ui](https://ui.shadcn.com/) for beautiful UI components
- [Prisma](https://prisma.io/) for the excellent database toolkit
- [Tailwind CSS](https://tailwindcss.com/) for utility-first styling
