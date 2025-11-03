import * as cheerio from 'cheerio';
import {config} from '../configuration/config.js';

import { Search } from './searchService.js';


const notFoundMessage = 'Failed to find any details for this part';

export async function fetchProductDetailsAsync(url){
    let splitted = url.split('.')[1];
        
        if(splitted.includes('aboutyou')){
            splitted = splitted.replace('y', 'Y');
        }
        if(splitted.includes('mangooutlet')){
            splitted = 'mangoOutlet';
        }

        //TODO
        //IMPLEMENT SINSAY IMITATED DETAIL SCRAPING
        if(splitted.includes('sinsay')){
            return {errorMessage:'Site is blocked! Return later...'};
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




