/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    css: false,
    env: {
      VITE_API_URL: 'http://api.test/api',
      VITE_DEMO_ADMIN_EMAIL: 'admin@demo.test',
      VITE_DEMO_ADMIN_PASSWORD: 'demo-admin-pass',
      VITE_DEMO_CUSTOMER_EMAIL: 'customer@demo.test',
      VITE_DEMO_CUSTOMER_PASSWORD: 'demo-customer-pass',
    },
    coverage: {
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/main.tsx', 'src/test/**', 'src/**/*.test.{ts,tsx}'],
    },
  },
});
