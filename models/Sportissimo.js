import { getImagesAsync, sleep,filters} from "../ImageScraperService.js";
import {config} from '../configuration/config.js'


const sportissmoWebsite = config.websites["sportissimo"];

function encodeURL(searchedword, url, filters = {}){
    const params = [];

    //encode ?products[range][price]=23896:135329
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

export async function fetchSportissimoImages(searchword, page, numberOfItemsToFetch){
    const foundPage = await encodeURL(searchword,sportissmoWebsite.baseUrl, filters);

    await page.goto(foundPage);

    const regex = /^(\d{1,3}(?:[ \u00A0]\d{3})*)\s*Ft/;
    await sleep(1500);
    const images = await getImagesAsync(page, sportissmoWebsite.wholePageSelector,sportissmoWebsite.urlTagSelector,sportissmoWebsite.priceTagSelector,regex, sportissmoWebsite.productImageSelector);

    
    const selected = images.slice(0, numberOfItemsToFetch);
    //console.log(images);
    const finalImages = {
        websiteName: 'Sportissimo',
        FoundImages: selected
    };

    return finalImages;
}
