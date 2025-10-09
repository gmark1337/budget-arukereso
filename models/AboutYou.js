import { sleep, getImagesAsync } from '../ImageScraperService.js';
import { config } from '../configuration/config.js';
const websiteConfig = config.websites["aboutYou"];

//console.log(websiteConfig)

async function inputSearchWordAsync(page, searchword, searchbarSelector) {
    await page.click(searchbarSelector);
    await page.keyboard.type(searchword);
    await page.keyboard.press('Enter');
}


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