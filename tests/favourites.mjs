import {
	after, afterEach, before, describe, it,
} from 'node:test';
import assert from 'node:assert';
import {load} from 'cheerio';
import {DB, FAVOURITES, USER} from '../db.js';

const p = {
	username: 'test-user-edgar',
	email: 'test-user-edgar@test.com',
	password: 'test-8vYW4xC4kx',
};

describe('favourites-tests', () => {
	let userid = null;
	let auth = null;
	before(async () => {
		const res = await fetch('http://localhost:8080/register', {
			method: 'POST',
			body: new URLSearchParams(p),
			redirect: 'manual',
		});
		for (const c of res.headers.getSetCookie()) {
			if (c.startsWith('Authorize')) {
				auth = c.split(';')[0].split('=')[1];
				break;
			}
		}

		const user = await USER.findOne({username: p.username});
		userid = user.id;
	});
	it('succesfully-adds-to-favourites', async () => {
		const favouritesBefore = await FAVOURITES.find({user: userid});
		await fetch('http://localhost:8080/favourites', {
			method: 'POST',
			headers: {
				Cookie: `Authorize=${auth}`,
			},
			body: new URLSearchParams(genProduct()),
		});
		const favouritesAfter = await FAVOURITES.find({user: userid});
		assert.equal(favouritesBefore.length + 1, favouritesAfter.length);
	});
	it('succesfully-deletes-from-favourites', async () => {
		const favouritesBefore = await FAVOURITES.find({user: userid});
		await fetch('http://localhost:8080/favourites', {
			method: 'POST',
			headers: {
				Cookie: `Authorize=${auth}`,
			},
			body: new URLSearchParams(genProduct()),
		});
		const item = await FAVOURITES.findOne({user: userid});
		await fetch(`http://localhost:8080/favourites/${item.id}`, {
			method: 'DELETE',
			headers: {
				Cookie: `Authorize=${auth}`,
			},
		});
		const favouritesAfter = await FAVOURITES.find({user: userid});
		assert.equal(favouritesBefore.length, favouritesAfter.length);
	});
	it('added-product-matches-shown-product', async () => {
		const product = genProduct();
		await fetch('http://localhost:8080/favourites', {
			method: 'POST',
			headers: {
				Cookie: `Authorize=${auth}`,
			},
			body: new URLSearchParams(product),
		});
		const res = await fetch('http:localhost:8080/favourites', {
			headers: {
				Cookie: `Authorize=${auth}`,
			},
		});
		const $ = load(await res.text());
		const expectedProduct = product.image;
		const actualProduct = $('img').attr('src');
		assert.equal(actualProduct, expectedProduct);
	});
	it('only-logged-in-user-can-add-to-favourites', async () => {
		const res = await fetch('http://localhost:8080/favourites', {
			method: 'POST',
			body: new URLSearchParams(genProduct()),
		});
		const text = await res.text();
		assert.equal(JSON.parse(text).reason, 'unauthorized');
	});
	it('maximum-10-favourites', async () => {
		for (let i = 0; i < 15; i++) {
			await fetch('http:localhost:8080/favourites', {
                method: 'POST',
				headers: {
					Cookie: `Authorize=${auth}`,
				},
                body: new URLSearchParams(genProduct()),
			});
		}
        const products = await FAVOURITES.find({user: userid});
        assert.equal(products.length, 10);
	});
	afterEach(async () => {
		await FAVOURITES.deleteMany({user: userid});
	});
	after(async () => {
		await USER.findOneAndDelete({username: p.username});
		await DB.disconnect();
	});
});

function genProduct() {
	return {
		price: 0,
		href: 'localhost',
		image: `test-${randomString()}`,
		vendor: 'test-shop',
	};
}

function randomString() {
	const c = 'abcdefghijklmnopqrstuvwxyABCDEFGHIJKLMNOPQRSTVWXYZ0123456789';
	const l = c.length;
	let string_ = '';
	for (let i = 0; i < 16; i++) {
		string_ += c[Math.floor(Math.random() * l)];
	}

	return string_;
}
