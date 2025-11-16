import {
	describe, it, before, after, afterEach,
} from 'node:test';
import assert from 'node:assert';
import {load} from 'cheerio';
import {DB, USER, HISTORY} from '../db.js';

const p = {
	email: 'test-user-roger@test.com',
	username: 'test-user-roger',
	password: 'test-o44g8SPWY4',
};

describe('history-tests', () => {
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
	it('save-successful', async () => {
		const items = await HISTORY.find({user: userid});
		await fetch('http://localhost:8080/history', {
			method: 'POST',
			headers: {
				Cookie: `Authorize=${auth}`,
			},
			body: new URLSearchParams(genProduct()),
		});
		const historyItems = await HISTORY.find({user: userid});
		assert.equal(historyItems.length, items.length + 1);
	});
	it('shows-after-save', async () => {
		const product = genProduct();
		await fetch('http://localhost:8080/history', {
			method: 'POST',
			headers: {
				Cookie: `Authorize=${auth}`,
			},
			body: new URLSearchParams(product),
		});
		const res = await fetch('http://localhost:8080/history', {
			headers: {
				Cookie: `Authorize=${auth}`,
			},
		});
		const text = await res.text();
		const $ = load(text);
		const items = $('.item img').map((_, e) => $(e).attr('src')).get();
		assert.equal(items[0], product.image);
	});
	it('can-be-deleted', async () => {
        const before = await HISTORY.find({user: userid});
		await fetch('http://localhost:8080/history', {
			method: 'POST',
			headers: {
				Cookie: `Authorize=${auth}`,
			},
			body: new URLSearchParams(genProduct()),
		});
		const item = await HISTORY.findOne({user: userid});
		await fetch(`http://localhost:8080/history/${item.id}`, {
			method: 'DELETE',
            headers: {
				Cookie: `Authorize=${auth}`,
            },
		});
        const after = await HISTORY.find({user: userid});
		assert.equal(before.length, after.length);
	});
	it('max-10-history', async () => {
		for (let i = 0; i < 15; i++) {
			await fetch('http://localhost:8080/history', {
				method: 'POST',
				headers: {
					Cookie: `Authorize=${auth}`,
				},
				body: new URLSearchParams(genProduct()),
			});
		}

		const items = await HISTORY.find({user: userid});
		assert.equal(items.length < 11, true);
	});
	it('disallows-duplicates', async () => {
		const product = genProduct();
		const items = await HISTORY.find({user: userid});
		for (let i = 0; i < 2; i++) {
			await fetch('http://localhost:8080/history', {
				method: 'POST',
				headers: {
					Cookie: `Authorize=${auth}`,
				},
				body: new URLSearchParams(product),
			});
		}
		const itemsAfter = await HISTORY.find({user: userid});
		assert.equal(itemsAfter.length, items.length + 1);
	});
    it('only-logged-in-user-can-add-to-history', async () => {
        const r = await fetch('http://localhost:8080/history', {
            method: 'POST',
            body: new URLSearchParams(genProduct()),
        });
        const text = await r.text();
        assert.equal(JSON.parse(text).reason,'unauthorized');
    });
	afterEach(async () => {
		await HISTORY.deleteMany({user: userid});
	});
	after(async () => {
		await USER.findOneAndDelete({_id: userid});
		await DB.disconnect();
	});
});

function genProduct() {
	return {
		price: 0,
		href: 'localhost',
		image: `test-${randomString()}`,
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
