// @ts-check
import { test, expect } from '@playwright/test';
import { enableAutoHighlight } from '../../utils/highlightActions.js';
import { enableAutoPageWait } from '../../utils/globalWaitPatch.js';
import { waitForFullPageLoad } from '../../utils/waitUtils.js';
import { readExcel, excelPathFromProject } from '../../utils/excelUtils.js';
import { selectMultiCheckbox } from '../../utils/dropdownHelper.js';
const XLSX = require('xlsx');


test('ACSTD-Direct Excel', async ({ page }) => {
    enableAutoHighlight(page);
    enableAutoPageWait(page);

    // load data from ACSTD
    const file = excelPathFromProject('tests', 'data', 'UpcomingRenewal.xlsx');

    // Load ACSTD
    // @ts-ignore
    const rows = await readExcel(file, "ACSTD");
    console.log("Rows from ACSTD:", rows.length);


    // optional: limit for debugging
    // const rowsToRun = rows.slice(0, 5);
    const rowsToRun = rows;

    for (const row of rowsToRun) {
        console.log(`\n--- Running for state: ${row.State} | Producer: ${row.ProducerCode} ---`);


        // LOGIN CREDENTIALS
        console.log("Step 1: Application Details Test Started");
        await page.goto('https://www.landydev.com/#/auth/login');
        await expect(page).toHaveTitle('Landy Insurance App');

        await page.locator('//input[@id="email"]').fill('sarankumar@stepladdersolutions.com');
        await page.locator('//input[@id="password"]').fill('Test@123');
        await page.locator('//button[contains(text(), "Login")]').click();
        await expect(page.locator('text=Logged in Successfully')).toBeVisible({ timeout: 10000 });


        // // Risk ID Search and Selection 
        // await page.locator('//input[@id="globalSearch"]').fill('QUEU003');
        // await page.locator('(//button[@id="search"])[1]').click();
        // await page.waitForLoadState("networkidle", { timeout: 15000 });
        // await page.locator('//tbody//td[3]').first().click();
        // await page.waitForLoadState("networkidle", { timeout: 15000 });


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


        // Today in YYYY-MM-DD format
        const Effectivetoday = new Date().toISOString().split('T')[0];
        await page.locator('#effDate1').fill(Effectivetoday);
        await page.locator('#effDate1').press('Tab');


        // Prior check
        await page.locator("//select[@id='priorCheck']").selectOption({ label: row.PriorCheck || '' });

        // Save & Close
        const saveButton = page.locator("//button[@id='onSave2']");
        await saveButton.click();

        // Wait for confirmation or page change
        try {
            await expect(page.locator("text=Saved successfully")).toBeVisible({ timeout: 6000 });
        } catch (e) {
            console.warn('Save toast not found; continuing but verify manually for this row.');
        }


        //APPLICATION DETAILS FORM FILLING

        console.log("Step 6: Application Details Test Started");

        await page.locator("//nb-accordion-item-header[.//span[normalize-space(text())='Application Details']]").click();
        await page.waitForTimeout(500);
        await page.locator('//select[@id="typeOfFirmReId"]').selectOption({ label: row.typeOfFirmReId });
        await page.locator('//input[@id="ftCpa"]').fill(row.ftCpa || '');
        await page.locator('//input[@id="ftNonCpa"]').fill(row.ftNonCpa || '');
        await page.locator('#ptCPA').fill(row.ptCPA || '');
        await page.locator('//input[@id="ptNonCpa"]').fill(row.ptNonCpa || '');
        await page.locator('//input[@id="ftAdmin"]').fill(row.ftAdmin || '');
        await page.locator('//input[@id="ptAdmin"]').fill(row.ptAdmin || '');


        //Grossrevenue
        const Grossrevenue = page.locator('//input[@id="grossRevenue"]');
        await Grossrevenue.click();
        await Grossrevenue.fill(""); // clear any old value
        await Grossrevenue.type(row.Grossrevenue?.toString() || "0", { delay: 100 });
        await page.waitForLoadState("networkidle", { timeout: 5000 });

        // Save & Close
        const AppsaveButton = page.locator("//button[@id='saveClose']");
        await expect(AppsaveButton).toBeEnabled();
        await AppsaveButton.click();
        await page.waitForLoadState("networkidle", { timeout: 15000 });



        //AREAS OF PRACTICE
        console.log("Step 7: Areas of Practice Test Started");
        await page.locator("//nb-accordion-item-header[.//span[normalize-space(text())='Areas of Practice']]").click();
        await page.waitForLoadState("networkidle");

        //AOP%
        const AOP = page.locator('(//input[@name="value"])[1]');
        await AOP.click();
        await AOP.fill(""); // clear any old value
        await AOP.type(row.AOP?.toString() || "0", { delay: 100 });
        await page.waitForLoadState("networkidle", { timeout: 5000 });

        // Save & Close
        const AopsaveButton = page.locator("//button[@id='saveClose']");
        await expect(AopsaveButton).toBeEnabled();
        await AopsaveButton.click();
        await page.waitForLoadState("networkidle", { timeout: 15000 });



        // OPTIONAL COVERAGES
        console.log("Step 8: Optional Coverages Test Started");
        await page.locator("//nb-accordion-item-header[.//span[normalize-space(text())='Optional Coverages']]").click();

        await page.locator("//select[@id='epli']").selectOption({ label: row.epli });


        await page.locator('#cyber').selectOption({ label: row.cyber });
        // await page.locator('(//nb-accordion-item[4]//select)[3]').selectOption({ label: row.ResidentialRealProperty });
        // await page.locator('(//nb-accordion-item[4]//select)[4]').selectOption({ label: row.OwnedResidentialProperty });
        // await page.locator('(//nb-accordion-item[4]//select)[5]').selectOption({ label: row.HigherDiscriminationLimit });
        // await page.locator('(//nb-accordion-item[4]//select)[6]').selectOption({ label: row.FungiBacterialSubLimit });
        // await page.locator('(//nb-accordion-item[4]//select)[7]').selectOption({ label: row.ConstructionDevelopment });
        // await page.locator('(//nb-accordion-item[4]//select)[8]').selectOption({ label: row.BI_PDCoverageLimit });
        // await page.locator('(//select[@id="fundTc"])[1]').selectOption({ label: row.FI_FTCoverage });
        await page.waitForLoadState("networkidle", { timeout: 15000 });

        //select[@id='appraiserService']
        // await page.locator('//select[@id="appraiserService"]').selectOption({ label: row.FI_FTCoverage });

        // Save & Close
        const OCsaveButton = page.locator("//button[@id='saveClose']");
        await expect(OCsaveButton).toBeEnabled();
        await OCsaveButton.click();
        await page.waitForLoadState("networkidle", { timeout: 15000 });


        // CLAIM INFORMATION
        console.log("Step 9: Claim Information Test Started");
        await page.locator("//nb-accordion-item-header[.//span[normalize-space(text())='Claim Information']]").click();

        await page.waitForLoadState("networkidle", { timeout: 15000 });
        const ClaimSaveButton = page.locator("//button[@id='saveClose']");
        await expect(ClaimSaveButton).toBeEnabled();
        await ClaimSaveButton.click();
        await page.waitForLoadState("networkidle", { timeout: 15000 });

        //INDIVIDUAL RISK MANAGEMENT
        console.log("Step 10: Individual Risk Management Test Started");
        await page.locator("//nb-accordion-item-header[.//span[normalize-space(text())='Individual Risk Management']]").click();

        await page.waitForLoadState("networkidle", { timeout: 15000 });
        const IrmSaveButton = page.locator("//button[@id='saveClose']");
        await expect(IrmSaveButton).toBeEnabled();
        await IrmSaveButton.click();
        await page.waitForLoadState("networkidle", { timeout: 15000 });



        // QUOTE SELECTION & CONTINGENCIES new code for my reference
        console.log("Step 11: Quote Selection & Contingencies Test Started");
        await page.locator("//nb-accordion-item-header[.//span[normalize-space(text())='Quote Selection & Contingencies']]").click();
        await page.waitForLoadState("networkidle", { timeout: 15000 });

        //Limit Dropdown
        if (row.Limit) {
            const limitDropdown = page.locator('ng-multiselect-dropdown[name="label"] span.dropdown-btn');
            await limitDropdown.click();

            const list = page.locator('ng-multiselect-dropdown[name="label"] .dropdown-list');
            await list.waitFor({ state: 'visible', timeout: 15000 });

            const safeLimit = row.Limit.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex chars
            const limitOption = list.getByText(new RegExp(`^\\s*${safeLimit}\\s*$`, 'i'));
            // await limitOption.scrollIntoViewIfNeeded();
            await limitOption.click();

            await limitDropdown.click();
            console.log(`Selected Limit: ${row.Limit}`);
        }

        // Deductible Dropdown
        if (row.Deductible) {
            const deductibleDropdown = page.locator('ng-multiselect-dropdown[name="deductable"] span.dropdown-btn');
            await deductibleDropdown.click();

            const list = page.locator('ng-multiselect-dropdown[name="deductable"] .dropdown-list');
            await list.waitFor({ state: 'visible', timeout: 15000 });

            const safeLimit = row.Deductible.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // escape regex chars
            const deductibleOption = list.getByText(new RegExp(`^\\s*${safeLimit}\\s*$`, 'i'));
            // await deductibleOption.scrollIntoViewIfNeeded();
            await deductibleOption.click();

            await deductibleDropdown.click();
            console.log(`✅ Selected Deductible: ${row.Deductible}`);
        }

        // Limit Type Dropdown
        if (row.LimitType) {
            const limitTypeDropdown = page.locator('ng-multiselect-dropdown[name="limitType"] span.dropdown-btn');
            await limitTypeDropdown.click();
            const list = page.locator('ng-multiselect-dropdown[name="limitType"] .dropdown-list');
            await list.waitFor({ state: 'visible', timeout: 10000 });

            const options = await list.allInnerTexts();
            console.log("Available options:", options);

            const limitTypeOption = list.getByText(new RegExp(`^\\s*${row.LimitType}\\s*$`, 'i'));
            await expect(limitTypeOption).toBeVisible({ timeout: 10000 });
            await limitTypeOption.click();

            await limitTypeDropdown.click();
            console.log(`✅ Selected Limit Type: ${row.LimitType}`);
        }

        // Deductible Type Dropdown
        if (row.DeductibleType) {
            const deductibleTypeDropdown = page.locator('ng-multiselect-dropdown[name="deductableType"] span.dropdown-btn');
            await deductibleTypeDropdown.click();
            const list = page.locator('ng-multiselect-dropdown[name="deductableType"] .dropdown-list');
            await list.waitFor({ state: 'visible', timeout: 10000 });
            // Debug log all visible options
            const options = await list.allInnerTexts();
            console.log("Available options:", options);
            // Case-insensitive and trims spaces
            const deductibleTypeOption = list.getByText(new RegExp(`^\\s*${row.DeductibleType}\\s*$`, 'i'));
            await expect(deductibleTypeOption).toBeVisible({ timeout: 10000 });
            await deductibleTypeOption.click();
            // Close dropdown
            await deductibleTypeDropdown.click();
            console.log(`✅ Selected Deductible Type: ${row.DeductibleType}`);
        }


        await page.waitForLoadState("networkidle", { timeout: 15000 });

        // Save and close
        const QSCSaveButton = page.locator("//button[@id='saveClose']");
        await expect(QSCSaveButton).toBeEnabled();
        await QSCSaveButton.click();
        await page.waitForLoadState("networkidle", { timeout: 15000 });

        console.log("✅ Quote Selection & Contingencies saved successfully");
        await page.waitForTimeout(5000);



        // ENDORSEMENTS
        console.log("Step 12: Endorsements Test Started");
        await page.locator("//nb-accordion-item-header[.//span[normalize-space(text())='Endorsements']]").click();
        await page.waitForLoadState("networkidle", { timeout: 15000 });

        // Click Save & wait for DOM update explicitly instead of relying on networkidle
        const EndorsementSaveButton = page.locator("//button[@id='saveClose']");
        await EndorsementSaveButton.click();

        // Wait until Rate button actually appears in DOM
        const rateButton = page.locator("//button[@id='nextStep']");
        await rateButton.waitFor({ state: 'attached', timeout: 30000 });
        await expect(rateButton).toBeVisible();
        await expect(rateButton).toBeEnabled();
        await rateButton.click();

        await page.waitForFunction(() => document.readyState === 'complete', null, { timeout: 5000 });
        await waitForFullPageLoad(page);
        await page.waitForLoadState('networkidle', { timeout: 10000 });

        //QUOTE MAIL
        const QuotemailButton = page.locator("(//button[@id='quoteDateDialog'])[2]");
        await QuotemailButton.waitFor({ state: 'attached', timeout: 30000 });
        await expect(QuotemailButton).toBeVisible();
        await expect(QuotemailButton).toBeEnabled();
        await QuotemailButton.click();


        // Today in YYYY-MM-DD format
        const Quotetoday = new Date().toISOString().split('T')[0];
        await page.locator('#quoteDate').fill(Quotetoday);
        await page.locator('#quoteDate').press('Tab');


        await page.locator("//button[@id='save']").click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });

        await page.locator("//button[@id='sendMail']").click();
        await page.waitForLoadState('networkidle', { timeout: 15000 });



        //PURCHASED OPTIONS PAGE
        console.log("Step 13: Purchased Options Test Started");

        await page.locator("label[for='defaultInline_0_0_100LO']").click();
        // await page.locator("//button[@id='issue']").click();
        // await page.waitForLoadState('networkidle', { timeout: 5000 });
        await page.locator("#proceed").click();
        await page.waitForLoadState('networkidle', { timeout: 5000 });
        await page.locator("//button[@id='accounting']").click();
        await page.waitForLoadState('networkidle', { timeout: 5000 });


        // PAYMENT PAGE
        console.log("Step 14: Payment Test Started");
        await page.locator("//span[normalize-space()='Payment']").click();


        console.log("Step 15: Capture Balance and Enter Amount Received Test Started");
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

        console.log("Step 16: Finalizing Payment Test Started");
        await page.locator("//input[@id='checkNumber']").fill('541516543213');
        await page.locator("//button[@id='autofill']").click();
        await page.locator("//button[@id=' Save & Issue']").click();
        await page.waitForTimeout(4000);

        console.log("Step 17: Policy Queued Test Started");
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
        // await page.goto('https://www.landydev.com/#/auth/login');


    }
});

