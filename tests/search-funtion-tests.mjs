import {
    describe, it,
} from 'node:test';
import assert from 'node:assert';
import {Search} from '../ImageScraperService.js';
import {config} from '../configuration/config.js';

const {filters} = config;

describe('search-function-tests', () => {
	it('results-count-test', async () => {
		filters.pagesToFetch = 4;
		filters.blackListedWebsite = [];
		filters.maxPrice = 20_000;
		const r = await Search('kabát');
		for (const e of r) {
			const value = e.FoundImages.length;
			const target = filters.pagesToFetch;
			assert.equal(value, target);
		}
	});
	it('results-blacklist-test', async () => {
		filters.blackListedWebsite = ['sinsay', 'sportisimo', 'aboutYou'];
		filters.pagesToFetch = 4;
		const r = await Search('kabát');
		assert.equal(r.length, 1);
		assert.equal(r[0].websiteName, 'Hervis');
	});
	it('results-price-test', async () => {
		filters.pagesToFetch = 4;
		filters.blackListedWebsite = ['aboutYou']; //abyout you doesn't have filtering options yet!
		filters.maxPrice = 20_000;
		filters.minPrice = 4000;
		const r = await Search('kabát');
		for (const e of r) {
			for (const item of e.FoundImages) {
				assert.equal(Number.parseInt(item.price) >= filters.minPrice
					&& Number.parseInt(item.price) <= filters.maxPrice, true);
			}
		}
	});
	// Sinsay nem ad vissza talalatot adidas keresesre
	it('empty-result-test', async () => {
		filters.pagesToFetch = 2;
		filters.blackListedWebsite = ['hervis', 'sportisimo'];
		filters.maxPrice = 20_000;
		filters.minPrice = 4000;
    });
});
