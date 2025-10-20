import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        'tests/',
        '**/*.config.ts',
        '**/*.d.ts',
        '**/types/**',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@application': path.resolve(__dirname, './src/application'),
      '@domain': path.resolve(__dirname, './src/domain'),
      '@infrastructure': path.resolve(__dirname, './src/infrastructure'),
      '@presentation': path.resolve(__dirname, './src/presentation'),
      '@config': path.resolve(__dirname, './src/config'),
      '@shared': path.resolve(__dirname, './src/shared'),
    },
  },
});