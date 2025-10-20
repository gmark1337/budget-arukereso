import {
    after,
	describe, it,
} from 'node:test';
import assert from 'node:assert';
import {load} from 'cheerio';
import { randomInt } from 'node:crypto';
import { DB, GLOBALS } from '../db.js';

const emptyPlaceholderString = (await GLOBALS.findOne({name: 'emptyStringPlaceholder'})).value;

describe('search-endpoint-edgecases-tests', () => {
	// Sinsay nem ad vissza talalatot adidas keresesre
	it('empty-result-test', async () => {
		const p = genParameters('adidas');
		p.sinsay = true;
		p.hervis = false;
		p.sportisimo = false;
		p.aboutYou = false;
		const response = await (await fetch('http://localhost:8080/search?' + new URLSearchParams(p))).text();
		const $ = load(response);
		const value = $('fieldset div.items').contents().first().text().trim();
		assert.equal(value, emptyPlaceholderString);
	});
	it('empty-string-searchword-test', async () => {
		const p = genParameters();
		p.searchword = '';
		const response = await (await fetch('http://localhost:8080/search?' + new URLSearchParams(p))).text();
		assert.equal(response.trim(), '');
	});
	it('empty-searchword-test', async () => {
		const p = genParameters();
		p.searchword = undefined;
		const response = await (await fetch('http://localhost:8080/search?' + new URLSearchParams(p))).text();
		assert.equal(response.trim(), '');
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
    after(async () => {
        await DB.disconnect();
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
