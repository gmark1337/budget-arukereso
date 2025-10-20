import {
	describe, it,
} from 'node:test';
import assert from 'node:assert';
import {load} from 'cheerio';
import { randomInt } from 'node:crypto';

describe('search-response-html-tests', async () => {
	const p = genParameters();
	const response = await (await fetch('http://localhost:8080/search?' + new URLSearchParams(p))).text();
	const $ = load(response);
	it('results-count-test', () => {
		const expectedNumberOfSites = p.hervis + p.sinsay + p.sportisimo;
		const actualNumberOfSites = $('fieldset').length;
		assert.equal(expectedNumberOfSites, actualNumberOfSites);
	});
	it('results-price-test', () => {
		const prices = $('span.chip').map((_, e) => Number.parseInt($(e).text())).get();
		for (const price of prices) {
			assert.ok(price >= p.minPrice);
			assert.ok(price <= p.maxPrice);
		}
	});
	it('price-order-test', () => {
		const prices = $('span.chip').map((_, e) => Number.parseInt($(e).text())).get();
		const expectedNumberOfSites = p.hervis + p.sinsay + p.sportisimo;
		let head = 0;
		for (let i = 0; i < expectedNumberOfSites; i++) {
			const sitePrices = prices.slice(head, head + expectedNumberOfSites);
			const sorted = structuredClone(sitePrices);
			if (p.order == 'asc') {
				sorted.sort((a, b) => a - b);
			}

			if (p.order == 'desc') {
				sorted.sort((a, b) => b - a);
			}

			assert.deepEqual(sitePrices, sorted);
			head += expectedNumberOfSites;
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
	p.sportisimo = randomInt(2) == 1;
	return p;
}
