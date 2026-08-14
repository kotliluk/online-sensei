import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import { fileURLToPath } from 'node:url'


const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  // the app is deployed to https://kotliluk.github.io/online-sensei/
  base: '/online-sensei/',
  plugins: [react(), svgr()],
  build: {
    outDir: 'build',
    // Vite's default CSS target rewrites media queries to range syntax
    // (`@media (width<=560px)`), which Safari only understands from 16.4.
    // The app is used on whatever phone is at hand at a tournament, so keep
    // the CSS output conservative.
    cssTarget: ['chrome87', 'firefox78', 'safari14', 'edge88'],
  },
  css: {
    preprocessorOptions: {
      scss: {
        // allows root-relative imports like '@use "src/styles/variables"'
        loadPaths: [rootDir],
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
  },
})
