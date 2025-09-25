import puppeteer from "puppeteer";
import { getImagesAsync, sleep} from "./ImageScraperService.js";

const baseURL = "https://www.sportisimo.hu/termekkereso-katalogus/";

async function encodeURl(searchedword, url){
    const searchedItem = encodeURIComponent(searchedword);

    return `${baseURL}?q=${searchedItem}`

}

async function Main(){
    const browser = await puppeteer.launch({
        headless:false,
        defaultViewport:false
    });

    const page = await browser.newPage();

    const searchedPage = await encodeURl("kék felső", baseURL);
    console.log(searchedPage);

    await page.goto(searchedPage);

    const regex = /^(\d{1,3}(?:[ \u00A0]\d{3})*)\s*Ft/;
    await sleep(1500);
    const images = await getImagesAsync(page, '.zws-main__list','.ais-InfiniteHits-list.zws-infinite-hits__list','.product-box__prices',regex, '.product-box__image');

    console.log(images);
    await browser.close();
}

await Main();



//document.querySelector('.zws-main__list').querySelector('.ais-InfiniteHits-list.zws-infinite-hits__list').querySelectorAll('a')

//IMG
//document.querySelector('.zws-main__list').querySelector('.ais-InfiniteHits-list.zws-infinite-hits__list').querySelector('.product-box__image').querySelector('img')

//PRICE
//document.querySelector('.zws-main__list').querySelector('.ais-InfiniteHits-list.zws-infinite-hits__list').querySelector('.product-box__price-value').textContent