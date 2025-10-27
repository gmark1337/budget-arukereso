
export async function sleep(ms) {
	return new Promise(resolve => setTimeout(resolve, ms));
}


export async function getImagesAsync(page, container, price, regex, product, title) {
	try {
		const items = await page.evaluate((containerSelector, priceSelector, pricefilterString, productImageSelector, titleContentSelector) => {
			try {
				
				const priceFilter = new RegExp(pricefilterString, 'i');

				const container = document.querySelector(containerSelector);
				const anchors = container.querySelectorAll('a');
				const prices = container.querySelectorAll(priceSelector);
				
				return [...anchors].map((img, index) => {
					
					try {
						const imageContainer = img.querySelectorAll(productImageSelector)[0] || img;
						const imageTag = imageContainer.querySelector('img') || imageContainer;
						const src = imageTag?.src || null;

						const priceElement = prices[index];
						const text = priceElement?.textContent || '';
						const match = text.match(priceFilter);
						const price = match ? match[0].replaceAll(/\s/g, '') : null;

						const title  = img.querySelector(titleContentSelector)?.textContent || '';
						return {
							href: img?.href || null,
							src: src,
							price: price,
							title: title
						}
					} catch (err) {
						console.error(`[getImagesAsync] Sudden error occured extracting item data:`, err.message);
						return {
							href: null,
							src: null,
							price: null,
							title: ''
						};
					}
				});
			} catch (err) {
				console.error(`[getImagesAsync] Error inside page.evaluate:`, err.message);
				return [];
			}
		}, container, price, regex.source, product, title);
		return items;
	} catch (error) {
		console.error(`[getImagesAsync] Sudden error occured while trying to run getImageSync `, error.message);
		return [];
	}
}


export async function getImagesWithDoubleAnchorTagAsync(page, container, element, price, title, regex) {
    try {
        const images = await page.evaluate((containerSelector, elementSelector, priceSelector, titleContentSelector, regex) => {
            try {
                const container = document.querySelector(containerSelector);
                if (!container){
                    console.error(`[getImagesAsync] Container selector not found! Skipping loop...`);
                    return []; 
                };

                const elements = container.querySelectorAll(elementSelector);
                const prices = container.querySelectorAll(priceSelector);
                const titles = container.querySelectorAll(titleContentSelector);
                const regexFilter = new RegExp(regex, 'i');

                return [...elements].map((div, index) => {
                    const link = div.querySelectorAll('a')[0] || null;
                    const imgEl = div.querySelector('img');
                    const priceElement = prices[index];
                    const titleElement = titles[index].textContent;
                    let price = null;
                    try {
                        if (priceElement) {
                            const text = priceElement.textContent || '';
                            const match = text.match(regexFilter);
                            if (match) {
                                price = match[0].replace(/\s/g, '');
                            }
                        }
                    } catch (error) {
                        console.error(`[getImagesAsync] Sudden error occurred while extracting item data:`, error.message);
                    }
                    return {
                        href: link ? link.href : null,
                        src: imgEl ? imgEl.src : null,
                        price: price,
                        title: titleElement
                    };
                });
            } catch (error) {
                console.error(`[getImagesAsync] Error inside page.evaluate:`, err.message);
                return [];
            }
        }, container, element, price, title, regex.source);
        return images;
    } catch (error) {
        console.error(`[getImagesAsync] Sudden error occurred while trying to run getImagesWithDoubleAnchorTagAsync `, error.message);
        return [];
    }
}









