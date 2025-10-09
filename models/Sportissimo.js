import { getImagesAsync} from "../ImageScraperService.js";
import {config} from '../configuration/config.js'


const sportissmoWebsite = config.websites["sportissimo"];
const filters = config.filters;

function encodeSearchItemWithFilteringAsync(searchedword, url, filters = {}){
    const params = [];

    if(filters.minPrice && filters.maxPrice){
        const pricePart =  `products[range][price]=${filters.minPrice}:${filters.maxPrice}`;
        params.push(pricePart);
    }

    if(filters.size){
        const sizePart = `products[refinementList][sizes][0]=${encodeURIComponent(filters.size)}`;
        params.push(sizePart);
    }

    if(searchedword){
        params.push(`q=${encodeURIComponent(searchedword)}`);
    }


    const queryString = params.join("&")
    return `${url}?${queryString}`;

}

export async function fetchSportissimoImagesAsync(searchword, page, numberOfItemsToFetch){
    try{

    
    const foundPage = await encodeSearchItemWithFilteringAsync(searchword,sportissmoWebsite.baseUrl, filters);
    console.log(`The created URL is: ${foundPage}`);

    await page.goto(foundPage, {waitUntil: "networkidle2"});

    const regex = /^\s*\d{1,3}(?:[\s\u00A0]\d{3})*/;
    const images = await getImagesAsync(page, sportissmoWebsite.containerSelector,sportissmoWebsite.priceTagSelector,regex, sportissmoWebsite.productImageSelector, sportissmoWebsite.titleContentSelector);
    

    
    const selected = images.slice(0, numberOfItemsToFetch);
    //console.log(`Found images for Sportissimo website: ${selected}`);
    const finalImages = {
        websiteName: 'Sportissimo',
        FoundImages: selected
    };

    return finalImages;
    }catch(error){
        console.error(`[fetchSportissimoImagesAsync] Failed to fetch images:  ${error.message}`);
        return {
            websiteName: 'Sportissimo',
            FoundImages: []
        };
    }
}
