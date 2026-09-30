import { contextBridge, ipcRenderer } from 'electron';
import type {
  CreateCategoryInput,
  CreateTransactionInput,
  PecuniaeApi,
  UpdateTransactionInput,
} from './shared';

const api: PecuniaeApi = {
  getDashboard: (month?: string) =>
    ipcRenderer.invoke('pecuniae:get-dashboard', month),
  getAnalytics: (scope: 'all' | 'month', month: string) =>
    ipcRenderer.invoke('pecuniae:get-analytics', scope, month),
  getFormOptions: () => ipcRenderer.invoke('pecuniae:get-form-options'),
  addTransaction: (input: CreateTransactionInput) =>
    ipcRenderer.invoke('pecuniae:add-transaction', input),
  createCategory: (input: CreateCategoryInput) =>
    ipcRenderer.invoke('pecuniae:create-category', input),
  deleteCategory: (id: number) =>
    ipcRenderer.invoke('pecuniae:delete-category', id),
  updateTransaction: (input: UpdateTransactionInput) =>
    ipcRenderer.invoke('pecuniae:update-transaction', input),
  deleteTransaction: (id: number) =>
    ipcRenderer.invoke('pecuniae:delete-transaction', id),
};

contextBridge.exposeInMainWorld('pecuniae', api);
