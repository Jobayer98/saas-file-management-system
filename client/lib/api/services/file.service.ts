import { apiClient } from '../client';
import type { FileItem, FileVersion, ShareLink, PaginatedResponse } from '@/types';

export const fileService = {
  async getFiles(folderId?: string, page = 1, limit = 20): Promise<PaginatedResponse<FileItem>> {
    const params = new URLSearchParams();
    if (folderId) params.append('folderId', folderId);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const response = await apiClient.get(`/files?${params}`);
    return response.data; // This is the server response: { success, message, data }
  },

  async getFile(id: string): Promise<FileItem> {
    const response = await apiClient.get(`/files/${id}`);
    return response.data.data.file;
  },

  async uploadFile(file: File, folderId?: string, maxRetries = 3): Promise<FileItem> {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const formData = new FormData();
        formData.append('file', file);
        if (folderId) formData.append('folderId', folderId);

        const response = await apiClient.post('/files/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 120000, // 2 minutes
        });
        return response.data.data;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          throw error;
        }
        
        // Retry on network errors or server errors
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000;
          await new Promise(resolve => setTimeout(resolve, delay));
          console.log(`Retrying upload, attempt ${attempt + 2}/${maxRetries}`);
        }
      }
    }
    
    throw lastError;
  },

  async uploadMultipleFiles(files: File[], folderId?: string): Promise<{ files: FileItem[]; failed: any[] }> {
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
    if (folderId) formData.append('folderId', folderId);

    const response = await apiClient.post('/files/multi-upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async initChunkedUpload(fileName: string, fileSize: number, fileType: string, totalChunks: number, folderId?: string): Promise<string> {
    const response = await apiClient.post('/files/upload/chunk/init', {
      fileName,
      fileSize,
      fileType,
      totalChunks,
      folderId,
    });
    return response.data.data.uploadId;
  },

  async uploadChunk(
    uploadId: string,
    chunk: Blob,
    chunkIndex: number,
    maxRetries = 3
  ): Promise<{ received: number; total: number }> {
    let lastError: any;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const formData = new FormData();
        formData.append('chunk', chunk);
        formData.append('uploadId', uploadId);
        formData.append('chunkIndex', chunkIndex.toString());

        const response = await apiClient.post('/files/upload/chunk', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          timeout: 60000, // 60 seconds for chunk upload
        });
        return response.data.data;
      } catch (error: any) {
        lastError = error;
        
        // Don't retry on client errors (4xx)
        if (error.response && error.response.status >= 400 && error.response.status < 500) {
          throw error;
        }
        
        // Retry on network errors or server errors
        if (attempt < maxRetries - 1) {
          const delay = Math.pow(2, attempt) * 1000; // 1s, 2s, 4s
          await new Promise(resolve => setTimeout(resolve, delay));
          console.log(`Retrying chunk ${chunkIndex}, attempt ${attempt + 2}/${maxRetries}`);
        }
      }
    }
    
    throw lastError;
  },

  async completeChunkedUpload(uploadId: string): Promise<FileItem> {
    const response = await apiClient.post('/files/upload/chunk/complete', { uploadId });
    return response.data.data;
  },

  async cancelUpload(uploadId: string): Promise<void> {
    await apiClient.post('/files/upload/cancel', { uploadId });
  },

  async downloadFile(id: string): Promise<Blob> {
    const response = await apiClient.get(`/files/${id}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },

  async getPreviewUrl(id: string): Promise<{ previewUrl: string; type: string; mimeType: string }> {
    const response = await apiClient.get(`/files/${id}/preview`);
    const data = response.data.data;

    // For PDFs, if the preview URL is not a proper HTTP URL, use the download endpoint
    if (data.mimeType === 'application/pdf' && data.previewUrl && !data.previewUrl.startsWith('http')) {
      console.log('PDF preview URL is not HTTP, using download endpoint:', data.previewUrl);
      data.previewUrl = `/api/files/${id}/download`;
    }

    return data;
  },

  async getThumbnailUrl(id: string): Promise<string> {
    const response = await apiClient.get(`/files/${id}/thumbnail`);
    return response.data.data.thumbnailUrl;
  },

  async renameFile(id: string, newName: string): Promise<FileItem> {
    const response = await apiClient.put(`/files/${id}/rename`, { newName });
    return response.data.data;
  },

  async moveFile(id: string, targetFolderId: string | null): Promise<FileItem> {
    const response = await apiClient.post(`/files/${id}/move`, { targetFolderId });
    return response.data.data;
  },

  async copyFile(id: string, targetFolderId: string | null): Promise<FileItem> {
    const response = await apiClient.post(`/files/${id}/copy`, { targetFolderId });
    return response.data.data;
  },

  async deleteFile(id: string): Promise<void> {
    await apiClient.delete(`/files/${id}`);
  },

  async toggleFavorite(id: string, isFavorite: boolean): Promise<void> {
    if (isFavorite) {
      await apiClient.post(`/files/${id}/favorite`);
    } else {
      await apiClient.post(`/files/${id}/unfavorite`);
    }
  },

  async shareFile(id: string, expiresIn?: number, permissions?: string): Promise<ShareLink> {
    const response = await apiClient.post(`/files/${id}/share`, { expiresIn, permissions });
    return response.data.data;
  },

  async deleteShare(id: string): Promise<void> {
    await apiClient.delete(`/files/${id}/share`);
  },

  async bulkDelete(fileIds: string[]): Promise<{ deleted: string[]; count: number }> {
    const response = await apiClient.post('/files/bulk/delete', { fileIds });
    return response.data.data;
  },

  async bulkMove(fileIds: string[], targetFolderId: string | null): Promise<{ moved: string[]; count: number }> {
    const response = await apiClient.post('/files/bulk/move', { fileIds, targetFolderId });
    return response.data.data;
  },

  async bulkFavorite(fileIds: string[]): Promise<{ count: number }> {
    const response = await apiClient.post('/files/bulk/favorite', { fileIds });
    return response.data.data;
  },

  // Version management
  async getVersions(fileId: string): Promise<FileVersion[]> {
    const response = await apiClient.get(`/files/${fileId}/versions`);
    return response.data.data;
  },

  async createVersion(fileId: string, file: File): Promise<FileVersion> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await apiClient.post(`/files/${fileId}/versions`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  },

  async restoreVersion(fileId: string, versionId: string): Promise<FileItem> {
    const response = await apiClient.post(`/files/${fileId}/versions/${versionId}/restore`);
    return response.data.data;
  },

  async deleteVersion(fileId: string, versionId: string): Promise<void> {
    await apiClient.delete(`/files/${fileId}/versions/${versionId}`);
  },

  async downloadVersion(fileId: string, versionId: string): Promise<Blob> {
    const response = await apiClient.get(`/files/${fileId}/versions/${versionId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  },
};
