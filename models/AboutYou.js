import { sleep, getImagesAsync } from '../ImageScraperService.js';
import { config } from '../configuration/config.js';
const websiteConfig = config.websites["aboutYou"];

//console.log(websiteConfig)

async function inputSearchWordAsync(page, searchword, searchbarSelector) {
    await page.click(searchbarSelector);
    await page.keyboard.type(searchword);
    await page.keyboard.press('Enter');
}
//TODO
/*
async function setPriceRange(page, minPrice, maxPrice){
    await page.$eval('.sc-93a4b07e-0.eIQHyk .c1cc265k', el=> el.click());
    await page.$eval('[data-testid="minimumInput"]', e=> {
        e.setAttribute("value", 2500);
    });
    await page.click('[data-testid="minimumInput"]')
    //await page.keyboard.press('Enter');
    await page.$eval('[data-testid="maximumInput"]', e=> {
        e.setAttribute("value", 15000);
    });
    //await page.keyboard.press('Enter');
    //const maxInput = await page.$('[data-testid="maximumInput"]');

    //await minInput.click({clickCount : 2});
    //await minInput.type(minPrice);

    //await maxInput.click({clickCount : 2});
    // await maxInput.type(maxPrice);
}

async function setSize(page, size){
    await page.$$eval('.w1dia7d2 .wzhwzci', (elements, index) => {
  elements[index].click();
}, 3);
}*/


export async function fetchAboutYouImagesAsync(searchword, page, numberOfItemsToFetch) {
    try {


        await page.goto(websiteConfig.baseUrl, { waitUntil: "networkidle2" });

        await inputSearchWordAsync(page, searchword, websiteConfig.searchBarSelector);
        try {
            await page.waitForSelector(websiteConfig.titleContentSelector, { timeout: 5000 });
        } catch (error) {
            console.error(`[fetchAboutYouImagesAsync] Timeout waiting for container selector: ${error.message}`);
            return {
                websiteName: 'aboutYou',
                FoundImages: []
            };
        }
        const regex = /[\d.]+/;
        const images = await getImagesAsync(page, websiteConfig.containerSelector, websiteConfig.productPriceSelector, regex, websiteConfig.productImageSelector, websiteConfig.titleContentSelector);

        const selected = images.slice(0, numberOfItemsToFetch);
        const finalImages = {
            websiteName: 'aboutYou',
            FoundImages: selected
        };
        return finalImages;
    } catch (error) {
        console.error(`[fetchAboutYouImagesAsync] Failed to fetch images:  ${error.message}`);
        return {
            websiteName: 'aboutYou',
            FoundImages: []
        };
    }
}