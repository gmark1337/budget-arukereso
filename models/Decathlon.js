import {getImagesWithDoubleAnchorTagAsync} from '../services/ImageScraperService.js'
import {config} from '../configuration/config.js'

const {filters} = config;
const decathlonWebsite = config.websites["decathlon"];


function encodeSearchItemWithFiltering(searchedItem, url, filters ={}){
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
    try{
        const fetchedurl = await encodeSearchItemWithFiltering(searchword, decathlonWebsite.baseUrl, filters);
        
        //console.log(`The created URL is: ${fetchedurl}`)
        
        await page.goto(fetchedurl, {waitUntil: "networkidle2"});

        try{
            await page.waitForSelector(decathlonWebsite.elementSelector, { timeout: 5000 });
        }catch(error){
            console.error(`[fetchDecathlonImagesAsync] Timeout waiting for container selector: ${error.message}\n Reloading page...`);
            await page.reload();
        }
        
        const regex = /^.*?(\d[\d\s]*)(?=\s*Ft)/;
        const images = await getImagesWithDoubleAnchorTagAsync(page, decathlonWebsite.containerSelector, decathlonWebsite.elementSelector, decathlonWebsite.productPriceSelector, decathlonWebsite.titleContentSelector, regex);
        const selected = images.slice(0,numberOfItemsToFetch);

        const finalImages = {
            websiteName: 'Decathlon',
            FoundImages: selected
        };
        
        return finalImages;
    }catch(error){
        console.error(`[fetchDecathlonImagesAsync] Failed to fetch images:  ${error.message}`);
        return {
            websiteName: 'Decathlon',
            FoundImages: []
        };
    }
}
