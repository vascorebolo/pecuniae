import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import { DatabaseService } from './database';
import type { CreateTransactionInput } from './shared';

if (started) app.quit();

let database: DatabaseService | undefined;

const registerIpc = (db: DatabaseService) => {
  ipcMain.handle('pecuniae:get-dashboard', () => db.getDashboard());
  ipcMain.handle('pecuniae:get-form-options', () => db.getFormOptions());
  ipcMain.handle(
    'pecuniae:add-transaction',
    (_event, input: CreateTransactionInput) => db.addTransaction(input),
  );
};

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 940,
    minWidth: 760,
    minHeight: 580,
    backgroundColor: '#f5f3ef',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    void mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    void mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
    );
  }
};

app.whenReady().then(() => {
  database = new DatabaseService(
    path.join(app.getPath('userData'), 'pecuniae.sqlite3'),
  );
  registerIpc(database);
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('before-quit', () => database?.close());

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
