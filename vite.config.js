import { resolve } from 'path';
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    port: 3000,
    open: false
  },
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        about: resolve(__dirname, 'about.html'),
        services: resolve(__dirname, 'services.html'),
        tutors: resolve(__dirname, 'tutors.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        contact: resolve(__dirname, 'contact.html')
      }
    }
  }
});
