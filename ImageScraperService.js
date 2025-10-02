import puppeteer from 'puppeteer';
import pLimit from 'p-limit';

import { fetchHervisImagesAsync } from './modells/Hervis.js';
import { fetchSportissimoImagesAsync } from './modells/Sportissimo.js';
import { fetchSinsayImagesAsync } from './modells/Sinsay.js';

export const filters = {
    minPrice: "4000",
    maxPrice: "5000",
	size:"M",
	numberOfPagesToFetch:{
		hervis: 1,
		sinsay: 2,
		sportissimo: 3
	},
	blackListedWebsite:[
	]
};



export async function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getImagesAsync(page, divSelector, linkSelector, priceSelector, priceFilter, productImageSelector) {
	const items = await page.evaluate((tag1, tag2, tag3, pricefilterString, imageSelector) => {
		const priceFilter = new RegExp(pricefilterString, 'i');
		const item = document.querySelector(tag1).querySelector(tag2).querySelectorAll('a');
		const prices = document.querySelector(tag1).querySelectorAll(tag3);
		return [...item].map((img, index) => {
			const imgs = img.querySelector(imageSelector).querySelector('img');
			const priceElement = prices[index];
			const text = priceElement.textContent;
			const match = text.match(priceFilter);

			let price = null;
			if (match) {
				price = match[0].replaceAll(/\s/g, '');
			}

			return {
				href: img.href || null,
				src: imgs ? imgs.src : null,
				price,
			};
		});
	}, divSelector, linkSelector, priceSelector, priceFilter.source, productImageSelector);

	return items;
}


export async function Search(searchword) {

	const browser = await puppeteer.launch({
		headless: true,
		defaultViewport: false,
	});

	const context = browser.defaultBrowserContext();

	//Every time a new page is created it automatically blocks the images for faster load. 

	context.on('targetcreated', async target => {
		if(target.type() === 'page'){
			const newPage = await target.page();
			await newPage.setRequestInterception(true);
			newPage.on('request', request => {
				if(request.resourceType() === 'image'){
					request.abort();
				}else{
					request.continue();
				}
			})
		}
	})


	const limit = pLimit(3);

	const sites = [
		{name: "hervis", function: fetchHervisImagesAsync, pagesToFetch: filters.numberOfPagesToFetch.hervis},
		{name: "sportissimo", function: fetchSportissimoImagesAsync, pagesToFetch: filters.numberOfPagesToFetch.sportissimo},
		{name: "sinsay", function: fetchSinsayImagesAsync, pagesToFetch: filters.numberOfPagesToFetch.sinsay}
	];
	
	console.log('Started scraping websites in parallel.');
	const start = Date.now();
	const tasks = sites.filter(s => !filters.blackListedWebsite.includes(s.name))
	.map(site => limit(async () => {
		const page = await browser.newPage();
		const start = Date.now();
		const images = await site.function(searchword, page, site.pagesToFetch);
		const end = Date.now();
		console.log(`Finished scraping ${site.name} in ${(end - start) / 1000} seconds`);
		await page.close();
		return images;
	}));
		

	const allImages = await Promise.all(tasks);
	const end = Date.now();
	console.log(`Runtime for ${sites.length} websites took ${(end - start) / 1000} seconds`);
	
	await browser.close();
	
	return allImages;
}

//console.log(await Search("Kék felső"));
//await Search("Kék felső");









