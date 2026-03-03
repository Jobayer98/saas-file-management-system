import { apiClient } from '../client';
import type { Folder, FileItem } from '@/types';

export const folderService = {
  async getFolders(parentId?: string): Promise<{ folders: Folder[]; files: FileItem[] }> {
    const params = parentId ? `?parentId=${parentId}` : '';
    const response = await apiClient.get(`/folders${params}`);
    return response.data.data;
  },

  async getFolderTree(): Promise<Folder[]> {
    const response = await apiClient.get('/folders/tree');
    return response.data.data;
  },

  async getFolder(id: string): Promise<{ folder: Folder; children: Folder[]; files: FileItem[] }> {
    const response = await apiClient.get(`/folders/${id}`);
    return response.data.data;
  },

  async createFolder(name: string, parentId?: string): Promise<Folder> {
    const response = await apiClient.post('/folders', { name, parentId });
    return response.data.data;
  },

  async updateFolder(id: string, name: string): Promise<Folder> {
    const response = await apiClient.put(`/folders/${id}`, { name });
    return response.data.data;
  },

  async deleteFolder(id: string): Promise<void> {
    await apiClient.delete(`/folders/${id}`);
  },

  async moveFolder(id: string, targetFolderId: string | null): Promise<Folder> {
    const response = await apiClient.post(`/folders/${id}/move`, { targetFolderId });
    return response.data.data;
  },

  async getBreadcrumb(id: string): Promise<Folder[]> {
    const response = await apiClient.get(`/folders/${id}/breadcrumb`);
    return response.data.data;
  },

  async bulkCreate(names: string[], parentId?: string): Promise<Folder[]> {
    const response = await apiClient.post('/folders/bulk/create', { names, parentId });
    return response.data.data;
  },

  async bulkDelete(folderIds: string[]): Promise<{ deleted: string[]; count: number }> {
    const response = await apiClient.post('/folders/bulk/delete', { folderIds });
    return response.data.data;
  },
};
