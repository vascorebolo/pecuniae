import { contextBridge, ipcRenderer } from 'electron';
import type { CreateTransactionInput, PecuniaeApi } from './shared';

const api: PecuniaeApi = {
  getDashboard: () => ipcRenderer.invoke('pecuniae:get-dashboard'),
  getFormOptions: () => ipcRenderer.invoke('pecuniae:get-form-options'),
  addTransaction: (input: CreateTransactionInput) =>
    ipcRenderer.invoke('pecuniae:add-transaction', input),
};

contextBridge.exposeInMainWorld('pecuniae', api);
