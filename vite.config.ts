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
    // The oldest browsers `npx browserslist` resolves to, checked 2026-08-30 -
    // five of the eleven families it names, the ones esbuild has a target for.
    // The rest (and_uc, op_mob, samsung) sit above the chrome floor anyway.
    //
    // `ios15.6` is the entry doing the work here: without it Vite writes media
    // queries in range syntax (`@media (width<=560px)`), which WebKit learned
    // in 16.4, and a phone at a tournament would drop those rules without a
    // word. browserslist lists 16.6 directly above 15.6, so the day 15.x falls
    // under the 0.2% cut, refreshing these numbers stops being mechanical -
    // raising this one is a decision to leave iOS 15 behind, not a rewrite.
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
