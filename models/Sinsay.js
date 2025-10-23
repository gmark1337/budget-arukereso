import { config } from '../configuration/config.js'
import { sleep } from '../ImageScraperService.js';

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


export async function getImagesAsync(page, tag1, tag2, tag3, tag4, regex) {
    try {
        const images = await page.evaluate((containerSelector, elementSelector, priceSelector, titleContentSelector, regex) => {
            try {
                const container = document.querySelector(containerSelector);
                if (!container){
                    console.error(`[getImagesAsync] Container selector not found! Skipping loop...`);
                    return []; 
                };

                const elements = container.querySelectorAll(elementSelector);
                const prices = container.querySelectorAll(priceSelector);
                const titles = container.querySelectorAll(titleContentSelector);
                const regexFilter = new RegExp(regex, 'i');

                return [...elements].map((div, index) => {
                    const link = div.querySelectorAll('a')[0] || null;
                    const imgEl = div.querySelector('img');
                    const priceElement = prices[index];
                    const titleElement = titles[index].textContent;
                    let price = null;
                    try {
                        if (priceElement) {
                            const text = priceElement.textContent || '';
                            const match = text.match(regexFilter);
                            if (match) {
                                price = match[0].replace(/\s/g, '');
                            }
                        }
                    } catch (error) {
                        console.error(`[getImagesAsync] Sudden error occurred while extracting item data:`, error.message);
                    }
                    return {
                        href: link ? link.href : null,
                        src: imgEl ? imgEl.src : null,
                        price: price,
                        title: titleElement
                    };
                });
            } catch (error) {
                console.error(`[getImagesAsync] Error inside page.evaluate:`, err.message);
                return [];
            }
        }, tag1, tag2, tag3, tag4, regex.source);
        return images;
    } catch (error) {
        console.error(`[getImagesAsync] Sudden error occurred while trying to run getImageSync `, error.message);
        return images;
    }
}

export async function fetchSinsayImagesAsync(searchword, page, numberOfItemsToFetch) {
    try {
        const foundPage = await encodeSearchItemWithFilteringAsync(searchword, sinsayWebsite.baseUrl, filters);

        console.log(`The created URL is: ${foundPage}`);

        await page.goto(foundPage, { waitUntil: "domcontentloaded" });
        try {
            await page.waitForSelector(sinsayWebsite.containerSelector, { timeout: 5000 });
        } catch (error) {
            console.error(`[fetchSinsayImagesAsync] Timeout waiting for container selector: ${error.message}`);
            return {
                websiteName: 'Sinsay',
                FoundImages: [],
            }
        }

        const regex = /([\d\s]+)(?=HUF)/;
        const items = await getImagesAsync(page, sinsayWebsite.containerSelector, sinsayWebsite.elementSelector, sinsayWebsite.productPriceSelector, sinsayWebsite.titleContentSelector, regex);
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
