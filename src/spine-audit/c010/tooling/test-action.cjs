const { chromium } = require('playwright-core');
(async()=>{
 const browser=await chromium.launch({headless:true, executablePath:'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', args:['--disable-gpu']});
 const page=await browser.newPage({viewport:{width:1100,height:1200}});
 const errors=[]; page.on('pageerror', e=>errors.push(e.message)); page.on('console', m=>{if(m.type()==='error'&&!m.text().includes('favicon')) errors.push(m.text())});
 await page.goto('http://127.0.0.1:4173/spine-audit/c010/index.html'); await page.waitForTimeout(1200);
 await page.getByRole('button',{name:'生成 foam_wipe'}).click(); await page.waitForTimeout(850);
 const mid=await page.locator('#state').textContent(); await page.screenshot({path:'prototype-foam-wipe.png',fullPage:true});
 await page.waitForTimeout(2200); const end=await page.locator('#state').textContent();
 console.log(JSON.stringify({mid,end,errors},null,2)); await browser.close();
})();
