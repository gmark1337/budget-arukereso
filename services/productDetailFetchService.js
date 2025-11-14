import * as cheerio from 'cheerio';
import {config} from '../configuration/config.js';

import { Search, SearchProductDetails } from './searchService.js';



const notFoundMessage = 'Failed to find any details for this part';

export async function fetchProductDetailsAsync(url){
    let splitted = url.split('.')[1];
        switch(true){
            case splitted.includes('aboutyou'):
                splitted = splitted.replace('y', 'Y');
                break;
            case splitted.includes('mangooutlet'):
                splitted = 'mangoOutlet';
                break;
            case splitted.includes('sinsay'):
                return await SearchProductDetails(url, 'sinsay');
                
            case splitted.includes('hervis'):
                return await SearchProductDetails(url, 'hervis');
            case splitted.includes('decathlon'):
                return await SearchProductDetails(url, 'decathlon');
        }
        const filters = config.websites[splitted];
        let productDetails = "";
        try{
            const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-type": "text/html",
                "charset": "utf-8"
                }
                });
            const data = await response.text();
            const loadedData = cheerio.load(data);

            productDetails = loadedData.extract({
                name: filters.details.productName,
                originalPrice: filters.details.originalPrice,
                discountPrice: filters.details.discountPrice,
                color: filters.details.color,
                shipping: filters.details.shipping,
                material: filters.details.material,
                otherInformation: filters.details.otherInformation
            });
            
            for(const key in productDetails){
                if(productDetails[key] === undefined){
                    productDetails[key] = notFoundMessage;
                }
    
                productDetails[key] = productDetails[key]?.replace(/\s+/g, ' ').trim();
            }
        }catch(error){
            return {errorMessage: `Something went wrong while fetching data! \n ${error.message} `};
        };
        
        console.log(productDetails);

        return productDetails;
}

/* const fetchedItems = await fetchProductDetailsAsync("https://www.mangooutlet.com/hu/hu/p/ferfi/puloverek/puloverek/magas-nyaku-kotott-felso_67010653");

console.log(fetchedItems);
 */


/* const testRun = await Search("kék felső");
const allHrefs = testRun.flatMap(site => site.FoundImages.map(url => url.href));

for(const site of allHrefs){
	console.log(await fetchProductDetailsAsync(site));
} */




