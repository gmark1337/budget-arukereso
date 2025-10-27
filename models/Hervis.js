import { config } from '../configuration/config.js';
import { sleep, getImagesAsync } from '../services/ImageScraperService.js';

const hervisWebsite = config.websites["hervis"];
const filters = config.filters;
function encodeSearchItemWithFilteringAsync(searchedItem, url, filters = {}) {
    const searchedItemPart = encodeURIComponent(searchedItem);

    let baseURL = `${url}${searchedItemPart}`;

    if (!filters.minPrice && !filters.maxPrice) {
        //console.log(`Returning baseURL(no filter): ${baseURL}`);
        return baseURL;
    }

    let queryPart = searchedItem;

    if (filters.size) {
        queryPart += `::sizesInStockplain:${filters.size}:`;
    }

    if (filters.minPrice && filters.maxPrice) {
        queryPart += `::price:[${filters.minPrice}.00 - ${filters.maxPrice}.00]`;
    }


    const encodedQuery = encodeURIComponent(queryPart)
        .replace(/%3A%3A/g, "::")
        .replace(/%3A/g, ":")
        .replace(/%5B/g, "[")
        .replace(/%5d/g, "]");

    baseURL += `?query=${encodedQuery}`;
    // console.log(`The whole url is: ${baseURL}`);
    return baseURL;
}

export async function fetchHervisImagesAsync(searchword, page, numberOfItemsToFetch) {
    try {
        const foundPage = await encodeSearchItemWithFilteringAsync(searchword, hervisWebsite.baseUrl, filters);
        await page.goto(foundPage, { waitUntil: "domcontentloaded" });

        //console.log(`The created URL is: ${foundPage}`);


        const regex = /\s+(\d{1,3}(?:\s\d{3})*)/;
        //await sleep(1500);
        try {
            await page.waitForSelector(hervisWebsite.containerSelector, { timeout: 5000 });

        } catch (error) {
            console.error(`[fetchHervisImagesAsync] Timeout waiting for container selector: ${error.message}`);
            return {
                websiteName: 'Hervis',
                FoundImages: [],
            }
        }


        const items = await getImagesAsync(page, hervisWebsite.containerSelector, hervisWebsite.priceTagSelector, regex, hervisWebsite.productImageSelector, hervisWebsite.titleContentSelector);

        const selected = items.slice(0, numberOfItemsToFetch);
        const finalImages = {
            websiteName: 'Hervis',
            FoundImages: selected,
        };
        return finalImages;
    } catch (error) {
        console.error(`[fetchHervisImagesAsync] Failed to fetch images:  ${error.message}`);
        return {
            websiteName: 'Hervis',
            FoundImages: []
        };
    }
}