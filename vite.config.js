import { readFileSync } from 'node:fs'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// The security headers live in vercel.json (that's what the live site sends).
// `npm run preview` sends the same ones, so the built app can be tested locally
// under exactly the same rules before deploying.
const vercel = JSON.parse(readFileSync(new URL('./vercel.json', import.meta.url), 'utf-8'))
const securityHeaders = Object.fromEntries(vercel.headers[0].headers.map(({ key, value }) => [key, value]))

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Vite normally embeds small files as data: URLs. Keep fonts as real files so
    // the Content-Security-Policy can stay strict (font-src 'self', no data:).
    assetsInlineLimit: (filePath) => (/\.(woff2?|ttf|otf)$/.test(filePath) ? false : undefined),
  },
  preview: {
    headers: securityHeaders,
  },
})
