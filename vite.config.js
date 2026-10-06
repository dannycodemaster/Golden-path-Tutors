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
        fees: resolve(__dirname, 'fees.html'),
        tutors: resolve(__dirname, 'tutors.html'),
        contact: resolve(__dirname, 'contact.html')
      }
    }
  }
});
