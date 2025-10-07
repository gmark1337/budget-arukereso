import puppeteer from 'puppeteer';
import pLimit from 'p-limit';

import { fetchHervisImagesAsync } from './models/Hervis.js';
import { fetchSportissimoImagesAsync } from './models/Sportissimo.js';
import { fetchSinsayImagesAsync } from './models/Sinsay.js';
import {config} from './configuration/config.js'


const filters = config.filters;
const allowedConsoleLogs = config.allowedConsoleLogs;


export async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}

export async function getImagesAsync(page, divSelector, linkSelector, priceSelector, priceFilter, productImageSelector, titleSelector) {
	try {
		const items = await page.evaluate((tag1, tag2, tag3, pricefilterString, imageSelector, titleSelector) => {
			try {
				const priceFilter = new RegExp(pricefilterString, 'i');
				const item = document.querySelector(tag1).querySelector(tag2).querySelectorAll('a');
				if(!item){
					throw new Error(`[getImagesAsync] Selectors not found: ${tag1} or ${tag2}`);
				}
				const prices = document.querySelector(tag1).querySelectorAll(tag3);
				if(!prices){
					throw new Error(`[getImagesAsync] Price selector not found: ${tag3}`);
				}
				return [...item].map((img, index) => {
					
					let src = null;
					let price = null;
					let title = '';
					try {
						const imgs = img.querySelector(imageSelector).querySelector('img');
						src = imgs? imgs.src : null;
						const priceElement = prices[index];
						const text = priceElement.textContent;
						const match = text.match(priceFilter);
						title  = img.querySelector(titleSelector).textContent;
						if (match) {
							price = match[0].replaceAll(/\s/g, '');
						}
					} catch (err) {
						console.error(`[getImagesAsync] Sudden error occured extracting item data:`, err.message);
					}
					return {
						href: img?.href || null,
						src: src,
						price: price,
						title: title
					};
				});
			} catch (err) {
				console.error(`[getImagesAsync] Error inside page.evaluate:`, err.message);
				return [];
			}
		}, divSelector, linkSelector, priceSelector, priceFilter.source, productImageSelector, titleSelector);
		return items;
	} catch (error) {
		console.error(`[getImagesAsync] Sudden error occured while trying to run getImageSync `, error.message);
		return [];
	}
}


export async function Search(searchword) {
	if(searchword == 'undefined' || searchword == undefined || searchword.length == 0 || searchword == ''){
		return [];
	}
	const browser = await puppeteer.launch({
		headless: true,
		defaultViewport: false,
	});

	const context = browser.defaultBrowserContext();

	//Every time a new page is created it automatically blocks the images for faster load. 

	context.on('targetcreated', async target => {
		if (target.type() === 'page') {
			const newPage = await target.page();
			await newPage.setRequestInterception(true);
			newPage.on('request', request => {
				if (request.resourceType() === 'image') {
					request.abort();
				} else {
					request.continue();
				}
			})
		}
	})


	const limit = pLimit(3);

	const sites = [
		{ name: "hervis", function: fetchHervisImagesAsync, pagesToFetch: filters.pagesToFetch },
		{ name: "sportissimo", function: fetchSportissimoImagesAsync, pagesToFetch: filters.pagesToFetch },
		{ name: "sinsay", function: fetchSinsayImagesAsync, pagesToFetch: filters.pagesToFetch }
	];

	console.log('Started scraping websites in parallel.');
	const start = Date.now();

	const tasks = sites.filter(s => !filters.blackListedWebsite.includes(s.name))
		.map(site => limit(async () => {
			const page = await browser.newPage();
			page.on("console", msg => {
				const text = msg.text();
				if(text.includes(allowedConsoleLogs)){
					console.error(text);
				}
			})
			const start = Date.now();
			const images = await site.function(searchword, page, site.pagesToFetch);
			const end = Date.now();
			//console.log(`Finished scraping ${site.name} in ${(end - start) / 1000} seconds`);
			await page.close();
			return images;
		}));


	const allImages = await Promise.all(tasks);
	const end = Date.now();
	//console.log(`Runtime for ${sites.length} websites took ${(end - start) / 1000} seconds`);

	await browser.close();

	return allImages;
}

//console.log(await Search("cumi"));
//await Search("Kék felső");

//const testObject = await Search("kék felső");
//testObject.forEach(x => console.log(x));









