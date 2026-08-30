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
    // The oldest browsers `npx browserslist` resolves to, checked 2026-08-30.
    // Naming them is what keeps Vite's default off: left alone it writes media
    // queries in range syntax (`@media (width<=560px)`), which WebKit only
    // understands from 16.4 - far above the iOS floor below, and a phone at a
    // tournament is exactly the device that would drop the rule in silence.
    // The list only caps the syntax esbuild may emit, so it is worth no more
    // than its truthfulness: it used to claim safari14, which the app has not
    // supported for years.
    cssTarget: ['chrome109', 'edge149', 'firefox121', 'ios15.6', 'safari18.5'],
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
