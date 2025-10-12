import puppeteer from 'puppeteer';
import pLimit from 'p-limit';

import { fetchHervisImagesAsync } from './models/Hervis.js';
import { fetchSportisimoImagesAsync } from './models/Sportisimo.js';
import { fetchSinsayImagesAsync } from './models/Sinsay.js';
import { fetchAboutYouImagesAsync } from './models/AboutYou.js';
import {config} from './configuration/config.js'



const filters = config.filters;
const allowedConsoleLogs = config.allowedConsoleLogs;


export async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}


export async function getImagesAsync(page, containerSelector, priceSelector, priceFilter, productImageSelector, titleContentSelector) {
	try {
		const items = await page.evaluate((containerSelector, priceSelector, pricefilterString, productImageSelector, titleContentSelector) => {
			try {
				
				const priceFilter = new RegExp(pricefilterString, 'i');

				const container = document.querySelector(containerSelector);
				const anchors = container.querySelectorAll('a');
				const prices = container.querySelectorAll(priceSelector);
				
				return [...anchors].map((img, index) => {
					
					try {
						const imageContainer = img.querySelectorAll(productImageSelector)[0] || img;
						const imageTag = imageContainer.querySelector('img') || imageContainer;
						const src = imageTag?.src || null;

						const priceElement = prices[index];
						const text = priceElement?.textContent || '';
						const match = text.match(priceFilter);
						const price = match ? match[0].replaceAll(/\s/g, '') : null;

						const title  = img.querySelector(titleContentSelector)?.textContent || '';
						return {
							href: img?.href || null,
							src: src,
							price: price,
							title: title
						}
					} catch (err) {
						console.error(`[getImagesAsync] Sudden error occured extracting item data:`, err.message);
						return {
							href: null,
							src: null,
							price: null,
							title: ''
						};
					}
				});
			} catch (err) {
				console.error(`[getImagesAsync] Error inside page.evaluate:`, err.message);
				return [];
			}
		}, containerSelector, priceSelector, priceFilter.source, productImageSelector, titleContentSelector);
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
		{ name: "sportisimo", function: fetchSportisimoImagesAsync, pagesToFetch: filters.pagesToFetch },
		{ name: "sinsay", function: fetchSinsayImagesAsync, pagesToFetch: filters.pagesToFetch },
		{name: "aboutYou", function: fetchAboutYouImagesAsync, pagesToFetch: filters.pagesToFetch}
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

//console.log(decodeURIComponent("https://www.aboutyou.hu/c/noi/ruhazat/polok-es-felsok/felsok-20255?color=38920&prices=397800-3288100&defFemaleInt=39090"))
//https://www.aboutyou.hu/c/noi/ruhazat/polok-es-felsok/felsok-20255?color=38920









