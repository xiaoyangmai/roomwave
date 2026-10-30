const { chromium } = require('playwright-core');
(async()=>{
 const browser=await chromium.launch({headless:true, executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', args:['--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1100,height:1200}});
 page.on('console', m=>console.log('CONSOLE',m.type(),m.text()));
 page.on('pageerror', e=>console.log('PAGEERROR',e.stack||e.message));
 page.on('requestfailed', r=>console.log('REQUESTFAILED',r.url(),r.failure()?.errorText));
 await page.goto('http://127.0.0.1:4173/spine-audit/c010/index.html');
 await page.waitForTimeout(4000);
 console.log('AUDIT',await page.locator('#audit').textContent());
 console.log('STATE',await page.locator('#state').textContent());
 console.log('BUTTONS',await page.locator('button').allTextContents());
 await page.screenshot({path:'prototype-playwright.png',fullPage:true});
 await browser.close();
})();
