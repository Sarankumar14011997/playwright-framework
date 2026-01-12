import { waitForFullPageLoad } from './waitUtils.js';

/**
 * Monkey-patch Playwright's page.goto() and locator.click()
 * to automatically wait for full page load.
 */
export function enableAutoPageWait(page) {
  const originalGoto = page.goto.bind(page);
  const originalLocator = page.locator.bind(page);

  // Patch page.goto()
  page.goto = async (...args) => {
    const response = await originalGoto(...args);
    await waitForFullPageLoad(page);
    return response;
  };

  // Patch locator.click() globally
  page.locator = (...args) => {
    const locator = originalLocator(...args);
    const originalClick = locator.click.bind(locator);

    locator.click = async (...clickArgs) => {
      await originalClick(...clickArgs);
      await waitForFullPageLoad(page);
    };

    return locator;
  };
}
