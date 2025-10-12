import {
	after, before, describe, it,
} from 'node:test';
import assert from 'node:assert';
import {randomInt} from 'node:crypto';
import {load} from 'cheerio';
import {Search} from './ImageScraperService.js';
import {config} from './configuration/config.js';
import {DB, USER} from './db.js';

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
		const r = await Search('adidas');
		for (const e of r) {
			for (const item of e.FoundImages) {
				assert.equal(item.length, 0);
			}
		}
	});
	it('empty-searchword-test', async () => {
		filters.pagesToFetch = 3;
		filters.blackListedWebsite = [];
		filters.maxPrice = 20_000;
		filters.minPrice = 4000;
		const r = await Search();
		assert.deepEqual(r, []);
	});
	it('empty-string-searchword-test'), async () => {
		filters.pagesToFetch = 3;
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
		p.sportisimo = false;
		p.aboutYou = false;
		const response = await (await fetch('http://localhost:8080/search?' + new URLSearchParams(p))).text();
		const $ = load(response);
		const value = $('fieldset div.items').contents().first().text().trim();
		assert.equal(value, filters.emptyPlaceholderString);
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
			assert.equal(i, filters.emptyPlaceholderString);
		}
	});
});

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

describe('registration-tests', () => {
	const {form, p} = genForm();
	before('remove-test-user-bob', async () => {
		console.log('removing existing user');
		await USER.findOneAndDelete({username: p.username});
	});
	it('register-test-user-bob', async () => {
		await fetch('http://localhost:8080/register', {
			method: 'POST',
			body: form,
		});
		const user = await USER.findOne({username: p.username});
		console.log(user);
		assert.equal(user.username, p.username);
	});
	after('disconnect-from-db', async () => {
		console.log('removing existing user');
		await USER.findOneAndDelete({username: p.username});
		console.log('DB disconnecting...');
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

function genForm() {
	const p = {
		email: 'test-user-bob@test.com',
		username: 'test-user-bob',
		password: 'test',
	};
	const form = createElement('form');
	form.method = 'POST';
	const emailInput = createElement('input');
	emailInput.name = 'email';
	emailInput.value = p.email;
	form.append(emailInput);
	const usernameInput = createElement('input');
	usernameInput.name = 'username';
	usernameInput.value = p.username;
	form.append(usernameInput);
	const passwordInput = createElement('input');
	passwordInput.type = 'password';
	passwordInput.name = 'password';
	passwordInput.value = p.password;
	form.append(passwordInput);
	return [form, p];
}
