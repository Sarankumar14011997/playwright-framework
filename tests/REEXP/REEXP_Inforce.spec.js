// @ts-check
import { test, expect } from '@playwright/test';
import { enableAutoHighlight } from '../../utils/highlightActions.js';
import { enableAutoPageWait } from '../../utils/globalWaitPatch.js';
import { waitForFullPageLoad } from '../../utils/waitUtils.js';
import { readExcel, excelPathFromProject } from '../../utils/excelUtils.js';



test('REEXP-Direct Excel', async ({ page }) => {
  enableAutoHighlight(page);
  enableAutoPageWait(page);

  // load data
  const file = excelPathFromProject('tests', 'data', 'AllLOB.xlsx');


  // Load Sheet3
  // @ts-ignore
  const rows = await readExcel(file, "Sheet3");
  console.log("Rows from Sheet3:", rows.length);
  // optional: limit for debugging
  // const rowsToRun = rows.slice(0, 5);
  const rowsToRun = rows;

  for (const row of rowsToRun) {
    console.log(`\n--- Running for state: ${row.State} | Producer: ${row.ProducerCode} ---`);

    // Navigate & login (if you need fresh session per iteration you may navigate/login each loop,
    // or login once before loop if app allows)


    // LOGIN CREDENTIALS
    console.log("Step 1: Application Details Test Started");
    await page.goto('https://www.landydev.com/#/auth/login');
    await expect(page).toHaveTitle('Landy Insurance App');

    await page.locator('//input[@id="email"]').fill('sarankumar@stepladdersolutions.com');
    await page.locator('//input[@id="password"]').fill('Test@1234');
    await page.locator('//button[contains(text(), "Login")]').click();
    await expect(page.locator('text=Logged in Successfully')).toBeVisible({ timeout: 10000 });

    // NEW BUSINESS
    console.log("Step 2: New Business Test Started");
    await page.locator('//*[@id="add"]').click();
    await waitForFullPageLoad(page);

    // STATE and LOB using data
    console.log("Step 3: STATE and LOB Selection Test Started");
    await page.locator("//div[@class='row ng-star-inserted']//div[1]//div[1]//select[1]").selectOption({ label: row.State });
    await page.locator("//div[@class='step-content']//div[2]//div[1]//select[1]").selectOption({ label: row.LOB });

    // PRODUCER 
    console.log("Step 4: Producer Test Started");
    const producerInput = page.locator("//input[@placeholder='Pick a producer']");
    await producerInput.click();
    await producerInput.fill('');
    await producerInput.type(row.ProducerCode, { delay: 100 });
    await page.waitForTimeout(500);
    await producerInput.press('Enter');

    // CLIENT INFORMATION
    console.log("Step 5: Client Information Test Started");
    const firmInput = page.locator('//input[@placeholder="Search Firm Name"]');
    await firmInput.click();
    await firmInput.fill('');
    await firmInput.type(row.FirmName || '', { delay: 80 });
    await firmInput.press('Tab');
    await page.waitForTimeout(400);

    // Location
    await page.locator("(//input[@placeholder='Location'])[1]").fill(row.Location || '');
    await page.waitForTimeout(1000);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Contact and phone
    await page.locator('//input[@id="fName"]').fill(row.FName || '');
    await page.locator('//input[@id="lName"]').fill(row.LName || '');
    await page.locator('//input[@id="phone"]').fill(row.Phone || '');

    // // Effective date (ISO YYYY-MM-DD)
    // const eff = page.locator('#effDate2');
    // // Format fallback date as DD/MM/YYYY
    // const today = new Date();
    // const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    // const effDate = row.EffectiveDate || formattedDate;
    // await eff.fill(effDate);
    // await eff.press('Tab');


    // Today in YYYY-MM-DD format
    const Effectivetoday = new Date().toISOString().split('T')[0];
    await page.locator('#effDate2').fill(Effectivetoday);
    await page.locator('#effDate2').press('Tab');



    // Prior check
    await page.locator("//select[@id='priorCheck']").selectOption({ label: row.PriorCheck || '' });

    // Save & Close
    const saveButton = page.locator("//button[@id='onSave2']");
    await saveButton.click();

    // Wait for confirmation or page change
    try {
      await expect(page.locator("text=Saved successfully")).toBeVisible({ timeout: 5000 });
    } catch (e) {
      console.warn('Save toast not found; continuing but verify manually for this row.');
    }



    //APPLICATION DETAILS FORM FILLING

    console.log("Step 6: Application Details Test Started");

    await page.locator("//nb-accordion-item-header[.//span[normalize-space(text())='Application Details']]").click();
    await page.waitForTimeout(1000);
    await page.locator('//select[@id="typeOfFirmReId"]').selectOption({ label: row.typeOfFirmReId });
    await page.locator('//input[@id="profEarning1"]').fill(row.profEarning1 || '');
    await page.locator('//input[@id="profEarning2"]').fill(row.profEarning2 || '');
    await page.locator('//input[@id="annTrans"]').fill(row.annTrans || '');
    await page.waitForTimeout(1000);

    const totGrossrevPrior = page.locator('//input[@id="totGrossrevPrior"]');
    await totGrossrevPrior.click();
    await totGrossrevPrior.fill(""); // clear any old value
    await totGrossrevPrior.type(row.totGrossrevPrior?.toString() || "0", { delay: 100 });
    await page.waitForLoadState("networkidle", { timeout: 5000 });
    // Save & Close
    const AppsaveButton = page.locator("//button[@id='saveClose']");
    await expect(AppsaveButton).toBeEnabled();
    await AppsaveButton.click();
    await page.waitForTimeout(1000);



    // OPTIONAL COVERAGES
    console.log("Step 7: Optional Coverages Test Started");
    await page.locator("//nb-accordion-item-header[.//span[normalize-space(text())='Optional Coverages']]").click();
    await page.locator('//select[@id="cyber"]').selectOption({ label: 'No' });
    await page.waitForTimeout(1000);
    // Save & Close
    const OCsaveButton = page.locator("//button[@id='saveClose']");
    await expect(OCsaveButton).toBeEnabled();
    await OCsaveButton.click();
    await page.waitForTimeout(1000);

    // ENDORSEMENTS
    console.log("Step 8: Endorsements Test Started");
    await page.locator("//nb-accordion-item-header[.//span[normalize-space(text())='Endorsements']]").click();
    await page.waitForTimeout(2000);
    // Save & Close
    const EndorsementSaveButton = page.locator("//button[@id='saveClose']");
    await expect(EndorsementSaveButton).toBeEnabled();
    await EndorsementSaveButton.click();
    await page.waitForLoadState('networkidle', { timeout: 4000 });
    // Next
    await page.locator("//button[@id='next']").click();
    await page.waitForFunction(() => document.readyState === 'complete', null, { timeout: 5000 });
    await waitForFullPageLoad(page);


    //PURCHASED OPTIONS PAGE
    console.log("Step 9: Purchased Options Test Started");

    await page.locator("//label[@for='defaultInline_1_7_liability']").click();
    await page.locator("//button[@id='issuePolicy']").click();
    await page.waitForLoadState('networkidle', { timeout: 5000 });
    await page.locator("//button[@id='moveToAccounting']").click();
    await page.waitForLoadState('networkidle', { timeout: 5000 });
    await page.locator("//button[@id='accounting']").click();
    await page.waitForLoadState('networkidle', { timeout: 5000 });


    // PAYMENT PAGE
    console.log("Step 10: Payment Test Started");
    await page.locator("//span[normalize-space()='Payment']").click();


    console.log("Step 11: Capture Balance and Enter Amount Received Test Started");

    await page.waitForSelector("tr[class='bold ng-star-inserted'] td:nth-child(9)", { timeout: 15000 });// 1) Wait for the table to appear
    const rawBalance = await page.locator("tr[class='bold ng-star-inserted'] td:nth-child(9)").first().innerText(); // 2) Capture the balance from the row

    // 3) Normalize the captured text to a numeric string, "$597.00" -> "597.00"
    const normalized = rawBalance.replace(/\s/g, '')           // remove whitespace
      .replace(/\$/g, '')          // remove dollar sign
      .replace(/,/g, '')           // remove commas
      .replace(/[^\d.()-]/g, ''); // keep digits, dot, minus/parens

    console.log('Captured balance:', rawBalance, '=>', normalized);

    // 4) Wait for Amount Received input - try a few common locators and pick the first that exists
    const amountLocators = [
      "//input[@placeholder='Amount Received']",
      "//input[@formcontrolname='amountReceived']",
      "//input[contains(@id,'amount') and contains(@id,'received')]",
      "//label[normalize-space()='Amount Received']/following::input[1]",
      "//input[contains(@placeholder,'Amount')]"
    ];

    let amountInput = null;
    for (const sel of amountLocators) {
      const loc = page.locator(sel);
      if (await loc.count() > 0) {
        amountInput = loc.first();
        break;
      }
    }
    if (!amountInput) {
      throw new Error('Could not find Amount Received input. Update selectors in script.');
    }

    // 5) Click/type/fill to make sure Angular/React pick up change
    await amountInput.click();
    await amountInput.fill('');              // clear any value
    await amountInput.type(normalized, { delay: 50 }); // simulate user typing
    await page.keyboard.press('Tab');        // trigger blur / validation

    // 6) Verify value is set (if input only stores numeric value)
    //    Use toHaveValue with normalized value or allow formatted variants

    console.log("Step 12: Finalizing Payment Test Started");
    await page.locator("//input[@id='checkNumber']").fill('541516543213');
    await page.locator("//button[@id='autofill']").click();
    await page.locator("//button[@id=' Save & Issue']").click();
    await page.waitForTimeout(4000);

    console.log("Step 12: Policy Queued Test Started");
    await page.locator("//button[@id='yes']").click();
    await page.waitForLoadState('networkidle', { timeout: 3000 });
    await page.locator("//a[@title='Accounting']").click();
    await page.locator("//a[@title='Policy Queued']").click();

    await page.locator("(//input[@type='checkbox'])[15]").click();
    await page.locator("(//button[@id='markBooking'])[1]").click();
    await page.locator("//button[@id='yes']").click();

    await page.locator("//a[@title='Underwriting']").click();
    await page.waitForTimeout(4000);




    // // If app requires fresh start for next iteration, you can logout or navigate to base dashboard
    // await page.goto('https://www.landydev.com/#/pages/riskPolicySearch');

  }
});





























test('REEXP-Sub Producer Excel', async ({ page }) => {
  enableAutoHighlight(page);
  enableAutoPageWait(page);

  // load data
  const file = excelPathFromProject('tests', 'data', 'states.xlsx');
  const rows = await readExcel(file); // array of objects, headers become keys

  console.log('Rows loaded:', rows.length);

  // optional: limit for debugging
  // const rowsToRun = rows.slice(0, 5);
  const rowsToRun = rows;

  for (const row of rowsToRun) {
    console.log(`\n--- Running for state: ${row.State} | Producer: ${row.ProducerCode} ---`);

    // Navigate & login (if you need fresh session per iteration you may navigate/login each loop,
    // or login once before loop if app allows)


    // LOGIN CREDENTIALS
    console.log("Step 1: Application Details Test Started");
    await page.goto('https://www.landydev.com/#/auth/login');
    await expect(page).toHaveTitle('Landy Insurance App');

    await page.locator('//input[@id="email"]').fill('sarankumar@stepladdersolutions.com');
    await page.locator('//input[@id="password"]').fill('Test@1234');
    await page.locator('//button[contains(text(), "Login")]').click();
    await expect(page.locator('text=Logged in Successfully')).toBeVisible({ timeout: 10000 });

    // NEW BUSINESS
    console.log("Step 2: New Business Test Started");
    await page.locator('//*[@id="add"]').click();
    await waitForFullPageLoad(page);

    // STATE and LOB using data
    console.log("Step 3: STATE and LOB Selection Test Started");
    await page.locator("//div[@class='row ng-star-inserted']//div[1]//div[1]//select[1]").selectOption({ label: row.State });
    await page.locator("//div[@class='step-content']//div[2]//div[1]//select[1]").selectOption({ label: row.LOB });

    // PRODUCER 
    console.log("Step 4: Producer Test Started");
    const producerInput = page.locator("//input[@placeholder='Pick a producer']");
    await producerInput.click();
    await producerInput.fill('');
    await producerInput.type(row.ProducerCode, { delay: 100 });
    await page.waitForTimeout(500);
    await producerInput.press('Enter');

    // CLIENT INFORMATION
    console.log("Step 5: Client Information Test Started");
    const firmInput = page.locator('//input[@placeholder="Search Firm Name"]');
    await firmInput.click();
    await firmInput.fill('');
    await firmInput.type(row.FirmName || '', { delay: 80 });
    await firmInput.press('Tab');
    await page.waitForTimeout(400);

    // Location
    await page.locator("(//input[@placeholder='Location'])[1]").fill(row.Location || '');
    await page.waitForTimeout(1000);
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');

    // Contact and phone
    await page.locator('//input[@id="fName"]').fill(row.FName || '');
    await page.locator('//input[@id="lName"]').fill(row.LName || '');
    await page.locator('//input[@id="phone"]').fill(row.Phone || '');

    // Effective date (ISO YYYY-MM-DD)
    const eff = page.locator('#effDate2');
    // Format fallback date as DD/MM/YYYY
    const today = new Date();
    const formattedDate = `${String(today.getDate()).padStart(2, '0')}/${String(today.getMonth() + 1).padStart(2, '0')}/${today.getFullYear()}`;
    const effDate = row.EffectiveDate || formattedDate;
    await eff.fill(effDate);
    await eff.press('Tab');


    // Prior check
    await page.locator("//select[@id='priorCheck']").selectOption({ label: row.PriorCheck || '' });

    // Save & Close
    const saveButton = page.locator("//button[@id='onSave2']");
    await saveButton.click();

    // Wait for confirmation or page change
    try {
      await expect(page.locator("text=Saved successfully")).toBeVisible({ timeout: 5000 });
    } catch (e) {
      console.warn('Save toast not found; continuing but verify manually for this row.');
    }



    //APPLICATION DETAILS FORM FILLING

    console.log("Step 6: Application Details Test Started");

    await page.locator("//nb-accordion-item-header[.//span[normalize-space(text())='Application Details']]").click();
    await page.waitForTimeout(1000);
    await page.locator('//select[@id="typeOfFirmReId"]').selectOption({ label: row.typeOfFirmReId });
    await page.locator('//input[@id="profEarning1"]').fill(row.profEarning1 || '');
    await page.locator('//input[@id="profEarning2"]').fill(row.profEarning2 || '');
    await page.locator('//input[@id="annTrans"]').fill(row.annTrans || '');
    await page.waitForTimeout(1000);

    const totGrossrevPrior = page.locator('//input[@id="totGrossrevPrior"]');
    await totGrossrevPrior.click();
    await totGrossrevPrior.fill(""); // clear any old value
    await totGrossrevPrior.type(row.totGrossrevPrior?.toString() || "0", { delay: 100 });
    await page.waitForLoadState("networkidle", { timeout: 5000 });
    // Save & Close
    const AppsaveButton = page.locator("//button[@id='saveClose']");
    await expect(AppsaveButton).toBeEnabled();
    await AppsaveButton.click();
    await page.waitForTimeout(1000);



    // OPTIONAL COVERAGES
    console.log("Step 7: Optional Coverages Test Started");
    await page.locator("//nb-accordion-item-header[.//span[normalize-space(text())='Optional Coverages']]").click();
    await page.locator('//select[@id="cyber"]').selectOption({ label: 'No' });
    await page.waitForTimeout(1000);
    // Save & Close
    const OCsaveButton = page.locator("//button[@id='saveClose']");
    await expect(OCsaveButton).toBeEnabled();
    await OCsaveButton.click();
    await page.waitForTimeout(1000);

    // ENDORSEMENTS
    console.log("Step 8: Endorsements Test Started");
    await page.locator("//nb-accordion-item-header[.//span[normalize-space(text())='Endorsements']]").click();
    await page.waitForTimeout(2000);
    // Save & Close
    const EndorsementSaveButton = page.locator("//button[@id='saveClose']");
    await expect(EndorsementSaveButton).toBeEnabled();
    await EndorsementSaveButton.click();
    await page.waitForLoadState('networkidle', { timeout: 4000 });
    // Next
    await page.locator("//button[@id='next']").click();
    await page.waitForFunction(() => document.readyState === 'complete', null, { timeout: 5000 });
    await waitForFullPageLoad(page);


    //PURCHASED OPTIONS PAGE
    console.log("Step 9: Purchased Options Test Started");

    await page.locator("//label[@for='defaultInline_1_7_liability']").click();
    await page.locator("//button[@id='issuePolicy']").click();
    await page.waitForLoadState('networkidle', { timeout: 5000 });
    await page.locator("//button[@id='moveToAccounting']").click();
    await page.waitForLoadState('networkidle', { timeout: 5000 });
    await page.locator("//button[@id='accounting']").click();
    await page.waitForLoadState('networkidle', { timeout: 5000 });


    // PAYMENT PAGE
    console.log("Step 10: Payment Test Started");
    await page.locator("//span[normalize-space()='Payment']").click();


    console.log("Step 11: Capture Balance and Enter Amount Received Test Started");

    await page.waitForSelector("tr[class='bold ng-star-inserted'] td:nth-child(11)", { timeout: 15000 });// 1) Wait for the table to appear
    const rawBalance = await page.locator("tr[class='bold ng-star-inserted'] td:nth-child(11)").first().innerText(); // 2) Capture the balance from the row

    // 3) Normalize the captured text to a numeric string, "$597.00" -> "597.00"
    const normalized = rawBalance.replace(/\s/g, '')           // remove whitespace
      .replace(/\$/g, '')          // remove dollar sign
      .replace(/,/g, '')           // remove commas
      .replace(/[^\d.()-]/g, ''); // keep digits, dot, minus/parens

    console.log('Captured balance:', rawBalance, '=>', normalized);

    // 4) Wait for Amount Received input - try a few common locators and pick the first that exists
    const amountLocators = [
      "//input[@placeholder='Amount Received']",
      "//input[@formcontrolname='amountReceived']",
      "//input[contains(@id,'amount') and contains(@id,'received')]",
      "//label[normalize-space()='Amount Received']/following::input[1]",
      "//input[contains(@placeholder,'Amount')]"
    ];

    let amountInput = null;
    for (const sel of amountLocators) {
      const loc = page.locator(sel);
      if (await loc.count() > 0) {
        amountInput = loc.first();
        break;
      }
    }
    if (!amountInput) {
      throw new Error('Could not find Amount Received input. Update selectors in script.');
    }

    // 5) Click/type/fill to make sure Angular/React pick up change
    await amountInput.click();
    await amountInput.fill('');              // clear any value
    await amountInput.type(normalized, { delay: 50 }); // simulate user typing
    await page.keyboard.press('Tab');        // trigger blur / validation

    // 6) Verify value is set (if input only stores numeric value)
    //    Use toHaveValue with normalized value or allow formatted variants

    console.log("Step 12: Finalizing Payment Test Started");
    await page.locator("//input[@id='checkNumber']").fill('541516543213');
    await page.locator("//button[@id='autofill']").click();
    await page.locator("//button[@id=' Save & Issue']").click();
    await page.waitForTimeout(10000);


    // If app requires fresh start for next iteration, you can logout or navigate to base dashboard
    await page.goto('https://www.landydev.com/#/auth/login');




  }
});



























test('Riskid search and enter value', async ({ page }) => {
  enableAutoHighlight(page);
  enableAutoPageWait(page);

  // Navigate to login page
  await page.goto('https://www.landydev.com/#/auth/login');
  await expect(page).toHaveTitle("Landy Insurance App");

  //login credentials
  await page.locator('//input[@id="email"]').fill('sarankumar@stepladdersolutions.com');
  await page.locator('//input[@id="password"]').fill('Test@1234');
  await page.waitForLoadState('networkidle');
  await page.locator('//button[contains(text(), "Login")]').click();
  const successMessage = page.locator('text=Logged in Successfully');
  await expect(successMessage).toBeVisible({ timeout: 10000 }); // waits up to 10s
  await page.waitForLoadState("networkidle", { timeout: 3000 });

  await page.locator('//input[@id="globalSearch"]').fill('WOOD002');
  await page.locator('(//button[@id="search"])[1]').click();
  await page.waitForTimeout(6000);
  await page.locator('//tbody//td[3]').click();
  await page.waitForTimeout(6000);

  // //APPLICATION DETAILS FORM FILLING
  // await page.locator("//nb-accordion-item-header[.//span[normalize-space(text())='Application Details']]").click();
  // await page.locator('//select[@id="typeOfFirmReId"]').selectOption({ label: 'Corporation' });
  // await page.locator('//input[@id="profEarning1"]').fill('10');
  // await page.locator('//input[@id="profEarning2"]').fill('15');
  // await page.locator('//input[@id="annTrans"]').fill('20');

  // const totGrossrevPrior = page.locator('//input[@id="totGrossrevPrior"]');
  // await totGrossrevPrior.click();
  // await totGrossrevPrior.fill(""); // clear any old value
  // await totGrossrevPrior.type("50000", { delay: 100 }); // small delay triggers API calls

  // await page.waitForLoadState("networkidle", { timeout: 5000 });

  // // Click SAVE & CLOSE button
  // const AppsaveButton = page.locator("//button[@id='saveClose']");
  // await expect(AppsaveButton).toBeEnabled();
  // await AppsaveButton.click();



  // //OPTIONAL COVERAGES FORM FILLING
  // await page.locator("//nb-accordion-item-header[.//span[normalize-space(text())='Optional Coverages']]").click();
  // await page.locator('//select[@id="cyber"]').selectOption({ label: 'No' });

  // // Click SAVE & CLOSE button
  // const OCsaveButton = page.locator("//button[@id='saveClose']");
  // await expect(OCsaveButton).toBeEnabled();
  // await OCsaveButton.click();

  // //ENDORSEMENTS FORM FILLING
  // await page.locator("//nb-accordion-item-header[.//span[normalize-space(text())='Endorsements']]").click();
  // await page.waitForLoadState("networkidle", { timeout: 5000 });
  // // Click SAVE & CLOSE button
  // const EndorsementSaveButton = page.locator("//button[@id='saveClose']");
  // await expect(EndorsementSaveButton).toBeEnabled();
  // await EndorsementSaveButton.click();


  await page.locator("//button[@id='next']").click();
  await page.waitForFunction(() => document.readyState === 'complete', null, { timeout: 5000 });


  //PURCHASED OPTIONS PAGE
  await page.locator("//label[@for='defaultInline_1_7_liability']").click();
  await page.locator("//button[@id='issuePolicy']").click();
  await page.waitForTimeout(3000);
  await page.locator("//button[@id='moveToAccounting']").click();
  await page.waitForTimeout(4000);
  await page.locator("//button[@id='accounting']").click();
  await page.waitForTimeout(5000);


  // PAYMENT PAGE
  await page.locator("//span[normalize-space()='Payment']").click();



  // 1) Wait for the table to appear
  await page.waitForSelector("tr[class='bold ng-star-inserted'] td:nth-child(9)", { timeout: 15000 });

  // 2) Capture the balance from the row containing the producer 'HHL01-A'
  //    (change 'HHL01-A' to a unique text present in that same row if needed)
  const rawBalance = await page.locator(
    "tr[class='bold ng-star-inserted'] td:nth-child(9)"
  ).first().innerText();

  // 3) Normalize the captured text to a numeric string, e.g. "$597.00" -> "597.00"
  const normalized = rawBalance.replace(/\s/g, '')           // remove whitespace
    .replace(/\$/g, '')          // remove dollar sign
    .replace(/,/g, '')           // remove commas
    .replace(/[^\d.()-]/g, ''); // keep digits, dot, minus/parens

  console.log('Captured balance:', rawBalance, '=>', normalized);

  // 4) Wait for Amount Received input - try a few common locators and pick the first that exists
  const amountLocators = [
    "//input[@placeholder='Amount Received']",
    "//input[@formcontrolname='amountReceived']",
    "//input[contains(@id,'amount') and contains(@id,'received')]",
    "//label[normalize-space()='Amount Received']/following::input[1]",
    "//input[contains(@placeholder,'Amount')]"
  ];

  let amountInput = null;
  for (const sel of amountLocators) {
    const loc = page.locator(sel);
    if (await loc.count() > 0) {
      amountInput = loc.first();
      break;
    }
  }
  if (!amountInput) {
    throw new Error('Could not find Amount Received input. Update selectors in script.');
  }

  // 5) Click/type/fill to make sure Angular/React pick up change
  await amountInput.click();
  await amountInput.fill('');              // clear any value
  await amountInput.type(normalized, { delay: 50 }); // simulate user typing
  await page.keyboard.press('Tab');        // trigger blur / validation

  // 6) Verify value is set (if input only stores numeric value)
  //    Use toHaveValue with normalized value or allow formatted variants

  await page.locator("//input[@id='checkNumber']").fill('541516543213');
  await page.locator("//button[@id='autofill']").click();
  await page.locator("//button[@id=' Save & Issue']").click();


});




