import {sleep, filters} from '../ImageScraperService.js'
import {config} from '../configuration/config.js'

const sinsayWebsite = config.websites["sinsay"];


function encodeSearchItemWithFilteringAsync(searchedword, url, filters = {}){
    const params = [];

    if(searchedword){
        params.push(`query=${searchedword.replace(/\s+/g, "-")}`);
    }

    if(filters.size){
        params.push(`sizes=${filters.size}`);
    }

    if(filters.minPrice && filters.maxPrice){
        params.push(`price=${filters.minPrice}%3A`);
    }
    const queryString = params.join("&"); 
    return `${url}?${queryString}`;
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

    const foundPage = await encodeSearchItemWithFilteringAsync(searchword, sinsayWebsite.baseUrl, filters);

    console.log(`The created URL is: ${foundPage}`);

    await page.goto(foundPage, {waitUntil: "domcontentloaded"});
    
    await page.waitForSelector(sinsayWebsite.containerSelector, {timeout: 5000});

    const items = await getImagesAsync(page, sinsayWebsite.containerSelector, sinsayWebsite.imageSelector,sinsayWebsite.productPriceSelector);
    if(items === null){
        await page.reload({waitUntil: "networkidle2"})
    }
    const selected = items.slice(0, numberOfItemsToFetch);
    const finalImages = {
        websiteName: 'Sinsay',
        FoundImages: selected
    };
    return finalImages;
}
