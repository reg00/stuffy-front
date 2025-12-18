import { defineConfig } from '@hey-api/openapi-ts';

export default defineConfig({
  input: './openapi.json',
  output: {
    path: './src/api',
    format: 'prettier',
  },
  plugins: [
    '@hey-api/sdk',  // ⬅️ Это важно!
  ],
});