import {getImagesAsync} from './Sinsay.js'
import {config} from '../configuration/config.js'

const {filters} = config;
const decathlonWebsite = config.websites["decathlon"];


function encodeSearchItemWithFilteringAsync(searchedItem, url, filters ={}){
    const params = [];

    if(searchedItem){
        params.push(`Ntt=${encodeURIComponent(searchedItem)}`);
    }

    if(filters.size){
        params.push(`facets=sizeGroupItemLabels:${filters.size}_`);
    }

    if(filters.minPrice && filters.maxPrice){
        params.push(`Nf=sku.modelLowestPrice${encodeURIComponent('|BTWN+')}${filters.minPrice}${encodeURIComponent('+')}${filters.maxPrice}`);
    }
    const queryString = params.join('&');
    return `${url}search?${queryString}`;
}

export async function fetchDecathlonImagesAsync(searchword, page, numberOfItemsToFetch){
    const fetchedurl = await encodeSearchItemWithFilteringAsync(searchword, decathlonWebsite.baseUrl, filters);

    console.log(`The created URL is: ${fetchedurl}`)
    
    await page.goto(fetchedurl, {waitUntil: "networkidle2"});

    
    await page.waitForSelector(decathlonWebsite.elementSelector, { timeout: 5000 });
    const regex = /^.*?(\d[\d\s]*)(?=\s*Ft)/;
    const images = await getImagesAsync(page, decathlonWebsite.containerSelector, decathlonWebsite.elementSelector, decathlonWebsite.productPriceSelector, decathlonWebsite.titleContentSelector, regex);
    const selected = images.slice(0,numberOfItemsToFetch);

    const finalImages = {
        websiteName: 'Decathlon',
        FoundImages: selected
    };
    
    return finalImages;
}
