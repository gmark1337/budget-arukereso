import { sleep, getImagesAsync } from '../services/ImageScraperService.js';
import { config } from '../configuration/config.js';
const websiteConfig = config.websites["aboutYou"];
const filters = config.filters;

import fs from 'node:fs';

//console.log(websiteConfig)

const KIDLETTERSIZESTONUMBERSIZES = new Map([
    ['XXXS', 39885],
    ['XXS', 39888],
    ['XS', 39891],
    ['S', 39894],
    ['M', 39897],
    ['L', 39900],
    ['XL', 39903],
    ['XXL', 39906],
    ['XXXL', 39909]
]);

const WOMANLETTERSIZESTONUMBERSIZES = new Map([
    ['XXXS', 39081],
    ['XXS', 39084],
    ['XS', 39087],
    ['S', 39090],
    ['M', 39093],
    ['L', 39096],
    ['XL', 39099],
    ['XXL', 39102],
    ['XXXL', 39108]
]);
const MANLETTERSIZESTONUMBERSIZES = new Map([
    ['XXXS', 39537],
    ['XXS', 39540],
    ['XS', 39543],
    ['S', 39546],
    ['M', 39549],
    ['L', 39552],
    ['XL', 39555],
    ['XXL', 39558],
    ['XXXL', 39561]
]);


async function inputSearchWordAsync(page, searchword, searchbarSelector) {
    await page.click(searchbarSelector);
    await page.keyboard.type(searchword);
    await page.keyboard.press('Enter');
}

function addFilteringToExistUrl(url, filters = {}) {
    const params = [];
    let paramPrefix = url.includes('?') ? '&' : '?';    

    if (MANLETTERSIZESTONUMBERSIZES.has(filters.size)) {
        switch (url.split('/')[4]) {
            case 'noi':
                params.push(`${paramPrefix}defFemaleInt=${WOMANLETTERSIZESTONUMBERSIZES.get(filters.size)}`);
                break;
            case 'ferfi':
                params.push(`${paramPrefix}defMaleInt=${MANLETTERSIZESTONUMBERSIZES.get(filters.size)}`);
                break;
            default:
                params.push(`${paramPrefix}defKidsInt=${KIDLETTERSIZESTONUMBERSIZES.get(filters.size)}`);
                break;
        };
    }

    if (filters.minPrice && filters.maxPrice) {
        if(!MANLETTERSIZESTONUMBERSIZES.has(filters.size)){
            params.push(`${paramPrefix}prices=${filters.minPrice}00-${filters.maxPrice}00`);
        }else{
            params.push(`prices=${filters.minPrice}00-${filters.maxPrice}00`);
        }
    }

    const queryString = params.join('&');
    return `${url}${queryString}`;
}


export async function fetchAboutYouImagesAsync(searchword, page, numberOfItemsToFetch) {
    try {
        await page.setViewport({
            width: 764,
            height: 2000,
            deviceScaleFactor: 1
        });

        await page.goto(websiteConfig.baseUrl, { waitUntil: 'domcontentloaded' });

        await inputSearchWordAsync(page, searchword, websiteConfig.searchBarSelector);

        try {
            await page.waitForSelector(websiteConfig.titleContentSelector, { timeout: 5000 });
        } catch (error) {
            console.error(`[fetchAboutYouImagesAsync] Timeout waiting for titleContent selector: ${error.message}\n Reloading page...`);
            await page.reload();
        }
        const currentPageUrl = page.url();
        const filteredUrl = addFilteringToExistUrl(currentPageUrl, filters);
        //console.log(filteredUrl);

        await page.goto(filteredUrl, { waitUntil: 'domcontentloaded' });

        try {
            await page.waitForSelector(websiteConfig.titleContentSelector, { timeout: 5000 });
        } catch (error) {
            console.error(`[fetchAboutYouImagesAsync] Timeout waiting for titleContent selector: ${error.message}\n Reloading page...`);
            await page.reload();
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