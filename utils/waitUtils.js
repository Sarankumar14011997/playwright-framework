/**
 * Wait until page is fully loaded (DOM + network + Angular/React rendering)
 * @param {import('@playwright/test').Page} page
 * @param {number} timeout - optional timeout in ms
 */
export async function waitForFullPageLoad(page, timeout = 15000) {
  // Wait for the document to be fully loaded
  await page.waitForFunction(() => document.readyState === 'complete', null, { timeout });

  // Wait for network to be idle (no API calls pending)
  await page.waitForLoadState('networkidle', { timeout });

  // Small buffer to ensure SPA rendering (Angular/React) completes
  await page.waitForTimeout(1000);
}
