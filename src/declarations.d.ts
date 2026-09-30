/// <reference types="@electron-forge/plugin-vite/forge-vite-env" />
/// <reference types="vite/client" />

import type { PecuniaeApi } from './shared';

declare global {
  interface Window {
    pecuniae: PecuniaeApi;
  }
}
