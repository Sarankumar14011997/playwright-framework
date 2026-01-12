/**
 * Select one or more checkbox values from an ng-multiselect-dropdown
 * @param {import('@playwright/test').Page} page
 * @param {string} dropdownName - The name attribute of the ng-multiselect-dropdown
 * @param {string} values - Comma or semicolon separated string of option labels (e.g. "CEIL, CEOL")
 */
export async function selectMultiCheckbox(page, dropdownName, values) {
  if (!values) return;

  // Split multiple options like "CEIL, CEOL"
  const options = values.split(/[,;]+/).map(v => v.trim()).filter(Boolean);
  if (options.length === 0) return;

  // Open the dropdown
  const dropdownButton = page.locator(`ng-multiselect-dropdown[name="${dropdownName}"] div.dropdown-btn`);
  await dropdownButton.click();

  // Wait for dropdown list to appear
  const dropdownList = page.locator(`ng-multiselect-dropdown[name="${dropdownName}"] div.dropdown-list`);
  await dropdownList.waitFor({ state: 'visible', timeout: 10000 });

  // Loop through each option and click it
  for (const opt of options) {
    const optionLocator = dropdownList.locator(`.multiselect-item-checkbox span:text-is("${opt}")`);
    const count = await optionLocator.count();
    if (count > 0) {
      console.log(`✅ Selecting option: ${opt}`);
      await optionLocator.first().click();
      await page.waitForTimeout(300);
    } else {
      console.warn(`⚠️ Option "${opt}" not found in dropdown "${dropdownName}".`);
    }
  }

  // Click outside to close the dropdown (optional)
  await dropdownButton.click();
}
