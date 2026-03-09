import { apiClient } from '../client';
import type { FileItem, Folder, ApiResponse } from '@/types';

export const trashService = {
  async getTrashItems(): Promise<{ files: FileItem[]; folders: Folder[] }> {
    const response = await apiClient.get('/trash');
    return response.data.data;
  },

  async restoreFile(id: string): Promise<ApiResponse<{ file: FileItem }>> {
    const response = await apiClient.post(`/trash/files/${id}/restore`);
    return response.data;
  },

  async restoreFolder(id: string): Promise<ApiResponse<{ folder: Folder }>> {
    const response = await apiClient.post(`/trash/folders/${id}/restore`);
    return response.data;
  },

  async permanentlyDeleteFile(id: string): Promise<void> {
    await apiClient.delete(`/trash/files/${id}`);
  },

  async permanentlyDeleteFolder(id: string): Promise<void> {
    await apiClient.delete(`/trash/folders/${id}`);
  },

  async emptyTrash(): Promise<ApiResponse<{ deletedFiles: number; deletedFolders: number }>> {
    const response = await apiClient.delete('/trash/empty');
    return response.data;
  },
};
