import {describe, it} from 'node:test';
import assert from 'node:assert';
import {filters, Search} from './ImageScraperService.js';

describe('budget-arukereso-tests', () => {
	it('results-count-test', async () => {
		filters.numberOfPagesToFetch.hervis = 4;
		filters.numberOfPagesToFetch.sinsay = 3;
		filters.numberOfPagesToFetch.sportissimo = 2;
		filters.blackListedWebsite = [];
		filters.maxPrice = 20000;
		const r = await Search('kabát');
		for (const e of r) {
			const value = e.FoundImages.length;
			const target = filters.numberOfPagesToFetch[e.websiteName.toLowerCase()];
			assert.equal(value, target);
		}
	});
	it('results-blacklist-test', async () => {
		filters.blackListedWebsite = ['sinsay', 'sportissimo'];
		filters.numberOfPagesToFetch.hervis = 3;
		const r = await Search('kabát');
		assert.equal(r.length, 1);
		assert.equal(r[0].websiteName, 'Hervis');
	});
    it('results-price-test', async () => {
        filters.numberOfPagesToFetch.hervis = 3;
		filters.numberOfPagesToFetch.sinsay = 2;
		filters.numberOfPagesToFetch.sportissimo = 4;
		filters.blackListedWebsite = [];
		filters.maxPrice = 20000;
        filters.minPrice = 4000;
        const r = await Search('kabát');
        for (const e of r) {
            for (const item of e.FoundImages) {
                assert.equal(parseInt(item.price) >= filters.minPrice &&
                    parseInt(item.price) <= filters.maxPrice, true);
            }
        }
    })
});
