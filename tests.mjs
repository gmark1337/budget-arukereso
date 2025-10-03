import {describe, it} from 'node:test';
import assert from 'node:assert';
import {randomInt} from 'node:crypto';
import {load} from 'cheerio';
import {filters, Search} from './ImageScraperService.js';

const emptyPlaceholderString = ':(';

describe('search-function-tests', () => {
	it('results-count-test', async () => {
		filters.numberOfPagesToFetch.hervis = 4;
		filters.numberOfPagesToFetch.sinsay = 3;
		filters.numberOfPagesToFetch.sportissimo = 2;
		filters.blackListedWebsite = [];
		filters.maxPrice = 20_000;
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
		filters.numberOfPagesToFetch.hervis = 2;
		filters.numberOfPagesToFetch.sinsay = 2;
		filters.numberOfPagesToFetch.sportissimo = 2;
		filters.blackListedWebsite = ['hervis', 'sportissimo'];
		filters.maxPrice = 20_000;
		filters.minPrice = 4000;
		const r = await Search('adidas');
		for (const e of r) {
			for (const item of e.FoundImages) {
				assert.equal(item.length, 0);
			}
		}
	});
	it('empty-searchword-test', async () => {
		filters.numberOfPagesToFetch.hervis = 3;
		filters.numberOfPagesToFetch.sinsay = 3;
		filters.numberOfPagesToFetch.sportissimo = 3;
		filters.blackListedWebsite = [];
		filters.maxPrice = 20_000;
		filters.minPrice = 4000;
		const r = await Search();
		assert.deepEqual(r, []);
	});
	it('empty-string-searchword-test'), async () => {
		filters.numberOfPagesToFetch.hervis = 3;
		filters.numberOfPagesToFetch.sinsay = 3;
		filters.numberOfPagesToFetch.sportissimo = 3;
		filters.blackListedWebsite = [];
		filters.maxPrice = 20_000;
		filters.minPrice = 4000;
		const r = await Search('');
		assert.deepEqual(r, []);
	};
});

describe('search-endpoint-edgecases-tests', () => {
	// Sinsay nem ad vissza talalatot adidas keresesre
	it('empty-result-test', async () => {
		const p = genParameters('adidas');
		p.sinsay = true;
		p.hervis = false;
		p.sportissimo = false;
		const response = await (await fetch('http://localhost:8080/search?' + new URLSearchParams(p))).text();
		const $ = load(response);
		const value = $('fieldset div.items').contents().first().text().trim();
		assert.equal(value, emptyPlaceholderString);
	});
	it('empty-string-searchword-test', async () => {
		const p = genParameters('');
		const response = await (await fetch('http://localhost:8080/search?' + new URLSearchParams(p))).text();
		const $ = load(response);
		const value = $('fieldset div.items').contents().map((_, e) => $(e).text().trim()).get();
		for (const i of value) {
			assert.equal(i, emptyPlaceholderString);
		}
	});
	it('empty-searchword-test', async () => {
		const p = genParameters();
		p.searchword = undefined;
		const response = await (await fetch('http://localhost:8080/search?' + new URLSearchParams(p))).text();
		const $ = load(response);
		const value = $('fieldset div.items').contents().map((_, e) => $(e).text().trim()).get();
		for (const i of value) {
			assert.equal(i, emptyPlaceholderString);
		}
	});
	it('gibberish-searchword-test', async () => {
		const p = genParameters('aggrgeththeasdsdfbafvguvguasrf');
		const response = await (await fetch('http://localhost:8080/search?' + new URLSearchParams(p))).text();
		const $ = load(response);
		const value = $('fieldset div.items').contents().map((_, e) => $(e).text().trim()).get();
		for (const i of value) {
			assert.equal(i, emptyPlaceholderString);
		}
	});
});

describe('search-response-html-tests', async () => {
	const p = genParameters();
	const response = await (await fetch('http://localhost:8080/search?' + new URLSearchParams(p))).text();
	const $ = load(response);
	it('results-count-test', () => {
		const expectedNumberOfSites = p.hervis + p.sinsay + p.sportissimo;
		const actualNumberOfSites = $('fieldset').length;
		assert.equal(expectedNumberOfSites, actualNumberOfSites);
	});
	it('results-price-test', () => {
		// I kell hogy mukodjon fuggetlen attol hog_ nem kezdunk vele semmit
		const prices = $('span.chip').map((_, e) => Number.parseInt($(e).text())).get();
		for (const price of prices) {
			assert.ok(price >= p.minPrice);
			assert.ok(price <= p.maxPrice);
		}
	});
});

function genParameters(searchword) {
	const sizes = ['S', 'M', 'L', 'XL'];
	const p = {};
	p.searchword = searchword || 'póló';
	p.order = randomInt(2) == 1 ? 'asc' : 'desc';
	p.minPrice = randomInt(1000, 10_000);
	p.maxPrice = randomInt(11_000, 20_000);
	p.size = sizes[randomInt(sizes.length)];
	p.count = randomInt(1, 8);
	p.hervis = randomInt(2) == 1;
	p.sinsay = randomInt(2) == 1;
	p.sportissimo = randomInt(2) == 1;
	return p;
}
