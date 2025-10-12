import puppeteer from "puppeteer";
import { sleep } from "../ImageScraperService.js";


async function inputSearchWordAsync(page, searchword, searchbarSelector) {
    await page.click(searchbarSelector);
    await sleep(5000);
    await page.keyboard.type(searchword);
    await sleep(5000);
    await page.keyboard.press('Enter');
}

const browser = await puppeteer.launch({
    headless:false,
    defaultViewport:false,
});



const page = await browser.newPage();

export async function fetchSheinImagesAsync(page, searword, numberOfItemsToFetch){
    await page.goto("https://euqs.shein.com", {waitUntil: "networkidle2"});
/*
    await page.setRequestInterception(true);
page.on('request', req => {
  const url = req.url().toLowerCase();
    
  // Block known problematic keywords / domains
  if (
    url.includes('captcha') ||
    url.includes('challenge') ||
    url.includes('risk') ||
    url.includes('doubleclick.net') ||
    url.includes('googlesyndication') ||
    url.includes('get_abt_by_poskey') ||
    url.endsWith('.mp4') // example: block videos
  ) {
    console.log('Blocked:', url)
    return req.abort();

  }

  req.continue();
});
*/
    console.log(await page.evaluate(() => navigator.userAgent))
    
    await page.waitForSelector('.btn-new', { timeout: 5000 })
    await sleep(500);
    await page.click('.btn-new')
    await sleep(500);
    await inputSearchWordAsync(page, "kék felső", '.search-box');
    await page.solveRecaptchas();
}

await fetchSheinImagesAsync(page);


//console.log(decodeURIComponent("https://euqs.shein.com/pdsearch/kék%20felső/?ici=s1`EditSearch`kék%20felső`_fb`d0`PageHome&search_source=1&search_type=all&source=search&src_identifier=st%3D2%60sc%3Dkék%20felső%60sr%3D0%60ps%3D1&src_identifier_pre_search=&src_module=search&src_tab_page_id=page_home1760127602464"));
//console.log(decodeURIComponent("https://euqs.shein.com/risk/challenge?captcha_type=905&redirection=https%3A%2F%2Feuqs.shein.com%2Fpdsearch%2Fk%25C3%25A9k%2520fels%25C5%2591%2F&risk-id=E4663279295322168704"));