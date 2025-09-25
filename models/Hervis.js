import {config} from '../configuration/config.js';
import { filters,sleep,getImagesAsync } from '../ImageScraperService.js';

const hervisWebsite = config.websites["hervis"];

function encodeSearchItemWithFilteringAsync(searchedItem, url, filters = {}){
    const searchedItemPart = encodeURIComponent(searchedItem);

    let baseURL = `${url}${searchedItemPart}`;
    
    if(!filters.minPrice && !filters.maxPrice){
		console.log(`Returning baseURL(no filter): ${baseURL}`);
        return baseURL;
    }

    let queryPart = searchedItem;

	if(filters.size){
		queryPart += `::sizesInStockplain:${filters.size}:`;
	}

    if(filters.minPrice && filters.maxPrice){
        queryPart += `::price:[${filters.minPrice}.00 - ${filters.maxPrice}.00]`;
    }


    const encodedQuery = encodeURIComponent(queryPart)
    .replace(/%3A%3A/g, "::")
    .replace(/%3A/g, ":")
    .replace(/%5B/g, "[")
    .replace(/%5d/g, "]");
    
    baseURL += `?query=${encodedQuery}`;
	console.log(`The whole url is: ${baseURL}`);
    return baseURL;
}

export async function fetchHervisImages(searchword, page, numberOfItemsToFetch){
    const foundPage = await encodeSearchItemWithFilteringAsync(searchword, hervisWebsite.baseUrl, filters);
    await page.goto(foundPage);

    await sleep(1500);

	const cookiedeny = await page.evaluateHandle((tag1, tag2) => {
		const host = document.querySelector(tag1);
		const shadow = host.shadowRoot;
		return shadow.querySelector(tag2);
	}, hervisWebsite.denyCookieSelector, hervisWebsite.shadowCookieDenyButton);

	await cookiedeny.click();
	const regex = /\s+(\d{1,3}(?:\s\d{3})*)/;	await sleep(1500);

	const items = await getImagesAsync(page, hervisWebsite.wholePageSelector, hervisWebsite.urlTagSelector, hervisWebsite.priceTagSelector, regex, hervisWebsite.productImageSelector);

	const selected = items.slice(0, numberOfItemsToFetch);
	const finalImages = {
		websiteName: 'Hervis',
		FoundImages: selected,
	};
	return finalImages;
}