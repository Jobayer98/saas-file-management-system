// User
export interface User {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  isActive: boolean;
  isEmailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

// Authentication
export interface AuthTokens {
  token: string;
  refreshToken: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    token: string;
    refreshToken: string;
    user: User;
  };
}

// File
export interface FileItem {
  id: string;
  name: string;
  originalName: string;
  mimeType: string;
  size: number;
  path: string;
  folderId: string | null;
  userId: string;
  isFavorite: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

// File Version
export interface FileVersion {
  id: string;
  fileId: string;
  version: number;
  size: number;
  path: string;
  createdAt: string;
}

// Folder
export interface Folder {
  id: string;
  name: string;
  parentId: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
  children?: Folder[];
}

// Package
export interface Package {
  id: number;
  name: string;
  description: string;
  maxFolders: number;
  maxNestingLevel: number;
  allowedFileTypes: string[];
  maxFileSize: number;
  totalFileLimit: number;
  filesPerFolder: number;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Subscription
export interface Subscription {
  id: string;
  userId: string;
  packageId: number;
  status: 'active' | 'cancelled' | 'expired';
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

// Usage Statistics
export interface UsageStats {
  fileCount: number;
  folderCount: number;
  totalSize: number;
  percentUsed: number;
}

// Share Link
export interface ShareLink {
  token: string;
  shareLink: string;
  permissions: 'view' | 'download' | 'edit';
  expiresIn: number;
}

// Upload Session
export interface UploadSession {
  uploadId: string;
  fileName: string;
  fileSize: number;
  totalChunks: number;
  uploadedChunks: number;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'failed' | 'cancelled';
}

// API Response
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

// Pagination
export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    items: T[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
