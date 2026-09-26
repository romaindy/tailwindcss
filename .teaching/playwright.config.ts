import { defineConfig } from '@playwright/test'

export default defineConfig({
    testDir: './tests',
    use: {
        baseURL: 'http://localhost:9876',
    },
    webServer: {
        command: 'npx serve ../ -l 9876',
        url: 'http://localhost:9876',
        reuseExistingServer: true,
    },
})