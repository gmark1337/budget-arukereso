import { config } from '../configuration/config.js'
import { getImagesWithDoubleAnchorTagAsync } from '../services/ImageScraperService.js';

const sinsayWebsite = config.websites["sinsay"];
const filters = config.filters;


function encodeSearchItemWithFilteringAsync(searchedword, url, filters = {}) {
    const params = [];

    if (searchedword) {
        params.push(`query=${searchedword.replace(/\s+/g, "-")}`);
    }

    if (filters.size) {
        params.push(`sizes=${filters.size}`);
    }

    if (filters.minPrice && filters.maxPrice) {
        params.push(`price=${filters.minPrice}%3A${filters.maxPrice}`);
    }
    const queryString = params.join("&");
    return `${url}?${queryString}`;
}


export async function fetchSinsayImagesAsync(searchword, page, numberOfItemsToFetch) {
    try {
        const foundPage = await encodeSearchItemWithFilteringAsync(searchword, sinsayWebsite.baseUrl, filters);

        //console.log(`The created URL is: ${foundPage}`);

        await page.goto(foundPage, { waitUntil: "domcontentloaded" });
        try {
            await page.waitForSelector(sinsayWebsite.containerSelector, { timeout: 5000 });
        } catch (error) {
            console.error(`[fetchSinsayImagesAsync] Timeout waiting for container selector: ${error.message}\nReloading page...`);
            await page.reload();
        }

        const regex = /([\d\s]+)(?=HUF)/;
        const items = await getImagesWithDoubleAnchorTagAsync(page, sinsayWebsite.containerSelector, sinsayWebsite.elementSelector, sinsayWebsite.productPriceSelector, sinsayWebsite.titleContentSelector, regex);
        if (items === null) {
            await page.reload({ waitUntil: "networkidle2" })
        }
        const selected = items.slice(0, numberOfItemsToFetch);
        const finalImages = {
            websiteName: 'Sinsay',
            FoundImages: selected
        };
        return finalImages;
    } catch (error) {
        console.error(`[fetchSinsayImagesAsync] Failed to fetch images:  ${error.message}`);
        return {
            websiteName: 'Sinsay',
            FoundImages: []
        };
    }
}
