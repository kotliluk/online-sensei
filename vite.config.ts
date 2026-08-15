import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import svgr from 'vite-plugin-svgr'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { fileURLToPath } from 'node:url'


const rootDir = fileURLToPath(new URL('.', import.meta.url))

// Sharing a link and sharing a file both need a secure context, which a phone
// reaching the dev server over the local network does not get from http. `yarn
// dev:https` serves a self-signed certificate instead - the phone warns once,
// and past the warning those features can be tried out for real.
const httpsPlugins = process.env.HTTPS === 'true' ? [basicSsl()] : []

export default defineConfig({
  // the app is deployed to https://kotliluk.github.io/online-sensei/
  base: '/online-sensei/',
  plugins: [react(), svgr(), ...httpsPlugins],
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
