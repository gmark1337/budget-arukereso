import {sleep, filters} from '../ImageScraperService.js'
import {config} from '../configuration/config.js'

const sinsayWebsite = config.websites["sinsay"];


function encodeSearchItemWithFilteringAsync(searchedword, url, filters = {}, correctPrices){
    const params = [];

    if(searchedword){
        params.push(`query=${searchedword.replace(/\s+/g, "-")}`);
    }

    if(filters.size){
        params.push(`sizes=${filters.size}`);
    }

    if(correctPrices.minPrice && correctPrices.maxPrice){
        params.push(`price=${correctPrices.minPrice}%3A`);
    }
    const queryString = params.join("&"); 
    return `${url}?${queryString}`;
}

function encoderHelperAsync(searchedword, url){
    const params = [];

    if(searchedword){
        params.push(`query=${encodeURIComponent(searchedword).replace(/%20/g, "-")}`);
    }

    if(filters.size){
        params.push(`sizes=${filters.size}`);
    }
    const queryString = params.join("&"); 
    return `${url}?${queryString}`;
}

async function getWebsitePricesAsync(page, priceTagSelector){
    const prices = await page.evaluate((priceSelector)  => {
        const elements = document.querySelector(priceSelector);
        let minPrice = elements.getAttribute('min');
        let maxPrice = elements.getAttribute('max');
        return {minPrice, maxPrice};
    }, priceTagSelector)
    return prices;
}

function calculateInRangePriceRange(filterPrice, websitePrice){
    const corrected = {
        minPrice: Math.max(filterPrice.minPrice, websitePrice.minPrice),
        maxPrice: Math.min(filterPrice.maxPrice, websitePrice.maxPrice)
    };
    
    return corrected;
}

async function getImagesAsync(page, tag1, tag2, tag3) {
    const images = await page.evaluate((containerSelector, elementSelector, priceSelector) => {
        const container = document.querySelector(containerSelector);
        if (!container) return [];

        const elements = container.querySelectorAll(elementSelector);
        const prices = container.querySelectorAll(priceSelector);
        const priceFilter = /(\d{1,3}(?:[\s\u00A0]\d{3})*)/i;

        return [...elements].map((div, index) => {
            const link = div.querySelectorAll('a')[0] || null;
            const imgEl = div.querySelector('img');

            const priceElement = prices[index];
            let price = null;
            if (priceElement) {
                const text = priceElement.textContent || '';
                const match = text.match(priceFilter);
                if (match) {
                    price = match[0].replace(/\s/g, '');
                }
            }
            return {
                href: link ? link.href : null,
                src: imgEl ? imgEl.src : null,
                price,
            };
        });
    },tag1, tag2,tag3);
    return images;
}

export async function fetchSinsayImagesAsync(searchword, page, numberOfItemsToFetch){
    
    await page.goto(await encoderHelperAsync(searchword,sinsayWebsite.baseUrl));

    //console.log(await encoderHelperAsync(searchword,baseUrl));

    const prices = await getWebsitePricesAsync(page, sinsayWebsite.priceRangeSelector);


    //console.log(`The filters prices are ${filters.minPrice} and ${filters.maxPrice}`);
    //console.log(`The website prices are ${prices.minPrice} and ${prices.maxPrice}`);

    const correctPrices = calculateInRangePriceRange(prices, filters);

    //console.log(`The corrected prices are ${correctPrices.minPrice} and ${correctPrices.maxPrice}`);

    const foundpage = await encodeSearchItemWithFilteringAsync(searchword, sinsayWebsite.baseUrl, filters, correctPrices);

    await page.goto(foundpage);
    await sleep(1500);
    
    await page.click(sinsayWebsite.acceptCookieButton);

    await sleep(1500);
    const items = await getImagesAsync(page, sinsayWebsite.containerSelector, sinsayWebsite.imageSelector,sinsayWebsite.productPriceSelector);
    const selected = items.slice(0, numberOfItemsToFetch);
    const finalImages = {
        websiteName: 'Sinsay',
        FoundImages: selected
    };
    return finalImages;
}
