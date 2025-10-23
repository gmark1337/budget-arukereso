import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import pLimit from 'p-limit';

import { fetchHervisImagesAsync } from '../models/Hervis.js';
import { fetchSportisimoImagesAsync } from '../models/Sportisimo.js';
import { fetchSinsayImagesAsync } from '../models/Sinsay.js';
import { fetchAboutYouImagesAsync } from '../models/AboutYou.js';
import { fetchDecathlonImagesAsync } from '../models/Decathlon.js';


import {config} from '../configuration/config.js'

const filters = config.filters;
const allowedConsoleLogs = config.allowedConsoleLogs;

const stealth = StealthPlugin();

stealth.enabledEvasions.delete('navigator.plugins');
stealth.enabledEvasions.delete('chrome.runtime')

puppeteer.use(stealth);


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
		{name: "aboutYou", function: fetchAboutYouImagesAsync, pagesToFetch: filters.pagesToFetch},
		{name: "decathlon", function: fetchDecathlonImagesAsync, pagesToFetch: filters.pagesToFetch}
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