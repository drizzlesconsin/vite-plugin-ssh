import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import VitePluginSsh from '../src'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePluginSsh({
      host: 'example.com',
      port: 22,
      username: 'username',
      password: 'password',
      // identity: '../private_key.pem',
      localPath: 'dist',
      remotePath: '/path/to/root',
      backupFiles: ['assets', 'index.html'],
    }),
  ],
})
