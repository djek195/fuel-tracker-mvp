import {defineConfig} from 'vitest/config'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
    plugins: [react()],
    server: {
        port: Number(process.env.FRONTEND_PORT || 5173),
    },
    test: {
        environment: "jsdom",
        setupFiles: ["./src/tests/setup.ts"],
        globals: true,
        css: true,
    },
})