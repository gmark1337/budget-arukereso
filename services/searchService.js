import puppeteer from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import pLimit from 'p-limit';

import { fetchHervisImagesAsync } from '../models/Hervis.js';
import { fetchSportisimoImagesAsync } from '../models/Sportisimo.js';
import { fetchSinsayImagesAsync } from '../models/Sinsay.js';
import { fetchAboutYouImagesAsync } from '../models/AboutYou.js';
import { fetchDecathlonImagesAsync } from '../models/Decathlon.js';
import { fetchMangoOutletImagesAsync} from '../models/MangoOutlet.js';

import { sleep } from './ImageScraperService.js';


import {config} from '../configuration/config.js'

const filters = config.filters;
const allowedConsoleLogs = config.allowedConsoleLogs;

const stealth = StealthPlugin();

stealth.enabledEvasions.delete('navigator.plugins');
stealth.enabledEvasions.delete('chrome.runtime')

puppeteer.use(stealth);


function DisableImages(browser){

	const context = browser.defaultBrowserContext();
	context.on('targetcreated', async target => {
		if (target.type() === 'page') {
			const newPage = await target.page();
			await newPage.setRequestInterception(true);
			newPage.on('request', request => {
				if (['image', 'stylesheet', 'font'].includes(request.resourceType())) {
					request.abort();
				} else {
					request.continue();
				}
			})
		}
	})
}

async function LaunchBrowserAsync(){
	return  await puppeteer.launch({
		headless: 'new',
		defaultViewport: false,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--disable-accelerated-2d-canvas',
			'--no-first-run',
			'--no-zygote',
			'--disable-gpu'
  		]
	});
}

async function ForceButtonClickAsync(page, selector){
	await page.click(selector);
}


export async function Search(searchword) {
	if(searchword == 'undefined' || searchword == undefined || searchword.length == 0 || searchword == ''){
		return [];
	}
	
	const browser = await LaunchBrowserAsync();
	
	DisableImages(browser);

	const limit = pLimit(6);

	const sites = [
		{name: "hervis", function: fetchHervisImagesAsync, pagesToFetch: filters.pagesToFetch },
		{name: "sportisimo", function: fetchSportisimoImagesAsync, pagesToFetch: filters.pagesToFetch },
		{name: "sinsay", function: fetchSinsayImagesAsync, pagesToFetch: filters.pagesToFetch },
		{name: "decathlon", function: fetchDecathlonImagesAsync, pagesToFetch: filters.pagesToFetch},
        {name: "mangoOutlet", function: fetchMangoOutletImagesAsync, pagesToFetch: filters.pagesToFetch},
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


export async function SearchProductDetails(url, websiteName){
	if(url == 'undefined' || url == undefined || url.length == 0 || url == '') return null;
	const productFilters = config.websites[websiteName].details;
	const browser = await LaunchBrowserAsync();

	DisableImages(browser);

	const page = await browser.newPage();

	await page.goto(url, {waitUntil: 'networkidle2'});

	const details = await page.evaluate((productFilters) => {
		const getText = (selector) => {
			const el = document.querySelector(selector);
			return el ? el.textContent.trim() : null;
		};

		return {
			productName: getText(productFilters.productName),
			originalPrice: getText(productFilters.originalPrice) ?? getText(productFilters.altOriginalPrice),
			discountPrice: getText(productFilters.discountPrice) ?? 'This product is not on sale',
			color: getText(productFilters.color),
			shipping: getText(productFilters.shipping),
			material: getText(productFilters.material),
			otherInformation: getText(productFilters.otherInformation)
		}
	}, productFilters);

	//console.log(details);

	//sinsay's material information is hiding behind a wall which needs to be open
	if(!details.material && websiteName == 'sinsay'){
		await ForceButtonClickAsync(page, '#cookiebotDialogOkButton');
		await ForceButtonClickAsync(page,'.product-compositionstyled__StyledButton-sc-10nvgpk-1.dCbsfg');
		await page.waitForSelector(productFilters.material, {timeout: 2000});

		const material = await page.evaluate((filter) => {
			const el = document.querySelector(filter.material);
			return el ? el.textContent.trim() : null;
		}, productFilters);
		details.material = material;
	}

	await browser.close();
	return details;
}

//console.log(await Search("cumi"));
//await Search("Kék felső");

/* const testObject = await Search("kék felső");
testObject.forEach(x => console.log(x)); */

/* const testUrl = "https://www.hervis.hu/shop/Ruházat/Fürdőruhák/Fürdőpólók/Cygnus/Felső/p/COLOR-3372325";
const testName =  "hervis";

const testUrl2 = "https://www.sinsay.com/hu/hu/nyomott-mintas-pamut-polo-paw-patrol-207fc-99x";
const testName2 = "sinsay";

const testUrl3 = "https://www.sinsay.com/hu/hu/sportos-felso-439hn-55x";

const details = await SearchProductDetails(testUrl, testName);

console.log(details); */

