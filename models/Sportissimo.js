import puppeteer from "puppeteer";
import { getImagesAsync, sleep} from "../ImageScraperService.js";

const baseURL = "https://www.sportisimo.hu/termekkereso-katalogus/";

function encodeURL(searchedword, url){
    const searchedItem = encodeURIComponent(searchedword);

    return `${url}?q=${searchedItem}`

}

export async function fetchSportissimoImages(searchword, page, numberOfItemsToFetch){
    const foundPage = await encodeURL(searchword,baseURL)

    await page.goto(foundPage);

    const regex = /^(\d{1,3}(?:[ \u00A0]\d{3})*)\s*Ft/;
    await sleep(1500);
    const images = await getImagesAsync(page, '.zws-main__list','.ais-InfiniteHits-list.zws-infinite-hits__list','.product-box__prices',regex, '.product-box__image');

    console.log(images);
    const selected = images.slice(0, numberOfItemsToFetch);
    const finalImages = {
        websiteName: 'Sportissimo',
        FoundImages: selected
    };

    return finalImages;
}


//document.querySelector('.zws-main__list').querySelector('.ais-InfiniteHits-list.zws-infinite-hits__list').querySelectorAll('a')

//IMG
//document.querySelector('.zws-main__list').querySelector('.ais-InfiniteHits-list.zws-infinite-hits__list').querySelector('.product-box__image').querySelector('img')

//PRICE
//document.querySelector('.zws-main__list').querySelector('.ais-InfiniteHits-list.zws-infinite-hits__list').querySelector('.product-box__price-value').textContent