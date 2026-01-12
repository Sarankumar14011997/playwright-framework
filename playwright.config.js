// 

// @ts-check
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  // Project Information
  testDir: './tests',
  // timeout: 600000, // 10 minutes per test global timeout
  // expect: { timeout: 15000 }, // 15 seconds for individual assertions

   // Performance optimized for i3 + 8GB RAM
  timeout: 5 * 60 * 1000, // 5 minutes per test
  expect: { timeout: 10000 },
  retries: 0,
  fullyParallel: true,
   workers: 3,

  // Reporters Configuration
  reporter: [
    ['list'], // Console summary
    ['html', { outputFolder: 'playwright-report', open: 'always' }], // Beautiful HTML report
    ['json', { outputFile: 'report.json' }], // Optional for CI parsing
    ['allure-playwright'], // Allure advanced reporting
  ],

  use: {
    headless: false,         // run in visible Chrome window
    // browserName: 'chromium', // use Chrome only
    baseURL: 'https://www.landydev.com', // Landy Insurance base URL
    actionTimeout: 60000, // 60s for clicks/fills
    navigationTimeout: 40000, // 40s for navigations
    screenshot: 'on', // Capture screenshot only when test fails
    video: 'on', // Keep video for failed tests
    trace: 'on', // Record trace for debugging
    //  screenshot: 'only-on-failure',
    // video: 'retain-on-failure',
    // trace: 'retain-on-failure',
    viewport: { width: 1366, height: 768 },
    ignoreHTTPSErrors: true,



    launchOptions: {
      slowMo: 150,          // Balanced speed for stability
      args: [
        '--disable-gpu',
        '--disable-dev-shm-usage',
        '--disable-background-timer-throttling',
        '--disable-renderer-backgrounding'
      ]
    }
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] }, // desktop Chrome mode
    },

    // {
    //   name: 'Edge',
    //   use: { ...devices['Desktop Edge'] },
    // },
  ],



  // Report output locations
  outputDir: 'test-results/',
});