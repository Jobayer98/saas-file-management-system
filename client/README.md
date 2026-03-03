# File & Folder Management System - Frontend

A modern Next.js 16 frontend application for file and folder management with role-based access control.

## Features Implemented

### ✅ Authentication System

- **Login/Registration**: Complete user authentication with form validation
- **Email Verification**: Email verification flow for new registrations
- **Password Reset**: Forgot password and reset password functionality
- **Protected Routes**: Role-based route protection (admin vs customer)
- **Token Management**: Automatic token refresh and secure storage

### ✅ UI Components

- **shadcn UI**: Modern, accessible UI components
- **Responsive Design**: Mobile-friendly interface
- **Form Validation**: Zod schema validation with React Hook Form
- **Toast Notifications**: User feedback with Sonner
- **Loading States**: Proper loading indicators

### ✅ Dashboard Layout

- **Customer Dashboard**: Protected dashboard for regular users
- **Navigation**: Sidebar navigation with role-based menu items
- **User Profile**: User dropdown with profile and logout options

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn UI with Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios with interceptors and retry logic
- **State Management**: React Context for authentication
- **Notifications**: Sonner for toast messages

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:

```bash
npm install
```

2. Set up environment variables:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and set:

```
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

3. Start the development server:

```bash
npm run dev
```

4. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

```
client/
├── app/                    # Next.js App Router pages
│   ├── dashboard/         # Protected customer dashboard
│   ├── login/            # Authentication pages
│   ├── register/
│   ├── forgot-password/
│   ├── reset-password/
│   └── verify-email/
├── components/            # Reusable components
│   ├── auth/             # Authentication components
│   ├── dashboard/        # Dashboard layout components
│   └── ui/               # shadcn UI components
├── lib/                  # Utilities and services
│   ├── api/              # API client and services
│   ├── auth/             # Authentication context
│   └── utils.ts          # Utility functions
└── types/                # TypeScript type definitions
```

## API Integration

The frontend integrates with the backend API using:

- **Authentication Service**: Login, register, password reset, email verification
- **Automatic Token Refresh**: Handles token expiration seamlessly
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Retry Logic**: Automatic retry for failed requests

## Authentication Flow

1. **Registration**: User registers → Email verification required → Login enabled
2. **Login**: Email/password → JWT tokens stored → Redirect to dashboard
3. **Protected Routes**: Automatic redirect to login if not authenticated
4. **Role-based Access**: Admin vs customer dashboard routing
5. **Token Refresh**: Automatic token refresh on expiration
6. **Logout**: Clear tokens and redirect to home

## Next Steps

The following features are ready to be implemented:

1. **File Upload & Management** (Task 4)
2. **Folder Management** (Task 5)
3. **File Versioning** (Task 7)
4. **File Sharing** (Task 8)
5. **Subscription Management** (Task 9)
6. **Admin Panel** (Tasks 12-15)

## Development Commands

```bash
# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Lint code
npm run lint
```

## Environment Variables

| Variable              | Description          | Default                     |
| --------------------- | -------------------- | --------------------------- |
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:3000/api` |

## Contributing

1. Follow the task list in `task.md`
2. Use TypeScript strict mode
3. Follow the established component patterns
4. Add proper error handling
5. Test authentication flows before proceeding to file management features
