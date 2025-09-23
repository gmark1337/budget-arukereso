import puppeteer from 'puppeteer'
import {config} from './configuration/config.js'

const testSearchword = "kék felső";


const hervisWebsite = config.websites["hervis"];

async function sleep(ms){
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function getImagesAsync(page, divSelector, linkSelector, priceSelector, priceFilter){
    const items = await page.evaluate((tag1, tag2, tag3, pricefilterString, priceFilterFlag) => {
        const priceFilter = new RegExp(pricefilterString,"i");
        const item = document.querySelector(tag1).querySelector(tag2).querySelectorAll('a');
        const prices = document.querySelector(tag1).querySelectorAll(tag3);
        return Array.from(item).map((img,index) => {    
            const imgs = img.querySelector('img');
            const priceElement = prices[index];
            const text = priceElement.textContent;
            const match = text.match(priceFilter);

            let price = null;
            if(match){
                price = match[0].replace(/\s/g,"");
            } 
            return {
                href: img.href || null,
                src: imgs ? imgs.src : null,
                price: price
            };
        });
    },divSelector, linkSelector, priceSelector, priceFilter.source);

    return items;
}

async function encodeSearchItemAsync(searchedItem, url){
    return `${url}${encodeURIComponent(searchedItem)}`;
}


async function fetchHervisImages(page, numberOfItemsToFetch){
    const foundPage = await encodeSearchItemAsync(testSearchword, hervisWebsite.baseUrl);
    await page.goto(foundPage);

    await sleep(1500);

    const cookiedeny = await page.evaluateHandle((tag1, tag2) => {
        const host = document.querySelector(tag1);
        const shadow = host.shadowRoot;
        return shadow.querySelector(tag2);
    }, hervisWebsite.denyCookieSelector, hervisWebsite.shadowCookieDenyButton);

    await cookiedeny.click();
    await sleep(1500);
    const regex = /\s+(\d{1,3}(?:\s\d{3})*)/;
    const items = await getImagesAsync(page, hervisWebsite.wholePageSelector, hervisWebsite.urlTagSelector,hervisWebsite.priceTagSelector, regex);

    const selected = items.slice(0,numberOfItemsToFetch);
    const finalImages = {
        websiteName: "Hervis",
        FoundImages: selected
    };
    return finalImages;     
}


async function Main() {
    const browser = await puppeteer.launch({
        headless:true,
        defaultViewport:false
    });



    const page = await browser.newPage();

    const hervisImages = await fetchHervisImages(page, 3);

    console.log(hervisImages);

    await browser.close();
}

await Main();
