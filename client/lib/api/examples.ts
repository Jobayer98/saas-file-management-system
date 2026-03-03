/**
 * API Client Usage Examples
 * 
 * This file contains example code demonstrating how to use the API client services.
 * These examples are for reference only and should not be imported in production code.
 */

import { 
  authService, 
  fileService, 
  folderService, 
  subscriptionService, 
  adminService 
} from './services';

// ============================================================================
// Authentication Examples
// ============================================================================

export async function exampleLogin() {
  try {
    const response = await authService.login('user@example.com', 'password123');
    console.log('Login successful:', response.data.user);
    return response;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
}

export async function exampleRegister() {
  try {
    const response = await authService.register('newuser@example.com', 'password123', 'New User');
    console.log('Registration successful:', response.data);
    return response;
  } catch (error) {
    console.error('Registration failed:', error);
    throw error;
  }
}

// ============================================================================
// File Management Examples
// ============================================================================

export async function exampleUploadFile(file: File, folderId?: string) {
  try {
    const uploadedFile = await fileService.uploadFile(file, folderId);
    console.log('File uploaded:', uploadedFile);
    return uploadedFile;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
}

export async function exampleGetFiles(folderId?: string) {
  try {
    const response = await fileService.getFiles(folderId);
    console.log('Files retrieved:', response.data.items.length);
    return response;
  } catch (error) {
    console.error('Failed to get files:', error);
    throw error;
  }
}

// ============================================================================
// Folder Management Examples
// ============================================================================

export async function exampleCreateFolder(name: string, parentId?: string) {
  try {
    const folder = await folderService.createFolder(name, parentId);
    console.log('Folder created:', folder);
    return folder;
  } catch (error) {
    console.error('Folder creation failed:', error);
    throw error;
  }
}

export async function exampleGetFolderTree() {
  try {
    const folders = await folderService.getFolderTree();
    console.log('Folder tree retrieved:', folders.length);
    return folders;
  } catch (error) {
    console.error('Failed to get folder tree:', error);
    throw error;
  }
}

// ============================================================================
// Subscription Examples
// ============================================================================

export async function exampleGetCurrentSubscription() {
  try {
    const subscription = await subscriptionService.getCurrentSubscription();
    console.log('Current subscription:', subscription);
    return subscription;
  } catch (error) {
    console.error('Failed to get subscription:', error);
    throw error;
  }
}

export async function exampleGetUsage() {
  try {
    const usage = await subscriptionService.getUsage();
    console.log('Storage usage:', usage);
    return usage;
  } catch (error) {
    console.error('Failed to get usage:', error);
    throw error;
  }
}

// ============================================================================
// Admin Examples
// ============================================================================

export async function exampleGetUsers() {
  try {
    const response = await adminService.getUsers();
    console.log('Users retrieved:', response.data.items.length);
    return response;
  } catch (error) {
    console.error('Failed to get users:', error);
    throw error;
  }
}

export async function exampleGetAllPackages() {
  try {
    const packages = await adminService.getAllPackages();
    console.log('Packages retrieved:', packages.length);
    return packages;
  } catch (error) {
    console.error('Failed to get packages:', error);
    throw error;
  }
}